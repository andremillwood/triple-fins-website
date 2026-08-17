import React from 'react';

export const Pillars: React.FC = () => {
  const pillars = [
    {
      num: '01',
      title: 'Technique',
      desc: 'Precision stroke mechanics, breath control, and efficiency from learn-to-swim through to national competition.',
    },
    {
      num: '02',
      title: 'Endurance',
      desc: 'Progressive conditioning and stamina built through structured intervals and race-pace pacing.',
    },
    {
      num: '03',
      title: 'Discipline',
      desc: 'Punctuality, sportsmanship, and mental fortitude that shape athletes both in and out of the water.',
    },
  ];

  return (
    <div className="pillars relative mt-11 grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-[760px]">
      {pillars.map((p) => (
        <div
          key={p.num}
          className="bg-white/[0.04] border border-aqua/20 p-4 pb-4.5 corner-cut transition-transform hover:-translate-y-1"
        >
          <div className="font-display font-extrabold text-aqua text-2xl leading-none">
            {p.num}
          </div>
          <div className="font-display font-bold uppercase tracking-wider text-base text-white mt-1">
            {p.title}
          </div>
          <div className="text-xs text-[#9FBFC9] mt-1 leading-snug">
            {p.desc}
          </div>
        </div>
      ))}
    </div>
  );
};
