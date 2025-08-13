import { AutonomyList } from './components/AutonomyList';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import { useCurrentUser } from './hooks/useSupabase';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentUser, loading: userLoading } = useCurrentUser(user?.email);
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
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session before signout:', session);

      try {
        // Try local sign out first
        await supabase.auth.signOut({ scope: 'local' });
      } catch (signOutError) {
        console.error('Initial sign out attempt failed:', signOutError);
      }

      // Clear any local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to base URL
      const baseUrl = import.meta.env.BASE_URL || '/5th_day_app_v1/';
      console.log('Redirecting to:', baseUrl);
      window.location.href = baseUrl;
      
    } catch (err) {
      console.error('Sign out process error:', err);
      setError('Unable to sign out properly. Please try refreshing the page.');
    } finally {
      setSigningOut(false);
    }
  };

  if (authLoading || userLoading) {
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
      <div style={{
        backgroundColor: '#242424',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff' }}>5th Day App</h1>
          {currentUser && (
            <p style={{ 
              margin: '0.5rem 0 0 0',
              color: '#aaa',
              fontSize: '1rem'
            }}>
              Welcome, {currentUser.first_name} {currentUser.last_name}
            </p>
          )}
        </div>
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
            opacity: signingOut ? 0.7 : 1,
          }}
        >
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: '#dc3545', 
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#f8d7da',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <AutonomyList currentUser={currentUser} />
    </div>
  );
}

export default App; 
