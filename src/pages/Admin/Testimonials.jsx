import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const emptyForm = {
  clientName: '', company: '', collegeName: '', text: '', rating: 5,
  date: new Date().toISOString().split('T')[0], isApproved: false,
  mediaType: 'none', youtubeUrl: '', file: null
};

const StarSelect = ({ value, onChange }) => (
  <div className="flex gap-1.5 pt-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-3xl transition-transform hover:scale-110 ${star <= value ? 'text-amber-400' : 'text-surface-200'}`}
      >
        ★
      </button>
    ))}
  </div>
);

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    const res = await api.get('/testimonials');
    setTestimonials(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (t) => {
    setForm({
      clientName: t.clientName,
      company: t.company || '',
      collegeName: t.collegeName || '',
      text: t.text,
      rating: t.rating,
      date: new Date(t.date).toISOString().split('T')[0],
      isApproved: t.isApproved,
      mediaType: t.mediaType || 'none',
      youtubeUrl: t.mediaType === 'youtube' ? t.mediaUrl : '',
      file: null
    });
    setEditingId(t._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('clientName', form.clientName);
      formData.append('company', form.company);
      formData.append('collegeName', form.collegeName);
      formData.append('text', form.text);
      formData.append('rating', form.rating);
      formData.append('date', form.date);
      formData.append('isApproved', form.isApproved);
      formData.append('mediaType', form.mediaType);
      if (form.mediaType === 'youtube') {
        formData.append('youtubeUrl', form.youtubeUrl);
      } else if (form.file) {
        formData.append('file', form.file);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingId) {
        const res = await api.put(`/testimonials/${editingId}`, formData, config);
        setTestimonials((prev) => prev.map((t) => t._id === editingId ? res.data : t));
        toast.success('Testimonial updated!');
      } else {
        const res = await api.post('/testimonials', formData, config);
        setTestimonials((prev) => [...prev, res.data]);
        toast.success('Testimonial created!');
      }
      resetForm();
    } catch (err) {
      toast.error('Failed to save testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
      toast.success('Testimonial deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleApprove = async (t) => {
    try {
      const res = await api.put(`/testimonials/${t._id}`, { ...t, isApproved: !t.isApproved });
      setTestimonials((prev) => prev.map((item) => item._id === t._id ? res.data : item));
      toast.success(`Testimonial ${!t.isApproved ? 'approved' : 'unapproved'}!`);
    } catch {
      toast.error('Failed to update approval');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between border-b border-surface-200 pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Testimonials Manager</h1>
          <p className="text-surface-500 mt-1 text-sm">Review client reviews and toggle approval to show them in the landing page.</p>
        </div>
        <button id="add-testimonial-btn" onClick={() => { resetForm(); setShowForm(!showForm); }} className={showForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}>
          {showForm ? '✕ Cancel' : '+ Add Testimonial'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 bg-white border border-surface-200 shadow-soft animate-slide-up">
          <h2 className="font-display text-lg font-bold text-surface-900 mb-5 border-b border-surface-100 pb-3">
            {editingId ? 'Edit Testimonial Details' : 'Add New Client Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5" id="testimonial-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Client Name *</label>
                <input
                  id="testimonial-client-name"
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  required
                  placeholder="e.g. John Doe"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Company / Agency (Upskilled via)</label>
                <input
                  id="testimonial-company"
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Ethnotech"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">College Name (Optional)</label>
                <input
                  id="testimonial-college"
                  type="text"
                  value={form.collegeName}
                  onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                  placeholder="e.g. BVRIT"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Testimonial Text *</label>
              <textarea
                id="testimonial-text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
                rows={3}
                placeholder="What feedback did they share about the training session..."
                className="input resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="input-label">Rating Select</label>
                <StarSelect value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </div>
              <div>
                <label className="input-label">Feedback Date</label>
                <input
                  id="testimonial-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isApproved}
                    onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                    className="w-4 h-4 text-brand-600 border-surface-300 rounded focus:ring-brand-500 accent-brand-600"
                  />
                  <span className="text-surface-700 font-semibold text-sm">Approve immediately</span>
                </label>
              </div>
            </div>

            {/* Media Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-4">
              <p className="text-xs font-extrabold text-slate-750 uppercase tracking-wider">Attachment Media</p>
              
              <div className="flex flex-wrap gap-4 items-center">
                {['none', 'file', 'youtube'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 capitalize">
                    <input
                      type="radio"
                      name="mediaType"
                      value={type}
                      checked={
                        type === 'file' 
                          ? (form.mediaType === 'image' || form.mediaType === 'video' || form.mediaType === 'file')
                          : form.mediaType === type
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, mediaType: val === 'file' ? 'image' : val });
                      }}
                      className="text-brand-650 focus:ring-brand-500 accent-brand-600"
                    />
                    {type === 'file' ? 'Upload Image / Video' : type === 'none' ? 'No Attachment' : 'YouTube Link'}
                  </label>
                ))}
              </div>

              {(form.mediaType === 'image' || form.mediaType === 'video') && (
                <div className="space-y-2">
                  <label className="input-label">Upload File (Max 20MB)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                    className="file-input block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                  {form.file && (
                    <p className="text-[10px] text-brand-600 font-bold">Selected: {form.file.name}</p>
                  )}
                </div>
              )}

              {form.mediaType === 'youtube' && (
                <div className="space-y-2">
                  <label className="input-label">YouTube Video URL</label>
                  <input
                    type="url"
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button id="testimonial-submit" type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
          <div className="w-12 h-12 bg-surface-50 border border-surface-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.253.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.72c-.783-.558-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-surface-800 font-bold mb-1">No testimonials yet</p>
          <p className="text-surface-500 text-sm">Register reviews received from corporate trainees or team managers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className={`card p-6 bg-white border transition-all duration-200 shadow-soft ${
                t.isApproved ? 'border-brand-200 bg-brand-50/10' : 'border-surface-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <span className="font-bold text-surface-900">{t.clientName}</span>
                    {t.company && <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">via {t.company}</span>}
                    {t.collegeName && <span className="text-surface-500 text-xs font-bold uppercase tracking-wider">at {t.collegeName}</span>}
                    <span className={`badge ${t.isApproved ? 'badge-green' : 'badge-yellow'}`}>
                      {t.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={s <= t.rating ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                  </div>
                  <p className="text-surface-700 text-sm italic leading-relaxed">"{t.text}"</p>
                  
                  {/* Media Preview in List */}
                  {t.mediaType && t.mediaType !== 'none' && (
                    <div className="mt-4 max-w-xs border border-surface-200 rounded-lg overflow-hidden bg-black aspect-video relative flex items-center justify-center">
                      {t.mediaType === 'video' ? (
                        <video src={t.mediaUrl} className="w-full h-full object-cover" controls muted playsInline />
                      ) : t.mediaType === 'youtube' ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${t.youtubeId}`}
                          className="w-full h-full border-0"
                          title={t.clientName}
                          allowFullScreen
                        />
                      ) : (
                        <img src={t.mediaUrl} alt={t.clientName} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                        {t.mediaType}
                      </span>
                    </div>
                  )}

                  <p className="text-surface-400 text-xs mt-3 font-semibold">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2.5 flex-shrink-0 self-end md:self-start">
                  <button
                    id={`approve-testimonial-${t._id}`}
                    onClick={() => toggleApprove(t)}
                    className={`btn-secondary btn-sm !py-1 text-xs ${t.isApproved ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}
                  >
                    {t.isApproved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    id={`edit-testimonial-${t._id}`}
                    onClick={() => handleEdit(t)}
                    className="btn-secondary btn-sm !py-1 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                  >
                    Edit
                  </button>
                  <button
                    id={`delete-testimonial-${t._id}`}
                    onClick={() => handleDelete(t._id)}
                    className="btn-secondary btn-sm !py-1 text-xs text-red-650 hover:text-red-700 hover:bg-red-50 border-red-200"
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
