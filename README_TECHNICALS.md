--- TECHNICAL_README.md (原始)


+++ TECHNICAL_README.md (修改后)
# Staybnb - Technical Documentation

Comprehensive technical documentation for the Staybnb accommodation and roommate finder platform.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Core Features & Implementation](#core-features--implementation)
5. [Component Library](#component-library)
6. [State Management](#state-management)
7. [Styling & Design System](#styling--design-system)
8. [Animation System](#animation-system)
9. [API Integration](#api-integration)
10. [TypeScript Types](#typescript-types)
11. [Development Guidelines](#development-guidelines)

---

## 🛠 Tech Stack

### Frontend Framework
- **React 19** - Latest version with concurrent features and improved hooks
- **React Router DOM 7** - Client-side routing with hash-based navigation
- **TypeScript 5.8** - Static typing for enhanced developer experience and type safety

### Build & Development Tools
- **Vite 6.2** - Next-generation frontend build tool with HMR and fast builds
- **@vitejs/plugin-react** - Official React plugin for Vite
- **Tailwind CSS 4.1** - Utility-first CSS framework with Vite integration
- **PostCSS & Autoprefixer** - CSS processing and vendor prefixing

### UI & Animation Libraries
- **Motion (Framer Motion)** - Production-ready animation library for React
- **Lucide React** - Beautiful, consistent icon set
- **clsx & tailwind-merge** - Conditional className utilities for Tailwind

### Backend & Services
- **Supabase** - Backend-as-a-Service for authentication and database
- **MapTiler SDK 4.0** - Interactive maps and geolocation services
- **Google Generative AI (@google/genai)** - AI-powered features and recommendations

### Utilities
- **date-fns** - Modern JavaScript date utility library
- **dotenv** - Environment variable management

### Code Quality
- **ESLint 9** - JavaScript/TypeScript linting
- **Prettier 3.8** - Code formatting
- **typescript-eslint** - TypeScript-specific linting rules

---

## 🏗 Architecture Overview

### Application Architecture Pattern

The application follows a **Feature-Based Architecture** with the following layers:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Pages, Components, Modals, Layouts)   │
├─────────────────────────────────────────┤
│            Context Layer                │
│    (Auth, Theme, Toast Providers)       │
├─────────────────────────────────────────┤
│             Hook Layer                  │
│   (Custom Hooks for Data & Logic)       │
├─────────────────────────────────────────┤
│           Service Layer                 │
│  (Supabase, MapTiler, Gemini API)       │
├─────────────────────────────────────────┤
│            Data Layer                   │
│      (Types, Mock Data, Utils)          │
└─────────────────────────────────────────┘
```

### Routing Strategy

- **HashRouter**: Used for static hosting compatibility
- **Lazy Loading**: All pages are code-split using `React.lazy()` and wrapped in `Suspense`
- **Route Protection**: Authenticated routes managed via `AuthContext`

### State Management Strategy

- **Context API**: Global state for authentication, theme, and toast notifications
- **Local State**: Component-level state using `useState` and `useReducer`
- **Custom Hooks**: Encapsulated business logic and data fetching

---

## 📁 Project Structure

```
/workspace
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AuthModal.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Categories.tsx
│   │   ├── CreateListingModal.tsx
│   │   ├── EditListingModal.tsx
│   │   ├── Filters.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── HostProfile.tsx
│   │   ├── ListingCard.tsx
│   │   ├── ListingCardSkeleton.tsx
│   │   ├── ListingDetailSkeleton.tsx
│   │   ├── ListingModal.tsx
│   │   ├── MapTilerView.tsx
│   │   ├── Navbar.tsx
│   │   ├── PhotoCarouselOverlay.tsx
│   │   ├── ReviewBreakdown.tsx
│   │   ├── RoommateCard.tsx
│   │   ├── RoommateCardSkeleton.tsx
│   │   ├── RoommateHero.tsx
│   │   ├── RoommateModal.tsx
│   │   ├── RoommateSearchDropdown.tsx
│   │   ├── SearchDropdown.tsx
│   │   ├── SearchHistory.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Toast.tsx
│   │   └── ToastProvider.tsx
│   │
│   ├── data/                 # Mock data for development
│   │   ├── listings.ts
│   │   └── roommates.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useListing.ts
│   │   ├── useListings.ts
│   │   ├── useReducedMotion.ts
│   │   └── useSearchHistory.ts
│   │
│   ├── lib/                  # Core libraries and contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── animations.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   │
│   ├── pages/                # Route-level components
│   │   ├── CategoryListings.tsx
│   │   ├── Home.tsx
│   │   ├── ListingDetail.tsx
│   │   ├── ManageListings.tsx
│   │   ├── Maps.tsx
│   │   ├── Messages.tsx
│   │   ├── Profile.tsx
│   │   └── RoommateFinder.tsx
│   │
│   ├── App.tsx               # Root component with routing
│   ├── main.tsx              # Application entry point
│   ├── index.css             # Global styles
│   ├── types.ts              # TypeScript type definitions
│   └── vite-env.d.ts         # Vite environment types
│
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── eslint.config.js          # ESLint configuration
```

---

## ⚙️ Core Features & Implementation

### 1. Authentication System

**Location**: `src/lib/AuthContext.tsx`

- **Provider**: Wraps the app to provide auth state globally
- **Methods**: `signIn()`, `signUp()`, `signOut()`, `user` state
- **Integration**: Supabase Auth with email/password and OAuth providers
- **Protected Routes**: Conditional rendering based on auth state

### 2. Theme System (Dark/Light Mode)

**Location**: `src/lib/ThemeContext.tsx`

- **Persistence**: Theme preference stored in localStorage
- **System Detection**: Respects OS-level dark mode preference
- **Toggle Component**: `ThemeToggle` component for user control
- **CSS Variables**: Tailwind's dark mode class strategy

### 3. Listing Management

**Components**:
- `ListingCard` - Display individual listing preview
- `ListingModal` - Detailed view with booking options
- `CreateListingModal` - Form for adding new listings
- `EditListingModal` - Modify existing listings
- `ManageListings` - Host dashboard page

**Data Flow**:
```
Page Component → useListings Hook → Supabase/Mock Data → Component State
```

### 4. Roommate Finder

**Key Components**:
- `RoommateHero` - Search interface and filters
- `RoommateCard` - Individual profile display
- `RoommateModal` - Detailed profile view
- `RoommateSearchDropdown` - Advanced filtering

**Matching Algorithm**:
- University affiliation
- Budget range compatibility
- Location preferences
- Lifestyle tags (smoking, pets, schedule, etc.)

### 5. Interactive Maps

**Implementation**: `src/components/MapTilerView.tsx`

- **SDK**: MapTiler SDK v4.0
- **Features**:
  - Property markers with popups
  - Cluster visualization
  - Geolocation support
  - Custom map styles

### 6. Search & Filtering

**Components**:
- `SearchDropdown` - Real-time search suggestions
- `Filters` - Multi-criteria filtering panel
- `SearchHistory` - Persistent search tracking
- `Categories` - Category-based browsing

**Hook**: `useSearchHistory.ts` manages localStorage persistence

### 7. Notification System

**Components**:
- `ToastProvider` - Context provider for toast management
- `Toast` - Individual notification component

**Usage**:
```tsx
const { addToast } = useToast();
addToast({ message: 'Success!', type: 'success' });
```

---

## 🧩 Component Library

### Layout Components
| Component | Description |
|-----------|-------------|
| `Navbar` | Top navigation with logo, search, and user menu |
| `BottomNav` | Mobile-friendly bottom navigation bar |
| `Footer` | Site footer with links and copyright |
| `Hero` | Landing page hero section with CTA |

### Listing Components
| Component | Description |
|-----------|-------------|
| `ListingCard` | Card displaying listing preview |
| `ListingCardSkeleton` | Loading skeleton for listing cards |
| `ListingModal` | Full-screen modal with listing details |
| `ListingDetailSkeleton` | Loading skeleton for detail view |
| `PhotoCarouselOverlay` | Image gallery with fullscreen mode |

### Roommate Components
| Component | Description |
|-----------|-------------|
| `RoommateCard` | Profile card for roommate candidates |
| `RoommateCardSkeleton` | Loading skeleton for roommate cards |
| `RoommateHero` | Header section for roommate finder |
| `RoommateModal` | Detailed roommate profile modal |
| `RoommateSearchDropdown` | Filter dropdown for roommate search |

### Utility Components
| Component | Description |
|-----------|-------------|
| `AuthModal` | Login/signup modal dialog |
| `Categories` | Horizontal scrollable category selector |
| `CreateListingModal` | Form for creating new listings |
| `EditListingModal` | Form for editing existing listings |
| `DateScrollPicker` | Custom date selection component |
| `Filters` | Multi-option filter panel |
| `HostProfile` | Host information display |
| `MapTilerView` | Interactive map component |
| `ReviewBreakdown` | Rating distribution visualization |
| `SearchDropdown` | Search input with autocomplete |
| `SearchHistory` | Recent searches display |
| `ThemeToggle` | Dark/light mode switch |
| `Toast` | Notification popup |
| `ToastProvider` | Toast context provider |

---

## 🔮 State Management

### Context Providers

#### AuthContext
```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

#### ThemeContext
```tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

#### ToastContext
```tsx
interface ToastContextType {
  addToast: (toast: ToastProps) => void;
  removeToast: (id: string) => void;
}
```

### Custom Hooks

#### useListings
- Fetches all listings with optional filters
- Handles loading and error states
- Returns: `{ listings, loading, error }`

#### useListing
- Fetches single listing by ID
- Returns: `{ listing, loading, error }`

#### useSearchHistory
- Manages search history in localStorage
- Methods: `addSearch`, `clearHistory`, `getHistory`

#### useReducedMotion
- Detects user's motion preference
- Returns boolean for animation adjustments

---

## 🎨 Styling & Design System

### Tailwind CSS Configuration

**Version**: Tailwind CSS v4.x with Vite plugin

**Custom Configuration** (`tailwind.config.js`):
- Extended color palette matching brand identity
- Custom spacing and sizing scales
- Responsive breakpoints for mobile-first design

### Color Scheme

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Primary | `#17294F` | `#17294F` | Brand color, CTAs |
| Background | `#FFFFFF` | `#0F172A` | Page backgrounds |
| Surface | `#F8FAFC` | `#1E293B` | Cards, modals |
| Text Primary | `#0F172A` | `#F8FAFC` | Headings, body text |
| Text Secondary | `#64748B` | `#94A3B8` | Subtitles, captions |

### Responsive Breakpoints

```ts
sm: 640px   // Small devices (landscape phones)
md: 768px   // Medium devices (tablets)
lg: 1024px  // Large devices (desktops)
xl: 1280px  // Extra large devices (large desktops)
2xl: 1536px // XXL devices (extra-large screens)
```

### Utility Functions

**`src/lib/utils.ts`**:
- `cn(...classes)` - Combines clsx and tailwind-merge for conditional classes
- Format currency, dates, and numbers
- Helper functions for common operations

---

## ✨ Animation System

### Library: Motion (Framer Motion)

**Configuration**: `src/lib/animations.ts`

### Easing Curves

```ts
export const EASE_OUT = [0.23, 1, 0.32, 1]; // Custom cubic-bezier
```

### Transition Presets

| Name | Duration | Ease | Use Case |
|------|----------|------|----------|
| `SPRING` | 0.3s | EASE_OUT | Default interactions |
| `EASE_OUT` | 0.3s | EASE_OUT | Fade ins, slides |
| `EASE_IN_OUT` | 0.3s | easeInOut | Balanced transitions |
| `FAST` | 0.15s | - | Quick feedback |
| `NORMAL` | 0.2s | - | Standard UI updates |
| `SLOW` | 0.4s | EASE_OUT | Major state changes |

### Animation Variants

#### FADE_IN
```ts
{
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}
```

#### FADE_UP
```ts
{
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}
```

#### SCALE_IN
```ts
{
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}
```

### Reduced Motion Support

The app respects the `prefers-reduced-motion` media query:
- Animations are disabled or simplified when requested
- `useReducedMotion` hook provides programmatic access
- `MotionConfig` wrapper handles global settings

### Clip-Path Entrance Animations

Recent refactor replaced translate-based animations with clip-path reveals:
- Smoother visual transitions
- Better performance on low-end devices
- More modern aesthetic

---

## 🔌 API Integration

### Supabase

**Configuration**: `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Tables** (Expected Schema):
- `users` - User profiles and preferences
- `listings` - Property listings
- `reviews` - User reviews and ratings
- `messages` - User-to-user communication
- `roommates` - Roommate seeker profiles

### MapTiler

**Usage**: Interactive maps in `Maps.tsx` and `MapTilerView.tsx`

```ts
import { maptilerSdk } from '@maptiler/sdk';

maptilerSdk.key = import.meta.env.VITE_MAPTILER_API_KEY;
```

### Google Generative AI

**Usage**: AI-powered recommendations and content generation

```ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

---

## 📝 TypeScript Types

### Core Interfaces (`src/types.ts`)

#### Listing
```ts
interface Listing {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  gallery: string[];
  category: string;
  date: string;
  amenities: string[];
  lat?: number;
  lng?: number;
  reviews: Review[];
  host?: HostInfo;
}
```

#### Roommate
```ts
interface Roommate {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  university: string;
  location: string;
  bio: string;
  image: string;
  tags: string[];
  budgetRange: string;
  preferredPlace: string;
}
```

#### Category
```ts
interface Category {
  label: string;
  icon: string;
  emoji: string;
}
```

---

## 📖 Development Guidelines

### Code Style

1. **Functional Components**: Use arrow functions with explicit return types
2. **Destructuring**: Destructure props at function signature
3. **Naming Conventions**:
   - Components: PascalCase
   - Files: PascalCase for components, camelCase for utilities
   - Constants: UPPER_SNAKE_CASE
   - Variables/Functions: camelCase

### Component Structure

```tsx
import React from 'react';
// External imports
// Internal imports
// Type imports

interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render
  return <div />;
};
```

### Best Practices

1. **Lazy Loading**: Always lazy load page components
2. **Error Boundaries**: Implement error boundaries for graceful failures
3. **Accessibility**:
   - Use semantic HTML
   - Include ARIA labels where needed
   - Support keyboard navigation
4. **Performance**:
   - Memoize expensive calculations with `useMemo`
   - Use `React.memo()` for pure components
   - Implement virtual scrolling for long lists
5. **Testing**: Write unit tests for hooks and utilities

### Git Commit Convention

Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Maintenance tasks
```

Example:
```bash
git commit -m "feat(roommate): add budget filter to roommate search"
```

---

## 🚀 Build & Deployment

### Development

```bash
npm run dev
```

Runs on `http://localhost:3000` with HMR enabled.

### Production Build

```bash
npm run build
```

Outputs optimized bundle to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

### Linting

```bash
npm run lint        # Run ESLint and TypeScript checks
npm run lint:eslint # Run only ESLint
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart dev server after adding variables
   - Prefix client-side variables with `VITE_`

2. **Map Not Rendering**
   - Verify MapTiler API key is valid
   - Check browser console for CORS errors
   - Ensure container has defined height

3. **Authentication Failures**
   - Confirm Supabase URL and anon key are correct
   - Check Supabase project settings for allowed origins

4. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Run `npm run clean` before building

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Supabase Docs](https://supabase.com/docs)
- [MapTiler SDK](https://docs.maptiler.com/sdk-js/)
- [Google AI Studio](https://ai.google.dev)

---

*Last Updated: June 2026*
*Version: 1.0.0*