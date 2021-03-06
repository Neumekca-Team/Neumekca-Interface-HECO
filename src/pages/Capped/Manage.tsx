import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import Countdown from 'react-countdown'
import { Link } from 'react-router-dom'

import { JSBI } from '@neumekca/neumekca-sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween, RowEvenly, RowAround } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { ButtonPrimary, ButtonEmpty } from '../../components/Button'
import StakingModal from '../../components/earn/StakingModal'
import { useStakingInfoCapped } from '../../state/stake/hooks'
import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import UpdateBuffRateModal from '../../components/earn/UpdateBuffRateModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import CountUp from 'react-countup'

import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { currencyId } from '../../utils/currencyId'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
// import useUSDCPrice from '../../utils/useUSDCPrice'
import { BIG_INT_ZERO } from '../../constants'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 720px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  // border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)<{ showBackground?: any }>`
  z-index: 2;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 2px 2px 4px ${({ theme }) => theme.shadowColor1}, -2px -2px 4px ${({ theme }) => theme.shadowColor2};
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg1};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  box-shadow: inset 2px 2px 4px ${({ theme }) => theme.shadowColor1}, inset -2px -2px 4px ${({ theme }) => theme.shadowColor2};
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ed5fcf 0%, #000000 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

const GaugeWrapper = styled.div`
  width: 100%;
  > div:first-child {
    margin-bottom: 8px;
  }
`

const GaugeCard = styled.div<{ bg: 1 | 2 | 3 | 4 }>`
  overflow: hidden;
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 4px;
  font-size: 0.875rem;
  font-weight: 700;
  background: ${({ theme, bg }) =>
    bg === 1 ? theme.primary3 : bg === 2 ? theme.primary4 : bg === 3 ? theme.primary5 : theme.bg2};
`

