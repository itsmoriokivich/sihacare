import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Package } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={handleClick}
    >
      <div className="relative">
        {/* Medical supply tracing logo */}
        <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center shadow-glow">
          <div className="relative">
            <Package className="w-5 h-5 text-white absolute top-0.5 left-0.5" />
            <Route className="w-6 h-6 text-white/90 absolute -top-0.5 -left-0.5" />
          </div>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-primary">SihaTrace</h1>
          <p className="text-xs text-muted-foreground -mt-0.5">Medical Supply Traceability</p>
        </div>
      )}
    </div>
  );
}