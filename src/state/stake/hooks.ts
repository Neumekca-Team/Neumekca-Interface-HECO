import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@bscswap/sdk'
import { useMemo } from 'react'
import {
  BUSD,
  B_USDT,
  B_DAI,
  NAR,
  NAR_BNB,
  BTCB,
  T_BTCB,
  BURNED_ADDRESS,
  DIVIDEND_ADDRESS,
  DIVIDEND_ADDRESS2
} from '../../constants'
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_REWARDS_CAPPED_INTERFACE,
  STAKING_REWARDS_V2_INTERFACE
} from '../../constants/abis/staking-rewards'
import { NARWHAL_POWER_INTERFACE } from '../../constants/abis/narwhal-power'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { useNarContract } from '../../hooks/useContract'

export const STAKING_GENESIS = 1600387200

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    rnlpAddress: string
    powerAddress: string
    poolId: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    // New pools
    {
      tokens: [WETH[ChainId.BSC_MAINNET], NAR[ChainId.BSC_MAINNET]],
      stakingRewardAddress: '0x1D227F7e283D653a60F94d2350CAB7a49bB85C6f',
      rnlpAddress: '0x6451571Cb5bEe9Fd575ad98506E96f3d09C66F91',
      powerAddress: '0x1D791EaA684A21De92618Dedea7BF373e2486956',
      poolId: 0
    },
    {
      tokens: [WETH[ChainId.BSC_MAINNET], BUSD],
      stakingRewardAddress: '0x6dA9Ee0c0571b63e38950D1e12e835D5343f601B',
      rnlpAddress: '0x1f7D08d96d2520BD9196cb857e40d2A99e31de1A',
      powerAddress: '0xa1992a9777c3C11c466F44a4b9c7530719a22ea2',
      poolId: 1
    },
    {
      tokens: [WETH[ChainId.BSC_MAINNET], B_USDT],
      stakingRewardAddress: '0xCF889a0902859662C17dC895abb7AF49EE28A013',
      rnlpAddress: '0xc0b5306224298f39E6ce9Cb9fD2acb6d03A2CC04',
      powerAddress: '0xb9C9E7Cc58DA9B727916d7dfD6bf7001C5f26210',
      poolId: 2
    },
    {
      tokens: [WETH[ChainId.BSC_MAINNET], B_DAI],
      stakingRewardAddress: '0xb6c9B20253a4BDC65d1FDC6F4aE04f57f6523915',
      rnlpAddress: '0x6400442ad9B93aC56d18C272C977efE1e50273c1',
      powerAddress: '0x5777Ae2Ac8a042dc99dC41888C5b70f198A1e159',
      poolId: 3
    }
  ]
  // [ChainId.BSC_TESTNET]: [
  //   {
  //     tokens: [WETH[ChainId.BSC_TESTNET], T_BUSD],
  //     stakingRewardAddress: '0x6451571Cb5bEe9Fd575ad98506E96f3d09C66F91',
  //     rnlpAddress: '0x5d8f5534Ad36Fc6FE7175b911E164b58Bb30Ed05',
  //   },
  //   {
  //     tokens: [WETH[ChainId.BSC_TESTNET], T_BUSD],
  //     stakingRewardAddress: '0x6451571Cb5bEe9Fd575ad98506E96f3d09C66F91',
  //     rnlpAddress: '0x5d8f5534Ad36Fc6FE7175b911E164b58Bb30Ed05',
  //   }
  // ]
}

