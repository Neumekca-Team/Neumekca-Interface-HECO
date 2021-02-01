import { ChainId } from '@neumekca/neumekca-sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.BSC_MAINNET]: '',
  [ChainId.BSC_TESTNET]: '',

  [ChainId.HT_MAINNET]: '0x94d98f8ced993cbc75770a147b1ff73cd785feb8',
  [ChainId.HT_TESTNET]: '0x94d98f8ced993cbc75770a147b1ff73cd785feb8'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
