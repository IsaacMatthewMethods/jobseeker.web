import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Job, 
  JobApplication, 
  UserAccount,
  FilterState, 
  JobCategory, 
  JobType, 
  ApplicationStatus 
} from '../types';
import { SHEMALABS_INITIAL_JOBS, INITIAL_APPLICATIONS, ADMIN_EMPLOYER, PRELOADED_USER } from '../data/initialJobs';
import { useAuth } from './AuthContext';
import { normalizeArray } from '../utils/formatters';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from '../lib/firebase';

interface JobContextType {
  jobs: Job[];
  applications: JobApplication[];
  users: UserAccount[];
  employers: UserAccount[];
  candidates: UserAccount[];
  savedJobIds: string[];
  filters: FilterState;
  selectedJobForDetails: Job | null;
  selectedJobForApply: Job | null;
  filteredJobs: Job[];
  featuredJobs: Job[];
  isDbConnected: boolean;
  stats: {
    totalUsers: number;
    totalJobs: number;
    remoteJobs: number;
    verifiedEmployers: number;
    totalApplications: number;
    underReviewCount: number;
    interviewsCount: number;
    acceptedCount: number;
  };
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  openJobDetails: (job: Job) => void;
  closeJobDetails: () => void;
  openApplyModal: (job: Job) => void;
  closeApplyModal: () => void;
  submitApplication: (jobId: string, coverNote: string) => Promise<boolean>;
  toggleSaveJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;
  hasAppliedToJob: (jobId: string) => boolean;
  postNewJob: (jobData: Partial<Job>) => Promise<Job>;
  deleteJob: (jobId: string) => Promise<void>;
  toggleFeaturedJob: (jobId: string, featuredState?: boolean) => Promise<void>;
  updateApplicationStatus: (applicationId: string, newStatus: ApplicationStatus, notes?: string) => Promise<void>;
  withdrawApplication: (applicationId: string) => Promise<void>;
  verifyEmployer: (userId: string, isVerified?: boolean) => Promise<void>;
  suspendEmployer: (userId: string, isSuspended?: boolean) => Promise<void>;
  deleteEmployer: (userId: string) => Promise<void>;
  reseedDatabase: () => Promise<void>;
}

const defaultFilters: FilterState = {
  keyword: '',
  location: '',
  category: 'All',
  type: 'All',
  onlyRemote: false,
  onlyFeatured: false,
  salaryRange: 'All',
  sortBy: 'newest'
};

const SAVED_JOBS_KEY = 'jobseeker_pro_saved_jobs_v2';

