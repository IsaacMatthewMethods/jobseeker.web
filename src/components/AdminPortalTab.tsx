import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  XCircle, 
  Star, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Sparkles, 
  ExternalLink, 
  AlertTriangle, 
  ArrowUpRight, 
  Eye, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Layers, 
  FileCode,
  Check,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { Job, JobApplication, UserAccount, ApplicationStatus, JobType } from '../types';
import { formatRelativeTime, normalizeArray } from '../utils/formatters';

interface AdminPortalTabProps {
  onPostJobClick: () => void;
  showToast: (msg: string) => void;
  onOpenAuthModal?: () => void;
}

type AdminSubTab = 'overview' | 'employers' | 'candidates' | 'jobs' | 'applications';

export const AdminPortalTab: React.FC<AdminPortalTabProps> = ({
  onPostJobClick,
  showToast,
  onOpenAuthModal
}) => {
  const { user, loginAsAdmin } = useAuth();
  const { 
    jobs, 
    applications, 
    users, 
    employers, 
    candidates, 
    stats,
    deleteJob, 
    toggleFeaturedJob, 
    updateApplicationStatus, 
    verifyEmployer, 
    suspendEmployer, 
    deleteEmployer,
    postNewJob,
    reseedDatabase,
    openJobDetails
  } = useJobs();

  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  
  // Modals & Inspection State
  const [selectedCandidate, setSelectedCandidate] = useState<UserAccount | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isQuickPostModalOpen, setIsQuickPostModalOpen] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);

  // Search & Filter states for sub-tabs
  const [employerSearch, setEmployerSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('ALL');

  // Quick Post Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('ShemaLabs');
  const [newLocation, setNewLocation] = useState('Remote / San Francisco, CA');
  const [newSalary, setNewSalary] = useState('$130k - $165k / yr');
  const [newJobType, setNewJobType] = useState<JobType>('REMOTE');
  const [newCategory, setNewCategory] = useState('Software Engineering');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newIsFeatured, setNewIsFeatured] = useState(true);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Check access authorization: admin@shemalabs.com or userType === 'EMPLOYER' or role === 'EMPLOYER'
  const isAuthorizedAdmin = Boolean(
    user && (
      user.email?.toLowerCase() === 'admin@shemalabs.com' ||
      user.userType === 'EMPLOYER' ||
      user.role === 'EMPLOYER'
    )
  );

  // Filtered Employers
  const displayedEmployers = useMemo(() => {
    return employers.filter(emp => {
      if (!employerSearch.trim()) return true;
      const q = employerSearch.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        (emp.companyName && emp.companyName.toLowerCase().includes(q)) ||
        emp.email.toLowerCase().includes(q) ||
        (emp.companyIndustry && emp.companyIndustry.toLowerCase().includes(q))
      );
    });
  }, [employers, employerSearch]);

  // Filtered Candidates
  const displayedCandidates = useMemo(() => {
    return candidates.filter(cand => {
      if (!candidateSearch.trim()) return true;
      const q = candidateSearch.toLowerCase();
      const skillsStr = Array.isArray(cand.skills) ? cand.skills.join(' ') : (cand.skills || '');
      return (
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        (cand.qualification && cand.qualification.toLowerCase().includes(q)) ||
        skillsStr.toLowerCase().includes(q)
      );
    });
  }, [candidates, candidateSearch]);

  // Filtered Jobs
  const displayedJobs = useMemo(() => {
    return jobs.filter(job => {
      if (!jobSearch.trim()) return true;
      const q = jobSearch.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
      );
    });
  }, [jobs, jobSearch]);

  // Filtered Applications
  const displayedApplications = useMemo(() => {
    return applications.filter(app => {
      if (applicationStatusFilter !== 'ALL' && app.status !== applicationStatusFilter) {
        return false;
      }
      if (!applicationSearch.trim()) return true;
      const q = applicationSearch.toLowerCase();
      return (
        app.jobTitle.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.applicantEmail.toLowerCase().includes(q) ||
        (app.companyName && app.companyName.toLowerCase().includes(q))
      );
    });
  }, [applications, applicationStatusFilter, applicationSearch]);

  // Handle Quick Job Submit
  const handleQuickPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Please provide a title and job description.');
      return;
    }

    setIsSubmittingJob(true);
    try {
      await postNewJob({
        title: newTitle.trim(),
        company: newCompany.trim() || 'ShemaLabs',
        location: newLocation.trim() || 'Remote',
        salaryRange: newSalary.trim() || '$130k - $165k / yr',
        jobType: newJobType,
        type: newJobType === 'REMOTE' ? 'Remote' : 'Full-Time',
        category: newCategory,
        description: newDescription.trim(),
        requirements: newRequirements.trim() || 'Proficiency with modern full-stack frameworks and scalable systems.',
        isFeatured: newIsFeatured,
        featured: newIsFeatured,
        isRemote: newJobType === 'REMOTE'
      });

      showToast(`Vacancy "${newTitle}" published successfully to Cloud Firestore!`);
      setIsQuickPostModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewRequirements('');
    } catch (err) {
      showToast('Error publishing vacancy. Please try again.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleReseed = async () => {
    setIsReseeding(true);
    await reseedDatabase();
    setTimeout(() => {
      setIsReseeding(false);
      showToast('Database successfully re-seeded with 5 standard ShemaLabs jobs & demo profiles!');
    }, 600);
  };

  // If user is not an Admin or Employer, show access gate
  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-slate-900 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-slate-900/10">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ShemaLabs Admin Command Center
          </h2>
          
          <p className="text-slate-600 max-w-lg mx-auto mt-3 text-sm sm:text-base leading-relaxed">
            This management console is restricted to ShemaLabs administrators and verified partner recruiters. Sign in with administrative credentials or switch to an Employer account.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={async () => {
                await loginAsAdmin();
                showToast('Signed in as ShemaLabs Administrator');
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Login as ShemaLabs Admin (0616)</span>
            </button>

            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-sm border border-sky-200 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-sky-600" />
                <span>Sign in with Employer Account</span>
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted access backed by Firebase Cloud Firestore & Auth rules</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-sky-500 selection:text-white">
      {/* Top Admin Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black text-white tracking-tight">Admin Command Center</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Firestore
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  ShemaLabs Enterprise Control & Unified Moderation Hub (Project: <code className="text-sky-400 font-mono">aikiddo</code>)
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={handleReseed}
                disabled={isReseeding}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5"
                title="Reset or re-seed initial standard ShemaLabs jobs into Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin text-sky-400' : ''}`} />
                <span>{isReseeding ? 'Syncing...' : 'Reseed Baseline'}</span>
              </button>

              <button
                onClick={() => setIsQuickPostModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Post Vacancy as ShemaLabs</span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2 mt-4 pt-2 overflow-x-auto no-scrollbar border-t border-slate-800/80">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeSubTab === 'overview'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Executive Overview</span>
            </button>

            <button
              onClick={() => setActiveSubTab('employers')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeSubTab === 'employers'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Employers & Partners ({employers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('candidates')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeSubTab === 'candidates'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Candidates Directory ({candidates.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('jobs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeSubTab === 'jobs'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Moderation Queue ({jobs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('applications')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeSubTab === 'applications'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Application Pipeline ({applications.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* SUBTAB 1: EXECUTIVE OVERVIEW */}
        {/* ========================================================================= */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive KPI Pulse Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Users</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{stats.totalUsers}</span>
                  <span className="text-xs text-sky-400 font-semibold">{candidates.length} seekers / {employers.length} employers</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">Live synced from Firestore <code className="text-slate-400">users</code></div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Job Postings</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{stats.totalJobs}</span>
                  <span className="text-xs text-emerald-400 font-semibold">{stats.remoteJobs} remote roles</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">{jobs.filter(j => j.isFeatured || j.featured).length} marked as Featured listings</div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Employers</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{stats.verifiedEmployers}</span>
                  <span className="text-xs text-slate-400 font-semibold">of {employers.length} registered</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">One-click enterprise partner verification</div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Applications</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{stats.totalApplications}</span>
                  <span className="text-xs text-amber-400 font-semibold">{stats.interviewsCount} interviews active</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">Live stream across all open roles</div>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <span>Live Recruitment Pipeline Status</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Submitted</span>
                  <div className="text-2xl font-black text-sky-400 mt-1">
                    {applications.filter(a => a.status === 'SUBMITTED').length}
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Under Review</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">
                    {applications.filter(a => a.status === 'UNDER_REVIEW').length}
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Interviews</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length}
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Offers / Accepted</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {applications.filter(a => a.status === 'ACCEPTED').length}
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-medium">Declined</span>
                  <div className="text-2xl font-black text-slate-400 mt-1">
                    {applications.filter(a => a.status === 'DECLINED').length}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Applications Preview */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Recent Applications Stream</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab('applications')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {applications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white truncate">{app.applicantName}</span>
                          <span className="text-[10px] text-slate-400">• {app.jobTitle}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{app.applicantEmail}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          app.status === 'UNDER_REVIEW' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                          'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                          title="Inspect application"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Employers Preview */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Registered Employers & Partners</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab('employers')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {employers.slice(0, 4).map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white truncate">{emp.companyName || emp.name}</span>
                          {emp.isVerifiedEmployer && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{emp.email} • {emp.companyIndustry || 'Technology'}</p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => {
                            verifyEmployer(emp.id, !emp.isVerifiedEmployer);
                            showToast(emp.isVerifiedEmployer ? `Unverified ${emp.name}` : `Verified partner: ${emp.name}`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            emp.isVerifiedEmployer
                              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {emp.isVerifiedEmployer ? 'Revoke' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: EMPLOYERS & ENTERPRISE PARTNERS */}
        {/* ========================================================================= */}
        {activeSubTab === 'employers' && (
          <div className="space-y-6">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={employerSearch}
                  onChange={(e) => setEmployerSearch(e.target.value)}
                  placeholder="Search employers by company, industry, or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <span>Showing <strong className="text-white">{displayedEmployers.length}</strong> employer partners</span>
              </div>
            </div>

            {/* Employers Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Company & Recruiter</th>
                      <th className="py-3.5 px-4">Industry Domain</th>
                      <th className="py-3.5 px-4">Contact Coordinates</th>
                      <th className="py-3.5 px-4">Verification Status</th>
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedEmployers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          No employer partners found matching the search criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedEmployers.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                                {(emp.companyName || emp.name).slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white text-sm">{emp.companyName || emp.name}</span>
                                <div className="text-[11px] text-slate-400">{emp.name} ({emp.qualification || 'Talent Partner'})</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 font-medium">
                              {emp.companyIndustry || 'Software & Cloud Technology'}
                            </span>
                            <div className="text-[10px] text-slate-500">{emp.location || 'Global / Remote'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 font-mono text-[11px]">{emp.email}</div>
                            <div className="text-slate-500 text-[10px]">{emp.phone || 'Phone not listed'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {emp.isVerifiedEmployer ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <Check className="w-3 h-3" />
                                <span>Verified Partner</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                <Clock className="w-3 h-3" />
                                <span>Pending Verification</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  verifyEmployer(emp.id, !emp.isVerifiedEmployer);
                                  showToast(emp.isVerifiedEmployer ? `Revoked verified status for ${emp.name}` : `Verified partner: ${emp.name}`);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  emp.isVerifiedEmployer
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                                }`}
                              >
                                {emp.isVerifiedEmployer ? 'Revoke Badge' : 'Verify Partner'}
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove employer "${emp.name}" from Firestore?`)) {
                                    deleteEmployer(emp.id);
                                    showToast(`Employer ${emp.name} removed.`);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                                title="Delete employer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: CANDIDATES DIRECTORY */}
        {/* ========================================================================= */}
        {activeSubTab === 'candidates' && (
          <div className="space-y-6">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Search candidates by name, skills (e.g. React, Kotlin), or degree..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-medium">
                <span>Total Candidates: <strong className="text-white">{displayedCandidates.length}</strong></span>
              </div>
            </div>

            {/* Candidates Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCandidates.map((cand) => {
                const skillsArray = normalizeArray(cand.skills);
                return (
                  <div
                    key={cand.id}
                    className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold flex items-center justify-center">
                            {cand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                            <span className="text-[11px] text-sky-400 font-medium">
                              {cand.qualification || 'Software Engineering'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {cand.experienceYears || 3}+ yrs exp
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{cand.location || 'Remote / Global'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate font-mono text-[11px]">{cand.email}</span>
                        </div>
                      </div>

                      {/* Resume Summary */}
                      {cand.resumeText && (
                        <p className="mt-3 text-[11px] text-slate-300 line-clamp-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          "{cand.resumeText}"
                        </p>
                      )}

                      {/* Skills Chips */}
                      {skillsArray.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {skillsArray.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {skillsArray.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-500">
                              +{skillsArray.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Verified Profile</span>
                      <button
                        onClick={() => setSelectedCandidate(cand)}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Dossier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 4: JOB MODERATION QUEUE */}
        {/* ========================================================================= */}
        {activeSubTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search open jobs by title, company, or category..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsQuickPostModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-sky-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Vacancy as ShemaLabs</span>
                </button>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Role Title & Company</th>
                      <th className="py-3.5 px-4">Location & Type</th>
                      <th className="py-3.5 px-4">Salary Range</th>
                      <th className="py-3.5 px-4">Featured Status</th>
                      <th className="py-3.5 px-4">Applicants</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedJobs.map((job) => {
                      const isFeat = Boolean(job.isFeatured || job.featured);
                      return (
                        <tr key={job.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">{job.title}</div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {job.company} • <span className="text-slate-500">{job.category}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 font-medium">{job.location}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-sky-400 border border-slate-700">
                              {job.jobType || job.type || 'Remote'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono text-emerald-400 font-semibold">{job.salaryRange || job.salary}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                toggleFeaturedJob(job.id, !isFeat);
                                showToast(isFeat ? `Removed featured tag from ${job.title}` : `Promoted ${job.title} to Featured!`);
                              }}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                isFeat
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${isFeat ? 'fill-amber-400 text-amber-400' : ''}`} />
                              <span>{isFeat ? 'Featured' : 'Standard'}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white">{job.applicantsCount || 0}</span>
                            <span className="text-slate-500 text-[10px] ml-1">candidates</span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openJobDetails(job)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete listing "${job.title}"?`)) {
                                    deleteJob(job.id);
                                    showToast(`Deleted job: ${job.title}`);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                                title="Delete job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 5: UNIVERSAL APPLICATION PIPELINE */}
        {/* ========================================================================= */}
        {activeSubTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={applicationSearch}
                  onChange={(e) => setApplicationSearch(e.target.value)}
                  placeholder="Filter applications by candidate or job title..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'DECLINED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApplicationStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      applicationStatusFilter === st
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'ALL' ? 'All Applications' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
              {displayedApplications.length === 0 ? (
                <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-300">No applications found</h4>
                  <p className="text-xs text-slate-500 mt-1">There are no candidate submissions matching this status.</p>
                </div>
              ) : (
                displayedApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {app.applicantName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">{app.applicantName}</h4>
                            <span className="text-slate-500 text-xs">•</span>
                            <span className="text-xs text-sky-400 font-semibold">{app.jobTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                            <span>{app.companyName || 'ShemaLabs'}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400">{app.applicantEmail}</span>
                            <span>•</span>
                            <span>Applied {formatRelativeTime(app.appliedDate)}</span>
                          </div>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <p className="mt-2.5 text-xs text-slate-300 line-clamp-1 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                          <strong className="text-slate-400 font-semibold">Note:</strong> {app.coverLetter}
                        </p>
                      )}
                    </div>

                    {/* Stage Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={async () => {
                          await updateApplicationStatus(app.id, 'UNDER_REVIEW');
                          showToast(`Marked ${app.applicantName} as Under Review`);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          app.status === 'UNDER_REVIEW'
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                        }`}
                      >
                        Review
                      </button>

                      <button
                        onClick={async () => {
                          await updateApplicationStatus(app.id, 'INTERVIEW_SCHEDULED');
                          showToast(`Interview scheduled for ${app.applicantName}`);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          app.status === 'INTERVIEW_SCHEDULED'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        Interview
                      </button>

                      <button
                        onClick={async () => {
                          await updateApplicationStatus(app.id, 'ACCEPTED');
                          showToast(`Offer accepted for ${app.applicantName}!`);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        Accept
                      </button>

                      <button
                        onClick={async () => {
                          await updateApplicationStatus(app.id, 'DECLINED');
                          showToast(`Application for ${app.applicantName} declined`);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          app.status === 'DECLINED'
                            ? 'bg-red-500 text-white border-red-400 shadow-sm'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: POST VACANCY AS SHEMALABS */}
      {/* ========================================================================= */}
      {isQuickPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Post Vacancy as ShemaLabs</h3>
                  <p className="text-xs text-slate-400">Directly syncs to Firestore <code className="text-sky-400">jobs</code> collection</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickPostModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickPostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Android Developer (Kotlin / Compose)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Remote / San Francisco, CA"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. $130k - $165k / yr"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Job Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as JobType)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Product & Data">Product & Data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe key responsibilities and impact of this role..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Requirements & Skills</label>
                <textarea
                  rows={2}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="e.g. 5+ years Kotlin, Compose, Firebase, Coroutines, Room DB"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featCheck"
                  checked={newIsFeatured}
                  onChange={(e) => setNewIsFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="featCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Promote as Featured Opportunity on Hero Carousel
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickPostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJob}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-sky-500/20 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingJob ? 'Publishing...' : 'Publish to Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CANDIDATE DOSSIER INSPECTOR */}
      {/* ========================================================================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                  {selectedCandidate.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedCandidate.name}</h3>
                  <p className="text-xs text-sky-400 font-semibold">{selectedCandidate.qualification || 'Professional Candidate'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 font-semibold block">Email</span>
                  <span className="text-white font-mono text-[11px]">{selectedCandidate.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Phone</span>
                  <span className="text-white">{selectedCandidate.phone || '+1 (555) 019-2834'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Location</span>
                  <span className="text-white">{selectedCandidate.location || 'Remote / Global'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Experience</span>
                  <span className="text-white">{selectedCandidate.experienceYears || 4} Years Industry Experience</span>
                </div>
              </div>

              {selectedCandidate.resumeText && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Resume Summary & Career Bio</span>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedCandidate.resumeText}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <span className="font-bold text-slate-300 block mb-2">Verified Technical Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {normalizeArray(selectedCandidate.skills).map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 font-semibold border border-slate-700">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: APPLICATION INSPECTOR */}
      {/* ========================================================================= */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Candidate Application</span>
                <h3 className="text-lg font-black text-white mt-0.5">{selectedApplication.applicantName}</h3>
                <p className="text-xs text-slate-400">Target Role: <strong className="text-white">{selectedApplication.jobTitle}</strong> ({selectedApplication.companyName})</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 font-semibold block">Applicant Email</span>
                  <span className="text-white font-mono text-[11px]">{selectedApplication.applicantEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Applied Date</span>
                  <span className="text-white">{formatRelativeTime(selectedApplication.appliedDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Current Pipeline State</span>
                  <span className="font-bold text-sky-400">{selectedApplication.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Candidate Cover Letter & Pitch</span>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedApplication.coverLetter || 'No cover letter attached.'}
                </div>
              </div>

              {selectedApplication.resumeSummary && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Resume Highlights</span>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                    {selectedApplication.resumeSummary}
                  </div>
                </div>
              )}

              {/* Status Update Quick Bar */}
              <div className="pt-2">
                <span className="font-bold text-slate-300 block mb-2">Advance Stage:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'UNDER_REVIEW');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'UNDER_REVIEW' } : null);
                      showToast('Status updated to Under Review');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold"
                  >
                    Move to Under Review
                  </button>

                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'INTERVIEW_SCHEDULED');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'INTERVIEW_SCHEDULED' } : null);
                      showToast('Status updated to Interview Scheduled');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  >
                    Schedule Interview
                  </button>

                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'ACCEPTED');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'ACCEPTED' } : null);
                      showToast('Status updated to Accepted / Offer');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                  >
                    Extend Offer (Accept)
                  </button>

                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'DECLINED');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'DECLINED' } : null);
                      showToast('Status updated to Declined');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 font-bold"
                  >
                    Decline Candidate
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
