import React from 'react';
import type { User } from '../types/database.types';
import './WellspringPulseCheck.css';

interface Props {
  currentUser: User | null;
}

export const WellspringPulseCheck: React.FC<Props> = ({ currentUser }) => {
  const isStudent = currentUser?.role_id === 3;

  if (!isStudent) {
    return null;
  }

  return (
    <div className="wellspring-container">
      <div className="wellspring-pulse-check">
        <h2 className="pulse-check-title">Wellspring Pulse Check</h2>
        <p className="pulse-check-description">
          Take a moment to reflect on your wellbeing and growth.
        </p>
        <a 
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="pulse-check-link"
        >
          Complete Pulse Check Survey
        </a>
      </div>
    </div>
  );
};
