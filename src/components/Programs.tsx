'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Programs: React.FC = () => {
  const chooseProgram = (program: 'sunday_swim'|'summer_camp'|'private_coaching') => {
    window.dispatchEvent(new CustomEvent('select-program', { detail: program }));
    fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_name: 'program_cta_clicked', metadata: { program } }) }).catch(() => {});
  };
  return (
    <section id="program" className="sec bg-foam py-20 md:py-28">
      <div className="wrap">
        {/* Section Header */}
        <div className="sec-head max-w-[640px] mb-12">
          <p className="eyebrow">Program Highlights</p>
          <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-deep mt-1">
            Training &amp; Development
          </h2>
          <div className="h-[3px] w-16 bg-aqua mt-2"></div>
          <p className="text-muted mt-3 text-base md:text-lg">
            Structured swim coaching designed for beginners finding their confidence, youth squad athletes, and adults refining stroke efficiency.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Sunday Swim */}
          <div className="bg-white border border-line overflow-hidden flex flex-col card-cut transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-deep to-aqua-deep overflow-hidden flex items-center justify-center">
              <span className="absolute top-3.5 left-0 bg-sun text-ink font-display font-bold uppercase tracking-wider text-xs px-3 py-1 z-10">
                Weekly Session
              </span>
              <div className="w-[45%] opacity-90 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/brand-assets/TF_Logo_Dark.png"
                  alt="Triple Fins Graphic"
                  width={220}
                  height={220}
                  className="w-full h-auto drop-shadow-md brightness-200 contrast-125"
                />
              </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-display font-semibold uppercase tracking-wider text-xs text-aqua-deep">
                  Every Sunday · Russell&apos;s Paradise
                </span>
                <h3 className="font-extrabold uppercase text-2xl md:text-3xl text-deep mt-1">
                  Sunday Swim Club
                </h3>
                <p className="text-muted text-sm md:text-base mt-3 leading-relaxed">
                  Open water and pool sessions focusing on stroke refinement, endurance sets, and breathing rhythms under direct coach supervision.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between">
                <span className="font-display font-bold text-deep text-lg">
                  Ages 4+ &amp; Adults
                </span>
                <Link href="#register" onClick={() => chooseProgram('sunday_swim')} className="btn btn-sm btn-deep">
                  Reserve Spot
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Summer Program */}
          <div className="bg-white border border-line overflow-hidden flex flex-col card-cut transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-deep to-aqua-deep overflow-hidden">
              <span className="absolute top-3.5 left-0 bg-sun text-ink font-display font-bold uppercase tracking-wider text-xs px-3 py-1 z-10">
                Annual Camp
              </span>
              <Image
                src="/images/summer-program.jpg"
                alt="Summer Swim Camp Youth Athletes"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-display font-semibold uppercase tracking-wider text-xs text-aqua-deep">
                  Seasonal Intensive · Multi-Week
                </span>
                <h3 className="font-extrabold uppercase text-2xl md:text-3xl text-deep mt-1">
                  Summer Swim Intensive
                </h3>
                <p className="text-muted text-sm md:text-base mt-3 leading-relaxed">
                  High-energy swim camps combining rigorous water safety, timed time trials, dryland fitness, and team camaraderie in St. Thomas.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between">
                <span className="font-display font-bold text-deep text-lg">
                  July – August Cohorts
                </span>
                <Link href="#register" onClick={() => chooseProgram('summer_camp')} className="btn btn-sm btn-sun">
                  Register For Camp
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 bg-deep text-white p-6 md:p-8 card-cut flex flex-col md:flex-row gap-5 justify-between md:items-center">
            <div><p className="eyebrow text-aqua">One-to-one coaching</p><h3 className="font-extrabold uppercase text-2xl md:text-3xl">Private Coaching</h3><p className="text-foam/80 mt-2">Focused sessions built around confidence, technique, or performance goals.</p></div>
            <Link href="#register" onClick={() => chooseProgram('private_coaching')} className="btn btn-sun shrink-0">Register Interest</Link>
          </div>
        </div>
      </div>
    </section>
  );
};
