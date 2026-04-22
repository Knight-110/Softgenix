import { openWhatsApp } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

const FloatingWhatsApp = () => {
  return (
    <button
      onClick={() => openWhatsApp("Hi Softgenix! I came from your website.")}
      aria-label="Chat with Softgenix on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <span className="absolute inset-0 rounded-full border border-white/18 opacity-45 group-hover:opacity-65 transition-opacity animate-pulse-glow" />
      <span className="relative flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/22 bg-black text-white font-medium shadow-elevated">
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Chat with us</span>
      </span>
    </button>
  );
};

export default FloatingWhatsApp;
