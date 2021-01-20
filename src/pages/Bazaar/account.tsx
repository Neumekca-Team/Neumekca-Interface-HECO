import React, { useState, useEffect, useContext, useMemo } from 'react'
import axios from 'axios'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { darken } from 'polished'
import { Box } from 'rebass/styled-components'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { SaleCard, UserCard } from '../../components/bazaar/NFTSaleCard'
// import { FlatCard, SubPressedCard } from '../../components/Card'
import Loader from '../../components/Loader'
import { ClickableText } from '../Pool/styleds'
import Select from 'react-select'

import { useActiveWeb3React } from '../../hooks'
import { useUserNfts, NftInfo, useUserOnSaleNfts, onSaleNftInfo, useOnSaleNfts } from '../../state/nft/hooks'
import { NFT_BASE_URL } from '../../constants'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  // border-radius: 3rem;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.bg1};
  background: ${({ theme }) => theme.bg1};
  box-shadow: 5px 5px 10px ${({ theme }) => theme.shadowColor1}, -5px -5px 10px ${({ theme }) => theme.shadowColor2};
`

const TabButton = styled.button<{ isActive: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: ${({ theme }) => theme.bg1};
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 16px;
  flex: 1;
  transition: 0.3s;
  font-weight: ${({ isActive }) => (isActive ? 700 : 400)};
  color: ${({ theme, isActive }) => (isActive ? theme.text1 : theme.text3)};
  box-shadow: ${({ theme, isActive }) => (isActive ? 'inset 5px 5px 10px' + theme.shadowColor1 : '')},
    ${({ theme, isActive }) => (isActive ? 'inset -5px -5px 10px' + theme.shadowColor2 : '')};

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    box-shadow: inset 5px 5px 10px ${({ theme }) => theme.shadowColor1},
      inset -5px -5px 10px ${({ theme }) => theme.shadowColor2};
  }
`

const CardWrapper = styled(Box)`
  width: calc(100% + 16px);
`

const CardWrapperIn = styled(Box)`
  width: calc(100% + 16px);
  margin-left: -8px;
`

// const PreloadWrapper = styled(Box)`
//   margin-top: 42px;
// `

enum Menus {
  Bazaar,
  Account
}

interface OptionProps {
  value: string
  label: string
}

const typeOptions: OptionProps[] = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Chronos Init' },
  { value: '2', label: 'Chronos Step' },
  { value: '5', label: 'Chronos Max' }
]

const gradeOptions: OptionProps[] = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Alpha' },
  { value: '2', label: 'Beta' },
  { value: '3', label: 'Gamma' },
  { value: '4', label: 'Delta' },
  { value: '5', label: 'Omega' },
  { value: '6', label: 'N/A' }
]

