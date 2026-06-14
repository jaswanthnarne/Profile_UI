import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SkillCard from '../components/SkillCard';
import { socket } from '../services/socket';

const defaultSkills = [
  {
    _id: 'sk-cybersecurity',
    skillName: 'Cyber Security',
    description: 'Ethical hacking, penetration testing, and enterprise security frameworks.',
    icon: 'lock',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    topics: ['Network Security & Firewalls', 'Ethical Hacking & Pen Testing', 'OWASP Top 10', 'Security Auditing', 'Cryptography Fundamentals']
  },
  {
    _id: 'sk-cloud',
    skillName: 'Cloud Computing',
    description: 'AWS, Azure, GCP architecture and DevOps workflows.',
    icon: 'globe',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    topics: ['AWS / Azure / GCP Fundamentals', 'Cloud Architecture & Deployment', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Serverless Computing']
  },
  {
    _id: 'sk-networking',
    skillName: 'Networking',
    description: 'TCP/IP, routing, switching, and infrastructure design.',
    icon: 'network',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    topics: ['TCP/IP & OSI Model', 'Routing & Switching', 'Network Administration', 'Wireless Networks', 'VPN & Network Security']
  },
  {
    _id: 'sk-webdev',
    skillName: 'Web Development',
    description: 'Full stack with HTML, CSS, JavaScript, React, and Node.js.',
    icon: 'code',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    topics: ['HTML5 & Semantic Markup', 'CSS3 & Responsive Design', 'JavaScript ES6+', 'React & Next.js', 'Node.js & Express.js', 'REST API Design']
  },
  {
    _id: 'sk-python',
    skillName: 'Python Programming',
    description: 'Core Python, automation, data analysis, and Django.',
    icon: 'cpu',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    topics: ['Core Python & OOP', 'Data Structures & Algorithms', 'NumPy, Pandas & Matplotlib', 'Django & Flask Frameworks', 'Automation & Scripting']
  },
  {
    _id: 'sk-java',
    skillName: 'Java Programming',
    description: 'Core Java programming, object-oriented concepts, exception handling, and collections.',
    icon: 'cpu',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    topics: ['Java Language Basics & Syntax', 'Object-Oriented Programming (OOP)', 'Exception Handling & Packages', 'Java Collections Framework', 'Multithreading & Concurrency']
  },
  {
    _id: 'sk-datasci',
    skillName: 'Data Science',
    description: 'Analytics, ML models, and business intelligence.',
    icon: 'database',
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80',
    topics: ['Exploratory Data Analysis', 'Machine Learning Algorithms', 'Deep Learning Foundations', 'Data Visualization (Tableau/PowerBI)', 'Statistical Modeling']
  }
];

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5 text-amber-400">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-sm">
        {star <= Math.round(rating) ? '★' : '☆'}
      </span>
    ))}
  </div>
);

