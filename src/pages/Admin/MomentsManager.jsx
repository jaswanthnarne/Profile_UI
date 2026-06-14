import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { socket } from '../../services/socket';

const emptyForm = {
  title: '',
  campus: '',
  caption: '',
  desc: '',
  order: 0
};

export default function MomentsManager() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef();

  const fetchMoments = async () => {
    try {
      const res = await api.get('/moments');
      setMoments(res.data);
    } catch (err) {
      toast.error('Failed to load classroom highlights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();

    socket.on('moments_changed', fetchMoments);

    return () => {
      socket.off('moments_changed', fetchMoments);
    };
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds 20MB limit');
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setPreview('');
    setEditingId(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleEdit = (moment) => {
    setForm({
      title: moment.title,
      campus: moment.campus,
      caption: moment.caption || '',
      desc: moment.desc || '',
      order: moment.order || 0
    });
    setPreview(moment.url || '');
    setEditingId(moment._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.campus.trim()) return toast.error('Campus name is required');
    if (!editingId && !file) return toast.error('An image or video file is required');

    setSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (file) formData.append('image', file); // Field name expected in multer upload.single('image')

    try {
      if (editingId) {
        const res = await api.put(`/moments/${editingId}`, form);
        setMoments((prev) => prev.map((m) => (m._id === editingId ? res.data : m)));
        toast.success('Moment updated successfully!');
      } else {
        const res = await api.post('/moments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMoments((prev) => [res.data, ...prev]);
        toast.success('Moment created successfully!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save moment details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete the classroom highlight "${title}"? This will also remove the file from Cloudinary.`)) return;
    try {
      await api.delete(`/moments/${id}`);
      setMoments((prev) => prev.filter((m) => m._id !== id));
      toast.success('Moment deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete moment');
    }
  };

  // Get unique campuses list for helper tag suggestions
  const existingCampuses = Array.from(new Set(moments.map(m => m.campus))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-surface-200 pb-4 gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Classroom Moments & Highlights</h1>
          <p className="text-surface-500 mt-1 text-sm">Configure dynamic snapshots, lab recordings, and presentations displayed on the homepage highlights gallery.</p>
        </div>
        <button
          id="add-moment-btn"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`btn-sm font-bold flex items-center gap-1.5 transition-colors ${
            showForm ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          {showForm ? '✕ Close Form' : '+ Add Highlight Moment'}
        </button>
      </div>

      {/* Moment Form */}
      {showForm && (
        <div className="card p-6 bg-white border border-surface-200 shadow-soft animate-slide-up">
          <h2 className="font-display text-lg font-bold text-surface-900 mb-5 border-b border-surface-100 pb-3">
            {editingId ? 'Edit Moment details' : 'Upload New Classroom Highlight'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Moment Title / Session Topic *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Hands-on coding exercises, Mini project presentations"
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Campus / College name *</label>
                <input
                  type="text"
                  required
                  value={form.campus}
                  onChange={(e) => setForm({ ...form, campus: e.target.value })}
                  placeholder="e.g. TCE Gadag, FISAT Angamaly, MIT Mysore"
                  className="input mb-1"
                />
                {/* Suggestions row */}
                {existingCampuses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                    <span className="text-[10px] text-surface-450 font-bold uppercase">Quick Fill:</span>
                    {existingCampuses.map((camp) => (
                      <button
                        key={camp}
                        type="button"
                        onClick={() => setForm({ ...form, campus: camp })}
                        className="px-2 py-0.5 bg-surface-50 hover:bg-brand-50 border border-surface-200 hover:border-brand-300 text-[10px] text-surface-700 hover:text-brand-700 font-semibold rounded transition-all"
                      >
                        {camp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Caption / Tagline</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="e.g. Students demonstrating web designs"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>

                {!editingId && (
                  <div>
                    <label className="input-label">Moment file (Image/Video) *</label>
                    <input
                      type="file"
                      required
                      accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleFileChange}
                      ref={fileRef}
                      className="input file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="input-label">Description / Hover snippet details</label>
              <textarea
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                rows={3}
                placeholder="Write a brief background regarding what students accomplished during this moment..."
                className="input resize-none"
              />
            </div>

            {preview && (
              <div className="flex flex-col gap-2 p-3 bg-surface-50 border border-surface-200 rounded-xl max-w-sm">
                <span className="text-[10px] text-surface-450 font-bold uppercase tracking-wider">File Preview</span>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-surface-200">
                  {file && file.type.startsWith('video/') ? (
                    <video src={preview} className="w-full h-full object-cover" controls muted />
                  ) : (
                    <img src={preview} alt="Moment Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-surface-100 border border-surface-250 text-surface-700 font-bold text-sm rounded-lg hover:bg-surface-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Saving Highlight...' : editingId ? 'Update Moment' : 'Create Moment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights List */}
      <div>
        <h2 className="font-display text-xl font-bold text-surface-900 mb-4 flex items-center gap-2">
          📸 Active Classroom Moments Gallery
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : moments.length === 0 ? (
          <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
            <p className="text-surface-800 font-bold mb-1">No moments uploaded yet</p>
            <p className="text-surface-500 text-sm">Click the Add button above to upload campus highlight moments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moments.map((mom) => {
              const isVideo = mom.type === 'video';
              return (
                <div
                  key={mom._id}
                  className="card bg-white border border-surface-200 shadow-soft overflow-hidden flex flex-col justify-between hover:border-brand-200 transition-all duration-300 group"
                >
                  <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                    {isVideo ? (
                      <video src={mom.url} className="w-full h-full object-cover" muted preload="metadata" />
                    ) : (
                      <img src={mom.url} alt={mom.title} className="w-full h-full object-cover" />
                    )}

                    {/* Badge Indicator */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow ${
                        isVideo ? 'bg-sky-600 text-white' : 'bg-brand-600 text-white'
                      }`}>
                        {mom.type}
                      </span>
                    </div>

                    {/* Campus tag badge */}
                    <div className="absolute bottom-3 left-3 z-10 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold">
                      📍 {mom.campus}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-display text-sm font-extrabold text-surface-900 line-clamp-1">{mom.title}</h4>
                        <span className="text-[10px] font-extrabold text-slate-400">Order: {mom.order}</span>
                      </div>
                      
                      {mom.caption && (
                        <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-lg">
                          <span className="w-1 h-1 rounded-full bg-brand-500 flex-shrink-0" />
                          <p className="text-[9.5px] text-brand-700 leading-normal line-clamp-1 italic font-semibold">
                            "{mom.caption}"
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed">{mom.desc || 'No description summary added.'}</p>
                    </div>

                    <div className="pt-3 border-t border-surface-150 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(mom)}
                        className="flex-1 btn-secondary btn-xs py-1.5 font-bold"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(mom._id, mom.title)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 hover:text-red-700 font-bold text-xs rounded-lg transition-colors"
                        title="Delete Moment"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
