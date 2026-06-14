import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/blog/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center pt-20">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center pt-20 text-center px-4">
      <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center text-surface-400 mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="font-display text-3xl font-bold text-surface-900 mb-2">Post Not Found</h1>
      <p className="text-surface-500 mb-6 max-w-sm">This blog post doesn't exist or has been unpublished by the administrator.</p>
      <Link to="/blog" className="btn-primary">← Back to Blog</Link>
    </div>
  );

  return (
    <div className="pt-20 bg-surface-50 min-h-screen pb-20">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900/40 via-surface-900/10 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-semibold mb-6 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Blog
        </Link>

        {/* Article */}
        <article className="bg-white border border-surface-200 rounded-2xl shadow-soft p-6 md:p-12">
          <header className="mb-8 border-b border-surface-100 pb-6">
            <p className="text-brand-600 text-sm font-bold uppercase tracking-wider mb-2">
              {formatDate(post.createdAt)}
              {post.updatedAt !== post.createdAt && (
                <span className="text-surface-400 font-medium normal-case ml-3">· Updated {formatDate(post.updatedAt)}</span>
              )}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-surface-900 leading-tight">
              {post.title}
            </h1>
          </header>

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* CTA */}
        <div className="bg-white border border-surface-200 rounded-xl mt-8 p-8 text-center shadow-soft">
          <h3 className="font-display text-2xl font-bold text-surface-900 mb-2">
            Interested in Curriculum Outlines?
          </h3>
          <p className="text-surface-650 mb-6 max-w-md mx-auto">
            Discuss bootcamp programs, corporate syllabuses, or pedagogic strategies.
          </p>
          <Link to="/contact" className="btn-primary">Get In Touch</Link>
        </div>
      </div>
    </div>
  );
}
