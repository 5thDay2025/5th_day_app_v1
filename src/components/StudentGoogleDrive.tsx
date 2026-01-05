import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database.types';
import './StudentGoogleDrive.css';

interface Props {
  currentUser: User | null;
}

export const StudentGoogleDrive: React.FC<Props> = ({ currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedLink, setUpdatedLink] = useState<string | null>(null);

  const isStudent = currentUser?.role_id === 3;
  const driveLink = updatedLink !== null ? updatedLink : currentUser?.google_drive_link;

  // Reset updatedLink when currentUser changes (e.g., after refresh)
  React.useEffect(() => {
    setUpdatedLink(null);
  }, [currentUser?.google_drive_link]);

  const handleOpenModal = () => {
    setEditLink(driveLink || '');
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditLink('');
    setError(null);
  };

  const handleSaveLink = async () => {
    if (!currentUser?.id) return;

    setSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user')
        .update({ 
          google_drive_link: editLink.trim() || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', currentUser.id)
        .select('google_drive_link')
        .single();

      if (error) throw error;
      
      setUpdatedLink(data.google_drive_link);
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  const handleGoToDrive = () => {
    if (driveLink) {
      window.open(driveLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isStudent) {
    return null;
  }

  const hasLink = !!driveLink;

  return (
    <>
      <div className="student-google-drive">
        <h2 className="drive-title">Documents and Evidence</h2>
        <p className="drive-description">Featured work selected by the learner. </p>
        
        {hasLink ? (
          <div className="drive-actions">
            <button 
              onClick={handleGoToDrive}
              className="drive-button go-to-drive"
            >
              Go to Drive
            </button>
            <button 
              onClick={handleOpenModal}
              className="drive-button edit-link"
            >
              Edit Link
            </button>
          </div>
        ) : (
          <div className="drive-actions">
            <button 
              onClick={handleOpenModal}
              className="drive-button edit-link"
            >
              Add Link
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{hasLink ? 'Edit Google Drive Link' : 'Add Google Drive Link'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {/* <label htmlFor="drive-link-input" className="modal-label">
                Google Drive Link:
              </label> */}
              <input
                id="drive-link-input"
                type="url"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="modal-input"
              />
              {error && (
                <p className="modal-error">{error}</p>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleCloseModal}
                className="modal-button cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLink}
                className="modal-button save"
                disabled={saving || !editLink.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

