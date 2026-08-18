import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  LogOut, 
  ShieldCheck, 
  Globe2, 
  Sparkles, 
  Download,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { normalizeArray } from '../utils/formatters';

interface ProfileViewProps {
  onLogoutSuccess: () => void;
  showToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogoutSuccess, showToast }) => {
  const { user, updateUserProfile, switchRole, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 5);
  const [resumeText, setResumeText] = useState(user?.resumeText || '');
  const [skills, setSkills] = useState<string[]>(normalizeArray(user?.skills));
  const [newSkillInput, setNewSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Session</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Sign in or tap the demo user button to view and manage your profile.</p>
      </div>
    );
  }

  const getInitials = (n: string) => {
    return (n || 'User')
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || user.name,
      phone: phone.trim(),
      location: location.trim(),
      qualification: qualification.trim(),
      experienceYears: Number(experienceYears),
      resumeText: resumeText.trim(),
      skills: skills,
      portfolioUrl: portfolioUrl.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim()
    });
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  const handleLogout = async () => {
    await logout();
    showToast('Session ended successfully.');
    onLogoutSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Profile Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl ring-4 ring-white/10">
              {getInitials(user.name)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </span>
                {(user.isAdmin || user.email?.toLowerCase() === 'admin@shemalabs.com') && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                    <Crown className="w-3 h-3 mr-1 text-amber-400 fill-amber-400" />
                    {user.adminRole || 'Administrator'}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-slate-300 mt-0.5">{user.email}</p>
              
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                  {user.location || 'Lagos, Nigeria / Remote'}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
                  {user.experienceYears || 5} Yrs Experience
                </span>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-3 self-start sm:self-center">
            {!isEditing ? (
              <button
                id="edit-profile-button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              id="profile-logout-button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Role Toggle Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Current Account Role:</span>
            <span className="font-bold text-sky-400">
              {user.userType === 'EMPLOYER' || user.role === 'EMPLOYER' ? 'Employer / Recruiter (EMPLOYER)' : 'Job Seeker / Candidate (JOB_SEEKER)'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                switchRole('JOB_SEEKER');
                showToast('Switched to Job Seeker Mode');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                user.userType === 'JOB_SEEKER' || user.role === 'JOB_SEEKER'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Job Seeker
            </button>
            <button
              onClick={() => {
                switchRole('EMPLOYER');
                showToast('Switched to Employer Mode');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                user.userType === 'EMPLOYER' || user.role === 'EMPLOYER'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Employer
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Details / Form */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Edit Career & Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location & Residence
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Qualification
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Portfolio / Website URL
                </label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Skills manager */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-xs mb-1.5">
                Skills & Tech Stack Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill (e.g. Jetpack Compose) and click Add"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="ml-2 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Summary */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-xs mb-1.5">
                Resume Summary & Bio
              </label>
              <textarea
                rows={4}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-profile-button"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Card 1: Core details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Professional Summary</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                {user.resumeText || "No summary provided yet."}
              </p>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <GraduationCap className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Academic Qualification</p>
                  <p className="text-xs font-bold text-slate-800">{user.qualification || 'B.Sc. Computer Science'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Direct Phone Contact</p>
                  <p className="text-xs font-bold text-slate-800">{user.phone || '+234 800 123 4567'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Verified Email</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Briefcase className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Total Career Experience</p>
                  <p className="text-xs font-bold text-slate-800">{user.experienceYears || 5} Years in Tech</p>
                </div>
              </div>
            </div>

            {/* Skills Badges */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Specialized Technical Skills ({normalizeArray(user.skills).length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {normalizeArray(user.skills).length > 0 ? (
                  normalizeArray(user.skills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
