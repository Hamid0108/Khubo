import React, { useState } from 'react';
import useErrorHandler from '../../hooks/useErrorHandler';
import ErrorBoundary from '../errors/ErrorBoundary';
import { AlertCircle } from 'lucide-react';

// Example 1: Async Error Handling
const AsyncErrorComponent = () => {
  const handleError = useErrorHandler();
  const [loading, setLoading] = useState(false);

  const fetchWithSimulatedError = async () => {
    setLoading(true);
    try {
      // Simulate API call that fails
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Failed to fetch data from server')), 1000));
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-700">
      <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Async Error Example</h3>
      <p className="text-sm text-neutral-500 dark:text-slate-400 mb-4">
        This demonstrates catching async errors (like API failures) using the useErrorHandler hook.
      </p>
      <button 
        onClick={fetchWithSimulatedError}
        disabled={loading}
        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        {loading ? 'Fetching...' : 'Trigger Async Error'}
      </button>
    </div>
  );
};

// Example 2: Render Error Handling
const BuggyComponent = () => {
  const [blowUp, setBlowUp] = useState(false);

  if (blowUp) {
    throw new Error('This is a simulated render error inside a component!');
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-700">
      <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Render Error Example</h3>
      <p className="text-sm text-neutral-500 dark:text-slate-400 mb-4">
        This demonstrates catching render-phase errors using a local ErrorBoundary component.
      </p>
      <button 
        onClick={() => setBlowUp(true)}
        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        Trigger Render Error
      </button>
    </div>
  );
};

export default function ErrorExample() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          These components demonstrate the new error handling system. The global boundary in main.tsx catches the unhandled async error, while the local boundary catches the render error.
        </p>
      </div>

      {/* Async errors are handled by throwing them in render phase, caught by nearest boundary */}
      <AsyncErrorComponent />

      {/* Local Error Boundary Example */}
      <ErrorBoundary 
        onReset={() => console.log('Resetting local boundary state')}
        // Optional custom fallback for localized errors
        // fallback={<div className="p-4 bg-red-50 text-red-600 rounded-xl">Custom local error UI</div>}
      >
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  );
}
