'use client';

import React, { useState } from 'react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program_interest: 'Sunday Swim',
    message: '',
  });

  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please provide your name, email, and inquiry message.',
      });
      return;
    }

    setStatus({ type: 'loading' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          message: data.message || 'Thank you! Your enquiry has been received.',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          program_interest: 'Sunday Swim',
          message: '',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to submit inquiry. Please try again.',
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again or reach out by phone.',
      });
    }
  };

  return (
    <section id="contact" className="sec bg-foam py-20 md:py-28">
      <div className="wrap">
        {/* Section Header */}
        <div className="sec-head max-w-[640px] mb-12">
          <p className="eyebrow">Get In Touch</p>
          <h2 className="font-extrabold uppercase text-3xl md:text-5xl text-deep mt-1">
            Join The Program
          </h2>
          <div className="h-[3px] w-16 bg-aqua mt-2"></div>
          <p className="text-muted mt-3 text-base md:text-lg">
            Reserve a Sunday Swim spot, register for upcoming camp intensives, or ask about gear and team sizing.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Info Rows */}
          <div className="flex flex-col gap-4">
            <a
              href="mailto:triplefinsswimpro@pointglobalmarketing.com"
              className="bg-white border border-line p-5 rounded-sm flex items-start gap-4 hover:border-aqua transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-foam flex items-center justify-center text-aqua-deep font-bold flex-shrink-0 group-hover:bg-aqua group-hover:text-deep transition-colors">
                @
              </div>
              <div>
                <span className="font-display font-semibold uppercase tracking-wider text-xs text-muted block">
                  Email
                </span>
                <span className="font-semibold text-deep text-base break-all">
                  triplefinsswimpro@pointglobalmarketing.com
                </span>
              </div>
            </a>

            <a
              href="tel:+18768017907"
              className="bg-white border border-line p-5 rounded-sm flex items-start gap-4 hover:border-aqua transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-foam flex items-center justify-center text-aqua-deep font-bold flex-shrink-0 group-hover:bg-aqua group-hover:text-deep transition-colors">
                ✆
              </div>
              <div>
                <span className="font-display font-semibold uppercase tracking-wider text-xs text-muted block">
                  Phone &amp; WhatsApp
                </span>
                <span className="font-semibold text-deep text-base">
                  +1 (876) 801-7907
                </span>
              </div>
            </a>

            <a
              href="https://instagram.com/triplefins_swim"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-line p-5 rounded-sm flex items-start gap-4 hover:border-aqua transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-foam flex items-center justify-center text-aqua-deep font-bold flex-shrink-0 group-hover:bg-aqua group-hover:text-deep transition-colors">
                ◎
              </div>
              <div>
                <span className="font-display font-semibold uppercase tracking-wider text-xs text-muted block">
                  Instagram
                </span>
                <span className="font-semibold text-deep text-base">
                  @triplefins_swim
                </span>
              </div>
            </a>

            <div className="bg-white border border-line p-5 rounded-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-foam flex items-center justify-center text-aqua-deep font-bold flex-shrink-0">
                ▽
              </div>
              <div>
                <span className="font-display font-semibold uppercase tracking-wider text-xs text-muted block">
                  Training Facility
                </span>
                <span className="font-semibold text-deep text-base leading-snug block">
                  Russell&apos;s Paradise, Yallahs Main St, Yallahs, St. Thomas, Jamaica
                </span>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white border border-line p-6 md:p-8 card-cut shadow-sm">
            <p className="eyebrow text-aqua-deep mb-2">Send an inquiry</p>
            <h3 className="font-extrabold uppercase text-2xl text-deep mb-4">
              Direct Coach Contact
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="enqName"
                  className="font-display font-bold uppercase tracking-wider text-xs text-deep block mb-1"
                >
                  Your Name *
                </label>
                <input
                  id="enqName"
                  type="text"
                  required
                  placeholder="e.g. Marcus Campbell"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-foam border border-line rounded-sm text-deep focus:outline-none focus:border-aqua"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="enqEmail"
                    className="font-display font-bold uppercase tracking-wider text-xs text-deep block mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    id="enqEmail"
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-foam border border-line rounded-sm text-deep focus:outline-none focus:border-aqua"
                  />
                </div>

                <div>
                  <label
                    htmlFor="enqPhone"
                    className="font-display font-bold uppercase tracking-wider text-xs text-deep block mb-1"
                  >
                    Phone / WhatsApp
                  </label>
                  <input
                    id="enqPhone"
                    type="tel"
                    placeholder="+1 (876) ..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-foam border border-line rounded-sm text-deep focus:outline-none focus:border-aqua"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="enqProgram"
                  className="font-display font-bold uppercase tracking-wider text-xs text-deep block mb-1"
                >
                  Program Interest
                </label>
                <select
                  id="enqProgram"
                  value={formData.program_interest}
                  onChange={(e) =>
                    setFormData({ ...formData, program_interest: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-foam border border-line rounded-sm text-deep focus:outline-none focus:border-aqua"
                >
                  <option value="Sunday Swim">Sunday Swim Sessions</option>
                  <option value="Summer Intensive">Summer Swim Camp</option>
                  <option value="Private Coaching">Private Stroke Coaching</option>
                  <option value="Merch Store">Merchandise &amp; Gear</option>
                  <option value="General Question">General Inquiry</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="enqMsg"
                  className="font-display font-bold uppercase tracking-wider text-xs text-deep block mb-1"
                >
                  Message *
                </label>
                <textarea
                  id="enqMsg"
                  rows={3}
                  required
                  placeholder="I'd like to ask about registration dates, swimmer age requirements, or scheduling..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-foam border border-line rounded-sm text-deep focus:outline-none focus:border-aqua resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="btn btn-sun mt-2 justify-center py-3"
              >
                {status.type === 'loading' ? 'Sending...' : 'Send Enquiry'}
              </button>

              {/* Form Feedback Banner */}
              {status.type === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-sm">
                  {status.message}
                </div>
              )}
              {status.type === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-sm rounded-sm">
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
