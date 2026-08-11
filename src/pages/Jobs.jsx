import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Wifi, 
  Mail, 
  ChevronRight, 
  FolderOpen 
} from 'lucide-react';
import { jobsApi } from '../api/jobsApi';
import { alertsApi } from '../api/alertsApi';
import JobCard from '../components/JobCard';
import './Jobs.css';

const JOBS_PER_PAGE = 15; // Set to 15 per page to match FIGMA density

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [searchTitle, setSearchTitle] = useState(searchParams.get('search') || '');
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [searchSector, setSearchSector] = useState(searchParams.get('category') || '');

  // Active search terms (applied on search click)
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
  const [activeLocation, setActiveLocation] = useState(searchParams.get('location') || '');
  const [activeSector, setActiveSector] = useState(searchParams.get('category') || '');

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState(() => {
    const typeParam = searchParams.get('type');
    return typeParam ? [typeParam] : [];
  });
  const [selectedLocationFilter, setSelectedLocationFilter] = useState([]);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState([]);
  const [selectedGenderFilter, setSelectedGenderFilter] = useState([]);
  const [selectedSalaryFilter, setSelectedSalaryFilter] = useState([]);
  const [selectedDatePostedFilter, setSelectedDatePostedFilter] = useState([]);

  // UI state
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Collapse state for sidebar (default all sections open except gender/salary)
  const [collapsedSections, setCollapsedSections] = useState({
    gender: true,
    salary: true,
  });

  // State for "see more" toggles
  const [showAllSectors, setShowAllSectors] = useState(false);

  // Job Alert state
  const [alertName, setAlertName] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('Weekly');
  const [alertMessage, setAlertMessage] = useState('');

  // Map frontend date labels to backend keys
  const DATE_POSTED_KEY_MAP = {
    'Last Hour': '1h',
    'Last 24 hours': '24h',
    'Last week': '7d',
    'Last 2 weeks': '14d',
    'Last month': '30d',
    'All': 'all',
  };

  // Backend fetched state
  const [jobsList, setJobsList] = useState([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: JOBS_PER_PAGE,
        };

        if (activeSearch) {
          queryParams.nlpSearch = activeSearch;
          queryParams.search = activeSearch;
        }
        
        // Use search location or sidebar location filter (comma-separated)
        if (activeLocation) {
          queryParams.location = activeLocation;
        } else if (selectedLocationFilter.length > 0) {
          const nonForeign = selectedLocationFilter.filter((l) => l !== 'Foreign Jobs');
          if (nonForeign.length > 0) {
            queryParams.location = nonForeign.join(',');
          }
        }

        // Use search sector or sidebar sector filter (comma-separated)
        if (activeSector) {
          queryParams.category = activeSector;
        } else if (selectedSectorFilter.length > 0 && !selectedSectorFilter.includes('All')) {
          queryParams.category = selectedSectorFilter.join(',');
        }

        // Job types (comma-separated)
        if (selectedTypes.length > 0) {
          queryParams.type = selectedTypes.join(',');
        }

        // Gender filter (comma-separated)
        if (selectedGenderFilter.length > 0) {
          queryParams.gender = selectedGenderFilter.join(',');
        }

        // Salary range filter (comma-separated labels)
        if (selectedSalaryFilter.length > 0) {
          queryParams.salaryRange = selectedSalaryFilter.join(',');
        }

        // Date posted filter (use the most recent / narrowest selection)
        if (selectedDatePostedFilter.length > 0 && !selectedDatePostedFilter.includes('All')) {
          // Pick the narrowest (first in order) selected range
          const dateKey = DATE_POSTED_KEY_MAP[selectedDatePostedFilter[0]] || 'all';
          if (dateKey !== 'all') {
            queryParams.datePosted = dateKey;
          }
        }

        // Map sorting
        if (sortBy === 'newest') {
          queryParams.sort = '-createdAt';
        } else if (sortBy === 'salary-high') {
          queryParams.sort = '-salary';
        } else if (sortBy === 'salary-low') {
          queryParams.sort = 'salary';
        }

        const res = await jobsApi.getJobs(queryParams);
        if (res.success) {
          setJobsList(res.jobs || []);
          setTotalJobsCount(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [activeSearch, activeLocation, activeSector, selectedLocationFilter, selectedSectorFilter, selectedTypes, selectedGenderFilter, selectedSalaryFilter, selectedDatePostedFilter, sortBy, currentPage]);

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
    setSelectedTypes([]);
    setSelectedLocationFilter([]);
    setSelectedSectorFilter([]);
    setSelectedGenderFilter([]);
    setSelectedSalaryFilter([]);
    setSelectedDatePostedFilter([]);
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

  // Compute active filter pills
  const activeFilters = useMemo(() => {
    const filters = [];
    if (activeSearch) filters.push({ type: 'search', label: `Keyword: "${activeSearch}"`, value: activeSearch });
    if (activeLocation) filters.push({ type: 'location', label: `Location: ${activeLocation}`, value: activeLocation });
    if (activeSector) filters.push({ type: 'sector', label: `Sector: ${activeSector}`, value: activeSector });
    selectedTypes.forEach((t) => filters.push({ type: 'type', label: t, value: t }));
    selectedLocationFilter.forEach((l) => filters.push({ type: 'locFilter', label: l, value: l }));
    selectedSectorFilter.forEach((s) => filters.push({ type: 'secFilter', label: s, value: s }));
    selectedGenderFilter.forEach((g) => filters.push({ type: 'genderFilter', label: `Gender: ${g}`, value: g }));
    selectedSalaryFilter.forEach((s) => filters.push({ type: 'salaryFilter', label: `Salary: ${s}`, value: s }));
    selectedDatePostedFilter.forEach((d) => filters.push({ type: 'dateFilter', label: `Posted: ${d}`, value: d }));
    return filters;
  }, [activeSearch, activeLocation, activeSector, selectedTypes, selectedLocationFilter, selectedSectorFilter, selectedGenderFilter, selectedSalaryFilter, selectedDatePostedFilter]);

  const removeFilter = (type, value) => {
    switch (type) {
      case 'type': setSelectedTypes((p) => p.filter((v) => v !== value)); break;
      case 'locFilter': setSelectedLocationFilter((p) => p.filter((v) => v !== value)); break;
      case 'secFilter': setSelectedSectorFilter((p) => p.filter((v) => v !== value)); break;
      case 'genderFilter': setSelectedGenderFilter((p) => p.filter((v) => v !== value)); break;
      case 'salaryFilter': setSelectedSalaryFilter((p) => p.filter((v) => v !== value)); break;
      case 'dateFilter': setSelectedDatePostedFilter((p) => p.filter((v) => v !== value)); break;
      case 'search': setActiveSearch(''); setSearchTitle(''); break;
      case 'location': setActiveLocation(''); setSearchLocation(''); break;
      case 'sector': setActiveSector(''); setSearchSector(''); break;
      default: break;
    }
    setCurrentPage(1);
  };

  const handleCreateAlert = async () => {
    if (!alertName || !alertEmail) {
      setAlertMessage('Name and email are required');
      return;
    }
    try {
      setAlertMessage('Creating...');
      const res = await alertsApi.createAlert({ name: alertName, email: alertEmail, frequency: alertFrequency });
      if (res.success) {
        setAlertMessage('Alert created successfully!');
        setAlertName('');
        setAlertEmail('');
      } else {
        setAlertMessage(res.message || 'Failed to create alert');
      }
    } catch (err) {
      setAlertMessage('Error creating alert');
    }
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  // Sidebar content (reused for desktop & mobile drawer)
  const renderFilters = () => (
    <div className="jobs-filters__content">
      {/* Locations */}
      <div className="jobs-filters__section">
        <button
          className="jobs-filters__section-header"
          onClick={() => toggleSection('locations')}
          type="button"
        >
          <span>Locations</span>
          {collapsedSections.locations ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.locations && (
          <div className="jobs-filters__options">
            {['Foreign Jobs', 'Australia', 'Canada', 'UAE', 'USA', 'Sri Lanka'].map((loc) => (
              <label key={loc} className="jobs-filters__checkbox" htmlFor={`filter-loc-${loc}`}>
                <input
                  type="checkbox"
                  id={`filter-loc-${loc}`}
                  checked={selectedLocationFilter.includes(loc)}
                  onChange={() => toggleFilter(selectedLocationFilter, setSelectedLocationFilter, loc)}
                />
                <span className="jobs-filters__checkmark" />
                <span className="jobs-filters__label">{loc}</span>
              </label>
            ))}
            <button type="button" className="jobs-filters__see-more">+ see more</button>
          </div>
        )}
      </div>

      {/* Sector */}
      <div className="jobs-filters__section">
        <button
          className="jobs-filters__section-header"
          onClick={() => toggleSection('sector')}
          type="button"
        >
          <span>Sector</span>
          {collapsedSections.sector ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.sector && (
          <div className="jobs-filters__options">
            {[
              'All',
              'Accounting & Finance',
              'Administration & Office Support',
              'Agriculture, Farming',
              'Apparel, Garments & Textile',
              'Architecture, Construction & Property',
              'Engineering & Technical',
              'Hospitality, Travel & Tourism',
              'Marketing, Sales & Business Development'
            ].slice(0, showAllSectors ? undefined : 6).map((sec) => (
              <label key={sec} className="jobs-filters__checkbox" htmlFor={`filter-sec-${sec}`}>
                <input
                  type="checkbox"
                  id={`filter-sec-${sec}`}
                  checked={selectedSectorFilter.includes(sec)}
                  onChange={() => toggleFilter(selectedSectorFilter, setSelectedSectorFilter, sec)}
                />
                <span className="jobs-filters__checkmark" />
                <span className="jobs-filters__label">{sec}</span>
              </label>
            ))}
            <button 
              type="button" 
              className="jobs-filters__see-more"
              onClick={() => setShowAllSectors(!showAllSectors)}
            >
              {showAllSectors ? '- see less' : '+ see more'}
            </button>
          </div>
        )}
      </div>

      {/* Job Type */}
      <div className="jobs-filters__section">
        <button
          className="jobs-filters__section-header"
          onClick={() => toggleSection('type')}
          type="button"
        >
          <span>Job Type</span>
          {collapsedSections.type ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.type && (
          <div className="jobs-filters__options">
            {[
              { label: 'Freelance', value: 'freelance' },
              { label: 'Full time', value: 'full-time' },
              { label: 'Internship', value: 'internship' },
              { label: 'Part time', value: 'part-time' },
              { label: 'Contract', value: 'contract' },
              { label: 'Remote', value: 'remote' },
            ].map(({ label, value }) => (
              <label key={value} className="jobs-filters__checkbox" htmlFor={`filter-type-${value}`}>
                <input
                  type="checkbox"
                  id={`filter-type-${value}`}
                  checked={selectedTypes.includes(value)}
                  onChange={() => toggleFilter(selectedTypes, setSelectedTypes, value)}
                />
                <span className="jobs-filters__checkmark" />
                <span className="jobs-filters__label">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender */}
      <div className="jobs-filters__section">
        <button
          className="jobs-filters__section-header"
          onClick={() => toggleSection('gender')}
          type="button"
        >
          <span>Gender</span>
          {collapsedSections.gender ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.gender && (
          <div className="jobs-filters__options">
            {['Male', 'Female'].map((gender) => (
              <label key={gender} className="jobs-filters__checkbox" htmlFor={`filter-gender-${gender}`}>
                <input
                  type="checkbox"
                  id={`filter-gender-${gender}`}
                  checked={selectedGenderFilter.includes(gender)}
                  onChange={() => toggleFilter(selectedGenderFilter, setSelectedGenderFilter, gender)}
                />
                <span className="jobs-filters__checkmark" />
                <span className="jobs-filters__label">{gender}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Salary */}
      <div className="jobs-filters__section">
        <button
          className="jobs-filters__section-header"
          onClick={() => toggleSection('salary')}
          type="button"
        >
          <span>Salary</span>
          {collapsedSections.salary ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.salary && (
          <div className="jobs-filters__options">
            {['$0 - $50k', '$50k - $100k', '$100k - $150k', '$150k - $200k', '$200k+'].map((sal) => (
              <label key={sal} className="jobs-filters__checkbox" htmlFor={`filter-sal-${sal}`}>
                <input
                  type="checkbox"
                  id={`filter-sal-${sal}`}
                  checked={selectedSalaryFilter.includes(sal)}
                  onChange={() => toggleFilter(selectedSalaryFilter, setSelectedSalaryFilter, sal)}
                />
                <span className="jobs-filters__checkmark" />
                <span className="jobs-filters__label">{sal}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date Posted */}
      <div className="jobs-filters__section">
        <button
          className="jobs-filters__section-header"
          onClick={() => toggleSection('datePosted')}
          type="button"
        >
          <span>Date Posted</span>
          {collapsedSections.datePosted ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {!collapsedSections.datePosted && (
          <div className="jobs-filters__options">
            {['Last Hour', 'Last 24 hours', 'Last week', 'Last 2 weeks', 'Last month', 'All'].map((date) => (
              <label key={date} className="jobs-filters__checkbox" htmlFor={`filter-date-${date}`}>
                <input
                  type="checkbox"
                  id={`filter-date-${date}`}
                  checked={selectedDatePostedFilter.includes(date)}
                  onChange={() => toggleFilter(selectedDatePostedFilter, setSelectedDatePostedFilter, date)}
                />
                <span className="jobs-filters__checkmark" />
                <span className="jobs-filters__label">{date}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Email Alert Card */}
      <div className="jobs-alert-card">
        <div className="jobs-alert-card__header">
          <Mail size={16} />
          <span>Email Me New Jobs</span>
        </div>
        <div className="jobs-alert-card__body">
          <input 
            type="text" 
            placeholder="Job alert name..." 
            className="jobs-alert-card__input" 
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="example@email.com" 
            className="jobs-alert-card__input" 
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
          />
          <div className="jobs-alert-card__checkboxes">
            <label className="jobs-filters__checkbox" style={{ margin: 0, padding: '6px 4px', gap: '6px' }}>
              <input 
                type="checkbox" 
                checked={alertFrequency === 'Weekly'}
                onChange={() => setAlertFrequency('Weekly')}
              />
              <span className="jobs-filters__checkmark" />
              <span className="jobs-filters__label">Weekly</span>
            </label>
            <label className="jobs-filters__checkbox" style={{ margin: 0, padding: '6px 4px', gap: '6px' }}>
              <input 
                type="checkbox" 
                checked={alertFrequency === 'Monthly'}
                onChange={() => setAlertFrequency('Monthly')}
              />
              <span className="jobs-filters__checkmark" />
              <span className="jobs-filters__label">Monthly</span>
            </label>
          </div>
          {alertMessage && (
            <div style={{ fontSize: '0.85rem', color: alertMessage.includes('success') ? 'green' : '#ff4444', marginBottom: '8px' }}>
              {alertMessage}
            </div>
          )}
          <button type="button" className="jobs-alert-card__btn" onClick={handleCreateAlert}>CREATE ALERT</button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="jobs-page">
      {/* ===== HERO BANNER ===== */}
      <section className="jobs-hero">
        <div className="container">
          <div className="jobs-hero__content">
            <h1 className="jobs-hero__title">Jobs Listing</h1>
          </div>
        </div>
      </section>

      {/* ===== NAVY BREADCRUMBS STRIP ===== */}
      <div className="jobs-breadcrumb-bar">
        <div className="container">
          <div className="jobs-breadcrumb">
            <Link to="/">Home</Link>
            <span className="jobs-breadcrumb__separator">&gt;</span>
            <span className="jobs-breadcrumb__current">Jobs Listing</span>
          </div>
        </div>
      </div>

      {/* ===== STANDALONE SEARCH CARD ===== */}
      <section className="jobs-search-section">
        <div className="container">
          <form className="jobs-search" onSubmit={handleSearch} id="jobs-search-form">
            {/* Field 1: Keywords */}
            <div className="jobs-search__field">
              <Search size={18} className="jobs-search__icon" />
              <input
                type="text"
                placeholder="Job Title, Keywords, or Phrase"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="jobs-search__input"
                id="jobs-search-title"
              />
            </div>
            
            <div className="jobs-search__divider" />
            
            {/* Field 2: Location */}
            <div className="jobs-search__field">
              <MapPin size={18} className="jobs-search__icon" />
              <input
                type="text"
                placeholder="City, State or ZIP"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="jobs-search__input"
                id="jobs-search-location"
              />
            </div>
            
            <div className="jobs-search__divider" />
            
            {/* Field 3: Sector dropdown */}
            <div className="jobs-search__field">
              <FolderOpen size={18} className="jobs-search__icon" />
              <select
                value={searchSector}
                onChange={(e) => setSearchSector(e.target.value)}
                className="jobs-search__select"
                id="jobs-search-sector"
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
              <ChevronDown size={14} className="jobs-search__select-chevron" />
            </div>
            
            <button type="submit" className="jobs-search__btn" id="jobs-search-btn" aria-label="Search">
              <Search size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Active Filters Bar */}
      {activeFilters.length > 0 && (
        <section className="jobs-active-filters">
          <div className="container">
            <div className="jobs-active-filters__inner">
              <span className="jobs-active-filters__label">Active Filters:</span>
              <div className="jobs-active-filters__pills">
                {activeFilters.map((filter, idx) => (
                  <span key={`${filter.type}-${filter.value}-${idx}`} className="jobs-active-filters__pill">
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filter.type, filter.value)}
                      className="jobs-active-filters__pill-remove"
                      aria-label={`Remove ${filter.label} filter`}
                      id={`remove-filter-${filter.type}-${idx}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={clearAllFilters}
                className="jobs-active-filters__clear"
                id="clear-all-filters"
              >
                Clear All
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="jobs-content">
        <div className="container">
          <div className="jobs-layout">
            {/* Mobile Filter Button */}
            <button
              className="jobs-mobile-filter-btn btn btn-secondary"
              onClick={() => setMobileFiltersOpen(true)}
              id="mobile-filter-btn"
            >
              <SlidersHorizontal size={18} />
              Filters
              {activeFilters.length > 0 && (
                <span className="jobs-mobile-filter-btn__count">{activeFilters.length}</span>
              )}
            </button>

            {/* Filter Sidebar - Desktop */}
            <aside className="jobs-sidebar glass-card" id="jobs-sidebar">
              <div className="jobs-sidebar__header">
                <h3 className="jobs-sidebar__title">
                  <SlidersHorizontal size={18} />
                  Filters
                </h3>
                {activeFilters.length > 0 && (
                  <button onClick={clearAllFilters} className="jobs-sidebar__reset" id="sidebar-reset-filters">
                    Reset
                  </button>
                )}
              </div>
              {renderFilters()}
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
              <div className="jobs-drawer-overlay" onClick={() => setMobileFiltersOpen(false)}>
                <aside
                  className="jobs-drawer"
                  onClick={(e) => e.stopPropagation()}
                  id="mobile-filter-drawer"
                >
                  <div className="jobs-drawer__header">
                    <h3 className="jobs-drawer__title">
                      <SlidersHorizontal size={18} />
                      Filters
                    </h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="jobs-drawer__close"
                      id="close-mobile-filters"
                      aria-label="Close filters"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {renderFilters()}
                  <div className="jobs-drawer__footer">
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
                      Show {totalJobsCount} Results
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {/* Job Results */}
            <div className="jobs-results">
              {/* Results Header */}
              <div className="jobs-results__header">
                <div className="jobs-results__header-left">
                  <h2 className="jobs-results__title">{totalJobsCount} Jobs Found</h2>
                  <p className="jobs-results__subtitle">
                    Displayed Here: {jobsList.length > 0 ? (currentPage - 1) * JOBS_PER_PAGE + 1 : 0} - {Math.min(currentPage * JOBS_PER_PAGE, totalJobsCount)} Jobs
                  </p>
                </div>
                
                <div className="jobs-results__header-right">
                  {/* Sort option */}
                  <div className="jobs-results__select-wrap">
                    <select
                      id="jobs-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="jobs-results__sort-select"
                      aria-label="Sort by"
                    >
                      <option value="relevance">Most Recent</option>
                      <option value="newest">Newest</option>
                      <option value="salary-high">Salary: High to Low</option>
                      <option value="salary-low">Salary: Low to High</option>
                    </select>
                    <ChevronDown size={14} className="jobs-results__select-icon" />
                  </div>

                  {/* Records per page option */}
                  <div className="jobs-results__select-wrap">
                    <select className="jobs-results__sort-select" defaultValue="15" aria-label="Records per page">
                      <option value="15">Records Per Page</option>
                      <option value="10">10 Per Page</option>
                      <option value="20">20 Per Page</option>
                      <option value="30">30 Per Page</option>
                    </select>
                    <ChevronDown size={14} className="jobs-results__select-icon" />
                  </div>

                  {/* RSS feed */}
                  <button className="jobs-results__rss-btn" type="button" aria-label="RSS Feed">
                    <Wifi size={14} />
                    RSS Feed
                  </button>
                </div>
              </div>

              {/* Job Cards List */}
              <div className="jobs-results__list">
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#004ae4', fontSize: '1.25rem', fontWeight: '500' }}>
                    Loading jobs...
                  </div>
                ) : jobsList.length > 0 ? (
                  jobsList.map((job, idx) => (
                    <div
                      key={job._id || job.id}
                      className="jobs-results__item"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <JobCard job={job} />
                    </div>
                  ))
                ) : (
                  <div className="jobs-results__empty">
                    <Search size={48} />
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                    <button className="btn btn-primary" onClick={clearAllFilters} id="empty-clear-filters">
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="jobs-pagination" aria-label="Job results pagination">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`jobs-pagination__page ${page === currentPage ? 'jobs-pagination__page--active' : ''}`}
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      id={`pagination-page-${page}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="jobs-pagination__btn"
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
