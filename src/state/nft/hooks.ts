import { ChainId, JSBI, Token, TokenAmount, WETH } from '@bscswap/sdk'
import { useMemo } from 'react'
import { GOLD, GOLD_WETH, GEM, NAR, THUGS_NAR, THUGS, BLIQ_WETH, BLIQ, BURNED_ADDRESS } from '../../constants'
import { STACKING_TICKETS_INTERFACE } from '../../constants/abis/staking-tickets'
import { useActiveWeb3React } from '../../hooks'
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData
} from '../multicall/hooks'
import {
  useNftContract,
  useNftFactoryContract,
  useNftBazaarContract,
  useTicketStakingContractV2
} from '../../hooks/useContract'
import ERC20_INTERFACE from '../../constants/abis/erc20'

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_TICKETS_INFO: {
  [chainId in ChainId]?: {
    stakeToken: Token
    earnToken: Token
    pairTokens: Token[]
    poolAddress: string
    poolId: number
    isActive: boolean
    multiplier: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    {
      stakeToken: GEM[ChainId.BSC_MAINNET],
      pairTokens: [],
      earnToken: GOLD[ChainId.BSC_MAINNET],
      poolAddress: '0xDDe9e8314afD828c73539692895dd96d55CdA7c8',
      poolId: 0,
      isActive: false,
      multiplier: 1
    }
  ],
  [ChainId.BSC_TESTNET]: [
    {
      stakeToken: GEM[ChainId.BSC_TESTNET],
      pairTokens: [],
      earnToken: GOLD[ChainId.BSC_TESTNET],
      poolAddress: '0x9Fd8D743439c318bA2039f2813630d28bee772b8',
      poolId: 0,
      isActive: true,
      multiplier: 20
    }
  ]
}

export const STAKING_TICKETS_INFO_V2: {
  [chainId in ChainId]?: {
    stakeToken: Token
    earnToken: Token
    pairTokens: Token[]
    poolAddress: string
    poolId: number
    isActive: boolean
    multiplier: number
    startTime: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    {
      stakeToken: GOLD_WETH,
      earnToken: GOLD[ChainId.BSC_MAINNET],
      pairTokens: [GOLD[ChainId.BSC_MAINNET], WETH[ChainId.BSC_MAINNET]],
      poolAddress: '0x77C10A04B7d3adEBE4F235D69b5c1f20Cbfd2E57',
      poolId: 0,
      isActive: true,
      multiplier: 20,
      startTime: 0
    },
    {
      stakeToken: GEM[ChainId.BSC_MAINNET],
      pairTokens: [],
      earnToken: GOLD[ChainId.BSC_MAINNET],
      poolAddress: '0x77C10A04B7d3adEBE4F235D69b5c1f20Cbfd2E57',
      poolId: 1,
      isActive: true,
      multiplier: 10,
      startTime: 0
    },
    {
      stakeToken: THUGS_NAR,
      earnToken: GOLD[ChainId.BSC_MAINNET],
      pairTokens: [THUGS, NAR[ChainId.BSC_MAINNET]],
      poolAddress: '0x77C10A04B7d3adEBE4F235D69b5c1f20Cbfd2E57',
      poolId: 2,
      isActive: true,
      multiplier: 10,
      startTime: 0
    },
    {
      stakeToken: BLIQ_WETH,
      earnToken: GOLD[ChainId.BSC_MAINNET],
      pairTokens: [BLIQ, WETH[ChainId.BSC_MAINNET]],
      poolAddress: '0x77C10A04B7d3adEBE4F235D69b5c1f20Cbfd2E57',
      poolId: 3,
      isActive: true,
      multiplier: 1,
      startTime: 1606575600000
    }
  ]
}

export interface TicketStakingInfo {
  poolAddress: string
  poolId: number
  stakedAmount: TokenAmount
  totalStakedAmount: TokenAmount
  earnedAmount: TokenAmount
  pairTokens: Token[]
  isActive: boolean
  multiplier: number
  needSendPid?: boolean
}

