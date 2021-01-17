import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import NarInfoSection from '../../components/earn/NarInfoSection'
import { TYPE } from '../../theme'

import NARToken from '../../assets/images/logo.png'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
  border-radius: 5px;;

`

const TokenImage = styled.img`
  width: 96px;
  border-radius: 5px;;
`



export default function Nar() {
  return (

<PageWrapper gap="lg" justify="center">
      <TokenImage src={NARToken} />
      <AutoColumn justify="center" gap="sm">
        <h3 className='title-dashboard'>Neumékca City</h3>
      </AutoColumn>
      <NarInfoSection />
    </PageWrapper>

  )
}
