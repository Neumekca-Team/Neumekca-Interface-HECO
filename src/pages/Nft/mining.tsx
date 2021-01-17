import React, { useState, useEffect, useContext } from 'react'
import { AutoColumn } from '../../components/Column'
import { darken } from 'polished'
import { Box } from 'rebass/styled-components'
import styled, { ThemeContext } from 'styled-components'
import ComingSoon from '../../components/ComingSoon'


const PageWrapper = styled(AutoColumn)`
  width: 100%;
`
export default function Mining() {
  return (
  <PageWrapper gap="lg" justify="center">
            <ComingSoon  />
    </PageWrapper>
  )
}
