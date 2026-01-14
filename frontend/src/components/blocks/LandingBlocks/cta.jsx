import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const CTASection = () => {
  return (
    <section className='bg-background py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <Card className='bg-background rounded-none border-0 shadow-none'>
          <CardContent
            className='flex justify-between gap-6 max-lg:flex-col md:px-8 lg:items-center'>
            <div className='space-y-4'>
              <h2
                className='text-foreground text-2xl font-semibold md:text-3xl lg:text-4xl'>
                Stop reading. Start listening.
              </h2>
              <p className='text-muted-foreground text-lg md:text-xl'>
                Join the audio revolution in seconds. No credit card, no microphone, no excuses.
              </p>
            </div>
            <div>
              <Button
                size='lg'
                className='shrink-0 rounded-lg text-base has-[>svg]:px-6'
                asChild>
                <Link to='/signup' className='inline-flex items-center gap-2'>
                  Get Started Free
                  <ArrowRightIcon className='size-5' />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default CTASection
