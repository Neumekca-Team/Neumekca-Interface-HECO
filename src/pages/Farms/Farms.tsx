import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import PoolCard from '../../components/earn/PoolCard'
import { RowBetween } from '../../components/Row'
import Loader from '../../components/Loader'
import {
  STAKING_REWARDS_INFO,
  STAKING_REWARDS_CAPPED_INFO,
  useStakingInfo,
  useStakingInfoCapped
} from '../../state/stake/hooks'
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


export default function Nar() {
  const { chainId } = useActiveWeb3React()

  const stakingInfos = useStakingInfo()
  const stakingCappedInfos = useStakingInfoCapped()

  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)
  const stakingCappedsExist = Boolean(
    typeof chainId === 'number' && (STAKING_REWARDS_CAPPED_INFO[chainId]?.length ?? 0) > 0
  )

  return (
  
<PageWrapper gap="lg" justify="center">
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <h3 className='text-color-white' style={{color:'white'}}>Neumékca City</h3>
        </DataRow>

        <TYPE.white>V1 Pools</TYPE.white>
        <PoolSection>
          {stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist ? (
            <AutoColumn justify="center" gap="md">
              <TYPE.main>No active rewards</TYPE.main>
            </AutoColumn>
          ) : (
            stakingInfos?.map(stakingInfo => {
              return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} poolType={'normal'} />
            })
          )}
        </PoolSection>

        <TYPE.black>Bitcoin Pools</TYPE.black>
        <PoolSection>
          {stakingCappedsExist && stakingCappedInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingCappedsExist ? (
            <AutoColumn justify="center" gap="md">
              <TYPE.main>No active rewards</TYPE.main>
            </AutoColumn>
          ) : (
            stakingCappedInfos?.map(stakingInfo => {
              return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} poolType={'capped'} />
            })
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>

    
  )
}
