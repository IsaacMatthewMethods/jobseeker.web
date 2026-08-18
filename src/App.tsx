/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider, useJobs } from './context/JobContext';
import { Navbar } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { ApplicationsTab } from './components/ApplicationsTab';
import { SavedJobsTab } from './components/SavedJobsTab';
import { PostJobTab } from './components/PostJobTab';
import { ProfileView } from './components/ProfileView';
import { AdminPortalTab } from './components/AdminPortalTab';
import { JobDetailsModal } from './components/JobDetailsModal';
import { ApplicationModal } from './components/ApplicationModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Job } from './types';
import { 
  Briefcase, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  ExternalLink,
  Code2,
  Database,
  Layers
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    selectedJobForDetails, 
    selectedJobForApply, 
    openJobDetails, 
    closeJobDetails, 
    openApplyModal, 
    closeApplyModal 
  } = useJobs();

  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleApplyClick = (job: Job) => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    openApplyModal(job);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={openAuth}
      />

      {/* Main View Render based on currentTab */}
      <main className="flex-1">
        {currentTab === 'explore' && (
          <ExploreView
            onSelectJob={openJobDetails}
            onApplyJob={handleApplyClick}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPortalTab
            onPostJobClick={() => setCurrentTab('post-job')}
            showToast={showToast}
            onOpenAuthModal={() => openAuth('login')}
          />
        )}

        {currentTab === 'applications' && (
          <ApplicationsTab
            onExploreClick={() => setCurrentTab('explore')}
            onPostJobClick={() => setCurrentTab('post-job')}
          />
        )}

        {currentTab === 'saved' && (
          <SavedJobsTab
            onSelectJob={openJobDetails}
            onApplyJob={handleApplyClick}
            onExploreClick={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'post-job' && (
          <PostJobTab
            onSuccessNavigate={() => setCurrentTab('explore')}
            showToast={showToast}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            onLogoutSuccess={() => setCurrentTab('explore')}
            showToast={showToast}
            onOpenAuthModal={() => openAuth('login')}
          />
        )}
      </main>

      {/* Clean Minimalism Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-slate-700">JobSeeker Pro</span>
          <span className="text-slate-300">•</span>
          <span>Verified Auth & Firestore Persistence</span>
        </div>

        <div className="flex items-center gap-6 uppercase font-bold tracking-wider text-[10px] text-slate-500">
          <button onClick={() => setCurrentTab('explore')} className="hover:text-sky-600 transition-colors">
            Jobs
          </button>
          {user && (user.isAdmin || user.email?.toLowerCase() === 'admin@shemalabs.com') && (
            <button onClick={() => setCurrentTab('admin')} className="hover:text-sky-600 transition-colors">
              Admin Pulse
            </button>
          )}
          <button onClick={() => setCurrentTab('applications')} className="hover:text-sky-600 transition-colors">
            Applications
          </button>
          <button onClick={() => setCurrentTab('saved')} className="hover:text-sky-600 transition-colors">
            Saved
          </button>
          <button onClick={() => setCurrentTab('post-job')} className="hover:text-sky-600 transition-colors">
            Recruiter
          </button>
          <button onClick={() => setCurrentTab('profile')} className="hover:text-sky-600 transition-colors">
            Profile
          </button>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <JobDetailsModal
        job={selectedJobForDetails}
        onClose={closeJobDetails}
        onApply={(job) => {
          closeJobDetails();
          handleApplyClick(job);
        }}
      />

      <ApplicationModal
        job={selectedJobForApply}
        onClose={closeApplyModal}
        onSuccess={(jobTitle) => {
          showToast(`Application for ${jobTitle} submitted successfully!`);
          setCurrentTab('applications');
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          showToast('Welcome to JobSeeker Pro!');
        }}
      />

      {/* Toast Alert Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* PWA Mobile & Desktop Install Floating Banner */}
      <PWAInstallBanner />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <MainContent />
      </JobProvider>
    </AuthProvider>
  );
}
