import { MenuIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import Logo from '@/assets/logo'

const Header = ({
  navigationData = [
    { title: 'Home', href: '/' },
    { title: 'Features', href: '#features' },
    { title: 'Process', href: '#process' },
    { title: 'FAQ', href: '#faq' }
  ],
  className
}) => {
  return (
    <header
      className={cn('bg-background sticky top-0 z-50 h-16 border-b', className)}>
      <div
        className='mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link to='/'>
          <Logo className='gap-3' />
        </Link>

        {/* Navigation */}
        <NavigationMenu className='hidden md:flex'>
          <NavigationMenuList className='flex-wrap justify-start gap-0'>
            {navigationData.map(navItem => (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuLink
                  href={navItem.href}
                  className='text-muted-foreground hover:text-primary px-3 py-1.5 text-base font-medium hover:bg-transparent'>
                  {navItem.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Login Button - Desktop */}
        <Button className='rounded-lg hidden md:inline-flex' asChild>
          <Link to='/login'>Login</Link>
        </Button>

        {/* Navigation for small screens */}
        <div className='flex gap-4 md:hidden'>
          <Button className='rounded-lg' asChild>
            <Link to='/login'>Login</Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <MenuIcon />
                <span className='sr-only'>Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end'>
              {navigationData.map((item, index) => (
                <DropdownMenuItem key={index}>
                  <a href={item.href}>{item.title}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header
