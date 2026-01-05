import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Steps from "@/components/sections/Steps";
import Partners from "@/components/sections/Partners";
import Reviews from "@/components/sections/Reviews";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Steps />
        <Partners />
        <Reviews />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
