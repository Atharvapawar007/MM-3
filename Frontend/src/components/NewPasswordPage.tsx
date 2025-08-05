import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Bus, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewPasswordPageProps {
  onPasswordReset: () => void;
  token: string;
}

export function NewPasswordPage({ onPasswordReset, token }: NewPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Password reset successfully!');
        onPasswordReset(); // Navigate back to the login page
      } else {
        toast.error(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password request failed:', error);
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
            Set New Password
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            BusTracker Admin Portal
          </p>
        </div>

        {/* Reset Password Card */}
        <Card className="bg-card shadow-2xl bg-gray-100 border border-black">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-card-foreground">
                Reset Your Password
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Enter and confirm your new password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="border-2 border-border focus:border-blue-600 focus:ring-blue-600 pr-10 transition-colors bg-white selection:text-white hover:border-black"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-2 border-border focus:border-blue-600 focus:ring-blue-600 transition-colors bg-white selection:text-white hover:border-black"
                  disabled={loading}
                />
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:scale-105 text-white transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </Button>
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
