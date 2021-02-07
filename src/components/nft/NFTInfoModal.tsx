import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../../components/Column'
import Modal from '../Modal'

import PlaceHolder from '../../assets/images/nft_placeholder.png'

import { NftInfo } from '../../state/nft/hooks'

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

export default function NFTInfoModal({
  nftInfo,
  isOpen,
  onDismiss
}: {
  nftInfo: NftInfo
  isOpen: boolean
  onDismiss: () => void
}) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
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
  )
}
