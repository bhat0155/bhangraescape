import Image from "next/image";
import ContactUsForm from "../components/ContactUs";

export const metadata = {
  title: "Contact Us — BhangraScape",
};

export default function ContactPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[40%_60%] min-h-[70vh] gap-0 px-4 md:px-12 py-8">
      {/* LEFT: Image with text on top */}
      <section className="relative h-[70vh] rounded-xl overflow-hidden">
        <Image
          src="/images/about3.jpeg"
          alt="Bhangra troupe performing"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
        />

        {/* Gradient top → bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

        {/* Text positioned near the top */}
        <div className="absolute top-10 md:top-16 left-0 w-full flex justify-center text-center px-6">
          <h1 className="text-4xl font-semibold text-white drop-shadow-md">
            We’d love to hear from you
          </h1>
        </div>
      </section>

      {/* RIGHT: Clean Contact Form */}
      <section className="flex items-center justify-center h-[70vh] rounded-xl bg-base-100">
        <div className="w-full max-w-2xl p-10">
          <ContactUsForm />
        </div>
      </section>
    </div>
  );
}