function ProjectCard({ project }) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const mediaCount = project.media?.length || 0;
  const activeMedia = project.media && project.media[activeMediaIdx];
  const isVideo = activeMedia?.mediaType === 'video';
  const isYoutube = activeMedia?.mediaType === 'youtube';

  useEffect(() => {
    if (mediaCount <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveMediaIdx((prev) => (prev + 1) % mediaCount);
    }, 3000);

    return () => clearInterval(interval);
  }, [mediaCount, isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft flex flex-col group hover:border-brand-200 hover:shadow-elevated transition-all duration-300"
    >
      {/* Uniform aspect-video stack player */}
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

            {/* Video Overlay Indicator */}
            {(isVideo || isYoutube) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs shadow group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Slider Controls inside player */}
            {mediaCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveMediaIdx((prev) => (prev - 1 + mediaCount) % mediaCount);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center font-bold text-xs shadow transition-colors z-20"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveMediaIdx((prev) => (prev + 1) % mediaCount);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center font-bold text-xs shadow transition-colors z-20"
                >
                  ›
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {project.media.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        activeMediaIdx === i ? 'bg-white w-2.5' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2.25 2.25 0 013.182 0L16 16m-2-2l1.586-1.586a2.25 2.25 0 013.182 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold">No media items uploaded</span>
          </div>
        )}

        {/* Index badge counter */}
        {mediaCount > 0 && (
          <div className="absolute top-2 right-2 z-20 bg-black/60 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
            {activeMediaIdx + 1} / {mediaCount} Media
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Redesigned Active Caption badge */}
          {activeMedia?.caption ? (
            <div className="flex items-start gap-2 bg-gradient-to-r from-brand-50/90 to-sky-50/45 border border-brand-100/60 p-2.5 rounded-xl shadow-xs relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 bottom-0 w-0.75 bg-gradient-to-b from-brand-500 to-sky-500 rounded-l-xl" />
              <div className="text-brand-650 flex-shrink-0 p-1 bg-white border border-brand-100 rounded-lg shadow-xxs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.159 3.659A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-extrabold text-brand-650 uppercase tracking-widest block leading-none mb-0.5">Highlight</span>
                <p className="text-[10.5px] text-slate-700 font-semibold leading-relaxed line-clamp-2">
                  {activeMedia.caption}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[43px] flex items-center justify-center bg-slate-50 border border-slate-200 border-dashed rounded-xl">
              <span className="text-[9.5px] text-slate-400 font-medium">No caption highlight</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            {project.companyId?.name ? (
              <span className="text-brand-650 text-xs font-bold uppercase tracking-wider block truncate max-w-[150px]">
                {project.companyId.name}
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-bold uppercase">Training Program</span>
            )}
            <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-xs font-extrabold px-2 py-0.5 border border-amber-100 rounded">
              ⭐ {project.experienceRating?.toFixed(1)}
            </span>
          </div>

          <h3 className="font-display text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {project.projectName}
          </h3>

          <div className="flex flex-col gap-0.5 text-slate-500 text-[11px] font-semibold">
            {project.collegeName && (
              <p className="truncate">
                <span className="text-brand-600 font-bold">Client:</span> {project.collegeName}
              </p>
            )}
            {(project.startDate || project.endDate) && (
              <p>
                <span className="text-brand-600 font-bold">Timeline:</span> {new Date(project.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })} {project.endDate && `– ${new Date(project.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}`}
              </p>
            )}
          </div>

          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 italic">
            "{project.description}"
          </p>
        </div>

        <div className="pt-3 border-t border-slate-150">
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

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [classroomMoments, setClassroomMoments] = useState([]);
  const [loading, setLoading] = useState(true);


  // Category filter state for courses
  const [activeCategory, setActiveCategory] = useState('All');

  // Category filter state for classroom moments
  const [momentsCategory, setMomentsCategory] = useState('All');

  // Hero IDE interactive tab state
  const [heroActiveTab, setHeroActiveTab] = useState('skills.json');

  // Lightbox overlay state
  const [lightbox, setLightbox] = useState(null);

  const fetchData = async () => {
    try {
      const [companiesRes, testimonialsRes, coursesRes, projectsRes, momentsRes] = await Promise.all([
        api.get('/companies'),
        api.get('/testimonials?approved=true'),
        api.get('/courses'),
        api.get('/gallery'),
        api.get('/moments')
      ]);
      setCompanies(companiesRes.data);
      setTestimonials(testimonialsRes.data.slice(0, 3));
      setCourses(coursesRes.data);
      setProjects(projectsRes.data);
      setClassroomMoments(momentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('courses_changed', fetchData);
    socket.on('testimonials_changed', fetchData);
    socket.on('gallery_changed', fetchData);
    socket.on('moments_changed', fetchData);

    return () => {
      socket.off('courses_changed', fetchData);
      socket.off('testimonials_changed', fetchData);
      socket.off('gallery_changed', fetchData);
      socket.off('moments_changed', fetchData);
    };
  }, []);

  // Listen for Escape key to close lightbox
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const displaySkills = courses.length > 0 ? courses : defaultSkills;

  // Extract unique colleges from projects dynamically to populate in client marquee
  const uniqueColleges = Array.from(
    new Set(
      projects
        .map((p) => p.collegeName)
        .filter((c) => c && c.trim() !== '')
    )
  ).map((college, idx) => {
    let displayName = college;
    let shortName = college;
    const lower = college.toLowerCase();
    if (lower.includes('tontadarya') || lower.includes('tce')) {
      displayName = 'Tontadarya College of Engineering';
      shortName = 'TCE Gadag';
    } else if (lower.includes('federal') || lower.includes('fisat')) {
      displayName = 'Federal Institute of Science and Technology';
      shortName = 'FISAT Angamaly';
    } else if (lower.includes('mit') || lower.includes('maharaja') || lower.includes('mysore')) {
      displayName = 'Maharaja Institute of Technology';
      shortName = 'MIT Mysore';
    }
    return {
      _id: `college-${idx}`,
      name: displayName,
      shortName: shortName,
      isCollege: true
    };
  });

  const marqueeItems = [
    ...companies.map(c => ({ ...c, isCollege: false })),
    ...uniqueColleges
  ];

  // Helper to resolve categories for dynamic courses
  const getCourseCategory = (skillName) => {
    const name = skillName.toLowerCase();
    if (name.includes('cyber') || name.includes('security') || name.includes('network') || name.includes('routing')) {
      return 'Security & Infrastructure';
    }
    if (name.includes('cloud') || name.includes('docker') || name.includes('kubernetes') || name.includes('devops') || name.includes('data') || name.includes('science') || name.includes('analytics')) {
      return 'Cloud & Data';
    }
    return 'Software Development';
  };

  const filteredSkills = activeCategory === 'All'
    ? displaySkills
    : displaySkills.filter(skill => getCourseCategory(skill.skillName) === activeCategory);

  const programs = [
    {
      title: 'EdTech Career Bootcamps',
      subtitle: 'Training for Students',
      desc: 'High-intensity software engineering and full-stack development courses. Mentoring college students to achieve industry readiness and secure top-tier placements.',
      highlight: 'Core tech stack, system design, and placement prep',
      icon: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: 'Corporate Upskilling',
      subtitle: 'Training for Enterprises',
      desc: 'Custom technical workshops, architecture coaching, and professional competency bootcamps tailored to engineering divisions and corporate teams.',
      highlight: 'Cloud architecture, clean code practices, and DevOps workflows',
      icon: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Train-the-Trainer (TTT)',
      subtitle: 'Training for Educators',
      desc: 'Empowering instructors, college faculty, and technical mentors with active learning methods, presentation techniques, and modular curriculum design frameworks.',
      highlight: 'Pedagogical design, engagement strategies, and evaluation models',
      icon: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      
      {/* 1. HERO SECTION (Dynamic Visuals & Interactive Tabs) */}
      <section className="section flex flex-col lg:flex-row items-center gap-12 md:gap-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
        
        <div className="flex-1 animate-slide-up relative z-10">
          <div className="inline-flex items-center gap-2.5 bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs text-brand-700 font-extrabold mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 bg-brand-600 rounded-full animate-pulse" />
            Empowering EdTech, Corporates & Academics
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 mb-6">
            Bridging Academics and <span className="bg-gradient-to-r from-brand-600 to-sky-600 bg-clip-text text-transparent">Enterprise</span> Capability
          </h1>
          
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            I'm <strong className="text-slate-800 font-bold">Jaswanth Narne</strong>, a senior technical consultant executing highly effective code bootcamps for EdTech academies, specialized workshops for corporate engineering teams, and Train-the-Trainer (TTT) frameworks.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" id="hero-cta-contact" className="btn-primary">
              Book a Training
            </Link>
            <Link to="/gallery" id="hero-cta-gallery" className="btn-secondary">
              View Class Showcase
            </Link>
          </div>

          {/* Glowing Metrics grid */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg">
            {[
              { value: '12K+', label: 'Students' },
              { value: '45+', label: 'Cohorts' },
              { value: '500+', label: 'Trainers' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white border border-slate-200 px-4 py-4 rounded-2xl shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300">
                <div className="font-display text-2xl md:text-3xl font-extrabold text-brand-600 leading-none">{value}</div>
                <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Interactive IDE Mockup (Right Column) */}
        <div className="flex-shrink-0 w-full max-w-lg lg:w-[480px] relative flex items-center justify-center animate-scale-in">
          <div className="absolute inset-0 bg-brand-100/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative bg-slate-900 text-slate-200 w-full rounded-2xl overflow-hidden shadow-elevated border border-slate-800 flex flex-col h-[380px]">
            {/* VSCode-style Header */}
            <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800 select-none">
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-[10px] font-mono text-slate-500">development_workspace</div>
              <div className="w-10" />
            </div>

            {/* Editor File Tabs */}
            <div className="flex bg-slate-950/40 text-xs border-b border-slate-800 select-none">
              {[
                { name: 'skills.json', label: 'skills.json', type: 'json' },
                { name: 'metrics.yaml', label: 'metrics.yaml', type: 'yaml' },
                { name: 'consultant.config', label: 'consultant.config', type: 'ini' }
              ].map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => setHeroActiveTab(tab.name)}
                  className={`px-4 py-2 font-mono flex items-center gap-1.5 border-r border-slate-800 transition-colors ${
                    heroActiveTab === tab.name
                      ? 'bg-slate-900 text-white font-bold border-b border-b-brand-500'
                      : 'bg-slate-950/60 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className={
                    tab.type === 'json' ? 'text-amber-500' : tab.type === 'yaml' ? 'text-emerald-500' : 'text-sky-500'
                  }>●</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Editor Text Workspace */}
            <div className="p-5 font-mono text-xs overflow-y-auto flex-1 bg-slate-900/95 leading-relaxed text-slate-300">
              {heroActiveTab === 'skills.json' && (
                <pre className="space-y-1">
                  <div><span className="text-pink-500">{"{"}</span></div>
                  <div>  <span className="text-sky-400">"consultant"</span>: <span className="text-emerald-400">"Jaswanth Narne"</span>,</div>
                  <div>  <span className="text-sky-400">"specialties"</span>: <span className="text-pink-500">[</span></div>
                  <div>    <span className="text-emerald-400">"Full-Stack Dev"</span>,</div>
                  <div>    <span className="text-emerald-400">"Core Java & Python"</span>,</div>
                  <div>    <span className="text-emerald-400">"Cyber Security"</span>,</div>
                  <div>    <span className="text-emerald-400">"Cloud & Infrastructure"</span></div>
                  <div>  <span className="text-pink-500">]</span>,</div>
                  <div>  <span className="text-sky-400">"pedagogy"</span>: <span className="text-emerald-400">"Interactive Bootcamps"</span></div>
                  <div><span className="text-pink-500">{"}"}</span></div>
                </pre>
              )}

              {heroActiveTab === 'metrics.yaml' && (
                <pre className="space-y-1">
                  <div><span className="text-blue-400">performance:</span></div>
                  <div>  <span className="text-sky-400">students_upskilled:</span> <span className="text-amber-400">12000</span></div>
                  <div>  <span className="text-sky-400">corporate_cohorts:</span> <span className="text-amber-400">45</span></div>
                  <div>  <span className="text-sky-400">trainers_certified:</span> <span className="text-amber-400">500</span></div>
                  <div><span className="text-blue-400">metrics:</span></div>
                  <div>  <span className="text-sky-400">nps_score:</span> <span className="text-emerald-400">"9.2 / 10"</span></div>
                  <div>  <span className="text-sky-400">student_pass_rate:</span> <span className="text-emerald-400">"98.4%"</span></div>
                </pre>
              )}

              {heroActiveTab === 'consultant.config' && (
                <pre className="space-y-1">
                  <div><span className="text-pink-500">[profile]</span></div>
                  <div><span className="text-sky-400">email</span> = <span className="text-emerald-400">narnejaswanth83@gmail.com</span></div>
                  <div><span className="text-sky-400">location</span> = <span className="text-emerald-400">Guntur, AP, India</span></div>
                  <div><span className="text-sky-400">phone</span> = <span className="text-emerald-400">+91 9848218418</span></div>
                  <div><span className="text-sky-400">availability</span> = <span className="text-amber-400">Open to Bootcamps & TTT</span></div>
                </pre>
              )}
            </div>

            {/* Visualizer Status Footer */}
            <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between select-none">
              <div>✓ Ln 1, Col 1</div>
              <div className="text-brand-500 font-bold">UTF-8</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE SCROLL CLIENT LOGO MARQUEE (B2B Authority Builder) */}
      {marqueeItems.length > 0 && (
        <section className="bg-slate-50/50 border-y border-slate-200 overflow-hidden py-12 select-none">
          <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Partnering EdTech Platforms & Academic Institutions
            </p>
          </div>
          <div className="relative flex items-center overflow-x-hidden">
            {/* Gradient Mask Overlays */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
            
            {/* The Rolling Marquee Wrapper */}
            <div className="animate-marquee flex items-center gap-6 py-2">
              {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
                <div
                  key={`${item._id}-${idx}`}
                  className="flex items-center justify-center flex-shrink-0"
                >
                  {item.isCollege ? (
                    <div className="flex items-center gap-3 h-14 px-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-brand-350 hover:shadow-sm transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 leading-none mb-0.5">Partner Campus</span>
                        <span className="text-slate-800 font-extrabold text-xs tracking-tight leading-tight">{item.shortName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 h-14 px-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-sky-350 hover:shadow-sm transition-all duration-300">
                      {item.logo ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="h-7 object-contain w-auto max-w-[100px] opacity-85 hover:opacity-100 transition-opacity"
                          />
                          <div className="flex flex-col text-left border-l border-slate-100 pl-2.5">
                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 leading-none mb-0.5">EdTech Partner</span>
                            <span className="text-slate-800 font-extrabold text-[11px] tracking-tight leading-tight">{item.name}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 leading-none mb-0.5">Learning Partner</span>
                            <span className="text-slate-800 font-extrabold text-xs tracking-tight leading-tight">{item.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CAPABILITIES & CAPACITY PROGRAMS (Gradients & Polished SVGs) */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="section">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <h2 className="section-title">Trainer Capabilities & Programs</h2>
            <p className="section-subtitle">
              Engineered training methodologies focused on knowledge retention, hands-on skill development, and career translation.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programs.map(({ title, subtitle, desc, highlight, icon }) => (
              <div key={title} className="card-hover p-8 group flex flex-col h-full bg-white border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="w-12 h-12 bg-brand-50 border border-brand-100 text-brand-650 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  {icon}
                </div>
                <p className="text-brand-600 text-[10px] font-extrabold uppercase tracking-widest mb-1">{subtitle}</p>
                <h3 className="font-display text-xl font-extrabold text-slate-900 mb-4">{title}</h3>
                <p className="text-slate-650 text-xs md:text-sm leading-relaxed mb-6 flex-1">{desc}</p>
                
                <div className="border-t border-slate-150 pt-4 mt-auto">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Key Deliverables:</p>
                  <p className="text-xs text-slate-800 font-bold mt-1 leading-snug">{highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SKILLS & COURSES HANDLED SECTION (Tabs Category Filter) */}
      <section id="courses" className="section py-20">
        <div className="text-center mb-12 max-w-xl mx-auto">
          <h2 className="section-title">Skills & Courses Handled</h2>
          <p className="section-subtitle">
            Interactive, high-impact modules engineered for retention and hands-on skill development.
          </p>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 select-none">
          {['All', 'Software Development', 'Security & Infrastructure', 'Cloud & Data'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white shadow-soft scale-[1.02]'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Skill Cards Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          style={{ perspective: '1200px' }}
        >
          {filteredSkills.map((skill) => (
            <Link to="/courses" key={skill._id} className="block group">
              <SkillCard
                skillName={skill.skillName}
                description={skill.description}
                topics={skill.topics || []}
                icon={skill.icon}
                image={skill.image}
                showTopics={false}
              />
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/courses" className="btn-primary inline-flex items-center gap-2 group shadow-sm">
            Explore Full Syllabi & TOC
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 5. TRAINING PROJECTS HIGHLIGHT SECTION (Polished Side-by-Side Grid) */}
      {projects.length > 0 && (
        <section className="bg-white border-y border-slate-200 py-20">
          <div className="section max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 max-w-xl mx-auto animate-slide-up">
              <h2 className="section-title">Showcase Projects & Training Experiences</h2>
              <p className="section-subtitle">
                A look at our training engagements, active bootcamp cohorts, and student feedback records.
              </p>
            </div>

            {/* 3-Column Grid of Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CLASSROOM MOMENTS & HIGHLIGHTS GALLERY (featuring real user images) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="section">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <h2 className="section-title">Classroom Moments & Highlights</h2>
            <p className="section-subtitle">
              Direct snapshots from active bootcamp cohorts, technical workshops, and group presentations across various colleges.
            </p>
          </div>

          {/* Dynamic Campus Tabs Selector */}
          <div className="flex flex-wrap gap-2.5 justify-center mb-12 select-none">
            {['All', 'TCE Gadag', 'FISAT Angamaly', 'MIT Mysore'].map((campus) => (
              <button
                key={campus}
                type="button"
                onClick={() => setMomentsCategory(campus)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  momentsCategory === campus
                    ? 'bg-brand-600 text-white shadow-soft scale-[1.02]'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {campus === 'All' ? 'All Campuses' : campus}
              </button>
            ))}
          </div>

          {/* Highlights Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classroomMoments
              .filter((m) => (momentsCategory === 'All' ? true : m.campus === momentsCategory))
              .map((moment, idx, filteredList) => {
                const isVideo = moment.type === 'video';
                return (
                  <div
                    key={moment.url}
                    onClick={() => {
                      setLightbox({ items: filteredList, index: idx });
                    }}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 cursor-pointer shadow-soft hover:shadow-elevated transition-all duration-300 border border-slate-200"
                  >
                    {isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <video
                          src={moment.url}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                          muted
                          preload="metadata"
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs shadow group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={moment.url}
                        alt={moment.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}

                    {/* Gradient Overlay & Hover Details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <span className="text-brand-400 text-[9px] font-extrabold uppercase tracking-widest">{moment.campus}</span>
                      <h4 className="text-white text-sm font-bold mt-1">{moment.title}</h4>
                      <p className="text-slate-300 text-[11px] mt-1 leading-snug">{moment.desc}</p>
                    </div>

                    {/* Visual indicators */}
                    <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow opacity-85 group-hover:opacity-100 transition-all z-20">
                      {isVideo ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="text-center mt-12">
            <Link to="/gallery" className="btn-secondary inline-flex items-center gap-2 group">
              Explore Experience Showcase Gallery
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. COHORT REVIEWS & FEEDBACK (Testimonial Quote speech bubbles) */}
      {testimonials.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-20">
          <div className="section">
            <div className="text-center mb-16 max-w-xl mx-auto">
              <h2 className="section-title">Cohort Reviews & Feedback</h2>
              <p className="section-subtitle">
                Verified feedback logs collected from engineering bootcamps, college programs, and educator workshops.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t._id}
                  className="card p-6 md:p-8 flex flex-col justify-between hover:shadow-elevated hover:border-slate-300 transition-all duration-300 bg-white relative"
                >
                  <div className="space-y-4">
                    <StarRating rating={t.rating} />
                    <p className="text-slate-650 text-xs md:text-sm italic leading-relaxed">
                      "{t.text}"
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-150 pt-4 mt-6 flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-50 border border-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {t.clientName.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 text-xs md:text-sm truncate">{t.clientName}</p>
                      {t.company && (
                        <p className="text-brand-600 text-[10px] font-bold uppercase tracking-wider truncate">
                          {t.collegeName ? `${t.collegeName} (via ${t.company})` : t.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <Link to="/testimonials" className="btn-primary inline-flex items-center gap-2 group shadow-sm">
                View All Reviews & Media
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link to="/contact" className="btn-secondary">
                Request Training Syllabus
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. GLOWING ACTION CTA BANNER */}
      <section className="section py-16 md:py-20">
        <div className="bg-slate-900 text-white rounded-3xl shadow-elevated p-10 md:p-16 text-center relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/15 rounded-full mix-blend-screen filter blur-3xl opacity-30 -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 -ml-20 -mb-20 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4 text-white leading-tight">
              Launch a High-Retention Cohort
            </h2>
            <p className="text-slate-300 text-sm md:text-base mb-8 font-medium leading-relaxed">
              Let's align on technical structures, customized syllabus timelines, or faculty training frameworks to elevate coding outcomes at your organization.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" id="cta-banner-contact" className="btn-primary !bg-white hover:!bg-brand-50 !text-slate-900 shadow-md">
                Contact Consultant
              </Link>
              <Link to="/courses" className="btn-secondary !bg-transparent !border-slate-700 !text-white hover:!bg-white/5">
                Explore Syllabi
              </Link>
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
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors z-50 shadow-md"
              aria-label="Close lightbox"
            >
              ✕
            </button>
            
            <div className="bg-slate-950 flex items-center justify-center p-4 relative aspect-video select-none min-h-[300px] md:min-h-[450px]">
              {lightbox.items && lightbox.items[lightbox.index] ? (
                <>
                  {lightbox.items[lightbox.index].type === 'video' ? (
                    <video
                      src={lightbox.items[lightbox.index].url}
                      className="max-h-[70vh] object-contain w-full h-full rounded-lg"
                      controls
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={lightbox.items[lightbox.index].url}
                      alt={lightbox.items[lightbox.index].caption || 'Training moment'}
                      className="max-h-[70vh] object-contain rounded-lg"
                    />
                  )}

                  {/* Lightbox Slider controls */}
                  {lightbox.items.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightbox(prev => ({
                            ...prev,
                            index: (prev.index - 1 + prev.items.length) % prev.items.length
                          }));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-lg shadow-lg z-50 transition-all hover:scale-105 active:scale-95"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightbox(prev => ({
                            ...prev,
                            index: (prev.index + 1) % prev.items.length
                          }));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-lg shadow-lg z-50 transition-all hover:scale-105 active:scale-95"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* Fallback if single object was passed */
                <img
                  src={lightbox.url}
                  alt={lightbox.caption || 'Training moment'}
                  className="max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-brand-50/70 to-sky-50/40 backdrop-blur-md relative">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-sky-500" />
              {lightbox.items && lightbox.items[lightbox.index] ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-brand-650 uppercase tracking-widest block mb-1">
                      {lightbox.items[lightbox.index].campus} — {lightbox.items[lightbox.index].title}
                    </span>
                    <p className="text-slate-800 text-sm font-bold leading-relaxed">
                      {lightbox.items[lightbox.index].caption}
                    </p>
                  </div>
                  {lightbox.items.length > 1 && (
                    <span className="text-xs font-extrabold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-md flex-shrink-0">
                      {lightbox.index + 1} / {lightbox.items.length}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-slate-800 text-sm font-bold leading-relaxed">{lightbox.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
