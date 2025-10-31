import Image from "next/image";
import { Instagram } from "lucide-react"; // ✅ lightweight icon from lucide-react

export const metadata = {
  title: "About — BhangraEscape",
};

export default function About() {
  return (
    <section className="min-h-[80vh] flex flex-col md:flex-row border border-gray-300 rounded-xl overflow-hidden bg-white">
      {/* LEFT TEXT SECTION */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-b from-indigo-50 to-white">
        <h2 className="text-sm tracking-widest text-gray-500 uppercase mb-3">
          Our Story
        </h2>

        <h1
          className="text-3xl md:text-4xl font-bold text-indigo-900 leading-snug mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Our Journey: From a Shared Passion to a Cultural Beacon
        </h1>

        <p className="text-gray-700 leading-relaxed mb-4">
          <span className="font-semibold text-indigo-800">BhangraScape</span>'s story is one of cultural connection and artistic expression.
          Founded in Ottawa, our team emerged from a simple desire to keep the spirit of Punjab alive through the dynamic art of Bhangra.
          In a land far from our roots, dance became our most powerful language—a way to celebrate, to remember, and to share.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          As our family grew, so did our ambition. We now attract dedicated dancers who blend technical skill with profound passion,
          crafting performances that are both authentic and exhilarating. Our core mission remains: to be steadfast custodians of our
          tradition and vibrant ambassadors of our culture. Through every beat and every step, we carry the essence of home with us,
          sharing its joy and energy with the world.
        </p>

       <div className="mt-8 flex items-center gap-3">
            <a
                href="https://www.instagram.com/bhangrascape/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
                <div className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200">
                <Instagram className="w-5 h-5 text-indigo-600" />
                </div>
            </a>
            </div>
      </div>

      {/* RIGHT IMAGE SECTION */}
      <div className="flex-1 relative min-h-[60vh] md:min-h-auto">
        <Image
          src="/images/about.jpg"
          alt="BhangraEscape team performing"
          fill
          priority
          className="object-cover grayscale-[10%]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}