// gets the staking info from the network for the active chain id
export function useTicketStakingInfo(poolIdToFilterBy?: number | null): TicketStakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_TICKETS_INFO[chainId]?.filter(stakingRewardInfo =>
            poolIdToFilterBy === undefined
              ? true
              : poolIdToFilterBy === null
              ? false
              : poolIdToFilterBy === stakingRewardInfo.poolId
          ) ?? []
        : [],
    [chainId, poolIdToFilterBy]
  )

  const poolAddresses = useMemo(() => info.map(({ poolAddress }) => poolAddress), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const userInfos = useMultipleContractSingleData(poolAddresses, STACKING_TICKETS_INTERFACE, 'userInfo', accountArg)
  const earnedAmounts = useMultipleContractSingleData(
    poolAddresses,
    STACKING_TICKETS_INTERFACE,
    'pendingNarTicket',
    accountArg
  )
  const totalSupplies = useMultipleContractSingleData(poolAddresses, STACKING_TICKETS_INTERFACE, 'totalSupply')

  return useMemo(() => {
    if (!chainId) return []

    return poolAddresses.reduce<TicketStakingInfo[]>((memo, poolAddress, index) => {
      // these two are dependent on account
      const userInfoState = userInfos[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]

      if (
        // these may be undefined if not logged in
        !userInfoState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading
      ) {
        if (userInfoState?.error || earnedAmountState?.error || totalSupplyState.error) {
          console.error('Failed to load ticket staking info')
          return memo
        }

        // get the token
        const stakeToken = info[index].stakeToken
        const earnToken = info[index].earnToken
        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(stakeToken, JSBI.BigInt(userInfoState?.result?.amount ?? 0))
        const totalStakedAmount = new TokenAmount(
          stakeToken,
          JSBI.greaterThan(JSBI.BigInt(totalSupplyState.result?.[0]), JSBI.BigInt(4 * 10 ** 26))
            ? JSBI.subtract(JSBI.BigInt(totalSupplyState.result?.[0]), JSBI.BigInt(4 * 10 ** 26))
            : JSBI.BigInt(totalSupplyState.result?.[0])
        )
        const earnedAmount = new TokenAmount(earnToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0))

        memo.push({
          poolAddress: poolAddress,
          poolId: info[index].poolId,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          earnedAmount: earnedAmount,
          pairTokens: info[index].pairTokens,
          isActive: info[index].isActive,
          multiplier: info[index].multiplier
        })
      }
      return memo
    }, [])
  }, [userInfos, chainId, earnedAmounts, info, totalSupplies])
}

export function useTicketStakingInfoV2(poolIdToFilterBy?: number | null): TicketStakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_TICKETS_INFO_V2[chainId]
            ?.filter(stakingRewardInfo =>
              poolIdToFilterBy === undefined
                ? true
                : poolIdToFilterBy === null
                ? false
                : poolIdToFilterBy === stakingRewardInfo.poolId
            )
            .filter(stakingRewardInfo => Date.now() > stakingRewardInfo.startTime) ?? []
        : [],
    [chainId, poolIdToFilterBy]
  )

  const poolAddress = info[0]?.poolAddress
  const stakeTokenAddresses = useMemo(() => info.map(({ stakeToken }) => stakeToken.address), [info])
  const accountArg = useMemo(() => info.map(({ poolId }) => [poolId, account ?? BURNED_ADDRESS]), [info])

  const stakingContract = useTicketStakingContractV2(poolAddress ?? undefined)

  const userInfos = useSingleContractMultipleData(stakingContract, 'userInfo', accountArg)
  const earnedAmounts = useSingleContractMultipleData(stakingContract, 'pendinNart', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakeTokenAddresses, ERC20_INTERFACE, 'balanceOf', [poolAddress])

  return useMemo(() => {
    if (!chainId) return []

    return stakeTokenAddresses.reduce<TicketStakingInfo[]>((memo, stakeTokenAddress, index) => {
      // these two are dependent on account
      const userInfoState = userInfos[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]

      if (
        // these may be undefined if not logged in
        !userInfoState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading
      ) {
        if (userInfoState?.error || earnedAmountState?.error || totalSupplyState.error) {
          console.error('Failed to load ticket staking info')
          return memo
        }

        // get the token
        const stakeToken = info[index].stakeToken
        const earnToken = info[index].earnToken
        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(stakeToken, JSBI.BigInt(userInfoState?.result?.amount ?? 0))
        const totalStakedAmount = new TokenAmount(stakeToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const earnedAmount = new TokenAmount(earnToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0))

        memo.push({
          poolAddress: info[index].poolAddress,
          poolId: info[index].poolId,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          earnedAmount: earnedAmount,
          pairTokens: info[index].pairTokens,
          isActive: info[index].isActive,
          multiplier: info[index].multiplier,
          needSendPid: true
        })
      }
      return memo
    }, [])
  }, [userInfos, chainId, earnedAmounts, info, totalSupplies])
}

