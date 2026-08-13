import { Job, JobApplication, UserProfile } from '../types';

export const ADMIN_EMPLOYER: UserProfile = {
  id: "usr_shemalabs_admin",
  uid: "usr_shemalabs_admin",
  name: "ShemaLabs Admin",
  email: "admin@shemalabs.com",
  userType: "EMPLOYER",
  role: "EMPLOYER",
  companyName: "ShemaLabs",
  phone: "+1 (415) 555-0199",
  location: "San Francisco, CA",
  qualification: "Executive Leadership & Talent Acquisition",
  skills: ["Engineering Leadership", "Technical Recruiting", "Product Architecture"],
  experienceYears: 10,
  resumeText: "Engineering Director & Talent Acquisition Lead at ShemaLabs. Sourcing world-class software engineering and design talent."
};

export const PRELOADED_USER: UserProfile = {
  id: "methods-tech-0616",
  uid: "methods-tech-0616",
  name: "Methods Technology",
  email: "methodstechnology1@gmail.com",
  userType: "JOB_SEEKER",
  role: "JOB_SEEKER",
  phone: "+234 800 123 4567",
  location: "Lagos, Nigeria / Remote",
  qualification: "B.Sc. Computer Science / Software Engineering",
  skills: [
    "Android", 
    "Kotlin", 
    "Jetpack Compose", 
    "React", 
    "Next.js", 
    "TypeScript", 
    "Tailwind CSS", 
    "Firebase", 
    "Room DB"
  ],
  experienceYears: 5,
  resumeText: "Senior Full-Stack and Android Systems Engineer passionate about modern cloud architectures, scalable web interfaces, and high-performance cross-platform applications with 5+ years building production systems.",
  portfolioUrl: "https://methodstechnology.dev",
  githubUrl: "https://github.com/methodstechnology",
  linkedinUrl: "https://linkedin.com/in/methods-technology"
};

