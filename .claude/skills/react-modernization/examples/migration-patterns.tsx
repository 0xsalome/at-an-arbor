import { useState, useEffect, useTransition, Suspense } from 'react';

// 1. Modern Data Fetching Hook
export function useData<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetcher().then(res => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, deps);

  return { data, loading };
}

// 2. Transition Pattern for Search
export function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    // Urgent update
    setQuery(e.target.value);
    
    // Non-urgent update
    startTransition(() => {
      // setResults(searchAPI(e.target.value));
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Loading...</span>}
    </>
  );
}
