import { notFound } from 'next/navigation';
import { HeroStudy } from '@/components/intro-review/HeroStudy';

export default async function Page({ searchParams }: {
  searchParams: Promise<{ intro?: string; t?: string }>;
}) {
  const query = await searchParams;
  if (query.intro !== 'hero') notFound();
  const time = Number(query.t ?? 8.75);
  return <HeroStudy time={Number.isFinite(time) ? Math.max(7.5, Math.min(9.5, time)) : 8.75} />;
}
