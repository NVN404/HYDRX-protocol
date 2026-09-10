use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::MagicIntentBundleBuilder;

pub mod errors;
pub mod state;

use errors::HydrxError;
use state::{PoolState, ResidentState};

declare_id!("8dLu65pPh6AbfDmRW5GUGqjPQuxihnpv2vWydzt98vKj");

#[ephemeral]
#[program]
pub mod hydrx_magic {
    use super::*;

    /**
     * @notice Initializes the global HydrX pool state and creates the $HYDRX token mint PDA on Solana base layer.
     */
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        benchmark_flow_scaled: Option<u64>,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool_state;
        pool.admin = ctx.accounts.admin.key();
        pool.relayer = ctx.accounts.relayer.key();
        pool.token_mint = ctx.accounts.token_mint.key();
        pool.mint_bump = ctx.bumps.token_mint;
        pool.pool_bump = ctx.bumps.pool_state;
        pool.benchmark_flow_scaled = benchmark_flow_scaled.unwrap_or(200); // 2.00 L benchmark
        pool.reward_multiplier = 1000; // 1,000 L saved = 1 $HYDRX (1,000,000 micro-tokens)
        pool.total_network_liters_scaled = 0;
        pool.total_telemetries_logged = 0;
        pool.total_jal_minted = 0;
        pool.total_jal_retired = 0;

