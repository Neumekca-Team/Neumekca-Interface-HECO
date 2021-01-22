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
import { useDividendStakingContract } from '../../hooks/useContract'
import { DividendStakingInfo } from '../../state/dividend/hooks'
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
  stakingInfo: DividendStakingInfo
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

  const stakingContract = useDividendStakingContract(stakingInfo.poolAddress)

  async function onRemove() {
    setAttempting(true)
    if (stakingContract && nftInfo) {
      stakingContract
        .removeRune(`0x${JSBI.BigInt(nftInfo.token_id).toString(16)}`, { gasLimit: 450000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `remove RUNE`
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
            <TYPE.mediumHeader>Remove RUNE</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>

          {nftInfo && (
            <ModalContent>
              <NFTImage src={nftInfo.token_image} />
              <DetailsCard>
                {nftInfo && (
                  <TYPE.main fontSize={14} fontStyle="italic" marginBottom={16} textAlign="center">
                    {nftInfo.description}
                  </TYPE.main>
                )}
                <TYPE.subHeader>Name: {nftInfo.name}</TYPE.subHeader>
                <TYPE.subHeader>Rank: {nftInfo.rank_text}</TYPE.subHeader>
                <TYPE.subHeader>Effect: {nftInfo.effect}</TYPE.subHeader>
                <TYPE.subHeader>
                  Ready in:{' '}
                  <Countdown
                    date={(nftInfo.types === 1 ? stakingInfo?.rune1TimeStamp : stakingInfo?.rune2TimeStamp) + 86400000}
                  >
                    <span>Ready to use</span>
                  </Countdown>
                </TYPE.subHeader>
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
            <TYPE.largeHeader>Remove RUNE</TYPE.largeHeader>
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
