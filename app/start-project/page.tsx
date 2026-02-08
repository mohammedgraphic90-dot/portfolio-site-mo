import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartProjectForm from "@/components/StartProjectForm";

export const dynamic = "force-static";

export default function StartProjectPage() {
  return (
    <div className="font-sans antialiased text-slate-200 bg-slate-950 selection:bg-teal-400/30 selection:text-teal-200">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <StartProjectForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
