// Generated from contracts/src/ChangelogBot.sol (npm test in /contracts compiles it).
// Re-generate if the contract changes.
export const changelogBotAbi = [
  {
    "inputs": [],
    "name": "CidTooLong",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyCid",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyRepo",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyVersion",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoReleasesForRepo",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReleaseNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RepoTooLong",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VersionAlreadyPublished",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VersionTooLong",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "repo",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "publisher",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      }
    ],
    "name": "Published",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_CID_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_REPO_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_VERSION_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getRelease",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "publisher",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "repo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "fromCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes20",
            "name": "toCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes32",
            "name": "notesHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "at",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChangelogBot.Release",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repo",
        "type": "string"
      }
    ],
    "name": "latestFor",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "publisher",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "repo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "fromCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes20",
            "name": "toCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes32",
            "name": "notesHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "at",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChangelogBot.Release",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repo",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "bytes20",
        "name": "fromCommit",
        "type": "bytes20"
      },
      {
        "internalType": "bytes20",
        "name": "toCommit",
        "type": "bytes20"
      },
      {
        "internalType": "bytes32",
        "name": "notesHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      }
    ],
    "name": "publish",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "releases",
    "outputs": [
      {
        "internalType": "address",
        "name": "publisher",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "repo",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "bytes20",
        "name": "fromCommit",
        "type": "bytes20"
      },
      {
        "internalType": "bytes20",
        "name": "toCommit",
        "type": "bytes20"
      },
      {
        "internalType": "bytes32",
        "name": "notesHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      },
      {
        "internalType": "uint64",
        "name": "at",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "publisher",
        "type": "address"
      }
    ],
    "name": "releasesBy",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "publisher",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "repo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "fromCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes20",
            "name": "toCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes32",
            "name": "notesHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "at",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChangelogBot.Release[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repo",
        "type": "string"
      }
    ],
    "name": "releasesFor",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "publisher",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "repo",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "fromCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes20",
            "name": "toCommit",
            "type": "bytes20"
          },
          {
            "internalType": "bytes32",
            "name": "notesHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "at",
            "type": "uint64"
          }
        ],
        "internalType": "struct ChangelogBot.Release[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repo",
        "type": "string"
      }
    ],
    "name": "repoKey",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "total",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRepos",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "versionUsed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
