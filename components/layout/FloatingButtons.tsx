"use client";

import { MessageCircle, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingButtons({ config }: { config: any }) {
    return (
        <div className="fixed bottom-8 right-6 flex flex-col gap-3 z-50">
            <motion.a
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=Hi%20SSM%2C%20I%20am%20interested%20in%20your%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                whileHover={{ scale: 1.15 }}
                className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle size={28} fill="currentColor" />
            </motion.a>
            <motion.a
                href={`tel:${config.phone.replace(/\s+/g, "")}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring" }}
                whileHover={{ scale: 1.15 }}
                className="w-14 h-14 bg-forest text-mint rounded-full shadow-2xl flex items-center justify-center"
                aria-label="Call SSM"
            >
                <PhoneCall size={26} />
            </motion.a>
        </div>
    );
}
