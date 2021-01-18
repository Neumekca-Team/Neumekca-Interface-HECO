import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { Box } from 'rebass/styled-components'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import PoolCard, { MockPoolCard } from '../../components/gold/PoolCard'
import { FlatCard, SubPressedCard } from '../../components/Card'
import Loader from '../../components/Loader'
import GOLDToken from '../../assets/images/gold.png'

import {
  useTicketStakingInfo,
  STAKING_TICKETS_INFO,
  useTicketStakingInfoV2,
  STAKING_TICKETS_INFO_V2
} from '../../state/nft/hooks'
import { useActiveWeb3React } from '../../hooks'

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

const GOLDImage = styled.img`
  width: 32px;
  margin-right: 8px;
`

export default function Gold() {
  const { chainId } = useActiveWeb3React()

  const stakingInfos = useTicketStakingInfo()
  const stakingTicketsExist = Boolean(typeof chainId === 'number' && (STAKING_TICKETS_INFO[chainId]?.length ?? 0) > 0)
  const stakingInfosV2 = useTicketStakingInfoV2()
  const stakingTicketsExistV2 = Boolean(
    typeof chainId === 'number' && (STAKING_TICKETS_INFO_V2[chainId]?.length ?? 0) > 0
  )

  return (

<PageWrapper gap="lg" justify="center">
      <FlatCard style={{ padding: 16 }}>
        <SubPressedCard style={{ padding: 16 }}>
          <AutoColumn>
            <AutoRow marginBottom={16}>
              <GOLDImage src={GOLDToken} />
              <TYPE.body fontSize={36} fontWeight={500}>
                LEON
              </TYPE.body>
            </AutoRow>
            <TYPE.black>Stake token to earn LEON.</TYPE.black>
            <TYPE.black>LEON can be used to get NFT.</TYPE.black>
            <TYPE.black>LEON tokens are calculated per blocks</TYPE.black>
          </AutoColumn>
        </SubPressedCard>
      </FlatCard>

      {(stakingTicketsExist && stakingInfos?.length === 0) ||
      (stakingTicketsExistV2 && stakingInfosV2?.length === 0) ? (
        <PreloadWrapper>
          <Loader style={{ margin: 'auto' }} />
        </PreloadWrapper>
      ) : !stakingTicketsExist && !stakingTicketsExistV2 ? (
        <PreloadWrapper>No active LEON pools</PreloadWrapper>
      ) : (
        <CardWrapper>
          {stakingTicketsExistV2 &&
            stakingInfosV2?.map(stakingInfo => {
              return <PoolCard key={`${stakingInfo.poolAddress}${stakingInfo.poolId}`} stakingInfo={stakingInfo} />
            })}

          {/* {Date.now() < 1606575600000 && <MockPoolCard />} */}

          {stakingTicketsExist &&
            stakingInfos?.map(stakingInfo => {
              return <PoolCard key={stakingInfo.poolAddress} stakingInfo={stakingInfo} />
            })}
        </CardWrapper>
      )}
    </PageWrapper>
    
    
  )
}
