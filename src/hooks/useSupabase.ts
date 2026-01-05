import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Autonomy,
  AutonomyGrade,
  User,
  FocusArea,
} from '../types/database.types';

export const useCurrentUser = (email: string | undefined) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user')
          .select('id, created_at, updated_at, first_name, last_name, email, role_id, grade_level_id, google_drive_link')
          .eq('email', email)
          .single();

        if (error) throw error;
        setCurrentUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [email]);

  return { currentUser, loading, error };
};

export const useStudentAutonomy = (studentId: string | undefined) => {
  const [studentAutonomy, setStudentAutonomy] = useState<{
    autonomy: Autonomy | null;
    autonomyGrade: AutonomyGrade | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStudentAutonomy = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        // First get the student's autonomy score
        type ScoreResponse = {
          autonomy_id: string;
          autonomy_grade_id: string;
          autonomy: {
            id: string;
            name: string;
            description: string;
            created_at?: string;
            updated_at?: string;
          };
          autonomy_grade: {
            id: string;
            name: string;
            created_at?: string;
            updated_at?: string;
          };
        };

        const { data: scoreData, error: scoreError } = await supabase
          .from('student_autonomy_score')
          .select(`
            autonomy_id,
            autonomy_grade_id,
            autonomy (
              id,
              name,
              description,
              created_at,
              updated_at
            ),
            autonomy_grade (
              id,
              name,
              created_at,
              updated_at
            )
          `)
          .eq('student_id', studentId)
          .single();

        if (scoreError) throw scoreError;

        if (scoreData) {
          const data = scoreData as unknown as ScoreResponse;
          const autonomyData = data.autonomy;
          const gradeData = data.autonomy_grade;

          if (!autonomyData || !gradeData) {
            setStudentAutonomy(null);
            return;
          }

          const autonomy: Autonomy = {
            id: String(autonomyData.id),
            created_at: autonomyData.created_at || new Date().toISOString(),
            updated_at: autonomyData.updated_at || new Date().toISOString(),
            name: autonomyData.name,
            description: autonomyData.description
          };

          const autonomyGrade: AutonomyGrade = {
            id: String(gradeData.id),
            created_at: gradeData.created_at || new Date().toISOString(),
            updated_at: gradeData.updated_at || new Date().toISOString(),
            name: gradeData.name
          };

          setStudentAutonomy({
            autonomy,
            autonomyGrade
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAutonomy();
  }, [studentId]);

  return { studentAutonomy, loading, error };
};

export const useFocusAreas = (studentId: string | undefined) => {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [focusAreaScores, setFocusAreaScores] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFocusAreasAndScores = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        // First get all focus areas
        const { data: allFocusAreas, error: focusAreasError } = await supabase
          .from('focus_area')
          .select('*')
          .order('name');

        if (focusAreasError) throw focusAreasError;
        
        // Create a map of all focus areas
        const uniqueFocusAreas = new Map<string, FocusArea>();
        allFocusAreas?.forEach(fa => {
          uniqueFocusAreas.set(fa.id, fa as FocusArea);
        });

        if (!studentId) {
          setFocusAreas(Array.from(uniqueFocusAreas.values()));
          setLoading(false);
          return;
        }

        // Get student's courses
        const { data: studentCourses, error: coursesError } = await supabase
          .from('course_student')
          .select('course_id')
          .eq('student_id', studentId);

        if (coursesError) throw coursesError;
        const courseIds = studentCourses?.map(sc => sc.course_id) || [];

        // Get course focus areas for these courses
        const { data: courseFocusAreas, error: cfaError } = await supabase
          .from('course_focus_area')
          .select('id, focus_area_id')
          .in('course_id', courseIds);

        if (cfaError) throw cfaError;

        // Get student's scores for these course focus areas
        const { data: studentScores, error: scoresError } = await supabase
          .from('student_focus_area_score')
          .select(`
            course_focus_area_id,
            focus_area_grade_id,
            course_focus_area!inner (
              focus_area_id
            ),
            focus_area_grade!inner (
              name
            )
          `)
          .in('course_focus_area_id', courseFocusAreas?.map(cfa => cfa.id) || []);

        if (scoresError) throw scoresError;

        // Calculate median scores for each focus area
        const scoresByFocusArea = new Map<string, number[]>();
        studentScores?.forEach(score => {
          const courseFocusArea = score.course_focus_area as unknown as { focus_area_id: string } | null;
          const focusAreaGrade = score.focus_area_grade as unknown as { name: string } | null;
          const focusAreaId = courseFocusArea?.focus_area_id;
          const gradeScore = focusAreaGrade?.name ? parseInt(focusAreaGrade.name) : undefined;
          
          if (focusAreaId && gradeScore !== undefined) {
            const scores = scoresByFocusArea.get(focusAreaId) || [];
            scores.push(gradeScore);
            scoresByFocusArea.set(focusAreaId, scores);
          }
        });

        // Calculate median for each focus area
        const medianScores = new Map<string, number>();
        scoresByFocusArea.forEach((scores, focusAreaId) => {
          if (scores.length === 0) {
            medianScores.set(focusAreaId, 6); // Default score
          } else {
            const sortedScores = [...scores].sort((a, b) => a - b);
            const mid = Math.floor(sortedScores.length / 2);
            const median = sortedScores.length % 2 === 0
              ? (sortedScores[mid - 1] + sortedScores[mid]) / 2
              : sortedScores[mid];
            medianScores.set(focusAreaId, median);
          }
        });

        // Set default score of 6 for focus areas without scores
        uniqueFocusAreas.forEach((_, focusAreaId) => {
          if (!medianScores.has(focusAreaId)) {
            medianScores.set(focusAreaId, 6);
          }
        });

        setFocusAreas(Array.from(uniqueFocusAreas.values()));
        setFocusAreaScores(medianScores);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchFocusAreasAndScores();
  }, [studentId]);

  return { focusAreas, focusAreaScores, loading, error };
};


