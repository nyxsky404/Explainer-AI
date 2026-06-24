import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';

import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = searchParams.get('token');

    if (!token) {
      const message = 'Invalid reset link. Please request a new one.';
      setErrors({ form: message });
      toast.error(message);
      return;
    }

    const nextErrors = {};
    if (!password) nextErrors.password = 'Password is required';
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    } else if (password && password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        toast.success('Password reset successfully!');
        navigate('/login');
      } else {
        const message = result.message || 'Failed to reset password';
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

  return (
    <form className='space-y-4' onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errors.form}
        </p>
      )}
      {/* Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='password'>
          New Password*
        </Label>
        <div className='relative'>
          <Input
            id='password'
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='pr-9'
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsPasswordVisible(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'>
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isPasswordVisible ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>
      {/* Confirm Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='confirmPassword'>
          Confirm Password*
        </Label>
        <div className='relative'>
          <Input
            id='confirmPassword'
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='pr-9'
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsConfirmPasswordVisible(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'>
            {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isConfirmPasswordVisible ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
        {errors.confirmPassword && (
          <p id="confirmPassword-error" role="alert" className="text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>
      <Button className='w-full' type='submit' disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Set New Password'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