export const STAKING_REWARDS_CAPPED_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    rnlpAddress: string
    poolId: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    // {
    //   tokens: [BTCB, NAR[ChainId.BSC_MAINNET]],
    //   stakingRewardAddress: '0xaaa6ddB2022541C44e488Ea2b3F32c8C8726c107',
    //   rnlpAddress: '0x162EcE88ac02F23d72729Efd9e5467c24D88e61d',
    //   poolId: 0
    // },
    // {
    //   tokens: [BTCB, NAR[ChainId.BSC_MAINNET]],
    //   stakingRewardAddress: '0xE6E0646BD4FcD37EC7258D21295DD4cdc347F57a',
    //   rnlpAddress: '0x3321aDb09550BD03Ef6F15BB6d23015b844bE1Fa',
    //   poolId: 1
    // },
    {
      tokens: [BTCB, NAR[ChainId.BSC_MAINNET]],
      stakingRewardAddress: '0x3DFB186e8CE513f321232098Dd551e22886C1051',
      rnlpAddress: '0x205D52f845d0e79B5928EAa431eb09f9E234593e',
      poolId: 2
    }
  ]
}

export const STAKING_REWARDS_V2_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    rnlpAddress: string
    poolId: number
    startTime?: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    {
      tokens: [WETH[ChainId.BSC_MAINNET], NAR[ChainId.BSC_MAINNET]],
      stakingRewardAddress: '0xBE85812237741D75f81aEBF1D9Af52D544542168',
      rnlpAddress: '0x40572A82A7713bC9B1CbC023aA2a0a20B1fbde1c',
      poolId: 0,
      startTime: 1609164000000
    },
    {
      tokens: [BTCB, NAR[ChainId.BSC_MAINNET]],
      stakingRewardAddress: '0x268A2C1aCbEee3B74616b9FE3F07C1BF80841E5d',
      rnlpAddress: '0x46d603E2b9c709454316ebd244B99A8abe3Bd243',
      poolId: 1,
      startTime: 1608040800000
    }
  ],
  [ChainId.BSC_TESTNET]: [
    {
      tokens: [WETH[ChainId.BSC_TESTNET], NAR[ChainId.BSC_TESTNET]],
      stakingRewardAddress: '0xA89a80CbA9182806e782386C335bC75a97f6FD1d',
      rnlpAddress: '0xA129ef8B9d8575C31c67B97843CC5FA1DC25a1Ba',
      poolId: 0
    },
    {
      tokens: [T_BTCB, NAR[ChainId.BSC_TESTNET]],
      stakingRewardAddress: '0x529dD123bcdA4ebe9D4acD69a52A65B880630b8A',
      rnlpAddress: '0x8F54187ff7678317329268aC7C2A7b67471A7f4e',
      poolId: 1
    }
  ]
}

export interface StakingInfo {
  stakingRewardAddress: string
  tokens: [Token, Token]
  stakedAmount: TokenAmount
  earnedAmount: TokenAmount
  totalStakedAmount: TokenAmount
  totalRewardRate: TokenAmount
  rewardRate: TokenAmount
  periodFinish: Date | undefined
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount

  rnlpAddress: string
  rnlpToken: Token
  rnlpBalance: TokenAmount

  narPair: [Token, Token]
  narPower: TokenAmount
  userInfoTimeStamp: number
  userMaxBuffRate: JSBI

  commonMin: TokenAmount
  commonMax: TokenAmount

