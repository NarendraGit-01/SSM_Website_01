import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Hammer } from "lucide-react";

export default function Footer({ config }: { config: any }) {
    return (
        <footer className="bg-forest text-pearl py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="flex flex-col gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-mint p-2 rounded-xl">
                            <Hammer className="text-forest w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold tracking-tight text-white leading-none">SSM</span>
                            <span className="text-xs uppercase tracking-widest text-mint/80 font-semibold">Steel Metals</span>
                        </div>
                    </Link>
                    <p className="text-mint/70 text-sm leading-relaxed">
                        Excellence in manufacturing steel gates, UPVC doors, and premium interior works for over 15 years.
                    </p>
                    <div className="flex gap-4">
                        <a href={config.facebook || "#"} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-mint hover:text-forest transition-all">
                            <Facebook size={20} />
                        </a>
                        <a href={config.instagram || "#"} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-mint hover:text-forest transition-all">
                            <Instagram size={20} />
                        </a>
                        <a href={config.twitter || "#"} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-mint hover:text-forest transition-all">
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>

                {/* Services */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-white">Our Services</h4>
                    <ul className="flex flex-col gap-4 text-sm text-mint/70">
                        <li><Link href="/services?cat=steel" className="hover:text-mint transition-colors underline-offset-4 hover:underline">Steel Gates</Link></li>
                        <li><Link href="/services?cat=upvc" className="hover:text-mint transition-colors underline-offset-4 hover:underline">UPVC Windows & Doors</Link></li>
                        <li><Link href="/services?cat=iron" className="hover:text-mint transition-colors underline-offset-4 hover:underline">Iron Ornamental Works</Link></li>
                        <li><Link href="/services?cat=interior" className="hover:text-mint transition-colors underline-offset-4 hover:underline">Home Interior Works</Link></li>
                        <li><Link href="/services?cat=lift" className="hover:text-mint transition-colors underline-offset-4 hover:underline">Home Lift Installations</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
                    <ul className="flex flex-col gap-4 text-sm text-mint/70">
                        <li><Link href="/about" className="hover:text-mint transition-colors underline-offset-4 hover:underline">About Us</Link></li>
                        <li><Link href="/catalog" className="hover:text-mint transition-colors underline-offset-4 hover:underline">Product Catalog</Link></li>
                        <li><Link href="/contact" className="hover:text-mint transition-colors underline-offset-4 hover:underline">Contact Support</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-white">Visit Us</h4>
                    <ul className="flex flex-col gap-6 text-sm text-mint/70">
                        <li className="flex gap-3">
                            <MapPin className="text-mint shrink-0" size={20} />
                            <a
                                href={config.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-mint transition-colors whitespace-pre-line"
                            >
                                {config.address}
                            </a>
                        </li>
                        <li className="flex gap-3">
                            <Phone className="text-mint shrink-0" size={20} />
                            <a href={`tel:${config.phone}`} className="hover:text-mint transition-colors">
                                {config.phone}
                            </a>
                        </li>
                        <li className="flex gap-3">
                            <Mail className="text-mint shrink-0" size={20} />
                            <a href={`mailto:${config.email}`} className="hover:text-mint transition-colors">
                                {config.email}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-xs text-mint/40 font-medium tracking-widest uppercase">
                &copy; {new Date().getFullYear()} {config.businessName}. All rights reserved.
            </div>
        </footer>
    );
}
