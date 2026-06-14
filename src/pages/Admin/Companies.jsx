import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const emptyForm = { name: '', description: '', website: '', order: 0 };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef();

  const fetchCompanies = async () => {
    const res = await api.get('/companies');
    setCompanies(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setLogoFile(null);
    setLogoPreview('');
    setEditingId(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleEdit = (company) => {
    setForm({
      name: company.name,
      description: company.description || '',
      website: company.website || '',
      order: company.order || 0,
    });
    setLogoPreview(company.logo || '');
    setEditingId(company._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (logoFile) formData.append('logo', logoFile);

    try {
      if (editingId) {
        const res = await api.put(`/companies/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCompanies((prev) => prev.map((c) => c._id === editingId ? res.data : c));
        toast.success('Company updated successfully!');
      } else {
        const res = await api.post('/companies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCompanies((prev) => [...prev, res.data]);
        toast.success('Company created successfully!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its gallery images?`)) return;
    try {
      await api.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      toast.success('Company deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting company');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between border-b border-surface-200 pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Companies & Clients</h1>
          <p className="text-surface-500 mt-1 text-sm">Manage the list of client logos and descriptions that appear on the homepage.</p>
        </div>
        <button
          id="add-company-btn"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={showForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
        >
          {showForm ? '✕ Cancel' : '+ Add Company'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 bg-white border border-surface-200 shadow-soft animate-slide-up">
          <h2 className="font-display text-lg font-bold text-surface-900 mb-5 border-b border-surface-100 pb-3">
            {editingId ? 'Edit Company Information' : 'Add New Client Profile'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4" id="company-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Company Name *</label>
                <input
                  id="company-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Google, Microsoft, IIT Delhi"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Website URL</label>
                <input
                  id="company-website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://example.com"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea
                id="company-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Brief description of training deliverables or engagements..."
                className="input resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Display Order (Sorting)</label>
                <input
                  id="company-order"
                  type="number"
                  value={form.order}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Logo Image</label>
                <input
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileRef}
                  className="input file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
            </div>
            {logoPreview && (
              <div className="flex items-center gap-3 bg-surface-50 border border-surface-200 p-3 rounded-lg w-fit">
                <img src={logoPreview} alt="Preview" className="w-14 h-14 object-contain rounded-lg border border-surface-200 p-1 bg-white" />
                <span className="text-surface-500 text-xs font-semibold">Client Logo Preview</span>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button id="company-submit" type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving changes...' : editingId ? 'Update Profile' : 'Add Company'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Companies List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
          <div className="w-12 h-12 bg-surface-50 border border-surface-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-surface-800 font-bold mb-1">No companies found</p>
          <p className="text-surface-500 text-sm">Add partner organizations or client companies to showcase on the landing page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="card p-5 flex flex-col justify-between gap-4 bg-white border border-surface-200 shadow-soft">
              <div className="flex items-start gap-4">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-16 h-16 object-contain rounded-xl border border-surface-200 p-1 bg-surface-50 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center text-xl font-bold text-brand-600 flex-shrink-0">
                    {company.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-surface-900 truncate">{company.name}</h3>
                  {company.description && (
                    <p className="text-surface-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{company.description}</p>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      className="text-brand-600 text-xs font-semibold hover:text-brand-700 mt-2 block truncate">
                      Visit Website
                    </a>
                  )}
                  <p className="text-surface-400 text-[10px] font-bold uppercase tracking-wider mt-2.5">Priority Sort Order: {company.order}</p>
                </div>
              </div>
              <div className="flex gap-2.5 border-t border-surface-100 pt-3 mt-1">
                <button
                  id={`edit-company-${company._id}`}
                  onClick={() => handleEdit(company)}
                  className="flex-1 btn-secondary btn-sm text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                >
                  Edit
                </button>
                <button
                  id={`delete-company-${company._id}`}
                  onClick={() => handleDelete(company._id, company.name)}
                  className="flex-1 btn-secondary btn-sm text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