const INITIAL_USERS: UserAccount[] = [
  {
    ...ADMIN_EMPLOYER,
    companyIndustry: "Engineering & Cloud Infrastructure",
    isVerifiedEmployer: true
  },
  {
    id: "usr_partner_fintech",
    uid: "usr_partner_fintech",
    name: "Apex Fintech Group",
    email: "careers@apexfintech.io",
    phone: "+1 (415) 890-1200",
    userType: "EMPLOYER",
    role: "EMPLOYER",
    companyName: "Apex Fintech",
    companyIndustry: "Financial Technology & Web3",
    location: "New York, NY",
    isVerifiedEmployer: true,
    qualification: "Enterprise Talent Partner",
    skills: ["Quantitative Systems", "High Frequency Trading", "Distributed Architecture"],
    experienceYears: 8
  },
  {
    id: "usr_partner_cloudscale",
    uid: "usr_partner_cloudscale",
    name: "CloudScale Systems",
    email: "talent@cloudscale.net",
    phone: "+1 (512) 400-3322",
    userType: "EMPLOYER",
    role: "EMPLOYER",
    companyName: "CloudScale",
    companyIndustry: "Cloud DevOps & Platform Engineering",
    location: "Austin, TX",
    isVerifiedEmployer: false,
    qualification: "Infrastructure Recruitment",
    skills: ["Kubernetes", "Multi-Cloud", "Observability"],
    experienceYears: 6
  },
  {
    ...PRELOADED_USER,
    companyIndustry: undefined
  },
  {
    id: "usr_candidate_sarah",
    uid: "usr_candidate_sarah",
    name: "Sarah Chen",
    email: "sarah.chen@devmail.io",
    phone: "+1 (650) 902-1144",
    userType: "JOB_SEEKER",
    role: "JOB_SEEKER",
    location: "San Francisco, CA",
    qualification: "M.Sc. Human-Computer Interaction",
    skills: ["Figma", "Design Systems", "Prototyping", "Tailwind CSS", "User Research"],
    experienceYears: 4,
    resumeText: "Senior UI/UX Product Designer with a track record of crafting cohesive design systems for high-traffic mobile and web applications."
  },
  {
    id: "usr_candidate_marcus",
    uid: "usr_candidate_marcus",
    name: "Marcus Vance",
    email: "marcus.vance@cloudeng.tech",
    phone: "+1 (206) 774-8890",
    userType: "JOB_SEEKER",
    role: "JOB_SEEKER",
    location: "Seattle, WA",
    qualification: "B.Sc. Cloud Architecture",
    skills: ["Docker", "Kubernetes", "GCP", "Terraform", "CI/CD", "TypeScript"],
    experienceYears: 6,
    resumeText: "DevOps & Cloud Automation Engineer specialized in zero-downtime microservices orchestration and automated GitOps pipelines."
  }
];

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>(SHEMALABS_INITIAL_JOBS);
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['job_shemalabs_1', 'job_shemalabs_2'];
      }
    }
    return ['job_shemalabs_1', 'job_shemalabs_2'];
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  // Helper to re-seed initial ShemaLabs jobs into Firestore
  const reseedDatabase = async () => {
    try {
      for (const job of SHEMALABS_INITIAL_JOBS) {
        await setDoc(doc(db, 'jobs', job.id), job, { merge: true });
      }
      for (const app of INITIAL_APPLICATIONS) {
        await setDoc(doc(db, 'applications', app.id), app, { merge: true });
      }
      for (const usr of INITIAL_USERS) {
        await setDoc(doc(db, 'users', usr.id), usr, { merge: true });
      }
    } catch (e) {
      console.warn('Reseeding note:', e);
    }
  };

  // 1. Live Query (onSnapshot) for Jobs + Auto-Seeding if empty
  useEffect(() => {
    let isSubscribed = true;

    try {
      const jobsColRef = collection(db, 'jobs');
      const unsubscribe = onSnapshot(jobsColRef, async (snapshot) => {
        if (!isSubscribed) return;

        if (snapshot.empty) {
          console.info('Firestore jobs collection is empty. Auto-seeding ShemaLabs jobs...');
          try {
            for (const initialJob of SHEMALABS_INITIAL_JOBS) {
              await setDoc(doc(db, 'jobs', initialJob.id), initialJob);
            }
          } catch (seedErr) {
            console.warn('Auto-seed error note:', seedErr);
          }
          setJobs(SHEMALABS_INITIAL_JOBS);
        } else {
          const fetchedJobs: Job[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const jobItem: Job = {
              id: docSnap.id,
              title: data.title || 'Untitled Role',
              company: data.company || 'ShemaLabs',
              companyLogo: data.companyLogo || (data.company || 'SL').slice(0, 2).toUpperCase(),
              companyColor: data.companyColor || 'from-blue-600 to-indigo-700',
              location: data.location || 'Remote',
              salaryRange: data.salaryRange || data.salary || '$120k - $150k / yr',
              salary: data.salary || data.salaryRange || '$120,000 - $150,000 / yr',
              jobType: data.jobType || data.type || 'REMOTE',
              type: (data.type || data.jobType || 'Remote') as any,
              category: (data.category || 'Software Engineering') as JobCategory,
              description: data.description || '',
              requirements: normalizeArray(data.requirements),
              responsibilities: normalizeArray(data.responsibilities),
              benefits: normalizeArray(data.benefits),
              postedByUserId: data.postedByUserId || data.postedBy || 'usr_shemalabs_admin',
              postedBy: data.postedBy || data.postedByUserId || 'usr_shemalabs_admin',
              postedDate: data.postedDate || Date.now(),
              isFeatured: data.isFeatured ?? data.featured ?? false,
              featured: data.featured ?? data.isFeatured ?? false,
              urgent: data.urgent ?? false,
              isRemote: data.isRemote ?? (data.jobType === 'REMOTE' || data.type === 'Remote' || (data.location && data.location.toLowerCase().includes('remote'))),
              applicantsCount: data.applicantsCount || 0
            };
            fetchedJobs.push(jobItem);
          });

          // Sort by postedDate descending
          fetchedJobs.sort((a, b) => {
            const dateA = typeof a.postedDate === 'number' ? a.postedDate : 0;
            const dateB = typeof b.postedDate === 'number' ? b.postedDate : 0;
            return dateB - dateA;
          });

          setJobs(fetchedJobs);
          setIsDbConnected(true);
        }
      }, (error) => {
        console.warn('Firestore jobs onSnapshot listener fallback:', error);
        setIsDbConnected(false);
      });

      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (e) {
      console.warn('Firestore setup error:', e);
      setIsDbConnected(false);
    }
  }, []);

  // 2. Live Query (onSnapshot) for Applications
  useEffect(() => {
    let isSubscribed = true;

    try {
      const appsColRef = collection(db, 'applications');
      const unsubscribe = onSnapshot(appsColRef, (snapshot) => {
        if (!isSubscribed) return;

        if (!snapshot.empty) {
          const fetchedApps: JobApplication[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const appItem: JobApplication = {
              id: docSnap.id,
              jobId: data.jobId || '',
              jobTitle: data.jobTitle || 'Application',
              companyName: data.companyName || data.company || 'ShemaLabs',
              company: data.company || data.companyName || 'ShemaLabs',
              location: data.location || 'Remote',
              salary: data.salary || '',
              type: data.type || 'Remote',
              applicantUserId: data.applicantUserId || data.applicantId || '',
              applicantId: data.applicantId || data.applicantUserId || '',
              applicantName: data.applicantName || 'Applicant',
              applicantEmail: data.applicantEmail || '',
              applicantPhone: data.applicantPhone || '',
              coverLetter: data.coverLetter || data.coverNote || '',
              coverNote: data.coverNote || data.coverLetter || '',
              resumeSummary: data.resumeSummary || '',
              appliedDate: data.appliedDate || Date.now(),
              status: (data.status || 'SUBMITTED') as ApplicationStatus,
              statusNotes: data.statusNotes || ''
            };
            fetchedApps.push(appItem);
          });

          // Sort by appliedDate descending
          fetchedApps.sort((a, b) => {
            const timeA = typeof a.appliedDate === 'number' ? a.appliedDate : 0;
            const timeB = typeof b.appliedDate === 'number' ? b.appliedDate : 0;
            return timeB - timeA;
          });

          setApplications(fetchedApps);
        }
      }, (error) => {
        console.warn('Firestore applications onSnapshot note:', error);
      });

      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (e) {
      console.warn('Applications subscription error:', e);
    }
  }, []);

  // 3. Live Query (onSnapshot) for Users
  useEffect(() => {
    let isSubscribed = true;

    try {
      const usersColRef = collection(db, 'users');
      const unsubscribe = onSnapshot(usersColRef, async (snapshot) => {
        if (!isSubscribed) return;

        if (snapshot.empty) {
          // Seed initial users into Firestore
          try {
            for (const initUser of INITIAL_USERS) {
              await setDoc(doc(db, 'users', initUser.id), initUser, { merge: true });
            }
          } catch (seedErr) {
            console.warn('Initial users seed note:', seedErr);
          }
          setUsers(INITIAL_USERS);
        } else {
          const fetchedUsers: UserAccount[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const userObj: UserAccount = {
              id: docSnap.id,
              uid: docSnap.id,
              name: data.name || 'User',
              email: data.email || '',
              phone: data.phone || '+1 (555) 000-0000',
              userType: data.userType || data.role || 'JOB_SEEKER',
              role: data.userType || data.role || 'JOB_SEEKER',
              location: data.location || 'Remote',
              qualification: data.qualification || 'Professional',
              skills: normalizeArray(data.skills),
              experienceYears: data.experienceYears || 3,
              resumeText: data.resumeText || '',
              companyName: data.companyName,
              companyIndustry: data.companyIndustry,
              isVerifiedEmployer: data.isVerifiedEmployer ?? false,
              isSuspended: data.isSuspended ?? false,
              updatedAt: data.updatedAt
            };
            fetchedUsers.push(userObj);
          });

          setUsers(fetchedUsers);
        }
      }, (err) => {
        console.warn('Users collection listener note:', err);
      });

      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (e) {
      console.warn('Users listener setup note:', e);
    }
  }, []);

  // Sync saved jobs to localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const openJobDetails = (job: Job) => {
    setSelectedJobForDetails(job);
  };

  const closeJobDetails = () => {
    setSelectedJobForDetails(null);
  };

  const openApplyModal = (job: Job) => {
    setSelectedJobForApply(job);
  };

  const closeApplyModal = () => {
    setSelectedJobForApply(null);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const isJobSaved = (jobId: string) => savedJobIds.includes(jobId);

  const hasAppliedToJob = (jobId: string) => {
    if (!user) return false;
    const userEmail = (user.email || '').toLowerCase();
    const userId = user.id || user.uid;
    return applications.some(
      app => app.jobId === jobId && (
        (app.applicantEmail && app.applicantEmail.toLowerCase() === userEmail) || 
        (app.applicantUserId && app.applicantUserId === userId) ||
        (app.applicantId && app.applicantId === userId)
      )
    );
  };

  // Submitting an Application directly to Firestore
  const submitApplication = async (jobId: string, coverNote: string): Promise<boolean> => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !user) return false;

    const newAppId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const appliedTimestamp = Date.now();

    const newApp: JobApplication = {
      id: newAppId,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company,
      company: job.company,
      location: job.location,
      salary: job.salaryRange || job.salary || '$120k - $150k / yr',
      type: job.type || 'Remote',
      applicantUserId: user.id || user.uid || 'usr_candidate',
      applicantId: user.id || user.uid || 'usr_candidate',
      applicantName: user.name || 'Candidate',
      applicantEmail: user.email || 'candidate@example.com',
      applicantPhone: user.phone || '+1 (555) 000-0000',
      coverLetter: coverNote.trim(),
      coverNote: coverNote.trim(),
      resumeSummary: user.resumeText || 'Verified technology candidate with proven software engineering expertise.',
      appliedDate: appliedTimestamp,
      status: 'SUBMITTED',
      statusNotes: 'Application submitted successfully. Queued for recruiter review.'
    };

    // Optimistic local state update
    setApplications(prev => [newApp, ...prev.filter(a => a.id !== newAppId)]);

    // Direct Firestore Write
    try {
      await setDoc(doc(db, 'applications', newAppId), newApp);
      
      // Update job's applicantsCount in Firestore
      const newCount = (job.applicantsCount || 0) + 1;
      await updateDoc(doc(db, 'jobs', job.id), {
        applicantsCount: newCount
      });
    } catch (err) {
      console.warn('Firestore setDoc applications note:', err);
    }

    return true;
  };

  // Posting a Job directly to Firestore
  const postNewJob = async (jobData: Partial<Job>): Promise<Job> => {
    const newJobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const postTimestamp = Date.now();

    const newJob: Job = {
      id: newJobId,
      title: jobData.title || 'Software Engineer',
      company: jobData.company || (user?.companyName || 'ShemaLabs'),
      companyLogo: (jobData.company || user?.companyName || 'SL').slice(0, 2).toUpperCase(),
      companyColor: jobData.companyColor || 'from-blue-600 to-indigo-700',
      location: jobData.location || 'Remote / San Francisco, CA',
      salaryRange: jobData.salaryRange || jobData.salary || '$130k - $165k / yr',
      salary: jobData.salaryRange || jobData.salary || '$130,000 - $165,000 / yr',
      jobType: jobData.jobType || (jobData.isRemote ? 'REMOTE' : 'FULL_TIME'),
      type: (jobData.type || (jobData.isRemote ? 'Remote' : 'Full-Time')) as any,
      category: jobData.category || 'Software Engineering',
      description: jobData.description || 'Join our team to build transformative cloud and mobile products.',
      requirements: jobData.requirements || 'Strong experience in modern software engineering frameworks.',
      responsibilities: jobData.responsibilities || ['Design, develop, and scale production features'],
      benefits: jobData.benefits || ['Competitive salary, remote flexibility, and comprehensive health benefits'],
      postedByUserId: user?.id || user?.uid || 'usr_shemalabs_admin',
      postedBy: user?.id || user?.uid || 'usr_shemalabs_admin',
      postedDate: postTimestamp,
      isFeatured: !!jobData.isFeatured || !!jobData.featured,
      featured: !!jobData.isFeatured || !!jobData.featured,
      urgent: !!jobData.urgent,
      isRemote: jobData.isRemote ?? true,
      applicantsCount: 0
    };

    // Optimistic local state update
    setJobs(prev => [newJob, ...prev]);

    // Direct Firestore Write
    try {
      await setDoc(doc(db, 'jobs', newJobId), newJob);
    } catch (err) {
      console.warn('Firestore setDoc jobs note:', err);
    }

    return newJob;
  };

  // Delete Job from Firestore
  const deleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (e) {
      console.warn('Delete job error in Firestore:', e);
    }
  };

  // Toggle Featured status on a Job in Firestore
  const toggleFeaturedJob = async (jobId: string, explicitState?: boolean) => {
    const target = jobs.find(j => j.id === jobId);
    if (!target) return;
    const newState = explicitState !== undefined ? explicitState : !(target.isFeatured || target.featured);

    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isFeatured: newState, featured: newState } : j));

    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        isFeatured: newState,
        featured: newState,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Toggle featured job note:', e);
    }
  };

  // Updating application status in Firestore
  const updateApplicationStatus = async (
    applicationId: string, 
    newStatus: ApplicationStatus, 
    notes?: string
  ) => {
    const defaultNotes = 
      newStatus === 'UNDER_REVIEW' ? 'Your profile is currently under active review by the engineering team.' :
      newStatus === 'INTERVIEW_SCHEDULED' ? 'Technical interview round scheduled! Check your calendar for details.' :
      newStatus === 'ACCEPTED' ? 'Congratulations! Offer extended.' :
      newStatus === 'DECLINED' ? 'Thank you for your interest. We have decided to move forward with other candidates at this time.' :
      'Application received.';

    const finalNotes = notes || defaultNotes;

    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus, statusNotes: finalNotes }
          : app
      )
    );

    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        statusNotes: finalNotes,
        updatedAt: Date.now()
      });
    } catch (err) {
      console.warn('Firestore application status update note:', err);
    }
  };

  // Withdrawing application
  const withdrawApplication = async (applicationId: string) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));

    try {
      await deleteDoc(doc(db, 'applications', applicationId));
    } catch (err) {
      console.warn('Firestore delete application note:', err);
    }
  };

  // Verify Employer Partner in Firestore
  const verifyEmployer = async (userId: string, isVerified: boolean = true) => {
    setUsers(prev => prev.map(u => (u.id === userId || u.uid === userId) ? { ...u, isVerifiedEmployer: isVerified } : u));
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerifiedEmployer: isVerified,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Verify employer note:', e);
    }
  };

  // Suspend Employer Partner in Firestore
  const suspendEmployer = async (userId: string, isSuspended: boolean = true) => {
    setUsers(prev => prev.map(u => (u.id === userId || u.uid === userId) ? { ...u, isSuspended } : u));
    try {
      await updateDoc(doc(db, 'users', userId), {
        isSuspended,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Suspend employer note:', e);
    }
  };

  // Delete Employer User from Firestore
  const deleteEmployer = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId && u.uid !== userId));
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('Delete user note:', e);
    }
  };

  // Filtered Employers and Candidates
  const employers = useMemo(() => {
    return users.filter(u => u.userType === 'EMPLOYER' || u.role === 'EMPLOYER');
  }, [users]);

  const candidates = useMemo(() => {
    return users.filter(u => u.userType === 'JOB_SEEKER' || u.role === 'JOB_SEEKER');
  }, [users]);

  // Filtered and Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Keyword matching
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesDesc = (job.description || '').toLowerCase().includes(q);
        const reqStr = Array.isArray(job.requirements) ? job.requirements.join(' ') : (job.requirements || '');
        const matchesReq = reqStr.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesReq) {
          return false;
        }
      }

      // Location matching
      if (filters.location.trim()) {
        const loc = filters.location.toLowerCase().trim();
        if (!job.location.toLowerCase().includes(loc)) {
          return false;
        }
      }

      // Category matching
      if (filters.category !== 'All') {
        const cat = filters.category.toLowerCase();
        const jobCat = (job.category || '').toLowerCase();
        if (!jobCat.includes(cat) && !cat.includes(jobCat)) {
          return false;
        }
      }

      // Job Type matching
      if (filters.type !== 'All') {
        const t = filters.type.toUpperCase().replace('-', '_');
        const jt = (job.jobType || job.type || '').toUpperCase().replace('-', '_');
        if (!jt.includes(t) && !t.includes(jt)) {
          return false;
        }
      }

      // Remote only
      if (filters.onlyRemote && !job.isRemote && job.jobType !== 'REMOTE' && job.type !== 'Remote') {
        return false;
      }

      // Featured only
      if (filters.onlyFeatured && !job.featured && !job.isFeatured) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'applicants') {
        return (b.applicantsCount || 0) - (a.applicantsCount || 0);
      }
      // default: newest
      const dateA = typeof a.postedDate === 'number' ? a.postedDate : 0;
      const dateB = typeof b.postedDate === 'number' ? b.postedDate : 0;
      return dateB - dateA;
    });
  }, [jobs, filters]);

  const featuredJobs = useMemo(() => {
    return jobs.filter(j => j.featured || j.isFeatured);
  }, [jobs]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const remoteJobs = jobs.filter(j => j.isRemote || j.jobType === 'REMOTE' || j.type === 'Remote').length;
    const verifiedEmployers = employers.filter(e => e.isVerifiedEmployer).length;
    
    const userApps = user 
      ? applications.filter(a => 
          (a.applicantEmail && a.applicantEmail.toLowerCase() === user.email.toLowerCase()) || 
          (a.applicantUserId && a.applicantUserId === (user.id || user.uid)) ||
          (a.applicantId && a.applicantId === (user.id || user.uid))
        ) 
      : applications;
    
    return {
      totalUsers: users.length,
      totalJobs,
      remoteJobs,
      verifiedEmployers,
      totalApplications: applications.length,
      underReviewCount: userApps.filter(a => a.status === 'UNDER_REVIEW').length,
      interviewsCount: userApps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      acceptedCount: userApps.filter(a => a.status === 'ACCEPTED').length
    };
  }, [jobs, applications, users, employers, user]);

  return (
    <JobContext.Provider
      value={{
        jobs,
        applications,
        users,
        employers,
        candidates,
        savedJobIds,
        filters,
        selectedJobForDetails,
        selectedJobForApply,
        filteredJobs,
        featuredJobs,
        isDbConnected,
        stats,
        setFilters,
        updateFilter,
        resetFilters,
        openJobDetails,
        closeJobDetails,
        openApplyModal,
        closeApplyModal,
        submitApplication,
        toggleSaveJob,
        isJobSaved,
        hasAppliedToJob,
        postNewJob,
        deleteJob,
        toggleFeaturedJob,
        updateApplicationStatus,
        withdrawApplication,
        verifyEmployer,
        suspendEmployer,
        deleteEmployer,
        reseedDatabase
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

