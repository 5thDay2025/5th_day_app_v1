import { useState } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import './App.css'

// Initialize Supabase client - only if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

function App() {
  const [message] = useState('Welcome to React + Supabase!')

  return (
    <div className="App">
      <header className="App-header">
        <h1>{message}</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p className="small">
          {!supabase && 'Note: Supabase is not configured yet. Add your credentials to .env'}
        </p>
      </header>
    </div>
  )
}

export default App 