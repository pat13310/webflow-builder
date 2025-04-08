import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PushButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const PushButton = React.forwardRef<HTMLButtonElement, PushButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";
    
    const variants = {
      primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-200 dark:hover:bg-gray-800",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    const iconSizes = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn("animate-spin", iconSizes[size])} />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={iconSizes[size]}>{leftIcon}</span>
            )}
            {children}
            {rightIcon && (
              <span className={iconSizes[size]}>{rightIcon}</span>
            )}
          </>
        )}

        {/* Focus ring animation */}
        <motion.span
          className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent pointer-events-none"
          initial={false}
          animate={{
            opacity: props.onFocus ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    );
  }
);

PushButton.displayName = 'PushButton';

export default PushButton;