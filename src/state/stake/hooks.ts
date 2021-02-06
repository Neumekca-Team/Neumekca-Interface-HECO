import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@neumekca/neumekca-sdk'
import { useMemo } from 'react'
import {
  H_DAI,
  ZERO,
  ZERO_HT,
  H_USDT,
  HBTC,
  BURNED_ADDRESS,
  DIVIDEND_ADDRESS,
  DIVIDEND_ADDRESS2,
  H_USD
} from '../../constants'
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_REWARDS_CAPPED_INTERFACE,
  STAKING_REWARDS_V2_INTERFACE
} from '../../constants/abis/staking-rewards'
import { ZEROWHAL_POWER_INTERFACE } from '../../constants/abis/narwhal-power'
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
    jlp4fAddress: string
    powerAddress: string
    poolId: number
  }[]
} = {
  [ChainId.HT_MAINNET]: [
    // New pools
    // {
    //   tokens: [WETH[ChainId.HT_MAINNET], ZERO[ChainId.HT_MAINNET]],
    //   stakingRewardAddress: '0x1D227F7e283D653a60F94d2350CAB7a49bB85C6f',
    //   jlp4fAddress: '0x6451571Cb5bEe9Fd575ad98506E96f3d09C66F91',
    //   powerAddress: '0x1D791EaA684A21De92618Dedea7BF373e2486956',
    //   poolId: 0
    // },
    
    {
      tokens: [WETH[ChainId.HT_MAINNET], H_USD[ChainId.HT_MAINNET]],
      stakingRewardAddress: '0x6dA9Ee0c0571b63e38950D1e12e835D5343f601B',
      jlp4fAddress: '0x1f7D08d96d2520BD9196cb857e40d2A99e31de1A',
      powerAddress: '0xa1992a9777c3C11c466F44a4b9c7530719a22ea2',
      poolId: 1
    },
    {
      tokens: [WETH[ChainId.HT_MAINNET], H_USDT],
      stakingRewardAddress: '0xCF889a0902859662C17dC895abb7AF49EE28A013',
      jlp4fAddress: '0xc0b5306224298f39E6ce9Cb9fD2acb6d03A2CC04',
      powerAddress: '0xb9C9E7Cc58DA9B727916d7dfD6bf7001C5f26210',
      poolId: 2
    },
    {
      tokens: [WETH[ChainId.HT_MAINNET], H_DAI],
      stakingRewardAddress: '0xb6c9B20253a4BDC65d1FDC6F4aE04f57f6523915',
      jlp4fAddress: '0x6400442ad9B93aC56d18C272C977efE1e50273c1',
      powerAddress: '0x5777Ae2Ac8a042dc99dC41888C5b70f198A1e159',
      poolId: 3
    }
  ]
}

export const STAKING_REWARDS_CAPPED_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    jlp4fAddress: string
    poolId: number
  }[]
} = {
  [ChainId.HT_MAINNET]: [
    {
      tokens: [HBTC, ZERO[ChainId.HT_MAINNET]],
      stakingRewardAddress: '0x3DFB186e8CE513f321232098Dd551e22886C1051',
      jlp4fAddress: '0x205D52f845d0e79B5928EAa431eb09f9E234593e',
      poolId: 1
    },
    {
      tokens: [HBTC, ZERO[ChainId.HT_MAINNET]],
      stakingRewardAddress: '0x529dD123bcdA4ebe9D4acD69a52A65B880630b8A',
      jlp4fAddress: '0x8F54187ff7678317329268aC7C2A7b67471A7f4e',
      poolId: 2
    },
    {
      tokens: [HBTC, ZERO[ChainId.HT_MAINNET]],
      stakingRewardAddress: '0x529dD123bcdA4ebe9D4acD69a52A65B880630b8A',
      jlp4fAddress: '0x8F54187ff7678317329268aC7C2A7b67471A7f4e',
      poolId: 3
    }
  ]
}

