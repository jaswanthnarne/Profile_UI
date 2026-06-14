import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const emptyForm = {
  skillName: '',
  description: '',
  icon: 'cpu',
  image: '',
  order: 0,
  topics: []
};

const iconOptions = [
  { value: 'cpu', label: 'CPU / Microchip' },
  { value: 'code', label: 'Code Brackets' },
  { value: 'network', label: 'Network / Globe' },
  { value: 'lock', label: 'Shield / Lock' },
  { value: 'database', label: 'Database / Server' },
  { value: 'globe', label: 'Globe / Internet' }
];

const imageOptions = [
  { value: '', label: 'None (Icon Only)' },
  { value: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80', label: 'Cyber Security Cover' },
  { value: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', label: 'Cloud Computing Cover' },
  { value: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', label: 'Networking Cover' },
  { value: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', label: 'Web Development Cover' },
  { value: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', label: 'Python Programming Cover' },
  { value: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', label: 'Java Programming Cover' },
  { value: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80', label: 'Data Science Cover' }
];

export default function Courses() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [newTopic, setNewTopic] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/courses');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setNewTopic('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setForm({
      skillName: cat.skillName,
      description: cat.description || '',
      icon: cat.icon || 'cpu',
      image: cat.image || '',
      order: cat.order || 0,
      topics: cat.topics || []
    });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.skillName.trim()) return toast.error('Skill Name is required');
    if (form.topics.length === 0) return toast.error('Add at least one topic');

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/courses/${editingId}`, form);
        setCategories((prev) => prev.map((cat) => cat._id === editingId ? res.data : cat));
        toast.success('Skill updated!');
      } else {
        const res = await api.post('/courses', form);
        setCategories((prev) => [...prev, res.data]);
        toast.success('Skill created!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success('Skill deleted!');
    } catch (err) {
      toast.error('Failed to delete skill');
    }
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    if (form.topics.includes(newTopic.trim())) return toast.error('Topic already exists');
    setForm({ ...form, topics: [...form.topics, newTopic.trim()] });
    setNewTopic('');
  };

  const handleRemoveTopic = (idx) => {
    setForm({ ...form, topics: form.topics.filter((_, i) => i !== idx) });
  };

  const handleMoveTopic = (index, direction) => {
    const newTopics = [...form.topics];
    const target = index + direction;
    if (target < 0 || target >= newTopics.length) return;
    [newTopics[index], newTopics[target]] = [newTopics[target], newTopics[index]];
    setForm({ ...form, topics: newTopics });
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between border-b border-surface-200 pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Courses Handled</h1>
          <p className="text-surface-500 mt-1 text-sm">Manage individual skills and their syllabus topics displayed on the home page.</p>
        </div>
        <button
          id="add-course-btn"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={showForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
        >
          {showForm ? '✕ Cancel' : '+ Add Skill'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 bg-white border border-surface-200 shadow-soft animate-slide-up">
          <h2 className="font-display text-lg font-bold text-surface-900 mb-5 border-b border-surface-100 pb-3">
            {editingId ? 'Edit Skill Details' : 'Add New Skill'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5" id="course-category-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Skill Name *</label>
                <input
                  id="course-skill-name"
                  type="text"
                  value={form.skillName}
                  onChange={(e) => setForm({ ...form, skillName: e.target.value })}
                  required
                  placeholder="e.g. Cyber Security"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Display Order</label>
                <input
                  id="course-order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Short Description</label>
              <input
                id="course-description"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Ethical hacking, penetration testing, and security frameworks"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="input-label">Icon</label>
                <div className="relative">
                  <select
                    id="course-icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="select w-full"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-surface-500">▼</div>
                </div>
              </div>
              <div>
                <label className="input-label">Cover Image Option</label>
                <div className="relative">
                  <select
                    id="course-image-select"
                    value={imageOptions.some(opt => opt.value === form.image) ? form.image : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setForm({ ...form, image: e.target.value });
                      }
                    }}
                    className="select w-full"
                  >
                    {imageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    {!imageOptions.some(opt => opt.value === form.image) && form.image && (
                      <option value="custom">Custom URL</option>
                    )}
                    {imageOptions.some(opt => opt.value === form.image) && (
                      <option value="custom">Use custom URL...</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-surface-500">▼</div>
                </div>
              </div>
              <div>
                <label className="input-label">Cover Image URL (Optional)</label>
                <input
                  id="course-image"
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Add Topics Covered *</label>
              <div className="flex gap-2">
                <input
                  id="course-topic-input"
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(); } }}
                  placeholder="e.g. Network Security & Firewalls"
                  className="input flex-1"
                />
                <button type="button" onClick={handleAddTopic} className="btn-primary">+ Add</button>
              </div>
            </div>

            {/* Topics List */}
            <div>
              <p className="text-surface-750 font-bold text-sm mb-2.5">Topics ({form.topics.length}):</p>
              {form.topics.length === 0 ? (
                <p className="text-surface-400 text-xs italic bg-surface-50 border border-surface-150 rounded-lg p-4 text-center">
                  No topics added yet.
                </p>
              ) : (
                <div className="border border-surface-200 rounded-xl overflow-hidden divide-y divide-surface-150 max-h-60 overflow-y-auto bg-surface-50">
                  {form.topics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between py-2.5 px-4 bg-white hover:bg-surface-50/50">
                      <span className="text-surface-800 text-sm font-medium">{topic}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" disabled={index === 0} onClick={() => handleMoveTopic(index, -1)} className="w-7 h-7 flex items-center justify-center border border-surface-200 rounded bg-white hover:bg-surface-50 text-surface-500 disabled:opacity-30" title="Move up">▲</button>
                        <button type="button" disabled={index === form.topics.length - 1} onClick={() => handleMoveTopic(index, 1)} className="w-7 h-7 flex items-center justify-center border border-surface-200 rounded bg-white hover:bg-surface-50 text-surface-500 disabled:opacity-30" title="Move down">▼</button>
                        <button type="button" onClick={() => handleRemoveTopic(index)} className="w-7 h-7 flex items-center justify-center border border-red-200 text-red-650 hover:bg-red-50 rounded bg-white" title="Remove">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button id="course-submit-btn" type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : editingId ? 'Update Skill' : 'Create Skill'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
          <div className="w-12 h-12 bg-surface-50 border border-surface-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-surface-800 font-bold mb-1">No skills registered</p>
          <p className="text-surface-500 text-sm">Add skills and their syllabi to feature them on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="card flex flex-col justify-between bg-white border border-surface-200 shadow-soft overflow-hidden">
              <div>
                <div className="bg-brand-700 text-white p-5">
                  <span className="text-[10px] tracking-widest text-brand-100 font-bold uppercase">Skill</span>
                  <h3 className="font-display text-xl font-extrabold tracking-tight mt-0.5">{cat.skillName}</h3>
                  {cat.description && <p className="text-xs text-brand-100 font-medium mt-1 truncate">{cat.description}</p>}
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-2.5">Topics Covered</span>
                  <ul className="space-y-1.5">
                    {cat.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-surface-700 text-xs font-semibold">
                        <span className="text-brand-500 font-bold mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t border-surface-150 p-4 bg-surface-50 flex gap-2 justify-end">
                <button id={`edit-course-${cat._id}`} onClick={() => handleEdit(cat)} className="btn-secondary btn-sm !py-1 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50">Edit</button>
                <button id={`delete-course-${cat._id}`} onClick={() => handleDelete(cat._id)} className="btn-secondary btn-sm !py-1 text-xs text-red-650 hover:text-red-700 hover:bg-red-50 border-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
