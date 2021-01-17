import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import PoolCard from '../../components/earn/PoolCard'
import { RowBetween } from '../../components/Row'
import Loader from '../../components/Loader'
import { SelectPoolTabs } from '../../components/NavigationTabs'
import Countdown from 'react-countdown'
import { STAKING_REWARDS_CAPPED_INFO, useStakingInfoCapped } from '../../state/stake/hooks'
import { useActiveWeb3React } from '../../hooks'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`

export default function Capped() {
  const { chainId } = useActiveWeb3React()

  const stakingInfos = useStakingInfoCapped()

  const stakingRewardsExist = Boolean(
    typeof chainId === 'number' && (STAKING_REWARDS_CAPPED_INFO[chainId]?.length ?? 0) > 0
  )

  return (

  <PageWrapper gap="lg" justify="center">
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Participating pools</TYPE.mediumHeader>
        </DataRow>

        <SelectPoolTabs active={'capped'} />

        <Countdown date={1603720800000}>
          <PoolSection>
            {stakingRewardsExist && stakingInfos?.length === 0 ? (
              <Loader style={{ margin: 'auto' }} />
            ) : !stakingRewardsExist ? (
              'No active rewards'
            ) : (
              stakingInfos?.map(stakingInfo => {
                // need to sort by added liquidity here
                return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} poolType={'capped'} />
              })
            )}
          </PoolSection>
        </Countdown>
      </AutoColumn>
    </PageWrapper>

  )
}

