import React, { useState, useCallback, useEffect } from 'react'
import { JSBI } from '@bscswap/sdk'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { useDerivedUnstakeInfo } from '../../state/stake/hooks'
import { TicketStakingInfo } from '../../state/nft/hooks'
import { useTicketStakingContract, useTicketStakingContractV2 } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import CurrencyInputPanel from '../CurrencyInputPanel'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: TicketStakingInfo
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedUnstakeInfo(typedValue, stakingInfo.stakedAmount)

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useTicketStakingContract(stakingInfo.poolAddress)
  const stakingContractV2 = useTicketStakingContractV2(stakingInfo.poolAddress)

  async function onWithdraw() {
    if (stakingContract && parsedAmount) {
      setAttempting(true)
      stakingInfo.needSendPid
        ? stakingContractV2
            .withdraw(`0x${JSBI.BigInt(stakingInfo.poolId).toString(16)}`, `0x${parsedAmount.raw.toString(16)}`, {
              gasLimit: 350000
            })
            .then((response: TransactionResponse) => {
              addTransaction(response, {
                summary: `Unstake ${stakingInfo.stakedAmount.token.symbol}`
              })
              setHash(response.hash)
            })
            .catch((error: any) => {
              setAttempting(false)
              console.log(error)
            })
        : stakingContract
            .withdraw(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
            .then((response: TransactionResponse) => {
              addTransaction(response, {
                summary: `Unstake ${stakingInfo.stakedAmount.token.symbol}`
              })
              setHash(response.hash)
            })
            .catch((error: any) => {
              setAttempting(false)
              console.log(error)
            })
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(stakingInfo.stakedAmount)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Unstake</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingInfo.stakedAmount.token}
            customBalanceAmount={stakingInfo.stakedAmount}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={`${stakingInfo.stakedAmount.token.symbol} available to unstake: `}
            id="ticket-stake-token"
          />
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo.stakedAmount} onClick={onWithdraw}>
            {error ?? 'Unstake & Harvest'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>
              Unstaking {stakingInfo?.stakedAmount?.toSignificant(4)} {stakingInfo.stakedAmount.token.symbol}
            </TYPE.body>
            <TYPE.body fontSize={20}>
              Harvesting {stakingInfo?.earnedAmount?.toSignificant(4)} {stakingInfo.earnedAmount.token.symbol}
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Unstaked {stakingInfo.stakedAmount.token.symbol}!</TYPE.body>
            <TYPE.body fontSize={20}>Harvested {stakingInfo.earnedAmount.token.symbol}!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
