# 用户体验拯救 - Frontend

React + TypeScript frontend application for the UX Rescue Project Management System.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

This is the frontend web application for the UX Rescue Project Management System, providing an intuitive interface for managing projects, tasks, expenses, and team collaboration.

## Features

- **User Authentication**: Secure login/logout with JWT tokens and persistent sessions
- **Dashboard**: Real-time project statistics and activity overview
- **Project Board**: Kanban-style project management with drag-and-drop (planned)
- **Project Details**: Comprehensive project view with tasks, expenses, and documents
- **Task Management**: Create, update, and track tasks with priority and status
- **Expense Tracking**: Record and monitor project expenses with categorization
- **Document Integration**: Link and manage Feishu documents
- **User Management**: Admin interface for user management (admin only)
- **Audit Logs**: View system activity logs (admin only)
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Dark Mode Ready**: Built with shadcn/ui components

## Tech Stack

- **Framework**: React 18.2
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.1
- **Routing**: React Router DOM 6.22
- **State Management**: Zustand 4.5
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **HTTP Client**: Axios 1.6
- **Date Handling**: date-fns 3.3
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher (or pnpm/yarn)
- Backend API running (see [backend README](../backend/README.md))

## Installation

1. **Install dependencies**:
```bash
cd frontend
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Optional: Enable debug mode
VITE_DEBUG=true
```

**Environment-specific configurations**:

- **Development**: Use `.env.development`
- **Production**: Use `.env.production`

### API Base URL

The application expects the backend API to be available at the URL specified in `VITE_API_BASE_URL`. Update this value based on your deployment:

- **Local development**: `http://localhost:8000`
- **Production**: `https://your-api-domain.com`

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at:
- URL: http://localhost:5173
- Network access: http://[your-ip]:5173

Features in development mode:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Source maps for debugging
- TypeScript type checking

### Preview Production Build

```bash
npm run build
npm run preview
```

## Building for Production

### Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory:
- Minified JavaScript and CSS
- Tree-shaken dependencies
- Optimized assets
- Source maps (optional)

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images, fonts, etc.]
└── favicon.ico
```

## Project Structure

```
frontend/
├── public/                     # Static assets
│   └── favicon.ico
├── src/
│   ├── api/                   # API client and services
│   │   ├── client.ts         # Axios instance configuration
│   │   ├── auth.ts           # Authentication API
│   │   ├── projects.ts       # Project API
│   │   ├── tasks.ts          # Task API
│   │   ├── expenses.ts       # Expense API
│   │   ├── users.ts          # User management API
│   │   ├── auditLogs.ts      # Audit log API
│   │   └── dashboard.ts      # Dashboard API
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── layout/           # Layout components
│   │   │   ├── Layout.tsx    # Main layout wrapper
│   │   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   │   └── Header.tsx    # Top header bar
│   │   ├── projects/         # Project-related components
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ...
│   │   ├── tasks/            # Task-related components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── pages/                 # Page components
│   │   ├── LoginPage.tsx     # Login page
│   │   ├── DashboardPage.tsx # Dashboard
│   │   ├── ProjectBoardPage.tsx # Project list
│   │   ├── ProjectDetailPage.tsx # Project details
│   │   ├── MyTasksPage.tsx   # User's tasks
│   │   ├── UserManagementPage.tsx # User admin
│   │   └── AuditLogPage.tsx  # Audit logs
│   ├── store/                 # Zustand stores
│   │   ├── authStore.ts      # Authentication state
│   │   ├── projectStore.ts   # Project state
│   │   └── taskStore.ts      # Task state
│   ├── types/                 # TypeScript type definitions
│   │   ├── user.ts           # User types
│   │   ├── project.ts        # Project types
│   │   ├── task.ts           # Task types
│   │   ├── expense.ts        # Expense types
│   │   └── ...
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts     # Date, currency, etc. formatters
│   │   ├── validators.ts     # Input validation
│   │   ├── cn.ts             # Tailwind class merger
│   │   └── constants.ts      # App constants
│   ├── routes/                # Routing configuration
│   │   └── index.tsx         # Route definitions
│   ├── styles/                # Global styles
│   │   └── globals.css       # Tailwind and custom CSS
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts          # Vite type definitions
├── .env                       # Environment variables
├── .env.example               # Environment template
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── README.md                  # This file
```

## Development

### Code Style

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking (automatic with Vite)
npx tsc --noEmit
```

