import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import { margin } from 'polished';


let tokenSailorMoon = '0x514910771af9ca656af840dff83e8264ecf986ca';
let tokenNeumekca = '0x522DE80C85B8a736A19e1D073c849EF6a7f055A6';


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

  return (
    <>
      <PresalePoolBox>
        <PresalePool>
          <StyledNavLink to={'/presale/sale?token=' + tokenNeumekca}>
            <div className='default'>
              <div className='img'><img className='logo-presale-list' src={logo} alt=""  /></div>
              <div className='info'>
                <h3>Neumékca City</h3>
              </div>
            </div>
          </StyledNavLink>
        </PresalePool>
      </PresalePoolBox>
    </>
  )
}