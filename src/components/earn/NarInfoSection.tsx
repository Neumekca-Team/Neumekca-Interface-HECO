import React, { useMemo } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE, ExternalLink } from '../../theme'
import { RowBetween } from '../../components/Row'
import { DataCard } from '../../components/earn/styled'
import { useNarSupplyInfo } from '../../state/stake/hooks'
import { ZERO } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import useBUSDPrice from '../../utils/useBUSDPrice'
import usePrevious from '../../hooks/usePrevious'
import CountUp from 'react-countup'
import { ChainId, Currency, currencyEquals, JSBI, Price, WETH, Token } from '@neumekca/neumekca-sdk'
const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const DataRow = styled(RowBetween)`
border-radius: 5px;;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`

const NarData = styled(DataCard)`
  border: 1px solid ${({ theme }) => theme.bg2};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  padding: 1rem;
  z-index: 1;
  border-radius: 5px;;
`

export default function NarInfoSection() {
  const { chainId } = useActiveWeb3React()
  const nar = chainId ? ZERO[chainId] : undefined
  const narPrice = useBUSDPrice(nar)
  

  const narSupplyInfo = useNarSupplyInfo()

  const mkc = narSupplyInfo?.circulating && narPrice?.quote(narSupplyInfo?.circulating)
  const countUpMKC = mkc?.toFixed(0) ?? '0'
  const countUpMKCPrevious = usePrevious(countUpMKC) ?? '0'

  const countUpTotalSupply = narSupplyInfo?.totalSupply?.toFixed(0) ?? '0'
  const countUpTotalSupplyPrevious = usePrevious(countUpTotalSupply) ?? '0'
  const countUpCirculation = narSupplyInfo?.circulating?.toFixed(0) ?? '0'
  const countUpCirculationPrevious = usePrevious(countUpCirculation) ?? '0'
  const countUpBurned = narSupplyInfo?.burned?.toFixed(0) ?? '0'
  const countUpBurnedPrevious = usePrevious(countUpBurned) ?? '0'
  const countUpDividend = narSupplyInfo?.dividend?.toFixed(0) ?? '0'
  const countUpDividenPrevious = usePrevious(countUpDividend) ?? '0'

  return (
    <TopSection gap="md">
      <DataRow style={{ gap: '24px' }}>
        <NarData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0 }}>⚡ZERO Price</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              ${(narPrice ? (Number(narPrice?.toSignificant(3)) * 10**10).toFixed(4) : '-')}
            </TYPE.white>
          </AutoColumn>
        </NarData>

        <NarData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0 }}>✨Market Cap</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              $ 
              <CountUp
                key={countUpMKC}
                decimals={0}
                start={parseFloat(((Number(narPrice?.toSignificant(3)) * 10**10) * Number(countUpTotalSupply)).toFixed(4))}
                end={parseFloat(((Number(narPrice?.toSignificant(3)) * 10**10) * Number(countUpTotalSupply)).toFixed(4))}
                separator={','}
                duration={1}
              /> 
            </TYPE.white>
          </AutoColumn>
        </NarData>
      </DataRow>

      <DataRow style={{ gap: '24px' }}>
        <NarData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0 }}>Total Supply</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              <CountUp
                key={countUpTotalSupply}
                decimals={0}
                start={parseFloat(countUpTotalSupplyPrevious)}
                end={parseFloat(countUpTotalSupply)}
                separator={','}
                duration={1}
              />
              {' ZERO'}
            </TYPE.white>
          </AutoColumn>
        </NarData>
        <NarData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0 }}>Circulation</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              <CountUp
                key={countUpCirculation}
                decimals={0}
                start={parseFloat(countUpCirculationPrevious)}
                end={parseFloat(countUpCirculation)}
                separator={','}
                duration={1}
              />
              {' ZERO'}
            </TYPE.white>
          </AutoColumn>
        </NarData>
      </DataRow>

      <DataRow style={{ gap: '24px' }}>
        <NarData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0 }}>🔥Burned</TYPE.white>
            <TYPE.white fontSize={24} fontWeight={500}>
              <CountUp
                key={countUpBurned}
                decimals={0}
                start={parseFloat(countUpBurnedPrevious)}
                end={parseFloat(countUpBurned)}
                separator={','}
                duration={1}
              />
              {' ZERO'}
            </TYPE.white>
          </AutoColumn>
        </NarData>
        <NarData>
          <AutoColumn gap="sm">
            <TYPE.white style={{ margin: 0 }}>🏛Total Dividends</TYPE.white>
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
        </NarData>
      </DataRow>
    </TopSection>
  )
}