### Code Quality Tools

- **ESLint**: Linting with TypeScript support
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

### Development Guidelines

1. **Component Structure**: Follow the atomic design pattern
   - `ui/`: Basic UI primitives (buttons, inputs, etc.)
   - `components/`: Composite components (cards, forms, etc.)
   - `pages/`: Page-level components

2. **State Management**:
   - Use Zustand for global state (auth, projects, tasks)
   - Use React state for local component state
   - Persist auth state to localStorage

3. **API Calls**:
   - Use centralized API services in `src/api/`
   - Handle errors with try-catch and toast notifications
   - Include loading states for better UX

4. **Styling**:
   - Use Tailwind CSS utility classes
   - Use `cn()` utility for conditional classes
   - Follow shadcn/ui component patterns

5. **Type Safety**:
   - Define types in `src/types/`
   - Avoid `any` types
   - Use type inference where possible

### Adding a New Feature

1. **Define types** in `src/types/`
2. **Create API service** in `src/api/`
3. **Build components** in `src/components/`
4. **Create page** in `src/pages/`
5. **Add route** in `src/routes/index.tsx`
6. **Update navigation** in `src/components/layout/Sidebar.tsx`

### Common Development Tasks

#### Add a new UI component

```bash
# Example: Adding a new Card component
# 1. Create component file
touch src/components/ui/Card.tsx

# 2. Implement component with TypeScript
# 3. Export from index if needed
```

#### Add a new page

```tsx
// src/pages/NewFeaturePage.tsx
export const NewFeaturePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">New Feature</h1>
      {/* Your content */}
    </div>
  )
}

// Add route in src/routes/index.tsx
<Route
  path="/new-feature"
  element={
    <ProtectedRoute>
      <NewFeaturePage />
    </ProtectedRoute>
  }
/>
```

#### Add a new API endpoint

```typescript
// src/api/newFeature.ts
import { apiClient } from './client'

export const newFeatureApi = {
  getItems: async () => {
    const response = await apiClient.get('/api/v1/items')
    return response.data
  },

  createItem: async (data: CreateItemRequest) => {
    const response = await apiClient.post('/api/v1/items', data)
    return response.data
  },
}
```

## Testing

### Run Tests

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Tools

- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing
- **Jest DOM**: Custom matchers

### Writing Tests

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Deployment

### Environment Setup

1. Set production environment variables:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

2. Build the application:
```bash
npm run build
```

3. Deploy the `dist/` directory to your hosting provider

### Deployment Options

#### Static Hosting (Vercel, Netlify, etc.)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Railway Deployment

See [railway.toml](railway.toml) for Railway deployment configuration.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Docker Deployment

```bash
# Build image
docker build -t ux-rescue-frontend -f ../docker/frontend.Dockerfile .

# Run container
docker run -d -p 5173:5173 ux-rescue-frontend
```

#### Nginx Deployment

Serve the built files with Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Production Checklist

- [ ] Set `VITE_API_BASE_URL` to production API
- [ ] Remove `VITE_DEBUG` or set to `false`
- [ ] Build with `npm run build`
- [ ] Test the production build with `npm run preview`
- [ ] Configure CORS on backend to allow frontend domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CDN for static assets (optional)
- [ ] Set up error monitoring (Sentry, etc.)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

The application includes several optimizations:

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Minified JS/CSS, optimized images
- **Lazy Loading**: Components loaded on demand
- **Caching**: Service worker for offline support (optional)

## Troubleshooting

### Development Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port 5173 is not in use
lsof -i :5173
```

### API Connection Issues

1. Check `VITE_API_BASE_URL` in `.env`
2. Ensure backend is running
3. Check browser console for CORS errors
4. Verify network connectivity

### Build Failures

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check TypeScript errors
npx tsc --noEmit

# Rebuild
npm run build
```

### Type Errors

```bash
# Regenerate TypeScript types
npx tsc --noEmit --skipLibCheck

# Update dependencies
npm update
```

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Update documentation
4. Run linters before committing
5. Keep components small and focused

## Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives)
- [shadcn/ui](https://ui.shadcn.com/)

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

---

**Last Updated**: 2024-01-15
