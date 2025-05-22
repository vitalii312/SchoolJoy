export interface Student {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'at_risk';
}

export interface Badge {
  id: number;
  title: string;
  totalGoals: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  icon?: string;
}

export interface GraduationStats {
  totalStudents: number;
  totalBadges: number;
  completionRate: number;
  studentsAtRisk: number;
} 