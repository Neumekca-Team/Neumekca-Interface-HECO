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
        <TYPE.black fontSize={11} fontWeight={700} color={nftInfo?.isOwner ? theme.primary1 : 'transparent'}>
          {nftInfo?.isOwner ? 'Your items' : '-'}
        </TYPE.black>

        <NFTImage src={nftInfo ? nftInfo.token_image : PlaceHolder} />

        <DetailsCard>
          <TYPE.black fontSize={14}>{nftInfo ? nftInfo.name : '-'} NFT</TYPE.black>
          <TYPE.black fontSize={11}>Rank: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.black>
          
          <RowBetween>
            <TYPE.black fontSize={11}>Price (HT):</TYPE.black>
            <TYPE.black fontSize={11} fontWeight={700} color={theme.primary1}>
              {nftInfo?.htPrice?.toFixed(2) ?? '-'} HT
            </TYPE.black>
          </RowBetween>

          <RowBetween>
            <TYPE.black fontSize={11}>Price (ZERO):</TYPE.black>
            <TYPE.black fontSize={11} fontWeight={700} color={theme.primary1}>
              {nftInfo?.zeroPrice?.toFixed(2) ?? '-'} ZERO
            </TYPE.black>
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

        <RowDetailsCard style={{width: '270px'}}>
          <TYPE.black>{nftInfo ? nftInfo.name : '-'} NFT</TYPE.black>
          <TYPE.black>Rank: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.black>

          {isSale && (
            <>
              <RowBetween>
                <TYPE.black>Price (HT):     </TYPE.black>
                <TYPE.black fontWeight={700} color={theme.primary1} >
                  {nftInfo?.htPrice?.toFixed(2) ?? '-'} HT
                </TYPE.black>
              </RowBetween>

              <RowBetween>
                <TYPE.black>Price (ZERO):     </TYPE.black>
                <TYPE.black fontWeight={700} color={theme.primary1}>
                  {nftInfo?.zeroPrice?.toFixed(2) ?? '-'} ZERO
                </TYPE.black>
              </RowBetween>
            </>
          )}
        </RowDetailsCard>
      </RowGridCardContent>

      <SellModal isOpen={showBuyModal} onDismiss={() => setShowBuyModal(false)} nftInfo={nftInfo} />
    </GridCard>
  
    
  )
}
