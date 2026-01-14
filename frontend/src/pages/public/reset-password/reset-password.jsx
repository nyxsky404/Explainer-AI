import { ChevronLeftIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import Logo from '@/assets/logo'
import ResetPasswordForm from './reset-password-form'

const ResetPassword = () => {
  return (
    <div
      className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <Card className='z-1 w-full border-none shadow-md sm:max-w-md'>
        <CardHeader className='gap-6'>
          <Logo showText={false} className='gap-3' />

          <div>
            <CardTitle className='mb-1.5 text-2xl'>Reset Password</CardTitle>
            <CardDescription className='text-base'>
              Please enter your new password to update your account security.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* ResetPassword Form */}
          <ResetPasswordForm />

          <Link to='/login' className='group mx-auto flex w-fit items-center gap-2'>
            <ChevronLeftIcon
              className='size-5 transition-transform duration-200 group-hover:-translate-x-0.5' />
            <span>Back to login</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword
