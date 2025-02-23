interface MarkerProps {
    lat: number;
    lng: number;
    children: React.ReactNode;
  }
  
  const Marker = ({ children, lat, lng }: MarkerProps) => (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2">
      {children}
    </div>
  );