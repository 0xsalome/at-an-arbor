# React Modernization Features

## 1. Class to Hooks Migration

**State:**
`this.state` -> `useState`

**Lifecycle:**
`componentDidMount` -> `useEffect(() => {}, [])`
`componentDidUpdate` -> `useEffect(() => {}, [deps])`
`componentWillUnmount` -> `useEffect(() => { return cleanup }, [])`

## 2. React 19 Concurrent Features

- **Automatic Batching**: All updates are batched by default.
- **Transitions**: `useTransition` for non-urgent updates.
- **Suspense**: Declarative loading states for data and code.

## 3. Performance Optimization

- **useMemo**: Memoize expensive calculations.
- **useCallback**: Memoize functions passed to optimized child components.
- **Code Splitting**: `React.lazy` for route-based splitting.
