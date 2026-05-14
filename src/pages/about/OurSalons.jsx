import { motion } from "framer-motion";
import useLanguage from "@/context/useLanguage";

import store1 from "@/assets/images/store-images/store-1.webp";
import store2 from "@/assets/images/store-images/store-2.webp";

function SalonCard({ image, city, address, phone, hours, index }) {
  const { t } = useLanguage();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className="group relative w-full overflow-hidden cursor-pointer h-[400px] md:h-[420px] lg:flex-1"
    >
      {/* Image with hover zoom */}
      <motion.img
        src={image}
        alt={`${city} ${t.salon}`}
        transition={{ duration: 0.6 }}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-end lg:justify-between lg:space-y-0">
          <div className="space-y-1">
            <h3 className="font-display text-3xl leading-tight tracking-tight md:text-4xl">
              {city}
            </h3>
            <p className="font-ui text-sm opacity-80 md:text-base">{address}</p>
          </div>

          <div className="font-ui text-sm space-y-1 opacity-80 lg:text-right lg:min-w-[180px]">
            <p className="whitespace-nowrap">{phone}</p>
            <p className="whitespace-nowrap">{hours}</p>
          </div>
        </div>

        {/* underline effect on hover */}
        <motion.div className="mt-4 h-px w-0 bg-white/40 transition-all duration-500 group-hover:w-full" />
      </div>
    </motion.article>
  );
}

export default function OurSalons() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 lg:py-10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
        {/* Title side */}
        <div className="mb-10 lg:mb-0 lg:w-[300px] lg:shrink-0">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl leading-[1.1] tracking-tight text-black md:text-5xl lg:text-6xl"
          >
            {t.ourSalons || "Our Salons"}
          </motion.h2>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "60px" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-6 h-px bg-black hidden lg:block"
          />
        </div>

        {/* Cards side */}
        <div className="grid w-full gap-8 md:grid-cols-2 lg:flex lg:gap-10">
          <SalonCard
            index={0}
            image={store1}
            city="Vilnius, Lithuania"
            address="Kauno str. 24"
            phone="+370 689 76546"
            hours={t.workingHours || "Mon-Fri: 10:00 - 19:00"}
          />

          <SalonCard
            index={1}
            image={store2}
            city="Kaunas, Lithuania"
            address="Žemaičių str. 24"
            phone="+370 612 33445"
            hours={t.workingHours || "Mon-Fri: 10:00 - 19:00"}
          />
        </div>
      </div>
    </section>
  );
}
