import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatbotButton() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="lg"
        className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[#A3FF12] to-[#8FE610] text-black shadow-[0_0_30px_rgba(163,255,18,0.4)] hover:shadow-[0_0_40px_rgba(163,255,18,0.6)] transition-all duration-300 group"
      >
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#A3FF12] animate-ping opacity-20" />
        
        {/* Icon */}
        <MessageCircle size={28} className="relative z-10 group-hover:scale-110 transition-transform" />
        
        {/* Notification dot */}
        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0B0F0C] animate-pulse" />
      </Button>
    </motion.div>
  );
}
