export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  imageUrl: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'text';
  question: string;
  options?: string[];
  required: boolean;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | string[];
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  dueDate: string;
}

export interface Plan {
  id: string;
  title: string;
  categories: PlanCategory[];
  createdAt: string;
}

export interface PlanCategory {
  id: string;
  name: string;
  tasks: PlanTask[];
  description: string;
}

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface UserProgress {
  totalTasks: number;
  completedTasks: number;
  streak: number;
  weeklyProgress: number;
}