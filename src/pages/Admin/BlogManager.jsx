import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import api from '../../services/api';

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  const btn = (action, label, activeCheck) => (
    <button
      type="button"
      onClick={action}
      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
        activeCheck ? 'bg-brand-600 text-white shadow-soft' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-surface-200 bg-surface-50 rounded-t-xl">
      {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleStrike().run(), 'S̶', editor.isActive('strike'))}
      {btn(() => editor.chain().focus().toggleCode().run(), '</>', editor.isActive('code'))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1', editor.isActive('heading', { level: 1 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleBulletList().run(), '• List', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. List', editor.isActive('orderedList'))}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), '❝', editor.isActive('blockquote'))}
      {btn(() => editor.chain().focus().toggleCodeBlock().run(), 'Code Block', editor.isActive('codeBlock'))}
      {btn(() => editor.chain().focus().setHorizontalRule().run(), '—', false)}
      {btn(() => editor.chain().focus().undo().run(), '↩', false)}
      {btn(() => editor.chain().focus().redo().run(), '↪', false)}
    </div>
  );
};

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[220px] focus:outline-none text-surface-800 bg-white rounded-b-xl',
      },
    },
  });

  const fetchPosts = async () => {
    try {
      const res = await api.get('/blog?all=true');
      setPosts(res.data);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const resetForm = () => {
    setTitle('');
    setPublished(false);
    setCoverFile(null);
    setCoverPreview('');
    setEditingId(null);
    setShowEditor(false);
    editor?.commands.setContent('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleEdit = async (post) => {
    setTitle(post.title);
    setPublished(post.published);
    setCoverPreview(post.coverImage || '');
    setEditingId(post._id);
    setShowEditor(true);

    // Load full content
    const res = await api.get(`/blog/admin/${post._id}`);
    editor?.commands.setContent(res.data.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    const content = editor?.getHTML() || '';
    if (!content || content === '<p></p>') return toast.error('Content is required');

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('published', published);
    if (coverFile) formData.append('coverImage', coverFile);

    try {
      if (editingId) {
        const res = await api.put(`/blog/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPosts((prev) => prev.map((p) => p._id === editingId ? res.data : p));
        toast.success('Post updated!');
      } else {
        const res = await api.post('/blog', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPosts((prev) => [res.data, ...prev]);
        toast.success('Post created!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/blog/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Post deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const togglePublish = async (post) => {
    const formData = new FormData();
    formData.append('title', post.title);
    formData.append('published', !post.published);
    try {
      const res = await api.put(`/blog/${post._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPosts((prev) => prev.map((p) => p._id === post._id ? res.data : p));
      toast.success(`Post ${!post.published ? 'published' : 'unpublished'}!`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between border-b border-surface-200 pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Blog Manager</h1>
          <p className="text-surface-500 mt-1 text-sm">Create, edit, and publish blog articles with a rich text editor.</p>
        </div>
        <button id="add-blog-btn" onClick={() => { resetForm(); setShowEditor(!showEditor); }} className={showEditor ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}>
          {showEditor ? '✕ Cancel' : '+ New Post'}
        </button>
      </div>

      {/* Editor Form */}
      {showEditor && (
        <div className="card p-6 bg-white border border-surface-200 shadow-soft">
          <h2 className="font-display text-xl font-bold text-surface-900 mb-5 border-b border-surface-100 pb-3">
            {editingId ? 'Edit Article' : 'New Article Draft'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5" id="blog-form">
            <div>
              <label className="input-label">Title *</label>
              <input
                id="blog-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Write a descriptive title..."
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Cover Image</label>
              <input
                id="blog-cover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
                }}
                ref={fileRef}
                className="input file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              {coverPreview && (
                <div className="mt-3 relative inline-block">
                  <img src={coverPreview} alt="Cover Preview" className="h-32 rounded-lg border border-surface-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(''); if(fileRef.current) fileRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Content *</label>
              <div className="rounded-xl border border-surface-200 overflow-hidden shadow-soft">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} className="min-h-[250px]" />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-50 border border-surface-200 p-4 rounded-xl">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id="blog-published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-surface-300 rounded focus:ring-brand-500 accent-brand-600"
                />
                <span className="text-surface-700 font-semibold text-sm">Publish immediately (visible to public)</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button id="blog-submit" type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving changes...' : editingId ? 'Update Post' : 'Create & Publish'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-surface-200 shadow-soft">
          <div className="w-12 h-12 bg-surface-50 border border-surface-150 rounded-xl flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-surface-800 font-bold mb-1">No articles found</p>
          <p className="text-surface-500 text-sm">Start writing blog drafts or guides for your readers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-surface-200 shadow-soft">
              <div className="flex items-start md:items-center gap-4">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-20 h-14 object-cover rounded-lg border border-surface-200 flex-shrink-0" />
                ) : (
                  <div className="w-20 h-14 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-surface-900 truncate max-w-md">{post.title}</h3>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-surface-500 text-xs font-semibold">{formatDate(post.createdAt)}</span>
                    <span className="text-surface-300">•</span>
                    <span className={`badge ${post.published ? 'badge-green' : 'badge-gray'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 self-end md:self-center">
                <button
                  id={`toggle-publish-${post._id}`}
                  onClick={() => togglePublish(post)}
                  className={`btn-secondary btn-sm !py-1 ${post.published ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  id={`edit-blog-${post._id}`}
                  onClick={() => handleEdit(post)}
                  className="btn-secondary btn-sm !py-1 text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                >
                  Edit
                </button>
                <button
                  id={`delete-blog-${post._id}`}
                  onClick={() => handleDelete(post._id)}
                  className="btn-secondary btn-sm !py-1 text-red-650 hover:text-red-700 hover:bg-red-50 border-red-200"
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
