import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  id, 
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`bg-transparent border-b-2 ${error ? 'border-error' : 'border-white/15'} px-0 py-3 text-sm text-white placeholder:text-text-secondary/30 focus:outline-none focus:border-accent transition-colors`}
        {...props}
      />
      {error && (
        <span className="text-xs text-error mt-0.5">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
