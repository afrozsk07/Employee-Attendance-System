import React from 'react';
import './AnimatedCard.css';

const AnimatedCard = ({ children, delay = 0, className = '' }) => {
  return (
    <div 
      className={`animated-card ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;

