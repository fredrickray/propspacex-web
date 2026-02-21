import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ 
    children, 
    variant = "primary", 
    isLoading, 
    leftIcon, 
    rightIcon,
    className, 
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-primary hover:bg-primary-dark text-primary-foreground",
      outline: "border border-border bg-transparent hover:bg-muted text-foreground",
      ghost: "bg-transparent hover:bg-muted text-foreground",
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "w-full h-12 px-6 rounded-lg font-bold text-sm",
          "flex items-center justify-center gap-2",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";
