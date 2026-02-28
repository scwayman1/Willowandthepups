/*
 * DESIGN: California Atelier — West Coast Luxury Craft
 * PuppyProfile: Full-screen modal with split layout
 * Left: Time-lapse photo gallery (newest first, filmstrip thumbnails)
 * Right: Quick facts, weight chart, personality notes, CTA
 * Now powered by DB data via tRPC
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PuppyWithDetails, PuppyPhoto, WeightLog } from '@shared/puppyTypes';

interface PuppyProfileProps {
  puppy: PuppyWithDetails;
  onClose: () => void;
  onInterested: (puppySlug: string) => void;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams}g`;
}

function formatPreciseAge(bornAt: Date | string | null): string {
  if (!bornAt) return 'Age unknown';
  const born = typeof bornAt === 'string' ? new Date(bornAt) : bornAt;
  const now = new Date();
  const diffMs = now.getTime() - born.getTime();
  if (diffMs < 0) return 'Not yet born';
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    return remDays > 0 ? `${weeks} week${weeks !== 1 ? 's' : ''}, ${remDays} day${remDays !== 1 ? 's' : ''} old` : `${weeks} week${weeks !== 1 ? 's' : ''} old`;
  }
  if (days === 0) return `${hours} hour${hours !== 1 ? 's' : ''} old`;
  if (hours === 0) return `${days} day${days !== 1 ? 's' : ''} old`;
  return `${days} day${days !== 1 ? 's' : ''}, ${hours} hr${hours !== 1 ? 's' : ''} old`;
}

function formatBirthDateTime(bornAt: Date | string | null): string {
  if (!bornAt) return '';
  const born = typeof bornAt === 'string' ? new Date(bornAt) : bornAt;
  return born.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function WeightChart({ weightLogs }: { weightLogs: WeightLog[] }) {
  // Sort ascending by measuredAt
  const sorted = [...weightLogs].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-[#3D2B1F]/30 text-sm">
        No weight data yet
      </div>
    );
  }

  const maxWeight = Math.max(...sorted.map(w => w.weightGrams));
  const minWeight = Math.min(...sorted.map(w => w.weightGrams));
  const range = maxWeight - minWeight || 1;

  return (
    <div className="relative">
      <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
        {sorted.map((entry, i) => {
          const height = ((entry.weightGrams - minWeight) / range) * 70 + 30;
          const date = new Date(entry.measuredAt);
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-[#3D2B1F]/50">
                {entry.weightGrams}g
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full max-w-[60px] bg-gradient-to-t from-[#8B9E82] to-[#8B9E82]/40 rounded-t-sm"
              />
              <span className="text-[10px] text-[#3D2B1F]/40">{label}</span>
            </div>
          );
        })}
      </div>
      {sorted.length < 3 && (
        <p className="text-center text-xs text-[#3D2B1F]/30 mt-3 italic">
          More data points coming as the puppies grow
        </p>
      )}
    </div>
  );
}

export default function PuppyProfile({ puppy, onClose, onInterested }: PuppyProfileProps) {
  // Photos are already sorted newest-first from backend
  const photos = puppy.photos;
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const activePhoto = photos[activePhotoIndex];

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && activePhotoIndex > 0) setActivePhotoIndex(i => i - 1);
      if (e.key === 'ArrowRight' && activePhotoIndex < photos.length - 1) setActivePhotoIndex(i => i + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activePhotoIndex, photos.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative bg-[#FBF8F3] w-full max-w-5xl max-h-[90vh] rounded-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-[#FBF8F3]/90 backdrop-blur-sm rounded-full text-[#3D2B1F]/60 hover:text-[#3D2B1F] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-hidden">
          {/* Left: Photo Gallery */}
          <div className="lg:w-[55%] bg-[#E9E1D4] relative flex flex-col shrink-0">
            {/* Main photo */}
            <div className="relative aspect-[4/3] sm:aspect-square lg:aspect-auto lg:flex-1">
              <AnimatePresence mode="wait">
                {activePhoto && (
                  <motion.img
                    key={activePhoto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={activePhoto.url}
                    alt={`${puppy.name} — ${activePhoto.caption || ''}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>
              
              {/* Photo date overlay */}
              {activePhoto && (
                <div className="absolute bottom-3 left-3 bg-[#3D2B1F]/70 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                  <p className="text-xs text-[#FBF8F3]/90 font-mono">
                    {new Date(activePhoto.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Photo counter */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-[#3D2B1F]/70 backdrop-blur-sm px-2.5 py-1 rounded-sm">
                  <p className="text-xs text-[#FBF8F3]/90 font-mono">
                    {activePhotoIndex + 1} / {photos.length}
                  </p>
                </div>
              )}

              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  {activePhotoIndex > 0 && (
                    <button
                      onClick={() => setActivePhotoIndex(i => i - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#FBF8F3]/80 backdrop-blur-sm rounded-full text-[#3D2B1F]/60 hover:text-[#3D2B1F] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                  )}
                  {activePhotoIndex < photos.length - 1 && (
                    <button
                      onClick={() => setActivePhotoIndex(i => i + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#FBF8F3]/80 backdrop-blur-sm rounded-full text-[#3D2B1F]/60 hover:text-[#3D2B1F] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Filmstrip thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-1.5 p-3 bg-[#3D2B1F]/5 overflow-x-auto">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-sm overflow-hidden border-2 transition-all ${
                      i === activePhotoIndex
                        ? 'border-[#8B9E82] opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                <div className="flex-shrink-0 w-14 h-14 rounded-sm border-2 border-dashed border-[#3D2B1F]/15 flex items-center justify-center" title="More photos coming soon">
                  <svg className="w-4 h-4 text-[#3D2B1F]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              </div>
            )}

            {/* Single photo hint */}
            {photos.length <= 1 && (
              <div className="p-3 bg-[#3D2B1F]/5 text-center">
                <p className="text-xs text-[#3D2B1F]/30 italic">
                  More photos coming soon — check back for growth updates
                </p>
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="lg:w-[45%] lg:overflow-y-auto p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-semibold text-[#3D2B1F]">
                  {puppy.name}
                </h2>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider uppercase border rounded-sm ${
                  puppy.status === 'available' ? 'bg-[#8B9E82]/10 text-[#8B9E82] border-[#8B9E82]/20' :
                  puppy.status === 'reserved' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {puppy.status}
                </span>
              </div>
              {puppy.nickname && (
                <p className="text-sm text-[#3D2B1F]/40 italic">&ldquo;{puppy.nickname}&rdquo;</p>
              )}
              <p className="text-sm text-[#3D2B1F]/50 mt-1">#{puppy.birthOrder} of 6 &middot; {formatPreciseAge(puppy.bornAt)}</p>
              {puppy.bornAt && (
                <p className="text-xs text-[#3D2B1F]/40 mt-0.5">Born {formatBirthDateTime(puppy.bornAt)}</p>
              )}
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: 'Sex', value: puppy.sex === 'F' ? 'Female' : 'Male' },
                { label: 'Coat', value: puppy.coat },
                { label: 'Birth Weight', value: formatWeight(puppy.birthWeightGrams) },
                { label: 'Current Weight', value: formatWeight(puppy.currentWeightGrams) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#E9E1D4]/30 rounded-sm p-3">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-1">{label}</p>
                  <p className="text-sm font-medium text-[#3D2B1F]">{value}</p>
                </div>
              ))}
            </div>

            {/* Weight Progress */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-4">
                Weight Progress
              </h3>
              <WeightChart weightLogs={puppy.weightLogs} />
            </div>

            <div className="h-px bg-[#3D2B1F]/8 mb-6" />

            {/* Personality Notes */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-3">
                About {puppy.name}
              </h3>
              <p className="text-[#3D2B1F]/70 text-sm leading-relaxed font-light">
                {puppy.notes}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => onInterested(puppy.slug)}
              className="w-full py-3.5 bg-[#8B9E82] text-white text-sm font-semibold tracking-wide uppercase rounded-sm hover:bg-[#7A8E72] transition-colors"
            >
              I'm Interested in {puppy.name}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
