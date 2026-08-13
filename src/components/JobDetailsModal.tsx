import React from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Globe2, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Bookmark, 
  Share2, 
  Send, 
  Check, 
  Building2, 
  ShieldCheck,
  Users
} from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { normalizeArray, formatRelativeTime } from '../utils/formatters';

interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
  onApply: (job: Job) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply }) => {
  const { isJobSaved, toggleSaveJob, hasAppliedToJob } = useJobs();
  const [copied, setCopied] = React.useState(false);

  if (!job) return null;

  const saved = isJobSaved(job.id);
  const applied = hasAppliedToJob(job.id);
  const requirementsList = normalizeArray(job.requirements);
  const responsibilitiesList = normalizeArray(job.responsibilities);
  const benefitsList = normalizeArray(job.benefits);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-[#0F172A] text-white relative border-b border-slate-800">
          <button
            id="close-job-details-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4 pr-10">
            <div className="w-14 h-14 rounded-xl bg-slate-800 text-white font-bold text-base flex items-center justify-center border border-slate-700 flex-shrink-0">
              {job.companyLogo || job.company.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-300">{job.company}</span>
                {job.featured && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Featured
                  </span>
                )}
                {job.urgent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Urgent
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                {job.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.location}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                  {job.salary}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <Briefcase className="w-3.5 h-3.5 mr-1" />
                  {job.type}
                </span>
                {job.isRemote && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <Globe2 className="w-3.5 h-3.5 mr-1" />
                    Remote Eligible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Category</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{job.category}</p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-[11px] text-slate-400 font-medium">Applicants</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{job.applicantsCount || 0} applied</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Posted</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{formatRelativeTime(job.postedDate)}</p>
            </div>
          </div>

          {/* Overview */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Role Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {responsibilitiesList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Key Responsibilities</h3>
              <ul className="space-y-2">
                {responsibilitiesList.map((resp, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 mr-2.5 flex-shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {requirementsList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Candidate Requirements</h3>
              <ul className="space-y-2.5">
                {requirementsList.map((req, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 mr-2.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {benefitsList.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Perks & Compensation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {benefitsList.map((benefit, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center space-x-2 text-xs font-medium text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hiring Guarantee badge */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-sky-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-sky-900">Verified Employer</p>
              <p className="text-[11px] text-sky-700">
                This listing was authenticated by JobSeeker Pro Trust & Safety team with responsive hiring response time under 48 hours.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleSaveJob(job.id)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                saved 
                  ? 'bg-sky-50 text-sky-600 border-sky-200' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-sky-600' : ''}`} />
              <span>{saved ? 'Saved' : 'Save Job'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
            >
              Close
            </button>

            {applied ? (
              <span className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center space-x-1.5 shadow-sm">
                <Check className="w-4 h-4" />
                <span>Application Submitted</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApply(job);
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-sky-600 text-white shadow-md transition-all flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Apply for this Role</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
