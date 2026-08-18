import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  FileText, 
  Bookmark, 
  User as UserIcon, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Building2,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { Role } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const { savedJobIds, stats } = useJobs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'JS';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Main Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('explore')}>
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-sm">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-white">JobSeeker</span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400">PRO</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <button
                id="nav-explore"
                onClick={() => handleNavClick('explore')}
                className={`py-1 transition-colors cursor-pointer ${
                  currentTab === 'explore'
                    ? 'text-white border-b-2 border-sky-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Explore Jobs
              </button>

              <button
                id="nav-admin"
                onClick={() => handleNavClick('admin')}
                className={`py-1 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  currentTab === 'admin'
                    ? 'text-white border-b-2 border-sky-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Admin Command Center</span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Pulse
                </span>
              </button>

              <button
                id="nav-applications"
                onClick={() => handleNavClick('applications')}
                className={`py-1 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  currentTab === 'applications'
                    ? 'text-white border-b-2 border-sky-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{user?.userType === 'EMPLOYER' || user?.role === 'EMPLOYER' ? 'Applications Hub' : 'My Applications'}</span>
                {stats.totalApplications > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    {stats.totalApplications}
                  </span>
                )}
              </button>

              <button
                id="nav-saved"
                onClick={() => handleNavClick('saved')}
                className={`py-1 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  currentTab === 'saved'
                    ? 'text-white border-b-2 border-sky-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Saved</span>
                {savedJobIds.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300">
                    {savedJobIds.length}
                  </span>
                )}
              </button>

              <button
                id="nav-post-job"
                onClick={() => handleNavClick('post-job')}
                className={`py-1 transition-colors cursor-pointer ${
                  currentTab === 'post-job'
                    ? 'text-white border-b-2 border-sky-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Post Vacancy
              </button>

              <button
                id="nav-profile"
                onClick={() => handleNavClick('profile')}
                className={`py-1 transition-colors cursor-pointer ${
                  currentTab === 'profile'
                    ? 'text-white border-b-2 border-sky-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>

          {/* Right Action & User Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right cursor-pointer" onClick={() => handleNavClick('profile')}>
                  <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {user.userType === 'EMPLOYER' || user.role === 'EMPLOYER' ? (user.companyName ? `${user.companyName} (Employer)` : 'Employer') : 'Job Seeker'}
                  </p>
                </div>

                <div className="relative">
                  <button
                    id="user-profile-menu-button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center border-2 border-slate-700 font-bold text-white text-xs hover:ring-2 hover:ring-sky-400/40 transition-all cursor-pointer"
                  >
                    {getInitials(user.name)}
                  </button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div 
                      id="user-dropdown-menu"
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800"
                    >
                      <div className="px-4 py-3">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <div className="flex items-center space-x-1.5">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          {(user.isAdmin || user.email?.toLowerCase() === 'admin@shemalabs.com') && (
                            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" title="Platform Administrator" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {user.userType === 'EMPLOYER' || user.role === 'EMPLOYER' ? 'Employer Account' : 'Job Seeker Account'}
                          </span>
                          {(user.isAdmin || user.email?.toLowerCase() === 'admin@shemalabs.com') && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              👑 {user.adminRole || 'Administrator'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Role Switcher */}
                      <div className="px-4 py-2 text-xs">
                        <p className="text-slate-400 mb-1.5 font-medium">Active Mode:</p>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-lg">
                          <button
                            onClick={() => switchRole('JOB_SEEKER')}
                            className={`py-1 px-2 rounded text-[11px] font-medium transition-all cursor-pointer ${
                              user.userType === 'JOB_SEEKER' || user.role === 'JOB_SEEKER'
                                ? 'bg-sky-500 text-white shadow-sm font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Job Seeker
                          </button>
                          <button
                            onClick={() => switchRole('EMPLOYER')}
                            className={`py-1 px-2 rounded text-[11px] font-medium transition-all cursor-pointer ${
                              user.userType === 'EMPLOYER' || user.role === 'EMPLOYER'
                                ? 'bg-sky-500 text-white shadow-sm font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Employer
                          </button>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="w-full text-left px-4 py-2 text-xs text-sky-300 hover:bg-slate-800 flex items-center space-x-2 font-bold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          <span>Admin Command Center</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Manage Career Profile</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('applications')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>My Applications</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('saved')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          <span>Bookmarked Jobs ({savedJobIds.length})</span>
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          id="logout-button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center space-x-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  className="px-3.5 py-1.5 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  id="navbar-signin-button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="navbar-signup-button"
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-md shadow-sky-500/20"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && user && (
              <div 
                onClick={() => handleNavClick('profile')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white ring-1 ring-white/20 cursor-pointer"
              >
                {getInitials(user.name)}
              </div>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 shadow-2xl">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('explore')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 ${
                currentTab === 'explore' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explore Jobs</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentTab === 'admin' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Admin Command Center</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-sky-500/20 text-sky-400">
                Pulse
              </span>
            </button>

            <button
              onClick={() => handleNavClick('applications')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentTab === 'applications' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4" />
                <span>My Applications</span>
              </div>
              {stats.totalApplications > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-sky-500/20 text-sky-400">
                  {stats.totalApplications}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('saved')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentTab === 'saved' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bookmark className="w-4 h-4" />
                <span>Saved Jobs</span>
              </div>
              {savedJobIds.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-300">
                  {savedJobIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('post-job')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 ${
                currentTab === 'post-job' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Post a Job Opening</span>
            </button>

            <button
              onClick={() => handleNavClick('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 ${
                currentTab === 'profile' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Career Profile</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => switchRole('JOB_SEEKER')}
                    className={`py-1.5 text-xs rounded-lg font-medium ${
                      user.userType === 'JOB_SEEKER' || user.role === 'JOB_SEEKER' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Job Seeker
                  </button>
                  <button
                    onClick={() => switchRole('EMPLOYER')}
                    className={`py-1.5 text-xs rounded-lg font-medium ${
                      user.userType === 'EMPLOYER' || user.role === 'EMPLOYER' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Employer
                  </button>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-center flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="py-2.5 rounded-lg text-xs font-semibold bg-slate-800 text-white text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="py-2.5 rounded-lg text-xs font-semibold bg-sky-500 text-white text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
