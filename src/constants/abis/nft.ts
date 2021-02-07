import { Interface } from '@ethersproject/abi'
import { ChainId } from '@neumekca/neumekca-sdk'
import NFT_FACTORY_ABI from './nft-factory.json'
import NFT_ABI from './nft.json'
import NFT_BAZAAR_ABI from './nft-bazaar.json'

const NFT_FACTORY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.BSC_MAINNET]: '0x4FB5c4A9428Fb58dE1B8BF3Ac4209829d95Ccf81',
  [ChainId.BSC_TESTNET]: '0x4f3A0f67956F759520b28A16D8c514CFb1543D2c',
  [ChainId.HT_MAINNET]: '0xE10a109218D0e7c258A49f69BC7337193f28e815',
  [ChainId.HT_TESTNET]: '0x4182Eb9f891145E842C898e70e8c25eB03CC4EF6'
}

const NFT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.BSC_MAINNET]: '0x828B5aDBE8e0a06aAF5D5A5fD16e6B15a393D86e',
  [ChainId.BSC_TESTNET]: '0x59D895a8FF4CdD5bE2A2D73238E5a2C5525a27A4',
  [ChainId.HT_MAINNET]: '0x1c137Ba270fbcD22D3c7Bdac101f0A21cb0885cE',
  [ChainId.HT_TESTNET]: '0xBA287B8E07b71636f1A9A7Ec56E9E3b34de1BE92'
}

const NFT_BAZAAR_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.BSC_MAINNET]: '0x0BD996F94B9dd04C8E44E535B4F0A6eD22FD0d19',
  [ChainId.BSC_TESTNET]: '0xB6cF1B6371494f15F73060047ce903FE18d3062F',
  [ChainId.HT_MAINNET]: '0x05D3f78Fb6b0230d8C6524fd7eF4522FEaFBbE59',
  [ChainId.HT_TESTNET]: '0xB6cF1B6371494f15F73060047ce903FE18d3062F'
}

const NFT_FACTORY_INTERFACE = new Interface(NFT_FACTORY_ABI)
const NFT_INTERFACE = new Interface(NFT_ABI)
const NFT_BAZAAR_INTERFACE = new Interface(NFT_BAZAAR_ABI)

export {
  NFT_FACTORY_ADDRESSES,
  NFT_FACTORY_ABI,
  NFT_FACTORY_INTERFACE,
  NFT_ADDRESSES,
  NFT_ABI,
  NFT_INTERFACE,
  NFT_BAZAAR_ADDRESSES,
  NFT_BAZAAR_ABI,
  NFT_BAZAAR_INTERFACE
}
