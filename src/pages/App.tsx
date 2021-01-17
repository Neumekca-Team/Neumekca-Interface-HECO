import React, { Suspense } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from './AddLiquidity/redirects'
import MigrateV1 from './MigrateV1'
import MigrateV1Exchange from './MigrateV1/MigrateV1Exchange'
import RemoveV1Exchange from './MigrateV1/RemoveV1Exchange'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Exchange from './Exchange'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'


// import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'

import Nar from './Nar'
import Nft from './Nft'
import Gachapon from './Nft/gachapon'
import Collection from './Nft/collection'
import Mining from './Nft/mining'
import Manage from './Nar/Manage'
import Capped from './Capped'
import CappedManage from './Capped/Manage'
import Dividend from './Dividend'
import GemPools from './GemPools'
import Gold from './Gold'
import Bazaar from './Bazaar'
import Account from './Bazaar/account'
import Dashboard from './Dashboard'


const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  return (
    <Suspense fallback={null}>
        <div className="wrapper">
        <Web3ReactManager>
      <HashRouter>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <Header />
        <div className="content-page">
          <div className="container-fluid">
          <Popups />
          <Switch>
            <Route exact path="/" component={Dashboard} />
                  <Route exact path="/add" component={AddLiquidity} />
                  <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                  <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                  <Route exact strict path="/swap" component={Exchange} />
                  <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                  <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                  <Route exact strict path="/find" component={PoolFinder} />
                  <Route exact strict path="/pool" component={Pool} />
                  <Route exact strict path="/create" component={RedirectToAddLiquidity} />
                  <Route exact strict path="/dashboard" component={Dashboard} />
                  <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
                  <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                  <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                  <Route exact strict path="/migrate/v1" component={MigrateV1} />
                  <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} />
                  <Route exact strict path="/farms" component={Nar} />
                  <Route exact strict path="/farms/:poolId/:currencyIdA/:currencyIdB" component={Manage} />
                  <Route exact strict path="/capped" component={Capped} />
                  <Route exact strict path="/capped/:poolId/:currencyIdA/:currencyIdB" component={CappedManage} />
                  <Route exact strict path="/my-nft" component={Nft} />
                  <Route exact strict path="/gachapon" component={Gachapon} />
                  <Route exact strict path="/collection" component={Collection} />
                  <Route exact strict path="/mining" component={Mining} />
                  <Route exact strict path="/dividend" component={Dividend} />
                  <Route exact strict path="/gempools" component={GemPools} />
                  <Route exact strict path="/gold" component={Gold} />
                  <Route exact strict path="/bazaar" component={Bazaar} />
                  <Route exact strict path="/account" component={Account} />
                </Switch>
          
            </div>
            </div>
      </HashRouter>
      </Web3ReactManager>
      </div>
    </Suspense>
  )
}
