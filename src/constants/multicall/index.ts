import { ChainId } from '@neumekca/neumekca-sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {

  [ChainId.BSC_MAINNET]: '0xe348b292e8eA5FAB54340656f3D374b259D658b8',
  [ChainId.BSC_TESTNET]: '0xe348b292e8eA5FAB54340656f3D374b259D658b8',
  
  [ChainId.HT_MAINNET]: '0xEFDa8E5913FC5c71d21726d85320431c5a2935b5',
  [ChainId.HT_TESTNET]: '0xEFDa8E5913FC5c71d21726d85320431c5a2935b5',
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
