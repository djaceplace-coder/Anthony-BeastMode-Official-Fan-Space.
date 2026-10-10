import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CookieConsent } from './components/common/CookieConsent';

// Pages
import { HomePage } from './pages/HomePage';
import { MusicPage } from './pages/MusicPage';
import { ReleaseDetailPage } from './pages/ReleaseDetailPage';
import { ListenHubPage } from './pages/ListenHubPage';
import { TourPage } from './pages/TourPage';
import { CityPage } from './pages/CityPage';
import { ShowDetailPage } from './pages/ShowDetailPage';
import { TourArchivePage } from './pages/TourArchivePage';
import { AboutPage } from './pages/AboutPage';
import { MediaHubPage } from './pages/MediaHubPage';
import { PressKitPage } from './pages/PressKitPage';
import { MerchPage } from './pages/MerchPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { FanClubOverviewPage } from './pages/FanClubOverviewPage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { AccountPage } from './pages/AccountPage';

// Admin Subviews
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReleasesPage } from './pages/admin/AdminReleasesPage';
import { AdminShowsPage } from './pages/admin/AdminShowsPage';
import { AdminCitiesPage } from './pages/admin/AdminCitiesPage';
import { AdminCopyApprovalPage } from './pages/admin/AdminCopyApprovalPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminInboxPage } from './pages/admin/AdminInboxPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

import { Release, Show, NewsPost } from './types/database';

