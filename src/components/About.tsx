import React from 'react';
import Image from 'next/image';

export const About: React.FC = () => {
  const team = [
    { name: 'Dr. Hilary Brown', role: 'President' },
    { name: 'Mary Rhone', role: 'Program Director' },
    { name: 'Javette Nixon', role: 'Head Coach' },
    { name: 'Coach Sedrill', role: 'Coaching Staff' },
  ];

  return (
    <section id="about" className="sec bg-deep text-white py-20 md:py-28 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-aqua-deep/10 rounded-full blur-3xl pointer-events-none" />

      <div className="wrap relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Camp Photo with Angular Fin Cut */}
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-aqua/30 card-cut shadow-2xl">
            <Image
              src="/images/about-swim.jpg"
              alt="Triple Fins Swim Athletes and Coaches"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep2/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="font-display font-bold uppercase tracking-wider text-xs bg-sun text-ink px-2.5 py-1">
                Russell&apos;s Paradise, Yallahs
              </span>
              <p className="font-display text-sm text-[#CFE6EC] mt-1">
                Empowering the next generation of Jamaican aquatic talent.
              </p>
            </div>
          </div>

          {/* Right: Story & Leadership */}
          <div>
            <p className="eyebrow text-aqua">Our Mission &amp; Community</p>
            <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-white mt-1">
              Building Water Confidence &amp; Athletic Character
            </h2>
            <div className="h-[3px] w-16 bg-sun mt-2"></div>

            <p className="text-[#CFE6EC] mt-4 text-base md:text-lg leading-relaxed">
              Triple Fins is a Point Global Marketing initiative dedicated to grassroots swimming excellence in St. Thomas. We provide safe, world-class coaching in stroke technique, competitive conditioning, and life-saving water safety skills.
            </p>

            <p className="text-[#9FBFC9] mt-3 text-sm md:text-base leading-relaxed">
              Whether learning water survival or training for regional meets, every swimmer is guided by high coaching ratios and positive reinforcement.
            </p>

            {/* Leadership Credits */}
            <div className="mt-8 pt-6 border-t border-aqua/20">
              <span className="font-display font-bold uppercase tracking-wider text-xs text-sun block mb-3">
                Program Leadership &amp; Coaching
              </span>
              <div className="grid grid-cols-2 gap-4">
                {team.map((m) => (
                  <div key={m.name} className="bg-white/5 border border-white/10 p-3 rounded-sm">
                    <div className="font-display font-bold text-base text-white">
                      {m.name}
                    </div>
                    <div className="text-xs text-aqua font-medium">
                      {m.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
