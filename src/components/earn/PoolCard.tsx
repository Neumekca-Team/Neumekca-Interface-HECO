import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween, AutoRow } from '../Row'
import styled, { keyframes } from 'styled-components'
import Countdown from 'react-countdown'
import { TYPE, StyledInternalLink } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
import { ETHER, JSBI, TokenAmount } from '@bscswap/sdk'
import { ButtonPrimary } from '../Button'
import { StakingInfo } from '../../state/stake/hooks'
// import { useColor } from '../../hooks/useColor'
import { currencyId } from '../../utils/currencyId'
import { Break, CardNoise, CardBGImage } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { useTotalSupply } from '../../data/TotalSupply'
import { usePair } from '../../data/Reserves'
import useBUSDPrice from '../../utils/useBUSDPrice'
import { NAR } from '../../constants'
import { useActiveWeb3React } from '../../hooks'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 210px 1fr 120px;
  grid-gap: 0px;
  border-radius: 5px;;
  align-items: center;
  justify-contents: center;
  padding: 1.2rem;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-direction: column;
  `};
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  grid-gap: 0px;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  `};
`

const StatContainer = styled(AutoColumn)`
  font-size: 14px;
  margin-right: 32px;  
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 1rem 0;
    width: 100%;
  `};
`

const APYSection = styled(AutoColumn)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: right;
  `};
`

export default function PoolCard({ stakingInfo, poolType }: { stakingInfo: StakingInfo; poolType: string }) {
  const { account, chainId } = useActiveWeb3React()

  const nar = chainId ? NAR[chainId] : undefined
  const [, narPair] = usePair(...stakingInfo.narPair)

  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]

  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  let token = currency0 === ETHER ? token1 : token0
  let WETH = currency0 === ETHER ? token0 : token1
  if (currency0 !== ETHER && currency1 !== ETHER) {
    token = currency0 === nar ? token1 : token0
    WETH = currency0 === nar ? token0 : token1
  }

  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo.stakedAmount.token)
  const [, stakingTokenPair] = usePair(...stakingInfo.tokens)

  // let returnOverMonth: Percent = new Percent('0')
  let valueOfTotalStakedAmountInWETH: TokenAmount | undefined
  let apyInThisWeek: TokenAmount | undefined
  if (totalSupplyOfStakingToken && stakingTokenPair) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInWETH = new TokenAmount(
      WETH,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(WETH).raw),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw
      )
    )

    apyInThisWeek = new TokenAmount(
      WETH,
      JSBI.greaterThan(valueOfTotalStakedAmountInWETH.raw, JSBI.BigInt(0))
        ? JSBI.multiply(
            JSBI.divide(
              JSBI.multiply(
                JSBI.multiply(stakingInfo.totalRewardRate.raw, JSBI.BigInt(60 * 60 * 24 * 365)),
                JSBI.divide(narPair.reserveOf(WETH).raw, JSBI.BigInt(narPair.reserveOf(nar).toFixed(0)))
              ),
              valueOfTotalStakedAmountInWETH.raw
            ),
            JSBI.BigInt(100)
          )
        : JSBI.BigInt(0)
    )
  }

  // get the USD value of staked WETH
  const USDPrice = useBUSDPrice(WETH)
  const valueOfTotalStakedAmountInBUSD =
    valueOfTotalStakedAmountInWETH && USDPrice?.quote(valueOfTotalStakedAmountInWETH)

  return (
    <Wrapper>
      <TopSection>
        <AutoColumn>
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={32} overlap={false} />
          <TYPE.black fontWeight={600} fontSize={16} style={{ marginTop: '8px' }}>
            {currency0.symbol}/{currency1.symbol}
            {poolType === 'normal'
              ? ''
              : stakingInfo.poolId === 0
              ? ' HUGE'
              : stakingInfo.poolId === 1
              ? ' COMMON'
              : ' TINY'}
          </TYPE.black>
        </AutoColumn>

        <APYSection>
          <TYPE.black fontSize={24}>{`${apyInThisWeek?.toFixed(2, { groupSeparator: ',' }) ?? '-'}%`}</TYPE.black>
          <TYPE.darkGray fontSize={14}>APY</TYPE.darkGray>
        </APYSection>
      </TopSection>

      <StatContainer gap="sm">
        <RowBetween>
          <TYPE.darkGray>Total staked </TYPE.darkGray>
          <TYPE.darkGray>
            {valueOfTotalStakedAmountInBUSD
              ? `$${valueOfTotalStakedAmountInBUSD.toFixed(0, { groupSeparator: ',' })}`
              : `${valueOfTotalStakedAmountInWETH?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} BNB`}
          </TYPE.darkGray>
        </RowBetween>
        <RowBetween>
          <TYPE.darkGray>Pool rate </TYPE.darkGray>
          <TYPE.darkGray>{`${stakingInfo.totalRewardRate
            ?.multiply(`${60 * 60 * 24 * 7}`)
            ?.toFixed(0, { groupSeparator: ',' })} ZERO / week`}</TYPE.darkGray>
        </RowBetween>
        <RowBetween>
          <TYPE.darkGray> Halving time </TYPE.darkGray>
          <TYPE.darkGray>
            <Countdown date={stakingInfo?.periodFinish ?? 0} />
          </TYPE.darkGray>
        </RowBetween>
      </StatContainer>

      <StyledInternalLink
        style={{ width: '100%' }}
        to={
          poolType === 'normal'
            ? `/page/ZERO/${stakingInfo.poolId}/${currencyId(currency0)}/${currencyId(currency1)}`
            : `/page/capped/${stakingInfo.poolId}/${currencyId(currency0)}/${currencyId(currency1)}`
        }
      >
        <ButtonPrimary padding="8px" borderRadius="8px">
          {isStaking ? 'Manage' : 'Stake'}
        </ButtonPrimary>
      </StyledInternalLink>
    </Wrapper>
  )
}
