import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import Logo from '@/assets/logo';

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, verifyEmail, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-verify if token is present in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleVerify(token);
    }
  }, [searchParams]);

  const handleVerify = async (token) => {
    setIsVerifying(true);
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        toast.success('Email verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resendVerificationEmail(user.email);
      if (result.success) {
        toast.success('Verification email sent!');
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (isVerifying) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-pulse text-muted-foreground'>Verifying your email...</div>
      </div>
    );
  }

  return (
    <div
      className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <Card className='z-1 w-full border-none shadow-md sm:max-w-md'>
        <CardHeader className='gap-6'>
          <Logo showText={false} className='gap-3' />

          <div>
            <CardTitle className='mb-1.5 text-2xl'>Verify your email</CardTitle>
            <CardDescription className='text-base'>
              An activation link has been sent to your email address
              {user?.email && <strong>: {user.email}</strong>}. Please check your inbox and
              click on the link to complete the activation process.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <Button className='w-full' onClick={handleSkip}>
              Skip for now
            </Button>

            <p className='text-muted-foreground text-center'>
              Didn&apos;t get the mail?{' '}
              <button
                onClick={handleResend}
                disabled={isLoading}
                className='text-card-foreground hover:underline disabled:opacity-50'
              >
                {isLoading ? 'Sending...' : 'Resend'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
