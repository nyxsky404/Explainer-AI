import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

const Logo = ({ className, showText = true }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Layers className='size-6' />
            {showText && <span className='text-base font-semibold'>Explainer AI</span>}
        </div>
    );
}

export default Logo