export default function Bazaar() {
  const { chainId } = useActiveWeb3React()
  const onSaleNfts = useOnSaleNfts()
  const userNfts = useUserNfts()
  const userOnSaleNfts = useUserOnSaleNfts()

  const theme = useContext(ThemeContext)

  const [tabActive, setTabActive] = useState<Menus>(Menus.Bazaar)
  const [nftOnSaleInfos, setNftOnSaleInfos] = useState<NftInfo[]>()
  const [typeRune, setTypeRune] = useState(0)
  const [gradeRune, setGradeRune] = useState(0)
  const [nftInfos, setNftInfos] = useState<NftInfo[]>()
  const [userNftOnSaleInfos, setUserNftOnSaleInfos] = useState<NftInfo[]>()

  useEffect(() => {
    if (!userNfts || !chainId || !userOnSaleNfts) return

    const fetchOnSale = async () => {
      const res = await axios.get<NftInfo[]>(
        `${NFT_BASE_URL[chainId]}/list?${onSaleNfts.map(e => 'ids[]=' + e.tokenId + '&').join('')}`
      )
      setNftOnSaleInfos(
        res.data.map(e => {
          const onSale: onSaleNftInfo | undefined = onSaleNfts.find(o => o.tokenId.toString() === e.token_id)
          e.bnbPrice = onSale?.bnbPrice
          e.narPrice = onSale?.narPrice
          e.isOwner = userOnSaleNfts.some(u => u.tokenId.toString() === e.token_id)
          return e
        })
      )
    }

    const fetchAvailable = async () => {
      const res = await axios.get<NftInfo[]>(
        `${NFT_BASE_URL[chainId]}/list?${userNfts.myNfts.map(e => 'ids[]=' + e + '&').join('')}`
      )
      setNftInfos(res.data.map(e => e))
    }

    const fetchUserOnSale = async () => {
      const res = await axios.get<NftInfo[]>(
        `${NFT_BASE_URL[chainId]}/list?${userOnSaleNfts.map(e => 'ids[]=' + e.tokenId + '&').join('')}`
      )
      setUserNftOnSaleInfos(
        res.data.map(e => {
          const onSale: onSaleNftInfo | undefined = userOnSaleNfts.find(o => o.tokenId.toString() === e.token_id)
          e.bnbPrice = onSale?.bnbPrice
          e.narPrice = onSale?.narPrice
          return e
        })
      )
    }

    if (onSaleNfts.length !== 0) {
      fetchOnSale()
    } else {
      setNftOnSaleInfos([])
    }

    if (userNfts.myNfts.length !== 0) {
      fetchAvailable()
    } else {
      setNftInfos([])
    }

    if (userOnSaleNfts.length !== 0) {
      fetchUserOnSale()
    } else {
      setUserNftOnSaleInfos([])
    }
  }, [userNfts, chainId, userOnSaleNfts, onSaleNfts])

  const nftOnSaleInfosFiltered = useMemo(
    () =>
      nftOnSaleInfos?.filter(
        e => (typeRune === 0 ? true : e.types === typeRune) && (gradeRune === 0 ? true : e.rank === gradeRune)
      ),
    [nftOnSaleInfos, typeRune, gradeRune]
  )

  return (
    <PageWrapper gap="lg" justify="center">

      {(
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <TYPE.white>Available for Sale</TYPE.white>
          {nftInfos ? (
            nftInfos.length !== 0 ? (
              <CardWrapperIn>
                {nftInfos.map(nftInfo => {
                  return <UserCard key={nftInfo.token_id} nftInfo={nftInfo} isSale={false} />
                })}
              </CardWrapperIn>
            ) : (
              <AutoColumn justify="center" gap="md">
                <TYPE.main marginTop={32}>No NFT available</TYPE.main>
                <ClickableText
                  fontWeight={600}
                  fontSize={14}
                  color={theme.primary1}
                  onClick={() => setTabActive(Menus.Bazaar)}
                >
                  Buy NFT
                </ClickableText>
              </AutoColumn>
            )
          ) : (
            <Loader style={{ margin: 'auto' }} />
          )}

          <TYPE.white>On Sale</TYPE.white>
          {userNftOnSaleInfos ? (
            userNftOnSaleInfos.length !== 0 ? (
              <CardWrapperIn>
                {userNftOnSaleInfos.map(nftInfo => {
                  return <UserCard key={nftInfo.token_id} nftInfo={nftInfo} isSale={true} />
                })}
              </CardWrapperIn>
            ) : (
              <AutoColumn justify="center" gap="md">
                <TYPE.main marginTop={32}>No NFT Sale</TYPE.main>
                <ClickableText
                  fontWeight={600}
                  fontSize={14}
                  color={theme.primary1}
                  onClick={() => setTabActive(Menus.Bazaar)}
                >
                  Buy NFT
                </ClickableText>
              </AutoColumn>
            )
          ) : (
            <Loader style={{ margin: 'auto' }} />
          )}
        </AutoColumn>
      )}
    </PageWrapper>
  )
}
