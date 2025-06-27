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
      const totalDelay = delay + (staggerIndex * 0.1);
      
      // Set initial state
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(20px) scale(0.95)';
      
      // Animate in after delay
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
          cardRef.current.style.opacity = '1';
          cardRef.current.style.transform = 'translateY(0) scale(1)';
          setHasAnimated(true);
        }
      }, totalDelay * 1000);
    }
  }, [delay, staggerIndex, hasAnimated]);

  const handleMouseEnter = () => {
    if (hoverEffect && cardRef.current && hasAnimated) {
      cardRef.current.style.transform = 'translateY(-4px) scale(1.02)';
      cardRef.current.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    }
  };

  const handleMouseLeave = () => {
    if (hoverEffect && cardRef.current && hasAnimated) {
      cardRef.current.style.transform = 'translateY(0) scale(1)';
      cardRef.current.style.boxShadow = '';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-300 ease-out ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'
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