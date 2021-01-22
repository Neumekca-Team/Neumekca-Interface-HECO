import React, { useCallback, useState, useEffect } from 'react'
import axios from 'axios'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import Countdown from 'react-countdown'
import { FlatCard, SubPressedCard } from '../../components/Card'
import { JSBI } from '@neumekca/neumekca-sdk'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE, ExternalLink } from '../../theme'
import { NFT_BASE_URL, BIG_INT_ZERO } from '../../constants'
import { AutoRow, RowBetween } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import { ButtonPrimary, ButtonEmpty } from '../../components/Button'
import { useDividendStakingInfo } from '../../state/dividend/hooks'
import { useNarSupplyInfo } from '../../state/stake/hooks'
import StakingModal from '../../components/dividend/StakingModal'
import UnstakingModal from '../../components/dividend/UnstakingModal'
import ClaimRewardModal from '../../components/dividend/ClaimRewardModal'
import UpdateBuffRateModal from '../../components/dividend/UpdateBuffRateModal'
import StakingRuneModal from '../../components/nft/StakingRuneModal'
import UnstakingRuneModal from '../../components/nft/UnstakingRuneModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import CountUp from 'react-countup'
import usePrevious from '../../hooks/usePrevious'
import { NftInfo } from '../../state/nft/hooks'

import GEMToken from '../../assets/images/gem.png'
import NARToken from '../../assets/images/logo.png'

const PageWrapper = styled(AutoColumn)`

  width: 100%;
`

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
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

const StyledDataCard = styled(DataCard) <{ showBackground?: any }>`
  z-index: 2;
  border-radius: 5px;;

`

const StyledBottomCard = styled(DataCard) <{ dim: any }>`

  border: 1px solid #fff;
  padding-bottom: 18px;
  padding-top: 18px;
  border-radius: 5px;
  z-index: 1;
  padding-left: 20px;
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  border-radius: 5px;;
  z-index: 1;
`

const GEMImage = styled.img`
  width: 24px;
  margin-right: 8px;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

const TokenImage = styled.img`
  width: 28px;
  margin-right: 8px;
`

const RuneSlot = styled.div`
  width: 72px;
  height: 72px;
  padding: 0px;
  margin-right: 16px;
  box-shadow: 2px 2px 4px ${({ theme }) => theme.shadowColor1}, -2px -2px 4px ${({ theme }) => theme.shadowColor2};
  border: 1px solid ${({ theme }) => theme.bg2};
  :hover {
    cursor: pointer;
  }

  animation: shadow-red 5s infinite;
  @keyframes shadow-red {
    50% {box-shadow: 10px 20px 30px red;}
  }
