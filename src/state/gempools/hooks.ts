import { ChainId, JSBI, Token, TokenAmount } from '@neumekca/neumekca-sdk'
import { useMemo } from 'react'
import { GOLD, GEM, BLIQ } from '../../constants'
import { STACKING_GEMS_INTERFACE } from '../../constants/abis/staking-gems'
import { useActiveWeb3React } from '../../hooks'
import { useMultipleContractSingleData, useSingleContractMultipleData } from '../multicall/hooks'
import { useTokenContract } from '../../hooks/useContract'
import { useBlockNumber } from '../application/hooks'

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_GEMS_INFO: {
  [chainId in ChainId]?: {
    stakeToken: Token
    earnToken: Token
    poolAddress: string
    poolId: number
    isActive: boolean
    projectLink: string
    startTime?: number
  }[]
} = {
  [ChainId.BSC_MAINNET]: [
    {
      stakeToken: GEM[ChainId.BSC_MAINNET],
      earnToken: BLIQ,
      poolAddress: '0x26C2585b198E381663B2C8207aD04F3571ea3177',
      poolId: 0,
      isActive: false,
      projectLink: 'https://www.bliquid.io',
      startTime: 1606575600000
    }
  ],
  [ChainId.BSC_TESTNET]: [
    {
      stakeToken: GEM[ChainId.BSC_TESTNET],
      earnToken: GOLD[ChainId.BSC_TESTNET],
      poolAddress: '0xe749B8264586E9bF3b9a6235CD34c35f11B686b7',
      poolId: 0,
      isActive: true,
      projectLink: 'https://narwhalswap.org/#/page/gold'
    }
  ]
}

export interface GemStakingInfo {
  poolAddress: string
  poolId: number
  stakedAmount: TokenAmount
  totalStakedAmount: TokenAmount
  earnedAmount: TokenAmount
  remainingAmount: TokenAmount
  isActive: boolean
  needSendPid?: boolean
  projectLink: string
  startTime: number
}

// gets the staking info from the network for the active chain id
export function useGemStakingInfo(poolIdToFilterBy?: number | null): GemStakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const latestBlockNumber = useBlockNumber()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_GEMS_INFO[chainId]?.filter(stakingRewardInfo =>
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
  const poolAddresseArgs = useMemo(() => info.map(({ poolAddress }) => [poolAddress]), [info])
  const stakeTokenAddress = info?.[0]?.stakeToken?.address
  const earnedTokenAddress = info?.[0]?.earnToken?.address
  const accountArg = useMemo(() => [account ?? undefined], [account])

  const stakeTokenContracts = useTokenContract(stakeTokenAddress ?? undefined)
  const earnedTokenContracts = useTokenContract(earnedTokenAddress ?? undefined)

  // get all the info from the staking rewards contracts
  const userInfos = useMultipleContractSingleData(poolAddresses, STACKING_GEMS_INTERFACE, 'userInfo', accountArg)
  const earnedAmounts = useMultipleContractSingleData(
    poolAddresses,
    STACKING_GEMS_INTERFACE,
    'pendingReward',
    accountArg
  )
  const totalSupplies = useSingleContractMultipleData(stakeTokenContracts, 'balanceOf', poolAddresseArgs)
  const endBlocks = useMultipleContractSingleData(poolAddresses, STACKING_GEMS_INTERFACE, 'endBlock')
  const rewardPerBlocks = useMultipleContractSingleData(poolAddresses, STACKING_GEMS_INTERFACE, 'rewardPerBlock')

  return useMemo(() => {
    if (!chainId || !latestBlockNumber) return []

    return poolAddresses.reduce<GemStakingInfo[]>((memo, poolAddress, index) => {
      // these two are dependent on account
      const userInfoState = userInfos[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const endBlockState = endBlocks[index]
      const rewardPerBlockState = rewardPerBlocks[index]

      if (
        // these may be undefined if not logged in
        !userInfoState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        endBlockState &&
        !endBlockState.loading &&
        rewardPerBlockState &&
        !rewardPerBlockState.loading
      ) {
        if (
          userInfoState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          endBlockState.error ||
          rewardPerBlockState.error
        ) {
          console.error('Failed to load gem staking info')
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
        const endBlock = endBlockState?.result?.[0] ?? 0
        const remainingAmount = new TokenAmount(
          earnToken,
          JSBI.multiply(
            JSBI.BigInt(rewardPerBlockState?.result?.[0] ?? 0),
            latestBlockNumber >= endBlock ? JSBI.BigInt(0) : JSBI.BigInt(endBlock - latestBlockNumber)
          )
        )

        memo.push({
          poolAddress: poolAddress,
          poolId: info[index].poolId,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          earnedAmount: earnedAmount,
          isActive: info[index].isActive,
          projectLink: info[index].projectLink,
          remainingAmount: remainingAmount,
          startTime: info[index].startTime ?? 0
        })
      }
      return memo
    }, [])
  }, [userInfos, chainId, earnedAmounts, info, totalSupplies])
}
