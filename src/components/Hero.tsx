import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pillars } from './Pillars';

export const Hero: React.FC = () => {
  return (
    <header
      id="top"
      className="hero relative bg-gradient-to-br from-deep via-[#092B48] to-deep2 text-[#EAF6F8] overflow-hidden pt-16 pb-28 md:pt-20 md:pb-36"
    >
      {/* Background Gradients & Shimmer */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[repeating-linear-gradient(115deg,transparent_0_46px,rgba(21,210,219,0.05)_46px_47px)] [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
      <div className="shimmer absolute -inset-x-[10%] -top-[40%] h-[70%] pointer-events-none opacity-55 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(21,210,219,0.25),transparent_70%)] animate-drift" />

      <div className="wrap relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 items-center">
          {/* Left Column */}
          <div>
            <div className="mb-4">
              <Image
                src="/brand-assets/TF_Logo_light.png"
                alt="Triple Fins Icon"
                width={118}
                height={118}
                className="w-[90px] md:w-[118px] h-auto drop-shadow-[0_10px_26px_rgba(21,210,219,0.35)]"
                priority
              />
            </div>

            <p className="eyebrow text-aqua tracking-[0.22em] font-semibold text-sm">
              Point Global Marketing Initiative
            </p>

            <h1 className="font-extrabold text-[clamp(2.8rem,7.5vw,5.8rem)] uppercase my-2 leading-[0.95] tracking-tight">
              <span className="text-white">Swim Strong. </span>
              <span className="text-aqua">Play Hard. </span>
              <span className="text-sun block md:inline">Build Champions.</span>
            </h1>

            <p className="text-[#B9D6DE] text-lg md:text-xl max-w-[42ch] my-5 leading-relaxed">
              St. Thomas&apos;s premier swimming program. Developing stroke technique, competitive endurance, and athletic character at Russell&apos;s Paradise, Yallahs.
            </p>

            <div className="flex flex-wrap gap-3.5 mt-6">
              <Link href="#program" className="btn btn-sun">
                Explore Programs
              </Link>
              <Link href="#contact" className="btn btn-ghost">
                Register Now
              </Link>
            </div>

            {/* Core Pillars */}
            <Pillars />
          </div>

          {/* Right Column - Fin Geometry Badge */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="hero-badge relative w-full max-w-[280px] aspect-square flex items-center justify-center bg-gradient-to-br from-aqua/20 to-aqua-deep/10 border border-aqua/30 fin-clip p-8 shadow-2xl">
              <Image
                src="/brand-assets/TF_Logo_light.png"
                alt="Triple Fins Fin"
                width={200}
                height={200}
                className="w-3/5 h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Angular Bottom Wave Divider */}
      <svg
        className="absolute left-0 right-0 -bottom-1 w-full h-[60px] md:h-[75px] block pointer-events-none text-foam fill-current"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path d="M0,0 C300,90 900,20 1200,80 L1200,120 L0,120 Z" />
      </svg>
    </header>
  );
};
