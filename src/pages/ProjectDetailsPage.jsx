import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { socket } from '../services/socket';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/gallery/${id}`);
      setProject(res.data);
      if (res.data?.media && res.data.media.length > 0) {
        // Set the first media item as active initially if none selected
        setActiveMedia(res.data.media[0]);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();

    socket.on('gallery_changed', fetchProjectDetails);

    return () => {
      socket.off('gallery_changed', fetchProjectDetails);
    };
  }, [id]);

  // Sync active media if the project details updated (e.g. media deleted or added)
  useEffect(() => {
    if (project?.media) {
      if (project.media.length === 0) {
        setActiveMedia(null);
      } else if (!activeMedia || !project.media.some((m) => m._id === activeMedia._id)) {
        setActiveMedia(project.media[0]);
      } else {
        const updatedActive = project.media.find((m) => m._id === activeMedia._id);
        if (updatedActive) {
          setActiveMedia(updatedActive);
        }
      }
    }
  }, [project]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (loading) return (
    <div className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="pt-20 min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">✕</div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Showcase Project Not Found</h2>
      <p className="text-slate-500 text-sm max-w-sm mb-6">The experience record you are looking for does not exist or has been deleted.</p>
      <Link to="/gallery" className="btn-primary">Back to Gallery</Link>
    </div>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pt-20 bg-slate-50 min-h-screen pb-16">
      <section className="section py-8">
        {/* Back navigation */}
        <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 font-bold mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Showcase Gallery
        </Link>

        {/* ULTRA-PREMIUM INTERACTIVE HERO GRID (College side-by-side with photo/media) */}
        <div className="card bg-white border border-slate-200 overflow-hidden shadow-soft mb-10 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Matter / Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap gap-2 items-center">
                {project.companyId && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-50 border border-brand-100 text-brand-700 shadow-sm transition-transform hover:scale-[1.02]">
                    {project.companyId.logo && (
                      <img src={project.companyId.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                    )}
                    Partnered with {project.companyId.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-extrabold px-3 py-1 border border-amber-100 rounded-full shadow-sm">
                  ⭐ {project.experienceRating?.toFixed(1)} / 5.0 Rating
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {project.projectName}
              </h1>

              {/* College & Timeline Side-By-Side Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* College Info Box */}
                {project.collegeName && (
                  <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner group hover:border-brand-200 transition-colors">
                    <div className="w-10 h-10 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center text-brand-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hosted At College</p>
                      <p className="text-slate-800 text-sm font-bold mt-1 group-hover:text-brand-600 transition-colors">
                        {project.collegeName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline Info Box */}
                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner group hover:border-brand-200 transition-colors">
                    <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center text-sky-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Training Timeline</p>
                      <p className="text-slate-800 text-sm font-bold mt-1">
                        {formatDate(project.startDate)} {project.endDate && `– ${formatDate(project.endDate)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {project.feedbackSummary && (
                <div className="p-4 bg-slate-50 border-l-4 border-brand-500 rounded-r-xl shadow-inner text-slate-700 text-xs md:text-sm leading-relaxed">
                  <span className="font-extrabold text-brand-700 block uppercase tracking-wider text-[9px] mb-1">Feedback Summary:</span>
                  "{project.feedbackSummary}"
                </div>
              )}
            </div>

            {/* Right Column: Interactive Featured Photo/Video Player */}
            <div className="lg:col-span-5 space-y-4">
              {activeMedia ? (
                <div>
                  {/* Featured Player Window */}
                  <div
                    onClick={() => { if (activeMedia.mediaType === 'image') setLightbox(activeMedia); }}
                    className={`relative rounded-2xl overflow-hidden aspect-video bg-black shadow-elevated border border-slate-200 ${
                      activeMedia.mediaType === 'image' ? 'cursor-zoom-in' : ''
                    } group`}
                  >
                    {activeMedia.mediaType === 'video' ? (
                      <video
                        src={activeMedia.url}
                        controls
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : activeMedia.mediaType === 'youtube' ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${activeMedia.youtubeId}?autoplay=1&mute=1&rel=0`}
                        title={activeMedia.caption || 'YouTube Player'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={activeMedia.url}
                          alt={activeMedia.caption || 'Showcase'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Media Type Overlay */}
                    <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded shadow ${
                        activeMedia.mediaType === 'video'
                          ? 'bg-sky-600 text-white'
                          : activeMedia.mediaType === 'youtube'
                            ? 'bg-red-600 text-white'
                            : 'bg-brand-600 text-white'
                      }`}>
                        {activeMedia.mediaType}
                      </span>
                    </div>

                  </div>

                  {/* Redesigned Active Caption below the player */}
                  {activeMedia.caption && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-brand-50/90 to-sky-50/45 backdrop-blur-md border border-brand-100/60 rounded-2xl shadow-sm relative overflow-hidden flex items-start gap-3 transition-all duration-300">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-sky-500 rounded-l-2xl" />
                      <div className="text-brand-650 flex-shrink-0 p-1.5 bg-white border border-brand-100 rounded-xl shadow-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.159 3.659A2.25 2.25 0 009.568 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold text-brand-650 uppercase tracking-widest block mb-0.5">Showcase Highlight</span>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          {activeMedia.caption}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Row Selector */}
                  {project.media.length > 1 && (
                    <div className="flex items-center gap-2.5 pt-3 overflow-x-auto pb-1">
                      {project.media.map((item) => {
                        const isSelected = activeMedia._id === item._id;
                        const isVideo = item.mediaType === 'video';
                        const isYoutube = item.mediaType === 'youtube';

                        return (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => setActiveMedia(item)}
                            className={`relative w-20 h-12 rounded-lg border overflow-hidden aspect-video flex-shrink-0 transition-all ${
                              isSelected
                                ? 'border-brand-500 ring-2 ring-brand-500/20 scale-[0.98]'
                                : 'border-slate-200 opacity-60 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                          >
                            {isVideo ? (
                              <video src={item.url} className="w-full h-full object-cover" muted />
                            ) : isYoutube ? (
                              <img
                                src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <img src={item.url} className="w-full h-full object-cover" alt="" />
                            )}

                            {/* Small indicator icons */}
                            {(isVideo || isYoutube) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                <span className="text-white text-xs">▶</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Media State */
                <div className="relative rounded-2xl border border-slate-200 border-dashed p-12 text-center aspect-video flex flex-col items-center justify-center bg-slate-50">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3 text-slate-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2.25 2.25 0 013.182 0L16 16m-2-2l1.586-1.586a2.25 2.25 0 013.182 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">No Showcase Media</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Media items will appear here once uploaded by admin.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Lower Content Grid: Overview, Testimonials vs Syllabus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Block: Description & Testimonials (Col 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Overview description */}
            <div className="card p-6 md:p-8 bg-white border border-slate-200 shadow-soft">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                Training Experience & Overview
              </h2>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {project.description || 'No detailed overview provided for this training engagement.'}
              </p>
            </div>

            {/* Testimonials */}
            {project.studentTestimonials && project.studentTestimonials.length > 0 && (
              <div className="card p-6 md:p-8 bg-white border border-slate-200 shadow-soft">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-5 border-b border-slate-100 pb-2">
                  Direct Student Testimonials
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {project.studentTestimonials.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-gradient-to-br from-slate-50 to-brand-50/10 border-l-4 border-brand-500 rounded-r-2xl shadow-sm relative group hover:shadow-soft transition-all duration-200"
                    >
                      <span className="absolute right-4 top-2 text-6xl text-brand-100/50 font-serif pointer-events-none select-none">
                        “
                      </span>
                      <p className="text-slate-700 text-xs md:text-sm italic leading-relaxed relative z-10 pr-6">
                        "{quote}"
                      </p>
                      <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-3">
                        Feedback Reviewer — Batch {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Block: Syllabus Covered & Summary stats (Col 5) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Topics Syllabus Covered */}
            {project.contentsCovered && project.contentsCovered.length > 0 && (
              <div className="card p-6 md:p-8 bg-white border border-slate-200 shadow-soft">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  Syllabus & Contents Covered
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {project.contentsCovered.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50/80 border border-brand-100 text-brand-700 transition-all hover:bg-brand-100 hover:border-brand-200"
                    >
                      <svg className="w-3.5 h-3.5 text-brand-650 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats verification card */}
            <div className="card p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-elevated">
              <h3 className="font-display text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                Experience Certificate
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Verified training engagement with authorized training deliverables, syllabus, and assessments conducted directly by certified trainer.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Partner Authority</span>
                  <span className="font-bold text-brand-400">{project.companyId?.name || 'Authorized Client'}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">College Location</span>
                  <span className="font-bold text-slate-200">{project.collegeName || 'On-site / Online'}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Verified Rating</span>
                  <span className="font-bold text-amber-400">⭐ {project.experienceRating?.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Showcase ID</span>
                  <span className="font-mono text-slate-400 text-[10px]">{project._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] mx-4 bg-white rounded-2xl shadow-float overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors z-50"
              aria-label="Close lightbox"
            >
              ✕
            </button>
            <div className="bg-slate-950 flex items-center justify-center p-2">
              <img
                src={lightbox.url}
                alt={lightbox.caption || 'Training session'}
                className="max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-5 border-t border-slate-200">
              {lightbox.caption && (
                <p className="text-slate-800 text-sm font-bold leading-relaxed">{lightbox.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
