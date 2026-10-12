import { useCallback, useEffect, useState } from 'react'
import { parseError } from '../api/client'

// Runs an API call and tracks { data, loading, error }. Re-runs when deps change.
export default function useApi(request, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { data } = await request()
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: parseError(err).message })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])
  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) }
}
