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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-primary">
            <Bus className="w-8 h-8 text-primary-foreground text-white" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            BusTracker Admin
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            Administrative Portal Access
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 bg-card shadow-2xl bg-gray-100 border border-black">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-card-foreground">
                Secure Login
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background selection:text-white hover:border-black"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-border focus:border-primary focus:ring-primary pr-10 transition-colors bg-input-background selection:text-white hover:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="w-4 h-4 rounded border-2 border-border accent-primary selection:text-white hover:border-black"
                  />
                  <span className="text-sm text-foreground">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-secondary hover:text-secondary/80 hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-primary hover:scale-105 text-primary-foreground transition-all duration-200"
              >
                <span className="text-white">Sign In to Dashboard</span>
              </Button>

              {/* Admin Access Notice */}
              <div className="bg-amber-500/10 border-l-4 border-accent p-3 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent text-amber-500" />
                  <span className="font-medium text-accent-foreground">
                    Administrative Access Only
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  This portal is restricted to authorized administrators only.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2025 BusTracker Admin Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}