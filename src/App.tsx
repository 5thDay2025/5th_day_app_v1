import { AutonomyList } from './components/AutonomyList';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';

function App() {
  const { user, loading } = useAuth();
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    // Check if we're on a password reset page
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetPassword(true);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isResetPassword) {
    return <ResetPassword />;
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
