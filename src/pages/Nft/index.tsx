import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AutoColumn } from '../../components/Column'
import { darken } from 'polished'
import { Box } from 'rebass/styled-components'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import NFTCard from '../../components/nft/NFTCard'
import ComingSoon from '../../components/ComingSoon'
import Loader from '../../components/Loader'
import { ClickableText } from '../Pool/styleds'

import { useActiveWeb3React } from '../../hooks'
import { useUserNfts, NftInfo } from '../../state/nft/hooks'
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

// const PreloadWrapper = styled(Box)`
//   margin-top: 42px;
// `

enum Menus {
  Gachapon,
  Collection,
  Mining,
  MyNft
}

interface INftCollection {
  id: Number
  name: string
  description: string
  token_image: string
  types: Number
  rank: Number
  rank_text: string
  effect: string
}

const iNftCollectionToNftInfo = (nft: INftCollection): NftInfo => {
  return {
    id: nft.id.toString(),
    token_id: nft.id.toString(),
    name: nft.name,
    description: nft.description,
    token_image: nft.token_image,
    external_url: '',
    types: nft.types,
    rank: nft.rank,
    rank_text: nft.rank_text,
    powers: 0,
    effect: nft.effect,
    created_time: 0,
    author: '',
    block: 0
  }
}

export default function Nft() {
  const { chainId } = useActiveWeb3React()
  const userNfts = useUserNfts()
  const [nftInfos, setNftInfos] = useState<NftInfo[]>()

  useEffect(() => {
    if (!userNfts || userNfts == undefined || !chainId) return
    const fetchAvailable = async () => {
      const res = await axios.get<NftInfo[]>(
        `${NFT_BASE_URL[chainId]}/list?${userNfts.myNfts.map(e => 'ids[]=' + e + '&').join('')}`
      )
      setNftInfos(res.data.map(e => e))
    }

    if (userNfts.myNfts.length !== 0) {
      fetchAvailable()
    } else {
      setNftInfos([])
    }
  }, [userNfts])

  return (
    <PageWrapper gap="lg" justify="center">
      {
        (nftInfos ? (
          nftInfos !== undefined && nftInfos.length !== 0  ? (
            <CardWrapper>
              {nftInfos.map(nftInfo => {
                return <NFTCard key={nftInfo.token_id} nftInfo={nftInfo} />
              })}
            </CardWrapper>
          ) : (
            <AutoColumn justify="center" gap="md">
              <TYPE.main marginTop={64}>No NFT in your collection</TYPE.main>
             
            </AutoColumn>
          )
        ) : (
          <Loader style={{ margin: 'auto' }} />
        ))}
    </PageWrapper>
  )
}
