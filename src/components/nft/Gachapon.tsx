import React, { useState, useEffect, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Row, { AutoRow, RowBetween } from '../Row'
import { ButtonLight, ButtonPrimary } from '../../components/Button'
import { Dots } from '../../components/swap/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { useActiveWeb3React } from '../../hooks'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { NFT_FACTORY_ADDRESSES } from '../../constants/abis/nft'
import { ZERO } from '../../constants'
import { JSBI, TokenAmount } from '@neumekca/neumekca-sdk'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useNftFactoryContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { DataCard } from '../../components/earn/styled'
import { NftInfo } from '../../state/nft/hooks'
import NFTInfoModal from '../nft/NFTInfoModal'

import CandyMachine from '../../assets/images/candy-machine.svg'
import HaloLightImage from '../../assets/images/halo_light.png'

const MachineWrapper = styled(AutoColumn)`
  height: 38vh;
  position: relative;
`

const Turn = keyframes`  
    0% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(90deg);
    }
    50% {
        transform: rotate(180deg);
    }
    75% {
        transform: rotate(270deg);
    }
    100% {
        transform: rotate(1turn);
    }
`

const HaloLight = styled.img`
  position: absolute;
  height: 38vh;
  top: 50%;
  left: 50%;
  margin-top: -19vh;
  margin-left: -19vh;
  animation: ${Turn} 2s linear 0s infinite normal none running;
`

const GachaponMachine = styled.img`
  height: 24vh;
  margin-top: 10vh;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
  margin-top: 48px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

const RuneSlot = styled.div`
  width: 72px;
  height: 72px;
  padding: 8px;
  margin-right: 16px;
  margin-bottom: 8px;
  box-shadow: 2px 2px 4px ${({ theme }) => theme.shadowColor1}, -2px -2px 4px ${({ theme }) => theme.shadowColor2};
  border: 1px solid ${({ theme }) => theme.bg2};
  :hover {
    cursor: pointer;
  }
`

const RuneImage = styled.img<{ dim: any }>`
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
`

export default function Gachapon({
  gachaPrice
}: {
  gachaPrice: TokenAmount | undefined
}) {
  const { account, chainId } = useActiveWeb3React()

  const [showDetailsModal, setShowDetailsModal] = useState({ isOpen: false, nftInfo: null })
  const wrappedOnDismiss = useCallback(() => {
    setShowDetailsModal({ isOpen: false, nftInfo: showDetailsModal.nftInfo })
  }, [showDetailsModal])

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  const ticket = chainId && ZERO[chainId]
  const ticketAmount = new TokenAmount(ticket, JSBI.BigInt('400'))

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()

  // approval data for purchase
  const deadline = useTransactionDeadline()
  const [approval, approveCallback] = useApproveCallback(ticketAmount, chainId && NFT_FACTORY_ADDRESSES[chainId])

  // check if user has gone through approval process, used to show loader
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const nftFactoryContract = useNftFactoryContract()

  async function onCreateCard() {
    if (nftFactoryContract && deadline) {
      if (approval === ApprovalState.APPROVED) {
        nftFactoryContract
          .createCard(`0x${JSBI.BigInt('0').toString(16)}`, { gasLimit: 450000 })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Opening Cryotank`
            })
          })
          .catch((error: any) => {
            console.log(error)
          })
      } else {
        throw new Error('Attempting to open cryotank without approval. Please contact support.')
      }
    }
  }

  const showApproveFlow =
    approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING ||
    (approvalSubmitted && approval === ApprovalState.APPROVED)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  return (
    <>
      <MachineWrapper gap="lg" justify="center">
        <HaloLight src={HaloLightImage} />
        <GachaponMachine src={CandyMachine} />

        {!account ? (
          <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
        ) : (
          <ButtonPrimary
            onClick={showApproveFlow ? approveCallback : onCreateCard}
            disabled={showApproveFlow ? approval !== ApprovalState.NOT_APPROVED || approvalSubmitted : false}
            altDisbaledStyle={approval === ApprovalState.PENDING}
          >
            <AutoColumn>
              {approval === ApprovalState.PENDING ? (
                <Dots>Approving</Dots>
              ) : (
                <>
                  OPEN
                  <Row style={{ fontSize: 11, marginTop: 2 }}>{`${gachaPrice?.toFixed(0) ?? '-'} ${
                    ticket.symbol
                  }`}</Row>
                </>
              )}
            </AutoColumn>
          </ButtonPrimary>
        )}
      </MachineWrapper>
{/* 
      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.black style={{ marginBottom: 8 }}>Chance to win:</TYPE.black>
            <AutoRow>
              {nftInfos
                ?.filter(e => (e.types === 2 && e.rank === 7) || (e.types === 6 && e.rank === 1) || e.types === 7)
                .map((nftInfo: NftInfo, i) => (
                  <RuneSlot onClick={() => setShowDetailsModal({ isOpen: true, nftInfo: nftInfo })} key={i}>
                    <RuneImage src={nftInfo.token_image} dim={false} />
                  </RuneSlot>
                ))}
            </AutoRow>
          </AutoColumn>
        </PoolData>
      </DataRow> */}

      <NFTInfoModal nftInfo={showDetailsModal.nftInfo} isOpen={showDetailsModal.isOpen} onDismiss={wrappedOnDismiss} />
    </>
  )
}
