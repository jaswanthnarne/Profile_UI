import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { socket } from '../services/socket';

function ProjectCard({ project }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const mediaCount = project.media?.length || 0;

  useEffect(() => {
    if (mediaCount <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % mediaCount);
    }, 3000);

    return () => clearInterval(interval);
  }, [mediaCount, isHovered]);

  const nextMedia = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % mediaCount);
  };

  const prevMedia = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + mediaCount) % mediaCount);
  };

  const activeMedia = project.media && project.media[activeIdx];
  const isVideo = activeMedia?.mediaType === 'video';
  const isYoutube = activeMedia?.mediaType === 'youtube';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-soft flex flex-col group hover:border-brand-200 hover:shadow-elevated transition-all duration-300"
    >
      {/* Uniform Stack Container */}
      <div className="relative aspect-video bg-black overflow-hidden select-none">
        {mediaCount > 0 && activeMedia ? (
          <div className="w-full h-full">
            {isVideo ? (
              <video
                src={activeMedia.url}
                className="w-full h-full object-cover"
                muted
                preload="metadata"
                playsInline
              />
            ) : isYoutube ? (
              <img
                src={`https://img.youtube.com/vi/${activeMedia.youtubeId}/hqdefault.jpg`}
                alt="YouTube placeholder"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={activeMedia.caption || 'Project Showcase'}
                className="w-full h-full object-cover"
              />
            )}

            {/* Central Play Indicator */}
            {(isVideo || isYoutube) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Slider Controls (One-by-One Navigation) */}
            {mediaCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevMedia}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-sm shadow transition-colors z-20"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextMedia}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-sm shadow transition-colors z-20"
                >
                  ›
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {project.media.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        activeIdx === i ? 'bg-white w-2.5' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

          </div>
        ) : (
          /* Default Empty Showcase Template */
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-900 text-surface-400 p-4">
            <svg className="w-8 h-8 text-surface-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2.25 2.25 0 013.182 0L16 16m-2-2l1.586-1.586a2.25 2.25 0 013.182 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold">No media items uploaded</span>
          </div>
        )}

        {/* Media count overlay badge */}
        <div className="absolute top-2.5 right-2.5 z-20 bg-black/60 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
          {mediaCount > 0 ? `${activeIdx + 1} / ${mediaCount} Media` : '0 Media'}
        </div>
      </div>

      {/* Card Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {activeMedia?.caption && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-brand-50/90 to-brand-100/35 border border-brand-100/60 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
              <p className="text-[10.5px] text-brand-750 font-bold tracking-tight line-clamp-1 italic leading-none">
                {activeMedia.caption}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            {project.companyId?.name && (
              <span className="text-brand-600 text-xs font-bold uppercase tracking-wider block">
                {project.companyId.name}
              </span>
            )}
            <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-xs font-extrabold px-2 py-0.5 border border-amber-100 rounded">
              ⭐ {project.experienceRating?.toFixed(1)}
            </span>
          </div>
          <h3 className="font-display text-lg font-extrabold text-surface-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {project.projectName}
          </h3>
          <div className="flex flex-col gap-1 text-surface-500 text-xs font-semibold">
            {project.collegeName && (
              <p className="flex items-center gap-1">
                <span className="text-brand-500 font-bold">Client:</span> {project.collegeName}
              </p>
            )}
            {(project.startDate || project.endDate) && (
              <p className="flex items-center gap-1">
                <span className="text-brand-500 font-bold">Timeline:</span> {formatDate(project.startDate)} {project.endDate && `– ${formatDate(project.endDate)}`}
              </p>
            )}
          </div>
          <p className="text-surface-600 text-xs leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        <div className="pt-3 border-t border-surface-150">
          <Link
            to={`/gallery/${project._id}`}
            className="w-full btn-primary btn-sm flex items-center justify-center gap-2 group-hover:bg-brand-700 shadow-sm"
          >
            Explore Experience
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [companiesRes, projectsRes] = await Promise.all([
        api.get('/companies'),
        api.get('/gallery'),
      ]);
      setCompanies(companiesRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('gallery_changed', fetchData);

    return () => {
      socket.off('gallery_changed', fetchData);
    };
  }, []);

  const filteredProjects = selectedCompany === 'all'
    ? projects
    : projects.filter((p) => p.companyId?._id === selectedCompany);

  return (
    <div className="pt-20 bg-surface-50 min-h-screen">
      <section className="section py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="section-title text-4xl md:text-5xl font-extrabold tracking-tight">
            Class Showcase & <span className="text-brand-600">Experiences</span>
          </h1>
          <p className="section-subtitle mx-auto">
            Explore case studies, bootcamp cohorts, corporate ups killing programs, and student feedback records.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10">
          <button
            id="filter-all"
            onClick={() => setSelectedCompany('all')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              selectedCompany === 'all'
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            All ({projects.length})
          </button>
          {companies.map((company) => {
            const count = projects.filter((p) => p.companyId?._id === company._id).length;
            return (
              <button
                key={company._id}
                id={`filter-${company._id}`}
                onClick={() => setSelectedCompany(company._id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedCompany === company._id
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                {company.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No Projects View */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center bg-white border border-surface-200 rounded-xl p-16 shadow-soft max-w-md mx-auto">
            <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-surface-800 font-bold mb-1">No experiences found</p>
            <p className="text-surface-500 text-sm">There are no training experience projects uploaded for this filter yet.</p>
          </div>
        )}

        {/* Uniform Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
