# Frontend

## Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Tailwind Animate** - Animation utilities

### State & Data

- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React OIDC Context** - Authentication state management

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - Type-aware linting
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── app/                    # Application core
│   ├── error/             # Error handling (boundary, hooks, utils)
│   ├── layout/            # Layout components (header, footer, navigation)
│   ├── locales/           # Internationalization (en/fr locales)
│   ├── navigation/        # Navigation components
│   ├── routes/            # Routing configuration
│   └── routing/           # Route protection
├── features/              # Feature-based modules
│   ├── auth/              # Authentication feature
│   ├── observability/     # Metrics and monitoring
│   ├── projects/          # Project management
│   └── users/             # User management
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── landing/           # Landing page
│   ├── legal/             # Legal pages (FAQ, terms, privacy)
│   ├── projects/          # Project pages
│   └── settings/          # Settings page
├── shared/                # Shared utilities and components
│   ├── config/            # Configuration files
│   ├── lib/               # Utility libraries
│   ├── styles/            # Global styles
│   ├── ui/                # Reusable UI components
│   └── widget/            # Widget components
└── main.tsx               # Application entry point
```

### Architecture Principles

- **Feature-based organization**: Related code is grouped by feature (auth, projects, observability)
- **Shared components**: Reusable UI components in `shared/ui/`
- **Separation of concerns**: API calls, components, hooks, and types are separated within each feature
- **Type safety**: Strict TypeScript with proper type definitions

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Docker and Docker Compose** (for running the full stack)

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd <project-root>
   ```

2. **Start the full stack** (frontend + backend)

   ```bash
   docker-compose up
   ```

   The application will be available at `http://localhost:5173`

### Manual Development Setup

If you prefer to run the frontend separately:

1. **Install dependencies**

   ```bash
   cd frontend
   yarn install
   # or
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration (see `.env.example` for details)

3. **Start development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

### Available Scripts

```bash
# Development
yarn dev          # Start dev server with HMR
yarn preview      # Preview production build locally

# Building
yarn build        # Build for production
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
yarn format:check # Check code formatting
```

## 🔧 Development Workflow

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: Catches potential bugs and enforces coding standards
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Provides type checking and IntelliSense

### Adding New Features

1. **Create feature directory** in `src/features/`
2. **Structure your feature**:

   ```
   src/features/new-feature/
   ├── api/          # API calls
   ├── components/   # Feature-specific components
   ├── context/      # React context providers
   ├── hooks/        # Custom hooks
   ├── types/        # TypeScript types
   └── utils/        # Utility functions
   ```

3. **Add routing** in `src/app/routes/router.tsx`
4. **Update navigation** if needed

### UI Components

The project uses a component library approach:

- **Base components** in `src/shared/ui/` (Button, Card, Input, etc.)
- **Feature components** in respective feature directories
- **Layout components** in `src/app/layout/`

### Styling Guidelines

- Use **Tailwind CSS** for styling
- Follow the **design system** defined in component variants
- Use **CSS variables** for theme colors
- Maintain **responsive design** principles

### Code Standards

- Use **TypeScript** for all new code
- Follow **React best practices**
- Maintain **component composition** over inheritance
- Use **custom hooks** for shared logic
- Keep components **small and focused**

## 🐳 Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t frontend .

# Run container
docker run -p 5173:5173 frontend
```
