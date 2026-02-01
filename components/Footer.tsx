import { Instagram, MessageCircle, Heart } from "lucide-react";

export default function Footer() {
  const instagramUrl = "https://www.instagram.com/mohammedayman_7/";
  const whatsappNumber = "972592782179";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Mohammed Ayman</h2>
            <p className="text-slate-400 text-sm">Web Developer & UI Designer</p>
          </div>

          <div className="flex gap-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-pink-900/20 hover:text-pink-400 transition-colors"
              aria-label="instagram"
            >
              <Instagram size={20} />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-900/20 hover:text-emerald-400 transition-colors"
              aria-label="whatsapp"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>

          <div className="text-slate-500 text-sm flex items-center gap-1 text-center md:text-right">
            <span>© 2026 All rights reserved</span>
            <span className="hidden sm:inline mx-2">|</span>
            <span className="flex items-center gap-1">
              Made with <Heart size={12} className="text-red-500 fill-red-500" /> in Palestine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