        msg!(
            "HydrX Pool Initialized on Solana Base Layer. Admin: {}, Relayer: {}, Mint: {}",
            pool.admin,
            pool.relayer,
            pool.token_mint
        );
        Ok(())
    }

    /**
     * @notice Updates the authorized relayer address.
     */
    pub fn set_relayer(ctx: Context<SetRelayer>, new_relayer: Pubkey) -> Result<()> {
        let pool = &mut ctx.accounts.pool_state;
        let old_relayer = pool.relayer;
        pool.relayer = new_relayer;

        emit!(RelayerUpdated {
            old_relayer,
            new_relayer,
        });
        Ok(())
    }

    /**
     * @notice Pre-initializes a resident state account on base layer before delegation.
     */
    pub fn initialize_resident(ctx: Context<InitializeResident>) -> Result<()> {
        let resident_state = &mut ctx.accounts.resident_state;
        let clock = Clock::get()?;

        resident_state.resident = ctx.accounts.resident.key();
        resident_state.total_liters_scaled = 0;
        resident_state.current_day_usage = 0;
        resident_state.last_update_timestamp = clock.unix_timestamp;
        resident_state.pending_jal_rewards = 0;
        resident_state.total_jal_claimed = 0;
        resident_state.telemetries_logged = 0;
        resident_state.bump = ctx.bumps.resident_state;
        resident_state.is_delegated = false;
        resident_state.uncommitted_pings = 0;
        resident_state.uncommitted_liters_scaled = 0;

        msg!(
            "Resident State initialized on Base Layer: {}",
            ctx.accounts.resident.key()
        );
        Ok(())
    }

    /**
     * @notice Delegates a resident state account to the MagicBlock Ephemeral Rollup (executed on Base Layer).
     */
    pub fn delegate_resident(ctx: Context<DelegateResident>) -> Result<()> {
        let resident_key = ctx.accounts.resident.key();
        msg!(
            "Delegating ResidentState {} to MagicBlock Ephemeral Rollup...",
            resident_key
        );

        ctx.accounts.delegate_resident_state(
            &ctx.accounts.payer,
            &[b"resident", resident_key.as_ref()],
            DelegateConfig::default(),
        )?;

        msg!("ResidentState {} successfully delegated to ER!", resident_key);
        Ok(())
    }

    /**
     * @notice High-Frequency Ingestion of IoT water pulse telemetry on the Ephemeral Rollup.
     * Executes at sub-50ms latency with zero gas fees.
     * Updates ResidentState without write-locking the global pool PDA!
     */
    pub fn record_telemetry(
        ctx: Context<RecordTelemetryER>,
        liters_scaled: u64,
        benchmark_flow_scaled: Option<u64>,
    ) -> Result<()> {
        let resident_state = &mut ctx.accounts.resident_state;
        let clock = Clock::get()?;

        // If newly instantiated on ER
        if resident_state.resident == Pubkey::default() {
            resident_state.resident = ctx.accounts.resident.key();
            resident_state.is_delegated = true;
        }

        resident_state.total_liters_scaled = resident_state
            .total_liters_scaled
            .checked_add(liters_scaled)
            .ok_or(HydrxError::MathOverflow)?;

        resident_state.current_day_usage = resident_state
            .current_day_usage
            .checked_add(liters_scaled)
            .ok_or(HydrxError::MathOverflow)?;

        resident_state.uncommitted_liters_scaled = resident_state
            .uncommitted_liters_scaled
            .checked_add(liters_scaled)
            .ok_or(HydrxError::MathOverflow)?;

        resident_state.last_update_timestamp = clock.unix_timestamp;
        resident_state.telemetries_logged = resident_state
            .telemetries_logged
            .checked_add(1)
            .ok_or(HydrxError::MathOverflow)?;

        resident_state.uncommitted_pings = resident_state
            .uncommitted_pings
            .checked_add(1)
            .ok_or(HydrxError::MathOverflow)?;

        let benchmark = benchmark_flow_scaled.unwrap_or(200); // 2.00 L default
        let mut reward_units: u64 = 0;

        if liters_scaled < benchmark {
            let liters_saved_scaled = benchmark - liters_scaled;
            // 1 Liter saved (100 scaled) = 1,000 micro-tokens ($HYDRX has 6 decimals, 1,000 L saved = 1 HYDRX).
            // Hence: reward_units = liters_saved_scaled * 10.
            reward_units = liters_saved_scaled
                .checked_mul(10)
                .ok_or(HydrxError::MathOverflow)?;

            if reward_units > 0 {
                resident_state.pending_jal_rewards = resident_state
                    .pending_jal_rewards
                    .checked_add(reward_units)
                    .ok_or(HydrxError::MathOverflow)?;

                emit!(RewardsAccrued {
                    resident: ctx.accounts.resident.key(),
                    reward_units,
                    total_pending: resident_state.pending_jal_rewards,
                });
            }
        }

        emit!(TelemetryRecorded {
            resident: ctx.accounts.resident.key(),
            liters_scaled,
            total_liters_scaled: resident_state.total_liters_scaled,
            reward_units,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /**
     * @notice Commits the delegated resident state from ER back to Solana Base Layer (L1).
     * Keeps the account delegated for continued high-frequency ER execution.
     */
    pub fn commit_resident(ctx: Context<CommitResident>) -> Result<()> {
        let resident_state = &mut ctx.accounts.resident_state;
        resident_state.uncommitted_pings = 0;
        resident_state.uncommitted_liters_scaled = 0;

        msg!(
            "Scheduling commit for ResidentState {} via MagicIntentBundleBuilder...",
            resident_state.resident
        );

        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit(&[ctx.accounts.resident_state.to_account_info()])
        .build_and_invoke()?;

        msg!("Commit intent dispatched successfully!");
        Ok(())
    }

    /**
     * @notice Undelegates the resident state account, committing final state and returning ownership to Base Layer.
     */
    pub fn undelegate_resident(ctx: Context<UndelegateResident>) -> Result<()> {
        let resident_state = &mut ctx.accounts.resident_state;
        resident_state.is_delegated = false;
        resident_state.uncommitted_pings = 0;
        resident_state.uncommitted_liters_scaled = 0;

        msg!(
            "Scheduling commit_and_undelegate for ResidentState {}...",
            resident_state.resident
        );

        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit_and_undelegate(&[ctx.accounts.resident_state.to_account_info()])
        .build_and_invoke()?;

        msg!("Undelegation intent dispatched successfully!");
        Ok(())
    }

    /**
     * @notice Syncs cumulative committed volume to the global PoolState on Solana Base Layer.
     */
    pub fn sync_network_pool(
        ctx: Context<SyncNetworkPool>,
        liters_delta_scaled: u64,
        pings_delta: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool_state;
        require!(
            ctx.accounts.relayer.key() == pool.relayer || ctx.accounts.relayer.key() == pool.admin,
            HydrxError::UnauthorizedRelayer
        );

        pool.total_network_liters_scaled = pool
            .total_network_liters_scaled
            .checked_add(liters_delta_scaled)
            .ok_or(HydrxError::MathOverflow)?;

        pool.total_telemetries_logged = pool
            .total_telemetries_logged
            .checked_add(pings_delta)
            .ok_or(HydrxError::MathOverflow)?;

        msg!(
            "Network Pool Synced: +{} liters, +{} pings. Total Liters: {}",
            liters_delta_scaled,
            pings_delta,
            pool.total_network_liters_scaled
        );
        Ok(())
    }

    /**
     * @notice Allows residents to mint and claim accrued $HYDRX SPL tokens into their ATA.
     */
    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let resident_state = &mut ctx.accounts.resident_state;
        let pool = &mut ctx.accounts.pool_state;

        let amount_to_claim = resident_state.pending_jal_rewards;
        require!(amount_to_claim > 0, HydrxError::NoPendingRewards);

        resident_state.pending_jal_rewards = 0;
        resident_state.total_jal_claimed = resident_state
            .total_jal_claimed
            .checked_add(amount_to_claim)
            .ok_or(HydrxError::MathOverflow)?;

        pool.total_jal_minted = pool
            .total_jal_minted
            .checked_add(amount_to_claim)
            .ok_or(HydrxError::MathOverflow)?;

        // Mint SPL tokens to resident's ATA using Pool PDA signer
        let pool_bump = pool.pool_bump;
        let seeds: &[&[u8]] = &[b"pool_state", &[pool_bump]];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.resident_token_account.to_account_info(),
            authority: ctx.accounts.pool_state.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        token::mint_to(cpi_ctx, amount_to_claim)?;

        emit!(TokensClaimed {
            resident: ctx.accounts.resident.key(),
            amount: amount_to_claim,
        });

        Ok(())
    }

    /**
     * @notice Corporate ESG Water Positive Retirement: Burns $HYDRX tokens with verifiable memo.
     */
    pub fn burn_and_retire(
        ctx: Context<BurnAndRetire>,
        amount: u64,
        cert_memo: String,
    ) -> Result<()> {
        require!(cert_memo.len() <= 128, HydrxError::MemoTooLong);

        let pool = &mut ctx.accounts.pool_state;
        pool.total_jal_retired = pool
            .total_jal_retired
            .checked_add(amount)
            .ok_or(HydrxError::MathOverflow)?;

        let cpi_accounts = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::burn(cpi_ctx, amount)?;

        let clock = Clock::get()?;
        emit!(TokensRetired {
            beneficiary: ctx.accounts.user.key(),
            amount,
            cert_memo,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// --------------------------------------------------------------------------------
// Account Context Structs
// --------------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + PoolState::INIT_SPACE,
        seeds = [b"pool_state"],
        bump
    )]
    pub pool_state: Account<'info, PoolState>,

    #[account(
        init,
        payer = admin,
        seeds = [b"hydrx_mint"],
        bump,
        mint::decimals = 6,
        mint::authority = pool_state,
    )]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: Relayer address authorized to record telemetry
    pub relayer: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SetRelayer<'info> {
    #[account(
        mut,
        seeds = [b"pool_state"],
        bump = pool_state.pool_bump,
        has_one = admin,
    )]
    pub pool_state: Account<'info, PoolState>,

    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeResident<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + ResidentState::INIT_SPACE,
        seeds = [b"resident", resident.key().as_ref()],
        bump
    )]
    pub resident_state: Account<'info, ResidentState>,

    /// CHECK: The resident wallet
    pub resident: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[delegate]
