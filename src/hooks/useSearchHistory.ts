import { useState, useEffect } from 'react';

const STORAGE_KEY = 'home_search_history';

/**
 * Custom hook to manage search history locally.
 * Preserves the 5 most recent unique search queries using localStorage.
 * 
 * @returns {{ history: string[], addSearch: (query: string) => void, removeSearch: (query: string) => void }}
 */
export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addSearch = (query: string) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const newHistory = [query, ...prev.filter((item) => item !== query)].slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeSearch = (query: string) => {
    setHistory((prev) => {
        const newHistory = prev.filter(item => item !== query);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
    })
  }

  return { history, addSearch, removeSearch };
};
