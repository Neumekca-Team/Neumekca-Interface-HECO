import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { Box } from 'rebass/styled-components'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { ButtonPrimary, ButtonConfirmed } from '../Button'
import ProgressCircles from '../ProgressSteps'
import { RowBetween, AutoRow } from '../Row'
import PlaceHolder from '../../assets/images/nft_placeholder.png'
import { Input as NumericalInput } from '../NumericalInput'

import { JSBI, Token, TokenAmount } from '@neumekca/neumekca-sdk'
import { NftInfo } from '../../state/nft/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useApproveForAllCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { useActiveWeb3React } from '../../hooks'
import { NFT_BAZAAR_ADDRESSES } from '../../constants/abis/nft'
import { useNftBazaarContract } from '../../hooks/useContract'
import { LoadingView, SubmittedView } from '../ModalViews'

const RuneWrapper = styled(AutoRow)``

const DetailsCard = styled.div`
  padding-left: 16px;
`

const NFTImage = styled.img`
  width: 24%;
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const ModalContent = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  overflow: auto;
`

const Container = styled(AutoRow)`
  padding: 12px 0 12px 12px;
  border: 1px solid ${({ theme }) => theme.bg2};
  margin-bottom: 8px;
`

const PriceSection = styled(AutoColumn)`
  border-top: 1px solid ${({ theme }) => theme.bg2};
  margin-top: 16px;
  padding-top: 16px;
`

interface StakingRuneModalProps {
  isOpen: boolean
  onDismiss: () => void
  nftInfo?: NftInfo
}

export default function SellModal({ isOpen, onDismiss, nftInfo }: StakingRuneModalProps) {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const [htPrice, sethtPrice] = useState(nftInfo.htPrice?.toSignificant(24) ?? '')
  const [zeroPrice, setZEROPrice] = useState(nftInfo.zeroPrice?.toSignificant(24) ?? '')

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
  const [approval, approveCallback] = useApproveForAllCallback(chainId && NFT_BAZAAR_ADDRESSES[chainId])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const bazaarContract = useNftBazaarContract()

  async function onSell() {
    if (bazaarContract && deadline && htPrice && zeroPrice) {
      setAttempting(true)
      const dummyToken = new Token(chainId, NFT_BAZAAR_ADDRESSES[chainId], 18)
      const bnbAmount = new TokenAmount(dummyToken, JSBI.BigInt(Number(htPrice) * 1 * 10 ** 18))
      const narAmount = new TokenAmount(dummyToken, JSBI.BigInt(Number(zeroPrice) * 1 * 10 ** 18))

      if (approval === ApprovalState.APPROVED) {
        bazaarContract
          .readyToSellToken(
            `0x${JSBI.BigInt(nftInfo.id).toString(16)}`,
            `0x${bnbAmount.raw.toString(16)}`,
            `0x${narAmount.raw.toString(16)}`,
            { gasLimit: 750000 }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Selling NFT`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to sell without approval. Please contact support.')
      }
    }

    if (!htPrice || !zeroPrice) {
      alert('Please fill the price')
    }
  }

  async function onSetPrice() {
    if (bazaarContract && deadline && htPrice && zeroPrice) {
      setAttempting(true)
      const dummyToken = new Token(chainId, NFT_BAZAAR_ADDRESSES[chainId], 18)
      const bnbAmount = new TokenAmount(dummyToken, JSBI.BigInt(Number(htPrice) * 1 * 10 ** 18))
      const narAmount = new TokenAmount(dummyToken, JSBI.BigInt(Number(zeroPrice) * 1 * 10 ** 18))

      bazaarContract
        .setCurrentPrice(
          `0x${JSBI.BigInt(nftInfo.id).toString(16)}`,
          `0x${bnbAmount.raw.toString(16)}`,
          `0x${narAmount.raw.toString(16)}`,
          { gasLimit: 750000 }
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Set new price`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }

    if (!htPrice || !zeroPrice) {
      alert('Please fill the price')
    }
  }

  async function onCancel() {
    if (bazaarContract) {
      setAttempting(true)
      bazaarContract
        .cancelSellToken(`0x${JSBI.BigInt(nftInfo.id).toString(16)}`, { gasLimit: 450000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Cancel selling NFT`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  const isSale = Boolean(!nftInfo.htPrice || !nftInfo.zeroPrice)

  // wrapped onUserInput to clear signatures
  const onBNBInput = useCallback((typedValue: string) => {
    sethtPrice(typedValue)
  }, [])

  const onZEROInput = useCallback((typedValue: string) => {
    setZEROPrice(typedValue)
  }, [])

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
            <RuneWrapper>
              <NFTImage src={nftInfo ? nftInfo.token_image : PlaceHolder} />
              <DetailsCard>
                <TYPE.black>Name: {nftInfo ? nftInfo.name : '-'}</TYPE.black>
                <TYPE.black>Rank: {nftInfo ? nftInfo.rank_text : '-'}</TYPE.black>
                <TYPE.black>Effect: {nftInfo ? nftInfo.effect : '-'}</TYPE.black>
              </DetailsCard>
            </RuneWrapper>

            <PriceSection>
              <Container>
                <TYPE.black marginRight={16}>Price (HT):</TYPE.black>
                <NumericalInput
                  align="right"
                  value={htPrice}
                  onUserInput={val => {
                    onBNBInput(val)
                  }}
                />
              </Container>
              <RowBetween>
                <TYPE.subHeader> </TYPE.subHeader>
                <TYPE.subHeader fontWeight={700} color={theme.primary1}>
                  Total received: {Number(htPrice) * 0.85} HT
                </TYPE.subHeader>
              </RowBetween>
            </PriceSection>

            <PriceSection>
              <Container>
                <TYPE.subHeader marginRight={16}>Price (ZERO):</TYPE.subHeader>
                <NumericalInput
                  align="right"
                  value={zeroPrice}
                  onUserInput={val => {
                    onZEROInput(val)
                  }}
                />
              </Container>
              <RowBetween>
                <TYPE.subHeader> </TYPE.subHeader>
                <TYPE.subHeader fontWeight={700} color={theme.primary1}>
                  Total received: {Number(zeroPrice) * 0.95} ZERO
                </TYPE.subHeader>
              </RowBetween>
            </PriceSection>
          </ModalContent>

          {isSale ? (
            <RowBetween>
              <ButtonConfirmed
                mr="0.5rem"
                onClick={approveCallback}
                confirmed={approval === ApprovalState.APPROVED || approvalSubmitted}
                disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
              >
                Approve
              </ButtonConfirmed>
              <ButtonPrimary disabled={approval !== ApprovalState.APPROVED} onClick={onSell}>
                Sell
              </ButtonPrimary>
            </RowBetween>
          ) : (
            <RowBetween>
              <ButtonPrimary mr="0.5rem" onClick={onCancel}>
                Cancel Sell
              </ButtonPrimary>
              <ButtonPrimary onClick={onSetPrice}>Set New Price</ButtonPrimary>
            </RowBetween>
          )}
          {isSale && <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Manage NFT</TYPE.largeHeader>
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
