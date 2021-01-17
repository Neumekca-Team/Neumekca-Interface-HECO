import { ChainId, JSBI, Token, TokenAmount } from '@bscswap/sdk'
import { useMemo } from 'react'
import { NAR, GEM } from '../../constants'
import { STAKING_REWARDS_DIVIDEND_INTERFACE } from '../../constants/abis/staking-rewards'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'

export const STAKING_REWARDS_DIVIDEND_INFO: {
  [chainId in ChainId]?: {
    stakeToken: Token
    representativeToken: Token
    poolAddress: string
    poolId: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    {
      stakeToken: NAR[ChainId.BSC_MAINNET],
      representativeToken: GEM[ChainId.BSC_MAINNET],
      poolAddress: '0xf7a36c87c3A8909949638120f23CD721bF572032',
      poolId: 0
    }
  ],
  [ChainId.BSC_TESTNET]: [
    {
      stakeToken: NAR[ChainId.BSC_TESTNET],
      representativeToken: GEM[ChainId.BSC_TESTNET],
      poolAddress: '0x6D32E17f7510fDB85415bB9469bD39F54CC2Db5d',
      poolId: 0
    }
  ]
}

export interface DividendStakingInfo {
  poolAddress: string
  stakedAmount: TokenAmount
  earnedAmount: TokenAmount
  representativeAmount: TokenAmount
  totalStakedAmount: TokenAmount
  totalRewardRate: TokenAmount
  rewardRate: TokenAmount
  periodFinish: Date | undefined
  narPower: TokenAmount
  userInfoTimeStamp: number
  userMaxBuffRate: JSBI
  rune1: number
  rune1TimeStamp: number
  rune2: number
  rune2TimeStamp: number
  poolId: number
}

// gets the staking info from the network for the active chain id
export function useDividendStakingInfo(poolIdToFilterBy?: number | null): DividendStakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_DIVIDEND_INFO[chainId]?.filter(stakingRewardInfo =>
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

  const poolAddresses = useMemo(() => info.map(({ poolAddress }) => poolAddress), [info])
  const rAddresses = useMemo(() => info.map(({ representativeToken }) => representativeToken.address), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    'balanceOf',
    accountArg
  )
  const earnedAmounts = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    'earned',
    accountArg
  )
  const totalSupplies = useMultipleContractSingleData(poolAddresses, STAKING_REWARDS_DIVIDEND_INTERFACE, 'totalSupply')
  const totalPowers = useMultipleContractSingleData(poolAddresses, STAKING_REWARDS_DIVIDEND_INTERFACE, '_totalPower')
  const rBalances = useMultipleContractSingleData(
    rAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    'balanceOf',
    accountArg
  )
  const userInfos = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    'userInfo',
    accountArg
  )
  const runes1 = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    'rune',
    [...accountArg, 1]
  )
  const runes2 = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    'rune',
    [...accountArg, 2]
  )
  const rules = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    '_rule',
    undefined,
    NEVER_RELOAD
  )  

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    '_rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_DIVIDEND_INTERFACE,
    '_periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !nar) return []

    return poolAddresses.reduce<DividendStakingInfo[]>((memo, poolAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const rBalanceState = rBalances[index]
      const userInfoState = userInfos[index]
      const ruleState = rules[index]
      const runeState1 = runes1[index]
      const runeState2 = runes2[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const totalPowerState = totalPowers[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !rBalanceState?.loading &&
        !userInfoState?.loading &&
        !ruleState?.loading &&
        !runeState1?.loading &&
        !runeState2?.loading &&
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
          rBalanceState?.error ||
          ruleState?.error ||
          runeState1?.error ||
          runeState2?.error ||
          userInfoState?.error ||
          totalSupplyState.error ||
          totalPowerState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load dividend pools info')
          return memo
        }

        const rToken = info[index].representativeToken
        const dummyNarpower = new Token(chainId, rToken.address, 21, 'NARPOWER', 'NARPOWER')

        // check for account, if no account set to 0
        const stakedAmount = new TokenAmount(nar, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const earnedAmount = new TokenAmount(nar, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(nar, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(nar, JSBI.BigInt(rewardRateState.result?.[0]))
        const totalPower = new TokenAmount(dummyNarpower, JSBI.BigInt(totalPowerState.result?.[0]))
        const rAmount = new TokenAmount(rToken, JSBI.BigInt(rBalanceState?.result?.[0] ?? 0))
        const narPower = new TokenAmount(dummyNarpower, JSBI.BigInt(userInfoState?.result?.currentPower ?? 0))
        const buffRateTimestamp = userInfoState?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0
        const rule = JSBI.BigInt(ruleState?.result?.[0] ?? 0)

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
          poolAddress: poolAddress,
          stakedAmount: stakedAmount,
          earnedAmount: earnedAmount,
          representativeAmount: rAmount,
          totalStakedAmount: totalStakedAmount,
          totalRewardRate: totalRewardRate,
          rewardRate: individualRewardRate,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          narPower: narPower,
          userInfoTimeStamp: buffRateTimestamp,
          userMaxBuffRate: userMaxBuffRate,
          rune1: runeState1?.result?.tokenIndex?.toNumber(),
          rune1TimeStamp: runeState1?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
          rune2: runeState2?.result?.tokenIndex?.toNumber(),
          rune2TimeStamp: runeState2?.result?.timeStamp?.mul(1000)?.toNumber() ?? 0,
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
    poolAddresses,
    totalSupplies,
    totalPowers,
    rBalances,
    userInfos,
    rules,
    runes1,
    runes2,
    nar
  ])
}
