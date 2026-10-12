import { useEffect, useState } from 'react'
import { catalogApi } from '../api/endpoints'

const listOf = (data) => data?.results ?? data ?? []
let cache = null

// Categories and areas rarely change, so they are fetched once per page load.
export default function useCatalog() {
  const [state, setState] = useState(cache || { categories: [], areas: [], loading: true, error: null })

  useEffect(() => {
    if (cache) return
    Promise.all([catalogApi.categories(), catalogApi.areas()])
      .then(([c, a]) => {
        cache = { categories: listOf(c.data), areas: listOf(a.data), loading: false, error: null }
        setState(cache)
      })
      .catch(() => setState((s) => ({ ...s, loading: false, error: 'Could not load categories. Is the backend running?' })))
  }, [])

  return state
}

export { listOf }
