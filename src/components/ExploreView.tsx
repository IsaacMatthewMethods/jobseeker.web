import React from 'react';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Briefcase, 
  ArrowUpDown, 
  Search, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { HeroSection } from './HeroSection';
import { FeaturedCarousel } from './FeaturedCarousel';
import { JobCard } from './JobCard';
import { Job } from '../types';

interface ExploreViewProps {
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSelectJob, onApplyJob }) => {
  const { filteredJobs, filters, updateFilter, resetFilters } = useJobs();

  return (
    <div>
      {/* Hero Search & Category Section */}
      <HeroSection />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Featured Opportunities Section */}
        {filters.category === 'All' && !filters.keyword && !filters.location && (
          <FeaturedCarousel onSelectJob={onSelectJob} onApplyJob={onApplyJob} />
        )}

        {/* Listings Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-sky-600" />
              <span>
                {filters.category !== 'All' ? `${filters.category} Roles` : 'Recent Job Opportunities'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <strong>{filteredJobs.length}</strong> active job openings matching your search criteria
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <div className="relative">
              <select
                id="sort-by-select"
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="text-xs font-semibold py-2 pl-3 pr-8 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Highest Salary</option>
                <option value="applicants">Most Popular</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-xl mx-auto my-8 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching jobs found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              We couldn't find any listings matching your current search parameters. Try broadening your keywords or clearing filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all inline-flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelectJob={onSelectJob}
                onApplyJob={onApplyJob}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
