import store1 from "@/assets/images/store-images/store-1.webp";
import store2 from "@/assets/images/store-images/store-2.webp";

function SalonCard({ image, city, address, phone, hours }) {
  return (
    <article className="w-full object-cover h-[360px] md:h-[380px] lg:h-[360px] lg:min-w-[380px]">
      <div className="relative">
        <img
          src={image}
          alt={`${city} salon`}
          className="w-full object-cover h-[360px] md:h-[380px] lg:h-[360px]"
        />

        {/* Dark bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-black/55 md:bg-black/60 lg:h-[44%] lg:bg-black/70" />

        <div className="absolute inset-x-0 bottom-[52%] h-[28%] bg-gradient-to-t from-black/35 to-transparent md:from-black/30 lg:bottom-[44%] lg:h-[18%] lg:from-black/30" />

        {/* Content */}
        <div className="absolute inset-0 p-5 text-white flex flex-col justify-end font-ui">
          {/* mobile/tablet stacked */}
          <div className="lg:hidden">
            <h3 className="font-display mb-2 text-[30px] leading-[1.05] tracking-[-0.02em] md:text-[32px]">
              {city}
            </h3>

            <p className="mb-3 text-[13px] text-white/85 md:text-[14px]">
              {address}
            </p>

            <div className="mt-5 space-y-2 text-[13px] text-white/85 md:text-[14px]">
              <p>{phone}</p>
              <p>{hours}</p>
            </div>
          </div>

          {/* desktop split left/right */}
          <div className="hidden lg:flex lg:items-end lg:justify-between lg:gap-6 lg:mb-2">
            <div>
              <h3 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">
                {city}
              </h3>
              <p className="mt-2 text-[14px] text-white/85">{address}</p>
            </div>

            <div className="text-right text-[14px] text-white/85 space-y-2 min-w-[170px]">
              <p className="whitespace-nowrap">{phone}</p>
              <p className="whitespace-nowrap">{hours}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function OurSalons() {
  return (
    <section className="px-1 py-8">
      {/* Desktop: title left, cards right */}
      <div className="lg:flex lg:items-start lg:gap-0">
        {/* LEFT SIDE TITLE */}
        <div className="lg:w-[320px] shrink-0">
          <h2 className="font-display text-[44px] leading-[1.05] tracking-[-0.02em] text-black">
            Our salons
          </h2>
        </div>

        {/* RIGHT SIDE CARDS */}
        <div
          className="mt-6 grid gap-6 md:grid-cols-2 font-ui 
                        lg:mt-0 lg:flex lg:gap-8"
        >
          <SalonCard
            image={store1}
            city="Vilnius, Lithuania"
            address="Kauno str. 24"
            phone="+370 689 76546"
            hours="I–VII — 10:00–20:00"
          />

          <SalonCard
            image={store2}
            city="Kaunas, Lithuania"
            address="Žemaičių str. 24"
            phone="+370 612 33445"
            hours="I–VII — 10:00–20:00"
          />
        </div>
      </div>
    </section>
  );
}
