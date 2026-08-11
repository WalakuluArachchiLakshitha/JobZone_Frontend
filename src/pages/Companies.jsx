import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, UserPlus, CheckCircle, Users } from 'lucide-react';
import { companiesApi } from '../api/companiesApi';
import './Companies.css';

export default function Companies() {
  const [keyword, setKeyword] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  
  // Selected Sidebar Filter State
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDatePosted, setSelectedDatePosted] = useState('All');
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedTeamSizes, setSelectedTeamSizes] = useState([]);
  
  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState('Most Recent');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Followed Companies State (Persisted in localStorage)
  const [followed, setFollowed] = useState(() => {
    const saved = localStorage.getItem('jobzoneFollowedCompanies');
    return saved ? JSON.parse(saved) : [];
  });

  const [companiesList, setCompaniesList] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic filter counts
  const [filterCounts, setFilterCounts] = useState({ locations: [], industries: [], sizes: [] });
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllSectors, setShowAllSectors] = useState(false);

  useEffect(() => {
    localStorage.setItem('jobzoneFollowedCompanies', JSON.stringify(followed));
  }, [followed]);

  const handleFollowToggle = (e, companyId) => {
    e.preventDefault();
    e.stopPropagation();
    if (followed.includes(companyId)) {
      setFollowed(followed.filter(id => id !== companyId));
    } else {
      setFollowed([...followed, companyId]);
    }
  };

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: pageSize,
        };

        if (keyword) queryParams.search = keyword;
        
        if (locationInput) {
          queryParams.location = locationInput;
        } else if (selectedLocations.length > 0) {
          queryParams.location = selectedLocations[0];
        }

        if (sectorFilter) {
          queryParams.industry = sectorFilter;
        } else if (selectedSectors.length > 0) {
          queryParams.industry = selectedSectors[0];
        }

        if (selectedTeamSizes.length > 0) {
          queryParams.teamSize = selectedTeamSizes[0].split(' ')[0];
        }

        if (sortBy === 'Alphabetical') {
          queryParams.sort = 'Alphabetical';
        }

        const res = await companiesApi.getCompanies(queryParams);
        if (res.success) {
          setCompaniesList(res.companies || []);
          setTotalCompanies(res.total || 0);
          setTotalPages(res.totalPages || 1);
          if (res.counts) {
            setFilterCounts(res.counts);
          }
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [keyword, locationInput, sectorFilter, selectedLocations, selectedSectors, selectedTeamSizes, sortBy, currentPage, pageSize]);

  const displayCount = totalCompanies;

  const handleLocationCheckbox = (loc) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(item => item !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
    setCurrentPage(1);
  };

  const handleSectorCheckbox = (sec) => {
    if (selectedSectors.includes(sec)) {
      setSelectedSectors(selectedSectors.filter(item => item !== sec));
    } else {
      setSelectedSectors([...selectedSectors, sec]);
    }
    setCurrentPage(1);
  };

  const handleTeamSizeCheckbox = (size) => {
    if (selectedTeamSizes.includes(size)) {
      setSelectedTeamSizes(selectedTeamSizes.filter(item => item !== size));
    } else {
      setSelectedTeamSizes([...selectedTeamSizes, size]);
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocationInput('');
    setSectorFilter('');
    setSelectedLocations([]);
    setSelectedDatePosted('All');
    setSelectedSectors([]);
    setSelectedTeamSizes([]);
    setCurrentPage(1);
  };

  return (
    <section className="companies" id="companies-page">
      {/* ===== HEADER HERO BANNER ===== */}
      <div className="companies-hero">
        <h1 className="companies-hero__title">Employer Listing</h1>
      </div>

      {/* ===== BREADCRUMB BAR ===== */}
      <div className="companies-breadcrumb-bar">
        <div className="container">
          <div className="companies-breadcrumb">
            <Link to="/">Home</Link>
            <span className="companies-breadcrumb__separator">&gt;</span>
            <span className="companies-breadcrumb__current">Employer Listing</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="container companies-content-wrap">
        
        {/* ===== TOP SEARCH ROW ===== */}
        <div className="companies-search-section-card glass-card">
          <div className="companies-search-card-inner">
            <div className="companies-search-card__field">
              <Search size={18} className="companies-search-card__icon" />
              <input
                type="text"
                placeholder="Title, Keywords, or Phrase"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
                aria-label="Title, Keywords, or Phrase"
              />
            </div>

            <div className="companies-search-card__divider" />

            <div className="companies-search-card__field">
              <MapPin size={18} className="companies-search-card__icon" />
              <input
                type="text"
                placeholder="City, State or ZIP"
                value={locationInput}
                onChange={(e) => { setLocationInput(e.target.value); setCurrentPage(1); }}
                aria-label="City, State or ZIP"
              />
            </div>

            <div className="companies-search-card__divider" />

            <div className="companies-search-card__field">
              <Building2 size={18} className="companies-search-card__icon" />
              <select
                value={sectorFilter}
                onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
                aria-label="Select Sector"
              >
                <option value="">Select Sector</option>
                {uniqueSectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button 
              className="companies-search-card__btn" 
              aria-label="Search button"
              onClick={() => setCurrentPage(1)}
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* ===== THREE-COLUMN RESPONSIVE LAYOUT ===== */}
        <div className="companies-layout">
          
          {/* Left Column: Sidebar Filters */}
          <aside className="companies-sidebar">
            <div className="companies-sidebar-card glass-card">
              <div className="companies-sidebar__header">
                <span className="companies-sidebar__title">
                  <Building2 size={16} /> Filters
                </span>
                <button className="companies-sidebar__reset" onClick={handleResetFilters}>
                  Reset All
                </button>
              </div>

              {/* Locations Section */}
              <div className="companies-filters__section">
                <h4 className="companies-filters__section-title">Locations</h4>
                <div className="companies-filters__options">
                  {filterCounts.locations.slice(0, showAllLocations ? undefined : 5).map((opt) => (
                    <label key={opt.name} className="companies-filters__checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedLocations.includes(opt.name)}
                        onChange={() => handleLocationCheckbox(opt.name)}
                      />
                      <span className="companies-filters__checkmark"></span>
                      <span className="companies-filters__label">{opt.name}</span>
                      <span className="companies-filters__count">{opt.count}</span>
                    </label>
                  ))}
                  {filterCounts.locations.length > 5 && (
                    <button 
                      type="button"
                      className="companies-filters__see-more" 
                      onClick={() => setShowAllLocations(!showAllLocations)}
                    >
                      {showAllLocations ? '- see less' : '+ see more'}
                    </button>
                  )}
                </div>
              </div>

              {/* Date Posted Section */}
              <div className="companies-filters__section">
                <h4 className="companies-filters__section-title">Date Posted</h4>
                <div className="companies-filters__options">
                  {[
                    { label: 'Last Hour' },
                    { label: 'Last 24 hours' },
                    { label: 'Last week' },
                    { label: 'Last 2 weeks' },
                    { label: 'Last month' },
                    { label: 'All' }
                  ].map((opt) => (
                    <label key={opt.label} className="companies-filters__checkbox">
                      <input 
                        type="radio" 
                        name="datePosted"
                        checked={selectedDatePosted === opt.label}
                        onChange={() => { setSelectedDatePosted(opt.label); setCurrentPage(1); }}
                      />
                      <span className="companies-filters__checkmark" style={{ borderRadius: '50%' }}></span>
                      <span className="companies-filters__label">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sector Section */}
              <div className="companies-filters__section">
                <h4 className="companies-filters__section-title">Sector</h4>
                <div className="companies-filters__options">
                  {filterCounts.industries.slice(0, showAllSectors ? undefined : 5).map((opt) => (
                    <label key={opt.name} className="companies-filters__checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedSectors.includes(opt.name)}
                        onChange={() => handleSectorCheckbox(opt.name)}
                      />
                      <span className="companies-filters__checkmark"></span>
                      <span className="companies-filters__label">{opt.name}</span>
                      <span className="companies-filters__count">{opt.count}</span>
                    </label>
                  ))}
                  {filterCounts.industries.length > 5 && (
                    <button 
                      type="button"
                      className="companies-filters__see-more"
                      onClick={() => setShowAllSectors(!showAllSectors)}
                    >
                      {showAllSectors ? '- see less' : '+ see more'}
                    </button>
                  )}
                </div>
              </div>

              {/* Team Size Section */}
              <div className="companies-filters__section">
                <h4 className="companies-filters__section-title">Team Size</h4>
                <div className="companies-filters__options">
                  {filterCounts.sizes.map((opt) => (
                    <label key={opt.name} className="companies-filters__checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedTeamSizes.includes(opt.name)}
                        onChange={() => handleTeamSizeCheckbox(opt.name)}
                      />
                      <span className="companies-filters__checkmark"></span>
                      <span className="companies-filters__label">{opt.name}</span>
                      <span className="companies-filters__count">{opt.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Listing Results */}
          <main className="companies-results">
            
            {/* Results Header: Sorting & Page Size */}
            <div className="companies-results__header">
              <div className="companies-results__header-left">
                <h3 className="companies-results__found-title">{displayCount} Employers Found</h3>
                <span className="companies-results__found-subtitle">
                  Displayed Here: {Math.min(companiesList.length, 1)} - {Math.min(pageSize, companiesList.length)} Employers
                </span>
              </div>
              <div className="companies-results__header-right">
                {/* Sort Option */}
                <div className="companies-results__select-wrap">
                  <select 
                    value={sortBy} 
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    aria-label="Sort options"
                  >
                    <option value="Most Recent">Most Recent</option>
                    <option value="Alphabetical">Alphabetical</option>
                  </select>
                </div>

                {/* Page Size Option */}
                <div className="companies-results__select-wrap">
                  <select 
                    value={pageSize} 
                    onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                    aria-label="Page size"
                  >
                    <option value={10}>10 Per Page</option>
                    <option value={20}>20 Per Page</option>
                    <option value={50}>50 Per Page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Stack */}
            <div className="companies-results__list">
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#004ae4', fontSize: '1.25rem', fontWeight: '500' }}>
                  Loading companies...
                </div>
              ) : companiesList.length > 0 ? (
                companiesList.map((company) => {
                  const companyId = company._id || company.id;
                  const isFollowed = followed.includes(companyId);
                  return (
                    <div key={companyId} className="employer-row-card glass-card">
                      {/* Left: styled JobZone placeholder Logo box */}
                      <div className="employer-row-card__logo-wrapper">
                        {company.logo ? (
                          <img 
                            src={company.logo.startsWith('http') ? company.logo : `http://localhost:5000${company.logo}`} 
                            alt={company.name} 
                            style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div className="employer-row-card__logo-box">
                            <span className="logo-text-job">JOB</span>
                            <span className="logo-text-zone">ZONE</span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Details */}
                      <div className="employer-row-card__details">
                        <span className="employer-row-card__sector-tag">
                          {company.industry}
                        </span>
                        <h4 className="employer-row-card__name">
                          <Link to={`/companies/${companyId}`}>{company.name}</Link>
                        </h4>
                        <div className="employer-row-card__location">
                          <MapPin size={14} className="location-icon-pin" />
                          <span>{company.location}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="employer-row-card__actions">
                        <Link 
                          to={`/companies/${companyId}`} 
                          className="btn-vacancy-link"
                        >
                          {company.openPositions || 0} {company.openPositions === 1 ? 'Vacancy' : 'Vacancies'}
                        </Link>
                        
                        <button 
                          className={`btn-follow-action ${isFollowed ? 'btn-follow-action--active' : ''}`}
                          onClick={(e) => handleFollowToggle(e, companyId)}
                        >
                          {isFollowed ? (
                            <>
                              <CheckCircle size={14} />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} />
                              Follow
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="companies-results__empty">
                  <Building2 size={48} className="empty-building-icon" />
                  <h3>No Employers Found</h3>
                  <p>We couldn't find any employers matching your filter selections.</p>
                  <button className="btn btn-primary" onClick={handleResetFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Empty State spacer */}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="companies-pagination">
                <button 
                  className="companies-pagination__btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  aria-label="Previous Page"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`companies-pagination__page ${currentPage === p ? 'companies-pagination__page--active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button 
                  className="companies-pagination__btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  aria-label="Next Page"
                >
                  &gt;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
