export type UserRole = 'JOB_SEEKER' | 'EMPLOYER';
export type Role = UserRole;

export type FirestoreJobType = 'REMOTE' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type JobType = 'Remote' | 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship' | FirestoreJobType;

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

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserRole;
  role?: UserRole;
  companyName?: string;
  location?: string;
  qualification?: string;
  skills?: string[] | string;
  experienceYears?: number;
  resumeText?: string;
  avatarUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string; // e.g. "ShemaLabs"
  companyLogo?: string;
  companyColor?: string;
  location: string; // e.g. "Remote / San Francisco, CA"
  salaryRange?: string; // e.g. "$130,000 - $165,000 / yr"
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: FirestoreJobType | JobType;
  type?: JobType;
  category: JobCategory;
  description: string;
  requirements: string | string[];
  responsibilities?: string[];
  benefits?: string[];
  postedByUserId?: string; // "usr_shemalabs_admin"
  postedBy?: string;
  postedDate: number | string;
  isFeatured?: boolean;
  featured?: boolean;
  urgent?: boolean;
  isRemote?: boolean;
  applicantsCount?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName?: string;
  company?: string;
  location?: string;
  salary?: string;
  type?: JobType;
  applicantUserId?: string;
  applicantId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter?: string;
  coverNote?: string;
  resumeSummary?: string;
  appliedDate: number | string;
  status: ApplicationStatus;
  statusNotes?: string;
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

