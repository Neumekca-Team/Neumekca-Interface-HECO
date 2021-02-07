import React, { useState, useCallback, useEffect } from 'react'
import Countdown from 'react-countdown'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonPrimary } from '../Button'
import { JSBI } from '@neumekca/neumekca-sdk'
import { NftInfo } from '../../state/nft/hooks'
import { useFarmStakingRewardContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const DetailsCard = styled.div`
  padding-top: 16px;
`

const NFTImage = styled.img`
  width: 100%;
`

const ModalContent = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  overflow: auto;
`

interface StakingRuneModalProps {
  isOpen: boolean
  onDismiss: () => void
  onStakeNew: () => void
  stakingInfo: StakingInfo
  nftInfo?: NftInfo
}

export default function UnstakingRuneModal({
  isOpen,
  onDismiss,
  onStakeNew,
  stakingInfo,
  nftInfo
}: StakingRuneModalProps) {
  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  const stakingContract = useFarmStakingRewardContract(stakingInfo.stakingRewardAddress)

  async function onRemove() {
    setAttempting(true)
    if (stakingContract && nftInfo) {
      stakingContract
        .removeNcard(`0x${JSBI.BigInt(nftInfo.id).toString(16)}`, { gasLimit: 450000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `remove Ncard`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Remove Ncard</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>

          {nftInfo && (
            <ModalContent>
              <NFTImage src={nftInfo.token_image} />
              <DetailsCard>
                {nftInfo && (
                  <TYPE.black fontSize={14} fontStyle="italic" marginBottom={16} textAlign="center">
                    {nftInfo.description}
                  </TYPE.black>
                )}
                <TYPE.black>Name: {nftInfo.name}</TYPE.black>
                <TYPE.black>Rank: {nftInfo.rank_text}</TYPE.black>
                <TYPE.black>Effect: {nftInfo.effect}</TYPE.black>
                <TYPE.black>
                  Ready in:{' '}
                  <Countdown
                    date={(nftInfo.types === 1 ? stakingInfo?.rune1TimeStamp : stakingInfo?.rune2TimeStamp) + 28800000}
                  >
                    <span>Ready to use</span>
                  </Countdown>
                </TYPE.black>
              </DetailsCard>
            </ModalContent>
          )}

          <RowBetween>
            <ButtonPrimary mr="0.5rem" disabled={false} onClick={onRemove}>
              Remove
            </ButtonPrimary>
            <ButtonPrimary
              disabled={false}
              onClick={() => {
                onStakeNew()
                wrappedOnDismiss()
              }}
            >
              Wearing New
            </ButtonPrimary>
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Remove Ncard</TYPE.largeHeader>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
