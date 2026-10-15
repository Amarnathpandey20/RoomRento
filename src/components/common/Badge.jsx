import React from 'react';

export default function Badge({ variant = 'default', children, icon, className = '' }) {
  const styles = {
    verified: 'bg-primary text-on-primary',
    zeroBrokerage: 'bg-secondary text-on-secondary font-bold',
    verifiedPill: 'bg-primary-fixed text-on-primary-fixed',
    amber: 'bg-secondary-container text-on-secondary-container font-bold',
    neutral: 'bg-surface-container text-on-surface-variant',
    outline: 'border border-outline-variant text-on-surface-variant',
    default: 'bg-surface-container-high text-on-surface'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm shadow-xs ${styles[variant] || styles.default} ${className}`}>
      {icon && <span className="material-symbols-outlined text-[13px]">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
