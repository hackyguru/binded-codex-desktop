import React from 'react';
import CircularProgress from './CircularProgress';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
  progress?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, bgColor, progress }) => {
  return (
    <div className={`rounded-3xl p-6 flex flex-col justify-between h-48 ${bgColor}`}>
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-black/10 flex items-center justify-center [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]">
          {icon}
        </div>
        {progress !== undefined && (
          <div className="relative">
            <CircularProgress percentage={progress} color="black" />
          </div>
        )}
      </div>
      <div>
        <p className="text-4xl font-bold text-black">{value}</p>
        <p className="text-sm text-black/70">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard; 