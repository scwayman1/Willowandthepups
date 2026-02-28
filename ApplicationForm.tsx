/*
 * DESIGN: California Atelier — West Coast Luxury Craft
 * ApplicationForm: Clean, elegant adoption application
 * Floating labels, warm styling, confirmation state
 * Now wired to tRPC backend for real submissions
 */
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ApplicationFormProps {
  preselectedPuppy?: string;
  onClose?: () => void;
}

export default function ApplicationForm({ preselectedPuppy = '' }: ApplicationFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    puppyId: preselectedPuppy,
    householdNotes: '',
  });

  // Fetch puppies from DB for the dropdown
  const { data: dbPuppies } = trpc.puppies.list.useQuery();

  // Update preselected puppy when prop changes
  useEffect(() => {
    if (preselectedPuppy) {
      setFormData(prev => ({ ...prev, puppyId: preselectedPuppy }));
    }
  }, [preselectedPuppy]);

  const submitMutation = trpc.application.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedPuppy = dbPuppies?.find(p => p.slug === formData.puppyId);

    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      puppyId: selectedPuppy?.id ?? null,
      puppyPreference: selectedPuppy?.name || 'Open to any',
      notes: formData.householdNotes || undefined,
    });
  };

  const selectedPuppyName = dbPuppies?.find(p => p.slug === formData.puppyId)?.name;

  if (submitted) {
    return (
      <div className="bg-[#FBF8F3] border border-[#3D2B1F]/8 rounded-sm p-8 sm:p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-[#8B9E82]/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-[#8B9E82]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-semibold text-[#3D2B1F] mb-3">
          Thank You, {formData.name}
        </h3>
        <p className="text-[#3D2B1F]/60 text-base font-light leading-relaxed max-w-md mx-auto mb-6">
          We've received your application{selectedPuppyName ? ` for ${selectedPuppyName}` : ''}. 
          We'll review it and reach out within a few days to discuss next steps. All adoptions are coordinated through the SPCA.
        </p>
        <div className="h-px bg-[#3D2B1F]/8 mb-6" />
        <div className="text-sm text-[#3D2B1F]/40">
          <p className="mb-1">What happens next:</p>
          <div className="space-y-1 text-[#3D2B1F]/50">
            <p>1. We review your application</p>
            <p>2. We'll reach out via email or phone</p>
            <p>3. Coordinate adoption through the SPCA</p>
            <p>4. Meet the puppies in Long Beach, CA</p>
          </div>
        </div>
        <button
          onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', puppyId: '', householdNotes: '' }); }}
          className="mt-8 text-sm text-[#8B9E82] font-medium hover:text-[#7A8E72] transition-colors"
        >
          Submit another application
        </button>
      </div>
    );
  }

  // Use DB puppies for the dropdown, fallback to empty
  const availablePuppies = dbPuppies?.filter(p => p.status === 'available') ?? [];

  return (
    <form onSubmit={handleSubmit} className="bg-[#FBF8F3] border border-[#3D2B1F]/8 rounded-sm p-6 sm:p-8 lg:p-10">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-2">
            Your Name <span className="text-[#8B4513]">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-transparent border border-[#3D2B1F]/12 rounded-sm text-[#3D2B1F] text-base placeholder:text-[#3D2B1F]/25 focus:outline-none focus:border-[#8B9E82] focus:ring-1 focus:ring-[#8B9E82]/20 transition-colors"
            placeholder="Full name"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-2">
              Email <span className="text-[#8B4513]">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-transparent border border-[#3D2B1F]/12 rounded-sm text-[#3D2B1F] text-base placeholder:text-[#3D2B1F]/25 focus:outline-none focus:border-[#8B9E82] focus:ring-1 focus:ring-[#8B9E82]/20 transition-colors"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-2">
              Phone <span className="text-[#8B4513]">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-transparent border border-[#3D2B1F]/12 rounded-sm text-[#3D2B1F] text-base placeholder:text-[#3D2B1F]/25 focus:outline-none focus:border-[#8B9E82] focus:ring-1 focus:ring-[#8B9E82]/20 transition-colors"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Puppy Selection */}
        <div>
          <label htmlFor="puppy" className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-2">
            Interested Puppy
          </label>
          <select
            id="puppy"
            value={formData.puppyId}
            onChange={(e) => setFormData(prev => ({ ...prev, puppyId: e.target.value }))}
            className="w-full px-4 py-3 bg-transparent border border-[#3D2B1F]/12 rounded-sm text-[#3D2B1F] text-base focus:outline-none focus:border-[#8B9E82] focus:ring-1 focus:ring-[#8B9E82]/20 transition-colors appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233D2B1F' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="">Not sure yet / Open to any</option>
            {availablePuppies.map(p => (
              <option key={p.slug} value={p.slug}>
                {p.name} — {p.sex === 'F' ? 'Female' : 'Male'}, {p.coat}
              </option>
            ))}
          </select>
        </div>

        {/* Household Notes */}
        <div>
          <label htmlFor="notes" className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#3D2B1F]/40 mb-2">
            Tell Us About Your Home
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.householdNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, householdNotes: e.target.value }))}
            className="w-full px-4 py-3 bg-transparent border border-[#3D2B1F]/12 rounded-sm text-[#3D2B1F] text-base placeholder:text-[#3D2B1F]/25 focus:outline-none focus:border-[#8B9E82] focus:ring-1 focus:ring-[#8B9E82]/20 transition-colors resize-none"
            placeholder="Do you have other pets? A yard? Kids? Tell us a little about your household..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full py-3.5 bg-[#3D2B1F] text-[#FBF8F3] text-sm font-semibold tracking-wide uppercase rounded-sm hover:bg-[#2C1F15] transition-colors disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </button>

        <p className="text-center text-xs text-[#3D2B1F]/30">
          All adoptions are coordinated through the SPCA. We'll never share your information.
        </p>
      </div>
    </form>
  );
}
