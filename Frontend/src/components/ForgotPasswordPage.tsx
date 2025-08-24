import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Mail, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success('Password reset link sent to your email!');
      } else {
        toast.error(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-100 bg-[linear-gradient(to_right,#3333331a_1px,transparent_1px),linear-gradient(to_bottom,#3333331a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Blue Blur Effect */}
      <div className="absolute left-0 right-0 top-0 m-auto h-[310px] w-[310px] rounded-full bg-blue-900 opacity-10 blur-[100px]"></div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back to Login Button */}
        <div className="mb-6">
          <Button
            onClick={onBackToLogin}
            variant="outline"
            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </div>

        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-primary">
            <Mail className="w-8 h-8 text-primary-foreground text-white" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            Forgot Password
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="bg-card shadow-2xl bg-gray-100 border border-black">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-card-foreground">
                Reset Your Password
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              {emailSent 
                ? "Check your email for the password reset link"
                : "We'll send you a secure link to reset your password"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-border focus:border-primary focus:ring-primary transition-colors bg-input-background selection:text-white hover:border-black"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-3 bg-primary hover:scale-105 text-primary-foreground transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-white">Send Password Reset Link</span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-700">
                      Email Sent Successfully
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-700">
                      Next Steps
                    </span>
                  </div>
                  <ul className="mt-2 text-sm text-blue-600 space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the "Reset Password" button in the email</li>
                    <li>• You'll be redirected to set a new password</li>
                    <li>• The link expires in 1 hour for security</li>
                  </ul>
                </div>

                {/* Resend Button */}
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full py-3 border-2 border-border hover:border-primary transition-colors"
                >
                  Send Another Link
                </Button>
              </div>
            )}
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