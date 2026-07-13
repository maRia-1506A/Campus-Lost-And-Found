import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm border border-transparent',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent',
      outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm border border-transparent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 py-2 rounded-lg font-medium',
      lg: 'h-12 px-8 text-lg rounded-lg font-medium',
      icon: 'h-10 w-10 p-2 rounded-lg flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
