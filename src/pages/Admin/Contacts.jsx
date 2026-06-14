import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { socket } from '../../services/socket';

export default function Contacts() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const fetchSubmissions = async () => {
    const res = await api.get('/contact/submissions');
    setSubmissions(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();

    socket.on('new_contact', fetchSubmissions);
    socket.on('contacts_changed', fetchSubmissions);

    return () => {
      socket.off('new_contact', fetchSubmissions);
      socket.off('contacts_changed', fetchSubmissions);
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await api.put(`/contact/submissions/${id}/read`);
      setSubmissions((prev) => prev.map((s) => s._id === id ? res.data : s));
      toast.success('Marked as read!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      await api.delete(`/contact/submissions/${id}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
      toast.success('Submission deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = filter === 'all'
    ? submissions
    : filter === 'unread'
      ? submissions.filter((s) => !s.read)
      : submissions.filter((s) => s.read);

  const unreadCount = submissions.filter((s) => !s.read).length;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="border-b border-surface-200 pb-4">
        <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight flex items-center gap-3">
          Contact Submissions
          {unreadCount > 0 && (
            <span className="badge badge-red !text-xs !px-3 !py-1">
              {unreadCount} unread
            </span>
          )}
        </h1>
        <p className="text-surface-500 mt-1 text-sm">Review, mark read, or respond to inquiry messages submitted by visitors.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
              filter === f
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-white border border-surface-200 text-surface-650 hover:bg-surface-50'
            }`}
          >
            {f} ({f === 'all' ? submissions.length : f === 'unread' ? unreadCount : submissions.length - unreadCount})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
          <div className="w-12 h-12 bg-surface-50 border border-surface-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
            </svg>
          </div>
          <p className="text-surface-800 font-bold mb-1">No messages found</p>
          <p className="text-surface-500 text-sm">There are no {filter !== 'all' ? filter : ''} messages currently matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((submission) => (
            <div
              key={submission._id}
              className={`card p-6 bg-white border transition-all duration-250 ${
                !submission.read
                  ? 'border-brand-300 bg-brand-50/20 shadow-soft'
                  : 'border-surface-200 shadow-soft'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-bold text-surface-900 text-base">{submission.name}</span>
                    {!submission.read && (
                      <span className="badge badge-blue !text-[10px] uppercase font-bold tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${submission.email}`}
                    className="text-brand-600 text-sm font-semibold hover:underline"
                  >
                    {submission.email}
                  </a>
                  <p className="text-surface-400 text-xs mt-1.5 font-medium">{formatDate(submission.createdAt)}</p>

                  {/* Message Content */}
                  <div
                    className={`mt-4 bg-surface-50 border border-surface-200 rounded-lg p-4 overflow-hidden transition-all duration-305 ${
                      expanded === submission._id ? 'max-h-none' : 'max-h-16'
                    }`}
                  >
                    <p className="text-surface-700 text-sm whitespace-pre-line leading-relaxed">{submission.message}</p>
                  </div>
                  {submission.message.length > 150 && (
                    <button
                      onClick={() => setExpanded(expanded === submission._id ? null : submission._id)}
                      className="text-brand-600 hover:text-brand-700 text-xs font-bold mt-2 flex items-center gap-1"
                    >
                      {expanded === submission._id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 self-end md:self-start">
                  {!submission.read && (
                    <button
                      id={`mark-read-${submission._id}`}
                      onClick={() => handleMarkRead(submission._id)}
                      className="btn-success btn-sm !py-1 text-xs"
                    >
                      Mark Read
                    </button>
                  )}
                  <a
                    href={`mailto:${submission.email}?subject=Re: Your training inquiry`}
                    className="btn-secondary btn-sm !py-1 text-xs text-brand-600 border-brand-200 hover:bg-brand-50 text-center flex items-center justify-center"
                  >
                    Reply
                  </a>
                  <button
                    id={`delete-submission-${submission._id}`}
                    onClick={() => handleDelete(submission._id)}
                    className="btn-secondary btn-sm !py-1 text-xs text-red-650 border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
