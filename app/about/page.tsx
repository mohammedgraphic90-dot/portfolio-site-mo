import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Footer from "@/components/Footer";

export const dynamic = "force-static"; 

export default function AboutPage() {
  return (
    <div className="font-sans antialiased text-slate-200 bg-slate-950">
      <Navbar />
      <main>
        <About />
      </main>
      <Footer />
    </div>
  );
}
