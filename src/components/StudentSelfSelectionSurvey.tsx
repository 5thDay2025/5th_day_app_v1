import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, FocusArea } from '../types/database.types';
import './StudentSelfSelectionSurvey.css';

interface Props {
  currentUser: User | null;
}

interface SurveyResponse {
  focus_area_id: string;
  focus_area_grade_id: string;
  score: number; // Keep for UI purposes
}

const RATING_LABELS: { [key: number]: string } = {
  6: 'Not Yet',
  7: 'Launching',
  8: 'Showing',
  9: 'Evolving',
  10: 'Thriving'
};

// Map focus area names to descriptions
// Note: Database names may vary slightly (e.g., "Creative Problem-Solving and Design Thinking" vs "Creative Problem-Solving")
const FOCUS_AREA_DESCRIPTIONS: { [key: string]: string } = {
  'Self-Direction': 'I manage my time, stay focused without reminders, set goals and follow through on them, and take initiative when I am stuck.',
  'Critical Thinking': 'I form my opinion after analyzing information, ask good questions that deepen my understanding, and use evidence to support my ideas.',
  'Creative Problem-Solving': 'I try multiple approaches when the first one doesn\'t work, generate original ideas, empathize with the needs of others, and use any failures to revise my ideas.',
  'Creative Problem-Solving and Design Thinking': 'I try multiple approaches when the first one doesn\'t work, generate original ideas, empathize with the needs of others, and use any failures to revise my ideas.',
  'Personal Growth and Reflection': 'I notice my own strengths, areas for improvement, use feedback to improve my future work, and take measurable steps to improve myself.',
  'Teamwork and Leadership': 'I communicate and listen in a group setting, support others, and lead when needed.'
};

