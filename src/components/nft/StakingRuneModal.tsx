import React, { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import { Box } from 'rebass/styled-components'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonConfirmed, ButtonPrimary } from '../Button'
import ProgressCircles from '../ProgressSteps'
import { JSBI } from '@neumekca/neumekca-sdk'
import { useUserNfts, NftInfo } from '../../state/nft/hooks'
import { NFT_BASE_URL } from '../../constants'
import { useDividendStakingContract } from '../../hooks/useContract'
import { useApproveForAllCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { DividendStakingInfo } from '../../state/dividend/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
import { useActiveWeb3React } from '../../hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const GridCard = styled(Box)`
  float: left;
  width: 33.33%;
  padding: 0 4px 8px 4px;
  :hover {
    cursor: pointer;
  }
`

const GridCardContent = styled(AutoColumn)<{ isSelect: boolean }>`
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 2px 2px 4px ${({ theme }) => theme.shadowColor1}, -2px -2px 4px ${({ theme }) => theme.shadowColor2};
  border: 3px solid ${({ theme, isSelect }) => (isSelect ? theme.green1 : theme.bg1)}
  padding: 13px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 5px;
  `};
`

const NFTImage = styled.img`
  width: 100%;
`

const DetailsCard = styled.div`
  padding-top: 8px;
`

interface StakingRuneModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: DividendStakingInfo
  runeType?: number
}

export default function StakingRuneModal({ isOpen, onDismiss, stakingInfo, runeType }: StakingRuneModalProps) {
  const { chainId } = useActiveWeb3React()
  const userNfts = useUserNfts()

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setNftSelected(undefined)
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [approval, approveCallback] = useApproveForAllCallback(stakingInfo.poolAddress)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const [nftInfos, setNftInfos] = useState<NftInfo[]>()
  const [nftSelected, setNftSelected] = useState<NftInfo>()

  const stakingContract = useDividendStakingContract(stakingInfo.poolAddress)

  async function onStake() {
    if (stakingContract && deadline && nftSelected) {
      setAttempting(true)
      if (approval === ApprovalState.APPROVED) {
        stakingContract
          .setNcard(`0x${JSBI.BigInt(nftSelected.id).toString(16)}`, { gasLimit: 450000 })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `wearing Card`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval. Please contact support.')
      }
    }

    if (!nftSelected) {
      alert('Please select a Card to wearing')
    }
  }

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  useEffect(() => {
    if (!userNfts || !chainId) return

    const fetchAvailable = async () => {

      var lst = []
      await Promise.all(
        userNfts.myNfts.map(async (item, i) => {
            const res = await axios.get<NftInfo>(`${NFT_BASE_URL[chainId]}null-card/${item}`)
            lst.push(res.data)
          })
          
        )
        setNftInfos(lst)
    }
    
    if (userNfts.myNfts.length !== 0) {
      fetchAvailable()
    } else {
      setNftInfos([])
    }
  }, [userNfts, chainId])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Wearing CARD</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>

          <Box style={{ overflow: 'auto', paddingTop: 4 }}>
            {nftInfos
              ?.filter(nftInfo => nftInfo.types === runeType)
              .map(nftInfo => {
                return (
                  <GridCard key={nftInfo.token_id} onClick={() => setNftSelected(nftInfo)}>
                    <GridCardContent isSelect={nftInfo.token_id === nftSelected?.token_id}>
                      <NFTImage src={nftInfo.token_image} />
                    </GridCardContent>
                  </GridCard>
                )
              })}
          </Box>

          {nftSelected && (
            <DetailsCard>
              <TYPE.black fontSize={14} fontStyle="italic" marginBottom={16} textAlign="center">
                {nftSelected.description}
              </TYPE.black>
              <TYPE.black>Name: {nftSelected.name}</TYPE.black>
              <TYPE.black>Rank: {nftSelected.rank_text}</TYPE.black>
              <TYPE.black>Effect: {nftSelected.effect}</TYPE.black>
            </DetailsCard>
          )}

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={approveCallback}
              confirmed={approval === ApprovalState.APPROVED || approvalSubmitted}
              disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            >
              Approve
            </ButtonConfirmed>
            <ButtonPrimary disabled={approval !== ApprovalState.APPROVED} onClick={onStake}>
              Wearing
            </ButtonPrimary>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Wearing CARD</TYPE.largeHeader>
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
