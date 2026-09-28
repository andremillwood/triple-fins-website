import Link from 'next/link';

export default function PaymentSuccess() {
  return <main className="min-h-screen bg-deep grid place-items-center p-5"><div className="bg-white p-8 md:p-12 max-w-xl card-cut text-center"><p className="eyebrow">Payment received</p><h1 className="font-extrabold uppercase text-4xl text-deep mt-3">Thank you</h1><p className="text-muted mt-5">Stripe has returned you safely to Triple Fins. We will confirm the payment against your registration or order by webhook and follow up by email.</p><Link href="/" className="btn btn-sun mt-7">Back to Triple Fins</Link></div></main>;
}