#[derive(Accounts)]
pub struct DelegateResident<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: The resident wallet receiving telemetry
    pub resident: AccountInfo<'info>,

    /// CHECK: The resident state PDA to delegate
    #[account(
        mut,
        del,
        seeds = [b"resident", resident.key().as_ref()],
        bump
    )]
    pub resident_state: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct RecordTelemetryER<'info> {
    #[account(
        mut,
        seeds = [b"resident", resident.key().as_ref()],
        bump = resident_state.bump
    )]
    pub resident_state: Account<'info, ResidentState>,

    /// CHECK: The resident wallet
    pub resident: AccountInfo<'info>,

    #[account(mut)]
    pub relayer: Signer<'info>,
}

#[commit]
#[derive(Accounts)]
pub struct CommitResident<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"resident", resident_state.resident.as_ref()],
        bump = resident_state.bump
    )]
    pub resident_state: Account<'info, ResidentState>,
}

#[commit]
#[derive(Accounts)]
pub struct UndelegateResident<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"resident", resident_state.resident.as_ref()],
        bump = resident_state.bump
    )]
    pub resident_state: Account<'info, ResidentState>,
}

#[derive(Accounts)]
pub struct SyncNetworkPool<'info> {
    #[account(
        mut,
        seeds = [b"pool_state"],
        bump = pool_state.pool_bump,
    )]
    pub pool_state: Account<'info, PoolState>,

    pub relayer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(
        mut,
        seeds = [b"pool_state"],
        bump = pool_state.pool_bump,
    )]
    pub pool_state: Account<'info, PoolState>,

    #[account(
        mut,
        seeds = [b"hydrx_mint"],
        bump = pool_state.mint_bump,
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"resident", resident.key().as_ref()],
        bump = resident_state.bump,
        has_one = resident,
    )]
    pub resident_state: Account<'info, ResidentState>,

    #[account(
        mut,
        constraint = resident_token_account.mint == token_mint.key(),
        constraint = resident_token_account.owner == resident.key()
    )]
    pub resident_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub resident: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnAndRetire<'info> {
    #[account(
        mut,
        seeds = [b"pool_state"],
        bump = pool_state.pool_bump,
    )]
    pub pool_state: Account<'info, PoolState>,

    #[account(
        mut,
        seeds = [b"hydrx_mint"],
        bump = pool_state.mint_bump,
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_token_account.mint == token_mint.key(),
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

// --------------------------------------------------------------------------------
// Events
// --------------------------------------------------------------------------------

#[event]
pub struct RelayerUpdated {
    pub old_relayer: Pubkey,
    pub new_relayer: Pubkey,
}

#[event]
pub struct TelemetryRecorded {
    pub resident: Pubkey,
    pub liters_scaled: u64,
    pub total_liters_scaled: u64,
    pub reward_units: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardsAccrued {
    pub resident: Pubkey,
    pub reward_units: u64,
    pub total_pending: u64,
}

#[event]
pub struct TokensClaimed {
    pub resident: Pubkey,
    pub amount: u64,
}

#[event]
pub struct TokensRetired {
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub cert_memo: String,
    pub timestamp: i64,
}
