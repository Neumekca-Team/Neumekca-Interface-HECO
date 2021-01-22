import React, { useCallback, useState } from 'react'
import { withRouter, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import logoWhite from '../../assets/images/logo-white.png';
import logo from '../../assets/images/logo.png';

import { darken } from 'polished'
import { Link as HistoryLink } from 'react-router-dom'

import { ArrowLeft } from 'react-feather'
import { RowBetween } from '../Row'
import QuestionHelper from '../QuestionHelper'

const tabOrder = [
  {
    path: '/dashboard',
    textKey: 'dashboard',
    icon: 'ri-home-wifi-line',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/dashboard\/''/,
    className: '',
  },
  {
    path: '/presale',
    textKey: 'Presale',
    icon: 'ri-shopping-cart-fill',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/presale/,
    className: '',
  },
  {
    path: '/farms',
    textKey: 'Farms',
    icon: 'lab la-sketch',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/farms/,
    className: '',
  },
  {
    path: '/swap',
    textKey: 'Swap',
    icon: 'las la-retweet',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/swap/,
    className: '',
  },
  {
    path: '/snow',
    textKey: 'SNOW',
    icon: 'ri-coin-line',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/snow/,
    className: '',
    hasChild: true,
    Childs: [
      {
        path: '/snow',
        textKey: 'SNOW',
        icon: 'ri-money-dollar-circle-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/snow/,
        className: '',
      },
      {
        path: '/snowpools',
        textKey: 'SNOW pools',
        icon: 'ri-hand-coin-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/snowpools/,
        className: '',
      }
    ]
  },
  {
    path: '/leon',
    textKey: 'LEON',
    icon: 'ri-copper-diamond-line',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/leon/,
    className: '',
  },
  {
    path: '/myNft',
    textKey: 'NFT',
    icon: 'ri-folder-2-line',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/myNft/,
    className: '',
    hasChild: true,
    Childs: [
      {
        path: '/cryotank',
        textKey: 'Cryotank',
        icon: 'ri-hand-coin-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/cryotank/,
        className: '',
      },
      {
        path: '/collection',
        textKey: 'Collection',
        icon: 'ri-folders-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/collection/,
        className: '',
      },
      {
        path: '/mining',
        textKey: 'Mining',
        icon: 'ri-landscape-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/mining/,
        className: '',
      },
      {
        path: '/my-nft',
        textKey: 'My NFT',
        icon: 'ri-image-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/my-nft/,
        className: '',
      }
    ]
  },
  {
    path: '/souk',
    textKey: 'Souk',
    icon: 'ri-store-2-line',
    // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
    regex: /\/souk/,
    className: '',
    hasChild: true,
    Childs: [
      {
        path: '/souk',
        textKey: 'Souk',
        icon: 'ri-store-2-line',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/souk/,
        className: '',
      },
      {
        path: '/account',
        textKey: 'Account',
        icon: 'ri-account-box-fill',
        // iconActive: require('../../assets/images/icon/dashboard-white.svg'),
        regex: /\/account/,
        className: '',
      }
    ]
  },
]

function NavigationTabs({ location: { pathname }, history }) {
  const { t } = useTranslation()

  const navigate = useCallback(
    direction => {
      const tabIndex = tabOrder.findIndex(({ regex }) => pathname.match(regex))
      history.push(tabOrder[(tabIndex + tabOrder.length + direction) % tabOrder.length].path)
    },
    [pathname, history]
  )
  const navigateRight = useCallback(() => {
    navigate(1)
  }, [navigate])
  const navigateLeft = useCallback(() => {
    navigate(-1)
  }, [navigate])


  const [navHover, setNavHover] = useState(false)

  function toggleHover(textKey) {
    setNavHover(textKey)
  }
  return (
    <>
      <div className="iq-sidebar  sidebar-default ">
        <div className="iq-sidebar-logo d-flex align-items-center justify-content-between">
          <a href="/" className="header-logo">
            <img src={logo} className="img-fluid rounded-normal light-logo" alt="logo" />

          </a>
          <div className="iq-menu-bt-sidebar">
            <i className="las la-bars wrapper-menu" />
          </div>
        </div>
        <div className="data-scrollbar" data-scroll={1}>
          <nav className="iq-sidebar-menu">
            <ul id="iq-sidebar-toggle" className="iq-menu">
              {tabOrder.map(({ path, textKey, regex, icon, className, hasChild, Childs }, index) => {

                return (
                  !hasChild ? (

                    <li className={regex.test(window.location.pathname) || (window.location.pathname == '/' && path == '/dashboard') ? 'active' : ''} key={index}>
                      <NavLink key={index} to={path} className={(className ? className : '')} onMouseEnter={() => { toggleHover(textKey) }} onMouseLeave={() => { toggleHover('') }}>
                        <i className={icon} /><span> {t(textKey)}</span>
                      </NavLink>
                    </li>
                  ) : (

                      <li key={textKey} className="">
                        <a href={'#'+textKey} className="collapsed" data-toggle="collapse" aria-expanded="false">
                          <i className={icon + ' iq-arrow-left'}></i><span>{textKey}</span>
                          <i className="las la-angle-right iq-arrow-right arrow-active"></i>
                          <i className="las la-angle-down iq-arrow-right arrow-hover"></i>
                        </a>
                        <ul key={textKey} id={textKey} className="iq-submenu collapse" data-parent="#iq-sidebar-toggle">
                          {Childs.map(({ path, textKey, regex, icon, className }, idx) => {
                            return (
                                    <li className={regex.test(window.location.pathname) || (window.location.pathname == '/' && path == '/dashboard') ? 'active' : ''} key={textKey}>
                                    <NavLink key={index} to={path} className={(className ? className : '')} onMouseEnter={() => { toggleHover(textKey) }} onMouseLeave={() => { toggleHover('') }}>
                                      <i className={icon} /><span> {t(textKey)}</span>
                                    </NavLink>
                                  </li>
                                  );
                              })
                          }
                        </ul>
                      </li>

                    )
                );
              })}
              <hr />
              <li className="">
                <a href="#icon" className="collapsed" data-toggle="collapse" aria-expanded="false">
                  <i className="ri-notification-line iq-arrow-left"></i><span>Soccial</span>
                  <i className="las la-angle-right iq-arrow-right arrow-active"></i>
                  <i className="las la-angle-down iq-arrow-right arrow-hover"></i>
                </a>
                <ul id="icon" className="iq-submenu collapse" data-parent="#iq-sidebar-toggle">
                  <li className=" ">
                    <a href="https://t.me/neumekcagroup"  target='_blank'>
                      <i className="ri-telegram-fill"></i><span>Telegram</span>
                    </a>
                  </li>
                  <li className=" ">
                    <a href="https://twitter.com/Neumekca"  target='_blank'>
                      <i className="ri-twitter-line"></i><span>Twitter</span>
                    </a>
                  </li>
                  <li className=" ">
                    <a href="https://medium.com/@neumekcacity" target='_blank'>
                      <i className="ri-medium-fill"></i><span>Medium</span>
                    </a>
                  </li>
                  <li className=" ">
                    <a href="https://github.com/Neumekca-City"  target='_blank'>
                      <i className="ri-github-fill"></i><span>Github</span>
                    </a>
                  </li>
                  <li className=" ">
                    <a href="https://naplesblockchain.space/wp-content/uploads/2021/01/Neumekca-City-Security-Audit-Report-by-Naples.pdf" target='_blank'>
                      <i className="ri-shield-star-fill"></i><span>Audit Report</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
          <div className="p-3" />
        </div>
      </div>
    </>
  )
}

export default withRouter(NavigationTabs)

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  // //border-radius: 3rem;
  justify-content: space-between;
 // border: 1px solid ${({ theme }) => theme.bg1};
 // background: ${({ theme }) => theme.bg1};
 // box-shadow: 5px 5px 10px ${({ theme }) => theme.shadowColor1}, -5px -5px 10px ${({ theme }) => theme.shadowColor2};
  width: 100%;
  margin-bottom: 15px;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  padding: 8px;
  // //border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: black;
  font-size: 16px;
  font-weight: bold;
  flex: 1;
  transition: 0.3s;

  &.${activeClassName} {
    // //border-radius: 12px;
    font-weight: 700;
    //border-radius: 5px;;
    color: ${({ theme }) => theme.text1};
    // //border-radius: 12px;
    background: ${({ theme }) => theme.bg1};
    box-shadow: inset 5px 5px 10px ${({ theme }) => theme.shadowColor1},
      inset -5px -5px 10px ${({ theme }) => theme.shadowColor2};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    box-shadow: inset 5px 5px 10px ${({ theme }) => theme.shadowColor1}, inset -5px -5px 10px ${({ theme }) => theme.shadowColor2};
  }
`

const TabButton = styled.button<{ isActive: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.bg1};
  background: ${({ theme }) => theme.bg1};
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 16px;
  flex: 1;
  font-weight: ${({ isActive }) => (isActive ? 700 : 400)};
  color: ${({ theme, isActive }) => (isActive ? theme.text1 : theme.text3)};
  box-shadow: ${({ theme, isActive }) => (isActive ? 'inset 5px 5px 10px' + theme.shadowColor1 : '')},
    ${({ theme, isActive }) => (isActive ? 'inset -5px -5px 10px' + theme.shadowColor2 : '')};

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 700;
  font-size: 16px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function SelectPoolTabs({ active }: { active: string }) {
  return (
    <Tabs style={{}}>
      <StyledNavLink to={'/farms'} isActive={() => active === 'normal'}>
        {'NORMAL'}
      </StyledNavLink>
      <StyledNavLink to={'/capped'} isActive={() => active === 'capped'}>
        {'BITCOIN POOLS'}
      </StyledNavLink>
    </Tabs>
  )
}

export function SelectGEMTabs({ active }: { active: string }) {
  return (
    <Tabs style={{}}>
      <StyledNavLink to={'/snow'} isActive={() => active === 'snow'}>
        {'SNOW NOW'}
      </StyledNavLink>
      <StyledNavLink to={'/snowools'} isActive={() => active === 'snowpools'}>
        {'SNOW POOLS'}
      </StyledNavLink>
    </Tabs>
  )
}

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' | 'presale' }) {
  const { t } = useTranslation()
  var tmp;

  switch(active){
    case 'swap':
      tmp = <HeaderCard>
      {t('swap')}
    </HeaderCard>
    break;
    case 'pool':
      tmp = <HeaderCard>
      {t('pool')}
    </HeaderCard>
    break;
    default:
      tmp = <HeaderCard>
      {'Presale'}
    </HeaderCard>
    break;
  }

  return (
    <Tabs style={{}}>
      {tmp}
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem' }}>
        <HistoryLink to="/swap">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>Import Pool</ActiveText>
        <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem' }}>
        <HistoryLink to="/swap">
          <StyledArrowLeft />

        </HistoryLink>
        <ActiveText>{adding ? 'Add' : 'Remove'} Liquidity</ActiveText>
        <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        />
      </RowBetween>
    </Tabs>
  )
}


export const HeaderCard = styled.div
  ` align-items: center;
  justify-content: center;
  padding: 8px;
  // //border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: #05bbc9;
  font-size: 30px;
  font-weight: bold;
  flex: 1;
  transition: 0.3s;
  text-align: center;
  `

