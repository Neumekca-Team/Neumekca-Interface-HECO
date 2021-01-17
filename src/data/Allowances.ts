import { Token, TokenAmount } from '@bscswap/sdk'
import { useMemo } from 'react'

import { useTokenContract, useNftContract } from '../hooks/useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(() => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined), [
    token,
    allowance
  ])
}

export function useNftTokenAllowance(owner?: string, operator?: string): boolean | undefined {
  const contract = useNftContract()

  const inputs = useMemo(() => [owner, operator], [owner, operator])
  const allowance = useSingleCallResult(contract, 'isApprovedForAll', inputs).result

  return useMemo(() => (allowance ? allowance?.[0] : undefined), [allowance])
}
