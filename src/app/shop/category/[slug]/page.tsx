import { StoreShell } from '@/components/StoreShell';
import { Shop } from '@/components/Shop';
export default function CategoryPage({ params }: { params: { slug: string } }) { return <StoreShell><Shop category={params.slug} /></StoreShell>; }
