import React, { useCallback, useState,useEffect } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import Countdown from 'react-countdown'
import { Link } from 'react-router-dom'
import { NftInfo } from '../../state/nft/hooks'
import { JSBI } from '@neumekca/neumekca-sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'
import StakingRuneModal from '../../components/nft/StakingFarmRuneModal'
import UnstakingRuneModal from '../../components/nft/UnstakingFarmRuneModal'
import Row, { RowBetween, RowEvenly, RowAround, AutoRow } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { ButtonPrimary, ButtonEmpty } from '../../components/Button'
import StakingModal from '../../components/earn/StakingModal'
import { useStakingInfoV2 } from '../../state/stake/hooks'
import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import UpdateBuffRateModal from '../../components/earn/UpdateBuffRateModal'
import ReinvestModal from '../../components/earn/ReinvestModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import CountUp from 'react-countup'
import axios from 'axios'
import { currencyId } from '../../utils/currencyId'
import usePrevious from '../../hooks/usePrevious'
// import useUSDCPrice from '../../utils/useUSDCPrice'
import { BIG_INT_ZERO } from '../../constants'
import { NFT_BASE_URL } from '../../constants'

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
  box-shadow: inset 2px 2px 4px ${({ theme }) => theme.shadowColor1},
    inset -2px -2px 4px ${({ theme }) => theme.shadowColor2};
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
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

const GaugeCard = styled.div<{ bg: 1 | 2 | 3 }>`
  overflow: hidden;
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 4px;
  font-size: 0.875rem;
  font-weight: 700;
  background: ${({ theme, bg }) => (bg === 1 ? theme.primary3 : bg === 2 ? theme.primary4 : theme.primary5)};
`

const RuneSlot = styled.div`
  width: 72px;
  height: 105px;
  padding: 0px;
  margin-right: 16px;
  box-shadow: 2px 2px 4px ${({ theme }) => theme.shadowColor1}, -2px -2px 4px ${({ theme }) => theme.shadowColor2};
  border: 1px solid ${({ theme }) => theme.bg2};
  :hover {
    cursor: pointer;
  }

  animation: shadow-red 5s infinite;
  @keyframes shadow-red {
    50% {
      box-shadow: 10px 20px 30px red;
    }
  }
`

const RuneImage = styled.img<{ dim: any }>`
  width: 100%;

`

interface showStakingRuneProps {
  isOpen: boolean
  type?: number
}

interface showUnstakingRuneProps {
  isOpen: boolean
  nftInfo?: NftInfo
}

