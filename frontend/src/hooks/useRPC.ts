import { useCallback, useState } from 'react'

import { RPCClient } from '../lib/rpcClient'
import { RPCResult } from '../types'
import { rpcClientState } from '../atoms/rpc'
import { useRecoilValue } from 'recoil'

export const useRPC = () => {
  const client = useRecoilValue(rpcClientState)

  return {
    client
  }
}


export function useRPCOperation<R = RPCResult>(func: (re: R, c: RPCClient) => Promise<any>): [(re: R) => Promise<void>, boolean] {
  const { client } = useRPC()
  const [ loading, setLoading ] = useState(false)
  const f = useCallback((re: R) => {
    setLoading(true)
    return func(re, client).finally(() => setLoading(false))
  }, [])
  return [
    f,
    loading,
  ]
}