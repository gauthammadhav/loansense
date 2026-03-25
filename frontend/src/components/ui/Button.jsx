import React from 'react';

export const Button = React.forwardRef(({ className = '', variant = 'primary', ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-[10px] text-[13px] font-bold font-body transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2';
  
  const variants = {
    primary: 'bg-dark text-white hover:bg-[#222222]',
    outline: 'border-[1.5px] border-border bg-transparent hover:bg-page text-dark',
    accent: 'bg-lime text-dark hover:bg-lime-dark'
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Button.displayName = 'Button';
