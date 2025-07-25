import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Bus, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempted with:', { email, password });
    
    // For demo purposes, we'll just authenticate on form submission
    // In a real app, you'd validate credentials here
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="w-full max-w-md">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#1565C0' }}>
            <Bus className="w-8 h-8" style={{ color: '#FFFFFF' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
            BusTracker Admin
          </h1>
          <p className="text-sm mt-2" style={{ color: '#333333', opacity: 0.7 }}>
            Administrative Portal Access
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF' }}>
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5" style={{ color: '#1565C0' }} />
              <CardTitle style={{ color: '#333333' }}>Secure Login</CardTitle>
            </div>
            <CardDescription style={{ color: '#333333', opacity: 0.7 }}>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#333333' }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 focus:ring-2 transition-all"
                  style={{ 
                    borderColor: '#E53935',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#333333' }}>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 focus:ring-2 transition-all pr-10"
                    style={{ 
                      borderColor: '#E53935',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2"
                    style={{ accentColor: '#1565C0' }}
                  />
                  <span className="text-sm" style={{ color: '#333333' }}>
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: '#1565C0' }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full py-3 transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#1565C0',
                  color: '#FFFFFF'
                }}
              >
                Sign In to Dashboard
              </Button>

              {/* Admin Access Notice */}
              <div 
                className="p-3 rounded-lg border-l-4 text-sm"
                style={{ 
                  backgroundColor: '#FFEB3B',
                  borderLeftColor: '#E53935',
                  color: '#333333'
                }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: '#E53935' }} />
                  <span className="font-medium">Administrative Access Only</span>
                </div>
                <p className="mt-1 text-xs opacity-80">
                  This portal is restricted to authorized administrators only.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: '#333333', opacity: 0.6 }}>
            © 2025 BusTracker Admin Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}