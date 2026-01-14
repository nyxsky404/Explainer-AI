import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'

const HeroSection = () => {
  return (
    <section
      className='flex min-h-[calc(100dvh-4rem)] flex-1 flex-col justify-center gap-12 overflow-x-hidden py-16 sm:gap-20 sm:py-24 lg:gap-28 lg:py-32'>
      {/* Hero Content */}
      <div
        className='mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 text-center sm:gap-12 sm:px-6 lg:px-8'>
        <div
          className='bg-muted flex items-center gap-3 rounded-full border px-4 py-2.5'>
          <Badge className='text-sm px-3 py-1'>AI-Powered</Badge>
          <span className='text-muted-foreground text-sm sm:text-base'>Turn any article into a podcast</span>
        </div>

        <h1
          className='text-4xl leading-[1.2] font-bold text-balance sm:text-5xl md:text-6xl lg:text-7xl'>
          Turn your reading list
          <br />
          into a{' '}
          <span className='relative'>
            playlist
            <svg
              width='223'
              height='12'
              viewBox='0 0 223 12'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='absolute inset-x-0 bottom-0 w-full translate-y-1/2 max-sm:hidden'>
              <path
                d='M1.11716 10.428C39.7835 4.97282 75.9074 2.70494 114.894 1.98894C143.706 1.45983 175.684 0.313587 204.212 3.31596C209.925 3.60546 215.144 4.59884 221.535 5.74551'
                stroke='url(#paint0_linear_10365_68643)'
                strokeWidth='2'
                strokeLinecap='round' />
              <defs>
                <linearGradient
                  id='paint0_linear_10365_68643'
                  x1='18.8541'
                  y1='3.72033'
                  x2='42.6487'
                  y2='66.6308'
                  gradientUnits='userSpaceOnUse'>
                  <stop stopColor='var(--primary)' />
                  <stop offset='1' stopColor='var(--primary-foreground)' />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p className='text-muted-foreground text-lg sm:text-xl max-w-2xl'>
          Transform any web page into a studio-quality podcast instantly.
          <br />
          Skip the mic, the editing, and the awkward pauses. It's not just text-to-speech; it's storytelling.
        </p>

        <Button size='lg' className='text-base px-8 py-6' asChild>
          <Link to='/signup'>Get Started</Link>
        </Button>
      </div>
    </section>
  );
}

export default HeroSection
