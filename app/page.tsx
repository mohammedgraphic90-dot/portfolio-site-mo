import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <div className="font-sans antialiased text-slate-200 bg-slate-950 selection:bg-teal-400/30 selection:text-teal-200">
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
