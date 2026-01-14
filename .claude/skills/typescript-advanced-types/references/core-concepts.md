# Core Concepts: Advanced TypeScript

## 1. Generics

**Purpose:** Create reusable, type-flexible components while maintaining type safety.

```typescript
// Generic Constraints
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length);
  return item;
}
```

## 2. Conditional Types

**Purpose:** Create types that depend on conditions.

```typescript
type IsString<T> = T extends string ? true : false;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

## 3. Mapped Types

**Purpose:** Transform existing types by iterating over properties.

```typescript
// Key Remapping
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};
```

## 4. Template Literal Types

**Purpose:** String-based types with pattern matching.

```typescript
type EventName = "click" | "focus";
type EventHandler = `on${Capitalize<EventName>}`; // "onClick" | "onFocus"
```
