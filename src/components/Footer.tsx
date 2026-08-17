import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep2 text-white border-t border-aqua/20 pt-16 pb-12">
      <div className="wrap">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/10">
          <Link href="#top" className="flex items-center">
            <Image
              src="/brand-assets/TF_Wordmark_C.png"
              alt="Triple Fins Wordmark"
              width={200}
              height={36}
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="#program"
              className="font-display font-semibold uppercase tracking-wider text-sm text-[#CFE6EC] hover:text-aqua transition-colors"
            >
              Programs
            </Link>
            <Link
              href="#shop"
              className="font-display font-semibold uppercase tracking-wider text-sm text-[#CFE6EC] hover:text-aqua transition-colors"
            >
              Store
            </Link>
            <Link
              href="#about"
              className="font-display font-semibold uppercase tracking-wider text-sm text-[#CFE6EC] hover:text-aqua transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="font-display font-semibold uppercase tracking-wider text-sm text-[#CFE6EC] hover:text-aqua transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9FBFC9] text-center md:text-left">
          <p>
            &copy; {currentYear} Triple Fins Swim Program. A Point Global Marketing initiative.
          </p>
          <p className="font-display uppercase tracking-widest text-sun font-bold">
            Swim Strong · Play Hard · Build Champions
          </p>
        </div>
      </div>
    </footer>
  );
};
