'use client';
import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({ name, images, large = false }: { name: string; images: string[]; large?: boolean }) {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  return <div>
    <div className={'relative bg-foam ' + (large ? 'aspect-[4/5]' : 'aspect-square')}>
      {images[index] && <Image src={images[index]} alt={name + ' — view ' + (index + 1)} fill sizes={large ? '(max-width:768px) 100vw,50vw' : '(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw'} className="object-contain p-3" unoptimized={!images[index].startsWith('/')} />}
    </div>
    {images.length > 1 && <div className="flex flex-wrap gap-2 p-3" aria-label={name + ' image views'}>{images.map((src, i) => <button key={src + i} type="button" onClick={() => setSelected(i)} aria-label={'View ' + (i + 1) + ' of ' + name} aria-pressed={index === i} className={'relative w-14 h-14 border-2 ' + (index === i ? 'border-aqua-deep' : 'border-line')}><Image src={src} alt="" fill sizes="56px" className="object-contain" unoptimized={!src.startsWith('/')} /></button>)}</div>}
  </div>;
}