export default function CappedManage({
  match: {
    params: { poolId, currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ poolId: string; currencyIdA: string; currencyIdB: string }>) {
  const { account, chainId } = useActiveWeb3React()

  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfo = useStakingInfoCapped(Number(poolId))?.[0]

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [showUpdateBuffRateModal, setShowUpdateBuffRateModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  // const token = currencyA === ETHER ? tokenB : tokenA
  // const WETH = currencyA === ETHER ? tokenA : tokenB

  // get WETH value of staked LP tokens
  // const totalSupplyOfStakingToken = useTotalSupply(stakingInfo?.stakedAmount?.token)
  // let valueOfTotalStakedAmountInWETH: TokenAmount | undefined
  // if (totalSupplyOfStakingToken && stakingTokenPair && stakingInfo && WETH) {
  //   // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
  //   valueOfTotalStakedAmountInWETH = new TokenAmount(
  //     WETH,
  //     JSBI.divide(
  //       JSBI.multiply(
  //         JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(WETH).raw),
  //         JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
  //       ),
  //       totalSupplyOfStakingToken.raw
  //     )
  //   )
  // }

  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const userBuffRate = stakingInfo?.narPower?.divide(stakingInfo?.stakedAmount ?? JSBI.BigInt(1))
  const isMaxBuffRate =
    userBuffRate?.greaterThan(stakingInfo?.userMaxBuffRate) || userBuffRate?.equalTo(stakingInfo?.userMaxBuffRate)

  const checkSegment = (segment: string): boolean => {
    let isSegment = false
    switch (Number(poolId)) {
      case 0:
        isSegment = segment === 'huge'
        break

      case 1:
        isSegment = segment === 'common'
        break

      case 2:
        isSegment = segment === 'tiny'
        break

      default:
        break
    }
    return isSegment
  }

  // get the USD value of staked WETH
  // const USDPrice = useUSDCPrice(WETH)
  // const valueOfTotalStakedAmountInUSDC =
  //   valueOfTotalStakedAmountInWETH && USDPrice?.quote(valueOfTotalStakedAmountInWETH)

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {currencyA?.toDisplayableSymbol(chainId)}-{currencyB?.toDisplayableSymbol(chainId)}
          {checkSegment('huge') ? ' HUGE' : checkSegment('common') ? ' COMMON' : ' TINY'}
        </TYPE.mediumHeader>
        <DoubleCurrencyLogo
          currency0={currencyA ?? undefined}
          currency1={currencyB ?? undefined}
          size={24}
          overlap={false}
          margin={true}
        />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        {/* <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total deposits</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {valueOfTotalStakedAmountInUSDC
                ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
                : `${valueOfTotalStakedAmountInWETH?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} ETH`}
            </TYPE.body>
          </AutoColumn>
        </PoolData> */}
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo?.totalRewardRate
                ?.multiply((60 * 60 * 24 * 7).toString())
                ?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
              {' ZERO / week'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <RowBetween>
              <TYPE.body style={{ margin: 0 }}>Your CHRONOS INJECTED</TYPE.body>
              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) &&
                stakingInfo?.userInfoTimeStamp &&
                (!isMaxBuffRate ? (
                  <Countdown date={stakingInfo.userInfoTimeStamp + 28800000}>
                    <ButtonPrimary
                      padding="2px 0"
                      borderRadius="0px"
                      width="128px"
                      fontSize="0.8rem"
                      onClick={() => setShowUpdateBuffRateModal(true)}
                    >
                      Update CHRONOS INJECTED
                    </ButtonPrimary>
                  </Countdown>
                ) : (
                  <TYPE.body>MAX</TYPE.body>
                ))}
            </RowBetween>
            <TYPE.body fontSize={24} fontWeight={500}>
              {userBuffRate?.toSignificant(6) ?? '-'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      <GaugeWrapper>
        <RowAround>
          <GaugeCard bg={checkSegment('tiny') ? 1 : 4}>TINY</GaugeCard>
          <GaugeCard bg={checkSegment('common') ? 1 : 4}>COMMON</GaugeCard>
          <GaugeCard bg={checkSegment('huge') ? 1 : 4}>HUGE</GaugeCard>
        </RowAround>
        <RowEvenly>
          <TYPE.body style={{ marginLeft: 32 }}>
            {stakingInfo?.commonMin?.toFixed(0) ?? '-'}
            {'JLP'}
          </TYPE.body>
          <TYPE.body style={{ marginRight: 32 }}>
            {stakingInfo?.commonMax?.toFixed(0) ?? '-'}
            {'JLP'}
          </TYPE.body>
        </RowEvenly>
      </GaugeWrapper>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Your NULLSKILLS</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo?.narPower?.toSignificant(6) ?? '-'}
              {' NULLSKILLS'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
        <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
          📌
        </span>
        {checkSegment('huge') && 'HUGE pool minimum 300 JLP, no maximum JLP'}
        {checkSegment('common') && 'COMMON pool minimum 30 JLP, maximum 299 JLP'}
        {checkSegment('tiny') && 'TINY pool no minimum LP, maximum 29 JLP'}
      </TYPE.main>

      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get JLP Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`JLP tokens are required. Once you've added liquidity to the ${currencyA?.toDisplayableSymbol(chainId)}-${currencyB?.toDisplayableSymbol(chainId)} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`/page/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`}
              >
                {`Add ${currencyA?.toDisplayableSymbol(chainId)}-${currencyB?.toDisplayableSymbol(chainId)} liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )}

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
            isEmergencyWithdraw={true}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
          <UpdateBuffRateModal
            isOpen={showUpdateBuffRateModal}
            onDismiss={() => setShowUpdateBuffRateModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} showBackground={!showAddLiquidityButton}>
            <CardSection>
              {/* <CardBGImage desaturate />
              <CardNoise /> */}
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.black fontWeight={600}>Your liquidity deposits</TYPE.black>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.black fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.black>
                  <TYPE.black>
                    JLP {currencyA?.toDisplayableSymbol(chainId)}-{currencyB?.toDisplayableSymbol(chainId)}
                  </TYPE.black>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard
            dim={!(stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw))}
          >
            {/* <CardBGImage desaturate />
            <CardNoise /> */}
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your pending ZERO</TYPE.black>
                </div>
                {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                  <ButtonEmpty
                    padding="8px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => setShowClaimRewardModal(true)}
                  >
                    Harvest
                  </ButtonEmpty>
                )}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={countUpAmount}
                    decimals={4}
                    start={parseFloat(countUpAmountPrevious)}
                    end={parseFloat(countUpAmount)}
                    separator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {stakingInfo?.rewardRate
                    ?.multiply((60 * 60 * 24 * 7).toString())
                    ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
                  {' ZERO / week'}
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          CHRONOS INJECTED depends on the staked days. It starts at 14 when staking and increases by 49% per day until the
          MAXIMUM CHRONOS INJECTED. And reset to 14 when harvesting ZERO tokens or unstacking JLP tokens. Learn more{' '}
          <a href="https://neumekca.city/docs/" target="_blank">
            here
            </a>
        </TYPE.main>
        {/* <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ✨
          </span>
          Estimated Harvest is a close benchmark of how much ZERO you should receive per week prior to any burns. True
          harvest relies on your NULLSKILLS and CHRONOS INJECTED, learn more{' '}
          <a href="https://docs.narwhalswap.org/liquidity-mining" target="_blank">
            here
          </a>
        </TYPE.main> */}

        {!showAddLiquidityButton && (
          <DataRow>
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              width="160px"
              marginBottom="8px"
              onClick={handleDepositClick}
            >
              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Stake' : 'Stake JLP Tokens'}
            </ButtonPrimary>

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  marginBottom="8px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  Unstake
                </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} JLP tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