`


const RuneImage = styled.img<{ dim: any }>`
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
`

interface showStakingRuneProps {
  isOpen: boolean
  type?: Number
}

interface showUnstakingRuneProps {
  isOpen: boolean
  nftInfo?: NftInfo
}

export default function Dividend() {
  const { account, chainId } = useActiveWeb3React()

  const stakingInfo = useDividendStakingInfo()?.[0]
  const narSupplyInfo = useNarSupplyInfo()

  const countUpDividend = narSupplyInfo?.dividend?.toFixed(0) ?? '0'
  const countUpDividenPrevious = usePrevious(countUpDividend) ?? '0'

  // detect existing unstaked Token position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [showUpdateBuffRateModal, setShowUpdateBuffRateModal] = useState(false)
  const [showStakingRuneModal, setShowStakingRuneModal] = useState<showStakingRuneProps>({
    isOpen: false,
    type: 1
  })
  const [showUnstakingRuneModal, setShowUnstakingRuneModal] = useState<showUnstakingRuneProps>({
    isOpen: false,
    nftInfo: undefined
  })

  const [woreRuneInfos, setWoreRuneInfos] = useState<NftInfo[]>()

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
      const res = await axios.get<NftInfo[]>(
        `${NFT_BASE_URL[chainId]}/list?${requests.map(e => 'ids[]=' + e + '&').join('')}`
      )
      setWoreRuneInfos(res.data.map(e => e))
    }

    if (requests.length !== 0) {
      fetchMyNft()
    } else {
      setWoreRuneInfos([])
    }
  }, [stakingInfo])

  return (

    <PageWrapper gap="lg" justify="center">
      <FlatCard style={{ padding: 16 }}>
        <SubPressedCard style={{ padding: 16 }}>
          <AutoColumn>
            <AutoRow marginBottom={16}>
              <TokenImage src={NARToken} />
              <TYPE.body fontSize={36} fontWeight={500}>
                Staking ZERO tokens
              </TYPE.body>
            </AutoRow>
            <TYPE.black>
              For ZERO holders, You can stake ZERO to earn more ZERO from ZERO Dividend pool on this page. And then you also
              can get SNOW to stake more.
            </TYPE.black>
          </AutoColumn>
        </SubPressedCard>
      </FlatCard>

      <RowBetween style={{ gap: '24px' }}>
        <AutoRow>
          <GEMImage src={GEMToken} />
          <TYPE.mediumHeader style={{ margin: 0, color: 'white' }}>Dividend Pool</TYPE.mediumHeader>
        </AutoRow>
        <TYPE.subHeader style={{ margin: 0, color: 'white' }}>
          {stakingInfo?.periodFinish && <Countdown date={stakingInfo?.periodFinish ?? 0} />}
        </TYPE.subHeader>
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
            <TYPE.white style={{ margin: 0, color: 'white' }}>Total Dividends</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              <CountUp
                key={countUpDividend}
                decimals={0}
                start={parseFloat(countUpDividenPrevious)}
                end={parseFloat(countUpDividend)}
                separator={','}
                duration={1}
              />
              {' ZERO'}
            </TYPE.white>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0, color: 'white' }}>Pool Rate</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              {stakingInfo?.totalRewardRate
                ?.multiply((60 * 60 * 24 * 7).toString())
                ?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
              {' ZERO / week'}
            </TYPE.white>
          </AutoColumn>
        </PoolData>
      </DataRow>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <RowBetween>
              <TYPE.white style={{ margin: 0, color: 'white' }}>Your CHRONOS INJECTED</TYPE.white>
              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) &&
                stakingInfo?.userInfoTimeStamp &&
                (!isMaxBuffRate ? (
                  <Countdown date={stakingInfo.userInfoTimeStamp + 86400000}>
                    <ButtonPrimary
                      padding="2px 0"
                      borderRadius="0px"
                      width="128px"
                      fontSize="0.8rem"
                      color="white"
                      onClick={() => setShowUpdateBuffRateModal(true)}
                    >
                      Update CHRONOS INJECTED
                    </ButtonPrimary>
                  </Countdown>
                ) : (
                    <TYPE.white>MAX</TYPE.white>
                  ))}
            </RowBetween>
            <TYPE.white fontSize={24} fontWeight={500}>
              {userBuffRate?.toSignificant(6) ?? '-'}
            </TYPE.white>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0, color: 'white' }}>Your NULLSKILLS</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500} color='white'>
              {stakingInfo?.narPower?.toSignificant(6) ?? '-'}
              {' NULLSKILLS'}
            </TYPE.white>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userTokenUnstaked={userLiquidityUnstaked}
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
        </>
      )}
      <DataRow>
        <StyledDataCard disabled={disableTop} showBackground={!showAddLiquidityButton}>
          <CardSection>
            {/* <CardBGImage desaturate />
              <CardNoise /> */}
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Your ZERO deposits</TYPE.white>
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.white fontSize={36} fontWeight={600}>
                  {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                </TYPE.white>
                <TYPE.white>ZERO</TYPE.white>
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
                <TYPE.white>Your pending ZERO</TYPE.white>
              </div>
              {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                <ButtonEmpty
                  padding="8px"
                  borderRadius="8px"
                  width="fit-content"
                  color='white'
                  onClick={() => setShowClaimRewardModal(true)}
                >
                  Harvest
                </ButtonEmpty>
              )}
            </RowBetween>
            <RowBetween style={{ alignItems: 'baseline' }}>
              <TYPE.largeHeader fontSize={36} fontWeight={600} color='white'>
                <CountUp
                  key={countUpAmount}
                  decimals={4}
                  start={parseFloat(countUpAmountPrevious)}
                  end={parseFloat(countUpAmount)}
                  separator={','}
                  duration={1}
                />
              </TYPE.largeHeader>
              <TYPE.white fontSize={16} fontWeight={500} >
                <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                  ⚡
                  </span>
                {stakingInfo?.rewardRate
                  ?.multiply((60 * 60 * 24 * 7).toString())
                  ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
                {' ZERO / week'}
              </TYPE.white>
            </RowBetween>
          </AutoColumn>
        </StyledBottomCard>
      </DataRow>
      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
        </BottomSection>

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
                        <TYPE.white fontSize={12}>MAX</TYPE.white>
                      </AutoColumn>
                    )}
                </RuneSlot>
              </AutoRow>
            </AutoColumn>
          </PoolData>
        </DataRow>

        <TYPE.white style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          CHRONOS INJECTED depends on the staked days. It starts at 14 when staking and increases by 49% per day until the
          MAXIMUM CHRONOS INJECTED. And reset to 14 when harvesting ZERO tokens or unstacking ZERO tokens. Learn more{' '}
          <a href="https://neumekca.city/docs/" target="_blank">
            here
          </a>
        </TYPE.white>
        {/* <TYPE.white style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ✨
          </span>
          Estimated Harvest is a close benchmark of how much ZERO you should receive per week prior to any burns. True
          harvest relies on your NULLSKILLS and CHRONOS INJECTED, learn more{' '}
          <a href="https://neumekca.city/docs/" target="_blank">
            here
          </a>
        </TYPE.white> */}

        {!showAddLiquidityButton && (
          <DataRow>
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              width="160px"
              marginBottom="8px"
              color = 'white'
              onClick={handleDepositClick}
            >
              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Stake' : 'Stake ZERO Tokens'}
            </ButtonPrimary>

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  color = 'white'
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
          <TYPE.white>{userLiquidityUnstaked.toSignificant(6)} ZERO tokens available</TYPE.white>
        )}
      </PositionInfo>
    </PageWrapper>


  )
}
