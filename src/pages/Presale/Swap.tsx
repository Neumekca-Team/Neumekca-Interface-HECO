import { CurrencyAmount, JSBI, Trade, Currency } from '@neumekca/neumekca-sdk'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { TokenInfo, TokenList } from '@uniswap/token-lists/dist/types'
import { useActiveWeb3React } from '../../hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { usePresaleContract, usePresaleContractCallBack } from '../../hooks/useContract';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from '../../state/multicall/hooks';
import { useMemo } from 'react'
import { BigNumber, ethers } from 'ethers'
import HTIcon from '../../assets/images/coin/source/HT.svg'
import { AutoRow, RowBetween } from '../../components/Row'
import { ClickableText } from '../Pool/styleds'


export default function Presale() {

  const { account, chainId } = useActiveWeb3React()
  const contractCallBack = usePresaleContractCallBack();
  var userAddress = account;
  const queryString = window.location.hash.split('?')[1].replace('token=', '');
  const contract = usePresaleContract();
  const objs = useSingleCallResult(contract, 'getPresaleRate', [userAddress]).result as BigNumber[];
  var value = 0;
  const rateToken = objs ? objs[0].toNumber() : null;

  const maxToken = objs && objs.length > 1 ? objs[1] : null;

  let tokenClaim = Number(useSingleCallResult(contract, 'getInvestedAmount', [userAddress]).result) ?? 0;

  const activeClaimPresale =  Boolean(useSingleCallResult(contract, 'isPresaleActive')) ?? false;

  var tokenAvaiable = (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0].tokens;
  let tokenInfo = tokenAvaiable.filter(x => x.address == queryString)[0];

  let investToken = 1000;


  const [priceInput, setPriceInput] = useState(0);
  const [priceOutput, setPriceOutput] = useState(0);
  const handleChange = (e) => {
    setPriceInput(e.target.value);
    setPriceOutput(priceInput * rateToken);
  }

  useEffect(() => {
    setPriceOutput(priceInput * rateToken);
  }, [priceInput, priceOutput, rateToken])

  function PresaleBuy() {

    console.log(contractCallBack)
    contractCallBack
      .presale(`0x${JSBI.BigInt(priceInput * (10 ** 18)).toString(16)}`, { gasLimit: 350000, value: `0x${JSBI.BigInt(priceInput * (10 ** 18)).toString(16)}` })
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

  return (
    <>
      <div className='col-md-6 col-sm-12 col-xs-12 div-center'>
        <br />
        <br />
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <div className="header-title">
              <h4 className="card-title title-card">Presale</h4>
            </div>
          </div>
          <div className="card-body">
            <form >
              <div className="input-group">
                <input
                  className='form-control'
                  id="tokenInput"
                  name="tokenInput"
                  type="number"
                  onChange={handleChange}
                  value={priceInput}
                />

                <div className="input-group-append">
                  <button style={{ width: '100%', color: '#05bbc9', background:'#dff6f8', border:'none' }} className="btn btn-success" type="button"  >
                  <img src={HTIcon} width='20' /> {'HT'}
                    </button>
                </div>
              </div>

              <br />
              <div className="input-group">
                <input className='form-control'
                  id="tokenOuput"
                  name="tokenOutput"
                  type="number"
                  readOnly
                  onChange={handleChange}
                  value={priceOutput}
                />
                <div className="input-group-append">
                  <button style={{ width: '100%', color: '#05bbc9', background:'#dff6f8', border:'none' }} className="btn btn-success" type="button">
                    <img src={tokenInfo.logoURI} width='20' /> {tokenInfo.symbol}
                  </button>
                </div>
              </div>
              <br />
              <div className="input-group">
                <button onClick={PresaleBuy} style={{ width: '100%', color: '#05bbc9', background:'#dff6f8', border:'none' }} className="btn btn-success" type="button"  >
                  Buy
               </button>
              </div>
              <br/>
             
              <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                        Price
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                        {rateToken ? rateToken  : '-'} ZERO per HT
                      </ClickableText>
                    </RowBetween>
                    {investToken ? 
                    (<RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                        Invest:
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={'#05bbc9'}>
                            {'1.000'}
                      </ClickableText>
                    </RowBetween>)
                    : ''
                    }
                    
            </form>
            <br />
            {activeClaimPresale ?
              (<div className="input-group">
                <button style={{ width: '100%', color: '#05bbc9', background:'#dff6f8', border:'none' }} className="btn btn-success" type="button" >Your claimable purchased tokens: {tokenClaim ? tokenClaim : '0'}</button>
              </div>)
              :
              (<div className="input-group">
                <button style={{ width: '100%', color: 'black', background:'#e9ecef' , border:'none' }} className="btn btn-success" type="button" disabled>Your claimable purchased tokens: {tokenClaim ? tokenClaim : '0'}</button>
              </div>)
            }
            <br />
           
          </div>
        </div>
      </div>
    </>
  )
}
