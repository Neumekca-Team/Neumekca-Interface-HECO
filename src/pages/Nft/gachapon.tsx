import React, { useState, useEffect, useContext, useMemo } from 'react'
import axios from 'axios'
import { AutoColumn } from '../../components/Column'
import { darken } from 'polished'
import { Box } from 'rebass/styled-components'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import NFTCard from '../../components/nft/NFTCard'
 import ComingSoon from '../../components/ComingSoon'
import Gachapon from '../../components/nft/Gachapon'
import Loader from '../../components/Loader'
import { ClickableText } from '../Pool/styleds'

import { useActiveWeb3React } from '../../hooks'
import { useUserNfts, NftInfo } from '../../state/nft/hooks'
import { NFT_BASE_URL } from '../../constants'
import {
  useNftContract,
  useNftFactoryContract,
  useNftBazaarContract,
  useTicketStakingContractV2
} from '../../hooks/useContract'
import { JSBI, Token, TokenAmount, WETH } from '@neumekca/neumekca-sdk'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

interface INftCollection {
  id: number
  name: string
  description: string
  token_image: string
  types: number
  rank: number
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


export default function Cryotank() {
  

  const a = useUserNfts();

  return (
  <PageWrapper gap="lg" justify="center">
            <ComingSoon customText="New cryotank coming soon..." />
    </PageWrapper>
    //    <PageWrapper gap="lg" justify="center">
    //         <Gachapon gachaPrice={a?.gachaPrice}  />
    // </PageWrapper>
  )
}
