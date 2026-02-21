import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export const AuthCard = ({ children, className }: AuthCardProps) => {
  return (
    <div className={cn(
      "w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8",
      className
    )}>
      {children}
    </div>
  );
};

interface AuthCardHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export const AuthCardHeader = ({ icon, title, description }: AuthCardHeaderProps) => {
  return (
    <div className="text-center mb-8">
      {icon && (
        <div className="mx-auto mb-6 size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
};

interface AuthCardFooterProps {
  children: ReactNode;
  className?: string;
}

export const AuthCardFooter = ({ children, className }: AuthCardFooterProps) => {
  return (
    <div className={cn("mt-6 text-center text-sm", className)}>
      {children}
    </div>
  );
};
