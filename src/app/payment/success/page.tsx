import Link from 'next/link';

export default function PaymentSuccess() {
  return <main className="min-h-screen bg-deep grid place-items-center p-5"><div className="bg-white p-8 md:p-12 max-w-xl card-cut text-center"><p className="eyebrow">Checkout returned</p><h1 className="font-extrabold uppercase text-4xl text-deep mt-3">Thank you</h1><p className="text-muted mt-5">You have returned to Triple Fins. This page alone does not confirm payment. Stripe confirmation is checked securely by the server; contact the team with your registration reference if you need to verify its status.</p><Link href="/" className="btn btn-sun mt-7">Back to Triple Fins</Link></div></main>;
}
