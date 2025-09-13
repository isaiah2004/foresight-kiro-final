# Foresight Financial Planning App - Documentation

Welcome to the Foresight Financial Planning App documentation. This comprehensive guide will help you understand the project structure, components, utilities, and how to use them effectively.

## Table of Contents

- [Project Overview](./project-overview.md)
- [Project Structure](./project-structure.md)
- [Components Guide](./components/README.md)
- [Utilities & Hooks](./utilities/README.md)
- [API Reference](./api/README.md)
- [Development Guide](./development/README.md)
- [Deployment Guide](./deployment/README.md)
- [Financial Behavior](./financial-behavior/README.md)
- [Implementation Guides](./implementation-guides/README.md)

## Quick Start

### Recent Critical Fixes (September 8, 2025)
- **Currency Symbol Display**: Fixed income dashboard to show primary currency symbols instead of hardcoded dollar signs
- **Firebase Undefined Field Error**: Fixed income source submission errors with optional endDate fields
- **Impact**: Users now see accurate currency representation (€, £, ¥, etc.) and can add income sources without errors
- **Details**: See [income-primary-currency-symbols.md](./updates/income-primary-currency-symbols.md) and [firebase-undefined-field-fix.md](./updates/firebase-undefined-field-fix.md)

1. **Installation**: Run `npm install` to install dependencies
2. **Development**: Run `npm run dev` to start the development server
3. **Building**: Run `npm run build` to create a production build
4. **Testing**: Run `npm run test` to run the test suite

## Key Features

- **Multi-Currency Support**: Handle transactions in multiple currencies with automatic conversion
- **Investment Portfolio**: Track stocks, bonds, mutual funds, real estate, and crypto with intelligent caching
- **Budget Management**: Income splitting with 6-category system and bucket management with renewal rates
- **Loan Management**: Regional compliance for India, US, and EU with amortization schedules
- **Funds Management**: Pots, saving funds, and goal tracking
- **Financial Insights**: Risk profiling and analytics

## Architecture

The application is built using:
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Firebase Firestore** for data storage with intelligent caching
- **Clerk** for authentication and user management
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **Framer Motion** for professional animations

## Documentation Standards

All documentation follows the standardized format defined in our documentation guidelines:

### Pages Documentation
- **Purpose**: Clear description of the page's role
- **Routes**: All routes and navigation paths
- **Information Shown**: Data displayed and user interactions
- **Dependencies**: External APIs, components, or services
- **Additional Information**: Performance and accessibility notes

### Component Documentation
- **Purpose**: Component functionality and use cases
- **Usage Examples**: Code snippets with proper implementation
- **Props Interface**: TypeScript interfaces and validation
- **Performance**: Optimization tips and considerations

### Utility Documentation
- **Purpose**: Function responsibility and business logic
- **Usage**: Input/output examples with TypeScript signatures
- **Use Cases**: When and why to use the utility
- **Performance**: Complexity and optimization notes

## Financial Behavior Documentation

The application implements specific financial behaviors and business logic:

- [Budget Management Behavior](./financial-behavior/budget-behavior.md)
- [Investment Caching System](./financial-behavior/investment-caching.md)
- [Pot Management Behavior](./financial-behavior/pot-behavior.md)
- [Loan Calculations & Regional Compliance](./financial-behavior/loan-calculations.md)

## Implementation Guides

Step-by-step guides for implementing key features:

- [Project Initialization](./implementation-guides/project-initialization.md)
- [Dashboard Setup with Sidebar](./implementation-guides/dashboard-setup.md)
- [React Best Practices](./implementation-guides/react-best-practices.md)
- [AI Integration with Vercel SDK](./implementation-guides/ai-integration.md)
- [Configuration Management](./implementation-guides/configuration-management.md)

## Getting Help

- Check the [Components Guide](./components/README.md) for UI component usage
- Review the [Utilities Guide](./utilities/README.md) for helper functions
- See the [API Reference](./api/README.md) for backend integration
- Visit the [Development Guide](./development/README.md) for contribution guidelines
- Read [Financial Behavior](./financial-behavior/README.md) for business logic understanding
- Follow [Implementation Guides](./implementation-guides/README.md) for feature development

## Performance Requirements

- **Loading**: Skeleton loaders with Suspense for all async content
- **Animations**: Smooth fade-ins with Framer Motion, professional feel
- **Calculations**: Complete financial operations within 2 seconds
- **Caching**: Intelligent investment data caching with 4-minute TTL
- **Core Web Vitals**: Maintain excellent LCP, FID, and CLS scores

## Contributing

When contributing to the documentation:

1. Follow the standardized documentation format
2. Include TypeScript interfaces in examples
3. Provide performance considerations
4. Add accessibility requirements where applicable
5. Reference related components and utilities
6. Maintain up-to-date code examples

## Support

For questions or issues:
- Review the relevant documentation section
- Check the implementation guides for step-by-step instructions
- Refer to financial behavior documentation for business logic
- Follow the established patterns and conventions