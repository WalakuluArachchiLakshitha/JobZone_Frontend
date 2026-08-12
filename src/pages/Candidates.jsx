import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Locate,
  Filter,
  ArrowLeftRight,
  List,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { applicationsApi } from '../api/applicationsApi';
import './Candidates.css';

const CANDIDATES_PER_PAGE = 10;

export default function Candidates() {
  const { isAuthenticated, role } = useAuth();
  const isLoggedIn = isAuthenticated;
  const userRole = role;

  // Search state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchSector, setSearchSector] = useState('');

  // Active search terms (applied on search click)
  const [activeSearch, setActiveSearch] = useState('');
  const [activeLocation, setActiveLocation] = useState('');
  const [activeSector, setActiveSector] = useState('');

  // Filter state
  const [selectedLocations, setSelectedLocations] = useState(['Sri Lanka']);
  const [selectedSectors, setSelectedSectors] = useState(['All']);
  const [selectedDatePosted, setSelectedDatePosted] = useState('All');

  // Interactive Saved Candidates state
  const [savedCandidates, setSavedCandidates] = useState(() => {
    const saved = localStorage.getItem('jobzoneSavedCandidates');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jobzoneSavedCandidates', JSON.stringify(savedCandidates));
  }, [savedCandidates]);

  // UI state
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Candidates List State
  const [candidatesList, setCandidatesList] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic aggregation counts from backend
  const [filterCounts, setFilterCounts] = useState({ locations: [], sectors: [] });
  const [showAllSectors, setShowAllSectors] = useState(false);

  // Collapse state for sidebar
  const [collapsedSections, setCollapsedSections] = useState({
    gender: true
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (arr, setArr, value) => {
    setArr((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedLocations(['Sri Lanka']);
    setSelectedSectors(['All']);
    setSelectedDatePosted('All');
    setActiveSearch('');
    setActiveLocation('');
    setActiveSector('');
    setSearchTitle('');
    setSearchLocation('');
    setSearchSector('');
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchTitle);
    setActiveLocation(searchLocation);
    setActiveSector(searchSector);
    setCurrentPage(1);
  };

  // Fetch candidates from API
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: CANDIDATES_PER_PAGE,
        };

        if (isLoggedIn && userRole === 'employer') {
          const res = await applicationsApi.getApplications(queryParams);
          if (res.success) {
            setCandidatesList(res.applications || []);
            setTotalCandidates(res.total || 0);
            setTotalPages(res.totalPages || 1);
          }
        } else {
          if (activeSearch) {
            queryParams.search = activeSearch;
          }

          if (activeLocation) {
            queryParams.location = activeLocation;
          } else if (selectedLocations.length > 0) {
            queryParams.location = selectedLocations[0];
          }

          if (activeSector) {
            queryParams.sector = activeSector;
          } else if (selectedSectors.length > 0 && !selectedSectors.includes('All')) {
            queryParams.sector = selectedSectors[0];
          }

          const res = await userApi.getSeekers(queryParams);
          if (res.success) {
            setCandidatesList(res.seekers || []);
            setTotalCandidates(res.total || 0);
            setTotalPages(res.totalPages || 1);
            if (res.counts) {
              setFilterCounts(res.counts);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [activeSearch, activeLocation, activeSector, selectedLocations, selectedSectors, currentPage, isLoggedIn, userRole]);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    return pages;
  };

  // Sidebar content
  const renderFilters = (isMobile = false) => (
    <div className="candidates-filters__content">
      {/* Date Posted */}
      <div className={isMobile ? "candidates-filters__section" : "candidates-sidebar-card"}>
        <button
          className="candidates-filters__section-header"
          onClick={() => toggleSection('datePosted')}
          type="button"
        >
          <span>Date Posted</span>
          {collapsedSections.datePosted ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.datePosted && (
          <div className="candidates-filters__options">
            {[
              { label: 'Last Hour', count: 0 },
              { label: 'Last 24 hours', count: 0 },
              { label: 'Last week', count: 32 },
              { label: 'Last 2 weeks', count: 55 },
              { label: 'Last month', count: 120 },
              { label: 'All', count: 577 }
            ].map((date) => (
              <label key={date.label} className="candidates-filters__checkbox" htmlFor={`c-filter-date-${date.label}`}>
                <input 
                  type="checkbox" 
                  id={`c-filter-date-${date.label}`} 
                  checked={selectedDatePosted === date.label} 
                  onChange={() => {
                    setSelectedDatePosted(date.label);
                    setCurrentPage(1);
                  }}
                />
                <span className="candidates-filters__checkmark" />
                <span className="candidates-filters__label">{date.label}</span>
                <span className="candidates-filters__count">{date.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sector */}
      <div className={isMobile ? "candidates-filters__section" : "candidates-sidebar-card"}>
        <button
          className="candidates-filters__section-header"
          onClick={() => toggleSection('sector')}
          type="button"
        >
          <span>Sector</span>
          {collapsedSections.sector ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.sector && (
          <div className="candidates-filters__options">
            <label className="candidates-filters__checkbox" htmlFor="c-filter-sec-All">
              <input
                type="checkbox"
                id="c-filter-sec-All"
                checked={selectedSectors.includes('All')}
                onChange={() => toggleFilter(selectedSectors, setSelectedSectors, 'All')}
              />
              <span className="candidates-filters__checkmark" />
              <span className="candidates-filters__label">All</span>
              <span className="candidates-filters__count">{totalCandidates}</span>
            </label>
            {filterCounts.sectors.slice(0, showAllSectors ? undefined : 6).map((sec) => (
              <label key={sec.name} className="candidates-filters__checkbox" htmlFor={`c-filter-sec-${sec.name}`}>
                <input
                  type="checkbox"
                  id={`c-filter-sec-${sec.name}`}
                  checked={selectedSectors.includes(sec.name)}
                  onChange={() => toggleFilter(selectedSectors, setSelectedSectors, sec.name)}
                />
                <span className="candidates-filters__checkmark" />
                <span className="candidates-filters__label">{sec.name}</span>
                <span className="candidates-filters__count">{sec.count}</span>
              </label>
            ))}
            {filterCounts.sectors.length > 6 && (
              <button 
                type="button" 
                className="candidates-filters__see-more"
                onClick={() => setShowAllSectors(!showAllSectors)}
              >
                {showAllSectors ? '- see less' : '+ see more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Locations */}
      <div className={isMobile ? "candidates-filters__section" : "candidates-sidebar-card"}>
        <button
          className="candidates-filters__section-header"
          onClick={() => toggleSection('locations')}
          type="button"
        >
          <span>Locations</span>
          {collapsedSections.locations ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.locations && (
          <div className="candidates-filters__options">
            {filterCounts.locations.map((loc) => (
              <label key={loc.name} className="candidates-filters__checkbox" htmlFor={`c-filter-loc-${loc.name}`}>
                <input
                  type="checkbox"
                  id={`c-filter-loc-${loc.name}`}
                  checked={selectedLocations.includes(loc.name)}
                  onChange={() => toggleFilter(selectedLocations, setSelectedLocations, loc.name)}
                />
                <span className="candidates-filters__checkmark" />
                <span className="candidates-filters__label">{loc.name}</span>
                <span className="candidates-filters__count">{loc.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender */}
      <div className={isMobile ? "candidates-filters__section" : "candidates-sidebar-card"}>
        <button
          className="candidates-filters__section-header"
          onClick={() => toggleSection('gender')}
          type="button"
        >
          <span>Gender</span>
          {collapsedSections.gender ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.gender && (
          <div className="candidates-filters__options">
            {['Male', 'Female', 'Any'].map((gender) => (
              <label key={gender} className="candidates-filters__checkbox" htmlFor={`c-filter-gender-${gender}`}>
                <input type="checkbox" id={`c-filter-gender-${gender}`} />
                <span className="candidates-filters__checkmark" />
                <span className="candidates-filters__label">{gender}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const groupedJobs = {};
  if (isLoggedIn && userRole === 'employer') {
    candidatesList.forEach(app => {
      const job = app.job;
      const jobId = job?._id || job?.id;
      if (!jobId) return;
      if (!groupedJobs[jobId]) {
        groupedJobs[jobId] = {
          job,
          applications: []
        };
      }
      groupedJobs[jobId].applications.push(app);
    });
  }

  return (
    <main className="candidates-page">
      {/* ===== HERO BANNER ===== */}
      <section className="candidates-hero">
        <div className="container">
          <div className="candidates-hero__content">
            <h1 className="candidates-hero__title">
              {isLoggedIn && userRole === 'employer' ? 'Job Applicants' : 'Candidates'}
            </h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="candidates-breadcrumb-bar">
        <div className="container">
          <div className="candidates-breadcrumb">
            <Link to="/">Home</Link>
            <span className="candidates-breadcrumb__separator">&gt;</span>
            <span className="candidates-breadcrumb__current">
              {isLoggedIn && userRole === 'employer' ? 'Applicants' : 'Candidates'}
            </span>
          </div>
        </div>
      </div>

      {/* ===== STANDALONE SEARCH CARD ===== */}
      {!(isLoggedIn && userRole === 'employer') && (
        <section className="candidates-search-section">
          <div className="container">
            <form className="candidates-search" onSubmit={handleSearch} id="candidates-search-form">
              <div className="candidates-search__field">
                <input
                  type="text"
                  placeholder="Title, Keywords, or Phrase"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="candidates-search__input"
                  id="candidates-search-title"
                />
              </div>
              
              <div className="candidates-search__divider" />
              
              <div className="candidates-search__field candidates-search__field--location">
                <input
                  type="text"
                  placeholder="City, State or ZIP"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="candidates-search__input"
                  id="candidates-search-location"
                />
                <Locate size={18} className="candidates-search__locate-icon" />
              </div>
              
              <div className="candidates-search__divider" />
              
              <div className="candidates-search__field">
                <select
                  value={searchSector}
                  onChange={(e) => setSearchSector(e.target.value)}
                  className="candidates-search__select"
                  id="candidates-search-sector"
                  aria-label="Select Sector"
                >
                  <option value="">Select Sector</option>
                  <option value="Accounting & Finance">Accounting & Finance</option>
                  <option value="Administration & Office Support">Administration & Office Support</option>
                  <option value="Agriculture, Farming">Agriculture, Farming</option>
                  <option value="Apparel, Garments & Textile">Apparel, Garments & Textile</option>
                  <option value="Architecture, Construction & Property">Architecture, Construction & Property</option>
                  <option value="Engineering & Technical">Engineering & Technical</option>
                  <option value="Hospitality, Travel & Tourism">Hospitality, Travel & Tourism</option>
                  <option value="Marketing, Sales & Business Development">Marketing, Sales & Business Development</option>
                </select>
                <ChevronDown size={14} className="candidates-search__select-chevron" />
              </div>
              
              <button type="submit" className="candidates-search__btn" id="candidates-search-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="candidates-content">
        <div className="container">
          <div className="candidates-layout" style={isLoggedIn && userRole === 'employer' ? { gridTemplateColumns: '1fr' } : {}}>
            {/* Mobile Filter Button */}
            {!(isLoggedIn && userRole === 'employer') && (
              <button
                className="candidates-mobile-filter-btn btn btn-secondary"
                onClick={() => setMobileFiltersOpen(true)}
                id="mobile-filter-btn"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            )}

            {/* Filter Sidebar - Desktop */}
            {!(isLoggedIn && userRole === 'employer') && (
              <aside className="candidates-sidebar" id="candidates-sidebar">
                {renderFilters(false)}
              </aside>
            )}

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && !(isLoggedIn && userRole === 'employer') && (
              <div className="candidates-drawer-overlay" onClick={() => setMobileFiltersOpen(false)}>
                <aside
                  className="candidates-drawer"
                  onClick={(e) => e.stopPropagation()}
                  id="mobile-filter-drawer"
                >
                  <div className="candidates-drawer__header">
                    <h3 className="candidates-drawer__title">
                      <SlidersHorizontal size={18} />
                      Filters
                    </h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="candidates-drawer__close"
                      id="close-mobile-filters"
                      aria-label="Close filters"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {renderFilters(true)}
                  <div className="candidates-drawer__footer">
                    <button
                      className="btn btn-secondary"
                      onClick={clearAllFilters}
                      id="drawer-reset-filters"
                    >
                      Reset
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setMobileFiltersOpen(false)}
                      id="drawer-apply-filters"
                    >
                      Show {totalCandidates} Results
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {/* Candidates Results */}
            <div className="candidates-results">
              {/* Results Header */}
              <div className="candidates-results__header">
                <div className="candidates-results__header-left">
                  <h2 className="candidates-results__title">
                    {isLoggedIn && userRole === 'employer' 
                      ? `${totalCandidates} Total Applications`
                      : `${totalCandidates} Candidates Found`
                    }
                  </h2>
                  <p className="candidates-results__subtitle">
                    {isLoggedIn && userRole === 'employer'
                      ? `Showing ${candidatesList.length} application${candidatesList.length === 1 ? '' : 's'}`
                      : `Displayed Here: {totalCandidates > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0} - {Math.min(currentPage * CANDIDATES_PER_PAGE, totalCandidates)} Candidates`
                    }
                  </p>
                </div>
                
                {!(isLoggedIn && userRole === 'employer') && (
                  <div className="candidates-results__header-right">
                    <div className="candidates-results__select-wrap">
                      <ArrowUpDown size={14} className="candidates-results__sort-left-icon" />
                      <select
                        id="candidates-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="candidates-results__sort-select"
                        aria-label="Sort by"
                      >
                        <option value="relevance">Most Recent</option>
                      </select>
                      <ChevronDown size={12} className="candidates-results__select-icon" />
                    </div>

                    <div className="candidates-results__select-wrap">
                      <List size={14} className="candidates-results__sort-left-icon" />
                      <select className="candidates-results__sort-select" defaultValue="10" aria-label="Records per page">
                        <option value="10">10 Per Page</option>
                        <option value="20">20 Per Page</option>
                        <option value="50">50 Per Page</option>
                      </select>
                      <ChevronDown size={12} className="candidates-results__select-icon" />
                    </div>
                  </div>
                )}
              </div>

              {/* Candidates Cards List */}
              <div className="candidates-results__list">
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#004ae4', fontSize: '1.25rem', fontWeight: '500' }}>
                    Loading candidates...
                  </div>
                ) : candidatesList.length > 0 ? (
                  isLoggedIn && userRole === 'employer' ? (
                    Object.values(groupedJobs).map((group, groupIdx) => (
                      <div key={group.job._id || group.job.id} className="job-applicants-group" style={{ marginBottom: '30px' }}>
                        <div className="job-applicants-group__header" style={{
                          background: 'linear-gradient(135deg, #f5f8ff 0%, #eef3ff 100%)',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          borderLeft: '4px solid #004ae4',
                          marginBottom: '15px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0, 74, 228, 0.04)'
                        }}>
                          <div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>
                              {group.job.title}
                            </h3>
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                              {group.job.type} • {group.job.location}
                            </span>
                          </div>
                          <span style={{
                            background: '#004ae4',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {group.applications.length} {group.applications.length === 1 ? 'Applicant' : 'Applicants'}
                          </span>
                        </div>
                        <div className="job-applicants-group__list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {group.applications.map((app, idx) => {
                            const cand = app.seeker;
                            if (!cand) return null;
                            const candId = cand._id || cand.id;
                            const name = cand.name || `${cand.firstName} ${cand.lastName}`;
                            const serverOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
                            const avatarUrl = cand.avatar 
                              ? (cand.avatar.startsWith('http') ? cand.avatar : `${serverOrigin}${cand.avatar.startsWith('/') ? cand.avatar : `/${cand.avatar}`}`) 
                              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80';
                            const roleName = cand.title || 'Professional Seeker';
                            const candLocation = cand.location || 'Sri Lanka';
                            const firstSkill = cand.skills && cand.skills.length > 0 ? cand.skills[0] : 'Information Technology';
                            const isSaved = savedCandidates.includes(candId);
                            
                            return (
                              <div
                                key={app._id || app.id}
                                className="candidate-row-card"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                              >
                                <div className="candidate-row-card__avatar-container">
                                  <Link to={`/candidates/${candId}`} className="candidate-row-card__avatar-link">
                                    <img 
                                      src={avatarUrl} 
                                      alt={`${name} avatar`} 
                                      className="candidate-row-card__avatar"
                                      loading="lazy"
                                    />
                                  </Link>
                                </div>

                                <div className="candidate-row-card__content">
                                  <h3 className="candidate-row-card__name">
                                    <Link to={`/candidates/${candId}`}>{name}</Link>
                                  </h3>
                                  <div className="candidate-row-card__metadata">
                                    <span className="candidate-row-card__role">{roleName}</span>
                                    <span className="candidate-row-card__meta-item">
                                      <MapPin size={13} className="candidate-row-card__meta-icon" />
                                      {candLocation}
                                    </span>
                                    <span className="candidate-row-card__meta-divider">|</span>
                                    <span className="candidate-row-card__meta-item">
                                      <Filter size={13} className="candidate-row-card__meta-icon" />
                                      {firstSkill}
                                    </span>
                                    {app.status && (
                                      <>
                                        <span className="candidate-row-card__meta-divider">|</span>
                                        <span className={`status-badge status-badge--${app.status.toLowerCase()}`} style={{
                                          padding: '2px 8px',
                                          borderRadius: '4px',
                                          fontSize: '0.75rem',
                                          fontWeight: '600',
                                          textTransform: 'capitalize',
                                          background: app.status === 'accepted' ? '#e2fbe8' : app.status === 'rejected' ? '#ffebe9' : '#fff3e0',
                                          color: app.status === 'accepted' ? '#0e7025' : app.status === 'rejected' ? '#c5221f' : '#b06000'
                                        }}>
                                          {app.status}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {app.coverLetter && (
                                    <p style={{
                                      fontSize: '0.85rem',
                                      color: '#475569',
                                      margin: '8px 0 0 0',
                                      fontStyle: 'italic',
                                      background: '#f8fafc',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      borderLeft: '2px solid #cbd5e1'
                                    }}>
                                      <strong>Cover Letter:</strong> "{app.coverLetter.length > 120 ? `${app.coverLetter.substring(0, 120)}...` : app.coverLetter}"
                                    </p>
                                  )}
                                </div>

                                <div className="candidate-row-card__actions">
                                  <button 
                                    className={`btn candidate-row-card__save-btn ${isSaved ? 'candidate-row-card__save-btn--saved' : ''}`}
                                    onClick={() => {
                                      if (isSaved) {
                                        setSavedCandidates(prev => prev.filter(id => id !== candId));
                                      } else {
                                        setSavedCandidates(prev => [...prev, candId]);
                                      }
                                    }}
                                    type="button"
                                  >
                                    <ArrowLeftRight size={14} />
                                    {isSaved ? 'Saved' : 'Save Candidate'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    candidatesList.map((cand, idx) => {
                      const candId = cand._id || cand.id;
                      const name = cand.name || `${cand.firstName} ${cand.lastName}`;
                      const serverOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
                      const avatarUrl = cand.avatar 
                        ? (cand.avatar.startsWith('http') ? cand.avatar : `${serverOrigin}${cand.avatar.startsWith('/') ? cand.avatar : `/${cand.avatar}`}`) 
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80';
                      const roleName = cand.title || 'Professional Seeker';
                      const candLocation = cand.location || 'Sri Lanka';
                      const firstSkill = cand.skills && cand.skills.length > 0 ? cand.skills[0] : 'Information Technology';
                      const isSaved = savedCandidates.includes(candId);
                      
                      return (
                        <div
                          key={candId}
                          className="candidate-row-card"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="candidate-row-card__avatar-container">
                            <img 
                              src={avatarUrl} 
                              alt={`${name} avatar`} 
                              className="candidate-row-card__avatar"
                              loading="lazy"
                            />
                          </div>

                          <div className="candidate-row-card__content">
                            <h3 className="candidate-row-card__name">
                              {name}
                            </h3>
                            <div className="candidate-row-card__metadata">
                              <span className="candidate-row-card__role">{roleName}</span>
                              <span className="candidate-row-card__meta-item">
                                <MapPin size={13} className="candidate-row-card__meta-icon" />
                                {candLocation}
                              </span>
                              <span className="candidate-row-card__meta-divider">|</span>
                              <span className="candidate-row-card__meta-item">
                                <Filter size={13} className="candidate-row-card__meta-icon" />
                                {firstSkill}
                              </span>
                            </div>
                          </div>

                          <div className="candidate-row-card__actions">
                            <button 
                              className={`btn candidate-row-card__save-btn ${isSaved ? 'candidate-row-card__save-btn--saved' : ''}`}
                              onClick={() => {
                                alert('Only registered employers can save candidates.');
                              }}
                              type="button"
                            >
                              <ArrowLeftRight size={14} />
                              {isSaved ? 'Saved' : 'Save Candidate'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  <div className="candidates-results__empty">
                    <Search size={48} />
                    <h3>{isLoggedIn && userRole === 'employer' ? 'No applications received' : 'No candidates found'}</h3>
                    <p>{isLoggedIn && userRole === 'employer' ? 'When candidates apply for your jobs, they will appear here.' : 'Try adjusting your search query or filters.'}</p>
                    {!(isLoggedIn && userRole === 'employer') && (
                      <button className="btn btn-primary" onClick={clearAllFilters} id="empty-clear-filters">
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="candidates-pagination" aria-label="Candidates results pagination">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`candidates-pagination__page ${page === currentPage ? 'candidates-pagination__page--active' : ''}`}
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      id={`pagination-page-${page}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="candidates-pagination__ellipsis">...</span>
                      <button
                        className={`candidates-pagination__page ${currentPage === totalPages ? 'candidates-pagination__page--active' : ''}`}
                        onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                        id={`pagination-page-${totalPages}`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    className="candidates-pagination__btn"
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage((p) => p + 1); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    id="pagination-next"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
