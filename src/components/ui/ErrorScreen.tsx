import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

interface ErrorScreenProps {
  error?: Error;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = React.memo(({ 
  error, 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again or return to the home page.", 
  onRetry, 
  onGoBack, 
  onGoHome 
}) => {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center border border-neutral-100 dark:border-slate-700"
      >
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          {title}
        </h2>
        
        <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
          {message}
        </p>

        {isDev && error && (
          <div className="w-full bg-neutral-100 dark:bg-slate-900/50 rounded-xl p-4 mb-8 text-left overflow-hidden">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 font-semibold mb-2 line-clamp-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="text-[10px] sm:text-xs font-mono text-neutral-500 dark:text-slate-500 overflow-auto max-h-32 scrollbar-thin">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#17294F] dark:bg-[#2252D6] hover:bg-[#1a2d55] dark:hover:bg-[#1e49c0] text-white rounded-full font-medium transition-colors w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
          
          {onGoBack && (
            <button 
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 border border-neutral-200 dark:border-slate-700 hover:bg-neutral-50 dark:hover:bg-slate-700 rounded-full font-medium transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}

          {(!onRetry && !onGoBack) || onGoHome ? (
             <button 
             onClick={onGoHome || (() => window.location.hash = '#/')}
             className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-slate-700 hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-800 dark:text-white rounded-full font-medium transition-colors w-full sm:w-auto"
           >
             <Home className="w-4 h-4" />
             <span>Home</span>
           </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
});

export default ErrorScreen;
