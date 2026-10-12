import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export function Hero() {
  return <section id="top" className="campaign-hero" aria-labelledby="campaign-title">
    <div className="campaign-copy"><p className="eyebrow">Triple Fins / Team Jamaica collection</p><h1 id="campaign-title">Out of the pool.<br /><span>Still in your element.</span></h1><p>Big team energy. Unmistakable island spirit. Meet the colours you carry from training days to everyday.</p><div className="flex flex-wrap gap-3 mt-8"><Link className="btn btn-sun" href="/shop">Explore the collection <ArrowUpRight size={19} aria-hidden="true" /></Link><Link className="campaign-secondary" href="/#program">Find your swim programme →</Link></div><div className="campaign-footnote"><span className="campaign-mark">TF / JAMAICA</span><span>Swim strong. Play hard.<br />Build champions.</span></div></div>
    <Link href="/shop?search=hummingbird" className="campaign-art" aria-label="Explore the Hummingbird team tee collection"><span className="campaign-art-word" aria-hidden="true">REPRESENT.</span><div className="campaign-shirt"><Image src="/images/products/hummingbird-yellow-1.webp" alt="Yellow Team Jamaica Hummingbird tee with green details" fill sizes="(max-width:768px) 100vw,55vw" priority className="object-contain" /></div><span className="campaign-art-label"><span>THE HUMMINGBIRD EDIT</span><ArrowUpRight size={25} aria-hidden="true" /></span><span className="campaign-preview">Collection preview · provisional prices</span></Link>
  </section>;
}
