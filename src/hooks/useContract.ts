import { Contract } from '@ethersproject/contracts'
import { ChainId, WETH } from '@neumekca/neumekca-sdk'
import { abi as INarwhalswapPairABI } from '../constants/abis/IJuncturePair.json'
import { useMemo } from 'react'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from '../constants/abis/argent-wallet-detector'
import { NAR, PRESALE_ADDRESS } from '../constants'
import NAR_ABI from '../constants/abis/nar.json'
import STAKING_REWARDS_ABI from '../constants/abis/staking_rewards.json'
import STAKING_DIVIDEND_ABI from '../constants/abis/staking_dividend.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import ERC20_ABI from '../constants/abis/erc20.json'
import WETH_ABI from '../constants/abis/weth.json'
import PRESALE_ABI from '../constants/abis/presale.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from '../constants/v1'
import {
  NFT_FACTORY_ABI,
  NFT_FACTORY_ADDRESSES,
  NFT_ABI,
  NFT_ADDRESSES,
  NFT_BAZAAR_ABI,
  NFT_BAZAAR_ADDRESSES
} from '../constants/abis/nft'
import { STACKING_TICKETS_ABI, STACKING_TICKETS_ABI_V2 } from '../constants/abis/staking-tickets'
import { STACKING_GEMS_ABI } from '../constants/abis/staking-gems'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'

// returns null on errors
export function useContract(address?: string, ABI?: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.BSC_MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, INarwhalswapPairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function usePresaleContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? PRESALE_ADDRESS[chainId].address : undefined, PRESALE_ABI, false)
}

export function usePresaleContractCallBack(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? PRESALE_ADDRESS[chainId].address : undefined, PRESALE_ABI, true)
}

export function useNarContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? NAR[chainId].address : undefined, NAR_ABI, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function useDividendStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_DIVIDEND_ABI, withSignerIfPossible)
}

export function useTicketStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STACKING_TICKETS_ABI, withSignerIfPossible)
}

export function useTicketStakingContractV2(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STACKING_TICKETS_ABI_V2, withSignerIfPossible)
}

export function useGemStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STACKING_GEMS_ABI, withSignerIfPossible)
}

export function useNftFactoryContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && NFT_FACTORY_ADDRESSES[chainId], NFT_FACTORY_ABI, withSignerIfPossible)
}

export function useNftContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && NFT_ADDRESSES[chainId], NFT_ABI, withSignerIfPossible)
}

export function useNftBazaarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && NFT_BAZAAR_ADDRESSES[chainId], NFT_BAZAAR_ABI, withSignerIfPossible)
}

export function useSocksController(): Contract | null {
  // const { chainId } = useActiveWeb3React()
  return useContract(undefined, UNISOCKS_ABI, false)
}
