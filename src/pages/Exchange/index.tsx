import AppBody from "../AppBody";
import Pool from "../Pool";
import Swap from "../Swap";
import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import AddLiquidity from '../AddLiquidity'
import { HashRouter, Route, Switch } from 'react-router-dom'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from '../AddLiquidity/redirects'
import Web3ReactManager from '../../components/Web3ReactManager'
const ColBeHalfScreenLeft = styled.div`

@media screen and (min-width: 800px) {
    width: 50%;
    // padding-left: 20%;
    padding-right: 5%;
    float: left;
  }

 

    @media screen and (max-width: 800px) {
        width: 100%;
        padding-left: 5%;
    padding-right: 5%;
        float: right;
      }
`
const ColBeHalfScreenRight = styled.div`
@media screen and (min-width: 800px) {
    width: 50%;
    float: left;
  }

 

    @media screen and (max-width: 800px) {
        width: 100%;
        padding-left: 5%;
        padding-right: 5%;
        float: right;
      }
`

export default function Exchange() {

    return (
        <>
        <div className="col-md-12">
            <ColBeHalfScreenLeft>
                <Swap />
            </ColBeHalfScreenLeft>
            <ColBeHalfScreenRight>
                <Pool />
            </ColBeHalfScreenRight>  
        </div>
        </>
    )
}