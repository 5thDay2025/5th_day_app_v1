import { AutonomyList } from './components/AutonomyList';
import { Auth } from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div>
      <h1>5th Day App</h1>
      <button 
        onClick={() => supabase.auth.signOut()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Sign Out
      </button>

      <div>
        <h2>Debug Info:</h2>
        <p>React is running: ✅</p>
        <p>Testing Supabase connection below:</p>
      </div>
      
      <AutonomyList />
    </div>
  );
}

export default App; 
