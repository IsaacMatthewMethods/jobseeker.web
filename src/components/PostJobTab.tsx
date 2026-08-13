import React, { useState } from 'react';
import { 
  PlusCircle, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Globe2, 
  ArrowLeft,
  X,
  Plus,
  Send
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobCategory, JobType, Job } from '../types';

interface PostJobTabProps {
  onSuccessNavigate: () => void;
  showToast: (msg: string) => void;
}

export const PostJobTab: React.FC<PostJobTabProps> = ({ onSuccessNavigate, showToast }) => {
  const { user } = useAuth();
  const { postNewJob } = useJobs();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote (Global)');
  const [isRemote, setIsRemote] = useState(true);
  const [type, setType] = useState<JobType>('Full-Time');
  const [category, setCategory] = useState<JobCategory>('Software Engineering');
  const [salary, setSalary] = useState('$120,000 - $150,000 / yr');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [urgent, setUrgent] = useState(false);

  // Dynamic arrays
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design and implement robust, testable software components',
    'Collaborate closely with product managers, UX designers, and peer engineers'
  ]);

  const [requirementInput, setRequirementInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    '3+ years of professional software development experience',
    'Strong knowledge of modern frameworks and API architectures'
  ]);

  const [benefitInput, setBenefitInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([
    '100% Remote flexibility & modern equipment allowance',
    'Comprehensive health coverage & 401(k) retirement plan'
  ]);

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setResponsibilities([...responsibilities, responsibilityInput.trim()]);
      setResponsibilityInput('');
    }
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setBenefits([...benefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      alert('Please fill out the required Title, Company, and Description fields.');
      return;
    }

    const companyColors = [
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-purple-600 to-pink-600',
      'from-amber-600 to-orange-700',
      'from-sky-600 to-cyan-600'
    ];
    const randomColor = companyColors[Math.floor(Math.random() * companyColors.length)];

    const created = postNewJob({
      title: title.trim(),
      company: company.trim(),
      companyLogo: company.slice(0, 2).toUpperCase(),
      companyColor: randomColor,
      location: location.trim() || (isRemote ? 'Remote' : 'On-Site'),
      isRemote,
      type,
      category,
      salary: salary.trim() || 'Competitive',
      featured,
      urgent,
      description: description.trim(),
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Collaborate with engineering team to ship customer-facing features'],
      requirements: requirements.length > 0 ? requirements : ['Strong experience in software engineering and modern architectures'],
      benefits: benefits.length > 0 ? benefits : ['Flexible hours, full health coverage, and remote setup allowance'],
      postedBy: user?.uid || 'recruiter-custom'
    });

    showToast(`Job listing "${created.title}" published successfully!`);
    onSuccessNavigate();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
          <PlusCircle className="w-4 h-4" />
          <span>Employer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a New Career Opening
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Reach thousands of verified software engineers, mobile developers, and product designers instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Role Overview & Company
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-title-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Title *
              </label>
              <input
                id="job-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Android & Full-Stack Developer"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label htmlFor="company-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company / Organization Name *
              </label>
              <input
                id="company-name-input"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Methods Technology Ltd"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label htmlFor="location-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location & Workplace
              </label>
              <input
                id="location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / New York, NY"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label htmlFor="salary-range-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Salary Range
              </label>
              <input
                id="salary-range-input"
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $130k - $160k/yr or $60/hr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Product & Data">Product & Data</option>
              </select>
            </div>

            <div>
              <label htmlFor="job-type-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employment Type
              </label>
              <select
                id="job-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as JobType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Remote & Featured checkboxes */}
          <div className="pt-3 flex flex-wrap gap-4 border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
              />
              <span>100% Remote Opportunity</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
              />
              <span>Highlight as Featured Opportunity</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
              />
              <span>Mark as Urgent Hiring</span>
            </label>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Detailed Job Description
          </h2>

          <div>
            <label htmlFor="description-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Summary & Mission *
            </label>
            <textarea
              id="description-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, project goals, and what makes this position exciting..."
              required
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
            />
          </div>

          {/* Responsibilities list editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Key Responsibilities
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={responsibilityInput}
                onChange={(e) => setResponsibilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addResponsibility();
                  }
                }}
                placeholder="Add a key responsibility and press enter"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={addResponsibility}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {responsibilities.map((resp, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span>• {resp}</span>
                  <button type="button" onClick={() => removeResponsibility(i)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements list editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Candidate Requirements
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                placeholder="e.g. 5+ years with Kotlin and Jetpack Compose"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span>✓ {req}</span>
                  <button type="button" onClick={() => removeRequirement(i)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits list editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Perks & Benefits
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBenefit();
                  }
                }}
                placeholder="e.g. Annual $3,000 learning budget"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {benefits.map((ben, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span>★ {ben}</span>
                  <button type="button" onClick={() => removeBenefit(i)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onSuccessNavigate}
            className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            id="publish-job-button"
            className="px-8 py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-sky-600 text-white shadow-lg shadow-slate-900/20 transition-all flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Publish Job Listing Now</span>
          </button>
        </div>

      </form>
    </div>
  );
};
