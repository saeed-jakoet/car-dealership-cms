'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({
                                   className,
                                   children,
                                   variant = 'black',
                                   size = 'medium',
                                   ...props
                                 }, ref) => {
  const baseStyles =
      'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';

  const variants = {
    black: 'bg-black text-white hover:bg-neutral-800 focus:ring-neutral-600',
    secondary: 'bg-neutral-200 text-black hover:bg-neutral-300 focus:ring-neutral-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
      <button
          ref={ref}
          className={twMerge(
              baseStyles,
              variants[variant],
              sizes[size],
              className
          )}
          {...props}
      >
        {children}
      </button>
  );
});

Button.displayName = 'Button';

export { Button };