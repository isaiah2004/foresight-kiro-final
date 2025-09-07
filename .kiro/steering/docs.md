---
inclusion: always
---

# Documentation Standards

All code must be thoroughly documented using the standardized format below. Documentation should be maintained in the `docs/` folder with clear, actionable information for developers.

## Documentation Structure

### Pages (`docs/pages/`)
- **Purpose**: Clear description of the page's role in the application
- **Routes**: All routes and navigation paths used
- **Information Shown**: Data displayed and user interactions available
- **Dependencies**: External APIs, components, or services used
- **Additional Information**: Performance considerations, accessibility notes

### API Routes (`docs/api/`)
- **Purpose**: Endpoint functionality and business logic
- **URLs and Services**: External APIs, database queries, third-party integrations
- **API Keys**: Required environment variables and authentication
- **Error Handling**: Comprehensive error scenarios and responses
- **Return Format**: Response structure with TypeScript interfaces
- **Rate Limits**: Caching strategies and performance considerations

### Hooks (`docs/hooks/`)
- **Purpose**: Hook functionality and state management
- **Use Cases**: Practical scenarios where the hook should be used
- **Usage Examples**: Code snippets showing proper implementation
- **Dependencies**: Required providers or context
- **Performance**: Optimization tips and potential pitfalls

### Utilities (`docs/utilities/`)
- **Purpose**: Function responsibility and business logic
- **Usage**: Input/output examples with TypeScript signatures
- **Use Cases**: When and why to use this utility
- **Performance**: Complexity considerations and optimization notes
- **Testing**: Unit test examples and edge cases

### Providers (`docs/providers/`)
- **Purpose**: Context functionality and state management
- **Setup**: Installation and configuration steps
- **Usage**: How to consume the provider in components
- **Dependencies**: Required environment variables or external services
- **Performance**: Re-render optimization and best practices

### Types (`docs/types/`)
- **Purpose**: Type definitions and data structures
- **Usage**: Import patterns and implementation examples
- **Validation**: Zod schemas and runtime validation
- **Relationships**: How types relate to other parts of the system

## Configuration Documentation

### Middleware (`docs/development/middleware.md`)
- Current authentication and routing configuration
- Regional compliance handling
- Performance optimizations

### Tailwind Config (`docs/development/tailwind.md`)
- Custom theme configuration
- Component-specific utilities
- Design system integration

### Next.js Config (`docs/development/next-config.md`)
- Build optimizations
- Environment-specific settings
- Performance configurations

### Firebase Rules (`docs/deployment/firebase-rules.md`)
- Security rules for Firestore
- Authentication requirements
- Data access patterns

### Environment Variables (`docs/deployment/environment.md`)
- Required API keys and their purposes
- Development vs production configurations
- Security considerations and setup instructions

## Documentation Quality Standards

- Use TypeScript interfaces in examples
- Include error handling patterns
- Provide performance considerations
- Follow Single Responsibility Principle in explanations
- Include accessibility requirements where applicable
- Reference related components and utilities
- Maintain up-to-date code examples

