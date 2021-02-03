import React, { useState, useCallback, useEffect } from 'react'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import ProgressCircles from '../ProgressSteps'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { TokenAmount, Pair, Token } from '@neumekca/neumekca-sdk'
import { useStakingContract } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useApproveTokenCallback, ApprovalState } from '../../hooks/useApproveCallback'
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
  stakingInfo: StakingInfo
  isEmergencyWithdraw: boolean
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo, isEmergencyWithdraw }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.jlp4fToken, stakingInfo.jlp4fBalance)

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const dummyPair = new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'))

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveTokenCallback(
    stakingInfo.jlp4fBalance,
    stakingInfo.jlp4fAddress,
    stakingInfo.stakingRewardAddress
  )

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  async function onWithdraw() {
    if (stakingContract && parsedAmount && deadline) {
      setAttempting(true)
      if (isEmergencyWithdraw) {
        await stakingContract
          .emergencyWithdraw({ gasLimit: 850000 })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `For unstake capped pool you need to unstack all JLP and click harvest to get ZERO`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        await stakingContract
          .exit(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 850000 })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Unstake liquidity`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(stakingInfo.jlp4fBalance)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

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
            currency={stakingInfo.jlp4fToken}
            pair={dummyPair}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={'rNLP available to unstake: '}
            id="stake-liquidity-token"
          />
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            {isEmergencyWithdraw
              ? 'For unstake capped pool you need to unstack all JLP and click harvest to get ZERO'
              : 'When you unstake, your ZERO is harvested and your liquidity is removed from the mining pool.'}
          </TYPE.subHeader>
          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={approveCallback}
              confirmed={approval === ApprovalState.APPROVED || approvalSubmitted}
              disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            >
              Approve
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
              error={!!error && !!stakingInfo.jlp4fToken}
              onClick={onWithdraw}
            >
              {error ?? 'Unstake & Harvest'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED || signatureData !== null]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Unstaking {stakingInfo?.stakedAmount?.toSignificant(4)} JLP</TYPE.body>
            <TYPE.body fontSize={20}>Harvesting {stakingInfo?.earnedAmount?.toSignificant(4)} ZERO</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Unstaked JLP!</TYPE.body>
            <TYPE.body fontSize={20}>Harvested ZERO!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
