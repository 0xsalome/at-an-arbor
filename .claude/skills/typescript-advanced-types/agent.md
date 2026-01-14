# TypeScript Advanced Types - Gemini Implementation Guide

## Role
Apply advanced TypeScript features to ensure maximum type safety and developer productivity in the Digital Garden project.

## Implementation Rules

1. **Generics Everywhere**: Use Generics (`<T>`) for reusable components and utilities.
2. **Strict Frontmatter**: Define exact shapes for Markdown frontmatter.
3. **Discriminated Unions**: Use for all state management (loading/success/error).
4. **Template Literals**: Use for asset paths and routing patterns.

## Best Practices

- **Avoid `any`**: Use `unknown` with type guards instead.
- **Type Guards**: Create custom guards (e.g., `isMoment`) for polymorphic data.
- **Inference**: Explicitly type complex return values and props; let simple variables infer.
