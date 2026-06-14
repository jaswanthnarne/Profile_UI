import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { socket } from '../../services/socket';

const emptyProjectForm = {
  projectName: '',
  companyId: '',
  collegeName: '',
  startDate: '',
  endDate: '',
  description: '',
  contentsCovered: [],
  experienceRating: 5,
  feedbackSummary: '',
  studentTestimonials: []
};

export default function GalleryManager() {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState(emptyProjectForm);
  const [newTopic, setNewTopic] = useState('');
  const [newTestimonial, setNewTestimonial] = useState('');

  // Media Manager Modal State
  const [selectedProjectForMedia, setSelectedProjectForMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // image | video | youtube
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileRef = useRef();

  const fetchData = async () => {
    try {
      const [companiesRes, projectsRes] = await Promise.all([
        api.get('/companies'),
        api.get('/gallery'), // gets projects
      ]);
      setCompanies(companiesRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      toast.error('Failed to load showcase data');
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

  // Sync selected project in media modal when projects list refreshes
  useEffect(() => {
    if (selectedProjectForMedia) {
      const updated = projects.find((p) => p._id === selectedProjectForMedia._id);
      setSelectedProjectForMedia(updated || null);
    }
  }, [projects]);

  const handleEditProject = (project) => {
    setForm({
      projectName: project.projectName,
      companyId: project.companyId?._id || project.companyId || '',
      collegeName: project.collegeName || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      description: project.description || '',
      contentsCovered: project.contentsCovered || [],
      experienceRating: project.experienceRating || 5,
      feedbackSummary: project.feedbackSummary || '',
      studentTestimonials: project.studentTestimonials || []
    });
    setEditingId(project._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetProjectForm = () => {
    setForm(emptyProjectForm);
    setNewTopic('');
    setNewTestimonial('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    if (!form.projectName.trim()) return toast.error('Project Name is required');
    if (!form.companyId) return toast.error('Please select a company/client');

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/gallery/${editingId}`, form);
        setProjects((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
        toast.success('Training Project updated successfully!');
      } else {
        const res = await api.post('/gallery', form);
        setProjects((prev) => [...prev, res.data]);
        toast.success('Training Project created successfully!');
      }
      resetProjectForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save training project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? ALL uploaded videos/images on Cloudinary will be destroyed.')) return;
    try {
      await api.delete(`/gallery/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project and all associated media deleted.');
      if (selectedProjectForMedia?._id === id) {
        setSelectedProjectForMedia(null);
      }
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  // Syllabus tag helper functions
  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    if (form.contentsCovered.includes(newTopic.trim())) return toast.error('Topic already added');
    setForm({ ...form, contentsCovered: [...form.contentsCovered, newTopic.trim()] });
    setNewTopic('');
  };

  const handleRemoveTopic = (idx) => {
    setForm({ ...form, contentsCovered: form.contentsCovered.filter((_, i) => i !== idx) });
  };

  // Testimonial helper functions
  const handleAddTestimonial = () => {
    if (!newTestimonial.trim()) return;
    setForm({ ...form, studentTestimonials: [...form.studentTestimonials, newTestimonial.trim()] });
    setNewTestimonial('');
  };

  const handleRemoveTestimonial = (idx) => {
    setForm({ ...form, studentTestimonials: form.studentTestimonials.filter((_, i) => i !== idx) });
  };

  // Media Manager helper functions
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 20 * 1024 * 1024) {
        toast.error('File exceeds 20MB limit');
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (!selectedProjectForMedia) return;

    if (mediaType === 'youtube') {
      if (!youtubeUrl.trim()) return toast.error('YouTube URL is required');
      if (!getYoutubeId(youtubeUrl)) return toast.error('Invalid YouTube URL format');
    } else {
      if (!file) return toast.error(`Please select a ${mediaType} file`);
    }

    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('mediaType', mediaType);
    formData.append('caption', caption.trim());

    if (mediaType === 'youtube') {
      formData.append('youtubeUrl', youtubeUrl.trim());
    } else {
      formData.append('image', file); // Multer field is 'image'
    }

    try {
      const res = await api.post(`/gallery/${selectedProjectForMedia._id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The socket event will trigger a refresh, but we also update local modal preview
      setSelectedProjectForMedia(res.data);
      toast.success('Media item added!');
      setFile(null);
      setPreview('');
      setYoutubeUrl('');
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Delete this media item from Cloudinary storage?')) return;
    try {
      const res = await api.delete(`/gallery/${selectedProjectForMedia._id}/media/${mediaId}`);
      setSelectedProjectForMedia(res.data);
      toast.success('Media item deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete media item');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-surface-200 pb-4 gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Showcase Project Manager</h1>
          <p className="text-surface-500 mt-1 text-sm">Create training experiences, add student reviews, and upload class media (images, videos, YouTube).</p>
        </div>
        <button
          id="toggle-project-form-btn"
          onClick={() => {
            if (showForm) resetProjectForm();
            else setShowForm(true);
          }}
          className={`btn-sm font-bold flex items-center gap-1.5 transition-colors ${
            showForm ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          {showForm ? (
            <>
              <span>✕</span> Close Form
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Training Project
            </>
          )}
        </button>
      </div>

      {/* Project Form Panel */}
      {showForm && (
        <div className="card p-6 bg-white border border-surface-200 shadow-soft animate-slide-up">
          <h2 className="font-display text-lg font-bold text-surface-900 mb-5 flex items-center gap-2 border-b border-surface-100 pb-3">
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {editingId ? 'Edit Project Details' : 'Create New Training Project'}
          </h2>

          <form onSubmit={handleCreateOrUpdateProject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="input-label">Project / Batch Name *</label>
                <input
                  id="project-form-name"
                  type="text"
                  required
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  placeholder="e.g. Core Java Boot camp 2026"
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Client / Partner Company *</label>
                <div className="relative">
                  <select
                    id="project-form-company"
                    required
                    value={form.companyId}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="select w-full"
                  >
                    <option value="">-- Choose Company --</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-surface-500">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">College / Location (Optional)</label>
                <input
                  id="project-form-college"
                  type="text"
                  value={form.collegeName}
                  onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                  placeholder="e.g. BVRIT, Hyderabad"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="input-label">Start Date</label>
                <input
                  id="project-form-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">End Date</label>
                <input
                  id="project-form-end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Student Feedback Rating (1.0 to 5.0) *</label>
                <input
                  id="project-form-rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required
                  value={form.experienceRating}
                  onChange={(e) => setForm({ ...form, experienceRating: parseFloat(e.target.value) || 5 })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Project Overview Description</label>
                <textarea
                  id="project-form-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Write a summary about the training engagement, details of topics covered, overall cohort performance, etc."
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="input-label">Student Feedback / Cohort Review Summary</label>
                <textarea
                  id="project-form-feedback"
                  rows={4}
                  value={form.feedbackSummary}
                  onChange={(e) => setForm({ ...form, feedbackSummary: e.target.value })}
                  placeholder="e.g. Strong engagement. 95% cleared final mock evaluations. Positive remarks on collections & OOP sessions."
                  className="input resize-none"
                />
              </div>
            </div>

            {/* Syllabus Contents Covered */}
            <div className="card p-4 bg-surface-50 border border-surface-200">
              <label className="input-label mb-2">Topics & Syllabus Covered</label>
              <div className="flex gap-2 mb-3">
                <input
                  id="project-form-new-topic"
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(); } }}
                  placeholder="e.g. Exception Handling, Multithreading, JDBC"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors"
                >
                  Add Topic
                </button>
              </div>

              {form.contentsCovered.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.contentsCovered.map((topic, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-surface-250 text-surface-700 text-xs font-bold rounded-lg shadow-sm"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(idx)}
                        className="text-red-500 hover:text-red-700 font-extrabold w-4 h-4 flex items-center justify-center rounded-full hover:bg-surface-100"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-surface-450 italic">No topics added. Enter a syllabus topic above and click Add.</p>
              )}
            </div>

            {/* Student Testimonials */}
            <div className="card p-4 bg-surface-50 border border-surface-200">
              <label className="input-label mb-2">Student Testimonial Quotes</label>
              <div className="flex gap-2 mb-3">
                <input
                  id="project-form-new-testimonial"
                  type="text"
                  value={newTestimonial}
                  onChange={(e) => setNewTestimonial(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTestimonial(); } }}
                  placeholder="e.g. 'The practical coding examples helped me clear my corporate test easily!'"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors"
                >
                  Add Quote
                </button>
              </div>

              {form.studentTestimonials.length > 0 ? (
                <div className="space-y-2">
                  {form.studentTestimonials.map((quote, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white border border-surface-250 rounded-lg shadow-sm text-xs text-surface-700 italic"
                    >
                      <span className="flex-1">"{quote}"</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestimonial(idx)}
                        className="text-red-500 hover:text-red-700 font-bold ml-3 px-1.5 py-0.5 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-surface-450 italic">No student quotes added. Enter a quote above and click Add.</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-surface-100 pt-4">
              <button
                type="button"
                onClick={resetProjectForm}
                className="px-5 py-2.5 bg-surface-100 border border-surface-250 text-surface-700 font-bold text-sm rounded-lg hover:bg-surface-200 transition-colors"
              >
                Cancel
              </button>
              <button
                id="project-submit-btn"
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Project...
                  </span>
                ) : editingId ? 'Update Project Details' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-surface-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Active Training Projects & Portfolios
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
            <div className="w-12 h-12 bg-surface-50 border border-surface-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-surface-800 font-bold mb-1">No Projects Found</p>
            <p className="text-surface-500 text-sm">Get started by creating your first showcase project using the form above.</p>
          </div>
        ) : (
          /* Grid of Showcase Projects */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const mediaCount = project.media?.length || 0;
              return (
                <div
                  key={project._id}
                  className="card p-5 bg-white border border-surface-200 shadow-soft flex flex-col justify-between hover:border-brand-200 hover:shadow-elevated transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Project Header (Company logo/details) */}
                    <div className="flex items-start justify-between border-b border-surface-100 pb-3">
                      <div className="flex items-center gap-3">
                        {project.companyId?.logo ? (
                          <img
                            src={project.companyId.logo}
                            alt={project.companyId.name}
                            className="w-10 h-10 object-contain rounded-lg border border-surface-200 p-0.5 bg-surface-50"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-brand-50 border border-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold text-sm">
                            {project.companyId?.name?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-display text-md font-bold text-surface-900 leading-tight">
                            {project.projectName}
                          </h3>
                          <p className="text-[11px] text-surface-450 font-bold uppercase tracking-wider">
                            Partner: {project.companyId?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 border border-amber-100 rounded">
                          ⭐ {project.experienceRating?.toFixed(1)}
                        </span>
                        {project.collegeName && (
                          <span className="text-[10px] text-brand-600 font-extrabold tracking-tight mt-1">
                            {project.collegeName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-3 gap-2 py-1 bg-surface-50 border border-surface-100 rounded-lg text-center">
                      <div className="border-r border-surface-200">
                        <span className="block text-xs font-extrabold text-surface-800">{mediaCount}</span>
                        <span className="text-[9px] font-bold text-surface-450 uppercase">Media Files</span>
                      </div>
                      <div className="border-r border-surface-200">
                        <span className="block text-xs font-extrabold text-surface-800">
                          {project.contentsCovered?.length || 0}
                        </span>
                        <span className="text-[9px] font-bold text-surface-450 uppercase">Topics</span>
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-surface-800">
                          {project.studentTestimonials?.length || 0}
                        </span>
                        <span className="text-[9px] font-bold text-surface-450 uppercase">Quotes</span>
                      </div>
                    </div>

                    {/* Description snippet */}
                    <p className="text-xs text-surface-600 leading-relaxed line-clamp-3 italic">
                      {project.description || 'No project description added.'}
                    </p>

                    {/* Quick Media Previews */}
                    {mediaCount > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {project.media.map((item, idx) => {
                          const isVideo = item.mediaType === 'video';
                          const isYoutube = item.mediaType === 'youtube';
                          return (
                            <div
                              key={item._id || idx}
                              className="relative w-8 h-8 rounded border border-surface-200 bg-black overflow-hidden aspect-square flex-shrink-0"
                            >
                              {isVideo ? (
                                <video src={item.url} className="w-full h-full object-cover" muted />
                              ) : isYoutube ? (
                                <img
                                  src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                                  className="w-full h-full object-cover"
                                  alt="YT thumb"
                                />
                              ) : (
                                <img src={item.url} className="w-full h-full object-cover" alt="thumb" />
                              )}
                              {/* Media Type indicator dot */}
                              <span
                                className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-white ${
                                  isVideo ? 'bg-sky-500' : isYoutube ? 'bg-red-500' : 'bg-brand-500'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-2 mt-5 pt-3 border-t border-surface-100">
                    <button
                      id={`manage-media-${project._id}`}
                      onClick={() => {
                        setSelectedProjectForMedia(project);
                        setMediaType('image');
                        setFile(null);
                        setPreview('');
                        setYoutubeUrl('');
                        setCaption('');
                      }}
                      className="flex-1 btn-success btn-sm font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      Media ({mediaCount})
                    </button>
                    <button
                      id={`edit-project-${project._id}`}
                      onClick={() => handleEditProject(project)}
                      className="btn-secondary btn-sm font-bold flex items-center justify-center gap-1"
                      title="Edit Details"
                    >
                      Edit Details
                    </button>
                    <button
                      id={`delete-project-${project._id}`}
                      onClick={() => handleDeleteProject(project._id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 hover:text-red-700 font-bold text-xs rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Media Manager Modal */}
      {selectedProjectForMedia && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedProjectForMedia(null)}
        >
          <div
            className="bg-white rounded-2xl border border-surface-200 max-w-4xl w-full shadow-float overflow-hidden flex flex-col relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-150 flex items-center justify-between bg-surface-900 text-white">
              <div>
                <h3 className="font-display text-lg font-bold">
                  Manage Media Showcase
                </h3>
                <p className="text-[11px] text-surface-400 font-semibold mt-0.5">
                  Uploading files for: <span className="text-brand-400 font-bold">{selectedProjectForMedia.projectName}</span>
                </p>
              </div>
              <button
                id="close-media-modal-btn"
                onClick={() => setSelectedProjectForMedia(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-md flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Upload Form Pane (Col 5) */}
                <div className="md:col-span-5 space-y-4">
                  <h4 className="font-display text-xs uppercase font-extrabold text-surface-450 tracking-wider">
                    Add New Media
                  </h4>

                    <form onSubmit={handleAddMedia} className="space-y-4">
                      {/* Media Type Selector */}
                      <div>
                        <label className="input-label">Media Type</label>
                        <div className="flex flex-col gap-2 mt-2">
                          {[
                            { value: 'image', label: 'Image File Upload' },
                            { value: 'video', label: 'Video File (MP4, Max 20MB)' },
                            { value: 'youtube', label: 'YouTube Video Link' },
                          ].map((type) => (
                            <label
                              key={type.value}
                              className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg cursor-pointer text-xs font-bold transition-all ${
                                mediaType === type.value
                                  ? 'bg-brand-50 border-brand-300 text-brand-700'
                                  : 'bg-white border-surface-200 text-surface-700 hover:bg-surface-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="modalMediaType"
                                value={type.value}
                                checked={mediaType === type.value}
                                onChange={(e) => {
                                  setMediaType(e.target.value);
                                  setFile(null);
                                  setPreview('');
                                  setYoutubeUrl('');
                                  if (fileRef.current) fileRef.current.value = '';
                                }}
                                className="text-brand-650 focus:ring-brand-500 h-4.5 w-4.5 border-surface-300"
                              />
                              {type.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* URL or File upload input */}
                      {mediaType === 'youtube' ? (
                        <div>
                          <label className="input-label">YouTube Video Link</label>
                          <input
                            id="modal-youtube-url"
                            type="text"
                            required
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="e.g. https://www.youtube.com/watch?v=..."
                            className="input text-xs"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="input-label">Select File *</label>
                          <input
                            id="modal-media-file"
                            type="file"
                            required
                            accept={
                              mediaType === 'video'
                                ? 'video/mp4,video/webm,video/ogg,video/quicktime'
                                : 'image/*'
                            }
                            onChange={handleFileChange}
                            ref={fileRef}
                            className="input file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 text-xs"
                          />
                        </div>
                      )}

                      {/* Caption */}
                      <div>
                        <label className="input-label">Caption / Description</label>
                        <input
                          id="modal-media-caption"
                          type="text"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="e.g. Students working on hands-on project"
                          className="input text-xs"
                        />
                      </div>

                      {/* File & Youtube previews */}
                      {preview && mediaType !== 'youtube' && (
                        <div className="relative border border-surface-200 rounded-xl overflow-hidden aspect-video bg-black max-w-[200px]">
                          {mediaType === 'video' ? (
                            <video src={preview} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPreview('');
                              setFile(null);
                              if (fileRef.current) fileRef.current.value = '';
                            }}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-650 hover:bg-red-700 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {mediaType === 'youtube' && getYoutubeId(youtubeUrl) && (
                        <div className="relative border border-surface-200 rounded-xl overflow-hidden aspect-video bg-black max-w-[200px]">
                          <img
                            src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`}
                            alt="YT Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white shadow">
                              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setYoutubeUrl('')}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-650 hover:bg-red-700 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <button
                        id="modal-upload-btn"
                        type="submit"
                        disabled={uploadingMedia}
                        className="w-full btn-primary btn-sm mt-2 font-bold"
                      >
                        {uploadingMedia ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </span>
                        ) : (
                          'Add Media to Project'
                        )}
                      </button>
                    </form>
                </div>

                {/* Media Listing Grid Pane (Col 7) */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-150 pb-2">
                    <h4 className="font-display text-xs uppercase font-extrabold text-surface-450 tracking-wider">
                      Current Media Items
                    </h4>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-md">
                      {selectedProjectForMedia.media.length} Media Items
                    </span>
                  </div>

                  {selectedProjectForMedia.media.length === 0 ? (
                    <div className="p-8 text-center bg-surface-50 border border-surface-200 border-dashed rounded-xl">
                      <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-450">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2.25 2.25 0 013.182 0L16 16m-2-2l1.586-1.586a2.25 2.25 0 013.182 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-surface-500 font-semibold">No media items exist for this project.</p>
                      <p className="text-[10px] text-surface-400 mt-1">Upload images or videos or enter a YouTube URL to populate the showcase.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                      {selectedProjectForMedia.media.map((item) => {
                        const isVideo = item.mediaType === 'video';
                        const isYoutube = item.mediaType === 'youtube';
                        return (
                          <div
                            key={item._id}
                            className="border border-surface-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-surface-50 group relative"
                          >
                            <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                              {isVideo ? (
                                <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                              ) : isYoutube ? (
                                <img
                                  src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                                  alt="YT thumb"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img src={item.url} alt="Showcase Media" className="w-full h-full object-cover" />
                              )}

                              {/* Media Type Badge */}
                              <div className="absolute top-2 left-2 z-10">
                                <span
                                  className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow ${
                                    isVideo
                                      ? 'bg-sky-600 text-white'
                                      : isYoutube
                                        ? 'bg-red-600 text-white'
                                        : 'bg-brand-600 text-white'
                                  }`}
                                >
                                  {item.mediaType}
                                </span>
                              </div>

                              {/* Play overlays for videos */}
                              {(isVideo || isYoutube) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                  <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs">
                                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {/* Hover delete panel */}
                              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-25">
                                <button
                                  id={`delete-media-item-${item._id}`}
                                  type="button"
                                  onClick={() => handleDeleteMedia(item._id)}
                                  className="px-3 py-1.5 bg-red-600 rounded text-white text-xs font-bold hover:bg-red-700 shadow-md transition-colors"
                                >
                                  Delete Item
                                </button>
                              </div>
                            </div>

                            {/* Caption body */}
                            <div className="p-2.5 flex-1 bg-white border-t border-surface-150">
                              {item.caption ? (
                                <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 px-2 py-1 rounded-lg">
                                  <span className="w-1 h-1 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
                                  <p className="text-[10px] text-brand-700 leading-normal line-clamp-1 italic font-semibold">
                                    {item.caption}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[10px] text-surface-400 font-medium">No caption added</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-surface-150 flex justify-end bg-surface-50">
              <button
                id="close-media-modal-footer-btn"
                type="button"
                onClick={() => setSelectedProjectForMedia(null)}
                className="px-4 py-2 bg-white border border-surface-250 text-surface-700 text-xs font-bold rounded-lg hover:bg-surface-100 transition-colors"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
