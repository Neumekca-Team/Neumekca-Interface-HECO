import { CurrencyAmount, JSBI, Trade, Currency } from '@neumekca/neumekca-sdk'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { TokenInfo, TokenList } from '@uniswap/token-lists/dist/types'
import { useActiveWeb3React } from '../../hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useContract, usePresaleContract, usePresaleContractCallBack } from '../../hooks/useContract'
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from '../../state/multicall/hooks'
import { useMemo } from 'react'
import { BigNumber, ethers } from 'ethers'
import HTIcon from '../../assets/images/coin/source/HT.svg'
import { AutoRow, RowBetween } from '../../components/Row'
import { ClickableText } from '../Pool/styleds'
import { PRESALE_POOL_INFO } from '../../state/presale/hooks'
import logo from '../../assets/images/coin/source/ZERO.png'
import { PRESALE_ABI } from '../../constants/abis/presale'

export default function Presale() {
  const queryString = window.location.hash.split('?')[1].replace('token=', '')
  const { account, chainId } = useActiveWeb3React()
  const contractCallBack = useContract(queryString, PRESALE_ABI, true)

  var userAddress = account

  const contract = useContract(queryString, PRESALE_ABI, false)

  const objs = useSingleCallResult(contract, 'getPresaleRate', [userAddress]).result as BigNumber[]
  var value = 0
  const rateToken = objs ? objs[0].toNumber() : null

  const maxToken = objs && objs.length > 1 ? objs[1] : null

  let claim = Number(useSingleCallResult(contract, 'getInvestedAmount', [userAddress]).result) ?? 0

  const activeClaimPresale = Boolean(useSingleCallResult(contract, 'isPresaleActive')) ?? false

  var tokenAvaiable = PRESALE_POOL_INFO[chainId]
  let tokenInfo = tokenAvaiable.filter(x => x.poolAddress == queryString)[0]

  let hardCap =  40540;
  let curCap = 20000;
  let percentCompleteHardCap = (curCap/hardCap)*100;
  let investToken = 0;


  let tokenClaim = ((claim * rateToken) / 10 ** 18).toLocaleString()

  const [priceInput, setPriceInput] = useState(0)
  const [priceOutput, setPriceOutput] = useState(0)
  const handleChange = e => {
    setPriceInput(e.target.value)
    setPriceOutput(priceInput * rateToken)
  }

  useEffect(() => {
    setPriceOutput(priceInput * rateToken)
  }, [priceInput, priceOutput, rateToken])

  function PresaleBuy() {
   

    contractCallBack
      .presale({ gasLimit: 350000, value: `0x${JSBI.BigInt(priceInput * 10 ** 18).toString(16)}` })
      .then((response: TransactionResponse) => {
        console.log('response', response)
      })
      .catch((error: any) => {
        //setAttempting(false)
        console.log(error)
      })
  }

  function PresaleClaim() {
    contractCallBack
      .claimPresale({ gasLimit: 350000 })
      .then((response: TransactionResponse) => {
        console.log('response', response)
      })
      .catch((error: any) => {
        console.log(error)
      })
  }
  let style =  percentCompleteHardCap.toFixed(2).toString() + '%'
  return (
    <>
      <div className="col-md-6 col-sm-12 col-xs-12 div-center">
        <br />
        <br />
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <div className="header-title">
              <h4 className="card-title title-card">Presale</h4>
            </div>
          </div>
          <div className="card-body">
            <form>
              <div className="input-group">
                <input
                  className="form-control"
                  id="tokenInput"
                  name="tokenInput"
                  type="number"
                  onChange={handleChange}
                  value={priceInput}
                />

                <div className="input-group-append">
                  <button
                    style={{ width: '100%', color: '#05bbc9', background: '#dff6f8', border: 'none' }}
                    className="btn btn-success"
                    type="button"
                  >
                    <img src={HTIcon} width="20" /> {'HT'}
                  </button>
                </div>
              </div>

              <br />
              <div className="input-group">
                <input
                  className="form-control"
                  id="tokenOuput"
                  name="tokenOutput"
                  type="number"
                  readOnly
                  onChange={handleChange}
                  value={priceOutput}
                />
                <div className="input-group-append">
                  <button
                    style={{ width: '100%', color: '#05bbc9', background: '#dff6f8', border: 'none' }}
                    className="btn btn-success"
                    type="button"
                  >
                    <img src={logo} width="20" /> {tokenInfo.earnToken.symbol}
                  </button>
                </div>
              </div>
              <br />
              <div className="input-group">
                <button
                  onClick={PresaleBuy}
                  style={{ width: '100%', color: '#05bbc9', background: '#dff6f8', border: 'none' }}
                  className="btn btn-success"
                  type="button"
                >
                  Buy
                </button>
              </div>
              <br />

              <RowBetween align="center">
                <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                  Price
                </ClickableText>
                <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                  {rateToken ? rateToken.toLocaleString() : '-'} ZERO per HT
                </ClickableText>
              </RowBetween>
              {investToken ? (
                <RowBetween align="center">
                  <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                    Invest:
                  </ClickableText>
                  <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                    {investToken.toLocaleString()}
                  </ClickableText>
                </RowBetween>
              ) : (
                  ''
                )}
            </form>
            {/* <RowBetween align="center">
                <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                        {'b'}
                </ClickableText>
                <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                  {'a'} 
                </ClickableText>
              </RowBetween> */}
            <br />
            <br />
            <div className="iq-details">
              <div className="iq-progress-bar bg-primary-light mt-2">
                <span className="bg-primary iq-progress progress-1"
                 data-percent={percentCompleteHardCap.toFixed(2)}  
                 style={{transition: 'transition: width 2s ease 0s', width: style}}>
                  <span className="progress-text-one bg-primary">{percentCompleteHardCap.toFixed(2)}%</span>
                </span>
              </div>
            </div>
            <br />
         
            {activeClaimPresale ? (
              <div className="input-group">
                <button
                  style={{ width: '100%', color: '#05bbc9', background: '#dff6f8', border: 'none' }}
                  className="btn btn-success"
                  type="button"
                >
                  Your claimable purchased tokens: {tokenClaim ? tokenClaim : '0'}
                </button>
              </div>
            ) : (
                <div className="input-group">
                  <button
                    style={{ width: '100%', color: 'black', background: '#e9ecef', border: 'none' }}
                    className="btn btn-success"
                    type="button"
                    disabled
                  >
                    Your claimable purchased tokens: {tokenClaim ? tokenClaim : '0'}
                  </button>
                </div>
              )}
            <br />
          </div>
        </div>
      </div>
    </>
  )
}
