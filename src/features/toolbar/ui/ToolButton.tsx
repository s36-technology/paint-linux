import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label?: string;
}

export default function ToolButton({ icon, active, onClick, label }: ToolButtonProps) {
  return (
    <button
      title={label}
      className={`p-1.5 rounded flex items-center justify-center transition-colors ${active ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-300'}`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
