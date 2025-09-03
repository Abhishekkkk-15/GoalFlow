import { DailyTask, Plan, ChatMessage, UserProgress } from '../types';

export const mockDailyTasks: DailyTask[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness meditation',
    category: 'Self-Improvement',
    completed: false,
    dueDate: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Read for 30 minutes',
    description: 'Continue reading "Atomic Habits"',
    category: 'Academic',
    completed: true,
    dueDate: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Exercise routine',
    description: '45-minute workout session',
    category: 'Health & Fitness',
    completed: false,
    dueDate: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Review career goals',
    description: 'Update LinkedIn profile and review job opportunities',
    category: 'Job/Career',
    completed: false,
    dueDate: new Date().toISOString()
  }
];

export const mockPlan: Plan = {
  id: '1',
  title: 'Your 90-Day Transformation Plan',
  createdAt: new Date().toISOString(),
  categories: [
    {
      id: '1',
      name: 'Health & Fitness',
      description: 'Build physical strength and endurance',
      tasks: [
        {
          id: '1',
          title: 'Establish morning routine',
          description: 'Create a consistent wake-up time and morning ritual',
          timeframe: 'Week 1-2',
          priority: 'High'
        },
        {
          id: '2',
          title: 'Regular exercise schedule',
          description: 'Commit to 4 workout sessions per week',
          timeframe: 'Week 1-12',
          priority: 'High'
        }
      ]
    },
    {
      id: '2',
      name: 'Career Development',
      description: 'Advance professional skills and opportunities',
      tasks: [
        {
          id: '3',
          title: 'Skill assessment',
          description: 'Identify key skills needed for career advancement',
          timeframe: 'Week 1',
          priority: 'Medium'
        },
        {
          id: '4',
          title: 'Network building',
          description: 'Connect with 2 industry professionals weekly',
          timeframe: 'Week 2-12',
          priority: 'Medium'
        }
      ]
    }
  ]
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! I\'m here to help you achieve your goals. How are you feeling about your progress today?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    content: 'I\'m doing well! I completed my reading task but struggled with meditation today.',
    sender: 'user',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: '3',
    content: 'That\'s great progress on the reading! Don\'t worry about the meditation - consistency comes with practice. Would you like some tips for making meditation easier?',
    sender: 'ai',
    timestamp: new Date(Date.now() - 900000).toISOString()
  }
];

export const mockUserProgress: UserProgress = {
  totalTasks: 28,
  completedTasks: 18,
  streak: 5,
  weeklyProgress: 72
};