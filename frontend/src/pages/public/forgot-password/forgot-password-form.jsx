import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: 'Please enter your email address' });
      toast.error('Please enter your email address');
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setEmailSent(true);
        toast.success('Reset link sent! Check your email.');
      } else {
        const message = result.message || 'Failed to send reset link';
        setErrors({ form: message });
        toast.error(message);
      }
    } catch (error) {
      const message = getFriendlyErrorMessage(error);
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox.
        </p>
        <Button
          variant="outline"
          onClick={() => setEmailSent(false)}
          className="w-full"
        >
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errors.form}
        </p>
      )}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='email'>
          Email address*
        </Label>
        <Input
          type='email'
          id='email'
          name='email'
          autoComplete='email'
          placeholder='Enter your email address'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>
      <Button className='w-full' type='submit' disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
