import React from 'react';
import { useCourses } from '../hooks/useSupabase';

export const CourseList: React.FC = () => {
  const { courses, loading, error } = useCourses();

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Courses</h2>
      <div className="course-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.name}</h3>
            <p>{course.description}</p>
            <div className="course-meta">
              <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
              {course.is_archived && <span className="archived-badge">Archived</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 