# Goal & Habit Improvement Web App

A modern, AI-powered goal and habit tracking application built with React, TypeScript, and TailwindCSS.

## Features

- **Landing Page**: Clean hero section with feature explanations
- **Authentication**: Google login via Clerk
- **Onboarding**: Multi-step questionnaire with progress tracking
- **Dashboard**: Daily tasks, progress tracking, and streak counters
- **AI Plan**: Personalized improvement roadmap
- **AI Chat**: Interactive coaching interface
- **Profile Management**: User settings and data management

## Tech Stack

- React 18 with TypeScript
- TailwindCSS for styling
- Clerk for authentication
- React Router for navigation
- Lucide React for icons

## Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Clerk Authentication**:
   - Sign up at [clerk.dev](https://clerk.dev)
   - Create a new application
   - Enable Google OAuth provider
   - Copy your publishable key
   - Update `.env.local` with your key:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=your_actual_key_here
     ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── layout/       # Navigation and layout components
├── pages/            # Main application pages
├── data/             # Mock data and questions
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Design System

- **Colors**: Black & white minimal theme
- **Typography**: System fonts with proper hierarchy
- **Spacing**: 8px grid system
- **Components**: Rounded cards with subtle shadows
- **Animations**: Smooth transitions and hover states

## Features Implementation

### Authentication
- Google OAuth only via Clerk
- Protected routes for authenticated users
- Automatic redirect handling

### Onboarding
- 8-question progressive form
- Multiple choice and multi-select questions
- Progress bar and step navigation
- Form validation and error handling

### Dashboard
- Daily task management with completion tracking
- Progress visualization with charts
- Streak counters and weekly overviews
- Plan regeneration functionality

### Responsive Design
- Desktop: Sidebar navigation
- Mobile: Bottom tab navigation + collapsible header menu
- Optimized for all screen sizes

## API Integration Points

The app is structured for easy backend integration:

- `/api/onboarding` - Submit questionnaire responses
- `/api/plan/generate` - Generate AI-powered plans
- `/api/tasks` - CRUD operations for daily tasks
- `/api/chat` - AI chat conversations
- `/api/progress` - Track user progress and analytics

## Development Notes

- All components are fully typed with TypeScript
- Mock data provided for development and testing
- Modular architecture for easy feature additions
- Consistent error handling and loading states
- Accessibility considerations throughout

## Deployment

The app is ready for deployment to any static hosting platform:

```bash
npm run build
```

Built files will be in the `dist/` directory.