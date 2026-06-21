import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import FeaturedEvents from "../components/landing/FeaturedEvents";
import ConcertMarquee from "../components/landing/ConcertMarquee";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedEvents />
      <ConcertMarquee />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}


