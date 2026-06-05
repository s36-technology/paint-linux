interface StrokeSizeSliderProps {
  strokeSize: number;
  onStrokeSizeChange: (strokeSize: number) => void;
}

export default function StrokeSizeSlider({ strokeSize, onStrokeSizeChange }: StrokeSizeSliderProps) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-64 bg-[#2d2d2d] rounded-full border border-white/10 flex flex-col items-center py-4 shadow-lg z-10">
      <div className="w-4 h-1 bg-gray-400 rounded-full mb-2" />
      <div className="flex-1 w-1 bg-gray-600 rounded-full relative">
        <input
          type="range"
          min="1"
          max="50"
          value={strokeSize}
          onChange={(e) => onStrokeSizeChange(parseInt(e.target.value))}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-1 appearance-none bg-transparent cursor-pointer -rotate-90 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#4cc2ff] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#202020]"
        />
      </div>
      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
    </div>
  );
}
