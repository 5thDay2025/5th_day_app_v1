export interface Autonomy {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

export interface AutonomyGrade {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface StudentAutonomyScore {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  autonomy_grade_id: string;
  autonomy_id: string;
  autonomy?: Autonomy;
  autonomy_grade?: AutonomyGrade;
}

export interface FocusArea {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
}

export interface Course {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface CourseStudent {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  course_id: string;
  course?: Course;
}

export interface CourseFocusArea {
  id: string;
  created_at: string;
  updated_at: string;
  course_id: string;
  focus_area_id: string;
  course?: Course;
  focus_area?: FocusArea;
}

export interface FocusAreaGrade {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  score: number;
}

export interface StudentFocusAreaScore {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  course_focus_area_id: string;
  focus_area_grade_id: string;
  course_focus_area?: CourseFocusArea;
  focus_area_grade?: FocusAreaGrade;
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  grade_level_id?: number;
  google_drive_link?: string;
}

export interface StudentGoogleDrive {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  google_drive_link: string;
} 
