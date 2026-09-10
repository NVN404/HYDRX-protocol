use anchor_lang::prelude::*;

#[account]
#[derive(Default, InitSpace)]
pub struct PoolState {
    pub admin: Pubkey,                     // 32
    pub relayer: Pubkey,                   // 32
    pub token_mint: Pubkey,                // 32
    pub mint_bump: u8,                     // 1
    pub pool_bump: u8,                     // 1
    pub benchmark_flow_scaled: u64,        // 8 (Default 200 = 2.00 L flow benchmark per ping)
    pub reward_multiplier: u64,            // 8 (1,000 L saved = 1 $HYDRX = 1,000,000 micro-tokens)
    pub total_network_liters_scaled: u64,  // 8 (Cumulative network liters * 100)
    pub total_telemetries_logged: u64,     // 8 (Total pings across all devices)
    pub total_jal_minted: u64,             // 8 (Total $HYDRX atomic tokens minted)
    pub total_jal_retired: u64,            // 8 (Total $HYDRX atomic tokens permanently burned for ESG)
    pub padding: [u8; 32],                 // 32 reserved for future upgrades
}

#[account]
#[derive(Default, InitSpace)]
pub struct ResidentState {
    pub resident: Pubkey,                  // 32
    pub total_liters_scaled: u64,          // 8 (Liters * 100)
    pub current_day_usage: u64,            // 8 (Liters * 100 today)
    pub last_update_timestamp: i64,        // 8 (Unix timestamp)
    pub pending_jal_rewards: u64,          // 8 (Unclaimed $HYDRX in 6-decimal atomic units)
    pub total_jal_claimed: u64,            // 8 (Claimed $HYDRX in 6-decimal atomic units)
    pub telemetries_logged: u64,           // 8 (Device ping count)
    pub bump: u8,                          // 1
    pub is_delegated: bool,                // 1 (Flag marking account actively delegated to ER)
    pub uncommitted_pings: u32,            // 4 (Count of pings since last L1 commit)
    pub uncommitted_liters_scaled: u64,    // 8 (Volume since last L1 commit)
    pub padding: [u8; 32],                 // 32 reserved
}
