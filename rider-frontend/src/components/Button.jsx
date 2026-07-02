import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";
  
  const variants = {
    primary: "bg-accent text-black hover:bg-accent-bright hover:shadow-[0_0_30px_rgba(212,255,0,0.35)] focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-dark",
    secondary: "bg-transparent text-white border-2 border-white/15 hover:border-accent hover:text-accent",
    accent: "bg-violet text-white hover:bg-violet/90 shadow-[0_0_24px_rgba(255,45,106,0.3)]",
    ghost: "bg-transparent text-text-secondary hover:text-accent uppercase tracking-widest text-xs",
    danger: "bg-error/10 text-error border border-error/30 hover:bg-error/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-xs",
    lg: "px-8 py-4 text-sm",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
