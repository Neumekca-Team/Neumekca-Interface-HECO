import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import { AutoColumn } from '../../components/Column'
import Modal from '../Modal'

import PlaceHolder from '../../assets/images/nft_placeholder.png'

import { NftInfo } from '../../state/nft/hooks'

const GridCard = styled(Box)`
  float: left;
  width: 33.33%;
  padding: 0 8px 16px 8px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const GridCardContent = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 4px 4px 8px ${({ theme }) => theme.shadowColor1}, -4px -4px 8px ${({ theme }) => theme.shadowColor2};
  padding: 16px;
`

const DetailsCard = styled.div`
  padding-top: 16px;
`

const NFTImage = styled.img`
  width: 100%;
`

const ModalContent = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  padding: 16px;
  overflow: auto;
`

export default function NFTCard({ nftInfo }: { nftInfo?: NftInfo }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const wrappedOnDismiss = useCallback(() => {
    setShowDetailsModal(false)
  }, [])

  return (
    <GridCard onClick={() => setShowDetailsModal(true)}>
      <GridCardContent>
        <NFTImage src={nftInfo ? nftInfo.token_image : PlaceHolder} />
        <DetailsCard>
          <TYPE.black>{nftInfo ? nftInfo.name : '-'} NFT</TYPE.black>
          <TYPE.subHeader>Rank: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.subHeader>
        </DetailsCard>
      </GridCardContent>

      <Modal isOpen={showDetailsModal} onDismiss={wrappedOnDismiss} maxHeight={90}>
        <ModalContent>
          <NFTImage src={nftInfo ? nftInfo.token_image : PlaceHolder} />
          <DetailsCard>
            {nftInfo && (
              <TYPE.main fontSize={14} fontStyle="italic" marginBottom={16} textAlign="center">
                {nftInfo.description}
              </TYPE.main>
            )}
            <TYPE.subHeader>Name: {nftInfo ? nftInfo.name : '-'}</TYPE.subHeader>
            <TYPE.subHeader>Rank: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.subHeader>
            <TYPE.subHeader>Effect: {nftInfo ? nftInfo.effect : '-'}</TYPE.subHeader>
          </DetailsCard>
        </ModalContent>
      </Modal>
    </GridCard>
  )
}
