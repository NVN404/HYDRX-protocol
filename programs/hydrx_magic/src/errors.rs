use anchor_lang::prelude::*;

#[error_code]
pub enum HydrxError {
    #[msg("Only the authorized relayer or admin may record telemetry.")]
    UnauthorizedRelayer,

    #[msg("Arithmetic operation resulted in an overflow.")]
    MathOverflow,

    #[msg("No pending $HYDRX rewards available to claim.")]
    NoPendingRewards,

    #[msg("ESG certificate retirement memo exceeds maximum 128 characters.")]
    MemoTooLong,

    #[msg("Resident account is not currently delegated to the Ephemeral Rollup.")]
    AccountNotDelegated,

    #[msg("Commit verification failed: invalid commitment parameters.")]
    InvalidCommitment,

    #[msg("Invalid authority signature for instruction.")]
    InvalidAuthority,
}
