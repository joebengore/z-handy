import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import Services from "@/components/Services";
import About from "@/components/About";
import Scheduler from "@/components/Scheduler";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

/**
 * Single-page layout: every section carries an anchor id so the
 * sticky Navbar can smooth-scroll visitors to any block.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <Services />
        <About />
        <Scheduler />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
