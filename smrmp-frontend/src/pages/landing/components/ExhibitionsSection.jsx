import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon,
  TicketIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { usePublicExhibitions } from '../../../hooks/useExhibitions';
import { INITIAL_EXHIBITIONS } from '../../exhibitions/exhibitionData';

export default function ExhibitionsSection() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchTerm] = useState('');
  const [activeModalExhibition, setSelectedExhibition] = useState(null);

  const { data: publicData, isLoading } = usePublicExhibitions();

  // Combine backend exhibitions with initial featured showcases for rich visitor experience
  const exhibitions = useMemo(() => {
    const dbExhibitions = publicData?.exhibitions || [];
    
    // Map DB exhibitions into normalized format
    const formattedDb = dbExhibitions.map((e) => {
      const rawStatus = (e.status || 'planning').toLowerCase();
      let status = 'Active';
      if (rawStatus === 'upcoming') status = 'Upcoming';
      else if (rawStatus === 'closed' || rawStatus === 'ended' || rawStatus === 'completed') status = 'Completed';
      else if (rawStatus === 'draft' || rawStatus === 'planning') status = 'Planning';

      return {
        id: e.id,
        title: e.name || 'Untitled Exhibition',
        subtitle: e.theme ? `Theme: ${e.theme}` : (e.description || 'Curatorial Showcase'),
        category: e.theme || 'Permanent Exhibition',
        description: e.description || 'Explore rare physical artifacts and historical context in this curated exhibition.',
        theme: e.theme || 'Heritage & Memory',
        coverImage:
          e.gallery && e.gallery.startsWith('http')
            ? e.gallery
            : 'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg?auto=compress&cs=tinysrgb&w=800&q=80',
        startDate: e.start_date || 'Ongoing',
        endDate: e.end_date || '2026',
        openingTime: '09:00',
        closingTime: '18:00',
        hall: e.gallery || 'Main Hall',
        roomNumber: 'Main Pavilion',
        capacity: e.expected_visitors || 250,
        status: status,
        curator: 'Adwa Curatorial Division',
        assignedArtifacts: e.artifacts || [],
        assignedArtifactCount: e.artifacts?.length || 0,
        isDbRecord: true,
      };
    });

    if (formattedDb.length > 0) {
      // Merge with initial showcases to ensure rich cards
      const existingIds = new Set(formattedDb.map((x) => x.id));
      const combined = [...formattedDb];
      INITIAL_EXHIBITIONS.forEach((initEx) => {
        if (!existingIds.has(initEx.id)) {
          combined.push({
            ...initEx,
            assignedArtifactCount: initEx.assignedArtifactIds?.length || 3,
          });
        }
      });
      return combined;
    }

    return INITIAL_EXHIBITIONS.map((ex) => ({
      ...ex,
      assignedArtifactCount: ex.assignedArtifactIds?.length || 3,
    }));
  }, [publicData]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(['All']);
    exhibitions.forEach((ex) => {
      if (ex.category) set.add(ex.category);
    });
    return Array.from(set);
  }, [exhibitions]);

  // Filtered exhibitions
  const filteredExhibitions = useMemo(() => {
    return exhibitions.filter((ex) => {
      const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.hall && ex.hall.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [exhibitions, selectedCategory, searchQuery]);

  return (
    <section id="exhibitions" className="bg-[#1C120B] px-6 py-16 sm:py-24 text-smrmp-parchment relative overflow-hidden" aria-labelledby="exhibitions-title">
      {/* Decorative Gold Glow Header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-smrmp-gold/5 blur-3xl rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="mb-10 text-center" data-reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-smrmp-gold/30 bg-smrmp-gold/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-smrmp-gold mb-3 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Adwa Memorial Museum / ዐውደ ርዕዮች</span>
          </div>
          <h2 id="exhibitions-title" className="font-display text-3xl font-bold tracking-tight sm:text-5xl text-white">
            Curated Exhibitions &amp; Galleries
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-smrmp-parchment/70 leading-relaxed font-light">
            Discover living history through masterfully curated physical showcases, royal attire, diplomatic archives, and interactive digital narrative installations.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4" data-reveal>
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-smrmp-gold text-black shadow-md shadow-smrmp-gold/20'
                      : 'bg-white/5 text-smrmp-parchment/70 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-smrmp-gold/70" />
            <input
              type="text"
              placeholder="Search exhibitions..."
              value={searchQuery}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-smrmp-parchment placeholder-smrmp-parchment/40 focus:border-smrmp-gold focus:outline-none focus:ring-1 focus:ring-smrmp-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-smrmp-parchment/50 hover:text-white"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-12 text-center text-xs text-smrmp-gold font-bold">
            Loading active exhibitions...
          </div>
        )}

        {/* Exhibition Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
          {filteredExhibitions.map((ex) => {
            const isUpcoming = ex.status === 'Upcoming' || ex.status === 'Planning';
            return (
              <article
                key={ex.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl transition-all duration-300 hover:border-smrmp-gold/50 hover:shadow-2xl hover:shadow-smrmp-gold/10"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-52 overflow-hidden bg-black/60">
                  <img
                    src={ex.coverImage}
                    alt={ex.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Status & Category Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-black/70 backdrop-blur-md border border-smrmp-gold/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">
                      {ex.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        isUpcoming
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  {/* Title overlay on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display text-xl font-bold text-white leading-tight group-hover:text-smrmp-gold transition-colors">
                      {ex.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex-1 p-5 space-y-3">
                  {ex.subtitle && (
                    <p className="text-xs font-semibold text-smrmp-gold/90 line-clamp-1">
                      {ex.subtitle}
                    </p>
                  )}
                  <p className="text-xs font-light text-smrmp-parchment/75 leading-relaxed line-clamp-3">
                    {ex.description}
                  </p>

                  {/* Key Exhibition Specs */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-smrmp-parchment/80 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-smrmp-gold">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{ex.hall} {ex.roomNumber ? `• ${ex.roomNumber}` : ''}</span>
                      </span>
                      <span className="flex items-center gap-1 text-smrmp-parchment/60">
                        <UsersIcon className="h-3.5 w-3.5 shrink-0 text-smrmp-gold/70" />
                        <span>Cap: {ex.capacity}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0 text-smrmp-gold" />
                        <span>{ex.startDate} → {ex.endDate}</span>
                      </span>
                      {ex.openingTime && (
                        <span className="flex items-center gap-1 text-[10px] text-smrmp-parchment/60">
                          <ClockIcon className="h-3 w-3 text-smrmp-gold/70" />
                          <span>{ex.openingTime} - {ex.closingTime}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="border-t border-white/10 bg-black/30 p-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExhibition(ex)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold text-smrmp-parchment hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <InformationCircleIcon className="h-4 w-4 text-smrmp-gold" />
                    <span>View Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/tickets')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-smrmp-gold px-3 py-2 text-xs font-bold text-black hover:bg-white transition-colors shadow-sm"
                  >
                    <TicketIcon className="h-4 w-4" />
                    <span>Book Ticket</span>
                  </button>
                </div>
              </article>
            );
          })}

          {filteredExhibitions.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-smrmp-parchment/60 space-y-2">
              <p className="font-bold text-sm text-white">No exhibitions match your selection</p>
              <p>Try switching category tabs or clearing your search term.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
                className="mt-2 text-xs font-bold text-smrmp-gold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom Banner Call to Action */}
        <div className="mt-12 rounded-2xl border border-smrmp-gold/30 bg-gradient-to-r from-smrmp-brown via-black/80 to-smrmp-brown p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden" data-reveal>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-gold flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Seamless Visitor Experience</span>
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Ready to Experience the Adwa Memory In Person?
              </h3>
              <p className="text-xs text-smrmp-parchment/70 max-w-xl">
                Reserve entry tickets online with Telebirr integration or scan physical QR codes inside the exhibition halls for rich audio narration.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/tickets"
                className="inline-flex items-center gap-2 bg-smrmp-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-white transition-colors rounded-xl shadow-lg"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Buy Pass Online</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Exhibition Modal Detail Drawer */}
      {activeModalExhibition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-smrmp-gold/40 bg-[#1C120B] p-6 text-smrmp-parchment shadow-2xl space-y-5 my-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedExhibition(null)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-1.5 text-smrmp-parchment hover:bg-white/20 hover:text-white transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* Modal Image */}
            <div className="relative h-56 w-full overflow-hidden rounded-xl bg-black">
              <img
                src={activeModalExhibition.coverImage}
                alt={activeModalExhibition.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-smrmp-gold border border-smrmp-gold/40">
                  {activeModalExhibition.category}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/40">
                  {activeModalExhibition.status}
                </span>
              </div>
            </div>

            {/* Title & Theme */}
            <div>
              <h3 className="font-display text-2xl font-bold text-white">{activeModalExhibition.title}</h3>
              {activeModalExhibition.subtitle && (
                <p className="mt-1 text-xs font-semibold text-smrmp-gold">
                  {activeModalExhibition.subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs text-smrmp-parchment/80 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/10">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">About This Exhibition</h4>
              <p>{activeModalExhibition.description}</p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <span className="text-smrmp-parchment/60 font-medium block">Hall &amp; Location</span>
                <span className="font-bold text-white">{activeModalExhibition.hall} ({activeModalExhibition.roomNumber || 'Main Room'})</span>
              </div>
              <div>
                <span className="text-smrmp-parchment/60 font-medium block">Exhibition Dates</span>
                <span className="font-bold text-white">{activeModalExhibition.startDate} → {activeModalExhibition.endDate}</span>
              </div>
              <div>
                <span className="text-smrmp-parchment/60 font-medium block">Visiting Hours</span>
                <span className="font-bold text-white">{activeModalExhibition.openingTime} - {activeModalExhibition.closingTime}</span>
              </div>
              <div>
                <span className="text-smrmp-parchment/60 font-medium block">Curator Lead</span>
                <span className="font-bold text-white">{activeModalExhibition.curator || 'Curatorial Division'}</span>
              </div>
            </div>

            {/* Featured Artifacts if available */}
            {activeModalExhibition.assignedArtifacts && activeModalExhibition.assignedArtifacts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-smrmp-gold">
                  Featured Physical Artifacts ({activeModalExhibition.assignedArtifacts.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {activeModalExhibition.assignedArtifacts.map((art) => (
                    <div key={art.id} className="flex items-center gap-2 rounded-lg bg-black/40 p-2 border border-white/10 text-xs">
                      <div className="h-2 w-2 rounded-full bg-smrmp-gold shrink-0" />
                      <span className="font-semibold text-white truncate">{art.name}</span>
                      <span className="text-[10px] text-smrmp-parchment/50 ml-auto shrink-0">{art.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedExhibition(null)}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-smrmp-parchment hover:bg-white/10 transition"
              >
                Close Window
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedExhibition(null);
                  navigate('/tickets');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-smrmp-gold px-5 py-2.5 text-xs font-bold text-black hover:bg-white transition shadow-lg"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Reserve Ticket for Exhibition</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
