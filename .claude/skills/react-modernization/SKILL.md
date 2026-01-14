---
name: react-modernization
description: Modernizes React components using React 19 features, Hooks, and concurrent patterns. Trigger this skill when upgrading legacy components, optimizing performance, or implementing new React features.
---

# React Modernization Skill

This document guides the Architect (Claude) on modernizing the Digital Garden's UI using React 19 and latest best practices.

## Usage Guide

Use this skill when:
- Converting Class components to Functional components with **Hooks**.
- Implementing **Suspense** for data fetching or code splitting.
- Optimizing rendering performance using `useMemo` or `useCallback`.
- Adopting React 19 features like Actions or `use` hook.

### Workflow

1. **Assess the Component**: Identify if it uses legacy patterns (lifecycle methods, HOCs).
2. **Consult References**:
   - For migration paths (Class -> Hooks) and React 19 features, see [React Features](references/react-features.md).
   - For performance optimization strategies, see [Optimization](references/optimization.md).
3. **Apply Patterns**:
   - Use the code patterns in [Migration Examples](examples/migration-patterns.tsx).
   - Implement data fetching using Suspense-compatible patterns.

## Trigger Phrases

- "Convert this class component to hooks."
- "Optimize this list for performance."
- "Use React 19 features for this form."
