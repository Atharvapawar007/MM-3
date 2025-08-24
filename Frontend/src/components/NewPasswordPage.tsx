import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Lock, Shield, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface NewPasswordPageProps {
  onBackToLogin: () => void;
}

export function NewPasswordPage({ onBackToLogin }: NewPasswordPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Get token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    console.log('NewPasswordPage: URL params:', window.location.search);
    console.log('NewPasswordPage: Extracted token:', tokenFromUrl ? 'PRESENT' : 'MISSING');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      console.error('NewPasswordPage: No token found in URL');
      toast.error('Invalid or missing reset token. Please request a new password reset link.');
      onBackToLogin();
    }
  }, [onBackToLogin]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('NewPasswordPage: Submitting password reset with token:', token ? 'PRESENT' : 'MISSING');
    
    if (!token) {
      toast.error('Invalid reset token. Please request a new password reset link.');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Please ensure your password meets all requirements.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      console.log('NewPasswordPage: Making API call to reset password');
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword: password 
        }),
      });

      const data = await response.json();
      console.log('NewPasswordPage: API response:', { status: response.status, data });

      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('NewPasswordPage: Password reset request failed:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gray-100 bg-[linear-gradient(to_right,#3333331a_1px,transparent_1px),linear-gradient(to_bottom,#3333331a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        {/* Blue Blur Effect */}
        <div className="absolute left-0 right-0 top-0 m-auto h-[310px] w-[310px] rounded-full bg-blue-900 opacity-10 blur-[100px]"></div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Header with branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-green-500">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-medium text-foreground">
              Password Reset Successfully!
            </h1>
            <p className="text-sm mt-2 text-muted-foreground">
              Your password has been updated successfully
            </p>
          </div>

          {/* Success Card */}
          <Card className="bg-card shadow-2xl bg-gray-100 border border-black">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <CardTitle className="text-card-foreground">
                  Success!
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Your password was successfully reset. You can now head back to the login page.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-700">
                      Password Updated
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    Your new password has been saved and you can now log in with your new credentials.
                  </p>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-700">
                      Security Notice
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-blue-600">
                    For your security, this reset link can no longer be used. If you need to reset your password again, please request a new link.
                  </p>
                </div>

                {/* Back to Login Button */}
                <Button
                  onClick={onBackToLogin}
                  className="w-full py-3 bg-primary hover:scale-105 text-primary-foreground transition-all duration-200"
                >
                  <span className="text-white">Back to Login</span>
                </Button>
              </div>
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
            <Lock className="w-8 h-8 text-primary-foreground text-white" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            Set New Password
          </h1>
          <p className="text-sm mt-2 text-muted-foreground">
            Create a strong password for your account
          </p>
        </div>

        {/* New Password Card */}
        <Card className="bg-card shadow-2xl bg-gray-100 border border-black">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-card-foreground">
                Create New Password
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
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

                {/* Password Requirements */}
                <div className="text-xs space-y-1">
                  <p className="font-medium text-foreground">Password Requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.minLength ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasUpperCase ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasLowerCase ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasNumbers ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      One number
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      One special character
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`border-2 transition-colors bg-input-background selection:text-white pr-10 ${
                      confirmPassword.length > 0 
                        ? passwordsMatch 
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                          : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-primary focus:ring-primary hover:border-black'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-1 h-1 rounded-full ${passwordsMatch ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-primary hover:scale-105 text-primary-foreground transition-all duration-200"
                disabled={loading || !passwordValidation.isValid || !passwordsMatch}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-white">Reset Password</span>
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
  );
}
