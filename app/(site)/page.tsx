import Hero from "@/components/sections/Hero";
import ServiceHighlights from "@/components/sections/ServiceHighlights";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHeroSlides, getServices, getSiteConfig, getServiceCategories, getHeroMetrics } from "@/app/actions";

export default async function Home() {
  const slides = await getHeroSlides();
  const services = await getServices();
  const config = await getSiteConfig();
  const categories = await getServiceCategories();
  const metrics = await getHeroMetrics();
  const featured = services.slice(0, 3);

  return (
    <div className="flex flex-col">
      <Hero slides={slides} metrics={metrics} />
      <ServiceHighlights categories={categories} />

      {/* Featured Works Preview */}
      <section className="py-24 px-6 bg-mint">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-forest mb-4">Featured Works</h2>
              <p className="text-slate/60 max-w-md">Take a look at some of our recent installations and custom fabrication projects.</p>
            </div>
            <Link href="/services" className="text-forest font-bold border-b-2 border-forest/20 pb-1 hover:border-forest transition-all flex items-center gap-2 group">
              View All Projects
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((item) => (
              <div key={item.title} className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent z-10" />
                <div className="absolute bottom-8 left-8 z-20">
                  <span className="text-[10px] font-black tracking-widest text-mint uppercase mb-1 block">{item.cat}</span>
                  <h4 className="text-xl font-bold text-white uppercase">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />

      {/* CTA Section */}
      <section className="py-24 px-6 bg-forest relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mint/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint/5 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Ready to transform your home?</h2>
          <p className="text-mint/60 text-lg mb-12 max-w-xl">Whether it&apos;s a new steel gate, modern UPVC windows, or a complete home interior overhaul, SSM is here to help.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/contact" className="bg-mint text-forest px-10 py-5 rounded-[2rem] font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-black/20">
              Get Free Consultation
            </Link>
            <Link href={`tel:${config.phone.replace(/\s+/g, "")}`} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-white/20 transition-all">
              Call Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
