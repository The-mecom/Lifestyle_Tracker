import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

const TABLES = ['finances', 'health', 'sleep', 'reading']

const DEFAULTS = {
  finances: { savings: '', investments: '', expenses: [], debts: [] },
  health:   { entries: [] },
  sleep:    { entries: [] },
  reading:  { books: [] },
}

export function useSupabaseData(userId) {
  const [data, setData] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Load all user data on mount
  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setLoading(true)
      const results = await Promise.all(
        TABLES.map(t =>
          supabase.from(t).select('*').eq('user_id', userId).maybeSingle()
        )
      )
      const loaded = {}
      TABLES.forEach((t, i) => {
        const row = results[i].data
        if (row) {
          // Strip db-level keys, keep data fields
          const { id, user_id, updated_at, ...fields } = row
          loaded[t] = { ...DEFAULTS[t], ...fields }
        } else {
          loaded[t] = DEFAULTS[t]
        }
      })
      setData(loaded)
      setLoading(false)
    }
    load()
  }, [userId])

  // Save a specific table to Supabase
  const save = useCallback(async (table, newValue) => {
    setSyncing(true)
    // Upsert: insert or update based on user_id
    await supabase.from(table).upsert(
      { user_id: userId, ...newValue, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSyncing(false)
  }, [userId])

  // Updater factory — call setData locally and persist to Supabase
  const makeUpdater = (table) => (updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev[table]) : updater
      save(table, next)
      return { ...prev, [table]: next }
    })
  }

  return {
    loading,
    syncing,
    finances: data.finances,
    health:   data.health,
    sleep:    data.sleep,
    reading:  data.reading,
    setFinances: makeUpdater('finances'),
    setHealth:   makeUpdater('health'),
    setSleep:    makeUpdater('sleep'),
    setReading:  makeUpdater('reading'),
  }
}
