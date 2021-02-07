import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import PoolCard from '../../components/earn/PoolCard'
import { RowBetween } from '../../components/Row'
import Loader from '../../components/Loader'
import {
  STAKING_REWARDS_V2_INFO,
  STAKING_REWARDS_INFO,
  STAKING_REWARDS_CAPPED_INFO,
  useStakingInfoV2,
  useStakingInfo,
  useStakingInfoCapped,
  
} from '../../state/stake/hooks'
import { useActiveWeb3React } from '../../hooks'
import btcLogo from '../../assets/images/coin/source/BTC.png'
import zeroLogo from '../../assets/images/coin/source/ZERO.png'
import {useFarmStakingRewardContract} from '../../hooks/useContract'

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
  const poolBtcActive = false
  const stakingV2Infos = useStakingInfoV2()
  const stakingInfos = useStakingInfo()
  const stakingCappedInfos = useStakingInfoCapped()
  const contractV2  = useFarmStakingRewardContract(STAKING_REWARDS_V2_INFO[chainId][0].stakingRewardAddress);
  const stakingRewardsV2Exist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_V2_INFO[chainId]?.length ?? 0) > 0)
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)
  const stakingCappedsExist = Boolean(
    typeof chainId === 'number' && (STAKING_REWARDS_CAPPED_INFO[chainId]?.length ?? 0) > 0
  )

 


  return (
    <PageWrapper gap="lg" justify="center">
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <h3 className='text-color-white' style={{ color: 'white' }}>Neumékca City Farms</h3>
        </DataRow>

        <TYPE.white>ZERO Pools</TYPE.white>
        <PoolSection>
          {stakingRewardsV2Exist && stakingV2Infos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsV2Exist ? (
            <AutoColumn justify="center" gap="md">
              <TYPE.main>No active rewards</TYPE.main>
            </AutoColumn>
          ) : (
                stakingV2Infos?.map(stakingInfo => {
                  return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} poolType={'normal'} />
                })
              )}
        </PoolSection>

        <TYPE.white>Bitcoin Pools</TYPE.white>

        {poolBtcActive ?
          (
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
          )
          : (
            <div className='bLaTJO'>
              <DataRow>
              <div className="sc-dymIpo YMxKx">
                <div className="sc-gqjmRU cmleTe">
                  <div className="sc-lhVmIH fRnAfu">
                    <img className="sc-iELTvK fUsWFK sc-bYSBpT kiYnYn" alt="Bitcoin Logo" src={btcLogo} />
                    <img className="sc-iELTvK fUsWFK sc-elJkPf gXpmrw" alt="zero Token Logo" src={zeroLogo} />
                  </div>
                  <div className="sc-kGXeez jmXmTc css-s7nwei" style={{ marginTop: '8px' }}> HBTC/ZERO</div>
                </div>
              </div>
              <div className="sc-gqjmRU sc-bnXvFD eLiSzy" style={{ marginTop: '10px' }}>
                          <h2  style={{whiteSpace:'nowrap', marginLeft:'45%'}}>COMING SOON</h2>
              </div>
              </DataRow>
            

            </div>
          )

        }

      </AutoColumn>
    </PageWrapper>
  )
}
