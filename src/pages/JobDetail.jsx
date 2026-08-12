import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Banknote,
  Eye,
  Briefcase,
  User,
  Mail,
  Download,
  ChevronRight,
  Check,
  FileText,
  X,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  ExternalLink,
  FileBadge
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobsApi';
import { savedJobsApi } from '../api/savedJobsApi';
import { applicationsApi } from '../api/applicationsApi';
import { alertsApi } from '../api/alertsApi';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { role, user } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [companyJobs, setCompanyJobs] = useState([]);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ senderName: '', senderEmail: '', senderPhone: '', message: '' });
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactErrors, setContactErrors] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContactForm(prev => ({
        ...prev,
        senderName: user.name || '',
        senderEmail: user.email || '',
        senderPhone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (showContactModal) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [showContactModal]);

  useEffect(() => {
    const fetchJobDetail = async () => {
      setIsLoading(true);
      try {
        const res = await jobsApi.getJobById(id);
        if (res.success && res.job) {
          setJob(res.job);
          try {
            const savedRes = await savedJobsApi.getSavedJobs();
            if (savedRes.success) setIsSaved(savedRes.savedJobs.some(item => item.job && String(item.job._id) === String(res.job._id)));
          } catch (e) { console.error(e); }
          try {
            const appRes = await applicationsApi.getApplications();
            if (appRes.success) setHasApplied(appRes.applications.some(item => item.job && String(item.job._id) === String(res.job._id)));
          } catch (e) { console.error(e); }
          try {
            const cjRes = await jobsApi.getJobs({ search: res.job.company });
            if (cjRes.success) setCompanyJobs(cjRes.jobs.filter(j => String(j._id) !== String(res.job._id)));
          } catch (e) { console.error(e); }
        }
      } catch (err) { console.error('Failed to load job:', err); }
      finally { setIsLoading(false); }
    };
    if (id) fetchJobDetail();
  }, [id]);

  if (isLoading) return (
    <div className="jd-loading-screen">
      <div className="jd-loading-spinner">
        <Loader2 size={40} className="jd-spin" />
        <p>Loading job details...</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="job-not-found-container container section">
      <div className="not-found-card">
        <h2>Job Not Found</h2>
        <p>This listing may have expired or been removed.</p>
        <Link to="/jobs" className="btn-back">Back to All Jobs</Link>
      </div>
    </div>
  );

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message); setToastType(type); setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const companyName = job.employer?.companyName || job.company || 'Unnamed Company';
  const salaryDisplay = job.salaryText || (job.salary ? `LKR ${Number(job.salary).toLocaleString()}` : 'Negotiable');

  const handleApply = async () => {
    if (hasApplied) return;
    try {
      const res = await applicationsApi.apply(job._id, 'I am interested in this job vacancy.');
      if (res.success) { setHasApplied(true); triggerToast('Application submitted!'); }
    } catch (err) { triggerToast(err.message || 'Failed to apply.', 'error'); }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) { await savedJobsApi.unsaveJob(job._id); setIsSaved(false); triggerToast('Removed from shortlist.'); }
      else { await savedJobsApi.saveJob(job._id); setIsSaved(true); triggerToast('Added to shortlist!'); }
      window.dispatchEvent(new Event('jobzoneSavedJobsChanged'));
    } catch (err) { triggerToast(err.message || 'Error.', 'error'); }
  };

  const handleEmailJob = async () => {
    if (isEmailing) return;
    const recipientEmail = user?.email;
    if (!recipientEmail) { triggerToast('Please log in to email this job.', 'error'); return; }
    setIsEmailing(true);
    try {
      const res = await alertsApi.emailJob(id, { email: recipientEmail });
      triggerToast(res.success ? `Job emailed to ${recipientEmail}!` : 'Could not send email.', res.success ? 'success' : 'error');
    } catch (err) { triggerToast(err.message || 'Error sending email.', 'error'); }
    finally { setIsEmailing(false); }
  };

  const handleDownloadPDF = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = 0;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 45, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('JOB', margin, 22);
      doc.setTextColor(245, 158, 11);
      doc.text('ZONE', margin + 22, 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Job Details Report', margin, 32);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageW - margin - 50, 32);
      y = 60;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(job.title, contentW);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 8 + 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(99, 102, 241);
      doc.text('@' + companyName, margin, y);
      y += 10;

      doc.setFillColor(219, 234, 254);
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(9);
      const badge = '  ' + (job.type || 'Full-time').toUpperCase() + '  ';
      doc.roundedRect(margin, y, doc.getTextWidth(badge) + 4, 7, 2, 2, 'F');
      doc.text(badge, margin + 2, y + 5);
      y += 14;

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      const metaItems = [
        { label: 'Location', value: job.location },
        { label: 'Salary', value: salaryDisplay },
        { label: 'Deadline', value: job.deadline || 'Open' },
        { label: 'Experience', value: job.experience || 'Not specified' },
        { label: 'Gender', value: job.gender || 'Any' },
        { label: 'Positions', value: String(job.noOfPositions || 1) },
      ];
      const colW = contentW / 2;
      metaItems.forEach((item, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = margin + col * colW, rowY = y + row * 14;
        doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.setFontSize(9);
        doc.text(item.label, x, rowY);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42); doc.setFontSize(10);
        doc.text(item.value, x, rowY + 5);
      });
      y += Math.ceil(metaItems.length / 2) * 14 + 8;

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 23, 42);
      doc.text('Job Description', margin, y); y += 8;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(job.description || '', contentW);
      descLines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y); y += 5.5;
      });
      y += 6;

      if (job.skills && job.skills.length > 0) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 23, 42);
        doc.text('Required Skills', margin, y); y += 8;
        let skillX = margin;
        job.skills.forEach(skill => {
          const sw = doc.getTextWidth(skill) + 10;
          if (skillX + sw > pageW - margin) { skillX = margin; y += 10; }
          doc.setFillColor(239, 246, 255); doc.setDrawColor(191, 219, 254);
          doc.roundedRect(skillX, y - 5, sw, 8, 2, 2, 'FD');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 64, 175);
          doc.text(skill, skillX + 5, y);
          skillX += sw + 4;
        });
        y += 16;
      }

      if (job.contactPerson || job.contactNumber || job.companyEmail) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setDrawColor(226, 232, 240); doc.line(margin, y, pageW - margin, y); y += 8;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 23, 42);
        doc.text('Contact Information', margin, y); y += 8;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
        if (job.contactPerson) { doc.text('Contact: ' + job.contactPerson, margin, y); y += 6; }
        if (job.contactNumber) { doc.text('Phone: ' + job.contactNumber, margin, y); y += 6; }
        if (job.companyEmail) { doc.text('Email: ' + job.companyEmail, margin, y); y += 6; }
        if (job.companyAddress) { doc.text('Address: ' + job.companyAddress, margin, y); y += 6; }
      }

      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8); doc.setTextColor(148, 163, 184);
        doc.text('JobZone — ' + window.location.href, margin, 290);
        doc.text('Page ' + p + ' of ' + totalPages, pageW - margin - 20, 290);
      }

      doc.save('JobZone_' + job.title.replace(/\s+/g, '_') + '.pdf');
      triggerToast('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      triggerToast('Failed to generate PDF.', 'error');
    } finally { setIsDownloading(false); }
  };

  const validateContactForm = () => {
    const errors = {};
    if (!contactForm.senderName.trim()) errors.senderName = 'Name is required';
    if (!contactForm.senderEmail.trim()) errors.senderEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(contactForm.senderEmail)) errors.senderEmail = 'Enter a valid email';
    if (!contactForm.message.trim()) errors.message = 'Message is required';
    else if (contactForm.message.trim().length < 20) errors.message = 'Min 20 characters required';
    return errors;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const errors = validateContactForm();
    if (Object.keys(errors).length > 0) { setContactErrors(errors); return; }
    setContactErrors({});
    setIsSendingContact(true);
    try {
      const res = await alertsApi.contactEmployer(id, contactForm);
      if (res.success) {
        triggerToast('Message sent to employer!');
        setShowContactModal(false);
        setContactForm(prev => ({ ...prev, message: '' }));
      } else { triggerToast(res.message || 'Failed to send.', 'error'); }
    } catch (err) { triggerToast(err.message || 'Error sending.', 'error'); }
    finally { setIsSendingContact(false); }
  };

  const mapQuery = encodeURIComponent(job.location || 'Sri Lanka');
  const mapLink = 'https://www.openstreetmap.org/search?query=' + mapQuery;

  return (
    <div className="job-detail-page-wrapper">

      {showToast && (
        <div className={'job-detail-toast job-detail-toast--' + toastType}>
          {toastType === 'success' ? <Check size={16} /> : <X size={16} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {showContactModal && (
        <div className="jd-modal-overlay" onClick={e => e.target === e.currentTarget && setShowContactModal(false)}>
          <div className="jd-modal-card">
            <div className="jd-modal-header">
              <div className="jd-modal-header-info">
                <h3 className="jd-modal-title">Contact Employer</h3>
                <p className="jd-modal-subtitle">Send a message about <strong>{job.title}</strong></p>
              </div>
              <button className="jd-modal-close" onClick={() => setShowContactModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="jd-modal-form" noValidate>
              <div className="jd-modal-form-row">
                <div className="jd-form-group">
                  <label className="jd-form-label" htmlFor="contact-name">
                    <User size={14} /> Full Name *
                  </label>
                  <input
                    id="contact-name" type="text"
                    className={'jd-form-input' + (contactErrors.senderName ? ' jd-form-input--error' : '')}
                    value={contactForm.senderName}
                    onChange={e => setContactForm(p => ({ ...p, senderName: e.target.value }))}
                    placeholder="Your full name"
                  />
                  {contactErrors.senderName && <span className="jd-form-error">{contactErrors.senderName}</span>}
                </div>
                <div className="jd-form-group">
                  <label className="jd-form-label" htmlFor="contact-email">
                    <Mail size={14} /> Email Address *
                  </label>
                  <input
                    id="contact-email" type="email"
                    className={'jd-form-input' + (contactErrors.senderEmail ? ' jd-form-input--error' : '')}
                    value={contactForm.senderEmail}
                    onChange={e => setContactForm(p => ({ ...p, senderEmail: e.target.value }))}
                    placeholder="your@email.com"
                  />
                  {contactErrors.senderEmail && <span className="jd-form-error">{contactErrors.senderEmail}</span>}
                </div>
              </div>

              <div className="jd-form-group">
                <label className="jd-form-label" htmlFor="contact-phone">
                  <Phone size={14} /> Phone (optional)
                </label>
                <input
                  id="contact-phone" type="tel"
                  className="jd-form-input"
                  value={contactForm.senderPhone}
                  onChange={e => setContactForm(p => ({ ...p, senderPhone: e.target.value }))}
                  placeholder="+94 77 000 0000"
                />
              </div>

              <div className="jd-form-group">
                <label className="jd-form-label" htmlFor="contact-message">
                  <MessageSquare size={14} /> Message *
                </label>
                <textarea
                  id="contact-message"
                  className={'jd-form-textarea' + (contactErrors.message ? ' jd-form-input--error' : '')}
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Write your message to the employer here... (min. 20 characters)"
                  rows={5}
                  maxLength={1000}
                />
                <div className="jd-form-char-count">{contactForm.message.length} / 1000</div>
                {contactErrors.message && <span className="jd-form-error">{contactErrors.message}</span>}
              </div>

              <div className="jd-modal-actions">
                <button type="button" className="jd-modal-btn-cancel" onClick={() => setShowContactModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="jd-modal-btn-submit" disabled={isSendingContact}>
                  {isSendingContact ? <><Loader2 size={16} className="jd-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="job-detail-hero">
        <div className="container">
          <div className="job-detail-hero__content">
            <h1 className="job-detail-hero__title">Job Detail</h1>
          </div>
        </div>
      </section>

      <div className="job-detail-breadcrumb-bar">
        <div className="container">
          <div className="job-detail-breadcrumb">
            <Link to="/">Home</Link>
            <span className="job-detail-breadcrumb__separator">&gt;</span>
            <Link to="/jobs">Jobs Listing</Link>
            <span className="job-detail-breadcrumb__separator">&gt;</span>
            <span className="job-detail-breadcrumb__current">{job.title}</span>
          </div>
        </div>
      </div>

      <div className="job-detail-main-container">

        <div className="job-detail-header-card">
          <div className="job-header-card-layout">
            <div className="job-header-logo-container">
              <div className="job-logo-emblem">
                <span className="logo-job">JOB</span>
                <span className="logo-zone">ZONE</span>
              </div>
            </div>
            <div className="job-header-info-container">
              <h1 className="job-title-heading">{job.title}</h1>
              <div className="job-badges-row">
                <span className="job-type-badge">{job.type || 'Full time'}</span>
                <span className="job-company-tag">@{companyName}</span>
                <span className="job-posted-time">posted {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="job-category-tag">in {job.industry || job.category || 'General'}</span>
              </div>
              <div className="job-location-row">
                <div className="location-info">
                  <MapPin size={16} className="location-icon" />
                  <span>{job.location}</span>
                </div>
                <a href="#job-map-section" className="view-map-btn">View on Map</a>
              </div>
              <div className="job-meta-details-row">
                <span className="meta-item">
                  <Calendar size={16} className="meta-icon" />
                  <span>Post Date : {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </span>
                <span className="meta-item">
                  <Calendar size={16} className="meta-icon" />
                  <span>Apply Before : {job.deadline || 'Open'}</span>
                </span>
                <span className="meta-item">
                  <Banknote size={16} className="meta-icon" />
                  <span>Salary: {salaryDisplay}</span>
                </span>
                <span className="meta-item">
                  <Eye size={16} className="meta-icon" />
                  <span>View(s) {job.views || 0}</span>
                </span>
              </div>
              <div className="job-header-actions">
                <button onClick={handleSaveToggle} className={'action-btn-outline' + (isSaved ? ' action-btn-outline--active' : '')}>
                  {isSaved ? <Check size={14} /> : <span style={{ marginRight: '2px', fontWeight: 'bold' }}>+</span>}
                  {isSaved ? 'Shortlisted' : 'Shortlist'}
                </button>
                <button onClick={handleEmailJob} disabled={isEmailing} className="action-btn-outline" title={user?.email ? 'Email to ' + user.email : 'Log in to email job'}>
                  {isEmailing ? <Loader2 size={14} className="jd-spin" /> : <Mail size={14} />}
                  {isEmailing ? 'Sending...' : 'Email Job'}
                </button>
                <button onClick={handleDownloadPDF} disabled={isDownloading} className="action-btn-outline">
                  {isDownloading ? <Loader2 size={14} className="jd-spin" /> : <Download size={14} />}
                  {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="job-content-columns-grid">
          <div className="job-details-left-column">

            <div className="job-summary-card">
              <h2 className="section-block-title">Job Detail</h2>
              <div className="summary-boxes-grid">
                <div className="summary-box-item">
                  <Briefcase size={22} className="summary-box-icon" />
                  <div className="summary-box-info">
                    <span className="summary-box-label">Job ID</span>
                    <span className="summary-box-value">{job._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                  </div>
                </div>
                <div className="summary-box-item">
                  <Briefcase size={22} className="summary-box-icon" />
                  <div className="summary-box-info">
                    <span className="summary-box-label">Experience</span>
                    <span className="summary-box-value">{job.experience || 'Not specified'}</span>
                  </div>
                </div>
                <div className="summary-box-item">
                  <User size={22} className="summary-box-icon" />
                  <div className="summary-box-info">
                    <span className="summary-box-label">Gender</span>
                    <span className="summary-box-value">
                      {(job.gender || 'Any').split(',').map((g, idx) => (
                        <div key={idx} className="gender-stacked-line">{g.trim()}</div>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="job-detail-description-block">
              <h2 className="section-block-title">Job Description</h2>
              <div className="description-text-content">
                {(job.description || '').split('\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
              {job.skills && job.skills.length > 0 && (
                <div className="job-skills-section">
                  <h3 className="job-skills-title">Required Skills</h3>
                  <div className="job-skills-list">
                    {job.skills.map((skill, i) => <span key={i} className="job-skill-badge">{skill}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="job-detail-attached-files-block">
              <h2 className="section-block-title">Attached Files</h2>
              <div className="files-cards-container">
                {job.attachedFiles && job.attachedFiles.length > 0 ? (
                  job.attachedFiles.map((file, i) => (
                    <div key={i} className="file-attachment-card">
                      <div className="file-card-top">
                        <FileBadge size={36} className="file-card-icon" />
                        <span className="file-card-name">{file.name || 'Attachment ' + (i + 1)}</span>
                      </div>
                      <a href={'http://localhost:5000' + file.url} target="_blank" rel="noopener noreferrer" download={file.name} className="file-card-download-bar">
                        <Download size={14} /> Download
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="file-attachment-card">
                    <div className="file-card-top">
                      <FileText size={36} className="file-card-icon" />
                      <span className="file-card-name">{job.title.replace(/\s+/g, '_')}_Details.pdf</span>
                    </div>
                    <button onClick={handleDownloadPDF} disabled={isDownloading} className="file-card-download-bar">
                      {isDownloading ? <Loader2 size={14} className="jd-spin" /> : <Download size={14} />}
                      {isDownloading ? 'Generating...' : 'Download'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="job-details-right-column">

            {role === 'candidate' ? (
              <div className="sidebar-apply-card">
                <button onClick={handleApply} disabled={hasApplied} className="sidebar-apply-btn">
                  {hasApplied ? '✓ ALREADY APPLIED' : 'APPLY FOR THE JOB'}
                </button>
                {job.deadline && <div className="ends-in-label">Application deadline: {job.deadline}</div>}
              </div>
            ) : role === 'employer' ? (
              <div className="sidebar-apply-card sidebar-apply-card--info">
                <p>👔 You are signed in as an <strong>employer</strong>. Only job seekers can apply.</p>
              </div>
            ) : (
              <div className="sidebar-apply-card">
                <Link to="/login" className="sidebar-apply-btn sidebar-apply-btn--link">LOG IN TO APPLY</Link>
              </div>
            )}

            <button onClick={() => setShowContactModal(true)} className="sidebar-contact-btn">
              <Mail size={16} /> CONTACT EMPLOYER
            </button>

            <div className="sidebar-map-card" id="job-map-section">
              <div className="jd-map-wrapper">
                <iframe
                  title={'Map for ' + job.location}
                  src={'https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&query=' + mapQuery}
                  className="jd-map-iframe"
                  loading="lazy"
                  allowFullScreen
                />
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="jd-map-link">
                  <ExternalLink size={12} /> View Larger Map
                </a>
              </div>
            </div>

            <div className="sidebar-company-jobs-card">
              <h3 className="company-jobs-heading">More Jobs From {companyName}</h3>
              <div className="company-jobs-list">
                {companyJobs.length > 0 ? (
                  companyJobs.slice(0, 5).map(cj => (
                    <Link key={cj._id || cj.id} to={'/jobs/' + (cj._id || cj.id)} className="company-job-list-item">
                      <span className="cj-title">{cj.title}</span>
                      <span className="cj-category">{cj.industry || cj.category || 'General'}</span>
                      <span className="cj-location">{cj.location}</span>
                    </Link>
                  ))
                ) : (
                  <div className="no-other-jobs">No other active vacancies for this company.</div>
                )}
              </div>
              <Link to="/jobs" className="view-all-company-jobs-link">
                VIEW ALL JOBS <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
