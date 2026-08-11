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
        }
      } catch (err) {
        console.error('Error fetching seekers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [activeSearch, activeLocation, activeSector, selectedLocations, selectedSectors, currentPage]);

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
            {[
              { label: 'All', count: 577 },
              { label: 'Accounting & Finance', count: 125 },
              { label: 'Administration & Office Support', count: 205 },
              { label: 'Agriculture, Farming', count: 17 },
              { label: 'Apparel, Garments & Textile', count: 47 },
              { label: 'Architecture, Construction & Property', count: 2 }
            ].map((sec) => (
              <label key={sec.label} className="candidates-filters__checkbox" htmlFor={`c-filter-sec-${sec.label}`}>
                <input
                  type="checkbox"
                  id={`c-filter-sec-${sec.label}`}
                  checked={selectedSectors.includes(sec.label)}
                  onChange={() => toggleFilter(selectedSectors, setSelectedSectors, sec.label)}
                />
                <span className="candidates-filters__checkmark" />
                <span className="candidates-filters__label">{sec.label}</span>
                <span className="candidates-filters__count">{sec.count}</span>
              </label>
            ))}
            <button type="button" className="candidates-filters__see-more">+ see more</button>
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
            {[
              { label: 'Foreign Jobs', count: 0 },
              { label: 'Australia', count: 0 },
              { label: 'Canada', count: 0 },
              { label: 'UAE', count: 0 },
              { label: 'USA', count: 2 },
              { label: 'Sri Lanka', count: 577 }
            ].map((loc) => (
              <label key={loc.label} className="candidates-filters__checkbox" htmlFor={`c-filter-loc-${loc.label}`}>
                <input
                  type="checkbox"
                  id={`c-filter-loc-${loc.label}`}
                  checked={selectedLocations.includes(loc.label)}
                  onChange={() => toggleFilter(selectedLocations, setSelectedLocations, loc.label)}
                />
                <span className="candidates-filters__checkmark" />
                <span className="candidates-filters__label">{loc.label}</span>
                <span className="candidates-filters__count">{loc.count}</span>
              </label>
            ))}
            <button type="button" className="candidates-filters__see-more">+ see more</button>
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

  return (
    <main className="candidates-page">
      {/* ===== HERO BANNER ===== */}
      <section className="candidates-hero">
        <div className="container">
          <div className="candidates-hero__content">
            <h1 className="candidates-hero__title">Candidates</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="candidates-breadcrumb-bar">
        <div className="container">
          <div className="candidates-breadcrumb">
            <Link to="/">Home</Link>
            <span className="candidates-breadcrumb__separator">&gt;</span>
            <span className="candidates-breadcrumb__current">Candidates</span>
          </div>
        </div>
      </div>

      {/* ===== STANDALONE SEARCH CARD ===== */}
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

      {/* Main Content */}
      <section className="candidates-content">
        <div className="container">
          <div className="candidates-layout">
            {/* Mobile Filter Button */}
            <button
              className="candidates-mobile-filter-btn btn btn-secondary"
              onClick={() => setMobileFiltersOpen(true)}
              id="mobile-filter-btn"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>

            {/* Filter Sidebar - Desktop */}
            <aside className="candidates-sidebar" id="candidates-sidebar">
              {renderFilters(false)}
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
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
                  <h2 className="candidates-results__title">{totalCandidates} Candidates Found</h2>
                  <p className="candidates-results__subtitle">
                    Displayed Here: {totalCandidates > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0} - {Math.min(currentPage * CANDIDATES_PER_PAGE, totalCandidates)} Candidates
                  </p>
                </div>
                
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
              </div>

              {/* Candidates Cards List */}
              <div className="candidates-results__list">
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#004ae4', fontSize: '1.25rem', fontWeight: '500' }}>
                    Loading candidates...
                  </div>
                ) : candidatesList.length > 0 ? (
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
                          {isLoggedIn && userRole === 'employer' ? (
                            <Link to={`/candidates/${candId}`} className="candidate-row-card__avatar-link">
                              <img 
                                src={avatarUrl} 
                                alt={`${name} avatar`} 
                                className="candidate-row-card__avatar"
                                loading="lazy"
                              />
                            </Link>
                          ) : (
                            <img 
                              src={avatarUrl} 
                              alt={`${name} avatar`} 
                              className="candidate-row-card__avatar"
                              loading="lazy"
                            />
                          )}
                        </div>

                        <div className="candidate-row-card__content">
                          <h3 className="candidate-row-card__name">
                            {isLoggedIn && userRole === 'employer' ? (
                              <Link to={`/candidates/${candId}`}>{name}</Link>
                            ) : (
                              name
                            )}
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
                              if (!isLoggedIn || userRole !== 'employer') {
                                alert('Only registered employers can save candidates.');
                                return;
                              }
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
                  })
                ) : (
                  <div className="candidates-results__empty">
                    <Search size={48} />
                    <h3>No candidates found</h3>
                    <p>Try adjusting your search query or filters.</p>
                    <button className="btn btn-primary" onClick={clearAllFilters} id="empty-clear-filters">
                      Clear All Filters
                    </button>
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