  startTime?: number
  poolId: number  
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(poolIdToFilterBy?: number | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
            poolIdToFilterBy === undefined
              ? true
              : poolIdToFilterBy === null
              ? false
              : poolIdToFilterBy === stakingRewardInfo.poolId
          ) ?? []
        : [],
    [chainId, poolIdToFilterBy]
  )

  const nar = chainId ? NAR[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const rnlpAddresses = useMemo(() => info.map(({ rnlpAddress }) => rnlpAddress), [info])
  const powerAddresses = useMemo(() => info.map(({ powerAddress }) => powerAddress), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const totalPowers = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, '_totalPower')
  const rnlpBalances = useMultipleContractSingleData(rnlpAddresses, ERC20_INTERFACE, 'balanceOf', accountArg)
  const userInfos = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'userInfo', accountArg)
  const rules = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'Rule', accountArg)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    '_rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const commonEdges = useMultipleContractSingleData(
    powerAddresses,
    NARWHAL_POWER_INTERFACE,
    '_narwhalsSegment',
    [2],
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    '_periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !nar) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const rnlpBalanceState = rnlpBalances[index]
      const userInfoState = userInfos[index]
      const ruleState = rules[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalPowers[index]
      const rewardRateState = rewardRates[index]
      const commonEdgeState = commonEdges[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !rnlpBalanceState?.loading &&
        !userInfoState?.loading &&
        !ruleState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        totalPowerState &&
        !totalPowerState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        commonEdgeState &&
        !commonEdgeState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          rnlpBalanceState?.error ||
          ruleState?.error ||
          userInfoState?.error ||
          totalSupplyState.error ||
          totalPowerState.error ||
          rewardRateState.error ||
          commonEdgeState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        const rnlpToken = new Token(chainId, rnlpAddresses[index], 18, 'rNLP', 'rNLP Token')
        const dummyNarpower = new Token(chainId, rnlpAddresses[index], 21, 'NARPOWER', 'NARPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const rnlpAmount = new TokenAmount(rnlpToken, JSBI.BigInt(rnlpBalanceState?.result?.[0] ?? 0))
        const narPower = new TokenAmount(dummyNarpower, JSBI.BigInt(userInfoState?.result?.currentPower ?? 0))
        const buffRateTimestamp = userInfoState?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0
        const rule = JSBI.BigInt(ruleState?.result?.[0] ?? 0)
        const commonMinAmount = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(commonEdgeState?.result?.min ?? 0)
        )
        const commonMaxAmount = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(commonEdgeState?.result?.max ?? 0)
        )

        const getHypotheticalRewardRate = (
          narPower: TokenAmount,
          totalNarPower: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            nar,
            JSBI.greaterThan(totalNarPower.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, narPower.raw), totalNarPower.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(narPower, totalPower, totalRewardRate)

        const maxBuffRate = [9, 15, 3]
        const userMaxBuffRate = JSBI.BigInt(maxBuffRate[Number(rule)])

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber()

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(nar, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          rnlpAddress: rnlpAddresses[index],
          rnlpToken: rnlpToken,
          rnlpBalance: rnlpAmount,
          narPair: NAR_BNB[chainId],
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          commonMin: commonMinAmount,
          commonMax: commonMaxAmount,
          poolId: info[index].poolId
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    totalPowers,
    rnlpBalances,
    userInfos,
    rules,
    nar
  ])
}

// btc capped pools
export function useStakingInfoCapped(poolIdToFilterBy?: number | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_CAPPED_INFO[chainId]?.filter(stakingRewardInfo =>
            poolIdToFilterBy === undefined
              ? true
              : poolIdToFilterBy === null
              ? false
              : poolIdToFilterBy === stakingRewardInfo.poolId
          ) ?? []
        : [],
    [chainId, poolIdToFilterBy]
  )

  const nar = chainId ? NAR[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const rnlpAddresses = useMemo(() => info.map(({ rnlpAddress }) => rnlpAddress), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_CAPPED_INTERFACE,
    'balanceOf',
    accountArg
  )
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_CAPPED_INTERFACE,
    'earned',
    accountArg
  )
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_CAPPED_INTERFACE, 'totalSupply')
  const totalPowers = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_CAPPED_INTERFACE, '_totalPower')
  const rnlpBalances = useMultipleContractSingleData(rnlpAddresses, ERC20_INTERFACE, 'balanceOf', accountArg)
  const userInfos = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_CAPPED_INTERFACE,
    'userInfo',
    accountArg
  )
  const rules = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_CAPPED_INTERFACE,
    '_rule',
    undefined,
    NEVER_RELOAD
  )

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_CAPPED_INTERFACE,
    '_rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_CAPPED_INTERFACE,
    '_periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !nar) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const rnlpBalanceState = rnlpBalances[index]
      const userInfoState = userInfos[index]
      const ruleState = rules[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalPowers[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !rnlpBalanceState?.loading &&
        !userInfoState?.loading &&
        !ruleState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        totalPowerState &&
        !totalPowerState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          rnlpBalanceState?.error ||
          ruleState?.error ||
          userInfoState?.error ||
          totalSupplyState.error ||
          totalPowerState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load staking rewards capped info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        const rnlpToken = new Token(chainId, rnlpAddresses[index], 18, 'rNLP', 'rNLP Token')
        const dummyNarpower = new Token(chainId, rnlpAddresses[index], 21, 'NARPOWER', 'NARPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const rnlpAmount = new TokenAmount(rnlpToken, JSBI.BigInt(rnlpBalanceState?.result?.[0] ?? 0))
        const narPower = new TokenAmount(dummyNarpower, JSBI.BigInt(userInfoState?.result?.currentPower ?? 0))
        const buffRateTimestamp = userInfoState?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0
        const rule = JSBI.BigInt(ruleState?.result?.[0] ?? 0)
        const commonMinAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(30000000000000000000))
        const commonMaxAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(300000000000000000000))

        const getHypotheticalRewardRate = (
          narPower: TokenAmount,
          totalNarPower: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            nar,
            JSBI.greaterThan(totalNarPower.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, narPower.raw), totalNarPower.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(narPower, totalPower, totalRewardRate)

        const maxBuffRate = [9, 15, 3]
        const userMaxBuffRate = JSBI.BigInt(maxBuffRate[Number(rule)])

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber()

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(nar, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          rnlpAddress: rnlpAddresses[index],
          rnlpToken: rnlpToken,
          rnlpBalance: rnlpAmount,
          narPair: NAR_BNB[chainId],
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          commonMin: commonMinAmount,
          commonMax: commonMaxAmount,
          poolId: info[index].poolId
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    totalPowers,
    rnlpBalances,
    userInfos,
    rules,
    nar
  ])
}

