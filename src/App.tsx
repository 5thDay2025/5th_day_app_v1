import { AutonomyList } from './components/AutonomyList';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';

function App() {
  const { user, loading } = useAuth();
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're on a password reset page
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetPassword(true);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setError(null);

      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session check error:', sessionError);
      }
      console.log('Current session:', session);

      // Try to sign out
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Try local signout first instead of global
      });
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Clear any local storage
      localStorage.clear();
      
      // Force reload the page to clear any cached state
      window.location.href = import.meta.env.BASE_URL;
    } catch (err) {
      console.error('Sign out process error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setSigningOut(false);
    }
  };

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
      <div style={{ position: 'relative' }}>
        <button 
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: signingOut ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            opacity: signingOut ? 0.7 : 1,
          }}
        >
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
        {error && (
          <div style={{ 
            color: 'red', 
            marginTop: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>

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
