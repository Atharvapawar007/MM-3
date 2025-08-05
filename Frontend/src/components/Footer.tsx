export function Footer() {
  // Heart emoji SVG
  const HeartIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill="#EF4444"
      />
    </svg>
  );

  // Copyright SVG
  const CopyrightIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M15 9.354a4 4 0 1 0 0 5.292"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="w-full py-6 px-6 border border-black bg-[#1e3a8a]">
      <div className="max-w-6xl mx-auto text-center space-y-3">
        {/* Made with love by team */}
        <div className="space-y-1">
          {/* Made with heart by line */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-white">Made with</span>
            <HeartIcon />
            <span className="text-white">by</span>
          </div>
          
          {/* Team member names line */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-medium text-white">
              Atharva Pawar
            </span>
            <span className="text-muted-foreground">,</span>
            <span className="font-medium text-white">
              Yash Mulay
            </span>
            <span className="text-muted-foreground">,</span>
            <span className="font-medium text-white">
              Vaishnavi Hajare
            </span>
            <span className="text-muted-foreground">,</span>
            <span className="font-medium text-white">
              Tanvi Patil
            </span>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="flex items-center justify-center gap-2 text-white">
          <span className="text-sm">
            All Rights Reserved
          </span>
          <span className="text-sm">
            |
          </span>
          <span className="text-sm">
            copyright
          </span>
          <CopyrightIcon />
          <span className="text-sm">
            2025
          </span>
        </div>
      </div>
    </div>
  );
}