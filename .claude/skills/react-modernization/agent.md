# React Modernization - Gemini Implementation Guide

## Role
Modernize and optimize React components using React 19 features and best practices.

## Implementation Rules

1. **Functional Components Only**: No Class components.
2. **React 19 Best Practices**:
   - Use `use` hook where applicable.
   - Prefer `Transitions` for UI responsiveness.
3. **Optimized Re-renders**: Use `React.memo`, `useMemo`, `useCallback` appropriately.
4. **Suspense Ready**: Design for Suspense compatibility.
5. **Strict Mode**: Ensure cleanup functions in effects.

## Best Practices

- **Cleanup**: Return cleanup from `useEffect`.
- **Custom Hooks**: Extract logic (e.g., `useTheme`).
- **Composition**: Avoid deep prop drilling.
