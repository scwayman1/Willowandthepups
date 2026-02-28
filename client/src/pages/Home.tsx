/*
 * DESIGN: California Atelier — West Coast Luxury Craft
 * Home: Hero section, puppy grid, application form, about section
 * Photography-forward, warm neutral palette, Playfair Display headings
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import PuppyCard from '@/components/PuppyCard';
import PuppyProfile from './PuppyProfile';
import ApplicationForm from './ApplicationForm';
import type { PuppyWithDetails } from '@shared/puppyTypes';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

function getVisitorId(): string {
  let id = localStorage.getItem('willow-visitor-id');
  if (!id) {
    id = nanoid();
    localStorage.setItem('willow-visitor-id', id);
  }
  return id;
}

export default function Home() {
  const [selectedPuppy, setSelectedPuppy] = useState<PuppyWithDetails | null>(null);
  const [preselectedPuppy, setPreselectedPuppy] = useState('');
  const applicationRef = useRef<HTMLDivElement>(null);
  const visitorId = useRef(getVisitorId()).current;

  // Fetch puppies from DB
  const { data: puppies, isLoading } = trpc.puppies.list.useQuery();

  // Fetch heart counts
  const { data: heartData } = trpc.hearts.status.useQuery(
    { visitorId },
    { refetchInterval: 30000 }
  );

  const toggleHeartMutation = trpc.hearts.toggle.useMutation({
    onSuccess: () => {
      // Refetch heart data
      utils.hearts.status.invalidate();
    },
  });

  const utils = trpc.useUtils();

  const handleToggleHeart = (puppyId: number) => {
    toggleHeartMutation.mutate({ puppyId, visitorId });
  };

  const handleInterested = (puppySlug: string) => {
    setSelectedPuppy(null);
    setPreselectedPuppy(puppySlug);
    setTimeout(() => {
      applicationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Willow & The Long Beach Litter',
      text: 'Check out these adorable Doberman mix puppies looking for forever homes!',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FBF8F3]/95 backdrop-blur-sm border-b border-[#3D2B1F]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-['Playfair_Display'] text-lg sm:text-xl font-semibold text-[#3D2B1F] tracking-tight">
            Willow & The Pups
          </a>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="text-[#3D2B1F]/50 hover:text-[#3D2B1F] transition-colors"
              aria-label="Share"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
            <a
              href="#apply"
              className="text-sm font-semibold tracking-wide uppercase text-[#8B9E82] hover:text-[#7A8E72] transition-colors"
            >
              Apply to Adopt
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8B9E82] mb-4">
              Long Beach, California
            </p>
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#3D2B1F] leading-[1.1] mb-6">
              Willow & The<br />Long Beach Litter
            </h1>
            <p className="text-lg sm:text-xl text-[#3D2B1F]/60 font-light leading-relaxed max-w-xl mb-4">
              Six beautiful Doberman mix puppies born to our beloved Willow.
              Each one unique, each one looking for their forever family.
            </p>
            <p className="text-sm text-[#3D2B1F]/40 font-light italic mb-8">
              Mom is a purebred Doberman — dad remains a charming mystery.
              All adoptions coordinated through the SPCA.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#puppies"
                className="px-8 py-3 bg-[#3D2B1F] text-[#FBF8F3] text-sm font-semibold tracking-wide uppercase rounded-sm hover:bg-[#2C1F15] transition-colors"
              >
                Meet the Puppies
              </a>
              <a
                href="#apply"
                className="px-8 py-3 border border-[#3D2B1F]/20 text-[#3D2B1F] text-sm font-semibold tracking-wide uppercase rounded-sm hover:bg-[#3D2B1F]/5 transition-colors"
              >
                Apply to Adopt
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Puppy Grid */}
      <section id="puppies" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-semibold text-[#3D2B1F] mb-3">
              The Litter
            </h2>
            <div className="h-px bg-[#3D2B1F]/8 w-20" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#E9E1D4]/30 rounded-sm animate-pulse">
                  <div className="aspect-square bg-[#E9E1D4]/50" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-[#E9E1D4]/50 rounded w-1/3" />
                    <div className="h-4 bg-[#E9E1D4]/50 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {puppies?.map((puppy) => {
                const heartCount = heartData?.counts?.[puppy.id] ?? 0;
                const isHearted = heartData?.visitorHearts?.includes(puppy.id) ?? false;

                return (
                  <motion.div
                    key={puppy.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <PuppyCard
                      puppy={puppy as PuppyWithDetails}
                      onClick={() => setSelectedPuppy(puppy as PuppyWithDetails)}
                      heartCount={heartCount}
                      isHearted={isHearted}
                      onToggleHeart={handleToggleHeart}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-[#E9E1D4]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-semibold text-[#3D2B1F] mb-6">
              About Willow
            </h2>
            <p className="text-[#3D2B1F]/60 text-base leading-relaxed font-light mb-4">
              Willow is a beautiful purebred Doberman and a devoted mom to her six puppies,
              born February 21-22, 2026 in Long Beach, California. She's been an incredible
              mother from the very first moment, keeping all her pups warm, fed, and safe.
            </p>
            <p className="text-[#3D2B1F]/60 text-base leading-relaxed font-light mb-4">
              As for dad — well, he's a bit of a mystery! We know he was charming enough to win
              Willow's heart, and based on the gorgeous variety in the litter's coats, he clearly
              had great genes. The puppies' mix of colors — from deep black with rust markings
              to warm red and distinctive white patches — tells a story all its own.
            </p>
            <p className="text-sm text-[#3D2B1F]/40 italic">
              All adoptions are coordinated through the SPCA to ensure the best match for
              each puppy and family.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 sm:py-20" ref={applicationRef}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-semibold text-[#3D2B1F] mb-3">
              Adoption Application
            </h2>
            <p className="text-[#3D2B1F]/50 text-base font-light">
              Interested in giving one of our pups a loving home? Fill out the form below.
            </p>
          </div>
          <ApplicationForm preselectedPuppy={preselectedPuppy} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3D2B1F]/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#3D2B1F]/40">
            Willow & The Long Beach Litter &middot; Long Beach, CA
          </p>
          <button
            onClick={handleShare}
            className="text-sm text-[#8B9E82] font-medium hover:text-[#7A8E72] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>
        </div>
      </footer>

      {/* Puppy Profile Modal */}
      <AnimatePresence>
        {selectedPuppy && (
          <PuppyProfile
            puppy={selectedPuppy}
            onClose={() => setSelectedPuppy(null)}
            onInterested={handleInterested}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
