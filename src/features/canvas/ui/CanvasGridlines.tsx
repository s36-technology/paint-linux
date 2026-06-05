export default function CanvasGridlines() {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        zIndex: 40,
      }}
    />
  );
}
