import React from 'react'
import Logo from '../../assets/images/logocms.png'
import LogoDark from '../../assets/images/logodark.png'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { useDarkModeManager } from '../../state/user/hooks'

const Wrapper = styled(AutoColumn)`
  padding-top: 24px;
  color: white;
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  margin-bottom: 24px;
  animation: pulse 1.25s ease-in-out infinite;
  @keyframes pulse {
    0% {
      -webkit-transform: scaleX(1);
      transform: scaleX(1);
    }
    50% {
      -webkit-transform: scale3d(1.05, 1.05, 1.05);
      transform: scale3d(1.05, 1.05, 1.05);
    }
    to {
      -webkit-transform: scaleX(1);
      transform: scaleX(1);
    }
  }
`

export default function ComingSoon({ customText }: { customText?: string }) {
  const [isDark] = useDarkModeManager()

  return (
    <Wrapper justify='center'>
      <UniIcon>
        <img style={{ height: 86 }} src={isDark ? LogoDark : Logo} alt="logo" />
      </UniIcon>
      {customText ?? 'Coming Soon...'}
    </Wrapper>
  )
}
