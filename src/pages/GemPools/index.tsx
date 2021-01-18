import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { Box } from 'rebass/styled-components'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import PoolCard from '../../components/gempools/PoolCard'
import { FlatCard, SubPressedCard } from '../../components/Card'
import Loader from '../../components/Loader'

import { useGemStakingInfo, STAKING_GEMS_INFO } from '../../state/gempools/hooks'
import { useActiveWeb3React } from '../../hooks'

import GEMToken from '../../assets/images/gem.png'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const CardWrapper = styled(Box)`
  width: calc(100% + 16px);
`

const PreloadWrapper = styled(Box)`
  margin-top: 42px;
  font-size: 24px;
  font-weight: bold;
  color:white;
`

const TokenImage = styled.img`
  width: 32px;
  margin-right: 8px;
`


export default function GemPools() {
  const { chainId } = useActiveWeb3React()

  const stakingInfos = useGemStakingInfo()
  const stakingGemsExist = Boolean(typeof chainId === 'number' && (STAKING_GEMS_INFO[chainId]?.length ?? 0) > 0)

  return (

       <PageWrapper gap="lg" justify="center">
     

      <FlatCard style={{ padding: 16 }}>
        <SubPressedCard style={{ padding: 16 }}>
          <AutoColumn>
            <AutoRow marginBottom={16}>
              <TokenImage src={GEMToken} />
              <TYPE.body fontSize={36} fontWeight={500}>
                SNOW Pools
              </TYPE.body>
            </AutoRow>
            <TYPE.black>Stake SNOW here to earn new tokens.</TYPE.black>
            <TYPE.black>Rewards are calculated per blocks</TYPE.black>
          </AutoColumn>
        </SubPressedCard>
      </FlatCard>

      {stakingGemsExist && stakingInfos?.length === 0 ? (
        <PreloadWrapper>
          <Loader style={{ margin: 'auto' }} />
        </PreloadWrapper>
      ) : !stakingGemsExist ? (
        <PreloadWrapper>No active SNOW pools</PreloadWrapper>
      ) : (
        <CardWrapper>
          {stakingGemsExist &&
            stakingInfos?.map(stakingInfo => {
              return <PoolCard key={stakingInfo.poolAddress} stakingInfo={stakingInfo} />
            })}
        </CardWrapper>
      )}
    </PageWrapper>
  

   )
}