export const STAKING_REWARDS_V2_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    jlp4fAddress: string
    poolId: number
    startTime?: number
  }[]
} = {
  [ChainId.HT_MAINNET]: [
    // {
    //   tokens: [WETH[ChainId.HT_MAINNET], ZERO[ChainId.HT_MAINNET]],
    //   stakingRewardAddress: '0xed93ccFA7FB5ebd037d1EfEe362583E28A9b3CE5',
    //   jlp4fAddress: '0x282EA4e76Fd9C812A1B4974716DD9C396a2Be202',
    //   poolId: 0,
    //   startTime: 1612137600
    // }
     {
      tokens: [WETH[ChainId.HT_MAINNET], ZERO[ChainId.HT_MAINNET]],
      stakingRewardAddress: '0xD14bB95723db72D5802cEf8598fb19f51EB3AfA5',
      jlp4fAddress: '0x282EA4e76Fd9C812A1B4974716DD9C396a2Be202',
      poolId: 0,
      startTime: 1612137600
    }
   
  ],
  [ChainId.HT_TESTNET]: [
    {
      tokens: [WETH[ChainId.HT_TESTNET], ZERO[ChainId.HT_TESTNET]],
      stakingRewardAddress: '0xf9528286d67b3C75241EC28Fd7f5cBf8a0F4e1Ac',
      jlp4fAddress: '0x99b2Beec3fbFee380470742E98244889FAf77994',
      poolId: 0,
      startTime: 1612137600
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

  jlp4fAddress: string
  jlp4fToken: Token
  jlp4fBalance: TokenAmount

  narPair: [Token, Token]
  narPower: TokenAmount
  userInfoTimeStamp: number
  userMaxBuffRate: JSBI

  commonMin: TokenAmount
  commonMax: TokenAmount

  startTime?: number
  poolId: number

  rune1: number
  rune1TimeStamp: number
  rune2: number
  rune2TimeStamp: number
  rune3: number
  rune3TimeStamp: number
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

  const nar = chainId ? ZERO[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const jlp4fAddresses = useMemo(() => info.map(({ jlp4fAddress }) => jlp4fAddress), [info])
  const powerAddresses = useMemo(() => info.map(({ powerAddress }) => powerAddress), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const totalSkills = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, '_totalSkills')
  const jlp4fBalances = useMultipleContractSingleData(jlp4fAddresses, ERC20_INTERFACE, 'balanceOf', accountArg)
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
    ZEROWHAL_POWER_INTERFACE,
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

  const runes1 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    1
  ])

  const runes2 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    2
  ])

  const runes3 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    3
  ])

  
  return useMemo(() => {
    if (!chainId || !nar) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const jlp4fBalanceState = jlp4fBalances[index]
      const userInfoState = userInfos[index]
      const ruleState = rules[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalSkills[index]
      const rewardRateState = rewardRates[index]
      const commonEdgeState = commonEdges[index]
      const periodFinishState = periodFinishes[index]
      const runeState1 = runes1[index]
      const runeState2 = runes2[index]
      const runeState3 = runes3[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !jlp4fBalanceState?.loading &&
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
          jlp4fBalanceState?.error ||
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
        const jlp4fToken = new Token(chainId, jlp4fAddresses[index], 18, 'rNLP', 'rNLP Token')
        const dummyNarpower = new Token(chainId, jlp4fAddresses[index], 21, 'ZEROPOWER', 'ZEROPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const jlp4fAmount = new TokenAmount(jlp4fToken, JSBI.BigInt(jlp4fBalanceState?.result?.[0] ?? 0))
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
          jlp4fAddress: jlp4fAddresses[index],
          jlp4fToken: jlp4fToken,
          jlp4fBalance: jlp4fAmount,
          narPair: ZERO_HT[chainId],
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          commonMin: commonMinAmount,
          commonMax: commonMaxAmount,
          poolId: info[index].poolId,
          rune1: runeState1?.result?.tokenIndex?.toNumber(),
          rune1TimeStamp: runeState1?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
          rune2: runeState2?.result?.tokenIndex?.toNumber(),
          rune2TimeStamp: runeState2?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,

          rune3: runeState3?.result?.tokenIndex?.toNumber(),
          rune3TimeStamp: runeState3?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
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
    totalSkills,
    jlp4fBalances,
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

  const nar = chainId ? ZERO[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const jlp4fAddresses = useMemo(() => info.map(({ jlp4fAddress }) => jlp4fAddress), [info])
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
  const totalSkills = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_CAPPED_INTERFACE, '_totalSkills')
  const jlp4fBalances = useMultipleContractSingleData(jlp4fAddresses, ERC20_INTERFACE, 'balanceOf', accountArg)
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

  const runes1 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    1
  ])

  const runes2 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    2
  ])

  const runes3 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    3
  ])

  return useMemo(() => {
    if (!chainId || !nar) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const jlp4fBalanceState = jlp4fBalances[index]
      const userInfoState = userInfos[index]
      const ruleState = rules[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalSkills[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const runeState1 = runes1[index]
      const runeState2 = runes2[index]
      const runeState3 = runes3[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !jlp4fBalanceState?.loading &&
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
          jlp4fBalanceState?.error ||
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
        const jlp4fToken = new Token(chainId, jlp4fAddresses[index], 18, 'rNLP', 'rNLP Token')
        const dummyNarpower = new Token(chainId, jlp4fAddresses[index], 21, 'ZEROPOWER', 'ZEROPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const jlp4fAmount = new TokenAmount(jlp4fToken, JSBI.BigInt(jlp4fBalanceState?.result?.[0] ?? 0))
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
          jlp4fAddress: jlp4fAddresses[index],
          jlp4fToken: jlp4fToken,
          jlp4fBalance: jlp4fAmount,
          narPair: ZERO_HT[chainId],
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          commonMin: commonMinAmount,
          commonMax: commonMaxAmount,
          poolId: info[index].poolId,
          rune1: runeState1?.result?.tokenIndex?.toNumber(),
          rune1TimeStamp: runeState1?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
          rune2: runeState2?.result?.tokenIndex?.toNumber(),
          rune2TimeStamp: runeState2?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,

          rune3: runeState3?.result?.tokenIndex?.toNumber(),
          rune3TimeStamp: runeState3?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
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
    totalSkills,
    jlp4fBalances,
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

  const nar = chainId ? ZERO[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const jlp4fAddresses = useMemo(() => info.map(({ jlp4fAddress }) => jlp4fAddress), [info])
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
  const totalSkills = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, '_totalSkills')
  const jlp4fBalances = useMultipleContractSingleData(jlp4fAddresses, ERC20_INTERFACE, 'balanceOf', accountArg)
  const userInfos = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    'userInfo',
    accountArg
  )
  const userMaxBuffrates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_V2_INTERFACE,
    'userMaxChronos',
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

  const runes1 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    1
  ])

  const runes2 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    2
  ])

  const runes3 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_V2_INTERFACE, 'getNcardRate', [
    ...accountArg,
    3
  ])

  return useMemo(() => {
    if (!chainId || !nar) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const jlp4fBalanceState = jlp4fBalances[index]
      const userInfoState = userInfos[index]
      const userMaxBuffrateState = userMaxBuffrates[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalSkills[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const averageLpState = averageLps[index]
      const runeState1 = runes1[index]
      const runeState2 = runes2[index]
      const runeState3 = runes3[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !jlp4fBalanceState?.loading &&
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
          jlp4fBalanceState?.error ||
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
        const jlp4fToken = new Token(chainId, jlp4fAddresses[index], 18, 'rNLP', 'rNLP Token')
        const dummyNarpower = new Token(chainId, jlp4fAddresses[index], 21, 'ZEROPOWER', 'ZEROPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const jlp4fAmount = new TokenAmount(jlp4fToken, JSBI.BigInt(jlp4fBalanceState?.result?.[0] ?? 0))
        const narPower = new TokenAmount(dummyNarpower, JSBI.BigInt(userInfoState?.result?.currentPower ?? 0))
        const buffRateTimestamp = userInfoState?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0
        const userMaxBuffRate = JSBI.BigInt(userMaxBuffrateState?.result?.[0] ?? 3)
        const commonMinAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(averageLpState?.result?.[0] ?? 0))
        const commonMaxAmount = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.multiply(commonMinAmount.raw, JSBI.BigInt(13))
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
          jlp4fAddress: jlp4fAddresses[index],
          jlp4fToken: jlp4fToken,
          jlp4fBalance: jlp4fAmount,
          narPair: ZERO_HT[chainId],
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          commonMin: commonMinAmount,
          commonMax: commonMaxAmount,
          startTime: info[index].startTime,
          poolId: info[index].poolId,
          rune1: runeState1?.result?.tokenIndex?.toNumber(),
          rune1TimeStamp: runeState1?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
          rune2: runeState2?.result?.tokenIndex?.toNumber(),
          rune2TimeStamp: runeState2?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,

          rune3: runeState3?.result?.tokenIndex?.toNumber(),
          rune3TimeStamp: runeState3?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
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
    totalSkills,
    jlp4fBalances,
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
  const nar = chainId ? ZERO[chainId] : undefined
  const contract = useNarContract()

  const totalSupplyCall = useSingleCallResult(contract, 'totalSupply')
  const totalBurnedCall = useSingleCallResult(contract, '_totalBurnToken')
  const burnedCall = useSingleCallResult(contract, 'balanceOf', [chainId ? BURNED_ADDRESS[chainId] : undefined])
  const dividendCall = useSingleCallResult(contract, 'balanceOf', [chainId ? DIVIDEND_ADDRESS[chainId] : undefined])
  const dividendCall2 = useSingleCallResult(contract, 'balanceOf', [chainId ? DIVIDEND_ADDRESS2[chainId] : undefined])

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
