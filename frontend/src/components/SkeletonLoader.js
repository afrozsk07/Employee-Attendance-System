import React from 'react';
import './SkeletonLoader.css';

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="skeleton skeleton-header-cell"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="skeleton skeleton-cell"></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="skeleton-stats-grid">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="skeleton-stat-card">
        <div className="skeleton skeleton-stat-label"></div>
        <div className="skeleton skeleton-stat-value"></div>
      </div>
    ))}
  </div>
);

const SkeletonLoader = ({ type = 'card', ...props }) => {
  switch (type) {
    case 'table':
      return <SkeletonTable {...props} />;
    case 'stats':
      return <SkeletonStats {...props} />;
    case 'card':
    default:
      return <SkeletonCard {...props} />;
  }
};

export default SkeletonLoader;
