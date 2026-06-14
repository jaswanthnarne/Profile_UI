import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { socket } from '../services/socket';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5 text-amber-400">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-sm">
        {star <= Math.round(rating) ? '★' : '☆'}
      </span>
    ))}
  </div>
);

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, college, corporate
  const [lightbox, setLightbox] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/testimonials?approved=true');
      setTestimonials(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();

    socket.on('testimonials_changed', fetchTestimonials);
    return () => {
      socket.off('testimonials_changed', fetchTestimonials);
    };
  }, []);

  const filteredTestimonials = (Array.isArray(testimonials) ? testimonials : []).filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'college') return !!t.collegeName;
    if (filterType === 'corporate') return !!t.company && !t.collegeName;
    return true;
  });

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      <section className="section py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <span className="text-brand-600 text-xs font-extrabold uppercase tracking-widest bg-brand-50 border border-brand-100 px-3.5 py-1.5 rounded-full inline-block mb-4">
            Trainee & Partner Reviews
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Client <span className="bg-gradient-to-r from-brand-600 to-sky-600 bg-clip-text text-transparent">Testimonials</span> & Reviews
          </h1>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Real feedback logs from corporate cohorts, developer bootcamps, and train-the-trainer workshops.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-12 select-none animate-slide-up">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'college', label: 'College Students' },
            { id: 'corporate', label: 'Corporate Partners' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                filterType === tab.id
                  ? 'bg-brand-600 text-white shadow-soft scale-[1.02]'
                  : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTestimonials.length === 0 && (
          <div className="text-center bg-white border border-slate-250/70 rounded-2xl p-16 shadow-soft max-w-md mx-auto animate-scale-in">
            <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.253.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.72c-.783-.558-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-slate-800 font-bold mb-1">No reviews found</p>
            <p className="text-slate-500 text-sm">There are no approved testimonials in this category yet.</p>
          </div>
        )}

        {/* Testimonials List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((t) => {
            const hasMedia = t.mediaType && t.mediaType !== 'none';
            const isVideo = t.mediaType === 'video';
            const isYoutube = t.mediaType === 'youtube';

            return (
              <div
                key={t._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated hover:border-brand-200 transition-all duration-300 flex flex-col justify-between p-6 md:p-8 relative"
              >
                {/* Speech Quote marks decorative backdrop */}
                <div className="absolute top-4 right-4 text-slate-100 font-serif text-8xl font-black select-none pointer-events-none leading-none">
                  ”
                </div>

                <div className="space-y-4 relative z-10">
                  <StarRating rating={t.rating} />
                  
                  {/* Testimonial Quote */}
                  <p className="text-slate-650 text-xs md:text-sm italic leading-relaxed">
                    "{t.text}"
                  </p>

                  {/* Attachment Media if present */}
                  {hasMedia && (
                    <div
                      onClick={() => setLightbox(t)}
                      className="mt-4 aspect-video rounded-xl overflow-hidden border border-slate-200/80 bg-slate-950 relative flex items-center justify-center cursor-pointer shadow-soft group"
                    >
                      {isVideo ? (
                        <video
                          src={t.mediaUrl}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          muted
                          preload="metadata"
                          playsInline
                        />
                      ) : isYoutube ? (
                        <img
                          src={`https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`}
                          alt="YouTube placeholder"
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <img
                          src={t.mediaUrl}
                          alt={t.clientName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                      )}

                      {/* Play overlay for video elements */}
                      {(isVideo || isYoutube) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs shadow group-hover:scale-105 transition-transform duration-200">
                            <svg className="w-4.5 h-4.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      <span className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded shadow tracking-wider">
                        {t.mediaType}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile client block */}
                <div className="border-t border-slate-150 pt-4 mt-6 flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-50 border border-brand-100 text-brand-650 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {t.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 text-xs md:text-sm truncate">{t.clientName}</p>
                    {t.company && (
                      <p className="text-brand-600 text-[10px] font-bold uppercase tracking-wider truncate">
                        {t.collegeName ? `${t.collegeName} (via ${t.company})` : t.company}
                      </p>
                    )}
                    {!t.company && t.collegeName && (
                      <p className="text-brand-600 text-[10px] font-bold uppercase tracking-wider truncate">
                        {t.collegeName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* Lightbox Modal for Media */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 transition-opacity p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-float overflow-hidden flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 bg-black/65 hover:bg-black/85 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors z-50 shadow-md"
              aria-label="Close lightbox"
            >
              ✕
            </button>
            
            <div className="bg-slate-950 flex items-center justify-center p-4 relative aspect-video select-none min-h-[300px] md:min-h-[450px]">
              {lightbox.mediaType === 'video' ? (
                <video
                  src={lightbox.mediaUrl}
                  className="max-h-[70vh] object-contain w-full h-full rounded-lg"
                  controls
                  autoPlay
                  muted
                  playsInline
                />
              ) : lightbox.mediaType === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${lightbox.youtubeId}?autoplay=1`}
                  className="w-full h-full border-0 rounded-lg"
                  title={lightbox.clientName}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <img
                  src={lightbox.mediaUrl}
                  alt={lightbox.clientName}
                  className="max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-brand-50/70 to-sky-50/40 backdrop-blur-md relative">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-sky-500" />
              <div>
                <span className="text-[10px] font-extrabold text-brand-650 uppercase tracking-widest block mb-1">
                  {lightbox.clientName} {lightbox.company && `— ${lightbox.company}`}
                </span>
                <p className="text-slate-800 text-sm font-semibold italic leading-relaxed">
                  "{lightbox.text}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
