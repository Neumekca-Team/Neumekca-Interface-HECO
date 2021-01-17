import React, { useState, useCallback, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import { AutoColumn } from '../Column'
import { RowBetween, AutoRow } from '../Row'
import PlaceHolder from '../../assets/images/nft_placeholder.png'
import BuyModal from '../../components/bazaar/BuyModal'
import SellModal from '../../components/bazaar/SellModal'

import { NftInfo } from '../../state/nft/hooks'

const GridCard = styled(Box)<{ width?: string }>`
  float: left;
  width: ${({ width }) => width ?? '25%'};
  padding: 0 8px 16px 8px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 50%;
  `};
`

const GridCardContent = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  padding: 16px;
`

const RowGridCardContent = styled(AutoRow)`
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  padding: 16px;
`

const DetailsCard = styled.div`
  padding-top: 16px;
`

const RowDetailsCard = styled.div`
  padding-left: 16px;
`

const NFTImage = styled.img`
  width: 100%;
`

const NFTSmallImage = styled.img`
  width: 24%;
`

export function SaleCard({ nftInfo }: { nftInfo?: NftInfo }) {
  const theme = useContext(ThemeContext)

  const [showBuyModal, setShowBuyModal] = useState(false)

  return (
   
  <GridCard onClick={() => setShowBuyModal(true)}>
      <GridCardContent>
        <TYPE.subHeader fontSize={11} fontWeight={700} color={nftInfo?.isOwner ? theme.primary1 : 'transparent'}>
          {nftInfo?.isOwner ? 'Your items' : '-'}
        </TYPE.subHeader>

        <NFTImage src={nftInfo ? nftInfo.token_image : PlaceHolder} />

        <DetailsCard>
          <TYPE.black fontSize={14}>{nftInfo ? nftInfo.name : '-'} NFT</TYPE.black>
          <TYPE.subHeader fontSize={11}>Rank: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.subHeader>
          
          <RowBetween>
            <TYPE.subHeader fontSize={11}>Price (BNB):</TYPE.subHeader>
            <TYPE.subHeader fontSize={11} fontWeight={700} color={theme.primary1}>
              {nftInfo?.bnbPrice?.toFixed(3) ?? '-'} BNB
            </TYPE.subHeader>
          </RowBetween>

          <RowBetween>
            <TYPE.subHeader fontSize={11}>Price (NAR):</TYPE.subHeader>
            <TYPE.subHeader fontSize={11} fontWeight={700} color={theme.primary1}>
              {nftInfo?.narPrice?.toFixed(3) ?? '-'} NAR
            </TYPE.subHeader>
          </RowBetween>
        </DetailsCard>
      </GridCardContent>

      <BuyModal isOpen={showBuyModal} onDismiss={() => setShowBuyModal(false)} nftInfo={nftInfo} />
    </GridCard>
 
  
  )
}



export function UserCard({ nftInfo, isSale }: { nftInfo?: NftInfo; isSale: boolean }) {
  const theme = useContext(ThemeContext)

  const [showBuyModal, setShowBuyModal] = useState(false)

  return (
<GridCard width="50%" onClick={() => setShowBuyModal(true)}>
      <RowGridCardContent>
        <NFTSmallImage src={nftInfo ? nftInfo.token_image : PlaceHolder} />

        <RowDetailsCard>
          <TYPE.black>{nftInfo ? nftInfo.name : '-'} NFT</TYPE.black>
          <TYPE.subHeader>Grade: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.subHeader>

          {isSale && (
            <>
              <RowBetween>
                <TYPE.subHeader>Price (BNB):</TYPE.subHeader>
                <TYPE.subHeader fontWeight={700} color={theme.primary1}>
                  {nftInfo?.bnbPrice?.toFixed(3) ?? '-'} BNB
                </TYPE.subHeader>
              </RowBetween>

              <RowBetween>
                <TYPE.subHeader>Price (NAR):</TYPE.subHeader>
                <TYPE.subHeader fontWeight={700} color={theme.primary1}>
                  {nftInfo?.narPrice?.toFixed(3) ?? '-'} NAR
                </TYPE.subHeader>
              </RowBetween>
            </>
          )}
        </RowDetailsCard>
      </RowGridCardContent>

      <SellModal isOpen={showBuyModal} onDismiss={() => setShowBuyModal(false)} nftInfo={nftInfo} />
    </GridCard>
  
    
  )
}
