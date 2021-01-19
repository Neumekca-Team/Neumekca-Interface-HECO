import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { updateVersion } from '../user/actions'
import { acceptListUpdate, addList, fetchTokenList } from './actions'

export interface ListsState {
  readonly byUrl: {
    readonly [url: string]: {
      readonly current: TokenList | null
      readonly pendingUpdate: TokenList | null
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
}

const initialState: ListsState = {
  byUrl: {}
}



export default createReducer(initialState, builder =>
  builder
    .addCase(fetchTokenList.pending, (state, { meta: { arg: url, requestId } }) => {

      state.byUrl[url] = {
        current: (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0],
        pendingUpdate: null,
        ...state.byUrl[url],
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: tokenList, meta: { arg: url } }) => {
      const current = state.byUrl[url]?.current

      // no-op if update does nothing
      if (current) {
        const type = getVersionUpgrade(current.version, tokenList.version)
        if (type === VersionUpgrade.NONE) return
        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: null,
          current: (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0],
          pendingUpdate: tokenList
        }
      } else {
        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: null,
          current: (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0],
          pendingUpdate: null
        }
      }
    })
    .addCase(fetchTokenList.rejected, (state, { error, meta: { requestId, arg: url } }) => {
      if (state.byUrl[url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: error.message ?? 'Unknown error',
        current: (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0],
        pendingUpdate: null
      }
    })
    .addCase(addList, (state, { payload: url }) => {
      if (!state.byUrl[url]) {
        state.byUrl[url] = {
          loadingRequestId: null,
          pendingUpdate: null,
          current: (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0],
          error: null
        }
      }
    })
    .addCase(acceptListUpdate, (state, { payload: url }) => {
      if (!state.byUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update')
      }
      state.byUrl[url] = {
        ...state.byUrl[url],
        pendingUpdate: null,
        current: (JSON.parse(localStorage.getItem('myData') || '{}') as TokenList[])[0]
      }
    })
    .addCase(updateVersion, state => {
      delete state.byUrl['https://unpkg.com/@narwhalswap/default-token-list@1.5.9/build/tokens.json']
    })
)
