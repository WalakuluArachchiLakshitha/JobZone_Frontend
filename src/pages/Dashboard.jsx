import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  BookmarkCheck,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  Edit3,
  TrendingUp,
  Award,
  LogOut,
  Save,
  X,
  Lock,
  Globe,
  RotateCcw
} from 'lucide-react';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { resumeApi } from '../api/resumeApi';
import { applicationsApi } from '../api/applicationsApi';
import { savedJobsApi } from '../api/savedJobsApi';
import { adminApi } from '../api/adminApi';
import { jobsApi } from '../api/jobsApi';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, role, refreshUser, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user || {});
  const [applications, setApplications] = useState([]);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editJobForm, setEditJobForm] = useState(null);
  const [isUpdatingJob, setIsUpdatingJob] = useState(false);
  const [savedJobsList, setSavedJobsList] = useState([]);

  // Resume details states
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [skills, setSkills] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [referenceList, setReferenceList] = useState([]);

  const fileInputRef = useRef(null);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80";
    if (avatarPath.startsWith('http')) return avatarPath;
    const serverOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    return `${serverOrigin}${cleanPath}`;
  };

  const userAvatar = getAvatarUrl(profile.avatar);

  // Admin states
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);
  const [adminContacts, setAdminContacts] = useState([]);
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);

  // Sync state with auth context user
  useEffect(() => {
    if (user) {
      setProfile(user);
      setEditForm(user);
    }
  }, [user]);

  // Load dashboard data from backend on mount / user change
  useEffect(() => {
    const loadData = async () => {
      try {
        if (role === 'candidate') {
          // 1. Resume
          const resumeRes = await resumeApi.getResume();
          if (resumeRes.success && resumeRes.resume) {
            setSkills(resumeRes.resume.skills || []);
            setEducationList(resumeRes.resume.education || []);
            setExperienceList(resumeRes.resume.experience || []);
            setPortfolioList(resumeRes.resume.portfolio || []);
            setLanguageList(resumeRes.resume.languages || []);
            setReferenceList(resumeRes.resume.references || []);
          }

          // 2. Applications
          const appRes = await applicationsApi.getApplications();
          if (appRes.success) {
            setApplications(appRes.applications || []);
          }

          // 3. Saved Jobs
          const savedRes = await savedJobsApi.getSavedJobs();
          if (savedRes.success) {
            const savedJobs = (savedRes.savedJobs || [])
              .map(item => item.job)
              .filter(Boolean);
            setSavedJobsList(savedJobs);
          }
        }

        // Employer data loading
        if (role === 'employer') {
          try {
            const myJobsRes = await jobsApi.getMyJobs();
            if (myJobsRes.success) {
              setEmployerJobs(myJobsRes.jobs || []);
            }
          } catch (e) {
            console.error('Failed to load employer jobs:', e);
          }
        }

        // Admin data loading
        if (user?.role === 'admin') {
          try {
            const [statsRes, usersRes, pendingRes, jobsRes, contactsRes] = await Promise.all([
              adminApi.getStats(),
              adminApi.getAllUsers(),
              adminApi.getPendingVerifications(),
              adminApi.getAllJobs(),
              adminApi.getContacts(),
            ]);
            if (statsRes.success) setAdminStats(statsRes.stats);
            if (usersRes.success) setAdminUsers(usersRes.users);
            if (pendingRes.success) setPendingVerifications(pendingRes.users);
            if (jobsRes.success) setAdminJobs(jobsRes.jobs);
            if (contactsRes.success) setAdminContacts(contactsRes.contacts);
          } catch (err) {
            console.error('Error loading admin data:', err);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, role]);

  const handlePhotoUploadClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const res = await userApi.uploadAvatar(formData);
        if (res.success && res.avatarUrl) {
          const newAvatar = res.avatarUrl;
          setProfile((prev) => ({ ...prev, avatar: newAvatar }));
          setEditForm((prev) => ({ ...prev, avatar: newAvatar }));
          if (res.user) {
            updateUser(res.user);
          } else {
            await refreshUser();
          }
        }
      } catch (err) {
        alert(err.message || 'Failed to upload avatar');
      }
    }
  };

  // Sync saved jobs list changes dynamically (e.g. from JobCard unfavorite clicks)
  useEffect(() => {
    const handleSavedJobsChanged = async () => {
      try {
        const savedRes = await savedJobsApi.getSavedJobs();
        if (savedRes.success) {
          const savedJobs = (savedRes.savedJobs || [])
            .map(item => item.job)
            .filter(Boolean);
          setSavedJobsList(savedJobs);
        }
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('jobzoneSavedJobsChanged', handleSavedJobsChanged);
    return () => window.removeEventListener('jobzoneSavedJobsChanged', handleSavedJobsChanged);
  }, []);

  // Sync to local storage and backend
  const initialLoad = useRef(true);
  
  useEffect(() => {
    // Keep local storage in sync for quick access
    localStorage.setItem('jobzoneResumeSkills', JSON.stringify(skills));
    localStorage.setItem('jobzoneResumeEducation', JSON.stringify(educationList));
    localStorage.setItem('jobzoneResumeExperience', JSON.stringify(experienceList));
    localStorage.setItem('jobzoneResumePortfolio', JSON.stringify(portfolioList));
    localStorage.setItem('jobzoneResumeLanguages', JSON.stringify(languageList));
    localStorage.setItem('jobzoneResumeReferences', JSON.stringify(referenceList));

    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (role === 'candidate') {
      const debounceTimer = setTimeout(() => {
        resumeApi.updateResume({
          skills,
          education: educationList,
          experience: experienceList,
          portfolio: portfolioList,
          languages: languageList,
          references: referenceList
        }).catch(err => console.error('Failed to sync resume to backend', err));
      }, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [skills, educationList, experienceList, portfolioList, languageList, referenceList, role]);

  // Form toggle states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [showAddEdu, setShowAddEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', year: '' });

  const [showAddExp, setShowAddExp] = useState(false);
  const [newExp, setNewExp] = useState({ company: '', role: '', duration: '', desc: '' });

  const [showAddPort, setShowAddPort] = useState(false);
  const [newPort, setNewPort] = useState({ title: '', link: '' });

  const [showAddLang, setShowAddLang] = useState(false);
  const [newLang, setNewLang] = useState({ language: '', level: '' });

  const [showAddRef, setShowAddRef] = useState(false);
  const [newRef, setNewRef] = useState({ name: '', relation: '', phone: '', email: '' });

  const [agreedTerms, setAgreedTerms] = useState(false);

  // Password tab state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Redirect to login if not logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('jobzoneLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  // Route query param tab loading
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  // Sync saved jobs list changes dynamically (e.g. from JobCard unfavorite clicks)
  useEffect(() => {
    const handleSavedJobsChanged = () => {
      const saved = localStorage.getItem('jobzoneSavedJobs');
      setSavedJobsList(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('jobzoneSavedJobsChanged', handleSavedJobsChanged);
    return () => window.removeEventListener('jobzoneSavedJobsChanged', handleSavedJobsChanged);
  }, []);

  const completenessScore = useMemo(() => {
    let score = 0;
    if (profile.name && profile.name.trim()) score += 7;
    if (profile.title && profile.title.trim()) score += 7;
    if (profile.email && profile.email.trim()) score += 7;
    if (profile.phone && profile.phone.trim()) score += 7;
    if (profile.location && profile.location.trim()) score += 7;
    if (profile.bio && profile.bio.trim()) score += 8;
    if (profile.avatar && profile.avatar.trim()) score += 7;
    if (profile.experience && profile.experience.trim()) score += 8;
    if (profile.education && profile.education.trim()) score += 8;
    
    if (skills && skills.length > 0) score += 6;
    if (educationList && educationList.length > 0) score += 6;
    if (experienceList && experienceList.length > 0) score += 8;
    if (portfolioList && portfolioList.length > 0) score += 8;
    if (languageList && languageList.length > 0) score += 6;
    if (referenceList && referenceList.length > 0) score += 6;
    
    return Math.min(100, score);
  }, [profile, skills, educationList, experienceList, portfolioList, languageList, referenceList]);

  const nextImprovement = useMemo(() => {
    if (!profile.avatar || !profile.avatar.trim()) {
      return { score: 6, text: "Increase profile score by uploading profile image." };
    }
    if (!portfolioList || portfolioList.length === 0) {
      return { score: 8, text: "Increase profile score by adding portfolio items." };
    }
    if (!profile.phone || !profile.phone.trim()) {
      return { score: 6, text: "Increase profile score by adding your phone number." };
    }
    if (!profile.website || !profile.website.trim()) {
      return { score: 4, text: "Increase profile score by adding your personal website." };
    }
    if (!referenceList || referenceList.length === 0) {
      return { score: 6, text: "Increase profile score by adding references." };
    }
    if (!skills || skills.length === 0) {
      return { score: 6, text: "Increase profile score by adding resume skills." };
    }
    if (!educationList || educationList.length === 0) {
      return { score: 6, text: "Increase profile score by adding education details." };
    }
    if (!experienceList || experienceList.length === 0) {
      return { score: 8, text: "Increase profile score by adding work experience." };
    }
    if (!languageList || languageList.length === 0) {
      return { score: 6, text: "Increase profile score by adding languages." };
    }
    
    return { score: 0, text: "Your profile is fully complete! Well done!" };
  }, [profile, skills, educationList, experienceList, portfolioList, languageList, referenceList]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEmployerDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await jobsApi.deleteJob(jobId);
      if (res.success) {
        setEmployerJobs(prev => prev.filter(j => j._id !== jobId));
        alert('Job deleted successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleEditJobClick = (job) => {
    // Format the date to YYYY-MM-DD for the input[type="date"]
    let formattedDeadline = '';
    if (job.deadline) {
      // Try to parse the date
      const d = new Date(job.deadline);
      if (!isNaN(d.getTime())) {
        formattedDeadline = d.toISOString().split('T')[0];
      } else {
        // Handle DD/MM/YYYY or DD-MM-YYYY formats just in case
        const parts = job.deadline.split(/[\/\-]/);
        if (parts.length === 3) {
          // Check if format is likely DD/MM/YYYY
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDeadline = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            formattedDeadline = job.deadline; // hope it's YYYY-MM-DD
          }
        }
      }
    }
    
    setEditJobForm({
      ...job,
      deadline: formattedDeadline
    });
    setShowEditJobModal(true);
  };

  const handleUpdateJobSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingJob(true);
    try {
      const res = await jobsApi.updateJob(editJobForm._id, editJobForm);
      if (res.success) {
        setEmployerJobs(prev => prev.map(j => j._id === editJobForm._id ? res.job : j));
        setShowEditJobModal(false);
        setEditJobForm(null);
        alert('Job updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update job');
    } finally {
      setIsUpdatingJob(false);
    }
  };

  const handleGenerateCV = async () => {
    setIsGeneratingCV(true);
    try {
      const blob = await resumeApi.generateCV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(profile.name || 'JobSeeker').replace(/\s+/g, '_')}_CV.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to generate CV');
    } finally {
      setIsGeneratingCV(false);
    }
  };

  const handleVerifyCompany = async (userId) => {
    try {
      const res = await adminApi.verifyCompany(userId);
      if (res.success) {
        setPendingVerifications(prev => prev.filter(u => u._id !== userId));
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to verify company');
    }
  };

  const handleRejectVerification = async (userId) => {
    try {
      const res = await adminApi.rejectVerification(userId);
      if (res.success) {
        setPendingVerifications(prev => prev.filter(u => u._id !== userId));
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to reject verification');
    }
  };

  const handleAdminDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.success) {
        setAdminUsers(prev => prev.filter(u => u._id !== userId));
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleAdminDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await adminApi.adminDeleteJob(jobId);
      if (res.success) {
        setAdminJobs(prev => prev.filter(j => j._id !== jobId));
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setEditForm({
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      twitter: '',
      facebook: '',
      experience: '',
      education: '',
      bio: '',
      avatar: profile.avatar || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        avatar: editForm.avatar || profile.avatar || ''
      };
      const res = await userApi.updateProfile(payload);
      if (res.success) {
        if (res.user) {
          updateUser(res.user);
        } else {
          await refreshUser();
        }
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleAddSkillSubmit = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setShowAddSkill(false);
    }
  };

  const handleAddEduSubmit = (e) => {
    e.preventDefault();
    if (newEdu.school && newEdu.degree && newEdu.year) {
      setEducationList([...educationList, newEdu]);
      setNewEdu({ school: '', degree: '', year: '' });
      setShowAddEdu(false);
    }
  };

  const handleAddExpSubmit = (e) => {
    e.preventDefault();
    if (newExp.company && newExp.role && newExp.duration) {
      setExperienceList([...experienceList, newExp]);
      setNewExp({ company: '', role: '', duration: '', desc: '' });
      setShowAddExp(false);
    }
  };

  const handleAddPortSubmit = (e) => {
    e.preventDefault();
    if (newPort.title && newPort.link) {
      setPortfolioList([...portfolioList, newPort]);
      setNewPort({ title: '', link: '' });
      setShowAddPort(false);
    }
  };

  const handleAddLangSubmit = (e) => {
    e.preventDefault();
    if (newLang.language && newLang.level) {
      setLanguageList([...languageList, newLang]);
      setNewLang({ language: '', level: '' });
      setShowAddLang(false);
    }
  };

  const handleAddRefSubmit = (e) => {
    e.preventDefault();
    if (newRef.name && newRef.relation) {
      setReferenceList([...referenceList, newRef]);
      setNewRef({ name: '', relation: '', phone: '', email: '' });
      setShowAddRef(false);
    }
  };

  const handleDeleteRef = (idx) => {
    setReferenceList(referenceList.filter((_, i) => i !== idx));
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    
    let templateStyles = '';
    let templateHTML = '';
    
    const skillsHTML = skills.map(s => `<span class="badge">${s}</span>`).join(' ');
    const eduHTML = educationList.map(e => `
      <div class="entry">
        <div class="entry-header">
          <strong>${e.school}</strong>
          <span class="year">${e.year}</span>
        </div>
        <div class="entry-sub">${e.degree}</div>
      </div>
    `).join('');
    
    const expHTML = experienceList.map(exp => `
      <div class="entry">
        <div class="entry-header">
          <strong>${exp.company}</strong>
          <span class="duration">${exp.duration}</span>
        </div>
        <div class="entry-sub">${exp.role}</div>
        <p class="entry-desc">${exp.desc}</p>
      </div>
    `).join('');
    
    const portHTML = portfolioList.map(p => `
      <div class="entry">
        <strong>${p.title}</strong> - <a href="${p.link}" target="_blank">${p.link}</a>
      </div>
    `).join('');
    
    const langHTML = languageList.map(l => `
      <div class="lang-item">
        <strong>${l.language}</strong>: ${l.level}
      </div>
    `).join('');

    const referencesHTML = referenceList.map(r => `
      <div class="entry" style="margin-bottom: 15px;">
        <div class="entry-header">
          <strong>${r.name}</strong>
          <span style="font-size: 11px; color: #3b82f6; font-weight: 600;">${r.relation}</span>
        </div>
        <div style="font-size: 11px; color: #555; margin-top: 2px;">
          Phone: ${r.phone} &nbsp;|&nbsp; Email: ${r.email}
        </div>
      </div>
    `).join('');

    const userName = profile.name || 'Daniel Gallego';
    const userTitle = profile.title || 'Marketing Manager';
    const userEmail = profile.email || 'hello@reallygreatsite.com';
    const userPhone = profile.phone || '123-456-7890';
    const userLocation = profile.location || '123 Anywhere St., Any City';
    const userBio = profile.bio || '';
    const userWebsite = profile.website || 'www.reallygreatsite.com';

    const printBaseStyles = `
      * { box-sizing: border-box; }
      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { size: A4 portrait; margin: 12mm; }
      body { margin: 0; padding: 0; background: #fff; color: #333; }
      img { display: block; max-width: 100%; }
      a { color: inherit; text-decoration: none; }
      .resume-container { width: 100%; max-width: 850px; margin: 0 auto; }
    `;

    if (selectedTemplate === 1) {
      // Juliana Silva styling
      templateStyles = printBaseStyles + `
        body { font-family: 'Inter', sans-serif; line-height: 1.5; background: #fff; }
        .resume-container { display: grid; grid-template-columns: 260px 1fr; max-width: 850px; min-height: 100vh; }
        .left-col { background: #ECEEF0; padding: 40px 24px; color: #1F2937; }
        .right-col { background: #ffffff; padding: 40px 30px; }
        
        .avatar-container { margin-bottom: 25px; text-align: center; }
        .avatar { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        
        h2 { font-size: 13px; font-weight: 700; color: #111827; border-bottom: 2px solid #111827; padding-bottom: 4px; margin: 25px 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        p, .contact-item, .lang-item { font-size: 11.5px; color: #4B5563; margin-bottom: 8px; line-height: 1.6; }
        
        .header-banner { background: #1E1E24; color: #ffffff; padding: 30px 24px; margin-bottom: 30px; border-radius: 4px; }
        .header-banner h1 { font-size: 30px; font-weight: 800; margin: 0 0 4px; letter-spacing: 1.5px; text-transform: uppercase; color: #ffffff; }
        .header-banner .title-tag { font-size: 13px; color: #cbd5e1; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }
        
        .contact-row { display: flex; flex-wrap: wrap; gap: 15px; font-size: 11px; color: #4b5563; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
        .contact-row span { display: flex; align-items: center; gap: 4px; color: #cbd5e1; }
        
        .exp-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .exp-duration { width: 90px; flex-shrink: 0; font-size: 11.5px; font-weight: 700; color: #111827; }
        .exp-details { flex-grow: 1; }
        .exp-title { font-size: 13.5px; font-weight: 700; color: #111827; margin: 0 0 2px; }
        .exp-company { font-size: 11.5px; font-weight: 600; color: #4B5563; margin-bottom: 6px; display: block; }
        .exp-bullets { margin: 0; padding-left: 15px; font-size: 11px; color: #4B5563; }
        .exp-bullets li { margin-bottom: 4px; line-height: 1.5; }
        
        .edu-entry { margin-bottom: 12px; }
        .edu-degree { font-size: 12px; font-weight: 700; color: #111827; display: block; }
        .edu-school { font-size: 11px; color: #374151; display: block; }
        .edu-year { font-size: 11px; color: #6B7280; display: block; }
        
        .skill-row { margin-bottom: 10px; }
        .skill-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 3px; text-transform: uppercase; }
        .skill-bar-bg { background: #cbd5e1; height: 6px; border-radius: 3px; overflow: hidden; }
        .skill-bar-fill { background: #111827; height: 100%; }
        
        .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ref-item strong { font-size: 12px; color: #111827; display: block; }
        .ref-item span { font-size: 11px; color: #4B5563; display: block; }
      `;
      
      const skillsHTML_Silva = skills.map((s, i) => {
        const progress = [90, 85, 80, 75, 70][i % 5];
        return `
          <div class="skill-row">
            <div class="skill-header">
              <span>${s}</span>
            </div>
            <div class="skill-bar-bg">
              <div class="skill-bar-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        `;
      }).join('');
      
      const eduHTML_Silva = educationList.map(e => `
        <div class="edu-entry">
          <span class="edu-degree">${e.degree}</span>
          <span class="edu-school">${e.school}</span>
          <span class="edu-year">${e.year}</span>
        </div>
      `).join('');
      
      const expHTML_Silva = experienceList.map(exp => {
        const bullets = exp.desc ? exp.desc.split('. ').map(s => s.trim() ? `<li>${s.trim()}</li>` : '').join('') : '';
        return `
          <div class="exp-row">
            <div class="exp-duration">${exp.duration}</div>
            <div class="exp-details">
              <h4 class="exp-title">${exp.role}</h4>
              <span class="exp-company">${exp.company}</span>
              ${bullets ? `<ul class="exp-bullets">${bullets}</ul>` : `<p style="font-size: 11px; color: #4B5563; margin: 4px 0 0;">${exp.desc || ''}</p>`}
            </div>
          </div>
        `;
      }).join('');
      
      const langHTML_Silva = languageList.map(l => `
        <div style="font-size: 11.5px; color: #374151; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 4px; height: 4px; background: #111827; border-radius: 50%;"></span>
          <span>${l.language}</span>
        </div>
      `).join('');
      
      const refHTML_Silva = referenceList.map(r => `
        <div class="ref-item">
          <strong>${r.name}</strong>
          <span>${r.relation}</span>
          <span style="color: #6B7280; font-size: 10.5px;">Phone: ${r.phone}</span>
          <span style="color: #6B7280; font-size: 10.5px;">Email: ${r.email}</span>
        </div>
      `).join('');

      templateHTML = `
        <div class="resume-container">
          <div class="left-col">
            <div class="avatar-container">
              <img src="${userAvatar}" class="avatar" />
            </div>
            <h2>About Me</h2>
            <p>${userBio}</p>
            <h2>Education</h2>
            <div>${eduHTML_Silva}</div>
            <h2>Skills</h2>
            <div>${skillsHTML_Silva}</div>
            <h2>Language</h2>
            <div>${langHTML_Silva}</div>
          </div>
          <div class="right-col">
            <div class="header-banner">
              <h1>${userName}</h1>
              <div class="title-tag">${userTitle}</div>
              <div class="contact-row">
                <span>📞 ${userPhone}</span>
                <span>✉️ ${userEmail}</span>
                ${userWebsite ? `<span>🌐 ${userWebsite}</span>` : ''}
                <span>📍 ${userLocation}</span>
              </div>
            </div>
            
            <h2 style="font-size: 15px; color: #1E1E24; border-bottom: 2px solid #1E1E24; padding-bottom: 6px; margin-top: 0; margin-bottom: 20px;">Professional Experience</h2>
            <div>${expHTML_Silva}</div>
            
            ${referenceList.length > 0 ? `
              <h2 style="font-size: 15px; color: #1E1E24; border-bottom: 2px solid #1E1E24; padding-bottom: 6px; margin-top: 30px; margin-bottom: 20px;">References</h2>
              <div class="ref-grid">${refHTML_Silva}</div>
            ` : ''}
          </div>
        </div>
      `;
    } else if (selectedTemplate === 2) {
      // Daniel Gallego styling (clean printed CV layout)
      templateStyles = printBaseStyles + `
        body { font-family: 'Inter', sans-serif; color: #111827; margin: 0; padding: 0; background: #f4f5f8; }
        html, body { min-height: 100%; }
        .resume-container { display: grid; grid-template-columns: 280px 1fr; width: 100%; max-width: 900px; min-height: calc(100vh - 28mm); margin: 0 auto; background: #ffffff; }
        .left-col { background: #17191f; color: #ffffff; padding: 40px 28px; display: flex; flex-direction: column; }
        .right-col { background: #ffffff; padding: 42px 40px; }

        .avatar-container { display: flex; justify-content: center; margin-bottom: 24px; }
        .avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.18); box-shadow: 0 12px 28px rgba(0,0,0,0.18); }

        .left-col h1 { font-size: 32px; font-weight: 900; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1.02; text-align: center; }
        .left-col .title-tag { display: block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.75); text-align: center; margin-bottom: 34px; }

        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }
        .section-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.16); margin-bottom: 18px; }

        .contact-item { margin-bottom: 14px; }
        .contact-item strong { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.78); margin-bottom: 4px; }
        .contact-item span { display: block; font-size: 12px; color: rgba(255,255,255,0.9); line-height: 1.6; }

        .left-list { margin: 0; padding-left: 18px; list-style: disc; color: rgba(255,255,255,0.9); }
        .left-list li { margin-bottom: 10px; font-size: 12px; line-height: 1.75; }

        .right-col h2 { font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #111827; margin: 0 0 14px; }
        .right-col h2 + .section-divider { margin-top: 12px; margin-bottom: 18px; }

        .entry-item { margin-bottom: 22px; }
        .entry-header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
        .entry-title { font-size: 13.5px; font-weight: 800; color: #111827; margin: 0; }
        .entry-year { font-size: 11px; font-weight: 700; color: #111827; opacity: 0.75; margin-top: 4px; text-transform: uppercase; }
        .entry-sub { display: block; margin-top: 8px; font-size: 11.5px; font-weight: 600; color: #4B5563; }
        .entry-desc { margin: 10px 0 0; font-size: 11.4px; color: #4B5563; line-height: 1.72; }

        .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 16px; }
        .ref-item strong { font-size: 12px; color: #111827; display: block; margin-bottom: 6px; }
        .ref-item span { font-size: 11px; color: #4B5563; line-height: 1.6; display: block; }

        @media print {
          body { background: #ffffff; }
          .resume-container { box-shadow: none; }
          .left-col, .right-col { break-inside: avoid; }
        }
      `;
      
      const skillsHTML_Gallego = skills.map(s => `<li>${s}</li>`).join('');
      const langHTML_Gallego = languageList.map(l => `<li>${l.language}</li>`).join('');
      
      const expHTML_Gallego = experienceList.map(exp => `
        <div class="entry-item">
          <div class="entry-header">
            <div>
              <h4 class="entry-title">${exp.role}</h4>
              <span class="entry-sub">${exp.company}</span>
            </div>
            <span class="entry-year">${exp.duration}</span>
          </div>
          <p class="entry-desc">${exp.desc || ''}</p>
        </div>
      `).join('');
      
      const eduHTML_Gallego = educationList.map(e => `
        <div class="entry-item">
          <div class="entry-header">
            <div>
              <h4 class="entry-title">${e.school}</h4>
              <span class="entry-sub">${e.degree}</span>
            </div>
            <span class="entry-year">${e.year}</span>
          </div>
        </div>
      `).join('');
      
      const refHTML_Gallego = referenceList.map(r => `
        <div class="ref-item">
          <strong>${r.name}</strong>
          <span>${r.relation}</span>
          <span>Phone: ${r.phone}</span>
          <span>Email: ${r.email}</span>
        </div>
      `).join('');

      templateHTML = `
        <div class="resume-container">
          <div class="left-col">
            <div class="avatar-container">
              <img src="${userAvatar}" class="avatar" />
            </div>
            <h1>${userName}</h1>
            <span class="title-tag">${userTitle}</span>

            <div class="section-title">Contact</div>
            <div class="section-divider"></div>
            <div class="contact-item"><strong>Phone</strong><span>${userPhone}</span></div>
            <div class="contact-item"><strong>Email</strong><span>${userEmail}</span></div>
            ${userWebsite ? `<div class="contact-item"><strong>Website</strong><span>${userWebsite}</span></div>` : ''}
            <div class="contact-item"><strong>Location</strong><span>${userLocation}</span></div>

            <div class="section-title">Skills</div>
            <div class="section-divider"></div>
            <ul class="left-list">${skillsHTML_Gallego}</ul>

            <div class="section-title">Language</div>
            <div class="section-divider"></div>
            <ul class="left-list">${langHTML_Gallego}</ul>
          </div>
          <div class="right-col">
            <h2>About Me</h2>
            <div class="section-divider"></div>
            <p>${userBio || ''}</p>

            <h2>Work Experience</h2>
            <div class="section-divider"></div>
            ${expHTML_Gallego}

            <h2>Education</h2>
            <div class="section-divider"></div>
            ${eduHTML_Gallego}

            ${referenceList.length > 0 ? `
              <h2>References</h2>
              <div class="section-divider"></div>
              <div class="ref-grid">${refHTML_Gallego}</div>
            ` : ''}
          </div>
        </div>
      `;
    } else if (selectedTemplate === 3) {
      // Isabel Schumacher styling (clean printed CV)
      templateStyles = printBaseStyles + `
        body { font-family: 'Outfit', 'Inter', sans-serif; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
        html, body { min-height: 100%; }
        .resume-container { display: grid; grid-template-columns: 260px 1fr; width: 100%; max-width: 920px; min-height: 100vh; margin: 0 auto; background: #ffffff; }
        .left-col { background: #17191f; color: #ffffff; padding: 42px 30px; display: flex; flex-direction: column; }
        .right-col { background: #ffffff; padding: 44px 40px; }

        .avatar-container { display: flex; justify-content: center; margin-bottom: 24px; }
        .avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.18); box-shadow: 0 14px 28px rgba(0,0,0,0.16); }

        .left-col h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 10px; color: rgba(255,255,255,0.95); border-bottom: 2px solid #3b82f6; padding-bottom: 6px; }
        .left-col .title-tag { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.7); text-align: center; margin-bottom: 32px; }
        .section-divider { width: 100%; height: 1px; background: #111827; margin-bottom: 16px; }

        .left-col p, .contact-item span, .bullet-list li { font-size: 11.5px; color: rgba(255,255,255,0.9); line-height: 1.75; }
        .left-col p { margin: 0; }

        .contact-item { margin-bottom: 12px; }
        .contact-item span { display: block; }

        .bullet-list { margin: 0; padding-left: 18px; list-style: disc; color: rgba(255,255,255,0.9); }
        .bullet-list li { margin-bottom: 10px; }

        .right-col h1 { font-size: 34px; font-weight: 900; margin: 0 0 8px; color: #111827; }
        .right-col .title-tag { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #4b5563; margin-bottom: 28px; }
        
        .right-col h2 { font-size: 15px; font-weight: 800; color: #2B2D42; margin: 30px 0 15px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; }
        
        /* Vertical Timeline styling */
        .timeline-container { border-left: 2px solid #111827; margin-left: 10px; padding-left: 24px; position: relative; }
        .timeline-item { margin-bottom: 20px; position: relative; }
        .timeline-marker { width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; position: absolute; left: -30px; top: 5px; border: 2px solid #ffffff; box-shadow: 0 0 0 2px #3b82f6; }
        .timeline-title { font-size: 13px; font-weight: 700; color: #1a202c; margin: 0 0 2px; text-transform: uppercase; }
        .timeline-sub { font-size: 11.5px; font-weight: 600; color: #4A5568; display: block; margin-bottom: 5px; }
        .timeline-desc { font-size: 11px; color: #4A5568; margin: 0; line-height: 1.5; }
        .timeline-bullets { margin: 4px 0 0; padding-left: 15px; font-size: 11px; color: #4A5568; }
        .timeline-bullets li { margin-bottom: 3px; }
        
        .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ref-item strong { font-size: 12px; color: #2B2D42; display: block; }
        .ref-item span { font-size: 11px; color: #4A5568; display: block; }
      `;
      
      const skillsHTML_Schumacher = skills.map(s => `<li>${s}</li>`).join('');
      const langHTML_Schumacher = languageList.map(l => `<li>${l.language} (${l.level})</li>`).join('');
      
      const eduHTML_Schumacher = educationList.map(e => `
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <h4 class="timeline-title">(${e.year}) ${e.school}</h4>
          <span class="timeline-sub">${e.degree}</span>
        </div>
      `).join('');
      
      const expHTML_Schumacher = experienceList.map(exp => {
        const bullets = exp.desc ? exp.desc.split('. ').map(s => s.trim() ? `<li>${s.trim()}</li>` : '').join('') : '';
        return `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <h4 class="timeline-title">(${exp.duration}) ${exp.role}</h4>
            <span class="timeline-sub">${exp.company}</span>
            ${bullets ? `<ul class="timeline-bullets">${bullets}</ul>` : `<p class="timeline-desc">${exp.desc || ''}</p>`}
          </div>
        `;
      }).join('');
      
      const refHTML_Schumacher = referenceList.map(r => `
        <div class="ref-item">
          <strong>${r.name}</strong>
          <span style="font-weight: 600; color: #4A5568;">${r.relation}</span>
          <span style="color: #718096;">Phone: ${r.phone}</span>
          <span style="color: #718096;">Email: ${r.email}</span>
        </div>
      `).join('');

      templateHTML = `
        <div class="resume-container">
          <div class="left-col">
            <div class="avatar-container">
              <img src="${userAvatar}" class="avatar" />
            </div>
            
            <h2>About Me</h2>
            <p>${userBio}</p>
            
            <h2>Contact</h2>
            <div class="contact-item">📞 ${userPhone}</div>
            <div class="contact-item">✉️ ${userEmail}</div>
            ${userWebsite ? `<div class="contact-item">🌐 ${userWebsite}</div>` : ''}
            <div class="contact-item">📍 ${userLocation}</div>
            
            <h2>Skills</h2>
            <ul class="bullet-list">${skillsHTML_Schumacher}</ul>
            
            <h2>Language</h2>
            <ul class="bullet-list">${langHTML_Schumacher}</ul>
          </div>
          <div class="right-col">
            <h1 style="margin-top: 0;">${userName}</h1>
            <div class="title-tag">${userTitle}</div>
            
            <h2>Education</h2>
            <div class="timeline-container">${eduHTML_Schumacher}</div>
            
            <h2>Experience</h2>
            <div class="timeline-container">${expHTML_Schumacher}</div>
            
            ${referenceList.length > 0 ? `
              <h2>References</h2>
              <div class="ref-grid" style="padding-left: 10px;">${refHTML_Schumacher}</div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      // Richard Sanchez styling
      templateStyles = printBaseStyles + `
        body { font-family: 'Outfit', 'Inter', sans-serif; color: #333; margin: 0; padding: 0; line-height: 1.5; background: #fff; }
        html, body { min-height: 100%; }

        .header-banner { background: #003F88; color: #ffffff; padding: 35px 40px; display: flex; align-items: center; justify-content: space-between; max-width: 800px; margin: 0 auto; border-bottom: 5px solid #002855; }
        .banner-left { display: flex; align-items: center; gap: 25px; }
        .avatar { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .banner-left h1 { font-size: 32px; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; }
        .banner-left .title-tag { font-size: 14px; color: #93C5FD; font-weight: 700; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; }

        .banner-right { font-size: 11.5px; text-align: right; line-height: 1.6; color: #E0F2FE; }
        .banner-right div { margin-bottom: 4px; }

        .resume-container { max-width: 800px; margin: 0 auto; background: #fff; display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
        .left-col { background: #1a1a1c; color: #ffffff; padding: 35px 24px; }
        .right-col { padding: 40px 30px; background: #ffffff; }

        .left-col h2 { font-size: 12px; font-weight: 700; color: #ffffff; border-bottom: 2px solid #003F88; padding-bottom: 5px; margin: 25px 0 12px; text-transform: uppercase; letter-spacing: 1px; }
        .left-col p { font-size: 11px; color: #cbd5e1; line-height: 1.6; }

        .lang-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .lang-pill { background: #374151; color: #ffffff; font-size: 10.5px; font-weight: 600; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; }

        .expertise-list { margin: 0; padding-left: 15px; font-size: 11.5px; color: #cbd5e1; }
        .expertise-list li { margin-bottom: 6px; }

        .capsule-header { background: #003F88; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 11.5px; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }

        .entry-item { margin-bottom: 18px; }
        .entry-title-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 3px; }
        .entry-sub { font-size: 11.5px; color: #4B5563; font-weight: 600; display: block; margin-bottom: 4px; }
        .entry-desc { font-size: 11px; color: #4B5563; margin: 0; line-height: 1.5; }
        .entry-bullets { margin: 4px 0 0; padding-left: 15px; font-size: 11px; color: #4B5563; }
        .entry-bullets li { margin-bottom: 3px; }

        .skill-progress-row { margin-bottom: 12px; }
        .skill-progress-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px; text-transform: uppercase; }
        .skill-progress-bg { background: #E2E8F0; height: 6px; border-radius: 3px; overflow: hidden; }
        .skill-progress-fill { background: #003F88; height: 100%; }

        .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ref-item strong { font-size: 12px; color: #111827; display: block; }
        .ref-item span { font-size: 11px; color: #4B5563; display: block; }
      `;
      
      const skillsHTML_Sanchez = skills.map((s, i) => {
        const progress = [78, 81, 85, 70, 75][i % 5];
        return `
          <div class="skill-progress-row">
            <div class="skill-progress-header">
              <span>${s}</span>
              <span>${progress}%</span>
            </div>
            <div class="skill-progress-bg">
              <div class="skill-progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        `;
      }).join('');
      
      const langHTML_Sanchez = languageList.map(l => `
        <span class="lang-pill">${l.language}</span>
      `).join('');
      
      const expHTML_Sanchez = experienceList.map(exp => {
        const bullets = exp.desc ? exp.desc.split('. ').map(s => s.trim() ? `<li>${s.trim()}</li>` : '').join('') : '';
        return `
          <div class="entry-item">
            <div class="entry-title-row">
              <span>${exp.role}</span>
              <span style="color: #6b7280; font-weight: 500;">${exp.duration}</span>
            </div>
            <span class="entry-sub">${exp.company}</span>
            ${bullets ? `<ul class="entry-bullets">${bullets}</ul>` : `<p class="entry-desc">${exp.desc || ''}</p>`}
          </div>
        `;
      }).join('');
      
      const eduHTML_Sanchez = educationList.map(e => `
        <div class="entry-item">
          <div class="entry-title-row">
            <span>${e.school}</span>
            <span style="color: #6b7280; font-weight: 500;">${e.year}</span>
          </div>
          <span class="entry-sub">${e.degree}</span>
        </div>
      `).join('');
      
      const refHTML_Sanchez = referenceList.map(r => `
        <div class="ref-item">
          <strong>${r.name}</strong>
          <span>${r.relation}</span>
          <span style="color: #6B7280; font-size: 10.5px;">Phone: ${r.phone}</span>
          <span style="color: #6B7280; font-size: 10.5px;">Email: ${r.email}</span>
        </div>
      `).join('');

      templateHTML = `
        <div class="header-banner">
          <div class="banner-left">
            <img src="${userAvatar}" class="avatar" />
            <div>
              <h1>${userName}</h1>
              <div class="title-tag">${userTitle}</div>
            </div>
          </div>
          <div class="banner-right">
            <div>📞 ${userPhone}</div>
            <div>✉️ ${userEmail}</div>
            ${userWebsite ? `<div>🌐 ${userWebsite}</div>` : ''}
            <div>📍 ${userLocation}</div>
          </div>
        </div>
        <div class="resume-container">
          <div class="left-col">
            <h2>About Me</h2>
            <p>${userBio}</p>
            
            <h2>Languages</h2>
            <div class="lang-pills">${langHTML_Sanchez}</div>
            
            <h2>Expertise</h2>
            <ul class="expertise-list">
              ${skills.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="right-col">
            <div class="capsule-header">Experience</div>
            <div style="margin-bottom: 25px;">${expHTML_Sanchez}</div>
            
            <div class="capsule-header">Education</div>
            <div style="margin-bottom: 25px;">${eduHTML_Sanchez}</div>
            
            <div class="capsule-header">Skills Summary</div>
            <div style="margin-bottom: 25px;">${skillsHTML_Sanchez}</div>
            
            ${referenceList.length > 0 ? `
              <div class="capsule-header">References</div>
              <div class="ref-grid">${refHTML_Sanchez}</div>
            ` : ''}
          </div>
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${userName} - CV</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            ${templateStyles}
            @media print {
              body { padding: 0; background: #fff; }
              .resume-container { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${templateHTML}
          <script>
            window.onload = function() {
              const printNow = () => setTimeout(() => window.print(), 300);
              if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(printNow).catch(printNow);
              } else {
                printNow();
              }
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Applied: { class: 'dashboard-status--applied', icon: Clock },
      'In Review': { class: 'dashboard-status--review', icon: AlertCircle },
      Interview: { class: 'dashboard-status--interview', icon: TrendingUp },
      Rejected: { class: 'dashboard-status--rejected', icon: XCircle },
      Offered: { class: 'dashboard-status--offered', icon: CheckCircle },
    };

    const config = statusMap[status] || { class: 'dashboard-status--applied', icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`dashboard-status ${config.class}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  return (
    <div className="dashboard-page" id="dashboard-page-container">
      {/* ===== HERO BANNER ===== */}
      <section className="dashboard-hero">
        <div className="container">
          <div className="dashboard-hero__content">
            <h1 className="dashboard-hero__title">{profile.name}</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="dashboard-breadcrumb-bar">
        <div className="container">
          <div className="dashboard-breadcrumb">
            <Link to="/">Home</Link>
            <span className="dashboard-breadcrumb__separator">&gt;</span>
            <span className="dashboard-breadcrumb__current">User Dashboard</span>
          </div>
        </div>
      </div>

      <div className="container dashboard-main-content-wrap">
        {/* Main Content Layout */}
        <div className="dashboard-layout">
          {/* Navigation Sidebar */}
          <div className="dashboard-sidebar-redesign glass-card">
            {/* 1. Circular Completion Circle */}
            <div className="profile-progress-container">
              <div className="profile-progress-circle-wrap">
                <svg width="120" height="120" viewBox="0 0 120 120" className="progress-circle-svg">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#F5BF22" strokeWidth="6"
                          strokeDasharray="326.7" strokeDashoffset={326.7 - (326.7 * completenessScore) / 100}
                          strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="profile-progress-avatar-wrap">
                  <img 
                    src={userAvatar} 
                    alt="Avatar" 
                    className="profile-progress-avatar" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80";
                    }}
                  />
                </div>
              </div>
              <div className="profile-progress-percent">{completenessScore}%</div>
            </div>

            <div className="profile-sidebar-actions-wrap">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                style={{ display: 'none' }} 
                accept="image/*" 
              />
              <button className="btn-upload-photo" onClick={handlePhotoUploadClick}>Upload photo</button>
              <h3 className="profile-sidebar-name">{profile.name}</h3>
              
              {nextImprovement.score > 0 ? (
                <div className="profile-score-info">
                  <span className="score-percent">{nextImprovement.score}%</span>
                  <span className="score-text">{nextImprovement.text}</span>
                </div>
              ) : (
                <div className="profile-score-info">
                  <span className="score-percent" style={{ color: '#10B981' }}>✓</span>
                  <span className="score-text" style={{ color: '#10B981' }}>Profile 100% complete!</span>
                </div>
              )}

              <button className="btn-complete-profile" onClick={() => setActiveTab('profile')}>Complete Profile</button>
            </div>

            {/* 2. Navigation List */}
            <nav className="dashboard-nav-redesign">
              <button
                className={`dashboard-nav__btn ${activeTab === 'overview' ? 'dashboard-nav__btn--active' : ''}`}
                onClick={() => { setActiveTab('overview'); setIsEditing(false); }}
                id="dashboard-tab-overview"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                Dashboard
              </button>
              <button
                className={`dashboard-nav__btn ${activeTab === 'profile' ? 'dashboard-nav__btn--active' : ''}`}
                onClick={() => { setActiveTab('profile'); setIsEditing(false); }}
                id="dashboard-tab-profile"
              >
                <User size={18} />
                My Profile
              </button>

              {role === 'employer' && (
                <button
                  className={`dashboard-nav__btn ${activeTab === 'my-jobs' ? 'dashboard-nav__btn--active' : ''}`}
                  onClick={() => { setActiveTab('my-jobs'); setIsEditing(false); }}
                  id="dashboard-tab-my-jobs"
                >
                  <Briefcase size={18} />
                  My Jobs
                </button>
              )}
              {role === 'candidate' && (
                <>
                  <button
                    className={`dashboard-nav__btn ${activeTab === 'resume' ? 'dashboard-nav__btn--active' : ''}`}
                    onClick={() => { setActiveTab('resume'); setIsEditing(false); }}
                    id="dashboard-tab-resume"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    My Resume
                  </button>
                  <button
                    className={`dashboard-nav__btn ${activeTab === 'applications' ? 'dashboard-nav__btn--active' : ''}`}
                    onClick={() => { setActiveTab('applications'); setIsEditing(false); }}
                    id="dashboard-tab-applications"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    Applied Jobs
                  </button>
                  <button
                    className={`dashboard-nav__btn ${activeTab === 'cv-manager' ? 'dashboard-nav__btn--active' : ''}`}
                    onClick={() => { setActiveTab('cv-manager'); setIsEditing(false); }}
                    id="dashboard-tab-cv-manager"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    CV Manager
                  </button>
                  <button
                    className={`dashboard-nav__btn ${activeTab === 'saved' ? 'dashboard-nav__btn--active' : ''}`}
                    onClick={() => { setActiveTab('saved'); setIsEditing(false); }}
                    id="dashboard-tab-saved"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    Favorite jobs
                  </button>
                </>
              )}
              {user?.role === 'admin' && (
                <button
                  className={`dashboard-nav__btn ${activeTab === 'admin' ? 'dashboard-nav__btn--active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setIsEditing(false); }}
                  id="dashboard-tab-admin"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Admin Panel
                </button>
              )}
              <button
                className={`dashboard-nav__btn ${activeTab === 'change-password' ? 'dashboard-nav__btn--active' : ''}`}
                onClick={() => { setActiveTab('change-password'); setIsEditing(false); }}
                id="dashboard-tab-change-password"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Change Password
              </button>
              <button
                className="dashboard-nav__btn dashboard-nav__btn--logout"
                onClick={handleLogout}
                id="dashboard-tab-logout"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
              </button>
            </nav>
          </div>

          {/* Active Tab Panel */}
          <div className="dashboard-content">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-overview">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">Overview</h2>
                </div>

                {/* Stats Row */}
                <div className="dashboard-stats-grid" id="dashboard-stats-row">
                  <div className="dashboard-stat-card glass-card">
                    <div className="dashboard-stat-card__icon dashboard-stat-card__icon--blue">
                      <FileText size={22} />
                    </div>
                    <div className="dashboard-stat-card__content">
                      <span className="dashboard-stat-card__label">Applied Jobs</span>
                      <h3 className="dashboard-stat-card__value">{applications.length}</h3>
                    </div>
                  </div>

                  <div className="dashboard-stat-card glass-card">
                    <div className="dashboard-stat-card__icon dashboard-stat-card__icon--yellow">
                      <Clock size={22} />
                    </div>
                    <div className="dashboard-stat-card__content">
                      <span className="dashboard-stat-card__label">In Review</span>
                      <h3 className="dashboard-stat-card__value">
                        {applications.filter((a) => a.status === 'In Review').length}
                      </h3>
                    </div>
                  </div>

                  <div className="dashboard-stat-card glass-card">
                    <div className="dashboard-stat-card__icon dashboard-stat-card__icon--green">
                      <TrendingUp size={22} />
                    </div>
                    <div className="dashboard-stat-card__content">
                      <span className="dashboard-stat-card__label">Interviews</span>
                      <h3 className="dashboard-stat-card__value">
                        {applications.filter((a) => a.status === 'Interview').length}
                      </h3>
                    </div>
                  </div>

                  <div className="dashboard-stat-card glass-card">
                    <div className="dashboard-stat-card__icon dashboard-stat-card__icon--pink">
                      <BookmarkCheck size={22} />
                    </div>
                    <div className="dashboard-stat-card__content">
                      <span className="dashboard-stat-card__label">Saved Jobs</span>
                      <h3 className="dashboard-stat-card__value">{savedJobsList.length}</h3>
                    </div>
                  </div>
                </div>

                <div className="dashboard-pane__section glass-card" style={{ marginTop: '24px' }}>
                  <div className="dashboard-section-header">
                    <h3 className="dashboard-section-title">Recent Applications</h3>
                    <button
                      className="dashboard-section-link"
                      onClick={() => setActiveTab('applications')}
                    >
                      View All
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="dashboard-apps-list">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app._id || app.id} className="dashboard-app-item">
                        <div className="dashboard-app-item__logo">
                          <img src={app.job.company.logo} alt={app.job.company.name} />
                        </div>
                        <div className="dashboard-app-item__info">
                          <h4>{app.job.title}</h4>
                          <p>{app.job.company.name}</p>
                        </div>
                        <div className="dashboard-app-item__date">
                          <span>Applied on</span>
                          <strong>{app.appliedDate}</strong>
                        </div>
                        <div className="dashboard-app-item__status">
                          {getStatusBadge(app.status)}
                        </div>
                        <Link
                          to={`/jobs/${app.job.id}`}
                          className="dashboard-app-item__action"
                          aria-label="View job details"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-quick-actions">
                  <h3 className="dashboard-quick-actions__title">Quick Actions</h3>
                  <div className="dashboard-quick-actions__grid">
                    <Link to="/jobs" className="quick-action-card glass-card">
                      <div className="quick-action-card__icon">
                        <Briefcase size={20} />
                      </div>
                      <h4>Search Jobs</h4>
                      <p>Explore thousands of open opportunities</p>
                    </Link>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsEditing(true);
                      }}
                      className="quick-action-card glass-card text-left btn-clear"
                    >
                      <div className="quick-action-card__icon">
                        <Edit3 size={20} />
                      </div>
                      <h4>Update Profile</h4>
                      <p>Keep your details and resume fresh</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('saved')}
                      className="quick-action-card glass-card text-left btn-clear"
                    >
                      <div className="quick-action-card__icon">
                        <BookmarkCheck size={20} />
                      </div>
                      <h4>View Saved</h4>
                      <p>Check jobs you have bookmarked</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-applications">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">My Applications</h2>
                </div>

                <div className="glass-card dashboard-table-card">
                  <div className="dashboard-table-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Job Position</th>
                          <th>Company</th>
                          <th>Date Applied</th>
                          <th>Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app._id || app.id}>
                            <td>
                              <div className="dashboard-table-job">
                                <span className="dashboard-table-job__title">{app.job.title}</span>
                                <span className="dashboard-table-job__meta">{app.job.type} • {app.job.location}</span>
                              </div>
                            </td>
                            <td>
                              <div className="dashboard-table-company">
                                <img src={app.job.company.logo} alt={app.job.company.name} />
                                <span>{app.job.company.name}</span>
                              </div>
                            </td>
                            <td className="dashboard-table-date">{app.appliedDate}</td>
                            <td>{getStatusBadge(app.status)}</td>
                            <td className="text-center">
                              <Link
                                to={`/jobs/${app.job.id}`}
                                className="dashboard-table-action-btn"
                                title="View Job Description"
                              >
                                <Eye size={16} />
                                <span>View</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SAVED JOBS TAB */}
            {activeTab === 'saved' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-saved">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">Saved Jobs</h2>
                </div>

                {savedJobsList.length === 0 ? (
                  <div className="dashboard-empty glass-card">
                    <BookmarkCheck size={48} className="dashboard-empty__icon" />
                    <h3>No saved jobs</h3>
                    <p>When you browse jobs, save the ones you are interested in here.</p>
                    <Link to="/jobs" className="btn btn-primary">
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-saved-grid">
                    {savedJobsList.map((job) => (
                      <JobCard key={job._id || job.id} job={job} variant="compact" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-profile">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">Professional Profile</h2>
                  {!isEditing && (
                    <button
                      className="btn btn-secondary dashboard-profile-edit-btn"
                      onClick={() => {
                        setEditForm({ ...profile });
                        setIsEditing(true);
                      }}
                      id="edit-profile-toggle"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form className="glass-card dashboard-profile-form" onSubmit={handleEditSubmit}>
                    <div className="dashboard-profile-form__grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-name">Full Name</label>
                        <input
                          id="edit-name"
                          type="text"
                          className="form-input"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-title">Professional Title</label>
                        <input
                          id="edit-title"
                          type="text"
                          className="form-input"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-email">Email Address</label>
                        <input
                          id="edit-email"
                          type="email"
                          className="form-input"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-phone">Phone Number</label>
                        <input
                          id="edit-phone"
                          type="text"
                          className="form-input"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-location">Location</label>
                        <input
                          id="edit-location"
                          type="text"
                          className="form-input"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-website">Website</label>
                        <input
                          id="edit-website"
                          type="text"
                          className="form-input"
                          value={editForm.website || ''}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-linkedin">LinkedIn Profile</label>
                        <input
                          id="edit-linkedin"
                          type="text"
                          className="form-input"
                          value={editForm.linkedin || ''}
                          onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-github">GitHub Profile</label>
                        <input
                          id="edit-github"
                          type="text"
                          className="form-input"
                          value={editForm.github || ''}
                          onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                          placeholder="https://github.com/username"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-twitter">Twitter / X Profile</label>
                        <input
                          id="edit-twitter"
                          type="text"
                          className="form-input"
                          value={editForm.twitter || ''}
                          onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                          placeholder="https://twitter.com/username"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-facebook">Facebook Profile</label>
                        <input
                          id="edit-facebook"
                          type="text"
                          className="form-input"
                          value={editForm.facebook || ''}
                          onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                          placeholder="https://facebook.com/username"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-experience">Experience</label>
                        <input
                          id="edit-experience"
                          type="text"
                          className="form-input"
                          value={editForm.experience}
                          onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group form-group--full">
                        <label className="form-label" htmlFor="edit-education">Education</label>
                        <input
                          id="edit-education"
                          type="text"
                          className="form-input"
                          value={editForm.education}
                          onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                          required
                        />
                      </div>



                      <div className="form-group form-group--full">
                        <label className="form-label" htmlFor="edit-bio">Professional Summary</label>
                        <textarea
                          id="edit-bio"
                          className="form-input form-textarea"
                          rows={4}
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="dashboard-profile-form__actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        <RotateCcw size={16} />
                        Reset
                      </button>
                      <button type="submit" className="btn btn-primary" id="save-profile-btn">
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="dashboard-profile-display">
                    <div className="dashboard-profile-section glass-card">
                      <h3 className="dashboard-profile-section__title">Professional Bio</h3>
                      <p className="dashboard-profile-bio-text">{profile.bio}</p>
                    </div>

                    <div className="dashboard-profile-grid">
                      <div className="dashboard-profile-section glass-card">
                        <h3 className="dashboard-profile-section__title">Contact Information</h3>
                        <ul className="dashboard-profile-info-list">
                          <li>
                            <Mail size={16} />
                            <div>
                              <span>Email</span>
                              <strong>{profile.email}</strong>
                            </div>
                          </li>
                          <li>
                            <Phone size={16} />
                            <div>
                              <span>Phone</span>
                              <strong>{profile.phone}</strong>
                            </div>
                          </li>
                          <li>
                            <MapPin size={16} />
                            <div>
                              <span>Location</span>
                              <strong>{profile.location}</strong>
                            </div>
                          </li>
                          {profile.website && (
                            <li>
                              <Globe size={16} />
                              <div>
                                <span>Website</span>
                                <strong>{profile.website}</strong>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="dashboard-profile-section glass-card">
                        <h3 className="dashboard-profile-section__title">Experience &amp; Education</h3>
                        <ul className="dashboard-profile-info-list">
                          <li>
                            <Briefcase size={16} />
                            <div>
                              <span>Experience</span>
                              <strong>{profile.experience}</strong>
                            </div>
                          </li>
                          <li>
                            <Award size={16} />
                            <div>
                              <span>Education</span>
                              <strong>{profile.education}</strong>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>



                    <div className="dashboard-profile-section glass-card" style={{ marginTop: '24px' }}>
                      <h3 className="dashboard-profile-section__title">Social Media Links</h3>
                      <div className="dashboard-profile-social-grid">
                        {profile.linkedin && (
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="dashboard-profile-social-item">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="social-icon social-icon--linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                            <div className="social-details">
                              <span>LinkedIn</span>
                              <strong>{profile.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</strong>
                            </div>
                          </a>
                        )}
                        {profile.github && (
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="dashboard-profile-social-item">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="social-icon social-icon--github"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                            <div className="social-details">
                              <span>GitHub</span>
                              <strong>{profile.github.replace(/^https?:\/\/(www\.)?/, '')}</strong>
                            </div>
                          </a>
                        )}
                        {profile.twitter && (
                          <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="dashboard-profile-social-item">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="social-icon social-icon--twitter"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            <div className="social-details">
                              <span>Twitter / X</span>
                              <strong>{profile.twitter.replace(/^https?:\/\/(www\.)?/, '')}</strong>
                            </div>
                          </a>
                        )}
                        {profile.facebook && (
                          <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="dashboard-profile-social-item">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="social-icon social-icon--facebook"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            <div className="social-details">
                              <span>Facebook</span>
                              <strong>{profile.facebook.replace(/^https?:\/\/(www\.)?/, '')}</strong>
                            </div>
                          </a>
                        )}
                        {!profile.linkedin && !profile.github && !profile.twitter && !profile.facebook && (
                          <p className="no-social-links">No social media links added yet. Click Edit Profile to add them.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MY RESUME TAB */}
            {activeTab === 'resume' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-resume">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">My Resume</h2>
                </div>

                <div className="glass-card resume-templates-card">
                  {/* CV Templates Selection */}
                  <div className="templates-selector-grid">
                    <div 
                      className={`template-preview-card ${selectedTemplate === 1 ? 'template-preview-card--active' : ''}`}
                      onClick={() => setSelectedTemplate(1)}
                    >
                      <img src="/assets/juliana_silva.png" alt="Juliana Silva Template" />
                      {selectedTemplate === 1 && <div className="active-template-badge">ACTIVE</div>}
                    </div>

                    <div 
                      className={`template-preview-card ${selectedTemplate === 2 ? 'template-preview-card--active' : ''}`}
                      onClick={() => setSelectedTemplate(2)}
                    >
                      <img src="/assets/daniel_gallego.png" alt="Daniel Gallego Template" />
                      {selectedTemplate === 2 && <div className="active-template-badge">ACTIVE</div>}
                    </div>

                    <div 
                      className={`template-preview-card ${selectedTemplate === 3 ? 'template-preview-card--active' : ''}`}
                      onClick={() => setSelectedTemplate(3)}
                    >
                      <img src="/assets/isabel_schumacher.png" alt="Isabel Schumacher Template" />
                      {selectedTemplate === 3 && <div className="active-template-badge">ACTIVE</div>}
                    </div>

                    <div 
                      className={`template-preview-card ${selectedTemplate === 4 ? 'template-preview-card--active' : ''}`}
                      onClick={() => setSelectedTemplate(4)}
                    >
                      <img src="/assets/richard_sanchez.png" alt="Richard Sanchez Template" />
                      {selectedTemplate === 4 && <div className="active-template-badge">ACTIVE</div>}
                    </div>
                  </div>

                  <button className="btn btn-primary btn-download-pdf-full" onClick={handleDownloadPDF}>
                    Download PDF
                  </button>

                  {/* Collapsible Resume Details Sections */}
                  <div className="resume-collapsible-sections">
                    
                    {/* SKILLS SECTION */}
                    <div className="collapsible-section-block">
                      <div className="collapsible-section-header-row">
                        <div className="section-title-wrap">
                          <span className="section-icon">🛠️</span>
                          <span className="section-title-text">SKILLS</span>
                        </div>
                        <button className="btn-add-detail" onClick={() => setShowAddSkill(!showAddSkill)}>
                          ADD SKILLS
                        </button>
                      </div>
                      
                      {showAddSkill && (
                        <form onSubmit={handleAddSkillSubmit} className="add-detail-form animate-fadeIn">
                          <input 
                            type="text" 
                            placeholder="Type a skill (e.g. JavaScript) and press Save" 
                            value={newSkill} 
                            onChange={(e) => setNewSkill(e.target.value)}
                            required 
                          />
                          <div className="form-action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddSkill(false)}>Cancel</button>
                            <button type="submit" className="btn-save">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="skills-badge-list">
                        {skills.map((s, idx) => (
                          <span key={idx} className="resume-skill-pill">
                            {s}
                            <button className="btn-delete-item" type="button" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* EDUCATION SECTION */}
                    <div className="collapsible-section-block">
                      <div className="collapsible-section-header-row">
                        <div className="section-title-wrap">
                          <span className="section-icon">🎓</span>
                          <span className="section-title-text">EDUCATION</span>
                        </div>
                        <button className="btn-add-detail" onClick={() => setShowAddEdu(!showAddEdu)}>
                          ADD EDUCATION
                        </button>
                      </div>

                      {showAddEdu && (
                        <form onSubmit={handleAddEduSubmit} className="add-detail-form animate-fadeIn">
                          <div className="form-grid-inputs">
                            <input 
                              type="text" 
                              placeholder="School Name" 
                              value={newEdu.school} 
                              onChange={(e) => setNewEdu({...newEdu, school: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Degree" 
                              value={newEdu.degree} 
                              onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Graduation Year" 
                              value={newEdu.year} 
                              onChange={(e) => setNewEdu({...newEdu, year: e.target.value})}
                              required 
                            />
                          </div>
                          <div className="form-action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddEdu(false)}>Cancel</button>
                            <button type="submit" className="btn-save">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="details-entries-list">
                        {educationList.map((e, idx) => (
                          <div key={idx} className="details-entry-item">
                            <div className="entry-item-header">
                              <strong>{e.school}</strong> ({e.year})
                              <button className="btn-delete-entry" type="button" onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}>Delete</button>
                            </div>
                            <div className="entry-item-sub">{e.degree}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* EXPERIENCE SECTION */}
                    <div className="collapsible-section-block">
                      <div className="collapsible-section-header-row">
                        <div className="section-title-wrap">
                          <span className="section-icon">💼</span>
                          <span className="section-title-text">EXPERIENCE</span>
                        </div>
                        <button className="btn-add-detail" onClick={() => setShowAddExp(!showAddExp)}>
                          ADD EXPERIENCE
                        </button>
                      </div>

                      {showAddExp && (
                        <form onSubmit={handleAddExpSubmit} className="add-detail-form animate-fadeIn">
                          <div className="form-grid-inputs">
                            <input 
                              type="text" 
                              placeholder="Company" 
                              value={newExp.company} 
                              onChange={(e) => setNewExp({...newExp, company: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Role" 
                              value={newExp.role} 
                              onChange={(e) => setNewExp({...newExp, role: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Duration" 
                              value={newExp.duration} 
                              onChange={(e) => setNewExp({...newExp, duration: e.target.value})}
                              required 
                            />
                            <textarea 
                              placeholder="Job Description" 
                              value={newExp.desc} 
                              onChange={(e) => setNewExp({...newExp, desc: e.target.value})}
                              rows="3"
                            />
                          </div>
                          <div className="form-action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddExp(false)}>Cancel</button>
                            <button type="submit" className="btn-save">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="details-entries-list">
                        {experienceList.map((exp, idx) => (
                          <div key={idx} className="details-entry-item">
                            <div className="entry-item-header">
                              <strong>{exp.company}</strong> ({exp.duration})
                              <button className="btn-delete-entry" type="button" onClick={() => setExperienceList(experienceList.filter((_, i) => i !== idx))}>Delete</button>
                            </div>
                            <div className="entry-item-sub">{exp.role}</div>
                            <div className="entry-item-desc">{exp.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PORTFOLIO SECTION */}
                    <div className="collapsible-section-block">
                      <div className="collapsible-section-header-row">
                        <div className="section-title-wrap">
                          <span className="section-icon">🎨</span>
                          <span className="section-title-text">PORTFOLIO</span>
                        </div>
                        <button className="btn-add-detail" onClick={() => setShowAddPort(!showAddPort)}>
                          ADD PORTFOLIO
                        </button>
                      </div>

                      {showAddPort && (
                        <form onSubmit={handleAddPortSubmit} className="add-detail-form animate-fadeIn">
                          <div className="form-grid-inputs">
                            <input 
                              type="text" 
                              placeholder="Project Title" 
                              value={newPort.title} 
                              onChange={(e) => setNewPort({...newPort, title: e.target.value})}
                              required 
                            />
                            <input 
                              type="url" 
                              placeholder="Link" 
                              value={newPort.link} 
                              onChange={(e) => setNewPort({...newPort, link: e.target.value})}
                              required 
                            />
                          </div>
                          <div className="form-action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddPort(false)}>Cancel</button>
                            <button type="submit" className="btn-save">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="details-entries-list">
                        {portfolioList.map((p, idx) => (
                          <div key={idx} className="details-entry-item">
                            <div className="entry-item-header">
                              <strong>{p.title}</strong>
                              <button className="btn-delete-entry" type="button" onClick={() => setPortfolioList(portfolioList.filter((_, i) => i !== idx))}>Delete</button>
                            </div>
                            <div className="entry-item-sub"><a href={p.link} target="_blank" rel="noreferrer">{p.link}</a></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LANGUAGES SECTION */}
                    <div className="collapsible-section-block">
                      <div className="collapsible-section-header-row">
                        <div className="section-title-wrap">
                          <span className="section-icon">🌐</span>
                          <span className="section-title-text">LANGUAGES</span>
                        </div>
                        <button className="btn-add-detail" onClick={() => setShowAddLang(!showAddLang)}>
                          ADD LANGUAGES
                        </button>
                      </div>

                      {showAddLang && (
                        <form onSubmit={handleAddLangSubmit} className="add-detail-form animate-fadeIn">
                          <div className="form-grid-inputs">
                            <input 
                              type="text" 
                              placeholder="Language" 
                              value={newLang.language} 
                              onChange={(e) => setNewLang({...newLang, language: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Level" 
                              value={newLang.level} 
                              onChange={(e) => setNewLang({...newLang, level: e.target.value})}
                              required 
                            />
                          </div>
                          <div className="form-action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddLang(false)}>Cancel</button>
                            <button type="submit" className="btn-save">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="details-entries-list">
                        {languageList.map((l, idx) => (
                          <div key={idx} className="details-entry-item">
                            <div className="entry-item-header">
                              <strong>{l.language}</strong>: {l.level}
                              <button className="btn-delete-entry" type="button" onClick={() => setLanguageList(languageList.filter((_, i) => i !== idx))}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* REFERENCES SECTION */}
                    <div className="collapsible-section-block">
                      <div className="collapsible-section-header-row">
                        <div className="section-title-wrap">
                          <span className="section-icon">👥</span>
                          <span className="section-title-text">REFERENCES</span>
                        </div>
                        <button className="btn-add-detail" onClick={() => setShowAddRef(!showAddRef)}>
                          ADD REFERENCE
                        </button>
                      </div>

                      {showAddRef && (
                        <form onSubmit={handleAddRefSubmit} className="add-detail-form animate-fadeIn">
                          <div className="form-grid-inputs">
                            <input 
                              type="text" 
                              placeholder="Reference Name" 
                              value={newRef.name} 
                              onChange={(e) => setNewRef({...newRef, name: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Position / Company (e.g. Salford & Co. / CEO)" 
                              value={newRef.relation} 
                              onChange={(e) => setNewRef({...newRef, relation: e.target.value})}
                              required 
                            />
                            <input 
                              type="text" 
                              placeholder="Phone Number" 
                              value={newRef.phone} 
                              onChange={(e) => setNewRef({...newRef, phone: e.target.value})}
                              required 
                            />
                            <input 
                              type="email" 
                              placeholder="Email Address" 
                              value={newRef.email} 
                              onChange={(e) => setNewRef({...newRef, email: e.target.value})}
                              required 
                            />
                          </div>
                          <div className="form-action-buttons">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddRef(false)}>Cancel</button>
                            <button type="submit" className="btn-save">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="details-entries-list">
                        {referenceList.map((ref, idx) => (
                          <div key={idx} className="details-entry-item">
                            <div className="entry-item-header">
                              <strong>{ref.name}</strong>
                              <button className="btn-delete-entry" type="button" onClick={() => handleDeleteRef(idx)}>Delete</button>
                            </div>
                            <div className="entry-item-sub">{ref.relation}</div>
                            <div className="entry-item-desc">📞 {ref.phone} | ✉️ {ref.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Update Resume */}
                  <div className="resume-terms-agreement">
                    <label className="terms-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={agreedTerms}
                        onChange={() => setAgreedTerms(!agreedTerms)}
                      />
                      <span className="custom-checkbox-box"></span>
                      <span className="checkbox-text">By clicking checkbox, you agree to our Terms and Conditions and Privacy Policy</span>
                    </label>
                  </div>

                  <div className="resume-update-action-wrap">
                    <button 
                      className="btn btn-primary btn-update-resume"
                      onClick={async () => {
                        if (!agreedTerms) {
                          alert('Please agree to the Terms and Conditions and Privacy Policy.');
                          return;
                        }
                        try {
                          const res = await resumeApi.updateResume({
                            skills,
                            education: educationList,
                            experience: experienceList,
                            portfolio: portfolioList,
                            languages: languageList,
                            references: referenceList
                          });
                          if (res.success) {
                            alert('Resume updated successfully!');
                          }
                        } catch (err) {
                          alert(err.message || 'Failed to update resume');
                        }
                      }}
                    >
                      Update Resume
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CV MANAGER TAB */}
            {activeTab === 'cv-manager' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-cv-manager">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">CV Manager</h2>
                </div>

                <div className="glass-card cv-manager-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* PDF Download option */}
                  <div className="cv-manager-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={32} style={{ color: '#e11d48' }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{profile.name}_CV.pdf</h4>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Selected Template: {selectedTemplate === 1 ? 'Juliana Silva' : selectedTemplate === 2 ? 'Daniel Gallego' : selectedTemplate === 3 ? 'Isabel Schumacher' : 'Richard Sanchez'}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
                  </div>

                  {/* Word / DOCX Automated CV option */}
                  <div className="cv-manager-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={32} style={{ color: '#0284c7' }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{profile.name}_AutomatedCV.docx</h4>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Automatically generated using professional resume layout & styling rules.</span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={handleGenerateCV}
                      disabled={isGeneratingCV}
                    >
                      {isGeneratingCV ? 'Generating...' : 'Generate Word CV'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN PANEL TAB */}
            {activeTab === 'admin' && user?.role === 'admin' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-admin">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">Admin Panel</h2>
                </div>

                {/* Stats Dashboard */}
                {adminStats && (
                  <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="dashboard-stat-card glass-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--blue">
                        <User size={22} />
                      </div>
                      <div className="dashboard-stat-card__content">
                        <span className="dashboard-stat-card__label">Total Users</span>
                        <h3 className="dashboard-stat-card__value">{adminStats.totalUsers}</h3>
                      </div>
                    </div>
                    <div className="dashboard-stat-card glass-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--green">
                        <Briefcase size={22} />
                      </div>
                      <div className="dashboard-stat-card__content">
                        <span className="dashboard-stat-card__label">Total Jobs</span>
                        <h3 className="dashboard-stat-card__value">{adminStats.totalJobs}</h3>
                      </div>
                    </div>
                    <div className="dashboard-stat-card glass-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--yellow">
                        <CheckCircle size={22} />
                      </div>
                      <div className="dashboard-stat-card__content">
                        <span className="dashboard-stat-card__label">Pending Verifications</span>
                        <h3 className="dashboard-stat-card__value">{pendingVerifications.length}</h3>
                      </div>
                    </div>
                    <div className="dashboard-stat-card glass-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--pink">
                        <Mail size={22} />
                      </div>
                      <div className="dashboard-stat-card__content">
                        <span className="dashboard-stat-card__label">Messages</span>
                        <h3 className="dashboard-stat-card__value">{adminStats.totalContacts}</h3>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. Pending Verifications Section */}
                <div className="dashboard-pane__section glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="dashboard-section-title" style={{ marginBottom: '16px' }}>Employer verification requests ({pendingVerifications.length})</h3>
                  {pendingVerifications.length === 0 ? (
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>No pending employer verification requests.</p>
                  ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Company</th>
                            <th style={{ padding: '12px' }}>Contact Email</th>
                            <th style={{ padding: '12px' }}>BR Document</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingVerifications.map((u) => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px' }}><strong>{u.organizationName || u.name}</strong></td>
                              <td style={{ padding: '12px' }}>{u.email}</td>
                              <td style={{ padding: '12px' }}>
                                {u.companyBR ? (
                                  <a href={`http://localhost:5000/uploads/br/${u.companyBR}`} target="_blank" rel="noreferrer" style={{ color: '#004ae4', textDecoration: 'underline' }}>
                                    View BR Document
                                  </a>
                                ) : 'None'}
                              </td>
                              <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: '#16a34a' }} onClick={() => handleVerifyCompany(u._id)}>Verify</button>
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', background: '#dc2626', color: '#fff' }} onClick={() => handleRejectVerification(u._id)}>Reject</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. User Management Section */}
                <div className="dashboard-pane__section glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="dashboard-section-title" style={{ marginBottom: '16px' }}>Manage Users ({adminUsers.length})</h3>
                  <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Name</th>
                          <th style={{ padding: '12px' }}>Email</th>
                          <th style={{ padding: '12px' }}>Role</th>
                          <th style={{ padding: '12px' }}>NIC</th>
                          <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((u) => (
                          <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>{u.name}</td>
                            <td style={{ padding: '12px' }}>{u.email}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                textTransform: 'capitalize',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'employer' ? '#fef3c7' : '#dbeafe',
                                color: u.role === 'admin' ? '#991b1b' : u.role === 'employer' ? '#92400e' : '#1e40af'
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{u.nic || '-'}</td>
                            <td style={{ padding: '12px' }}>
                              {u.role !== 'admin' && (
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', background: '#dc2626', color: '#fff' }} onClick={() => handleAdminDeleteUser(u._id)}>Delete</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Job Moderation Section */}
                <div className="dashboard-pane__section glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="dashboard-section-title" style={{ marginBottom: '16px' }}>Moderate Vacancies ({adminJobs.length})</h3>
                  <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Job Title</th>
                          <th style={{ padding: '12px' }}>Company</th>
                          <th style={{ padding: '12px' }}>Location</th>
                          <th style={{ padding: '12px' }}>Type</th>
                          <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminJobs.map((j) => (
                          <tr key={j._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}><strong>{j.title}</strong></td>
                            <td style={{ padding: '12px' }}>{j.company}</td>
                            <td style={{ padding: '12px' }}>{j.location}</td>
                            <td style={{ padding: '12px' }}>{j.type}</td>
                            <td style={{ padding: '12px' }}>
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', background: '#dc2626', color: '#fff' }} onClick={() => handleAdminDeleteJob(j._id)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Contact messages view */}
                <div className="dashboard-pane__section glass-card" style={{ padding: '24px' }}>
                  <h3 className="dashboard-section-title" style={{ marginBottom: '16px' }}>Received Inquiries ({adminContacts.length})</h3>
                  {adminContacts.length === 0 ? (
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>No inquiries received.</p>
                  ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Sender</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Subject</th>
                            <th style={{ padding: '12px' }}>Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminContacts.map((c) => (
                            <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px' }}><strong>{c.name}</strong></td>
                              <td style={{ padding: '12px' }}>{c.email}</td>
                              <td style={{ padding: '12px' }}>{c.subject}</td>
                              <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-all' }}>{c.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EMPLOYER MY JOBS TAB */}
            {activeTab === 'my-jobs' && role === 'employer' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-my-jobs">
                <div className="dashboard-pane__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="dashboard-pane__title">My Posted Jobs</h2>
                  <Link to="/post-vacancy" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    + Post New Job
                  </Link>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  {employerJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                      <Briefcase size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      <p>You haven't posted any jobs yet.</p>
                      <Link to="/post-vacancy" className="btn btn-primary" style={{ marginTop: '16px' }}>Post a Job</Link>
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Job Title</th>
                            <th style={{ padding: '12px' }}>Location</th>
                            <th style={{ padding: '12px' }}>Type</th>
                            <th style={{ padding: '12px' }}>Posted On</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employerJobs.map((j) => (
                            <tr key={j._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px' }}>
                                <strong>{j.title}</strong>
                                <br/>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{j.category || j.industry}</span>
                              </td>
                              <td style={{ padding: '12px' }}>{j.location}</td>
                              <td style={{ padding: '12px' }}>{j.type || 'Full Time'}</td>
                              <td style={{ padding: '12px' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <Link to={`/jobs/${j._id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="View">
                                    <Eye size={14} />
                                  </Link>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '6px 10px', fontSize: '12px', color: '#0369a1', background: '#e0f2fe' }} 
                                    onClick={() => handleEditJobClick(j)}
                                    title="Edit"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '6px 10px', fontSize: '12px', color: '#b91c1c', background: '#fee2e2' }} 
                                    onClick={() => handleEmployerDeleteJob(j._id)}
                                    title="Delete"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHANGE PASSWORD TAB */}
            {activeTab === 'change-password' && (
              <div className="dashboard-pane animate-fadeIn" id="pane-change-password">
                <div className="dashboard-pane__header">
                  <h2 className="dashboard-pane__title">Change Password</h2>
                </div>

                <div className="glass-card change-password-card" style={{ padding: '30px', maxWidth: '500px' }}>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (passwords.new !== passwords.confirm) {
                      alert('New passwords do not match.');
                      return;
                    }
                    try {
                      const res = await userApi.changePassword({
                        currentPassword: passwords.current,
                        newPassword: passwords.new
                      });
                      if (res.success) {
                        alert('Password updated successfully!');
                        setPasswords({ current: '', new: '', confirm: '' });
                      }
                    } catch (err) {
                      alert(err.message || 'Failed to update password');
                    }
                  }}>
                    <div className="form-group" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Current Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
                        value={passwords.current} 
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>New Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
                        value={passwords.new} 
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
                        value={passwords.confirm} 
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                        required 
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Password</button>
                  </form>
                </div>

              </div>
            )}


          </div>
        </div>
      </div>

      {/* EDIT JOB MODAL */}
      {showEditJobModal && editJobForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="glass-card animate-fadeIn" style={{ background: '#fff', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Edit Job Vacancy</h3>
              <button onClick={() => setShowEditJobModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Job Title</label>
                <input type="text" className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={editJobForm.title || ''} onChange={e => setEditJobForm({...editJobForm, title: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Location</label>
                  <input type="text" className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={editJobForm.location || ''} onChange={e => setEditJobForm({...editJobForm, location: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Job Type</label>
                  <select className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={editJobForm.type || ''} onChange={e => setEditJobForm({...editJobForm, type: e.target.value})} required>
                    <option value="">Select Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Category</label>
                  <input type="text" className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={editJobForm.category || ''} onChange={e => setEditJobForm({...editJobForm, category: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Salary Range</label>
                  <input type="text" className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={editJobForm.salaryText || editJobForm.salary || ''} onChange={e => setEditJobForm({...editJobForm, salaryText: e.target.value})} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Application Deadline</label>
                <input type="date" className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={editJobForm.deadline || ''} onChange={e => setEditJobForm({...editJobForm, deadline: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Job Description</label>
                <textarea className="form-input" rows="5" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }} value={editJobForm.description || ''} onChange={e => setEditJobForm({...editJobForm, description: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditJobModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUpdatingJob}>{isUpdatingJob ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
