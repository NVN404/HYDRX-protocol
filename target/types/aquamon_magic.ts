/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aquamon_magic.json`.
 */
export type AquamonMagic = {
  "address": "8dLu65pPh6AbfDmRW5GUGqjPQuxihnpv2vWydzt98vKj",
  "metadata": {
    "name": "aquamonMagic",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "HydrX Protocol on MagicBlock Ephemeral Rollups: Sub-50ms Water Conservation DePIN"
  },
  "instructions": [
    {
      "name": "burnAndRetire",
      "docs": [
        "* @notice Corporate ESG Water Positive Retirement: Burns $HYDRX tokens with verifiable memo."
      ],
      "discriminator": [
        105,
        38,
        95,
        69,
        224,
        106,
        230,
        175
      ],
      "accounts": [
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  121,
                  100,
                  114,
                  120,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "certMemo",
          "type": "string"
        }
      ]
    },
    {
      "name": "claimTokens",
      "docs": [
        "* @notice Allows residents to mint and claim accrued $HYDRX SPL tokens into their ATA."
      ],
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
      ],
      "accounts": [
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  121,
                  100,
                  114,
                  120,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "residentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  105,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "resident"
              }
            ]
          }
        },
        {
          "name": "residentTokenAccount",
          "writable": true
        },
        {
          "name": "resident",
          "writable": true,
          "signer": true,
          "relations": [
            "residentState"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "commitResident",
      "docs": [
        "* @notice Commits the delegated resident state from ER back to Solana Base Layer (L1).\n     * Keeps the account delegated for continued high-frequency ER execution."
      ],
      "discriminator": [
        164,
        73,
        21,
        213,
        219,
        6,
        73,
        154
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "residentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  105,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "resident_state.resident",
                "account": "residentState"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "delegateResident",
      "docs": [
        "* @notice Delegates a resident state account to the MagicBlock Ephemeral Rollup (executed on Base Layer)."
      ],
      "discriminator": [
        17,
        41,
        193,
        72,
        212,
        69,
        88,
        252
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "resident"
        },
        {
          "name": "bufferResidentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "residentState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                113,
                81,
                55,
                103,
                117,
                237,
                42,
                141,
                137,
                230,
                183,
                64,
                149,
                70,
                225,
                186,
                167,
                187,
                207,
                96,
                18,
                51,
                6,
                99,
                195,
                199,
                248,
                198,
                108,
                91,
                63,
                106
              ]
            }
          }
        },
        {
          "name": "delegationRecordResidentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "residentState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataResidentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "residentState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "residentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  105,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "resident"
              }
            ]
          }
        },
        {
          "name": "ownerProgram",
          "address": "8dLu65pPh6AbfDmRW5GUGqjPQuxihnpv2vWydzt98vKj"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializePool",
      "docs": [
        "* @notice Initializes the global HydrX pool state and creates the $HYDRX token mint PDA on Solana base layer."
      ],
      "discriminator": [
        95,
        180,
        10,
        172,
        84,
        174,
        232,
        40
      ],
      "accounts": [
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  121,
                  100,
                  114,
                  120,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "relayer"
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "benchmarkFlowScaled",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "initializeResident",
      "docs": [
        "* @notice Pre-initializes a resident state account on base layer before delegation."
      ],
      "discriminator": [
        58,
        90,
        126,
        241,
        121,
        129,
        142,
        156
      ],
      "accounts": [
        {
          "name": "residentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  105,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "resident"
              }
            ]
          }
        },
        {
          "name": "resident"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  101,
                  45,
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "baseAccount"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                181,
                183,
                0,
                225,
                242,
                87,
                58,
                192,
                204,
                6,
                34,
                1,
                52,
                74,
                207,
                151,
                184,
                53,
                6,
                235,
                140,
                229,
                25,
                152,
                204,
                98,
                126,
                24,
                147,
                128,
                167,
                62
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "recordTelemetry",
      "docs": [
        "* @notice High-Frequency Ingestion of IoT water pulse telemetry on the Ephemeral Rollup.\n     * Executes at sub-50ms latency with zero gas fees.\n     * Updates ResidentState without write-locking the global pool PDA!"
      ],
      "discriminator": [
        42,
        253,
        255,
        103,
        185,
        29,
        208,
        94
      ],
      "accounts": [
        {
          "name": "residentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  105,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "resident"
              }
            ]
          }
        },
        {
          "name": "resident"
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "litersScaled",
          "type": "u64"
        },
        {
          "name": "benchmarkFlowScaled",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "setRelayer",
      "docs": [
        "* @notice Updates the authorized relayer address."
      ],
      "discriminator": [
        23,
        243,
        33,
        88,
        110,
        84,
        196,
        37
      ],
      "accounts": [
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "poolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newRelayer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "syncNetworkPool",
      "docs": [
        "* @notice Syncs cumulative committed volume to the global PoolState on Solana Base Layer."
      ],
      "discriminator": [
        200,
        252,
        136,
        55,
        24,
        113,
        107,
        132
      ],
      "accounts": [
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "relayer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "litersDeltaScaled",
          "type": "u64"
        },
        {
          "name": "pingsDelta",
          "type": "u64"
        }
      ]
    },
    {
      "name": "undelegateResident",
      "docs": [
        "* @notice Undelegates the resident state account, committing final state and returning ownership to Base Layer."
      ],
      "discriminator": [
        170,
        94,
        197,
        207,
        220,
        30,
        127,
        81
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "residentState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  105,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "resident_state.resident",
                "account": "residentState"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "poolState",
      "discriminator": [
        247,
        237,
        227,
        245,
        215,
        195,
        222,
        70
      ]
    },
    {
      "name": "residentState",
      "discriminator": [
        252,
        143,
        157,
        93,
        201,
        161,
        36,
        17
      ]
    }
  ],
  "events": [
    {
      "name": "relayerUpdated",
      "discriminator": [
        166,
        12,
        250,
        34,
        211,
        198,
        204,
        222
      ]
    },
    {
      "name": "rewardsAccrued",
      "discriminator": [
        33,
        15,
        54,
        214,
        98,
        95,
        10,
        34
      ]
    },
    {
      "name": "telemetryRecorded",
      "discriminator": [
        181,
        188,
        43,
        19,
        80,
        11,
        77,
        112
      ]
    },
    {
      "name": "tokensClaimed",
      "discriminator": [
        25,
        128,
        244,
        55,
        241,
        136,
        200,
        91
      ]
    },
    {
      "name": "tokensRetired",
      "discriminator": [
        136,
        35,
        19,
        192,
        104,
        54,
        198,
        20
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedRelayer",
      "msg": "Only the authorized relayer or admin may record telemetry."
    },
    {
      "code": 6001,
      "name": "mathOverflow",
      "msg": "Arithmetic operation resulted in an overflow."
    },
    {
      "code": 6002,
      "name": "noPendingRewards",
      "msg": "No pending $HYDRX rewards available to claim."
    },
    {
      "code": 6003,
      "name": "memoTooLong",
      "msg": "ESG certificate retirement memo exceeds maximum 128 characters."
    },
    {
      "code": 6004,
      "name": "accountNotDelegated",
      "msg": "Resident account is not currently delegated to the Ephemeral Rollup."
    },
    {
      "code": 6005,
      "name": "invalidCommitment",
      "msg": "Commit verification failed: invalid commitment parameters."
    },
    {
      "code": 6006,
      "name": "invalidAuthority",
      "msg": "Invalid authority signature for instruction."
    }
  ],
  "types": [
    {
      "name": "poolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "relayer",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "mintBump",
            "type": "u8"
          },
          {
            "name": "poolBump",
            "type": "u8"
          },
          {
            "name": "benchmarkFlowScaled",
            "type": "u64"
          },
          {
            "name": "rewardMultiplier",
            "type": "u64"
          },
          {
            "name": "totalNetworkLitersScaled",
            "type": "u64"
          },
          {
            "name": "totalTelemetriesLogged",
            "type": "u64"
          },
          {
            "name": "totalJalMinted",
            "type": "u64"
          },
          {
            "name": "totalJalRetired",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "relayerUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldRelayer",
            "type": "pubkey"
          },
          {
            "name": "newRelayer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "residentState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "resident",
            "type": "pubkey"
          },
          {
            "name": "totalLitersScaled",
            "type": "u64"
          },
          {
            "name": "currentDayUsage",
            "type": "u64"
          },
          {
            "name": "lastUpdateTimestamp",
            "type": "i64"
          },
          {
            "name": "pendingJalRewards",
            "type": "u64"
          },
          {
            "name": "totalJalClaimed",
            "type": "u64"
          },
          {
            "name": "telemetriesLogged",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isDelegated",
            "type": "bool"
          },
          {
            "name": "uncommittedPings",
            "type": "u32"
          },
          {
            "name": "uncommittedLitersScaled",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "rewardsAccrued",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "resident",
            "type": "pubkey"
          },
          {
            "name": "rewardUnits",
            "type": "u64"
          },
          {
            "name": "totalPending",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "telemetryRecorded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "resident",
            "type": "pubkey"
          },
          {
            "name": "litersScaled",
            "type": "u64"
          },
          {
            "name": "totalLitersScaled",
            "type": "u64"
          },
          {
            "name": "rewardUnits",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokensClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "resident",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokensRetired",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "certMemo",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
