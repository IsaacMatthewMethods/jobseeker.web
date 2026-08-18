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
  Lock,
  Crown,
  Key,
  UserPlus,
  Shield,
  UserCog
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

type AdminSubTab = 'overview' | 'admins' | 'employers' | 'candidates' | 'jobs' | 'applications';

const ADMIN_ROLE_PRESETS = [
  {
    role: 'Super Administrator',
    description: 'Full root access: Grant/revoke admin rights, manage all vacancies, verify enterprise partners, database seeding.'
  },
  {
    role: 'Platform Administrator',
    description: 'Full vacancy moderation, candidate dossier analysis, employer verification, and status updates.'
  },
  {
    role: 'Recruitment Lead Admin',
    description: 'Manage interview pipelines, review applicant submissions, publish ShemaLabs vacancies, and candidate screening.'
  },
  {
    role: 'Talent & Compliance Moderator',
    description: 'Candidate verification, reviewing portfolio credentials, evaluating applications, and candidate communications.'
  }
];

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
    admins,
    stats,
    deleteJob, 
    toggleFeaturedJob, 
    updateApplicationStatus, 
    verifyEmployer, 
    suspendEmployer, 
    deleteEmployer,
    toggleAdminRole,
    postNewJob,
    reseedDatabase,
    openJobDetails
  } = useJobs();

  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  
  // Modals & Inspection State
  const [selectedCandidate, setSelectedCandidate] = useState<UserAccount | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isQuickPostModalOpen, setIsQuickPostModalOpen] = useState(false);
  const [isAssignAdminModalOpen, setIsAssignAdminModalOpen] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);

  // Admin Delegation State
  const [selectedUserToPromoteId, setSelectedUserToPromoteId] = useState<string>('');
  const [customAdminEmail, setCustomAdminEmail] = useState<string>('');
  const [selectedAdminRole, setSelectedAdminRole] = useState<string>('Super Administrator');
  const [isPromoting, setIsPromoting] = useState(false);

  // Search & Filter states for sub-tabs
  const [adminSearch, setAdminSearch] = useState('');
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

  // Check access authorization: admin@shemalabs.com, isAdmin, or EMPLOYER
  const isAuthorizedAdmin = Boolean(
    user && (
      user.isAdmin ||
      user.email?.toLowerCase() === 'admin@shemalabs.com' ||
      user.userType === 'EMPLOYER' ||
      user.role === 'EMPLOYER'
    )
  );

  // Filtered Admins
  const displayedAdmins = useMemo(() => {
    return admins.filter(adm => {
      if (!adminSearch.trim()) return true;
      const q = adminSearch.toLowerCase();
      return (
        adm.name.toLowerCase().includes(q) ||
        adm.email.toLowerCase().includes(q) ||
        (adm.adminRole && adm.adminRole.toLowerCase().includes(q)) ||
        (adm.companyName && adm.companyName.toLowerCase().includes(q))
      );
    });
  }, [admins, adminSearch]);

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
      // Status filter
      if (applicationStatusFilter !== 'ALL' && app.status !== applicationStatusFilter) {
        return false;
      }
      if (!applicationSearch.trim()) return true;
      const q = applicationSearch.toLowerCase();
      return (
        app.applicantName.toLowerCase().includes(q) ||
        app.applicantEmail.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.companyName.toLowerCase().includes(q)
      );
    });
  }, [applications, applicationSearch, applicationStatusFilter]);

  // Toggle Admin Privileges handler
  const handleToggleAdmin = async (targetUser: UserAccount, explicitState?: boolean, customRole?: string) => {
    const isGranting = explicitState !== undefined ? explicitState : !targetUser.isAdmin;
    const role = customRole || targetUser.adminRole || selectedAdminRole || 'Administrator';
    
    // Prevent locking out primary shemalabs admin
    if (!isGranting && targetUser.email.toLowerCase() === 'admin@shemalabs.com') {
      showToast('Cannot revoke permissions from the Primary Root Administrator.');
      return;
    }

    await toggleAdminRole(targetUser.id, isGranting, role);

    if (isGranting) {
      showToast(`👑 Granted ${role} privileges to ${targetUser.name}!`);
    } else {
      showToast(`Revoked Admin privileges for ${targetUser.name}.`);
    }

    if (selectedCandidate && (selectedCandidate.id === targetUser.id || selectedCandidate.uid === targetUser.id)) {
      setSelectedCandidate(prev => prev ? { 
        ...prev, 
        isAdmin: isGranting, 
        adminRole: isGranting ? role : undefined 
      } : null);
    }
  };

  // Promote via Assign Modal
  const handlePromoteFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToPromoteId && !customAdminEmail.trim()) {
      showToast('Please select a user or enter an email address.');
      return;
    }

    setIsPromoting(true);

    let target = users.find(u => u.id === selectedUserToPromoteId || u.uid === selectedUserToPromoteId);
    if (!target && customAdminEmail.trim()) {
      target = users.find(u => u.email.toLowerCase() === customAdminEmail.trim().toLowerCase());
    }

    if (target) {
      await handleToggleAdmin(target, true, selectedAdminRole);
      setIsAssignAdminModalOpen(false);
      setSelectedUserToPromoteId('');
      setCustomAdminEmail('');
    } else {
      showToast(`No user found with email ${customAdminEmail}. Please have them register first.`);
    }

    setIsPromoting(false);
  };

  // Quick Post Job Handler
  const handleQuickPostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Please fill in the title and description.');
      return;
    }

    setIsSubmittingJob(true);
    try {
      await postNewJob({
        title: newTitle.trim(),
        company: newCompany.trim() || 'ShemaLabs',
        location: newLocation.trim() || 'Remote',
        salaryRange: newSalary.trim() || '$130k - $165k / yr',
        salary: newSalary.trim() || '$130k - $165k / yr',
        jobType: newJobType,
        type: newJobType === 'REMOTE' ? 'Remote' : 'Full-Time',
        category: newCategory,
        description: newDescription.trim(),
        requirements: newRequirements.trim() || 'Strong technical experience and problem-solving mindset.',
        isFeatured: newIsFeatured,
        featured: newIsFeatured,
        isRemote: newJobType === 'REMOTE'
      });

      showToast(`🎉 Vacancy "${newTitle}" posted successfully to Firestore!`);
      setIsQuickPostModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewRequirements('');
    } catch (err) {
      showToast('Failed to post job. Please try again.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Trigger Database Reseed
  const handleReseed = async () => {
    if (!window.confirm('Reset and reseed Firestore with pristine ShemaLabs initial data? This will sync 6 verified vacancies, 3 partner employers, and initial talent candidates.')) {
      return;
    }
    setIsReseeding(true);
    try {
      await reseedDatabase();
      showToast('⚡ Firestore database successfully refreshed with ShemaLabs seed data!');
    } catch (err) {
      showToast('Error reseeding database.');
    } finally {
      setIsReseeding(false);
    }
  };

  // Unauthorized Barrier
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">Admin Command Center</h2>
          <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
            Administrative access is restricted to verified administrators and recruiters. Sign in as Administrator or login with your authorized account.
          </p>

          <div className="space-y-3">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Sign In with Administrator Account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    ShemaLabs Admin Command Center
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Firestore</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Role-Based Access Control • Vacancy Moderation • Candidate Pipeline • Partner Management
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => setIsAssignAdminModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>Assign Administrator</span>
              </button>

              <button
                onClick={handleReseed}
                disabled={isReseeding}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center space-x-1.5 disabled:opacity-50"
                title="Reseed Firestore collections"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin text-sky-400' : ''}`} />
                <span>{isReseeding ? 'Syncing...' : 'Sync Seed DB'}</span>
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
              onClick={() => setActiveSubTab('admins')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeSubTab === 'admins'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30 font-black'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Admin Team & Delegation ({admins.length})</span>
              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                RBAC
              </span>
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
            {/* Executive KPI Pulse Cards (5 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

              <div 
                onClick={() => setActiveSubTab('admins')}
                className="bg-slate-900/90 rounded-2xl p-5 border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-xl relative overflow-hidden cursor-pointer group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Admins & Staff</span>
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-amber-300">{stats.totalAdmins}</span>
                  <span className="text-xs text-amber-400/80 font-semibold">Active Admins</span>
                </div>
                <div className="mt-2 text-[11px] text-amber-400/80 font-medium flex items-center space-x-1">
                  <span>Manage team & roles</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
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
                  <span className="text-xs text-emerald-400 font-semibold">{stats.remoteJobs} remote</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">{jobs.filter(j => j.isFeatured || j.featured).length} marked as Featured</div>
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
                <div className="mt-2 text-[11px] text-slate-500">One-click partner verification</div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Applications</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{stats.totalApplications}</span>
                  <span className="text-xs text-amber-400 font-semibold">{stats.interviewsCount} interviews</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">Live stream across open roles</div>
              </div>
            </div>

            {/* Quick Admin Delegation Feature Card */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/40">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Empower Team Members with Administrative Rights
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    As an administrator, you have full authority to grant or revoke administrative permissions for any candidate or employer. Promoted admins can moderate vacancies, evaluate talent dossiers, and oversee enterprise partners.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    onClick={() => setIsAssignAdminModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950" />
                    <span>Make Someone Admin</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('admins')}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>View Admin Team ({admins.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <span>Live Recruitment Pipeline Status</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-xs font-semibold">Under Review</div>
                  <div className="text-2xl font-black text-indigo-400 mt-1">{stats.underReviewCount}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Screening dossiers</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-xs font-semibold">Interviews Scheduled</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{stats.interviewsCount}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Technical rounds</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-xs font-semibold">Offers Extended</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{stats.acceptedCount}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Offers accepted</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-xs font-semibold">Total Pool</div>
                  <div className="text-2xl font-black text-sky-400 mt-1">{stats.totalApplications}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Active submissions</div>
                </div>
              </div>
            </div>

            {/* Quick Overview Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Applications Preview */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Recent Candidate Applications</span>
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
                          {emp.isAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              👑 Admin
                            </span>
                          )}
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
        {/* SUBTAB 2: ADMIN TEAM & DELEGATION */}
        {/* ========================================================================= */}
        {activeSubTab === 'admins' && (
          <div className="space-y-6">
            {/* Header with Search and Promote Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search administrators by name, email, or role..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsAssignAdminModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-slate-950" />
                  <span>Promote / Add New Administrator</span>
                </button>
              </div>
            </div>

            {/* Administrators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAdmins.map((adm) => {
                const isRootSuperAdmin = adm.email.toLowerCase() === 'admin@shemalabs.com';
                return (
                  <div
                    key={adm.id}
                    className="bg-slate-900/90 rounded-2xl p-5 border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-base flex items-center justify-center shadow-md shadow-amber-500/20">
                            {adm.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-sm font-black text-white">{adm.name}</h4>
                              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            </div>
                            <span className="text-[11px] text-amber-400 font-bold block mt-0.5">
                              {adm.adminRole || 'Administrator'}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isRootSuperAdmin
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                        }`}>
                          {isRootSuperAdmin ? 'Root Admin' : 'Staff Admin'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate font-mono text-[11px] text-slate-200">{adm.email}</span>
                        </div>
                        {adm.companyName && (
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate text-slate-300">{adm.companyName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{adm.location || 'San Francisco, CA / Remote'}</span>
                        </div>
                      </div>

                      {/* Delegation Metadata */}
                      <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Account Type:</span>
                          <span className="text-white font-semibold">{adm.userType === 'EMPLOYER' ? 'Employer / Recruiter' : 'Talent Candidate'}</span>
                        </div>
                        {adm.adminGrantedBy && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Authorized By:</span>
                            <span className="text-amber-300 font-semibold">{adm.adminGrantedBy}</span>
                          </div>
                        )}
                        {adm.adminGrantedAt && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Granted Date:</span>
                            <span className="text-slate-300">{formatRelativeTime(adm.adminGrantedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Full Admin Rights</span>
                      </span>

                      {isRootSuperAdmin ? (
                        <span className="text-[10px] font-bold text-slate-500 italic">Primary Root (Protected)</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to revoke Administrator privileges for "${adm.name}" (${adm.email})?`)) {
                              handleToggleAdmin(adm, false);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Revoke Admin</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: EMPLOYERS & ENTERPRISE PARTNERS */}
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
                      <th className="py-3.5 px-4">Admin Status</th>
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedEmployers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
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
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-white text-sm">{emp.companyName || emp.name}</span>
                                  {emp.isAdmin && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="ShemaLabs Admin" />
                                  )}
                                </div>
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

                          <td className="py-3.5 px-4">
                            {emp.isAdmin ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/40">
                                <Crown className="w-3 h-3" />
                                <span>{emp.adminRole || 'Administrator'}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Standard</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Make / Revoke Admin Button */}
                              {emp.email.toLowerCase() !== 'admin@shemalabs.com' && (
                                <button
                                  onClick={() => handleToggleAdmin(emp, !emp.isAdmin)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    emp.isAdmin
                                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40'
                                  }`}
                                  title={emp.isAdmin ? 'Revoke admin rights' : 'Promote to platform admin'}
                                >
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  <span>{emp.isAdmin ? 'Revoke Admin' : 'Make Admin'}</span>
                                </button>
                              )}

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
        {/* SUBTAB 4: CANDIDATES DIRECTORY */}
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
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                              {cand.isAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  👑 Admin
                                </span>
                              )}
                            </div>
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
                      {/* Admin Toggle Quick Action */}
                      <button
                        onClick={() => handleToggleAdmin(cand, !cand.isAdmin)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          cand.isAdmin
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
                            : 'bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700'
                        }`}
                        title={cand.isAdmin ? 'Revoke admin rights' : 'Promote candidate to admin'}
                      >
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>{cand.isAdmin ? 'Revoke Admin' : 'Make Admin'}</span>
                      </button>

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
        {/* SUBTAB 5: JOB MODERATION QUEUE */}
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
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
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
                                className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete vacancy "${job.title}" at ${job.company}?`)) {
                                    deleteJob(job.id);
                                    showToast(`Listing "${job.title}" removed.`);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                                title="Delete job posting"
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
        {/* SUBTAB 6: APPLICATION PIPELINE */}
        {/* ========================================================================= */}
        {activeSubTab === 'applications' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={applicationSearch}
                  onChange={(e) => setApplicationSearch(e.target.value)}
                  placeholder="Search by candidate name, email, or job title..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
                {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'DECLINED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApplicationStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      applicationStatusFilter === st
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'ALL' ? 'All Applications' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Applicant Candidate</th>
                      <th className="py-3.5 px-4">Target Opportunity</th>
                      <th className="py-3.5 px-4">Applied Date</th>
                      <th className="py-3.5 px-4">Pipeline Status</th>
                      <th className="py-3.5 px-4 text-right">Evaluation & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedApplications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          No candidate applications found for the selected status.
                        </td>
                      </tr>
                    ) : (
                      displayedApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">{app.applicantName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{app.applicantEmail}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">{app.jobTitle}</div>
                            <div className="text-[10px] text-slate-500">{app.companyName}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-400">{formatRelativeTime(app.appliedDate)}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={app.status}
                              onChange={(e) => {
                                updateApplicationStatus(app.id, e.target.value as ApplicationStatus);
                                showToast(`Candidate moved to ${e.target.value.replace('_', ' ')}`);
                              }}
                              className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
                                app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                app.status === 'UNDER_REVIEW' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                                app.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                'bg-sky-500/10 text-sky-400 border-sky-500/30'
                              }`}
                            >
                              <option value="SUBMITTED">SUBMITTED</option>
                              <option value="UNDER_REVIEW">UNDER REVIEW</option>
                              <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
                              <option value="ACCEPTED">ACCEPTED (OFFER)</option>
                              <option value="DECLINED">DECLINED</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review Pitch</span>
                            </button>
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
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ASSIGN / PROMOTE ADMINISTRATOR */}
      {/* ========================================================================= */}
      {isAssignAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Crown className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Promote / Assign Administrator</h3>
                  <p className="text-xs text-amber-400 font-semibold">Role-Based Access Control Delegation</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignAdminModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePromoteFromModal} className="space-y-4">
              {/* Select Platform User */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Registered Candidate or Employer *
                </label>
                <select
                  value={selectedUserToPromoteId}
                  onChange={(e) => {
                    setSelectedUserToPromoteId(e.target.value);
                    const found = users.find(u => u.id === e.target.value);
                    if (found) setCustomAdminEmail(found.email);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose from existing platform users --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.userType === 'EMPLOYER' ? 'Employer' : 'Candidate'} {u.isAdmin ? '👑 [Current Admin]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Or manual email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Or Target User Email Address
                </label>
                <input
                  type="email"
                  value={customAdminEmail}
                  onChange={(e) => setCustomAdminEmail(e.target.value)}
                  placeholder="e.g. colleague@shemalabs.com or partner@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Role Preset Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Administrative Role Title & Access Level *
                </label>
                <div className="space-y-2">
                  {ADMIN_ROLE_PRESETS.map((p) => (
                    <div
                      key={p.role}
                      onClick={() => setSelectedAdminRole(p.role)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedAdminRole === p.role
                          ? 'bg-amber-500/15 border-amber-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedAdminRole === p.role ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                      }`}>
                        {selectedAdminRole === p.role && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${selectedAdminRole === p.role ? 'text-amber-300' : 'text-slate-200'}`}>
                          {p.role}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permission Summary Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Immediate Cloud Firestore Sync</span>
                </div>
                <p className="text-slate-400">
                  When granted, this user will gain immediate access to the ShemaLabs Admin Command Center, live recruitment pipeline, and job moderation tools.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignAdminModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center space-x-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>{isPromoting ? 'Promoting...' : 'Confirm & Authorize Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK POST VACANCY AS SHEMALABS */}
      {/* ========================================================================= */}
      {isQuickPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Post Vacancy as ShemaLabs</h3>
                  <p className="text-xs text-slate-400">Directly syncs to Cloud Firestore <code className="text-sky-400">jobs</code> collection</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickPostModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickPostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer (React / TypeScript)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Company Entity</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="ShemaLabs"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="$130k - $165k / yr"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Location Coordinates</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Remote / San Francisco, CA"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Design">Design / UI-UX</option>
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
      {/* MODAL 3: CANDIDATE DOSSIER INSPECTOR */}
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
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-white">{selectedCandidate.name}</h3>
                    {selectedCandidate.isAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        👑 Admin
                      </span>
                    )}
                  </div>
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
              {/* Admin Privileges Delegation Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedCandidate.isAdmin
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className={`w-4 h-4 ${selectedCandidate.isAdmin ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-white">Administrative Privileges Status</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    selectedCandidate.isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedCandidate.isAdmin ? selectedCandidate.adminRole || 'Administrator' : 'Standard User'}
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  {selectedCandidate.isAdmin
                    ? `This user currently has active ${selectedCandidate.adminRole || 'Administrator'} privileges, allowing them to access the ShemaLabs Admin Command Center.`
                    : 'You can promote this candidate to an Administrator, granting them vacancy moderation and candidate evaluation access.'}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => handleToggleAdmin(selectedCandidate, !selectedCandidate.isAdmin)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
                      selectedCandidate.isAdmin
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{selectedCandidate.isAdmin ? 'Revoke Administrator Rights' : 'Grant Administrator Rights'}</span>
                  </button>
                </div>
              </div>

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
      {/* MODAL 4: APPLICATION INSPECTOR */}
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
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold cursor-pointer"
                  >
                    Move to Under Review
                  </button>

                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'INTERVIEW_SCHEDULED');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'INTERVIEW_SCHEDULED' } : null);
                      showToast('Status updated to Interview Scheduled');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold cursor-pointer"
                  >
                    Schedule Interview
                  </button>

                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'ACCEPTED');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'ACCEPTED' } : null);
                      showToast('Status updated to Accepted / Offer');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold cursor-pointer"
                  >
                    Extend Offer (Accept)
                  </button>

                  <button
                    onClick={async () => {
                      await updateApplicationStatus(selectedApplication.id, 'DECLINED');
                      setSelectedApplication(prev => prev ? { ...prev, status: 'DECLINED' } : null);
                      showToast('Status updated to Declined');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 font-bold cursor-pointer"
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