function AppContent() {
  const { isAdmin, currentUser } = useAuth();
  const { releases, shows, cities, newsPosts } = useDatabase();

  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedNewsPost, setSelectedNewsPost] = useState<NewsPost | null>(null);
  const [adminSubroute, setAdminSubroute] = useState<string>('overview');

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRelease = (release: Release) => {
    setSelectedRelease(release);
    navigate(`/music/${release.slug}`);
  };

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    const city = cities.find((c) => c.id === show.cityId);
    navigate(`/tour/${city?.slug || 'date'}/${show.id}`);
  };

  const handleSelectNewsPost = (post: NewsPost) => {
    setSelectedNewsPost(post);
    navigate(`/news/${post.slug}`);
  };

  // Check for admin routes (Rule 1.8: Non-admins visiting /admin receive generic 404)
  if (currentRoute === '/admin/login') {
    return (
      <AdminLoginPage
        onSuccess={() => {
          navigate('/admin');
        }}
      />
    );
  }

  if (currentRoute.startsWith('/admin')) {
    if (!isAdmin) {
      // Rule 1.8: Non-admins visiting /admin receive a generic 404
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-6xl font-black font-mono text-[var(--accent)]">404</h1>
          <h2 className="text-xl font-bold">Page Not Found</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-sm">
            The requested page does not exist or has been moved to another location.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10]"
          >
            Return to Home Page
          </button>
        </div>
      );
    }

    // Render Admin Console
    return (
      <AdminLayout
        currentSubroute={adminSubroute}
        navigateAdmin={(sub) => setAdminSubroute(sub)}
      >
        {adminSubroute === 'overview' && <AdminDashboard navigateAdmin={setAdminSubroute} />}
        {adminSubroute === 'releases' && <AdminReleasesPage />}
        {adminSubroute === 'tours' && <AdminShowsPage />}
        {adminSubroute === 'cities' && <AdminCitiesPage />}
        {adminSubroute === 'copy' && <AdminCopyApprovalPage />}
        {adminSubroute === 'offers' && <AdminOffersPage />}
        {adminSubroute === 'inbox' && <AdminInboxPage />}
        {adminSubroute === 'audit' && <AdminAuditPage />}
      </AdminLayout>
    );
  }

  // Handle dynamic /music/latest redirect
  if (currentRoute === '/music/latest') {
    const latest = releases[0];
    if (latest) {
      return (
        <ReleaseDetailPage
          release={latest}
          onBack={() => navigate('/music')}
          onSelectRelease={handleSelectRelease}
        />
      );
    }
  }

  // Handle release detail route by slug
  if (currentRoute.startsWith('/music/') && currentRoute !== '/music/listen' && currentRoute !== '/music/latest') {
    const slug = currentRoute.replace('/music/', '');
    const found = releases.find((r) => r.slug === slug) || selectedRelease;
    if (found) {
      return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <Header currentRoute={currentRoute} navigate={navigate} />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <ReleaseDetailPage
              release={found}
              onBack={() => navigate('/music')}
              onSelectRelease={handleSelectRelease}
            />
          </main>
          <Footer navigate={navigate} />
          <CookieConsent />
        </div>
      );
    }
  }

  // Handle show detail route: /tour/[city-slug]/[show-slug]
  if (currentRoute.startsWith('/tour/') && currentRoute.split('/').length === 4) {
    const [, , , showId] = currentRoute.split('/');
    const foundShow = shows.find((s) => s.id === showId) || selectedShow;
    if (foundShow) {
      return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <Header currentRoute={currentRoute} navigate={navigate} />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <ShowDetailPage
              show={foundShow}
              onBack={() => navigate('/tour')}
              navigate={navigate}
            />
          </main>
          <Footer navigate={navigate} />
          <CookieConsent />
        </div>
      );
    }
  }

  // Handle city page route: /tour/[city-slug]
  if (currentRoute.startsWith('/tour/') && currentRoute !== '/tour/archive' && currentRoute.split('/').length === 3) {
    const slug = currentRoute.replace('/tour/', '');
    const foundCity = cities.find((c) => c.slug === slug);
    if (foundCity) {
      return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <Header currentRoute={currentRoute} navigate={navigate} />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <CityPage
              city={foundCity}
              navigate={navigate}
              onSelectShow={handleSelectShow}
            />
          </main>
          <Footer navigate={navigate} />
          <CookieConsent />
        </div>
      );
    }
  }

  // Handle news article route by slug: /news/[slug]
  if (currentRoute.startsWith('/news/') && currentRoute !== '/news') {
    const slug = currentRoute.replace('/news/', '');
    const foundPost = newsPosts.find((p) => p.slug === slug) || selectedNewsPost;
    if (foundPost) {
      return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <Header currentRoute={currentRoute} navigate={navigate} />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <NewsDetailPage
              post={foundPost}
              onBack={() => navigate('/news')}
              onSelectPost={handleSelectNewsPost}
            />
          </main>
          <Footer navigate={navigate} />
          <CookieConsent />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <Header currentRoute={currentRoute} navigate={navigate} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {currentRoute === '/' && (
          <HomePage
            navigate={navigate}
            onSelectRelease={handleSelectRelease}
            onSelectShow={handleSelectShow}
          />
        )}
        {currentRoute === '/music' && (
          <MusicPage
            navigate={navigate}
            onSelectRelease={handleSelectRelease}
          />
        )}
        {currentRoute === '/music/listen' && (
          <ListenHubPage
            navigate={navigate}
            onSelectRelease={handleSelectRelease}
          />
        )}
        {currentRoute === '/tour' && (
          <TourPage
            navigate={navigate}
            onSelectShow={handleSelectShow}
          />
        )}
        {currentRoute === '/tour/archive' && (
          <TourArchivePage
            onBack={() => navigate('/tour')}
            onSelectShow={handleSelectShow}
          />
        )}
        {currentRoute === '/about' && <AboutPage />}
        {currentRoute === '/media' && <MediaHubPage navigate={navigate} />}
        {currentRoute === '/media/photos' && <MediaHubPage navigate={navigate} />}
        {currentRoute === '/media/videos' && <MediaHubPage navigate={navigate} />}
        {currentRoute === '/media/interviews' && <MediaHubPage navigate={navigate} />}
        {currentRoute === '/media/press-kit' && (
          <PressKitPage onBack={() => navigate('/media')} navigate={navigate} />
        )}
        {currentRoute === '/merch' && <MerchPage />}
        {currentRoute === '/news' && (
          <NewsPage onSelectPost={handleSelectNewsPost} />
        )}
        {currentRoute === '/faq' && <FAQPage />}
        {currentRoute === '/contact' && <ContactPage />}
        {currentRoute === '/privacy' && <LegalPage pageType="privacy" onBack={() => navigate('/')} />}
        {currentRoute === '/terms' && <LegalPage pageType="terms" onBack={() => navigate('/')} />}
        {currentRoute === '/cookies' && <LegalPage pageType="cookies" onBack={() => navigate('/')} />}
        {currentRoute === '/accessibility' && <LegalPage pageType="accessibility" onBack={() => navigate('/')} />}
        {currentRoute === '/age-policy' && <LegalPage pageType="age-policy" onBack={() => navigate('/')} />}
        {currentRoute === '/fan-club' && <FanClubOverviewPage navigate={navigate} />}
        {currentRoute === '/signup' && <SignUpPage navigate={navigate} />}
        {currentRoute === '/signin' && <SignInPage navigate={navigate} />}
        {currentRoute === '/account' && <AccountPage navigate={navigate} />}
      </main>

      <Footer navigate={navigate} />
      <CookieConsent />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </AuthProvider>
  );
}
