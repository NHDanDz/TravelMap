// app/components/ui/Card.tsx
interface CardProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export function Card({ children, className = '' }: CardProps) {
    return (
      <div className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}>
        {children}
      </div>
    );
  }
  
  interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
      <div className={`p-4 border-b border-gray-200 ${className}`}>
        {children}
      </div>
    );
  }
  
  interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export function CardBody({ children, className = '' }: CardBodyProps) {
    return (
      <div className={`p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
      <div className={`p-4 border-t border-gray-200 ${className}`}>
        {children}
      </div>
    );
  }
  