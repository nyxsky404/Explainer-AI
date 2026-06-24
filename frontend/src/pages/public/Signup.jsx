import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Logo from '@/assets/logo';

const GitHubIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
  </svg>
);

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!name) nextErrors.name = 'Name is required';
    if (!email) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';

    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    } else if (password) {
      if (password.length < 8) {
        nextErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(password)) {
        nextErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[0-9]/.test(password)) {
        nextErrors.password = 'Password must contain at least one number';
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        nextErrors.password = 'Password must contain at least one special character';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const result = await signup(name, email, password);
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        const message = result.message || 'Signup failed';
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Logo showText={false} className="mx-auto justify-center" />
          <h3
            className="mt-4 text-center text-lg font-bold text-foreground dark:text-foreground">
            Create new account
          </h3>
        </div>

        <Card className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <CardContent>
            <div className="mb-4 flex flex-col items-center space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 py-2"
                asChild>
                <a href={`https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=user:email`}>
                  <GitHubIcon className="size-5" aria-hidden={true} />
                  <span className="text-sm font-medium">Continue with GitHub</span>
                </a>
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errors.form && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.form}
                </p>
              )}
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground dark:text-foreground">
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="mt-1 text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground dark:text-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground dark:text-foreground">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-sm text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground dark:text-foreground">
                  Confirm password
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" className="mt-4 w-full py-2 font-medium" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <p
                className="text-center text-xs text-muted-foreground dark:text-muted-foreground">
                By signing in, you agree to our{' '}
                <Link
                  to="/terms"
                  className="capitalize text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">
                  Terms of use
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="capitalize text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">
                  Privacy policy
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p
          className="mt-6 text-center text-sm text-muted-foreground dark:text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
