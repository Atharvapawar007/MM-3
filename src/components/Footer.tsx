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
          fill="#E53935"
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
          stroke="#333333"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M15 9.354a4 4 0 1 0 0 5.292"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  
    return (
      <div 
        className="w-full py-6 px-6 border-t"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#E53935'
        }}
      >
        <div className="max-w-6xl mx-auto text-center space-y-3">
          {/* Made with love by team */}
          <div className="space-y-1">
            {/* Made with heart by line */}
            <div className="flex items-center justify-center gap-2">
              <span style={{ color: '#333333' }}>Made with</span>
              <HeartIcon />
              <span style={{ color: '#333333' }}>by</span>
            </div>
            
            {/* Team member names line */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span 
                className="font-medium"
                style={{ color: '#E53935' }}
              >
                Atharva Pawar
              </span>
              <span style={{ color: '#333333' }}>,</span>
              <span 
                className="font-medium"
                style={{ color: '#E53935' }}
              >
                Yash Mulay
              </span>
              <span style={{ color: '#333333' }}>,</span>
              <span 
                className="font-medium"
                style={{ color: '#E53935' }}
              >
                Vaishnavi Hajare
              </span>
              <span style={{ color: '#333333' }}>,</span>
              <span 
                className="font-medium"
                style={{ color: '#E53935' }}
              >
                Tanvi Patil
              </span>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
              All Rights Reserved
            </span>
            <span className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
              |
            </span>
            <span className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
              copyright
            </span>
            <CopyrightIcon />
            <span className="text-sm" style={{ color: '#333333', opacity: 0.7 }}>
              2025
            </span>
          </div>
        </div>
      </div>
    );
  }