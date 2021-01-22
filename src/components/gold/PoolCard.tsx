import React, { useState } from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../Column'
import { RowBetween } from '../../components/Row'
import CountUp from 'react-countup'
import StakingModal from '../../components/gold/StakingModal'
import UnstakingModal from '../../components/gold/UnstakingModal'
import ClaimRewardModal from './ClaimRewardModal'
import DoubleCurrencyLogo from '../DoubleLogo'
import Countdown from 'react-countdown'

import { ChainId, WETH } from '@neumekca/neumekca-sdk'
import { BLIQ, BLIQ_WETH } from '../../constants'
import { TicketStakingInfo } from '../../state/nft/hooks'
import usePrevious from '../../hooks/usePrevious'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'

const GridCard = styled(Box)`
  float: left;
  width: 33.33%;
  padding: 0px 8px 16px 8px;
  position: relative;
  border-radius: 5px;;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
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

const MultiplierLabel = styled(Label)`
  color: ${({ theme }) => theme.green1};
  text-shadow: 0px 0px 8px ${({ theme }) => theme.green1};
`

export default function PoolCard({ stakingInfo }: { stakingInfo: TicketStakingInfo }) {
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

  return (
    <GridCard>
      <GridCardContent isActive={stakingInfo.isActive}>
        <TYPE.largeHeader marginBottom={16}>{stakingInfo.stakedAmount.token.symbol}</TYPE.largeHeader>

        {!stakingInfo.isActive ? <Label>Ended</Label> : <MultiplierLabel>{stakingInfo.multiplier}X</MultiplierLabel>}

        <AutoColumn align="center" style={{ height: 72 }}>
          <DoubleCurrencyLogo
            currency0={
              stakingInfo.pairTokens.length > 0 ? stakingInfo.pairTokens[0] : stakingInfo.stakedAmount.currency
            }
            currency1={
              stakingInfo.pairTokens.length > 0 ? stakingInfo.pairTokens[1] : stakingInfo.stakedAmount.currency
            }
            size={64}
            // overlap={false}
          />
        </AutoColumn>

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
        <RowBetween>
          <TYPE.black color={'primary1'}>{stakingInfo.earnedAmount.token.symbol} earned</TYPE.black>
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

        <RowBetween marginTop={16}>
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

export function MockPoolCard() {
  return (
    <GridCard>
      <GridCardContent isActive={false}>
        <TYPE.largeHeader marginBottom={16}>{BLIQ_WETH.symbol}</TYPE.largeHeader>

        <Label>
          <Countdown date={1606575600000} />
        </Label>

        <AutoColumn align="center" style={{ height: 72 }}>
          <DoubleCurrencyLogo currency0={BLIQ} currency1={WETH[ChainId.BSC_MAINNET]} size={64} />
        </AutoColumn>

        <TYPE.largeHeader marginTop={16}>0.0000</TYPE.largeHeader>
        <RowBetween>
          <TYPE.black color={'primary1'}>0.0000 earned</TYPE.black>
          <ButtonPrimary
            onClick={() => {}}
            disabled={true}
            padding="2px 0"
            borderRadius="0px"
            width="56px"
            fontSize="0.8rem"
          >
            Harvest
          </ButtonPrimary>
        </RowBetween>

        <RowBetween marginTop={16}>
          <ButtonPrimary disabled={true} onClick={() => {}}>
            Staking {BLIQ_WETH.symbol}
          </ButtonPrimary>
        </RowBetween>

        <RowBetween marginTop={16}>
          <TYPE.black>Your Stake:</TYPE.black>
          <TYPE.black>0.00</TYPE.black>
        </RowBetween>
        <RowBetween style={{ marginTop: 8 }}>
          <TYPE.black>Total Stake:</TYPE.black>
          <TYPE.black>0.00</TYPE.black>
        </RowBetween>
      </GridCardContent>
    </GridCard>
  )
}
