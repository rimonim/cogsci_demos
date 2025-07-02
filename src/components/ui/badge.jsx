import React from 'react'

export const Badge = React.forwardRef(({ className = '', variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/80',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
    destructive: 'bg-red-600 text-slate-50 hover:bg-red-600/80',
    outline: 'border border-slate-200 text-slate-950',
    success: 'bg-green-600 text-slate-50 hover:bg-green-600/80',
  }
  
  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  )
})

Badge.displayName = 'Badge'
