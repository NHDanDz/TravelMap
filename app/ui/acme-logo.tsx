import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div className={`${lusitana.className} flex items-center justify-center gap-1`}>
      <GlobeAltIcon className="h-8 w-8 text-white/80 rotate-12" />
      <p className="text-lg font-semibold text-white/90">
        Traveler Sense
      </p>
    </div>
  );
}