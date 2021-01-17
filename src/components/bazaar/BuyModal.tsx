import React, { useState, useCallback, useContext, useEffect } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { ButtonPrimary } from '../Button'
import { RowBetween } from '../Row'
import PlaceHolder from '../../assets/images/nft_placeholder.png'
import { Dots } from '../../components/swap/styleds'

import { JSBI } from '@bscswap/sdk'
import { NAR } from '../../constants'
import { NftInfo } from '../../state/nft/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { NFT_BAZAAR_ADDRESSES } from '../../constants/abis/nft'
import { useActiveWeb3React } from '../../hooks'
import { useNftBazaarContract } from '../../hooks/useContract'
import { LoadingView, SubmittedView } from '../ModalViews'
import { tryParseAmount } from '../../state/swap/hooks'

const DetailsCard = styled.div`
  padding-top: 16px;
`

const NFTImage = styled.img`
  width: 100%;
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const ModalContent = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  overflow: auto;
`

const PriceSection = styled(AutoColumn)`
  border-top: 1px solid ${({ theme }) => theme.bg2};
  margin-top: 8px;
  padding-top: 8px;
`

interface StakingRuneModalProps {
  isOpen: boolean
  onDismiss: () => void
  nftInfo?: NftInfo
}

export default function BuyModal({ isOpen, onDismiss, nftInfo }: StakingRuneModalProps) {
  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const parsedAmount = tryParseAmount('1', chainId && NAR[chainId])

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [approval, approveCallback] = useApproveCallback(parsedAmount, chainId && NFT_BAZAAR_ADDRESSES[chainId])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const bazaarContract = useNftBazaarContract()

  async function onBuyWithBNB() {
    if (bazaarContract) {
      setAttempting(true)
      bazaarContract
        .buyTokenByBnb(`0x${JSBI.BigInt(nftInfo.token_id).toString(16)}`, {
          value: `0x${nftInfo.bnbPrice?.raw.toString(16)}`,
          gasLimit: 750000
        })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Buy NFT`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function onBuyWithNAR() {
    if (bazaarContract && deadline) {
      setAttempting(true)
      bazaarContract
        .buyTokenByNar(`0x${JSBI.BigInt(nftInfo.token_id).toString(16)}`, { gasLimit: 750000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Buy NFT`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
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

              <PriceSection>
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
              </PriceSection>
            </DetailsCard>
          </ModalContent>

          {approval === ApprovalState.APPROVED ? (
            <RowBetween>
              <ButtonPrimary mr="0.5rem" disabled={false} onClick={onBuyWithBNB}>
                Buy with BNB
              </ButtonPrimary>
              <ButtonPrimary disabled={false} onClick={onBuyWithNAR}>
                Buy with NAR
              </ButtonPrimary>
            </RowBetween>
          ) : (
            <ButtonPrimary disabled={false} onClick={approveCallback}>
              {approval === ApprovalState.PENDING ? <Dots>Approving</Dots> : 'Approve'}
            </ButtonPrimary>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Buy NFT</TYPE.largeHeader>
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
