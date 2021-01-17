import React, { useState } from 'react'
import styled from 'styled-components'
import Countdown from 'react-countdown'
import { Info } from 'react-feather'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween } from '../../components/Row'
import CountUp from 'react-countup'
import StakingModal from './StakingModal'
import UnstakingModal from './UnstakingModal'
import ClaimRewardModal from './ClaimRewardModal'
import CurrencyLogo from '../CurrencyLogo'
import { ExternalLink } from '../../theme'

import { GemStakingInfo } from '../../state/gempools/hooks'
import usePrevious from '../../hooks/usePrevious'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'

const GridCard = styled(Box)`
  float: left;
  width: 33.33%;
  padding: 0px 8px 16px 8px;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
  border-radius: 5px;;
`

const GridCardContent = styled(AutoColumn)<{ isActive: boolean }>`
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  padding: 16px;
  border-radius: 5px;;
  color: ${({ theme, isActive }) => (isActive ? theme.text1 : theme.text3)};
`

const Label = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  position: absolute;
  right: 2px;
  top: 18px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
`

const ProjectLabel = styled(Label)`
  color: ${({ theme }) => theme.green1};
  text-shadow: 0px 0px 8px ${({ theme }) => theme.green1};
`

const InfoItem = styled(ExternalLink)`
  color: ${({ theme }) => theme.green1};
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  position: absolute;
  right: 2px;
  top: 18px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
  :hover {
    cursor: pointer;
    text-decoration: none;
  }
`

const ViewProjectSite = styled(ExternalLink)`
  font-size: 11px;
  margin-top: 14px;
  :hover {
    cursor: pointer;
    text-decoration: none;
  }
`

export default function PoolCard({ stakingInfo }: { stakingInfo: GemStakingInfo }) {
  const { account, chainId } = useActiveWeb3React()

  const userTokenUnstaked = useTokenBalance(account ?? undefined, stakingInfo.stakedAmount.token)
  const showStakeButton = Boolean(stakingInfo.stakedAmount.equalTo('0'))
  const showAddStakeButton = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  const countUpAmount = stakingInfo.earnedAmount.toFixed(6)
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'
  const countUpStakedAmount = stakingInfo.stakedAmount.toFixed(6)
  const countUpStakedAmountPrevious = usePrevious(countUpStakedAmount) ?? '0'
  const countUpTotalStakedAmount = stakingInfo.totalStakedAmount.toFixed(6)
  const countUpTotalStakedAmountPrevious = usePrevious(countUpTotalStakedAmount) ?? '0'
  const countUpRemainingAmount = stakingInfo.remainingAmount.toFixed(6)
  const countUpRemainingAmountPrevious = usePrevious(countUpRemainingAmount) ?? '0'

  return (
    <GridCard>
      <GridCardContent isActive={stakingInfo.isActive}>
        <TYPE.largeHeader marginBottom={16}>{`${stakingInfo.earnedAmount.token.symbol} Pool`}</TYPE.largeHeader>

        {!stakingInfo.isActive ? (
          <Label>Ended</Label>
        ) : (
          <InfoItem href={stakingInfo.projectLink} target="_blank">
            <AutoRow>
              <div style={{ marginRight: 4 }}>Info</div>
              <Info size={14} />
            </AutoRow>
          </InfoItem>
        )}

        <RowBetween>
          <CurrencyLogo currency={stakingInfo.earnedAmount.currency} size="64px" />
          <ButtonPrimary
            onClick={() => setShowClaimRewardModal(true)}
            disabled={!stakingInfo.earnedAmount.greaterThan('0') || !stakingInfo.isActive}
            padding="2px 0"
            borderRadius="0px"
            width="56px"
            fontSize="0.8rem"
          >
            Harvest
          </ButtonPrimary>
        </RowBetween>

        <TYPE.largeHeader marginTop={16}>
          <CountUp
            key={countUpAmount}
            decimals={6}
            start={parseFloat(countUpAmountPrevious)}
            end={parseFloat(countUpAmount)}
            separator={','}
            duration={1}
          />
        </TYPE.largeHeader>
        <TYPE.black color={'primary1'} marginBottom={16}>{stakingInfo.earnedAmount.token.symbol} earned</TYPE.black>

        <Countdown date={stakingInfo.startTime ?? 0}>
          <RowBetween>
            {showStakeButton ? (
              <ButtonPrimary disabled={!stakingInfo.isActive} onClick={() => setShowStakingModal(true)}>
                Staking {stakingInfo.stakedAmount.token.symbol}
              </ButtonPrimary>
            ) : (
              <ButtonPrimary onClick={() => setShowUnstakingModal(true)}>Unstaking</ButtonPrimary>
            )}
            {showAddStakeButton && (
              <ButtonPrimary
                disabled={!stakingInfo.isActive}
                onClick={() => setShowStakingModal(true)}
                width="36px"
                marginLeft="8px"
              >
                +
              </ButtonPrimary>
            )}
          </RowBetween>
        </Countdown>

        <RowBetween marginTop={16}>
          <TYPE.black>Your Stake:</TYPE.black>
          <TYPE.black>
            <CountUp
              key={countUpStakedAmount}
              decimals={2}
              start={parseFloat(countUpStakedAmountPrevious)}
              end={parseFloat(countUpStakedAmount)}
              separator={','}
              duration={1}
            />
          </TYPE.black>
        </RowBetween>
        <RowBetween style={{ marginTop: 8 }}>
          <TYPE.black>Total Stake:</TYPE.black>
          <TYPE.black>
            <CountUp
              key={countUpTotalStakedAmount}
              decimals={2}
              start={parseFloat(countUpTotalStakedAmountPrevious)}
              end={parseFloat(countUpTotalStakedAmount)}
              separator={','}
              duration={1}
            />
          </TYPE.black>
        </RowBetween>
        {stakingInfo.isActive ? (
          <RowBetween style={{ marginTop: 8 }}>
            <TYPE.black>End:</TYPE.black>
            <TYPE.black>
              <CountUp
                key={countUpRemainingAmount}
                decimals={2}
                start={parseFloat(countUpRemainingAmountPrevious)}
                end={parseFloat(countUpRemainingAmount)}
                separator={','}
                duration={1}
              />
            </TYPE.black>
          </RowBetween>
        ) : (
          <ViewProjectSite href={stakingInfo.projectLink} target="_blank">
            {'View project site >>'}
          </ViewProjectSite>
        )}

        {stakingInfo && (
          <>
            <StakingModal
              isOpen={showStakingModal}
              onDismiss={() => setShowStakingModal(false)}
              stakingInfo={stakingInfo}
              userTokenUnstaked={userTokenUnstaked}
            />
            <UnstakingModal
              isOpen={showUnstakingModal}
              onDismiss={() => setShowUnstakingModal(false)}
              stakingInfo={stakingInfo}
            />
            <ClaimRewardModal
              isOpen={showClaimRewardModal}
              onDismiss={() => setShowClaimRewardModal(false)}
              stakingInfo={stakingInfo}
            />
          </>
        )}
      </GridCardContent>
    </GridCard>
  )
}
