import { ChainId } from '@bscswap/sdk'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'

import { NavLink } from 'react-router-dom'

import styled from 'styled-components'

import Logo from '../../assets/images/logo.png'
import LogoDark from '../../assets/images/logo_white.png'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'

import { YellowCard } from '../Card'
import Settings from '../Settings'
import Menu from '../Menu'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import logoWhite from '../../assets/images/logo-white.png';
import logo from '../../assets/images/logo.png';
import NavigationTabs from '../NavigationTabs';


const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.BSC_MAINNET]: null,
  [ChainId.BSC_TESTNET]: 'Testnet',
  [ChainId.HT_MAINNET]: null,
  [ChainId.HT_TESTNET]: 'Testnet'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useETHBalances([account])[account]
  const [isDark] = useDarkModeManager()

  return (
   
    <header>
      <NavigationTabs />
      <div className="iq-top-navbar custom-navbar">
        <div className="iq-navbar-custom">
          <nav className="navbar navbar-expand-lg navbar-light p-0">
            <div className="iq-navbar-logo d-flex align-items-center justify-content-between">
              <i className="ri-menu-line wrapper-menu" />
              {/* <a href="/" className="header-logo">
                <img src={logo} className="img-fluid rounded-normal light-logo" alt="logo" />
               
              </a> */}
            </div>
            <div className="iq-search-bar device-search">


            </div>
            <div className="d-flex align-items-center margin-top-10px">
              <div className="change-mode">
                <div className="custom-control custom-switch custom-switch-icon custom-control-inline">
                  {/* <div className="custom-switch-inner">
                    <p className="mb-0"> </p>
                    <input type="checkbox" className="custom-control-input" id="dark-mode" data-active="true" />
                    <label className="custom-control-label" htmlFor="dark-mode" data-mode="toggle">
                      <span className="switch-icon-left"><i className="a-left ri-moon-clear-line" /></span>
                      <span className="switch-icon-right"><i className="a-right ri-sun-line" /></span>
                    </label>
                  </div> */}
                </div>
              </div>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-label="Toggle navigation">
                <i className="ri-menu-3-line" />
              </button>
              <div className="collapse navbar-collapse height-50px margin-top-3px" id="navbarSupportedContent">
                <ul className="navbar-nav ml-auto navbar-list align-items-center">
                  <li className="nav-item nav-icon search-content">

                  </li>
                  <li>
                    <Web3Status />
                  </li>

                  {/* <li class="nav-item iq-full-screen"><a href="#" class="" id="btnFullscreen"><i class="ri-fullscreen-line"></i></a></li> */}
                  {/* <AccountInfo /> */}
                </ul>
              </div>


            </div>
          </nav>
        </div>
      </div>
    </header>

  )
}
