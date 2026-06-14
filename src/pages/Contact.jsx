import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent successfully!');
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    {
      icon: (
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email Address',
      value: 'narnejaswanth83@gmail.com'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Phone Number',
      value: '+91 98482 18418'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Location Base',
      value: 'Guntur, Andhra Pradesh, India'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Response Time',
      value: 'Within 24 business hours'
    }
  ];

  return (
    <div className="pt-20 bg-surface-50 min-h-screen">
      <section className="section">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="section-title text-4xl md:text-5xl font-extrabold tracking-tight">
            Initiate a Training <span className="text-brand-600">Consultation</span>
          </h1>
          <p className="section-subtitle mx-auto">
            Discuss bootcamp engagements, corporate workshops, or Train-the-Trainer coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Contact Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-8 bg-white shadow-soft">
              <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">Contact Channels</h2>
              <div className="space-y-6">
                {contactItems.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-103 transition-transform duration-200">
                      {icon}
                    </div>
                    <div>
                      <p className="text-surface-500 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-surface-800 font-bold text-sm md:text-base">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-8 bg-white shadow-soft">
              <h3 className="font-display text-lg font-bold text-surface-900 mb-4">Training Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Software Engineering Bootcamps',
                  'Corporate Technical Workshops',
                  'Train-the-Trainer (TTT)',
                  'Pedagogic Framework Design',
                  'Placement Prep Mentoring',
                  'Public Speaking & Delivery',
                  'Team Synergy Seminars'
                ].map((area) => (
                  <span key={area} className="badge badge-blue">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="card p-8 bg-white shadow-soft">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-surface-900 mb-2">Message Received</h3>
                  <p className="text-surface-650 mb-6 max-w-sm mx-auto">
                    Thank you. Your message has been submitted successfully. I will review your training specifications and get in touch within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold text-surface-900 mb-6">Send an Inquiry</h2>
                  <form onSubmit={handleSubmit} className="space-y-5" id="contact-form">
                    <div>
                      <label className="input-label" htmlFor="contact-name">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Jaswanth Narne"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="contact-email">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. jaswanth@example.com"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="contact-message">
                        Training Specifications <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Please elaborate on your target audience (students, corporates, trainers), cohort size, scheduling expectations, etc."
                        className="input resize-none"
                      />
                    </div>
                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending Inquiries...
                        </span>
                      ) : (
                        'Submit Inquiry'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
