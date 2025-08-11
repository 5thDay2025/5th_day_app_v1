import React from 'react';
import { supabase } from '../lib/supabase';
import type { Autonomy } from '../types/database.types';

export const AutonomyList: React.FC = () => {
  console.log('AutonomyList component rendering');

  const [autonomies, setAutonomies] = React.useState<Autonomy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAutonomies = async () => {
      try {
        console.log('Starting to fetch autonomies...');

        const { data, error } = await supabase
          .from('autonomy')
          .select('id, created_at, updated_at, name, description');

        console.log('Raw response:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          console.log('No data returned');
          setAutonomies([]);
          return;
        }

        console.log('Fetched autonomies:', data);
        console.log('First autonomy:', data[0]);
        
        // Validate the data matches our interface
        const validatedData = data.map(item => ({
          id: String(item.id),
          created_at: item.created_at,
          updated_at: item.updated_at,
          name: item.name,
          description: item.description
        }));

        setAutonomies(validatedData);
      } catch (err) {
        console.error('Error fetching autonomies:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAutonomies();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>

      {loading ? (
        <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem' }}>
          <h3>Loading autonomies...</h3>
          <p>Checking Supabase connection...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', border: '1px solid red', margin: '1rem' }}>
          <h3>Error Loading Autonomies</h3>
          <p>Error: {error}</p>
          <div>
            <h4>Troubleshooting:</h4>
            <ul>
              <li>Check if the table exists in the public schema</li>
              <li>Verify RLS policies are configured correctly</li>
              <li>Click the test button above to see available tables</li>
            </ul>
          </div>
        </div>
      ) : autonomies.length === 0 ? (
        <div style={{ padding: '1rem', border: '1px solid orange', margin: '1rem' }}>
          <h3>No Autonomies Found</h3>
          <p>The query completed successfully but no records were returned.</p>
          <div>
            <h4>Debug Information:</h4>
            <ul>
              <li>Loading state: {loading ? 'Yes' : 'No'}</li>
              <li>Error state: {error ? error : 'None'}</li>
              <li>Records found: {autonomies.length}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <h2>Autonomies Found: {autonomies.length}</h2>
          <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
            {autonomies.map(autonomy => (
              <div 
                key={autonomy.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '4px'
                }}
              >
                <h3>{autonomy.name}</h3>
                <p>{autonomy.description}</p>
                <small>Created: {new Date(autonomy.created_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
