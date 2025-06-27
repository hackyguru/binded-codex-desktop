import React, { useState, useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  pageKey, 
  className = '' 
}) => {
  const [currentPageKey, setCurrentPageKey] = useState(pageKey);
  const [pendingContent, setPendingContent] = useState<React.ReactNode>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (pageKey !== currentPageKey) {
      // Store the new content to show after transition
      setPendingContent(children);
      setIsTransitioning(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // After exit animation completes, update content and start enter animation
      timeoutRef.current = setTimeout(() => {
        setCurrentPageKey(pageKey);
        setPendingContent(null);
        
        // Small delay to ensure DOM update, then animate in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 150); // Slightly faster exit
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pageKey, currentPageKey, children]);

  const content = pendingContent || children;

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full transition-all duration-200 ease-in-out ${className} ${
        isTransitioning 
          ? 'opacity-0 translate-y-1' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      {content}
    </div>
  );
};

export default PageTransition; 