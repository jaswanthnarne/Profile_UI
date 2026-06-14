import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';

const StatCard = ({ icon, label, value, colorClass, to }) => (
  <Link to={to} className="card-hover p-6 bg-white hover:border-brand-300 group block border border-surface-200 rounded-xl shadow-soft transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-surface-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className={`font-display text-4xl font-extrabold mt-2 ${colorClass}`}>{value}</p>
      </div>
      <span className="w-12 h-12 bg-surface-50 flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform duration-200">
        {icon}
      </span>
    </div>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      api.get('/contact/stats')
        .then((res) => setStats(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchStats();

    socket.on('new_contact', fetchStats);
    socket.on('contacts_changed', fetchStats);
    socket.on('courses_changed', fetchStats);
    socket.on('testimonials_changed', fetchStats);
    socket.on('blog_changed', fetchStats);

    return () => {
      socket.off('new_contact', fetchStats);
      socket.off('contacts_changed', fetchStats);
      socket.off('courses_changed', fetchStats);
      socket.off('testimonials_changed', fetchStats);
      socket.off('blog_changed', fetchStats);
    };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    {
      label: 'Companies',
      value: stats?.companies ?? 0,
      colorClass: 'text-brand-600',
      to: '/console/admin/companies',
      icon: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      label: 'Gallery Showcase',
      value: stats?.images ?? 0,
      colorClass: 'text-sky-600',
      to: '/console/admin/gallery',
      icon: (
        <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2.25 2.25 0 013.182 0L16 16m-2-2l1.586-1.586a2.25 2.25 0 013.182 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Testimonials',
      value: stats?.testimonials ?? 0,
      colorClass: 'text-amber-600',
      to: '/console/admin/testimonials',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    },
    {
      label: 'Blog Posts',
      value: stats?.posts ?? 0,
      colorClass: 'text-emerald-600',
      to: '/console/admin/blog',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      label: 'Unread Messages',
      value: stats?.unread ?? 0,
      colorClass: 'text-red-600',
      to: '/console/admin/contacts',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const quickActions = [
    {
      label: 'Add Company Logo',
      to: '/console/admin/companies',
      icon: (
        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Upload Showcase',
      to: '/console/admin/gallery',
      icon: (
        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      )
    },
    {
      label: 'Write Blog Post',
      to: '/console/admin/blog',
      icon: (
        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      label: 'View Messages',
      to: '/console/admin/contacts',
      icon: (
        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-surface-500 mt-1 text-sm font-medium">Welcome back, Administrator. Real-time updates and metrics for your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-8 bg-white border border-surface-200 rounded-xl shadow-soft">
        <h2 className="font-display text-xl font-bold text-surface-900 mb-6">Quick Management Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(({ label, to, icon }) => (
            <Link key={label} to={to} className="btn-secondary text-center py-5 text-sm flex flex-col items-center gap-2.5 rounded-xl hover:border-brand-500 hover:text-brand-700 hover:shadow-soft">
              <span className="mb-1">{icon}</span>
              <span className="font-bold text-surface-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      {stats?.unread > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <p className="font-bold text-red-800">
                  New Unread Contact Submissions
                </p>
                <p className="text-red-700 text-sm mt-0.5 font-medium">
                  You have <span className="font-bold">{stats.unread} unread message{stats.unread > 1 ? 's' : ''}</span> waiting for review.
                </p>
              </div>
            </div>
            <Link to="/console/admin/contacts" className="btn-danger btn-sm whitespace-nowrap text-red-700 hover:bg-red-200/50">
              View Messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
