// app/components/ui/StatusBadge.tsx
interface StatusBadgeProps {
    status: string;
    className?: string;
  }
  
  export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    switch(status) {
      case 'high_risk':
        return <span className={`px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>Nguy cơ cao</span>;
      case 'active':
        return <span className={`px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ${className}`}>Đang hoạt động</span>;
      case 'stabilized':
        return <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>Đã ổn định</span>;
      case 'monitored':
        return <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>Đang theo dõi</span>;
      default:
        return <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>{status}</span>;
    }
  }