---
name: typescript-advanced-types
description: Provides advanced TypeScript type definitions and utility types. Trigger this skill when the user requests type-safe architectures, complex generic components, or strict type constraints.
---

# TypeScript Advanced Types Skill

This document guides the Architect (Claude) on how to utilize advanced TypeScript features for the Digital Garden project.

## Usage Guide

Use this skill when:
- Designing reusable components requiring **Generics**.
- Implementing type-safe state management or API clients.
- Refactoring loose types (`any`) to strict, inferred types.

### Workflow

1. **Identify the Need**: Determine if the task requires standard types (interfaces) or advanced patterns (conditional/mapped types).
2. **Consult References**:
   - For syntax and behavior of Generics, Conditional Types, and Mapped Types, see [Core Concepts](references/core-concepts.md).
   - For handling `unknown`, type guards, and assertions, see [Type Inference](references/type-inference.md).
3. **Apply Patterns**:
   - Copy and adapt implementation patterns from [Utility Types](examples/utility-types.ts).
   - Use the [Builder Pattern](examples/design-patterns.ts) for complex object construction.

## Trigger Phrases

- "Make this component type-safe generic."
- "Strictly type the API response."
- "Remove usage of 'any' in this module."
