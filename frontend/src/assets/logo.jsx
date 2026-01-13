import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

const Logo = ({ className }) => {
    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            <Layers className='size-8' />
            <span className='text-xl font-semibold'>Brand Name</span>
        </div>
    );
}

export default Logo
