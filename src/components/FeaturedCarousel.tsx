import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  ArrowRight, 
  Check, 
  Send,
  Globe2
} from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { normalizeArray } from '../utils/formatters';

interface FeaturedCarouselProps {
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ onSelectJob, onApplyJob }) => {
  const { featuredJobs, isJobSaved, toggleSaveJob, hasAppliedToJob } = useJobs();

  if (featuredJobs.length === 0) return null;

  // Highlight the top featured job in the Clean Minimalism featured banner format, and list additional ones
  const mainFeatured = featuredJobs[0];
  const mainSaved = isJobSaved(mainFeatured.id);
  const mainApplied = hasAppliedToJob(mainFeatured.id);
  const requirementsList = normalizeArray(mainFeatured.requirements);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900 text-lg">Featured Opportunity</h2>
        <span className="text-sky-600 text-xs font-bold cursor-pointer hover:underline">
          {featuredJobs.length} Featured Openings
        </span>
      </div>

      {/* Main Clean Minimalism Featured Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white relative shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center font-bold text-base text-white border border-white/10 flex-shrink-0">
              {mainFeatured.companyLogo || mainFeatured.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                Featured
              </span>
              <h3 
                onClick={() => onSelectJob(mainFeatured)}
                className="text-xl sm:text-2xl font-bold cursor-pointer hover:text-sky-400 transition-colors"
              >
                {mainFeatured.title}
              </h3>
              <p className="text-slate-400 text-sm mt-0.5">
                {mainFeatured.company} • {mainFeatured.location}
              </p>
            </div>
          </div>

          <div className="text-xl sm:text-2xl font-bold text-emerald-400">
            {mainFeatured.salary}
          </div>
        </div>

        <p className="mt-6 text-slate-300 text-sm leading-relaxed max-w-2xl">
          {mainFeatured.description}
        </p>

        {requirementsList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {requirementsList.slice(0, 4).map((req, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs font-medium text-slate-300">
                {req.split(' ').slice(0, 4).join(' ')}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-700/50 flex items-center justify-between gap-4">
          <button
            onClick={() => onSelectJob(mainFeatured)}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5"
          >
            <span>View Full Description</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSaveJob(mainFeatured.id)}
              title={mainSaved ? "Remove bookmark" : "Bookmark role"}
              className={`w-11 h-11 flex items-center justify-center border rounded-xl transition-colors ${
                mainSaved 
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' 
                  : 'border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${mainSaved ? 'fill-sky-400' : ''}`} />
            </button>

            {mainApplied ? (
              <span className="px-6 py-2.5 bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-1.5 shadow-md">
                <Check className="w-4 h-4" />
                <span>Applied</span>
              </span>
            ) : (
              <button
                onClick={() => onApplyJob(mainFeatured)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-colors shadow-lg flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Quick Apply</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