export const SHEMALABS_INITIAL_JOBS: Job[] = [
  {
    id: "job_shemalabs_1",
    title: "Senior Android Developer (Kotlin / Compose)",
    company: "ShemaLabs",
    location: "Remote / San Francisco, CA",
    salaryRange: "$130k - $165k / yr",
    salary: "$130,000 - $165,000 / yr",
    jobType: "REMOTE",
    type: "Remote",
    category: "Software Engineering",
    description: "ShemaLabs is seeking a seasoned Senior Android Developer to lead architecture across our flagship native mobile applications and modern web control dashboards. You will work closely with product leaders to deliver scalable, high-throughput cloud features.",
    requirements: "5+ years of production experience in Android development (Kotlin, Jetpack Compose) and modern React/TypeScript. Deep understanding of Room DB, Firebase Auth, Cloud Firestore, and real-time streams.",
    responsibilities: [
      "Architect and ship modern Android applications using Kotlin, Coroutines, Flow, and Jetpack Compose",
      "Develop responsive web interfaces using React, Next.js, and TypeScript",
      "Collaborate with backend engineers to integrate Firebase and REST/GraphQL microservices",
      "Mentor mid-level engineers and conduct comprehensive architectural code reviews",
      "Maintain 99.9% crash-free sessions and optimize rendering performance"
    ],
    benefits: [
      "100% Remote flexibility with home office stipend ($2,500)",
      "Comprehensive health, dental, and vision insurance",
      "Unlimited PTO and paid parental leave",
      "Annual $3,000 continuous education and conference budget",
      "Equity share package and performance bonuses"
    ],
    postedByUserId: "usr_shemalabs_admin",
    postedBy: "usr_shemalabs_admin",
    postedDate: Date.now() - 3600000 * 2,
    isFeatured: true,
    featured: true,
    urgent: true,
    isRemote: true,
    applicantsCount: 18,
    companyLogo: "SL",
    companyColor: "from-blue-600 to-indigo-700"
  },
  {
    id: "job_shemalabs_2",
    title: "Full Stack Mobile & Cloud Specialist",
    company: "ShemaLabs",
    location: "Austin, TX / Hybrid",
    salaryRange: "$120k - $150k / yr",
    salary: "$120,000 - $150,000 / yr",
    jobType: "FULL_TIME",
    type: "Full-Time",
    category: "Software Engineering",
    description: "ShemaLabs is seeking a versatile Full Stack Mobile & Cloud Specialist to build, test, and deploy resilient microservices and client-side interfaces connecting cross-platform mobile apps with cloud backends.",
    requirements: "4+ years of full stack web and cloud development experience with React, TypeScript, Node.js, and GCP/AWS cloud architectures.",
    responsibilities: [
      "Develop high-performance microservices and serverless cloud functions",
      "Bridge mobile application data layers with real-time Firestore and Cloud databases",
      "Ensure robust security, rate limiting, and authentication workflows",
      "Collaborate with mobile client engineers to optimize query latency and payload sizes"
    ],
    benefits: [
      "Competitive base salary + annual performance bonus",
      "Hybrid flexibility (Austin, TX office / remote)",
      "Top-tier 401(k) matching up to 5%",
      "Wellness stipend and gym membership reimbursement"
    ],
    postedByUserId: "usr_shemalabs_admin",
    postedBy: "usr_shemalabs_admin",
    postedDate: Date.now() - 3600000 * 6,
    isFeatured: true,
    featured: true,
    urgent: false,
    isRemote: false,
    applicantsCount: 24,
    companyLogo: "SL",
    companyColor: "from-purple-600 to-pink-600"
  },
  {
    id: "job_shemalabs_3",
    title: "UI/UX Mobile Product Designer",
    company: "ShemaLabs",
    location: "New York, NY / Remote",
    salaryRange: "$95k - $125k / yr",
    salary: "$95,000 - $125,000 / yr",
    jobType: "REMOTE",
    type: "Remote",
    category: "Design",
    description: "ShemaLabs is looking for an exceptional UI/UX Mobile Product Designer to craft intuitive, world-class mobile and responsive web design systems for next-generation enterprise and consumer recruitment tools.",
    requirements: "3+ years of UX/UI product design experience across both native mobile and web. Mastery of Figma, design systems, auto-layout, interactive variants, and prototyping.",
    responsibilities: [
      "Own the end-to-end design lifecycle from user research, wireframing, to high-fidelity Figma components",
      "Collaborate seamlessly with frontend engineers to ensure pixel-perfect Tailwind CSS execution",
      "Establish and govern our cross-platform design token system for iOS, Android, and Web",
      "Conduct regular user interviews, usability testing sessions, and interactive prototyping"
    ],
    benefits: [
      "Comprehensive medical, dental, and vision coverage",
      "Flexible working hours across US timezones",
      "Annual technology refresh hardware program",
      "401(k) retirement plan with company contribution"
    ],
    postedByUserId: "usr_shemalabs_admin",
    postedBy: "usr_shemalabs_admin",
    postedDate: Date.now() - 3600000 * 18,
    isFeatured: false,
    featured: false,
    urgent: true,
    isRemote: true,
    applicantsCount: 14,
    companyLogo: "SL",
    companyColor: "from-emerald-600 to-teal-700"
  },
  {
    id: "job_shemalabs_4",
    title: "Mobile QA & Automation Engineer",
    company: "ShemaLabs",
    location: "Remote",
    salaryRange: "$90k - $115k / yr",
    salary: "$90,000 - $115,000 / yr",
    jobType: "CONTRACT",
    type: "Contract",
    category: "Quality Assurance",
    description: "Join ShemaLabs to build rigorous automated test suites for our Android and web applications, validating performance, edge connectivity, and regression stability.",
    requirements: "3+ years in mobile QA test automation with Appium or native UI testing frameworks. Solid coding skills in Kotlin, Java, JavaScript, or TypeScript. Familiarity with Firebase Test Lab.",
    responsibilities: [
      "Develop and maintain automated end-to-end test suites using Appium, Espresso, and Cypress",
      "Execute automated device farm testing across diverse screen sizes and OS distributions",
      "Establish automated smoke test gates in our pull-request CI/CD pipelines",
      "Partner with developers to identify edge-case regressions and reproduce field telemetry bugs"
    ],
    benefits: [
      "Long-term stable contract with option to transition to full-time",
      "Flexible schedule with asynchronous sprint retrospectives",
      "Modern testing lab hardware allowance"
    ],
    postedByUserId: "usr_shemalabs_admin",
    postedBy: "usr_shemalabs_admin",
    postedDate: Date.now() - 3600000 * 24,
    isFeatured: false,
    featured: false,
    urgent: false,
    isRemote: true,
    applicantsCount: 9,
    companyLogo: "SL",
    companyColor: "from-amber-600 to-orange-700"
  },
  {
    id: "job_shemalabs_5",
    title: "Junior Software Developer Intern",
    company: "ShemaLabs",
    location: "Seattle, WA / Remote",
    salaryRange: "$40 - $55 / hr",
    salary: "$40 - $55 / hr",
    jobType: "INTERNSHIP",
    type: "Internship",
    category: "Software Engineering",
    description: "ShemaLabs is offering a paid, fast-paced summer software engineering internship. You will work directly with our core engineering team on real production customer features.",
    requirements: "Enrolled in or recent graduate of Computer Science or Software Engineering. Foundational proficiency in JavaScript/TypeScript, HTML/CSS, React, and Git version control.",
    responsibilities: [
      "Implement user-facing components using React, TypeScript, and Tailwind CSS",
      "Write unit tests and documentation for microservice API endpoints",
      "Participate in daily agile stand-ups, sprint planning, and pair programming sessions",
      "Present your final project to senior technology leadership at the end of the term"
    ],
    benefits: [
      "Competitive hourly compensation ($40-$55/hr)",
      "Direct 1-on-1 mentorship from Principal Engineers",
      "High conversion rate to full-time junior positions upon graduation",
      "Free catered lunches and commuter transportation pass"
    ],
    postedByUserId: "usr_shemalabs_admin",
    postedBy: "usr_shemalabs_admin",
    postedDate: Date.now() - 3600000 * 36,
    isFeatured: false,
    featured: false,
    urgent: false,
    isRemote: true,
    applicantsCount: 42,
    companyLogo: "SL",
    companyColor: "from-sky-600 to-cyan-600"
  }
];

