# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run dev` - Start development server and automatically open browser at localhost:5173
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Deployment
- `npm run deploy` - Deploy to Firebase hosting (requires Firebase CLI setup)

### Type Checking
- `tsc -b` - Run TypeScript compiler to check types (part of build process)

## Architecture Overview

### Core Application Structure

**Lily's Book** is a React + TypeScript application for generating AI-powered children's books featuring the main characters Lily (a 5-year-old girl) and Popcorn (her Miniature Schnauzer puppy). The app integrates with an external API for AI generation and database storage.

### Key Components and Flow

1. **Main App State Management** (`src/App.tsx`):
   - Central state for book data, loading states, and user options
   - Event-driven architecture using custom event system (`src/events.ts`)
   - Manages AI book generation, image generation, and database operations

2. **AI Integration** (`src/ai.ts`):
   - Interfaces with external API at `VITE_API` environment variable
   - Two main functions: `aiGenerateBook()` for text generation, `aiGenerateImage()` for illustrations
   - Handles OpenAI API integration for book content and DALL-E style image generation

3. **Database Layer** (`src/db.ts`):
   - CRUD operations for books and images via REST API
   - Handles book persistence, image uploads (base64 to file conversion)
   - Manages relationships between books and their page images

4. **Book Display Components**:
   - **BookHorizontal**: Horizontal scrolling book reader with page-by-page navigation
   - **BookFlip**: Alternative 3D flip-book style reader (using GSAP animations)
   - **BookView**: Container that switches between display modes
   - Both support real-time image generation per page

5. **Character System** (`src/system.ts`):
   - Predefined main characters (Lily and Popcorn) and optional family members
   - Consistent character descriptions for AI prompt engineering
   - Multiple art style options (Dr. Seuss, Disney, Eric Carle, etc.)

### Technical Patterns

**State Management**: Uses React hooks with custom event system instead of Redux/Context for component communication.

**Type Safety**: Comprehensive TypeScript with Zod schemas for runtime validation of AI responses and API data.

**Styling**: Component-scoped CSS files with CSS custom properties defined in `src/styles/tokens.css`.

**Storage**: Browser localStorage for user preferences, external database for generated books.

**Responsive Design**: Uses CSS custom properties and data attributes (`data-size`, `data-theme`) for adaptive layouts.

### Environment Variables
- `VITE_API`: Base URL for the backend API (required for book generation and storage)

### Project Structure Notes
- `/src/components/`: Organized by component name with co-located CSS files
- `/src/hooks/`: Custom React hooks for media queries and mode detection
- `/src/utils/`: Utility functions for CSS manipulation and string formatting
- `/public/`: Static assets including app icons and manifest files
- Firebase hosting configuration for deployment to `lilys-book.web.app`

### Development Notes
- No test framework currently configured
- Uses Vite for fast development and building
- ESLint configured with React and TypeScript rules
- Firebase hosting targets the `dist/` directory after build