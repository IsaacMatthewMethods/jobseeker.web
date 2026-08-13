export type UserType = 'JOB_SEEKER' | 'EMPLOYER';
export type UserRole = UserType;
export type Role = UserType;

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'CONTRACT' | 'INTERNSHIP';
export type FirestoreJobType = JobType;
export type DisplayJobType = 'Remote' | 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship' | JobType;

export type JobCategory = 
  | 'All'
  | 'Software Engineering' 
  | 'Design'
  | 'UI/UX Design'
  | 'Quality Assurance' 
  | 'Cloud & DevOps' 
  | 'Product & Data';

export type ApplicationStatus = 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'INTERVIEW_SCHEDULED' 
  | 'ACCEPTED' 
  | 'DECLINED';

export interface UserAccount {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  role?: UserType;
  location?: string;
  qualification?: string;
  skills?: string[] | string;
  experienceYears?: number;
  resumeText?: string;
  companyName?: string;
  companyIndustry?: string;
  isVerifiedEmployer?: boolean;
  isSuspended?: boolean;
  avatarUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export type UserProfile = UserAccount;

export interface JobListing {
  id: string;
  title: string;
  company: string; // e.g. "ShemaLabs"
  companyLogo?: string;
  companyColor?: string;
  location: string; // e.g. "Remote / San Francisco, CA"
  salaryRange: string; // e.g. "$130,000 - $165,000 / yr"
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType | DisplayJobType;
  type?: DisplayJobType;
  category: string;
  description: string;
  requirements: string | string[];
  responsibilities?: string[] | string;
  benefits?: string[] | string;
  postedByUserId: string; // "usr_shemalabs_admin"
  postedBy?: string;
  postedDate: number | string;
  isFeatured: boolean;
  featured?: boolean;
  urgent?: boolean;
  isRemote?: boolean;
  applicantsCount?: number;
  updatedAt?: number;
}

export type Job = JobListing;

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  company?: string;
  location?: string;
  salary?: string;
  type?: DisplayJobType;
  applicantUserId: string;
  applicantId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter: string;
  coverNote?: string;
  resumeSummary?: string;
  appliedDate: number | string;
  status: ApplicationStatus;
  statusNotes?: string;
  updatedAt?: number;
}

export interface FilterState {
  keyword: string;
  location: string;
  category: JobCategory;
  type: string;
  onlyRemote: boolean;
  onlyFeatured: boolean;
  salaryRange: string;
  sortBy: 'newest' | 'salary_high' | 'applicants';
}

