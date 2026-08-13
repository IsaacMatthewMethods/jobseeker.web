import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Building2, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  Trash2, 
  Filter, 
  Sparkles,
  ChevronRight,
  Send,
  PlusCircle,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { ApplicationStatus } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface ApplicationsTabProps {
  onExploreClick: () => void;
  onPostJobClick: () => void;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ onExploreClick, onPostJobClick }) => {
  const { user } = useAuth();
  const { applications, stats, updateApplicationStatus, withdrawApplication } = useJobs();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Filter applications for current user (or show all for employer/recruiter)
  const isEmployer = user?.userType === 'EMPLOYER' || user?.role === 'EMPLOYER' || user?.email?.toLowerCase() === 'admin@shemalabs.com';

  const userApplications = applications.filter(app => {
    if (!user) return true;
    if (isEmployer) return true; // Employers see all applicants for their roles
    const userEmail = (user.email || '').toLowerCase();
    const userId = user.id || user.uid;
    return (
      (app.applicantEmail && app.applicantEmail.toLowerCase() === userEmail) ||
      (app.applicantUserId && app.applicantUserId === userId) ||
      (app.applicantId && app.applicantId === userId)
    );
  });

  const displayedApplications = userApplications.filter(app => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Send className="w-3 h-3 mr-1 text-sky-500" />
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-500" />
            Under Review
          </span>
        );
      case 'INTERVIEW_SCHEDULED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-3 h-3 mr-1 text-purple-500" />
            Interview Scheduled
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Offer Accepted
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3 mr-1 text-slate-400" />
            Not Selected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
            <FileText className="w-4 h-4" />
            <span>Applications Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monitor real-time status updates, recruiter communications, and interview schedules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExploreClick}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Explore More Jobs</span>
          </button>
          
          <button
            onClick={onPostJobClick}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Post a Job Opening</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Applied</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.totalApplications}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all companies</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20 shadow-2xs">
          <p className="text-xs font-semibold text-amber-700">Under Review</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{stats.underReviewCount}</p>
          <p className="text-[11px] text-amber-600/80 mt-1">Active screening</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200/80 bg-gradient-to-b from-white to-purple-50/20 shadow-2xs">
          <p className="text-xs font-semibold text-purple-700">Interviews</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1">{stats.interviewsCount}</p>
          <p className="text-[11px] text-purple-600/80 mt-1">Technical rounds</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700">Offers / Accepted</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{stats.acceptedCount}</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">Final decision</p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto scrollbar-none">
        {[
          { label: 'All Applications', value: 'ALL' },
          { label: 'Submitted', value: 'SUBMITTED' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Interviewing', value: 'INTERVIEW_SCHEDULED' },
          { label: 'Accepted', value: 'ACCEPTED' },
          { label: 'Not Selected', value: 'DECLINED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {displayedApplications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No applications match this filter</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Discover thousands of open technology roles on JobSeeker Pro and submit your profile in one click.
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
        <div className="space-y-4">
          {displayedApplications.map((app) => {
            const isExpanded = selectedAppId === app.id;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Job & Company details */}
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-2xs flex-shrink-0">
                        {app.company.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-500">{app.company}</span>
                          <span className="text-[11px] text-slate-400">• Applied {formatRelativeTime(app.appliedDate)}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                          {app.jobTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                            {app.location}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            {app.salary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge & toggle */}
                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {getStatusBadge(app.status)}

                      <button
                        onClick={() => setSelectedAppId(isExpanded ? null : app.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Toggle application details"
                      >
                        <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-sky-600' : ''}`} />
                      </button>
                    </div>

                  </div>

                  {/* Recruiter Notes / Updates alert */}
                  {app.statusNotes && (
                    <div className="mt-4 p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900 flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-sky-950">Status Note: </strong>
                        <span>{app.statusNotes}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Submitted Cover Note</h4>
                      <p className="text-xs sm:text-sm text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                        {app.coverNote}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Applicant: </span>
                        <span>{app.applicantName} ({app.applicantEmail})</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Phone Contact: </span>
                        <span>{app.applicantPhone}</span>
                      </div>
                    </div>

                    {/* Simulation / Recruiter Status Controls for testing */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-500 font-medium">Update Status (Testing Mode):</span>
                        <select
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        >
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                          <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="DECLINED">DECLINED</option>
                        </select>
                      </div>

                      <button
                        onClick={() => withdrawApplication(app.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center space-x-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Withdraw Application</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
