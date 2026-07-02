const Card = ({ children, className = '', variant = 'glass', glow = false, ...props }) => {
  const variants = {
    glass: 'glass-dark p-6 shadow-2xl shadow-black/50',
    solid: 'bg-surface-dark border border-white/5 p-6',
    elevated: 'bg-surface-elevated border border-white/8 p-6',
    bento: 'bento-card p-6',
  };

  return (
    <div className={`${variants[variant]} ${glow ? 'glow-accent' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
