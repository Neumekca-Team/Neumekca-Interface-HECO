import { Currency, ETHER, Token } from '@bscswap/sdk'
import React, { useState } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/bnb.png'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import uriToHttp from '../../utils/uriToHttp'

const getTokenLogoURL = address =>
  `https://raw.githubusercontent.com/narwhalswap/default-token-list/master/images/${address}.png`
const BAD_URIS: { [tokenAddress: string]: true } = {}

const Image = styled.img<{ size: string; neomorph: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: rgba(0, 0, 0, 0);
  border-radius: 100px;
  box-shadow: ${({ theme, neomorph }) => (neomorph ? '5px 5px 10px' + theme.shadowColor1 : '')},
    ${({ theme, neomorph }) => (neomorph ? '-5px -5px 10px' + theme.shadowColor2 : '')};
`

const Emoji = styled.span<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => size};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  margin-bottom: -4px;
`

const StyledEthereumLogo = styled.img<{ size: string; neomorph: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 100px;
  box-shadow: ${({ theme, neomorph }) => (neomorph ? '5px 5px 10px' + theme.shadowColor1 : '')},
    ${({ theme, neomorph }) => (neomorph ? '-5px -5px 10px' + theme.shadowColor2 : '')};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  neomorph = true,
  ...rest
}: {
  currency?: Currency
  size?: string
  neomorph?: boolean
  style?: React.CSSProperties
}) {
  const [, refresh] = useState<number>(0)

  if (currency === ETHER) {
    return <StyledEthereumLogo src={EthereumLogo} size={size} {...rest} neomorph={neomorph} />
  }

  if (currency instanceof Token) {
    let uri: string | undefined

    if (currency instanceof WrappedTokenInfo) {
      if (currency.logoURI && !BAD_URIS[currency.logoURI]) {
        uri = uriToHttp(currency.logoURI).filter(s => !BAD_URIS[s])[0]
      }
    }

    if (!uri) {
      const defaultUri = getTokenLogoURL(currency.address)
      if (!BAD_URIS[defaultUri]) {
        uri = defaultUri
      }
    }

    if (uri) {
      return (
        <Image
          {...rest}
          alt={`${currency.name} Logo`}
          src={uri}
          size={size}
          neomorph={neomorph}
          onError={() => {
            if (currency instanceof Token) {
              BAD_URIS[uri] = true
            }
            refresh(i => i + 1)
          }}
        />
      )
    }
  }

  return (
    <Emoji {...rest} size={size}>
      <span role="img" aria-label="Thinking">
        🤔
      </span>
    </Emoji>
  )
}
