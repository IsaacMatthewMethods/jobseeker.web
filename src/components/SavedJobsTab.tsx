import React from 'react';
import { 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Send,
  Check
} from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';

interface SavedJobsTabProps {
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  onExploreClick: () => void;
}

export const SavedJobsTab: React.FC<SavedJobsTabProps> = ({ onSelectJob, onApplyJob, onExploreClick }) => {
  const { jobs, savedJobIds, toggleSaveJob, hasAppliedToJob } = useJobs();

  const savedJobs = jobs.filter(j => savedJobIds.includes(j.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
            <Bookmark className="w-4 h-4 fill-sky-600" />
            <span>Bookmarked Positions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Job Listings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review and apply to opportunities you've shortlisted for later.
          </p>
        </div>

        <button
          onClick={onExploreClick}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-center"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Browse More Roles</span>
        </button>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No saved jobs yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Click the bookmark icon on any job card to save it here for fast review and application.
          </p>
          <button
            onClick={onExploreClick}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore Open Roles</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => {
            const applied = hasAppliedToJob(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${job.companyColor || 'from-slate-800 to-slate-900'} text-white font-bold text-xs flex items-center justify-center shadow-2xs`}>
                        {job.companyLogo || job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{job.company}</p>
                        <h3 
                          onClick={() => onSelectJob(job)}
                          className="text-base font-bold text-slate-900 hover:text-sky-600 cursor-pointer transition-colors line-clamp-1"
                        >
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      title="Remove from saved"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                      <DollarSign className="w-3 h-3 mr-0.5" />
                      {job.salary}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      {job.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectJob(job)}
                    className="text-xs font-semibold text-slate-700 hover:text-sky-600 flex items-center space-x-1"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {applied ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onApplyJob(job)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-sky-600 text-white transition-colors flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Apply Now</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
