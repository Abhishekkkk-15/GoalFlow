import { Question } from '../types';

export const onboardingQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple-select',
    question: 'Where do you want to improve?',
    options: ['Academic', 'Business', 'Job/Career', 'Sports', 'Self-Discipline', 'Self-Improvement', 'Health & Fitness', 'Relationships'],
    required: true
  },
  {
    id: '2',
    type: 'multiple-choice',
    question: 'How motivated are you to make changes in your life?',
    options: ['Low', 'Medium', 'High', 'Very High'],
    required: true
  },
  {
    id: '3',
    type: 'multiple-choice',
    question: 'How much time can you dedicate daily to self-improvement?',
    options: ['15-30 minutes', '30-60 minutes', '1-2 hours', '2+ hours'],
    required: true
  },
  {
    id: '4',
    type: 'multiple-select',
    question: 'What are your biggest challenges?',
    options: ['Procrastination', 'Time Management', 'Lack of Focus', 'Low Energy', 'Poor Habits', 'Stress Management'],
    required: true
  },
  {
    id: '5',
    type: 'multiple-choice',
    question: 'What is your primary goal timeframe?',
    options: ['30 days', '90 days', '6 months', '1 year'],
    required: true
  },
  {
    id: '6',
    type: 'multiple-choice',
    question: 'How do you prefer to track progress?',
    options: ['Daily check-ins', 'Weekly reviews', 'Monthly assessments', 'Milestone-based'],
    required: true
  },
  {
    id: '7',
    type: 'text',
    question: 'What does your ideal life look like in one year?',
    required: true
  },
  {
    id: '8',
    type: 'multiple-choice',
    question: 'What type of support do you prefer?',
    options: ['AI guidance only', 'Community support', 'Expert coaching', 'Self-directed'],
    required: true
  }
];