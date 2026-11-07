import type { Metadata } from 'next';
import { WhatsNew } from '@/components/shell/WhatsNew';

export const metadata: Metadata = { title: 'Berriak: zer dago berri — EnbrioAtlas', description: 'EnbrioAtlas-en aldaketak eta hobekuntzak: gai berriak, ezaugarri berriak eta diseinua.' };

export default function BerriakPage() {
  return <WhatsNew />;
}
