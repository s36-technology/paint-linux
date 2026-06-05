interface CanvasRulersProps {
  width: number;
  height: number;
}

export default function CanvasRulers({ width, height }: CanvasRulersProps) {
  return (
    <>
      <div className="absolute top-[-20px] left-0 w-full h-[20px] bg-white border-b border-gray-300 overflow-hidden" style={{ zIndex: 45 }}>
        {Array.from({ length: Math.ceil(width / 100) }).map((_, i) => (
          <div key={i} className="absolute top-0 h-full border-l border-gray-400 text-[10px] text-gray-500 pl-1" style={{ left: i * 100 }}>
            {i * 100}
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-[-20px] w-[20px] h-full bg-white border-r border-gray-300 overflow-hidden" style={{ zIndex: 45 }}>
        {Array.from({ length: Math.ceil(height / 100) }).map((_, i) => (
          <div key={i} className="absolute left-0 w-full border-t border-gray-400 text-[10px] text-gray-500 pt-1 text-center" style={{ top: i * 100, transform: 'rotate(-90deg)', transformOrigin: 'left top', marginTop: i * 100 > 0 ? '20px' : '0' }}>
            {i * 100}
          </div>
        ))}
      </div>
    </>
  );
}
