import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Cross } from 'lucide-react';

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
        {/* S+T merged logo with medical theme */}
        <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center shadow-glow">
          <div className="relative">
            <Shield className="w-6 h-6 text-white absolute -top-0.5 -left-0.5" />
            <Cross className="w-4 h-4 text-white absolute top-1 left-1" />
          </div>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-primary">SihaCare</h1>
          <p className="text-xs text-muted-foreground -mt-0.5">Supply Chain Security</p>
        </div>
      )}
    </div>
  );
}