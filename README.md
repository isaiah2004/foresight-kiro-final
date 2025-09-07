# Foresight Financial Planning App

A comprehensive financial planning application built with Next.js 14, TypeScript, Firebase, and Clerk authentication.

## Philosophy

"Spending money should be as beneficial as earning it" - Foresight helps users understand the consequences of their financial actions to improve their quality of life through better decision-making.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Authentication**: Clerk with user management
- **Database**: Firebase Firestore
- **State Management**: Zustand for global state, React hooks for local state
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Clerk account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   - Add your Clerk publishable and secret keys
   - Add your Firebase configuration
   - Add external API keys (FinnHub, Alpha Vantage)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Clerk Setup

1. Create a new Clerk application
2. Configure sign-in/sign-up URLs
3. Set up redirect URLs for after authentication

## Project Structure

```
src/
├── app/                    # App Router pages and layouts
├── components/
│   ├── ui/                # Atomic shadcn/ui components
│   └── shared/            # Complex reusable components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript definitions
└── hooks/                 # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run format` - Format code with Prettier

## Features

### Phase 1 (Current)
- Multi-currency support with intelligent conversion
- Investment portfolio management with caching
- Budget management with 6-category system
- Loan management with regional compliance
- Funds management (Pots, Saving goals)
- Financial insights and analytics
- Responsive navigation with sidebar

### Phase 2 (Future)
- LLM integration for AI financial assistant
- Advanced analytics and custom reporting
- Enhanced goal tracking and recommendations

## Contributing

1. Follow the established code structure and patterns
2. Use TypeScript throughout
3. Follow the Single Responsibility Principle
4. Write tests for new functionality
5. Ensure responsive design and accessibility

## License

This project is private and proprietary.