export default function ManageV2({
  match: {
    params: { poolId, currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ poolId: string; currencyIdA: string; currencyIdB: string }>) {
  const { account, chainId } = useActiveWeb3React()

  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  console.log(poolId)
  const stakingInfo = useStakingInfoV2(Number(poolId))?.[0]
  console.log(stakingInfo)
  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [showUpdateBuffRateModal, setShowUpdateBuffRateModal] = useState(false)
  const [showReinvestModal, setShowReinvestModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const userBuffRate = stakingInfo?.narPower?.divide(stakingInfo?.stakedAmount ?? JSBI.BigInt(1))
  const userBuffDecimal = userBuffRate?.multiply(JSBI.BigInt(10 ** 3))
  const [woreRuneInfos, setWoreRuneInfos] = useState<NftInfo[]>()
  const [showStakingRuneModal, setShowStakingRuneModal] = useState<showStakingRuneProps>({
    isOpen: false,
    type: 1
  })
  const [showUnstakingRuneModal, setShowUnstakingRuneModal] = useState<showUnstakingRuneProps>({
    isOpen: false,
    nftInfo: undefined
  })
  const isMaxBuffRate =
    userBuffDecimal?.greaterThan(stakingInfo?.userMaxBuffRate) || userBuffDecimal?.equalTo(stakingInfo?.userMaxBuffRate)

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  useEffect(() => {
    if (!stakingInfo || !chainId) return

    const requests =
      stakingInfo.rune1 !== 0 && stakingInfo.rune2 !== 0
        ? [stakingInfo.rune1, stakingInfo.rune2]
        : stakingInfo.rune1 !== 0
          ? [stakingInfo.rune1]
          : stakingInfo.rune2 !== 0
            ? [stakingInfo.rune2]
            : []

    const fetchMyNft = async () => {
      var lst = []
      await Promise.all(
          requests.map(async (item, i) => {
            const res = await axios.get<NftInfo>(`${NFT_BASE_URL[chainId]}null-card/${item}`)
            lst.push(res.data)
          })
          
        )
        setWoreRuneInfos(lst)
    }

    if (requests.length !== 0) {
      fetchMyNft()
    } else {
      setWoreRuneInfos([])
    }
  }, [stakingInfo])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {currencyA?.toDisplayableSymbol(chainId)}-{currencyB?.symbol} Liquidity Mining
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
                  <Countdown date={stakingInfo.userInfoTimeStamp + 86400000}>
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
          <GaugeCard bg={3}>MAX CHRONOS 179</GaugeCard>
          <GaugeCard bg={2}>MAX CHRONOS 179 to 31</GaugeCard>
          <GaugeCard bg={1}>MAX CHRONOS 31</GaugeCard>
        </RowAround>
        <RowEvenly>
          <TYPE.body style={{ marginLeft: 32 }}>
            {stakingInfo?.commonMin?.toFixed(2) ?? '-'}
            {'HLP'}
          </TYPE.body>
          <TYPE.body style={{ marginRight: 32 }}>
            {stakingInfo?.commonMax?.toFixed(2) ?? '-'}
            {'HLP'}
          </TYPE.body>
        </RowEvenly>
      </GaugeWrapper>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
                  <AutoRow>
                  <RuneSlot
                onClick={() =>
                  stakingInfo?.rune1 !== 0
                    ? setShowUnstakingRuneModal({
                        isOpen: true,
                        nftInfo: woreRuneInfos?.filter(e => e.types === 1)[0]
                      })
                    : setShowStakingRuneModal({ isOpen: true, type: 1 })
                }
              >
                {woreRuneInfos && stakingInfo?.rune1 !== 0 ? (
                  <RuneImage
                    src={woreRuneInfos.filter(e => e.types === 1)[0].token_image}
                    dim={Date.now() - stakingInfo.rune1TimeStamp < 86400000}
                  />
                ) : (
                  <AutoColumn justify="center">
                    <TYPE.white style={{ marginTop: 6 }}>+</TYPE.white>
                    <TYPE.white fontSize={12}>CHRONOS</TYPE.white>
                    <TYPE.white fontSize={12}>INIT</TYPE.white>
                  </AutoColumn>
                )}
              </RuneSlot>
              <RuneSlot
                onClick={() =>
                  stakingInfo?.rune2 !== 0
                    ? setShowUnstakingRuneModal({
                        isOpen: true,
                        nftInfo: woreRuneInfos?.filter(e => e.types === 2)[0]
                      })
                    : setShowStakingRuneModal({ isOpen: true, type: 2 })
                }
              >
                {woreRuneInfos && stakingInfo?.rune2 !== 0 ? (
                  <RuneImage
                    src={woreRuneInfos.filter(e => e.types === 2)[0]?.token_image ?? undefined}
                    dim={Date.now() - stakingInfo.rune2TimeStamp < 86400000}
                  />
                ) : (
                  <AutoColumn justify="center">
                    <TYPE.white style={{ marginTop: 6 }}>+</TYPE.white>
                    <TYPE.white fontSize={12}>CHRONOS</TYPE.white>
                    <TYPE.white fontSize={12}>STEP</TYPE.white>
                  </AutoColumn>
                )}
              </RuneSlot>
              <RuneSlot
                onClick={() =>
                  stakingInfo?.rune3 !== 0
                    ? setShowUnstakingRuneModal({
                        isOpen: true,
                        nftInfo: woreRuneInfos?.filter(e => e.types === 3)[0]
                      })
                    : setShowStakingRuneModal({ isOpen: true, type: 3 })
                }
              >
                {woreRuneInfos && stakingInfo?.rune3 !== 0 ? (
                  <RuneImage
                    src={woreRuneInfos.filter(e => e.types === 3)[0]?.token_image ?? undefined}
                    dim={Date.now() - stakingInfo.rune3TimeStamp < 86400000}
                  />
                ) : (
                  <AutoColumn justify="center">
                    <TYPE.white style={{ marginTop: 6 }}>+</TYPE.white>
                    <TYPE.white fontSize={12}>CHRONOS</TYPE.white>
                    <TYPE.white fontSize={12}>MAX</TYPE.white>
                  </AutoColumn>
                )}
              </RuneSlot>
           
                  </AutoRow>

          </AutoColumn>
         
      
     
        </PoolData>
        <PoolData style={{height: '140px'}}>
        <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Your ZEROPOWER</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo?.narPower?.toSignificant(6) ?? '-'}
              {' ZEROPOWER'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get HLP Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`HLP tokens are required. Once you've added liquidity to the ${currencyA?.toDisplayableSymbol(
                    chainId
                  )}-${currencyB?.symbol} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <a
              className='btn btn-primary'
                target = '_blank'
                href='https://ht.mdex.com/#/add/0x9ec4c0f72f068731f439351193d2060b7dc684b5/HT'
              >
                {`Add ${currencyA?.toDisplayableSymbol(chainId)}-${currencyB?.symbol} liquidity`}
              </a>
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
            isEmergencyWithdraw={false}
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
          <StakingRuneModal
            isOpen={showStakingRuneModal.isOpen}
            onDismiss={() => setShowStakingRuneModal({ isOpen: false, type: showStakingRuneModal.type })}
            stakingInfo={stakingInfo}
            runeType={showStakingRuneModal.type}
          />
          <UnstakingRuneModal
            isOpen={showUnstakingRuneModal.isOpen}
            onDismiss={() => setShowUnstakingRuneModal({ isOpen: false, nftInfo: showUnstakingRuneModal.nftInfo })}
            onStakeNew={() => setShowStakingRuneModal({ isOpen: true, type: showUnstakingRuneModal.nftInfo?.types })}
            stakingInfo={stakingInfo}
            nftInfo={showUnstakingRuneModal.nftInfo}
          />
          <ReinvestModal
            isOpen={showReinvestModal}
            onDismiss={() => setShowReinvestModal(false)}
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
                    HSwap LP Token {currencyA?.toDisplayableSymbol(chainId)}-{currencyB?.symbol}
                  </TYPE.black>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard style={{margin : '5px 0px 0px 0px'}}
            dim={!(stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw))}
          >
     
            {/* <CardBGImage desaturate />
            <CardNoise /> */}
            <AutoColumn gap="sm" >
              <RowBetween>
                <Row width="100%">
                  <TYPE.black>Your pending ZERO</TYPE.black>
                </Row>
                {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                  <AutoRow justify="flex-end">
                    <ButtonEmpty
                      padding="8px"
                      borderRadius="8px"
                      width="fit-content"
                      onClick={() => setShowClaimRewardModal(true)}
                    >
                      Harvest
                    </ButtonEmpty>
                    |
                    <ButtonEmpty
                      padding="8px"
                      borderRadius="8px"
                      width="fit-content"
                      onClick={() => setShowReinvestModal(true)}
                    >
                      Reinvest
                    </ButtonEmpty>
                  </AutoRow>
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
          CHRONOS INJECTED depends on the staked days. It starts at 14 when staking and increases by 49% per day until
          the MAXIMUM CHRONOS INJECTED. And reset to 14 when harvesting ZERO tokens or unstacking HLP tokens. Learn more{' '}
          <a href="https://neumekca.city/docs/" target="_blank">
            here
          </a>
        </TYPE.main>
        {/* <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ✨
          </span>
          Estimated Harvest is a close benchmark of how much ZERO you should receive per week prior to any burns. True
          harvest relies on your ZEROPOWER and CHRONOS INJECTED, learn more{' '}
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
              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Stake' : 'Stake HLP Tokens'}
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
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} HLP tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