// staking V2
export function useStakingInfoV2(poolIdToFilterBy?: number | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_V2_INFO[chainId]?.filter(stakingRewardInfo =>
            poolIdToFilterBy === undefined
              ? true
              : poolIdToFilterBy === null
              ? false
              : poolIdToFilterBy === stakingRewardInfo.poolId
          ) ?? []
        : [],
    [chainId, poolIdToFilterBy]
  )

  const nar = chainId ? NAR[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const rnlpAddresses = useMemo(() => info.map(({ rnlpAddress }) => rnlpAddress), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    'balanceOf',
    accountArg
  )
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    'earned',
    accountArg
  )
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'totalSupply')
  const totalPowers = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, '_totalPower')
  const rnlpBalances = useMultipleContractSingleData(rnlpAddresses, ERC20_INTERFACE, 'balanceOf', accountArg)
  const userInfos = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    'userInfo',
    accountArg
  )
  const userMaxBuffrates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    'userMaxBuffrate',
    accountArg
  )
  const averageLps = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'averageLp')
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    '_rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    '_periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !nar) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const rnlpBalanceState = rnlpBalances[index]
      const userInfoState = userInfos[index]
      const userMaxBuffrateState = userMaxBuffrates[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalPowers[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const averageLpState = averageLps[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !rnlpBalanceState?.loading &&
        !userInfoState?.loading &&
        !userInfoState?.loading &&
        !userMaxBuffrateState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        totalPowerState &&
        !totalPowerState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        averageLpState &&
        !averageLpState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          rnlpBalanceState?.error ||
          userInfoState?.error ||
          userMaxBuffrateState?.error ||
          totalSupplyState.error ||
          totalPowerState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          averageLpState.error
        ) {
          console.error('Failed to load staking rewards v2 info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        const rnlpToken = new Token(chainId, rnlpAddresses[index], 18, 'rNLP', 'rNLP Token')
        const dummyNarpower = new Token(chainId, rnlpAddresses[index], 21, 'NARPOWER', 'NARPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const rnlpAmount = new TokenAmount(rnlpToken, JSBI.BigInt(rnlpBalanceState?.result?.[0] ?? 0))
        const narPower = new TokenAmount(dummyNarpower, JSBI.BigInt(userInfoState?.result?.currentPower ?? 0))
        const buffRateTimestamp = userInfoState?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0
        const userMaxBuffRate = JSBI.BigInt(userMaxBuffrateState?.result?.[0] ?? 3)
        const commonMinAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(averageLpState?.result?.[0] ?? 0))
        const commonMaxAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.multiply(commonMinAmount.raw, JSBI.BigInt(13)))

        const getHypotheticalRewardRate = (
          narPower: TokenAmount,
          totalNarPower: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            nar,
            JSBI.greaterThan(totalNarPower.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, narPower.raw), totalNarPower.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(narPower, totalPower, totalRewardRate)

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber()

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(nar, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          rnlpAddress: rnlpAddresses[index],
          rnlpToken: rnlpToken,
          rnlpBalance: rnlpAmount,
          narPair: NAR_BNB[chainId],
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          commonMin: commonMinAmount,
          commonMax: commonMaxAmount,
          startTime: info[index].startTime,
          poolId: info[index].poolId
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    totalPowers,
    rnlpBalances,
    userInfos,
    nar
  ])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

export interface NarSupplyInfo {
  totalSupply: TokenAmount
  circulating: TokenAmount
  burned: TokenAmount
  dividend: TokenAmount
}

// calculate totalSupply
export function useNarSupplyInfo(): NarSupplyInfo | undefined {
  const { chainId } = useActiveWeb3React()
  const nar = chainId ? NAR[chainId] : undefined
  const contract = useNarContract()

  const totalSupplyCall = useSingleCallResult(contract, 'totalSupply')
  const totalBurnedCall = useSingleCallResult(contract, '_totalBurnToken')
  const burnedCall = useSingleCallResult(contract, 'balanceOf', [BURNED_ADDRESS])
  const dividendCall = useSingleCallResult(contract, 'balanceOf', [DIVIDEND_ADDRESS])
  const dividendCall2 = useSingleCallResult(contract, 'balanceOf', [DIVIDEND_ADDRESS2])

  return useMemo(() => {
    if (!chainId || !nar) return undefined

    const totalSupplyState = totalSupplyCall
    const totalBurnedState = totalBurnedCall
    const burnedState = burnedCall
    const dividendState = dividendCall
    const dividendState2 = dividendCall2

    if (
      totalSupplyState &&
      !totalSupplyState.loading &&
      totalBurnedState &&
      !totalBurnedState.loading &&
      burnedState &&
      !burnedState.loading &&
      dividendState &&
      !dividendState.loading &&
      dividendState2 &&
      !dividendState2.loading
    ) {
      if (
        totalSupplyState.error ||
        totalBurnedState.error ||
        burnedState.error ||
        dividendState.error ||
        dividendState2.error
      ) {
        console.error('Failed to load nar info')
        return undefined
      }

      const totalSupply: TokenAmount = new TokenAmount(nar, totalSupplyState?.result?.[0] ?? 0)
      const totalBurned: TokenAmount = new TokenAmount(nar, totalBurnedState?.result?.[0] ?? 0)
      const realTotalSupply: TokenAmount = new TokenAmount(nar, JSBI.add(totalSupply.raw, totalBurned.raw))

      const burned: TokenAmount = new TokenAmount(nar, burnedState?.result?.[0] ?? 0)

      const dividend: TokenAmount = new TokenAmount(nar, dividendState?.result?.[0] ?? 0)
      // const dividend2: TokenAmount = new TokenAmount(nar, dividendState2?.result?.[0] ?? 0)
      const dividend2: TokenAmount = new TokenAmount(nar, JSBI.BigInt(0))
      const totalDividend: TokenAmount = new TokenAmount(nar, JSBI.add(dividend.raw, dividend2.raw))

      const circulating: TokenAmount = new TokenAmount(
        nar,
        JSBI.subtract(realTotalSupply.raw, JSBI.add(burned.raw, totalDividend.raw))
      )
      return {
        totalSupply: realTotalSupply,
        circulating: circulating,
        burned: burned,
        dividend: totalDividend
      }
    }
    return undefined
  }, [nar, totalSupplyCall, burnedCall, dividendCall, dividendCall2])
}
