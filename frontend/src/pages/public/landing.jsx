import { Banner } from '@/components/blocks/LandingBlocks/banner'
import Header from '@/components/blocks/LandingBlocks/navbar'
import HeroSection from '@/components/blocks/LandingBlocks/hero-section'
import { Feature13 as StepCards } from '@/components/blocks/LandingBlocks/step-cards'
import { Feature166 as Feature } from '@/components/blocks/LandingBlocks/feature'
import { Process1 as Process } from '@/components/blocks/LandingBlocks/process'
import { Faq1 as Faq } from '@/components/blocks/LandingBlocks/faq'
import CTASection from '@/components/blocks/LandingBlocks/cta'
import Footer from '@/components/blocks/LandingBlocks/footer'

const Landing = () => {
    return (
        <>
            <Header />
            <HeroSection />
            <StepCards />
            <Feature />
            <Process />
            <Faq />
            <CTASection />
            <Footer />
        </>
    )
}

export default Landing
