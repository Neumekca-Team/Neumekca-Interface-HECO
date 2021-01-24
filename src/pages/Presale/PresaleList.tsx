import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { TokenInfo, TokenList } from '@uniswap/token-lists/dist/types'
import { margin } from 'polished';
import { usePresaleContract } from '../../hooks/useContract';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from '../../state/multicall/hooks';
import { useMemo } from 'react'


const PresalePoolBox = styled.div`
  flex-wrap:wrap;
  width: 100%;
  margin-top:20px;
`

const PresalePool = styled.div`
width: 50%;
height: 220px;
margin-bottom: 20px;
.default {
  background: linear-gradient(180deg, #81BEFA 0%, #4A8AF4 100%);
}
&:nth-child(2n) {
  padding-left: 10px;
}
&:nth-child(2n-1) {
  padding-right: 10px;
}


@media screen and (max-width: 960px) {
  width: 100%;
  &:nth-child(2n) {
    padding-left: 0px;
  }
  &:nth-child(2n-1) {
    padding-right: 0px;
  }
}
`

const StyledNavLink = styled(NavLink)`
  width: 100%;
  height: 100%;
  box-shadow: 0.4375rem 0.125rem 1.625rem 0 rgba(0, 0, 0, 0.06);
  display:block;
  border-radius: 10px;
  text-decoration: none;
  .default {
    flex-wrap:wrap;
    width:100%;
    height:100%;
    padding: 22px 10px 0;
    border-radius: 10px;
    .img {
      height:82px;
      border-radius:100%;
      margin:auth;
      img {
        display:block;
        height:100%;
      }
    }
    .info {
      width:100%;
      text-align:center;
      margin:0px 0 0;
      h3 {
        color: #fff;
        font-size:18px;
        margin:0;
        font-weight: 800;
      }
      p {
        color: #fff;
        font-size:14px;
        margin:0;
        padding:0;
        line-height: 35px;
        .pecent {
          padding: 2px 3px;
          background: #14A15E;
          border-radius:4px;
          display:inline-block;
          margin-left: 5px;
          line-height: 21px;
        }
      }
    }
  }
`


export default function FarmsList() {
  const contract = usePresaleContract()
  const tokenList = useSingleCallResult(contract, 'token').result;
 // useMemo(() => (tokenList ? tokenList?.[0] : undefined), [tokenList]);
  if(tokenList !== undefined && tokenList.length > 0){
    var tokenAvaiable = (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0].tokens;
  }

  return (
    <>
      <PresalePoolBox>
        {
          (tokenList !== undefined && tokenList.length > 0) ? 
          tokenList.map((key, index) => {
  
            let obj = tokenAvaiable.filter(x=>x.address == key)[0];
   
            let tmp = (obj !== undefined) ? 
             (
                <PresalePool key={index}>
                <StyledNavLink to={'/presale/sale?token='+ obj.address}>
                  <div className='default'>
                    <div className='img'><img className='logo-presale-list' src={obj.logoURI} alt="" /></div>
                    <div className='info'>
                      <h3>{obj.name}</h3>
                    </div>
                  </div>
                </StyledNavLink>
              </PresalePool>
            )  :  <></>;
            return tmp;
           
         }): <></>
        }
      </PresalePoolBox>
    </>
  )
}