import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  ArtistProfile,
  City,
  CopyItem,
  Inquiry,
  NewsPost,
  PartnerOffer,
  Release,
  Show,
  Track,
  Venue,
} from '../types/database';
import {
  SEED_ARTIST_PROFILE,
  SEED_CITIES,
  SEED_COPY_ITEMS,
  SEED_NEWS_POSTS,
  SEED_OFFERS,
  SEED_RELEASES,
  SEED_SHOWS,
  SEED_TRACKS,
  SEED_VENUES,
} from '../data/seed-data';
import { useAuth } from './AuthContext';

interface DatabaseContextType {
  artistProfile: ArtistProfile;
  releases: Release[];
  tracks: Track[];
  cities: City[];
  venues: Venue[];
  shows: Show[];
  offers: PartnerOffer[];
  newsPosts: NewsPost[];
  copyItems: CopyItem[];
  inquiries: Inquiry[];
  loading: boolean;
  addRelease: (release: Omit<Release, 'id'>) => Promise<string>;
  updateRelease: (id: string, updates: Partial<Release>) => Promise<void>;
  addShow: (show: Omit<Show, 'id'>) => Promise<string>;
  updateShow: (id: string, updates: Partial<Show>) => Promise<void>;
  addCity: (city: Omit<City, 'id'>) => Promise<string>;
  updateCity: (id: string, updates: Partial<City>) => Promise<void>;
  addOffer: (offer: Omit<PartnerOffer, 'id'>) => Promise<string>;
  updateOffer: (id: string, updates: Partial<PartnerOffer>) => Promise<void>;
  submitInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: Inquiry['status'], internalNotes?: string) => Promise<void>;
  updateCopyStatus: (id: string, status: CopyItem['status']) => Promise<void>;
  recordTicketClick: (showId: string, cityId: string) => void;
  recordOfferClick: (offerId: string) => void;
  logAuditAction: (action: string, targetCollection: string, targetId: string, details?: Record<string, any>) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, role } = useAuth();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile>(SEED_ARTIST_PROFILE);
  const [releases, setReleases] = useState<Release[]>(SEED_RELEASES);
  const [tracks, setTracks] = useState<Track[]>(SEED_TRACKS);
  const [cities, setCities] = useState<City[]>(SEED_CITIES);
  const [venues, setVenues] = useState<Venue[]>(SEED_VENUES);
  const [shows, setShows] = useState<Show[]>(SEED_SHOWS);
  const [offers, setOffers] = useState<PartnerOffer[]>(SEED_OFFERS);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>(SEED_NEWS_POSTS);
  const [copyItems, setCopyItems] = useState<CopyItem[]>(SEED_COPY_ITEMS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);

  // Firestore listeners for collections with fallback to seed data
  useEffect(() => {
    // Releases listener
    const unsubReleases = onSnapshot(collection(db, 'releases'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Release));
        setReleases(items);
      }
    }, (err) => console.warn('Releases listener:', err.message));

    // Shows listener
    const unsubShows = onSnapshot(collection(db, 'shows'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Show));
        setShows(items);
      }
    }, (err) => console.warn('Shows listener:', err.message));

    // Cities listener
    const unsubCities = onSnapshot(collection(db, 'cities'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as City));
        setCities(items);
      }
    }, (err) => console.warn('Cities listener:', err.message));

    // Offers listener
    const unsubOffers = onSnapshot(collection(db, 'offers'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerOffer));
        setOffers(items);
      }
    }, (err) => console.warn('Offers listener:', err.message));

    // News listener
    const unsubNews = onSnapshot(collection(db, 'news_posts'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsPost));
        setNewsPosts(items);
      }
    }, (err) => console.warn('News listener:', err.message));

    return () => {
      unsubReleases();
      unsubShows();
      unsubCities();
      unsubOffers();
      unsubNews();
    };
  }, []);

  const logAuditAction = async (action: string, targetCollection: string, targetId: string, details?: Record<string, any>) => {
    try {
      await addDoc(collection(db, 'audit_log'), {
        actorUid: currentUser?.uid || 'anonymous',
        actorEmail: currentUser?.email || 'unauthenticated',
        actorRole: role,
        action,
        targetCollection,
        targetId,
        details: details || {},
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Audit log write skipped or offline:', e);
    }
  };

  const addRelease = async (releaseData: Omit<Release, 'id'>) => {
    const docRef = await addDoc(collection(db, 'releases'), {
      ...releaseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const newRelease: Release = { id: docRef.id, ...releaseData };
    setReleases((prev) => [newRelease, ...prev]);
    await logAuditAction('create_release', 'releases', docRef.id, { title: releaseData.title });
    return docRef.id;
  };

  const updateRelease = async (id: string, updates: Partial<Release>) => {
    const ref = doc(db, 'releases', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    await logAuditAction('update_release', 'releases', id, updates);
  };

  const addShow = async (showData: Omit<Show, 'id'>) => {
    const docRef = await addDoc(collection(db, 'shows'), {
      ...showData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const newShow: Show = { id: docRef.id, ...showData };
    setShows((prev) => [...prev, newShow].sort((a, b) => a.date.localeCompare(b.date)));
    await logAuditAction('create_show', 'shows', docRef.id, { date: showData.date, cityId: showData.cityId });
    return docRef.id;
  };

  const updateShow = async (id: string, updates: Partial<Show>) => {
    const ref = doc(db, 'shows', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    setShows((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    await logAuditAction('update_show', 'shows', id, updates);
  };

  const addCity = async (cityData: Omit<City, 'id'>) => {
    const docRef = await addDoc(collection(db, 'cities'), cityData);
    const newCity: City = { id: docRef.id, ...cityData };
    setCities((prev) => [...prev, newCity]);
    await logAuditAction('create_city', 'cities', docRef.id, { name: cityData.name });
    return docRef.id;
  };

  const updateCity = async (id: string, updates: Partial<City>) => {
    const ref = doc(db, 'cities', id);
    await updateDoc(ref, updates);
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    await logAuditAction('update_city', 'cities', id, updates);
  };

  const addOffer = async (offerData: Omit<PartnerOffer, 'id'>) => {
    const docRef = await addDoc(collection(db, 'offers'), {
      ...offerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const newOffer: PartnerOffer = { id: docRef.id, ...offerData };
    setOffers((prev) => [newOffer, ...prev]);
    await logAuditAction('create_offer', 'offers', docRef.id, { partnerName: offerData.partnerName });
    return docRef.id;
  };

  const updateOffer = async (id: string, updates: Partial<PartnerOffer>) => {
    const ref = doc(db, 'offers', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    await logAuditAction('update_offer', 'offers', id, updates);
  };

  const submitInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const fullInquiry: Omit<Inquiry, 'id'> = {
      ...inquiryData,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'inquiries'), fullInquiry);
      setInquiries((prev) => [{ id: docRef.id, ...fullInquiry }, ...prev]);
    } catch {
      // Offline fallback state
      setInquiries((prev) => [{ id: `local-${Date.now()}`, ...fullInquiry }, ...prev]);
    }
  };

  const updateInquiryStatus = async (id: string, status: Inquiry['status'], internalNotes?: string) => {
    const updates: Partial<Inquiry> = { status };
    if (internalNotes) updates.internalNotes = internalNotes;
    try {
      const ref = doc(db, 'inquiries', id);
      await updateDoc(ref, updates);
    } catch {
      // Local state fallback
    }
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    await logAuditAction('update_inquiry', 'inquiries', id, updates);
  };

  const updateCopyStatus = async (id: string, status: CopyItem['status']) => {
    setCopyItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, approvedAt: status === 'approved' ? new Date().toISOString() : undefined } : c))
    );
    await logAuditAction('update_copy_status', 'copy_items', id, { status });
  };

  // Anonymous metrics counter (no PII)
  const recordTicketClick = (showId: string, cityId: string) => {
    try {
      addDoc(collection(db, 'ticket_clicks'), {
        showId,
        cityId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Ignored for privacy & offline resilience
    }
  };

  const recordOfferClick = (offerId: string) => {
    try {
      addDoc(collection(db, 'offer_clicks'), {
        offerId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Ignored for privacy & offline resilience
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        artistProfile,
        releases,
        tracks,
        cities,
        venues,
        shows,
        offers,
        newsPosts,
        copyItems,
        inquiries,
        loading,
        addRelease,
        updateRelease,
        addShow,
        updateShow,
        addCity,
        updateCity,
        addOffer,
        updateOffer,
        submitInquiry,
        updateInquiryStatus,
        updateCopyStatus,
        recordTicketClick,
        recordOfferClick,
        logAuditAction,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
};
