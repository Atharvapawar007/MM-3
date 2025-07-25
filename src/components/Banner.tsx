import { ImageWithFallback } from './figma/ImageWithFallback';

export function Banner() {
  return (
    <div 
      className="w-full py-4 px-6 shadow-md"
      style={{ backgroundColor: '#E53935' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
        {/* College Logo */}
        <div 
          className="w-16 h-16 rounded-full border-4 overflow-hidden flex items-center justify-center"
          style={{ borderColor: '#FFFFFF' }}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop&crop=center"
            alt="College Logo"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* College Name */}
        <div className="text-center">
          <h1 
            className="text-3xl font-bold"
            style={{ color: '#FFFFFF' }}
          >
            CollegeName
          </h1>
          <p 
            className="text-sm mt-1"
            style={{ color: '#FFFFFF', opacity: 0.9 }}
          >
            Bus Management System
          </p>
        </div>
      </div>
    </div>
  );
}