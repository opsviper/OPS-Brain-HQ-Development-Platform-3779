# OPS Brain HQ

A comprehensive operations management dashboard built with React and Supabase for OPS Viper consulting agency.

## Features

- **Dashboard**: Real-time overview of tasks, processes, and key metrics
- **Task Management**: Organize tasks by React/Maintain/Improve categories
- **Process Management**: Track operational processes and SOPs
- **Team Management**: Manage team members and assignments
- **Equipment & Software Tracking**: Inventory management
- **Ideas & Events**: Track improvement ideas and key events
- **Reports**: Data visualization and analytics
- **Role-based Access**: Admin, Manager, and Contributor roles

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Framer Motion, React Icons
- **Charts**: ECharts
- **Authentication**: Supabase Auth with RLS

## Setup Instructions

### 1. Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Update the environment variables with your Supabase credentials

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from `src/config/supabase.js` in your Supabase SQL editor
3. Enable Row Level Security (RLS) on all tables
4. Configure authentication providers as needed

### 3. Installation

```bash
npm install
npm run dev
```

### 4. Database Schema

The application uses the following main tables:
- `users` - User profiles and roles
- `tasks` - Task management with types (react/maintain/improve)
- `processes` - Operational processes and SOPs
- `systems` - System inventory
- `equipment` - Equipment tracking
- `software` - Software inventory
- `team` - Team member management
- `ideas` - Improvement ideas
- `key_events` - Important events tracking

### 5. Role-based Access

- **Admin**: Full access to all features
- **Manager**: Read/write access except admin settings
- **Contributor**: Limited access to assigned tasks and related data

## Features Implementation Status

✅ **Completed**:
- Authentication system
- Dashboard with charts and stats
- Task management (React/Maintain/Improve)
- Responsive layout
- Role-based navigation
- Data tables with search/filter
- Supabase integration

🚧 **In Progress**:
- Process management pages
- Equipment tracking
- Software inventory
- Team management
- Ideas management
- Key events tracking
- Advanced reporting
- Admin panel

## Deployment

1. Build the application: `npm run build`
2. Deploy to your preferred hosting platform
3. Configure environment variables in production
4. Set up Supabase RLS policies for production

## Contributing

1. Follow the existing code structure
2. Use TypeScript for new components
3. Implement proper error handling
4. Add tests for new features
5. Update documentation

## License

Private - OPS Viper Internal Use Only