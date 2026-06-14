import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog').then((res) => {
      setPosts(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="pt-20 bg-surface-50 min-h-screen">
      <section className="section">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="section-title text-4xl md:text-5xl font-extrabold tracking-tight">
            Trainer Publications & <span className="text-brand-600">Insights</span>
          </h1>
          <p className="section-subtitle mx-auto">
            Actionable methodologies, curriculum guides, and instructional notes on EdTech delivery and TTT principles.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No Posts View */}
        {!loading && posts.length === 0 && (
          <div className="text-center bg-white border border-surface-200 rounded-xl p-16 shadow-soft max-w-md mx-auto">
            <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-3.5-3.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-surface-800 font-bold mb-1">No articles published</p>
            <p className="text-surface-500 text-sm">Check back soon for insights on active learning methodologies.</p>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post.slug}`}
              id={`blog-card-${post._id}`}
              className="bg-white border border-surface-200 rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full"
            >
              {post.coverImage ? (
                <div className="overflow-hidden h-48 bg-surface-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="h-48 bg-brand-50 border-b border-surface-100 flex items-center justify-center text-brand-600">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
                  {formatDate(post.createdAt)}
                </span>
                <h2 className="font-display text-xl font-bold text-surface-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors duration-200">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-surface-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {post.summary}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-1.5 text-brand-600 text-sm font-semibold">
                  Read Article <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
