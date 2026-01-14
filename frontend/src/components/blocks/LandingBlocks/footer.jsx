import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Separator } from '@/components/ui/separator'

import Logo from '@/assets/logo'

const Footer = () => {
  return (
    <footer className='bg-[#000000] text-white'>
      <div
        className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <Link to='/'>
          <Logo className='gap-3 text-white' />
        </Link>

        <div className='flex items-center gap-5 whitespace-nowrap'>
          <a
            href='#'
            className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            About
          </a>
          <a
            href='#'
            className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Features
          </a>
          <a
            href='#'
            className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Works
          </a>
          <a
            href='#'
            className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Career
          </a>
        </div>

        <div className='flex items-center gap-4'>
          <a href='#'>
            <FacebookIcon className='size-5' />
          </a>
          <a href='#'>
            <InstagramIcon className='size-5' />
          </a>
          <a href='#'>
            <TwitterIcon className='size-5' />
          </a>
          <a href='#'>
            <YoutubeIcon className='size-5' />
          </a>
        </div>
      </div>
      <Separator className='bg-primary-foreground/20' />
      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
        <p className='text-center font-medium text-balance'>
          {`©${new Date().getFullYear()}`}{' '}
          <Link to='/' className='hover:underline'>
            Explainer AI
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer
