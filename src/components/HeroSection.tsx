import React from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Globe2, 
  Sparkles, 
  Filter, 
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { JobCategory, JobType } from '../types';

const CATEGORIES: { label: JobCategory; icon?: string }[] = [
  { label: 'All' },
  { label: 'Software Engineering' },
  { label: 'UI/UX Design' },
  { label: 'Cloud & DevOps' },
  { label: 'Quality Assurance' },
  { label: 'Product & Data' },
];

const JOB_TYPES = [
  'All',
  'Remote',
  'Full-Time',
  'Part-Time',
  'Contract',
  'Internship'
];

export const HeroSection: React.FC = () => {
  const { filters, updateFilter, resetFilters, stats, filteredJobs } = useJobs();

  const handleCategoryClick = (cat: JobCategory) => {
    updateFilter('category', cat);
  };

  const handleTypeClick = (type: string) => {
    updateFilter('type', type);
  };

  const isFiltered = 
    filters.keyword !== '' || 
    filters.location !== '' || 
    filters.category !== 'All' || 
    filters.type !== 'All' || 
    filters.onlyRemote || 
    filters.onlyFeatured;

  return (
    <section className="bg-[#0F172A] px-4 sm:px-8 pb-8 pt-6 border-b border-slate-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center tracking-tight">
          Find your next career breakthrough
        </h1>

        {/* Clean Minimalism Search Box */}
        <div className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-xl shadow-2xl">
          {/* Keyword / Title Input */}
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 relative">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              id="search-keyword-input"
              type="text"
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              placeholder="Job title, keyword, or company"
              className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
            />
            {filters.keyword && (
              <button 
                onClick={() => updateFilter('keyword', '')}
                className="text-xs text-slate-400 hover:text-slate-600 ml-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Location Input */}
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 relative">
            <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              id="search-location-input"
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Location or Remote"
              className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
            />
            {filters.location && (
              <button 
                onClick={() => updateFilter('location', '')}
                className="text-xs text-slate-400 hover:text-slate-600 ml-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Action Button & Controls */}
          <div className="flex items-center gap-2">
            <button
              id="search-submit-button"
              className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2"
            >
              <span>Search Jobs</span>
            </button>
            {isFiltered && (
              <button
                id="reset-filters-button"
                onClick={resetFilters}
                title="Reset filters"
                className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
          {CATEGORIES.map(({ label }) => {
            const isActive = filters.category === label;
            return (
              <button
                key={label}
                onClick={() => handleCategoryClick(label)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {label === 'All' ? 'All Categories' : label}
              </button>
            );
          })}
        </div>

        {/* Quick Attribute Toggles */}
        <div className="flex justify-center items-center gap-4 mt-3 text-xs text-slate-400">
          <button
            onClick={() => updateFilter('onlyRemote', !filters.onlyRemote)}
            className={`inline-flex items-center space-x-1 transition-colors ${
              filters.onlyRemote ? 'text-sky-400 font-semibold' : 'hover:text-slate-300'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Remote Only</span>
          </button>
          <span>•</span>
          <button
            onClick={() => updateFilter('onlyFeatured', !filters.onlyFeatured)}
            className={`inline-flex items-center space-x-1 transition-colors ${
              filters.onlyFeatured ? 'text-sky-400 font-semibold' : 'hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Roles</span>
          </button>
          <span>•</span>
          <span>{filteredJobs.length} active roles</span>
        </div>

      </div>
    </section>
  );
};