export const INITIAL_JOBS: Job[] = SHEMALABS_INITIAL_JOBS;

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: "app-1",
    jobId: "job_shemalabs_1",
    jobTitle: "Senior Android & Full-Stack Developer",
    companyName: "ShemaLabs",
    company: "ShemaLabs",
    location: "Remote / San Francisco, CA",
    salary: "$130,000 - $165,000 / yr",
    type: "Remote",
    applicantUserId: "methods-tech-0616",
    applicantId: "methods-tech-0616",
    applicantName: "Methods Technology",
    applicantEmail: "methodstechnology1@gmail.com",
    applicantPhone: "+234 800 123 4567",
    coverLetter: "I bring 5 years of specialized expertise in Android native (Kotlin, Jetpack Compose, Room DB) and full-stack web systems (React, TypeScript, Firebase). I have successfully architected high-performance mobile-first and web platforms, and I am excited to drive ShemaLabs' product evolution.",
    coverNote: "I bring 5 years of specialized expertise in Android native (Kotlin, Jetpack Compose, Room DB) and full-stack web systems (React, TypeScript, Firebase). I have successfully architected high-performance mobile-first and web platforms, and I am excited to drive ShemaLabs' product evolution.",
    resumeSummary: "Senior Full-Stack and Android Systems Engineer passionate about modern cloud architectures, scalable web interfaces, and high-performance cross-platform applications.",
    appliedDate: Date.now() - 86400000,
    status: "INTERVIEW_SCHEDULED",
    statusNotes: "Technical interview confirmed for Tuesday at 2:00 PM EST with ShemaLabs Engineering Lead."
  },
  {
    id: "app-2",
    jobId: "job_shemalabs_3",
    jobTitle: "Cloud & DevOps Automation Specialist",
    companyName: "ShemaLabs",
    company: "ShemaLabs",
    location: "Remote / Austin, TX",
    salary: "$125,000 - $155,000 / yr",
    type: "Remote",
    applicantUserId: "methods-tech-0616",
    applicantId: "methods-tech-0616",
    applicantName: "Methods Technology",
    applicantEmail: "methodstechnology1@gmail.com",
    applicantPhone: "+234 800 123 4567",
    coverLetter: "Strong background in automated CI/CD pipelines, container orchestration, and serverless Google Cloud deployments alongside modern TypeScript stacks.",
    coverNote: "Strong background in automated CI/CD pipelines, container orchestration, and serverless Google Cloud deployments alongside modern TypeScript stacks.",
    resumeSummary: "Senior Full-Stack and Android Systems Engineer passionate about modern cloud architectures and scalable web interfaces.",
    appliedDate: Date.now() - 86400000 * 2,
    status: "UNDER_REVIEW",
    statusNotes: "Application received and passed preliminary HR screening. Under technical hiring manager review."
  }
];