export interface NftInfo {
  id: string
  token_id: string
  name: string
  description: string
  token_image: string
  external_url: string
  types: Number
  rank: Number
  rank_text: string
  powers: Number
  effect: string
  created_time: Number
  author: string
  block: Number
  bnbPrice?: TokenAmount
  narPrice?: TokenAmount
  isOwner?: boolean
}

export interface userNftInfo {
  myNfts: Number[]
  gachaPrice: TokenAmount
}

export function useUserNfts(): userNftInfo | undefined {
  const { chainId, account } = useActiveWeb3React()
  const contract = useNftContract()
  const factoryContract = useNftFactoryContract()

  const accountArg = useMemo(() => [account ?? undefined], [account])
  const getPriceArg = useMemo(() => [account ?? undefined, 0], [account])

  const tokensOfOwnerCall = useSingleCallResult(contract, 'tokensOfOwner', accountArg)
  const gachaPriceCall = useSingleCallResult(factoryContract, 'getPayment', getPriceArg)

  return useMemo(() => {
    if (!chainId || !account) return undefined

    const tokensOfOwnerState = tokensOfOwnerCall
    const gachaPriceState = gachaPriceCall

    if (tokensOfOwnerState && !tokensOfOwnerState.loading && gachaPriceState && !gachaPriceState.loading) {
      if (tokensOfOwnerState.error || gachaPriceState.error) {
        console.error('Failed to load nft info')
        return undefined
      }

      const nfts: Number[] = tokensOfOwnerState?.result?.[0]
      const gachaPrice = new TokenAmount(GOLD[chainId], JSBI.BigInt(gachaPriceState?.result?.[0] ?? 0))

      return {
        myNfts: nfts,
        gachaPrice: gachaPrice
      }
    }
    return undefined
  }, [chainId, tokensOfOwnerCall])
}

export interface onSaleNftInfo {
  tokenId: Number
  bnbPrice: TokenAmount
  narPrice: TokenAmount
}

export function useOnSaleNfts(): onSaleNftInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const bazaarContract = useNftBazaarContract()

  const getAsksCall = useSingleCallResult(bazaarContract, 'getAsks')

  return useMemo(() => {
    if (!chainId || !account) return []

    const getAsksState = getAsksCall

    if (getAsksState && !getAsksState.loading) {
      if (getAsksState.error) {
        console.error('Failed to load nft on-sale info')
        return []
      }

      const dummy = NAR[chainId]
      const asksTuple: Number[][] = getAsksState?.result?.[0]

      return asksTuple.reduce<onSaleNftInfo[]>((asks, ask) => {
        asks.push({
          tokenId: ask[0],
          bnbPrice: new TokenAmount(dummy, JSBI.BigInt(ask[1] ?? 0)),
          narPrice: new TokenAmount(dummy, JSBI.BigInt(ask[2] ?? 0))
        })

        return asks
      }, [])
    }
    return []
  }, [chainId, getAsksCall])
}

export function useUserOnSaleNfts(): onSaleNftInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const bazaarContract = useNftBazaarContract()

  const accountArg = useMemo(() => [account ?? undefined], [account])

  const getAsksByUserCall = useSingleCallResult(bazaarContract, 'getAsksByUser', accountArg)

  return useMemo(() => {
    if (!chainId || !account) return []

    const getAsksByUserState = getAsksByUserCall

    if (getAsksByUserState && !getAsksByUserState.loading) {
      if (getAsksByUserState.error) {
        console.error('Failed to load user nft on-sale info')
        return []
      }

      const dummy = NAR[chainId]
      const asksTuple: Number[][] = getAsksByUserState?.result?.[0]

      return asksTuple.reduce<onSaleNftInfo[]>((asks, ask) => {
        asks.push({
          tokenId: ask[0],
          bnbPrice: new TokenAmount(dummy, JSBI.BigInt(ask[1] ?? 0)),
          narPrice: new TokenAmount(dummy, JSBI.BigInt(ask[2] ?? 0))
        })

        return asks
      }, [])
    }
    return []
  }, [chainId, getAsksByUserCall])
}
