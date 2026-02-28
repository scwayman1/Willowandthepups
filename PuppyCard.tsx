/*
 * DESIGN: California Atelier — West Coast Luxury Craft
 * PuppyCard: Elegant card with photo, name, key stats, status badge, heart button
 * Thin 1px borders, generous padding, subtle hover scale
 * Now powered by DB data via tRPC
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PuppyWithDetails } from '@shared/puppyTypes';

interface PuppyCardProps {
  puppy: PuppyWithDetails;
  onClick: () => void;
  heartCount: number;
  isHearted: boolean;
  onToggleHeart: (puppyId: number) => void;
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

function formatBirthDate(bornAt: Date | string | null): string {
  if (!bornAt) return '';
  const born = typeof bornAt === 'string' ? new Date(bornAt) : bornAt;
  return born.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function useLiveAge(bornAt: Date | string | null): string {
  const [age, setAge] = useState(() => formatPreciseAge(bornAt));
  useEffect(() => {
    setAge(formatPreciseAge(bornAt));
    const interval = setInterval(() => {
      setAge(formatPreciseAge(bornAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [bornAt]);
  return age;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-[#8B9E82]/10 text-[#8B9E82] border-[#8B9E82]/20',
    reserved: 'bg-amber-50 text-amber-700 border-amber-200',
    adopted: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider uppercase border rounded-sm ${styles[status] || styles.available}`}>
      {status}
    </span>
  );
}

export default function PuppyCard({ puppy, onClick, heartCount, isHearted, onToggleHeart }: PuppyCardProps) {
  const photo = puppy.photos[0];
  const liveAge = useLiveAge(puppy.bornAt);
  const birthDate = formatBirthDate(puppy.bornAt);

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleHeart(puppy.id);
  };

  return (
    <div className="group w-full text-left bg-[#FBF8F3] border border-[#3D2B1F]/8 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#3D2B1F]/8 hover:-translate-y-1">
      {/* Photo with heart overlay */}
      <div className="relative">
        <button
          onClick={onClick}
          className="w-full aspect-square overflow-hidden bg-[#E9E1D4] focus:outline-none"
        >
          {photo ? (
            <img
              src={photo.url}
              alt={`${puppy.name} — ${puppy.coat}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#3D2B1F]/20">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          )}
        </button>

        {/* Heart button overlay */}
        <button
          onClick={handleHeart}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
          aria-label={isHearted ? `Unlike ${puppy.name}` : `Like ${puppy.name}`}
        >
          <AnimatePresence mode="wait">
            <motion.svg
              key={isHearted ? 'filled' : 'outline'}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className={`w-4 h-4 ${isHearted ? 'text-rose-500' : 'text-[#3D2B1F]/40'}`}
              viewBox="0 0 24 24"
              fill={isHearted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={isHearted ? 0 : 1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </motion.svg>
          </AnimatePresence>
          <span className={`text-xs font-semibold tabular-nums ${isHearted ? 'text-rose-500' : 'text-[#3D2B1F]/50'}`}>
            {heartCount}
          </span>
        </button>
      </div>

      {/* Info */}
      <button
        onClick={onClick}
        className="w-full text-left p-5 sm:p-6 focus:outline-none"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-semibold text-[#3D2B1F]">
              {puppy.name}
            </h3>
            {puppy.nickname && (
              <p className="text-xs text-[#3D2B1F]/40 italic mt-0.5">{puppy.nickname}</p>
            )}
          </div>
          <StatusBadge status={puppy.status} />
        </div>

        {/* Precise age + birth date */}
        <div className="mb-3 bg-[#E9E1D4]/30 rounded-sm px-3 py-2">
          <p className="text-sm font-medium text-[#3D2B1F]/80">{liveAge}</p>
          {birthDate && (
            <p className="text-xs text-[#3D2B1F]/40 mt-0.5">Born {birthDate}</p>
          )}
        </div>

        <div className="h-px bg-[#3D2B1F]/8 mb-3" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[#3D2B1F]/40 text-xs tracking-wider uppercase mb-0.5">Sex</p>
            <p className="text-[#3D2B1F]/80 font-medium">{puppy.sex === 'F' ? 'Female' : 'Male'}</p>
          </div>
          <div>
            <p className="text-[#3D2B1F]/40 text-xs tracking-wider uppercase mb-0.5">Coat</p>
            <p className="text-[#3D2B1F]/80 font-medium">{puppy.coat}</p>
          </div>
          <div>
            <p className="text-[#3D2B1F]/40 text-xs tracking-wider uppercase mb-0.5">Birth</p>
            <p className="text-[#3D2B1F]/80 font-medium font-mono text-xs">{formatWeight(puppy.birthWeightGrams)}</p>
          </div>
          <div>
            <p className="text-[#3D2B1F]/40 text-xs tracking-wider uppercase mb-0.5">Current</p>
            <p className="text-[#3D2B1F]/80 font-medium font-mono text-xs">{formatWeight(puppy.currentWeightGrams)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#8B9E82] font-medium tracking-wider uppercase group-hover:text-[#7A8E72] transition-colors">
            View Profile
          </span>
          <svg className="w-4 h-4 text-[#8B9E82] transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </button>
    </div>
  );
}
