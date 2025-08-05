import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bus, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ForgotPasswordPageProps {
  onOtpSent: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onOtpSent, onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Password reset link sent to your email.');
        onOtpSent(); // This would now navigate to a page awaiting the user's action
      } else {
        toast.error(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background */}
      <div className="absolute inset-0 -z-10 h-screen w-full bg-gray-100 bg-[linear-gradient(to_right,#3333331a_1px,transparent_1px),linear-gradient(to_bottom,#3333331a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-900 opacity-10 blur-[100px]"></div>
      </div>
      
      {/* Main content */}
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-blue-600">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            Forgot Password
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            BusTracker Admin Portal
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="bg-card shadow-2xl bg-gray-100 border border-black">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-card-foreground">
                Reset Password
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a password reset link
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
                  className="border-2 border-border focus:border-blue-600 focus:ring-blue-600 transition-colors bg-white selection:text-white hover:border-black"
                  disabled={loading}
                />
              </div>

              {/* Send Reset Link Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:scale-105 text-white transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              {/* Return to Login */}
              <div className="flex justify-center pt-2">
                <a
                  onClick={onBackToLogin}
                  className="text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Login
                </a>
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