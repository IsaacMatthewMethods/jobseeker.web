import React from 'react';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  ArrowRight, 
  Send, 
  Check, 
  Users, 
  Zap, 
  Globe2, 
  Briefcase 
} from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { normalizeArray, formatRelativeTime } from '../utils/formatters';

interface JobCardProps {
  job: Job;
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelectJob, onApplyJob }) => {
  const { isJobSaved, toggleSaveJob, hasAppliedToJob } = useJobs();
  const saved = isJobSaved(job.id);
  const applied = hasAppliedToJob(job.id);
  const requirementsList = normalizeArray(job.requirements);

  // Type-specific badge color styling for Clean Minimalism
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Remote':
        return 'text-sky-600 bg-sky-50 border-sky-100';
      case 'Contract':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Internship':
        return 'text-purple-600 bg-purple-50 border-purple-100';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => onSelectJob(job)}
      className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3">
            {/* Company Avatar / Icon */}
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors flex-shrink-0">
              {job.companyLogo || job.company.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                {job.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {job.company} • {job.location}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs sm:text-sm font-bold text-slate-900">{job.salary}</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${getTypeColor(job.type)}`}>
              {job.type}
            </span>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
          {job.description}
        </p>

        {/* Requirements Tag Chips */}
        {requirementsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {requirementsList.slice(0, 3).map((req, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] bg-slate-50 text-slate-600 border border-slate-200/80 truncate max-w-[180px]"
              >
                {req.split(' ').slice(0, 4).join(' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div 
        className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(job.postedDate)}</span>
          <span>•</span>
          <span>{job.applicantsCount || 0} applicants</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleSaveJob(job.id)}
            title={saved ? "Remove bookmark" : "Bookmark this job"}
            className={`p-1.5 rounded-lg border transition-all ${
              saved 
                ? 'bg-sky-50 text-sky-600 border-sky-200' 
                : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-sky-600' : ''}`} />
          </button>

          {applied ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Applied</span>
            </span>
          ) : (
            <button
              onClick={() => onApplyJob(job)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-sky-600 text-white shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Quick Apply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