export const StudentSelfSelectionSurvey: React.FC<Props> = ({ currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [focusAreaGrades, setFocusAreaGrades] = useState<Map<number, string>>(new Map()); // Map score to grade_id
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const isStudent = currentUser?.role_id === 3;

  // Fetch focus areas and last completion date
  useEffect(() => {
    if (!isStudent || !currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch focus areas
        const { data: focusAreasData, error: focusError } = await supabase
          .from('focus_area')
          .select('*')
          .order('name');

        if (focusError) throw focusError;

        // Filter to only the 5 focus areas mentioned
        // Match by exact name or by checking if name starts with the key (for variations like "Creative Problem-Solving and Design Thinking")
        const surveyFocusAreas = (focusAreasData || []).filter(fa => {
          const exactMatch = Object.keys(FOCUS_AREA_DESCRIPTIONS).includes(fa.name);
          const partialMatch = Object.keys(FOCUS_AREA_DESCRIPTIONS).some(key => 
            fa.name.startsWith(key) || key.startsWith(fa.name)
          );
          return exactMatch || partialMatch;
        });

        // Sort to match the preferred order, handling name variations
        const preferredOrder = ['Self-Direction', 'Critical Thinking', 'Creative Problem-Solving', 'Personal Growth and Reflection', 'Teamwork and Leadership'];
        const sortedAreas: FocusArea[] = [];
        
        preferredOrder.forEach(preferredName => {
          // Try exact match first
          let area = surveyFocusAreas.find(fa => fa.name === preferredName);
          // If not found, try partial match (e.g., "Creative Problem-Solving and Design Thinking" matches "Creative Problem-Solving")
          if (!area) {
            area = surveyFocusAreas.find(fa => 
              fa.name.startsWith(preferredName) || preferredName.startsWith(fa.name)
            );
          }
          if (area && !sortedAreas.find(a => a.id === area!.id)) {
            sortedAreas.push(area);
          }
        });

        setFocusAreas(sortedAreas);

        // Fetch focus area grades (6-10) and create a map
        // Note: name field in focus_area_grade contains the numeric score (6, 7, 8, 9, 10)
        const { data: gradesData, error: gradesError } = await supabase
          .from('focus_area_grade')
          .select('id, name')
          .in('name', [6, 7, 8, 9, 10]);

        if (gradesError) throw gradesError;

        const gradeMap = new Map<number, string>();
        gradesData?.forEach(grade => {
          // Handle both string and number types for name field
          const score = typeof grade.name === 'number' ? grade.name : parseInt(String(grade.name));
          if (!isNaN(score) && score >= 6 && score <= 10) {
            gradeMap.set(score, String(grade.id));
          }
        });
        setFocusAreaGrades(gradeMap);

        // Fetch last completion date (get the most recent created_at from any response)
        const { data: lastSurveys, error: surveyError } = await supabase
          .from('student_focus_area_self_selection_score')
          .select('created_at')
          .eq('student_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (surveyError && surveyError.code !== 'PGRST116') {
          console.error('Error fetching last survey:', surveyError);
        } else if (lastSurveys && lastSurveys.length > 0 && lastSurveys[0]?.created_at) {
          setLastCompleted(lastSurveys[0].created_at);
        }
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id, isStudent]);

  const handleStartSurvey = () => {
    setShowModal(true);
    setCurrentStep(0);
    setResponses([]);
    setSelectedScore(null);
    setError(null);
    setIsCompleted(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(0);
    setResponses([]);
    setSelectedScore(null);
    setError(null);
    setIsCompleted(false);
    // Refresh last completed date
    if (currentUser?.id) {
      fetchLastCompleted();
    }
  };

  const fetchLastCompleted = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data: lastSurveys, error: surveyError } = await supabase
        .from('student_focus_area_self_selection_score')
        .select('created_at')
        .eq('student_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (surveyError && surveyError.code !== 'PGRST116') {
        console.error('Error fetching last survey:', surveyError);
      } else if (lastSurveys && lastSurveys.length > 0 && lastSurveys[0]?.created_at) {
        setLastCompleted(lastSurveys[0].created_at);
      }
    } catch (err) {
      console.error('Error fetching last completed:', err);
    }
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleNext = () => {
    if (selectedScore === null) return;

    const currentFocusArea = focusAreas[currentStep];
    const gradeId = focusAreaGrades.get(selectedScore);
    
    if (!gradeId) {
      setError('Invalid score selected');
      return;
    }

    const newResponses = [...responses];
    
    // Update or add response for current focus area
    const existingIndex = newResponses.findIndex(r => r.focus_area_id === currentFocusArea.id);
    if (existingIndex >= 0) {
      newResponses[existingIndex].score = selectedScore;
      newResponses[existingIndex].focus_area_grade_id = gradeId;
    } else {
      newResponses.push({
        focus_area_id: currentFocusArea.id,
        focus_area_grade_id: gradeId,
        score: selectedScore
      });
    }

    setResponses(newResponses);

    if (currentStep < focusAreas.length - 1) {
      // Move to next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Pre-select score if already answered
      const nextResponse = newResponses.find(r => r.focus_area_id === focusAreas[nextStep].id);
      setSelectedScore(nextResponse?.score || null);
    } else {
      // Last step - save and complete
      handleSaveSurvey(newResponses);
    }
  };

  const handleSaveSurvey = async (finalResponses: SurveyResponse[]) => {
    if (!currentUser?.id) return;

    setSaving(true);
    setError(null);

    try {
      // Verify we have responses for all focus areas
      if (finalResponses.length !== focusAreas.length) {
        console.error(`Expected ${focusAreas.length} responses, but got ${finalResponses.length}`);
        setError(`Missing responses. Please answer all questions.`);
        setSaving(false);
        return;
      }

      // Save each response
      for (const response of finalResponses) {
        if (!response.focus_area_id || !response.focus_area_grade_id) {
          console.error('Invalid response:', response);
          throw new Error('Invalid response data');
        }
        // Check if record exists (use maybeSingle to avoid error when no rows)
        const { data: existing, error: checkError } = await supabase
          .from('student_focus_area_self_selection_score')
          .select('id')
          .eq('student_id', currentUser.id)
          .eq('focus_area_id', response.focus_area_id)
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existing) {
          // Update existing record
          const { error } = await supabase
            .from('student_focus_area_self_selection_score')
            .update({
              focus_area_grade_id: response.focus_area_grade_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('student_focus_area_self_selection_score')
            .insert({
              student_id: currentUser.id,
              focus_area_id: response.focus_area_id,
              focus_area_grade_id: response.focus_area_grade_id
            });

          if (error) throw error;
        }
      }

      // Show completion message
      setIsCompleted(true);
      setSaving(false);
      
      // Update last completed date
      setLastCompleted(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save survey');
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!isStudent) {
    return null;
  }

  if (loading) {
    return (
      <div className="self-selection-survey">
        <h2 className="survey-title">Student Self Selection Survey</h2>
        <p className="survey-description">Loading...</p>
      </div>
    );
  }

  const currentFocusArea = focusAreas[currentStep];
  const isLastStep = currentStep === focusAreas.length - 1;

  return (
    <>
      <div className="self-selection-survey">
        <h2 className="survey-title">Student Self Selection Survey</h2>
        <p className="survey-description">
          How have you grown as a learner and teammate in your 5th day experiences? Be honest with yourself, as there are no right or wrong answers. Your reflections will help you recognize your strengths and decide where you want to grow next.
        </p>
        
        {lastCompleted && (
          <p className="survey-last-completed">
            Last completed: {formatDate(lastCompleted)}
          </p>
        )}

        <div className="survey-actions">
          <button 
            onClick={handleStartSurvey}
            className="survey-button start-survey"
          >
            Start Survey
          </button>
        </div>
      </div>

      {showModal && (
        <div className="survey-modal-overlay" onClick={handleCloseModal}>
          <div className="survey-modal-content" onClick={(e) => e.stopPropagation()}>
            {isCompleted ? (
              <div className="survey-completion">
                <h3 className="completion-title">Survey Completed!</h3>
                <p className="completion-message">Thank you for your reflections. Your responses have been saved. Refresh the page to update the radar graph.</p>
                <button 
                  onClick={handleCloseModal}
                  className="survey-modal-button completion-close"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="survey-modal-header">
                  <h3 className="survey-modal-title">Complete Self Selection Survey</h3>
                  <button className="survey-modal-close" onClick={handleCloseModal}>×</button>
                </div>
                
                <div className="survey-modal-body">
                  <p className="survey-question">
                    {currentFocusArea && (
                      FOCUS_AREA_DESCRIPTIONS[currentFocusArea.name] || 
                      FOCUS_AREA_DESCRIPTIONS[Object.keys(FOCUS_AREA_DESCRIPTIONS).find(key => 
                        currentFocusArea.name.startsWith(key) || key.startsWith(currentFocusArea.name)
                      ) || ''] ||
                      'Please rate this focus area.'
                    )}
                  </p>

                  <div className="survey-rating-buttons">
                    {[6, 7, 8, 9, 10].map(score => (
                      <button
                        key={score}
                        onClick={() => handleScoreSelect(score)}
                        className={`rating-button ${selectedScore === score ? 'selected' : ''}`}
                        disabled={saving}
                      >
                        <span className="rating-number">{score}</span>
                        <span className="rating-label">{RATING_LABELS[score]}</span>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <p className="survey-error">{error}</p>
                  )}
                </div>

                <div className="survey-modal-footer">
                  <button 
                    onClick={handleCloseModal}
                    className="survey-modal-button cancel"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleNext}
                    className="survey-modal-button next"
                    disabled={selectedScore === null || saving}
                  >
                    {saving ? 'Saving...' : isLastStep ? 'Complete' : 'Next'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

