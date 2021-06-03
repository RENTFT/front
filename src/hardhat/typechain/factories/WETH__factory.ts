/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";

import type { WETH } from "../WETH";

export class WETH__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    bigBoi: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<WETH> {
    return super.deploy(bigBoi, overrides || {}) as Promise<WETH>;
  }
  getDeployTransaction(
    bigBoi: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(bigBoi, overrides || {});
  }
  attach(address: string): WETH {
    return super.attach(address) as WETH;
  }
  connect(signer: Signer): WETH__factory {
    return super.connect(signer) as WETH__factory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): WETH {
    return new Contract(address, _abi, signerOrProvider) as WETH;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "bigBoi",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000e1038038062000e10833981016040819052620000349162000232565b6040805180820182526004808252630ae8aa8960e31b60208084018281528551808701909652928552840152815191929162000073916003916200018c565b508051620000899060049060208401906200018c565b505050620000ac816d314dc6448d9338c15b0a00000000620000b360201b60201c565b5062000304565b6001600160a01b038216620000e55760405162461bcd60e51b8152600401620000dc9062000262565b60405180910390fd5b620000f36000838362000187565b8060026000828254620001079190620002a2565b90915550506001600160a01b0382166000908152602081905260408120805483929062000136908490620002a2565b90915550506040516001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906200017b90859062000299565b60405180910390a35050565b505050565b8280546200019a90620002c7565b90600052602060002090601f016020900481019282620001be576000855562000209565b82601f10620001d957805160ff191683800117855562000209565b8280016001018555821562000209579182015b8281111562000209578251825591602001919060010190620001ec565b50620002179291506200021b565b5090565b5b808211156200021757600081556001016200021c565b60006020828403121562000244578081fd5b81516001600160a01b03811681146200025b578182fd5b9392505050565b6020808252601f908201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604082015260600190565b90815260200190565b60008219821115620002c257634e487b7160e01b81526011600452602481fd5b500190565b600281046001821680620002dc57607f821691505b60208210811415620002fe57634e487b7160e01b600052602260045260246000fd5b50919050565b610afc80620003146000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806370a082311161007157806370a082311461014757806395d89b411461015a578063a457c2d714610162578063a9059cbb14610175578063dd62ed3e14610188578063de5f72fd1461019b576100b4565b806306fdde03146100b9578063095ea7b3146100d757806318160ddd146100f757806323b872dd1461010c578063313ce5671461011f5780633950935114610134575b600080fd5b6100c16101a5565b6040516100ce91906107c4565b60405180910390f35b6100ea6100e5366004610790565b610237565b6040516100ce91906107b9565b6100ff610254565b6040516100ce9190610a2f565b6100ea61011a366004610755565b61025a565b6101276102fa565b6040516100ce9190610a38565b6100ea610142366004610790565b6102ff565b6100ff610155366004610702565b61034e565b6100c161036d565b6100ea610170366004610790565b61037c565b6100ea610183366004610790565b6103f7565b6100ff610196366004610723565b61040b565b6101a3610436565b005b6060600380546101b490610a75565b80601f01602080910402602001604051908101604052809291908181526020018280546101e090610a75565b801561022d5780601f106102025761010080835404028352916020019161022d565b820191906000526020600020905b81548152906001019060200180831161021057829003601f168201915b5050505050905090565b600061024b610244610446565b848461044a565b50600192915050565b60025490565b60006102678484846104fe565b6001600160a01b038416600090815260016020526040812081610288610446565b6001600160a01b03166001600160a01b03168152602001908152602001600020549050828110156102d45760405162461bcd60e51b81526004016102cb906108e2565b60405180910390fd5b6102ef856102e0610446565b6102ea8685610a5e565b61044a565b506001949350505050565b601290565b600061024b61030c610446565b84846001600061031a610446565b6001600160a01b03908116825260208083019390935260409182016000908120918b16815292529020546102ea9190610a46565b6001600160a01b0381166000908152602081905260409020545b919050565b6060600480546101b490610a75565b6000806001600061038b610446565b6001600160a01b03908116825260208083019390935260409182016000908120918816815292529020549050828110156103d75760405162461bcd60e51b81526004016102cb906109b3565b6103ed6103e2610446565b856102ea8685610a5e565b5060019392505050565b600061024b610404610446565b84846104fe565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b61044433633b9aca00610626565b565b3390565b6001600160a01b0383166104705760405162461bcd60e51b81526004016102cb9061096f565b6001600160a01b0382166104965760405162461bcd60e51b81526004016102cb9061085a565b6001600160a01b0380841660008181526001602090815260408083209487168084529490915290819020849055517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906104f1908590610a2f565b60405180910390a3505050565b6001600160a01b0383166105245760405162461bcd60e51b81526004016102cb9061092a565b6001600160a01b03821661054a5760405162461bcd60e51b81526004016102cb90610817565b6105558383836106e6565b6001600160a01b0383166000908152602081905260409020548181101561058e5760405162461bcd60e51b81526004016102cb9061089c565b6105988282610a5e565b6001600160a01b0380861660009081526020819052604080822093909355908516815290812080548492906105ce908490610a46565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516106189190610a2f565b60405180910390a350505050565b6001600160a01b03821661064c5760405162461bcd60e51b81526004016102cb906109f8565b610658600083836106e6565b806002600082825461066a9190610a46565b90915550506001600160a01b03821660009081526020819052604081208054839290610697908490610a46565b90915550506040516001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906106da908590610a2f565b60405180910390a35050565b505050565b80356001600160a01b038116811461036857600080fd5b600060208284031215610713578081fd5b61071c826106eb565b9392505050565b60008060408385031215610735578081fd5b61073e836106eb565b915061074c602084016106eb565b90509250929050565b600080600060608486031215610769578081fd5b610772846106eb565b9250610780602085016106eb565b9150604084013590509250925092565b600080604083850312156107a2578182fd5b6107ab836106eb565b946020939093013593505050565b901515815260200190565b6000602080835283518082850152825b818110156107f0578581018301518582016040015282016107d4565b818111156108015783604083870101525b50601f01601f1916929092016040019392505050565b60208082526023908201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260408201526265737360e81b606082015260800190565b60208082526022908201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604082015261737360f01b606082015260800190565b60208082526026908201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604082015265616c616e636560d01b606082015260800190565b60208082526028908201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616040820152676c6c6f77616e636560c01b606082015260800190565b60208082526025908201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604082015264647265737360d81b606082015260800190565b60208082526024908201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646040820152637265737360e01b606082015260800190565b60208082526025908201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604082015264207a65726f60d81b606082015260800190565b6020808252601f908201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604082015260600190565b90815260200190565b60ff91909116815260200190565b60008219821115610a5957610a59610ab0565b500190565b600082821015610a7057610a70610ab0565b500390565b600281046001821680610a8957607f821691505b60208210811415610aaa57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220082ead18f16021a5491bb5c835dba99da7a2f21d58ff7d9284ba26cc90a8ff2164736f6c63430008000033";
