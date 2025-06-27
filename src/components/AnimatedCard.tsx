import React, { useRef, useEffect, useState } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  staggerIndex?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  hoverEffect = true,
  staggerIndex = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (cardRef.current && !hasAnimated) {
      const totalDelay = delay + (staggerIndex * 0.05);
      
      // Set initial state
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(8px)';
      
      // Animate in after delay
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = 'all 0.3s ease-out';
          cardRef.current.style.opacity = '1';
          cardRef.current.style.transform = 'translateY(0)';
          setHasAnimated(true);
        }
      }, totalDelay * 1000);
    }
  }, [delay, staggerIndex, hasAnimated]);

  const handleMouseEnter = () => {
    if (hoverEffect && cardRef.current && hasAnimated) {
      cardRef.current.style.transform = 'translateY(-2px)';
      cardRef.current.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
    }
  };

  const handleMouseLeave = () => {
    if (hoverEffect && cardRef.current && hasAnimated) {
      cardRef.current.style.transform = 'translateY(0)';
      cardRef.current.style.boxShadow = '';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-200 ease-out ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(8px)'
      }}
    >
      {children}
    </div>
  );
};

// Specialized components for different use cases
export const FadeInCard: React.FC<Omit<AnimatedCardProps, 'hoverEffect'>> = (props) => (
  <AnimatedCard {...props} hoverEffect={false} />
);

export const HoverCard: React.FC<AnimatedCardProps> = (props) => (
  <AnimatedCard {...props} hoverEffect={true} />
);

export const StaggeredCard: React.FC<AnimatedCardProps & { index: number }> = ({ 
  index, 
  ...props 
}) => (
  <AnimatedCard {...props} staggerIndex={index} />
);

export default AnimatedCard; 