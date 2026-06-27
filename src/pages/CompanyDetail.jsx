import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, Briefcase, Globe, Building2, ExternalLink, ArrowLeft, Award, Heart, ChevronRight } from 'lucide-react';
import { companiesApi } from '../api/companiesApi';
import { jobsApi } from '../api/jobsApi';
import JobCard from '../components/JobCard';
import './CompanyDetail.css';

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      try {
        const res = await companiesApi.getCompanyById(id);
        if (res.success && res.company) {
          setCompany(res.company);
          // Fetch open vacancies for this company
          const jobsRes = await jobsApi.getJobs({ search: res.company.name });
          if (jobsRes.success) {
            // Filter to ensure jobs match this company name exactly or belong to it
            const filteredJobs = (jobsRes.jobs || []).filter(job => {
              const jobCompany = job.employer?.companyName || job.company || '';
              return jobCompany.toLowerCase() === res.company.name.toLowerCase();
            });
            setCompanyJobs(filteredJobs);
          }
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '1.25rem', color: '#004ae4' }}>
        Loading company details...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-detail__not-found container">
        <Building2 size={48} />
        <h2>Company Not Found</h2>
        <p>The company you're looking for doesn't exist.</p>
        <Link to="/companies" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Companies
        </Link>
      </div>
    );
  }

  const companyLogo = company.logo 
    ? (company.logo.startsWith('http') ? company.logo : `http://localhost:5000${company.logo}`) 
    : 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80';

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="cd-star cd-star--filled" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} size={16} className="cd-star cd-star--half" />);
      } else {
        stars.push(<Star key={i} size={16} className="cd-star cd-star--empty" />);
      }
    }
    return stars;
  };

  const benefitIcons = {
    'Health Insurance': Heart,
    'Remote Work': Globe,
    'Stock Options': Award,
    'default': Award,
  };

  const employeesCount = company.size ? company.size.split(' ')[0] : '1-100';
  const foundedYear = company.founded || '2020';
  const companyBenefits = company.benefits || [];
  const ratingValue = company.rating || 0;
  const reviewsCount = company.reviews !== undefined ? company.reviews : 0;

  return (
    <section className="company-detail" id="company-detail-page">
      <div className="company-detail__bg-glow" aria-hidden="true" />

      <div className="container">
        {/* Breadcrumb */}
        <nav className="company-detail__breadcrumb" id="company-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="company-detail__breadcrumb-link">Home</Link>
          <ChevronRight size={14} />
          <Link to="/companies" className="company-detail__breadcrumb-link">Companies</Link>
          <ChevronRight size={14} />
          <span className="company-detail__breadcrumb-current">{company.name}</span>
        </nav>

        {/* Company Header */}
        <header className="company-detail__hero glass-card" id="company-hero">
          <div className="company-detail__hero-main">
            <div className="company-detail__hero-logo">
              <img src={companyLogo} alt={`${company.name} logo`} />
            </div>
            <div className="company-detail__hero-info">
              <h1 className="company-detail__name">{company.name}</h1>
              <div className="company-detail__hero-meta">
                <span className="company-detail__industry badge badge-primary">
                  <Building2 size={12} />
                  {company.industry}
                </span>
                <span className="company-detail__location">
                  <MapPin size={14} />
                  {company.location}
                </span>
              </div>
              <div className="company-detail__rating-row">
                <div className="company-detail__stars">
                  {renderStars(ratingValue)}
                </div>
                <span className="company-detail__rating-value">{ratingValue}</span>
                <span className="company-detail__reviews">({reviewsCount.toLocaleString()} reviews)</span>
              </div>
            </div>
          </div>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary company-detail__website-btn"
              id="company-website-btn"
            >
              <Globe size={16} />
              Visit Website
              <ExternalLink size={14} />
            </a>
          )}
        </header>

        {/* Stats Row */}
        <div className="company-detail__stats" id="company-stats">
          <div className="company-detail__stat-card glass-card">
            <div className="company-detail__stat-icon">
              <Briefcase size={22} />
            </div>
            <div className="company-detail__stat-info">
              <span className="company-detail__stat-value">{companyJobs.length}</span>
              <span className="company-detail__stat-label">Open Positions</span>
            </div>
          </div>
          <div className="company-detail__stat-card glass-card">
            <div className="company-detail__stat-icon">
              <Users size={22} />
            </div>
            <div className="company-detail__stat-info">
              <span className="company-detail__stat-value">{employeesCount}</span>
              <span className="company-detail__stat-label">Employees</span>
            </div>
          </div>
          <div className="company-detail__stat-card glass-card">
            <div className="company-detail__stat-icon">
              <Calendar size={22} />
            </div>
            <div className="company-detail__stat-info">
              <span className="company-detail__stat-value">{foundedYear}</span>
              <span className="company-detail__stat-label">Founded</span>
            </div>
          </div>
          <div className="company-detail__stat-card glass-card">
            <div className="company-detail__stat-icon">
              <Star size={22} />
            </div>
            <div className="company-detail__stat-info">
              <span className="company-detail__stat-value">{ratingValue}/5</span>
              <span className="company-detail__stat-label">Rating</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="company-detail__content">
          {/* About Section */}
          <div className="company-detail__section glass-card" id="company-about">
            <h2 className="company-detail__section-title">
              <Building2 size={22} />
              About {company.name}
            </h2>
            <p className="company-detail__description">{company.description || `Learn more about ${company.name}.`}</p>

            {company.culture && (
              <div className="company-detail__culture">
                <h3 className="company-detail__culture-title">
                  <Heart size={18} />
                  Company Culture
                </h3>
                <p className="company-detail__culture-text">{company.culture}</p>
              </div>
            )}
          </div>

          {/* Benefits Section */}
          {companyBenefits.length > 0 && (
            <div className="company-detail__section glass-card" id="company-benefits">
              <h2 className="company-detail__section-title">
                <Award size={22} />
                Benefits & Perks
              </h2>
              <div className="company-detail__benefits-grid">
                {companyBenefits.map((benefit, index) => {
                  const IconComp = benefitIcons[benefit] || benefitIcons['default'];
                  return (
                    <div
                      key={benefit}
                      className="company-detail__benefit"
                      style={{ animationDelay: `${index * 0.06}s` }}
                    >
                      <div className="company-detail__benefit-icon">
                        <IconComp size={16} />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Open Positions */}
        <div className="company-detail__positions" id="company-positions">
          <h2 className="company-detail__positions-title">
            <Briefcase size={22} />
            Open Positions
            <span className="company-detail__positions-count">{companyJobs.length}</span>
          </h2>

          {companyJobs.length > 0 ? (
            <div className="company-detail__jobs-grid">
              {companyJobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="company-detail__no-jobs glass-card">
              <Briefcase size={40} />
              <h3>No open positions right now</h3>
              <p>Check back later for new opportunities at {company.name}.</p>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="company-detail__back">
          <Link to="/companies" className="btn btn-secondary" id="company-back-btn">
            <ArrowLeft size={16} />
            Back to All Companies
          </Link>
        </div>
      </div>
    </section>
  );
}
