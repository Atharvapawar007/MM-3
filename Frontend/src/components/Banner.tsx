import collegeLogo from '../assets/CollegeLogo.jpg';

export function Banner() {
  return (
    <div className="w-full py-6 px-6 shadow-soft bg-[#1e3a8a]">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-6">
        {/* College Logo */}
        <div className="flex-shrink-0">
          <img
            src={collegeLogo}
            alt="KIT College of Engineering Logo"
            className="w-20 h-20 object-contain rounded-[100%]"
          />
        </div>
        
        {/* College Name */}
        <div className="text-center">
          <h1 className="text-xl font-medium text-primary-foreground leading-tight text-white">
            KOLHAPUR INSTITUTE OF TECHNOLOGY'S
          </h1>
          <h2 className="text-2xl font-medium text-primary-foreground mt-1 text-white">
            COLLEGE OF ENGINEERING KOLHAPUR
          </h2>
          <p className="text-lg text-primary-foreground opacity-90 mt-2 text-white">
            (EMPOWERED AUTONOMOUS)
          </p>
          <div className="mt-3 pt-2 border-t border-primary-foreground/20">
            <p className="text-sm text-primary-foreground opacity-80 text-white">
              Bus Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}