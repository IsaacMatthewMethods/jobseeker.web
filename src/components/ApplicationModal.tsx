import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Layers,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { normalizeArray } from '../utils/formatters';

interface ApplicationModalProps {
  job: Job | null;
  onClose: () => void;
  onSuccess: (jobTitle: string) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { submitApplication } = useJobs();
  const userSkills = normalizeArray(user?.skills);

  const [coverNote, setCoverNote] = useState<string>(
    `Dear ${job?.company || 'Hiring'} Team,\n\nI am writing to express my strong interest in the ${job?.title || 'open'} position. With my background in ${userSkills.slice(0, 3).join(', ') || 'modern software engineering'} and ${user?.experienceYears || 3} years of production experience, I am confident in my ability to make an immediate positive impact on your roadmap.\n\nLooking forward to speaking soon!`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!job) return null;

  const handleQuickTemplate = (type: 'senior' | 'fullstack' | 'impact') => {
    if (type === 'senior') {
      setCoverNote(
        `Dear ${job.company} Hiring Team,\n\nWith extensive experience architecting high-performance web and mobile solutions, I am excited about the ${job.title} opportunity. My track record in delivering scalable systems and mentoring engineers directly matches the requirements of this role.\n\nBest regards,\n${user?.name || 'Applicant'}`
      );
    } else if (type === 'fullstack') {
      setCoverNote(
        `Hello ${job.company} Team,\n\nI have been following your growth and would love to contribute to ${job.title}. My hands-on proficiency with ${user?.skills?.slice(0, 4).join(', ') || 'React, TypeScript, Kotlin, and Firebase'} aligns perfectly with your team's tech stack.\n\nSincerely,\n${user?.name || 'Applicant'}`
      );
    } else {
      setCoverNote(
        `Hi there,\n\nI'm passionate about solving complex engineering challenges and would be thrilled to bring my problem-solving skills and dedication to ${job.company} as a ${job.title}.\n\nThank you for your time and consideration,\n${user?.name || 'Applicant'}`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverNote.trim()) {
      setError('Please provide a brief cover note.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ok = await submitApplication(job.id, coverNote);
      if (ok) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onSuccess(job.title);
        onClose();
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            id="close-apply-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Job Application</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Apply to {job.title}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {job.company} • {job.location} • {job.salary}
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Applicant Info Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Verified Candidate Profile</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Auto-filled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{user?.name || 'Methods Technology'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user?.email || 'methodstechnology1@gmail.com'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.phone || '+234 800 123 4567'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user?.location || 'Lagos, Nigeria / Remote'}</span>
              </div>
            </div>

            {/* Skills Badges */}
            {userSkills.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Included Skills Profile:</p>
                <div className="flex flex-wrap gap-1.5">
                  {userSkills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cover Note Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="cover-note-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Cover Note / Introduction</span>
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-[11px] text-slate-400">Quick Fill:</span>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('senior')}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Senior
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate('fullstack')}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Tech Stack
                </button>
              </div>
            </div>

            <textarea
              id="cover-note-input"
              rows={5}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight why you are a great fit for this position..."
              className="w-full p-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
              required
            />
          </div>

          {/* Submission Notice */}
          <p className="text-[11px] text-slate-500 leading-normal">
            By submitting, your verified candidate profile, skills, and contact information will be securely sent directly to the hiring team at <strong>{job.company}</strong>.
          </p>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-job-application-button"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-sky-600 text-white shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application Now</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
