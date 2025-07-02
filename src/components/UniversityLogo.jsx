import React from 'react';
import logoSvg from '@/assets/logo.svg';

export default function UniversityLogo({ className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src={logoSvg} alt="University Logo" className="w-full h-full object-contain" />
    </div>
  );
}
