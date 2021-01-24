import { CurrencyAmount, JSBI, Trade, Currency } from '@neumekca/neumekca-sdk'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AlignCenter, ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/Presale/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/Presale/AdvancedSwapDetailsDropdown'
import BetterTradeLink from '../../components/Presale/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/Presale/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, Dots, SwapCallbackError, Wrapper } from '../../components/Presale/styleds'
import TradePrice from '../../components/Presale/TradePrice'
import { TokenWarningCards } from '../../components/TokenWarningCard'
import { TokenInfo, TokenList } from '@uniswap/token-lists/dist/types'
import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE, PRESALE_ADDRESS } from '../../constants'
import { getTradeVersion, isTradeBetter } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallbackFromTrade,useApproveCallback } from '../../hooks/useApproveCallback'
import { TransactionResponse } from '@ethersproject/providers'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/presale/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/presale/hooks'
import {
  useExpertModeManager,
  useTokenWarningDismissal,
  useUserDeadline,
  useUserSlippageTolerance,

} from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import { usePresaleContract,usePresaleContractCallBack } from '../../hooks/useContract';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from '../../state/multicall/hooks';
import { useMemo } from 'react'
import { BigNumber,ethers } from 'ethers'
import { useTransactionAdder } from '../../state/transactions/hooks'

export default function Presale() {
  const addTransaction = useTransactionAdder()
  const { account, chainId } = useActiveWeb3React()
  const contractCallBack = usePresaleContractCallBack();
  var userAddress = account;
  const queryString = window.location.hash.split('?')[1].replace('token=','');
  let [allowedSlippage] = useUserSlippageTolerance()
  const contract = usePresaleContract();
  const objs = useSingleCallResult(contract, 'getPresaleRate',[userAddress]).result as BigNumber[];

  allowedSlippage = objs ? objs[0].toNumber() : Number(0);
  const maxToken = objs && objs.length > 1 ? objs[1] : Number(0);

  
  useDefaultsFromURLSearch()
  const { t } = useTranslation()


  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()


  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const trade = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }[toggledVersion]
  
  const betterTradeLinkVersion: Version | undefined =
    toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
      ? Version.v1
      : toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
      ? Version.v2
      : undefined

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
 
  //maxAmountInput.ether(BigInt(12588));
  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route
  const [approval_presale, approveCallback_presale] = useApproveCallback(maxAmountInput, chainId && PRESALE_ADDRESS[chainId].address)
  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade)
          ].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  
  let tokenClaim = Number(useSingleCallResult(contract, 'getInvestedAmount',[userAddress]).result) ?? 0;



  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const [dismissedToken0] = useTokenWarningDismissal(chainId, currencies[Field.INPUT])
  const [dismissedToken1] = useTokenWarningDismissal(chainId, currencies[Field.OUTPUT])
  const showWarning =
    (!dismissedToken0 && !!currencies[Field.INPUT]) || (!dismissedToken1 && !!currencies[Field.OUTPUT])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  var tokenAvaiable = (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0].tokens;
  if(tokenAvaiable !== undefined && tokenAvaiable.length > 0 ){
    let obj = tokenAvaiable.filter(x=>x.address == queryString)[0];
    currencies[Field.OUTPUT] = obj;
  }
 
 
  function PresaleBuy(){
    let _amount  =  Number(formattedAmounts[Field.INPUT]);
   contractCallBack
   .presale(`0x${JSBI.BigInt(_amount * (10**18)).toString(18)}`, { gasLimit: 350000 })
   .then((response: TransactionResponse) => {
    addTransaction(response, {
      summary: `Harvest accumulated ${currencies[Field.OUTPUT].symbol}`
    })
      console.log('response',response)
   })
   .catch((error: any) => {
     //setAttempting(false)
     console.log(error)
   })

  }

  function PresaleClaim(){
    contractCallBack
    .claimPresale({ gasLimit: 350000 })
    .then((response: TransactionResponse) => {
      addTransaction(response, {
        summary: `Harvest accumulated ${currencies[Field.OUTPUT].symbol}`
      })
       console.log('response',response)
    })
    .catch((error: any) => {
      console.log(error)
    })
  }

  return (
    <>
      {showWarning && <TokenWarningCards currencies={currencies} />}
     
      <div className='col-md-6 col-sm-12 col-xs-12 div-center' >
      <AppBody disabled={showWarning}>
        <SwapPoolTabs active={"presale"} />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            
          />

          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
             disableCurrencySelect = {true}
              label={independentField === Field.OUTPUT && !showWrap ? t('fromestimated') : t('fromCapitalized')}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={() => {
                maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
              }}
              onCurrencySelect={currency => {
                setApprovalSubmitted(false) // reset 2 step UI for approvals
                onCurrencySelection(Field.INPUT, currency)
              }}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
              
            />

            <AutoColumn justify="space-between">
              <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              disableCurrencySelect = {true}
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap ? t('toestimated') : t('toCapitalized')}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={address => onCurrencySelection(Field.OUTPUT, address)}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {showWrap ? null : (
              <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                <AutoColumn gap="4px">
                 

                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        Price
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {allowedSlippage ? allowedSlippage  : '-'} ZERO per HT
                       
                      </ClickableText>
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            )}
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>{t('connectWallet')}</ButtonLight>
            ) :(
              <RowBetween>
                <ButtonPrimary
                  onClick={PresaleBuy}
                  width="100%"
                
                >
                  Buy
                </ButtonPrimary>
              </RowBetween>
            )}
            <br />
             {!account ? (
              <></>
            ) :(
              <RowBetween>
         
                <ButtonPrimary
                  onClick={PresaleClaim}
                  width="100%"
                  // style={{padding:'8px'}}
                >
                  Your claimable purchased tokens: {tokenClaim ? tokenClaim : '0'}
                </ButtonPrimary>
              </RowBetween>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
           
          </BottomGrouping>
        </Wrapper>
      </AppBody>
      <AdvancedSwapDetailsDropdown trade={trade} />
      </div>
      </>
  )
}
