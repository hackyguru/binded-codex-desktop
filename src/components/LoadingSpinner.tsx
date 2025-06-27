import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = '#6BE4A8',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-transparent border-t-current rounded-full animate-spin`}
        style={{ color }}
      />
      
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative logo spinner using the Codex logo
export const LogoSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <img
        src="src/assets/logo.png"
        alt="Loading"
        className={`${sizeClasses[size]} animate-spin`}
        style={{
          animation: 'spin 2s linear infinite, pulse 1.5s ease-in-out infinite'
        }}
      />
      
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 