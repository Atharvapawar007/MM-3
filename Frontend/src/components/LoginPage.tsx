import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Bus, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({ onLogin, onForgotPassword }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Make the API call to your backend
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login was successful
        toast.success(data.message || 'Login successful!');
        // Store the token (e.g., in localStorage or a state management solution)
        localStorage.setItem('token', data.token);
        // FIX: Access the userId from the nested 'user' object and 'id' property.
        if (data.user && data.user._id) {
          localStorage.setItem('userId', data.user._id);
        }
        onLogin(); // Navigate to the next page
      } else {
        // Login failed
        toast.error(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="absolute inset-0 -z-10 h-screen w-full bg-gray-100 bg-[linear-gradient(to_right,#3333331a_1px,transparent_1px),linear-gradient(to_bottom,#3333331a_1px,transparent_1px)] bg-[size:14px_24px]">
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-900 opacity-10 blur-[100px]"></div>
</div>
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
        <Card className="bg-card shadow-2xl bg-gray-100 border border-black">
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
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
                  onClick={e => { e.preventDefault(); onForgotPassword(); }}
                  className="text-sm text-secondary hover:text-secondary/80 hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-primary hover:scale-105 text-primary-foreground transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-white">Sign In to Dashboard</span>
                )}
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
    </>
  );
}

