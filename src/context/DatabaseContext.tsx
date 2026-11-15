import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  ArtistProfile,
  AuditLogEntry,
  ChatDocumentAttachment,
  ChatMediaAttachment,
  City,
  Conversation,
  CopyItem,
  Inquiry,
  Member,
  MerchItem,
  NewsPost,
  NotificationItem,
  PartnerOffer,
  Release,
  Show,
  SiteSettings,
  Track,
  Venue,
} from '../types/database';
import {
  SEED_ARTIST_PROFILE,
  SEED_CITIES,
  SEED_COPY_ITEMS,
  SEED_MEMBERS,
  SEED_MERCH_ITEMS,
  SEED_NEWS_POSTS,
  SEED_OFFERS,
  SEED_RELEASES,
  SEED_SHOWS,
  SEED_SITE_SETTINGS,
  SEED_TRACKS,
  SEED_VENUES,
} from '../data/seed-data';
import { useAuth } from './AuthContext';

export interface AdminChatSendOptions {
  senderName?: string;
  documentAttachment?: ChatDocumentAttachment;
  mediaAttachment?: ChatMediaAttachment;
}

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
  merchItems: MerchItem[];
  siteSettings: SiteSettings;
  members: Member[];
  inquiries: Inquiry[];
  conversations: Conversation[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  loading: boolean;
  isLiveConnected: boolean;
  syncSeedDataToFirestore: () => Promise<void>;
  // Artist Profile & Settings
  updateArtistProfile: (updates: Partial<ArtistProfile>) => Promise<void>;
  updateSiteSettings: (updates: Partial<SiteSettings>) => Promise<void>;
  // Member / User Management (Real-Time)
  createMemberFromAdmin: (memberData: Omit<Member, 'uid' | 'createdAt'> & { password?: string }) => Promise<string>;
  updateMemberFromAdmin: (uid: string, updates: Partial<Member>) => Promise<void>;
  deleteMemberFromAdmin: (uid: string) => Promise<void>;
  // Releases & Tracks
  addRelease: (release: Omit<Release, 'id'>) => Promise<string>;
  updateRelease: (id: string, updates: Partial<Release>) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;
  addTrack: (track: Omit<Track, 'id'>) => Promise<string>;
  updateTrack: (id: string, updates: Partial<Track>) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  // Shows & Venues
  addShow: (show: Omit<Show, 'id'>) => Promise<string>;
  updateShow: (id: string, updates: Partial<Show>) => Promise<void>;
  deleteShow: (id: string) => Promise<void>;
  addVenue: (venue: Omit<Venue, 'id'>) => Promise<string>;
  updateVenue: (id: string, updates: Partial<Venue>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  // Cities
  addCity: (city: Omit<City, 'id'>) => Promise<string>;
  updateCity: (id: string, updates: Partial<City>) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
  // Partner Offers
  addOffer: (offer: Omit<PartnerOffer, 'id'>) => Promise<string>;
  updateOffer: (id: string, updates: Partial<PartnerOffer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  // Merch
  addMerchItem: (item: Omit<MerchItem, 'id'>) => Promise<string>;
  updateMerchItem: (id: string, updates: Partial<MerchItem>) => Promise<void>;
  deleteMerchItem: (id: string) => Promise<void>;
  // News Posts
  addNewsPost: (post: Omit<NewsPost, 'id'>) => Promise<string>;
  updateNewsPost: (id: string, updates: Partial<NewsPost>) => Promise<void>;
  deleteNewsPost: (id: string) => Promise<void>;
  // Copy Governance
  addCopyItem: (item: Omit<CopyItem, 'id'>) => Promise<string>;
  updateCopyItem: (id: string, updates: Partial<CopyItem>) => Promise<void>;
  updateCopyStatus: (id: string, status: CopyItem['status']) => Promise<void>;
  // Inquiries & Live Chat
  submitInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: Inquiry['status'], internalNotes?: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  sendAdminChatMessage: (convId: string, body: string, options?: AdminChatSendOptions) => Promise<void>;
  promptMemberChatFromAdmin: (
    member: Member,
    initialMessage: string,
    subject?: string,
    options?: AdminChatSendOptions
  ) => Promise<string>;
  updateConversationStatus: (convId: string, status: Conversation['status']) => Promise<void>;
  // Notifications
  sendNotificationToMember: (uid: string, title: string, body: string, type?: NotificationItem['type'], link?: string) => Promise<void>;
  broadcastNotification: (
    title: string,
    body: string,
    targetFilter?: { cityId?: string; segment?: string },
    type?: NotificationItem['type']
  ) => Promise<number>;
  markNotificationRead: (id: string) => Promise<void>;
  // Analytics & Audit
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
  const [merchItems, setMerchItems] = useState<MerchItem[]>(SEED_MERCH_ITEMS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(SEED_SITE_SETTINGS);
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const hasBootstrappedRef = useRef(false);

  const syncSeedDataToFirestore = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'artist_profile', 'main'), SEED_ARTIST_PROFILE, { merge: true });
      await setDoc(doc(db, 'site_settings', 'global'), SEED_SITE_SETTINGS, { merge: true });

      for (const rel of SEED_RELEASES) {
        await setDoc(doc(db, 'releases', rel.id), rel, { merge: true });
      }
      for (const trk of SEED_TRACKS) {
        await setDoc(doc(db, 'tracks', trk.id), trk, { merge: true });
      }
      for (const city of SEED_CITIES) {
        await setDoc(doc(db, 'cities', city.id), city, { merge: true });
      }
      for (const venue of SEED_VENUES) {
        await setDoc(doc(db, 'venues', venue.id), venue, { merge: true });
      }
      for (const show of SEED_SHOWS) {
        await setDoc(doc(db, 'shows', show.id), show, { merge: true });
      }
      for (const offer of SEED_OFFERS) {
        await setDoc(doc(db, 'offers', offer.id), offer, { merge: true });
      }
      for (const post of SEED_NEWS_POSTS) {
        await setDoc(doc(db, 'news_posts', post.id), post, { merge: true });
      }
      for (const copy of SEED_COPY_ITEMS) {
        await setDoc(doc(db, 'copy_items', copy.id), copy, { merge: true });
      }
      for (const merch of SEED_MERCH_ITEMS) {
        await setDoc(doc(db, 'merch_items', merch.id), merch, { merge: true });
      }
      for (const member of SEED_MEMBERS) {
        await setDoc(doc(db, 'members', member.uid), member, { merge: true });
      }
    } catch (e) {
      console.warn('Seed sync warning:', e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Firestore listeners across all collections
  useEffect(() => {
    const unsubProfile = onSnapshot(
      doc(db, 'artist_profile', 'main'),
      (snap) => {
        setIsLiveConnected(true);
        if (snap.exists()) {
          setArtistProfile({ id: snap.id, ...snap.data() } as ArtistProfile);
        } else if (!hasBootstrappedRef.current) {
          hasBootstrappedRef.current = true;
          syncSeedDataToFirestore();
        }
      },
      (err) => console.warn('ArtistProfile listener:', err.message)
    );

    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          setSiteSettings({ id: snap.id, ...snap.data() } as SiteSettings);
        }
      },
      (err) => console.warn('Settings listener:', err.message)
    );

    const unsubReleases = onSnapshot(
      collection(db, 'releases'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Release));
          setReleases(items.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)));
        }
      },
      (err) => console.warn('Releases listener:', err.message)
    );

    const unsubTracks = onSnapshot(
      collection(db, 'tracks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
          setTracks(items.sort((a, b) => a.trackNumber - b.trackNumber));
        }
      },
      (err) => console.warn('Tracks listener:', err.message)
    );

    const unsubShows = onSnapshot(
      collection(db, 'shows'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Show));
          setShows(items.sort((a, b) => a.date.localeCompare(b.date)));
        }
      },
      (err) => console.warn('Shows listener:', err.message)
    );

    const unsubCities = onSnapshot(
      collection(db, 'cities'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as City));
          setCities(items.sort((a, b) => a.priorityTier - b.priorityTier));
        }
      },
      (err) => console.warn('Cities listener:', err.message)
    );

    const unsubVenues = onSnapshot(
      collection(db, 'venues'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
          setVenues(items);
        }
      },
      (err) => console.warn('Venues listener:', err.message)
    );

    const unsubOffers = onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerOffer));
          setOffers(items);
        }
      },
      (err) => console.warn('Offers listener:', err.message)
    );

    const unsubNews = onSnapshot(
      collection(db, 'news_posts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsPost));
          setNewsPosts(items.sort((a, b) => (b.publishAt || '').localeCompare(a.publishAt || '')));
        }
      },
      (err) => console.warn('News listener:', err.message)
    );

    const unsubCopy = onSnapshot(
      collection(db, 'copy_items'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CopyItem));
          setCopyItems(items);
        }
      },
      (err) => console.warn('CopyItems listener:', err.message)
    );

    const unsubMerch = onSnapshot(
      collection(db, 'merch_items'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MerchItem));
          setMerchItems(items.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)));
        }
      },
      (err) => console.warn('MerchItems listener:', err.message)
    );

    // Real-time listener for ALL Member Accounts created anywhere in the world
    const unsubMembers = onSnapshot(
      collection(db, 'members'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as Member));
          setMembers(
            items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
          );
        }
      },
      (err) => console.warn('Members listener:', err.message)
    );

    // Real-time listener for Inquiries
    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
        setInquiries(items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      },
      (err) => console.warn('Inquiries listener:', err.message)
    );

    // Real-time listener for Member Support Conversations
    const unsubConversations = onSnapshot(
      collection(db, 'conversations'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
        setConversations(
          items.sort((a, b) => (b.lastMessageAt || b.createdAt || '').localeCompare(a.lastMessageAt || a.createdAt || ''))
        );
      },
      (err) => console.warn('Conversations listener:', err.message)
    );

    // Real-time listener for Audit Logs
    const unsubAudit = onSnapshot(
      collection(db, 'audit_log'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogEntry));
        setAuditLogs(items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')));
      },
      (err) => console.warn('Audit listener:', err.message)
    );

    // Real-time listener for Notifications
    const unsubNotifications = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
        setNotifications(items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      },
      (err) => console.warn('Notifications listener:', err.message)
    );

    return () => {
      unsubProfile();
      unsubSettings();
      unsubReleases();
      unsubTracks();
      unsubShows();
      unsubCities();
      unsubVenues();
      unsubOffers();
      unsubNews();
      unsubCopy();
      unsubMerch();
      unsubMembers();
      unsubInquiries();
      unsubConversations();
      unsubAudit();
      unsubNotifications();
    };
  }, []);

  const logAuditAction = async (
    action: string,
    targetCollection: string,
    targetId: string,
    details?: Record<string, any>
  ) => {
    try {
      await addDoc(collection(db, 'audit_log'), {
        actorUid: currentUser?.uid || 'admin',
        actorEmail: currentUser?.email || 'admin@anthonybeastmode.com',
        actorRole: role || 'super_admin',
        action,
        targetCollection,
        targetId,
        details: details || {},
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Audit log write skipped:', e);
    }
  };

  // Artist Profile & Site Settings
  const updateArtistProfile = async (updates: Partial<ArtistProfile>) => {
    await setDoc(
      doc(db, 'artist_profile', 'main'),
      { ...artistProfile, ...updates, approvedAt: new Date().toISOString() },
      { merge: true }
    );
    await logAuditAction('update_artist_profile', 'artist_profile', 'main', updates);
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    await setDoc(
      doc(db, 'site_settings', 'global'),
      { ...siteSettings, ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await logAuditAction('update_site_settings', 'site_settings', 'global', updates);
  };

  // Real-time Member / Account CRUD from Admin
  const createMemberFromAdmin = async (
    memberData: Omit<Member, 'uid' | 'createdAt'> & { password?: string }
  ) => {
    const uid = `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newMember: Member & { password?: string } = {
      ...memberData,
      uid,
      email: (memberData.email || '').trim().toLowerCase(),
      displayName: memberData.displayName.trim(),
      createdByAdmin: true,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'members', uid), newMember);
    await logAuditAction('admin_create_member', 'members', uid, {
      email: newMember.email,
      displayName: newMember.displayName,
      role: newMember.role,
    });
    return uid;
  };

  const updateMemberFromAdmin = async (uid: string, updates: Partial<Member>) => {
    await setDoc(doc(db, 'members', uid), updates, { merge: true });
    await logAuditAction('admin_update_member', 'members', uid, updates);
  };

  const deleteMemberFromAdmin = async (uid: string) => {
    await deleteDoc(doc(db, 'members', uid));
    await logAuditAction('admin_delete_member', 'members', uid, {});
  };

  // Releases & Tracks CRUD
  const addRelease = async (releaseData: Omit<Release, 'id'>) => {
    const docRef = await addDoc(collection(db, 'releases'), {
      ...releaseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('create_release', 'releases', docRef.id, { title: releaseData.title });
    return docRef.id;
  };

  const updateRelease = async (id: string, updates: Partial<Release>) => {
    await setDoc(
      doc(db, 'releases', id),
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await logAuditAction('update_release', 'releases', id, updates);
  };

  const deleteRelease = async (id: string) => {
    await deleteDoc(doc(db, 'releases', id));
    await logAuditAction('delete_release', 'releases', id, {});
  };

  const addTrack = async (trackData: Omit<Track, 'id'>) => {
    const docRef = await addDoc(collection(db, 'tracks'), {
      ...trackData,
      createdAt: new Date().toISOString(),
    });
    await logAuditAction('create_track', 'tracks', docRef.id, { title: trackData.title });
    return docRef.id;
  };

  const updateTrack = async (id: string, updates: Partial<Track>) => {
    await setDoc(doc(db, 'tracks', id), updates, { merge: true });
    await logAuditAction('update_track', 'tracks', id, updates);
  };

  const deleteTrack = async (id: string) => {
    await deleteDoc(doc(db, 'tracks', id));
    await logAuditAction('delete_track', 'tracks', id, {});
  };

  // Shows & Venues CRUD
  const addShow = async (showData: Omit<Show, 'id'>) => {
    const docRef = await addDoc(collection(db, 'shows'), {
      ...showData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('create_show', 'shows', docRef.id, {
      date: showData.date,
      cityId: showData.cityId,
    });
    return docRef.id;
  };

  const updateShow = async (id: string, updates: Partial<Show>) => {
    await setDoc(
      doc(db, 'shows', id),
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await logAuditAction('update_show', 'shows', id, updates);
  };

  const deleteShow = async (id: string) => {
    await deleteDoc(doc(db, 'shows', id));
    await logAuditAction('delete_show', 'shows', id, {});
  };

  const addVenue = async (venueData: Omit<Venue, 'id'>) => {
    const docRef = await addDoc(collection(db, 'venues'), venueData);
    await logAuditAction('create_venue', 'venues', docRef.id, { name: venueData.name });
    return docRef.id;
  };

  const updateVenue = async (id: string, updates: Partial<Venue>) => {
    await setDoc(doc(db, 'venues', id), updates, { merge: true });
    await logAuditAction('update_venue', 'venues', id, updates);
  };

  const deleteVenue = async (id: string) => {
    await deleteDoc(doc(db, 'venues', id));
    await logAuditAction('delete_venue', 'venues', id, {});
  };

  // Cities CRUD
  const addCity = async (cityData: Omit<City, 'id'>) => {
    const docRef = await addDoc(collection(db, 'cities'), cityData);
    await logAuditAction('create_city', 'cities', docRef.id, { name: cityData.name });
    return docRef.id;
  };

  const updateCity = async (id: string, updates: Partial<City>) => {
    await setDoc(doc(db, 'cities', id), updates, { merge: true });
    await logAuditAction('update_city', 'cities', id, updates);
  };

  const deleteCity = async (id: string) => {
    await deleteDoc(doc(db, 'cities', id));
    await logAuditAction('delete_city', 'cities', id, {});
  };

  // Offers CRUD
  const addOffer = async (offerData: Omit<PartnerOffer, 'id'>) => {
    const docRef = await addDoc(collection(db, 'offers'), {
      ...offerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('create_offer', 'offers', docRef.id, {
      partnerName: offerData.partnerName,
    });
    return docRef.id;
  };

  const updateOffer = async (id: string, updates: Partial<PartnerOffer>) => {
    await setDoc(
      doc(db, 'offers', id),
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await logAuditAction('update_offer', 'offers', id, updates);
  };

  const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, 'offers', id));
    await logAuditAction('delete_offer', 'offers', id, {});
  };

  // Merch CRUD
  const addMerchItem = async (itemData: Omit<MerchItem, 'id'>) => {
    const docRef = await addDoc(collection(db, 'merch_items'), {
      ...itemData,
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('create_merch_item', 'merch_items', docRef.id, { title: itemData.title });
    return docRef.id;
  };

  const updateMerchItem = async (id: string, updates: Partial<MerchItem>) => {
    await setDoc(
      doc(db, 'merch_items', id),
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await logAuditAction('update_merch_item', 'merch_items', id, updates);
  };

  const deleteMerchItem = async (id: string) => {
    await deleteDoc(doc(db, 'merch_items', id));
    await logAuditAction('delete_merch_item', 'merch_items', id, {});
  };

  // News CRUD
  const addNewsPost = async (postData: Omit<NewsPost, 'id'>) => {
    const docRef = await addDoc(collection(db, 'news_posts'), {
      ...postData,
      createdAt: new Date().toISOString(),
    });
    await logAuditAction('create_news_post', 'news_posts', docRef.id, { title: postData.title });
    return docRef.id;
  };

  const updateNewsPost = async (id: string, updates: Partial<NewsPost>) => {
    await setDoc(doc(db, 'news_posts', id), updates, { merge: true });
    await logAuditAction('update_news_post', 'news_posts', id, updates);
  };

  const deleteNewsPost = async (id: string) => {
    await deleteDoc(doc(db, 'news_posts', id));
    await logAuditAction('delete_news_post', 'news_posts', id, {});
  };

  // Copy Governance CRUD
  const addCopyItem = async (itemData: Omit<CopyItem, 'id'>) => {
    const docRef = await addDoc(collection(db, 'copy_items'), itemData);
    await logAuditAction('create_copy_item', 'copy_items', docRef.id, { key: itemData.key });
    return docRef.id;
  };

  const updateCopyItem = async (id: string, updates: Partial<CopyItem>) => {
    await setDoc(doc(db, 'copy_items', id), updates, { merge: true });
    await logAuditAction('update_copy_item', 'copy_items', id, updates);
  };

  const updateCopyStatus = async (id: string, status: CopyItem['status']) => {
    const approvedAt = status === 'approved' ? new Date().toISOString() : undefined;
    await setDoc(doc(db, 'copy_items', id), { status, approvedAt }, { merge: true });
    await logAuditAction('update_copy_status', 'copy_items', id, { status });
  };

  // Inquiries & Live Chat
  const submitInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const fullInquiry: Omit<Inquiry, 'id'> = {
      ...inquiryData,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'inquiries'), fullInquiry);
  };

  const updateInquiryStatus = async (
    id: string,
    status: Inquiry['status'],
    internalNotes?: string
  ) => {
    const updates: Partial<Inquiry> = { status };
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    await setDoc(doc(db, 'inquiries', id), updates, { merge: true });
    await logAuditAction('update_inquiry', 'inquiries', id, updates);
  };

  const deleteInquiry = async (id: string) => {
    await deleteDoc(doc(db, 'inquiries', id));
    await logAuditAction('delete_inquiry', 'inquiries', id, {});
  };

  const sendAdminChatMessage = async (
    convId: string,
    body: string,
    options?: AdminChatSendOptions
  ) => {
    const payload: Record<string, any> = {
      senderUid: currentUser?.uid || 'admin',
      senderRole: 'team',
      senderName: options?.senderName || 'Official Management Team',
      body,
      createdAt: new Date().toISOString(),
    };
    if (options?.documentAttachment) {
      payload.documentAttachment = options.documentAttachment;
    }
    if (options?.mediaAttachment) {
      payload.mediaAttachment = options.mediaAttachment;
    }

    await addDoc(collection(db, 'conversations', convId, 'messages'), payload);
    await setDoc(
      doc(db, 'conversations', convId),
      {
        lastMessage: options?.documentAttachment
          ? `[Official ${options.documentAttachment.title}] ${body}`
          : options?.mediaAttachment
          ? `[Media Attachment] ${body}`
          : body,
        lastMessageAt: new Date().toISOString(),
        status: 'waiting',
      },
      { merge: true }
    );
    await logAuditAction('send_admin_chat_reply', 'conversations', convId, {
      preview: body.slice(0, 60),
      hasDocument: Boolean(options?.documentAttachment),
      hasMedia: Boolean(options?.mediaAttachment),
    });
  };

  const promptMemberChatFromAdmin = async (
    member: Member,
    initialMessage: string,
    subject = 'Official Management Support & Order Verification',
    options?: AdminChatSendOptions
  ): Promise<string> => {
    // Check if an active conversation already exists for this member
    const existing = conversations.find((c) => c.memberUid === member.uid);
    let convId = existing?.id;

    if (!convId) {
      const newConvRef = await addDoc(collection(db, 'conversations'), {
        memberUid: member.uid,
        memberName: member.displayName,
        memberEmail: member.email || '',
        subject,
        status: 'open',
        initiatedByAdmin: true,
        requestedByMember: false,
        cityId: member.cityId || null,
        segmentSnapshot: member.segments || [],
        lastMessage: initialMessage,
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      convId = newConvRef.id;
    } else {
      await setDoc(
        doc(db, 'conversations', convId),
        {
          subject,
          status: 'open',
          lastMessage: initialMessage,
          lastMessageAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await sendAdminChatMessage(convId, initialMessage, options);

    // Also notify the member in their account alerts
    await sendNotificationToMember(
      member.uid,
      options?.documentAttachment
        ? `Official Document Issued: ${options.documentAttachment.title}`
        : `New Message from Official Management`,
      initialMessage.slice(0, 140),
      'message_reply',
      '/account'
    );

    return convId;
  };

  const updateConversationStatus = async (convId: string, status: Conversation['status']) => {
    await setDoc(doc(db, 'conversations', convId), { status }, { merge: true });
    await logAuditAction('update_conversation_status', 'conversations', convId, { status });
  };

  // Notifications
  const sendNotificationToMember = async (
    uid: string,
    title: string,
    body: string,
    type: NotificationItem['type'] = 'news',
    link?: string
  ) => {
    await addDoc(collection(db, 'notifications'), {
      uid,
      type,
      title,
      body,
      link: link || '/account',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
    });
    await logAuditAction('send_notification', 'notifications', uid, { title, type });
  };

  const broadcastNotification = async (
    title: string,
    body: string,
    targetFilter?: { cityId?: string; segment?: string },
    type: NotificationItem['type'] = 'news'
  ): Promise<number> => {
    const activeTargets = members.filter((m) => {
      if (m.status !== 'active') return false;
      if (targetFilter?.cityId && targetFilter.cityId !== 'all' && m.cityId !== targetFilter.cityId) {
        return false;
      }
      if (
        targetFilter?.segment &&
        targetFilter.segment !== 'all' &&
        !(m.segments || []).includes(targetFilter.segment)
      ) {
        return false;
      }
      return true;
    });

    for (const target of activeTargets) {
      await addDoc(collection(db, 'notifications'), {
        uid: target.uid,
        type,
        title,
        body,
        link: '/account',
        channel: 'in_app',
        createdAt: new Date().toISOString(),
      });
    }

    await logAuditAction('broadcast_notification', 'notifications', 'broadcast', {
      title,
      recipientCount: activeTargets.length,
      filter: targetFilter || 'all_active',
    });

    return activeTargets.length;
  };

  const markNotificationRead = async (id: string) => {
    await setDoc(
      doc(db, 'notifications', id),
      { readAt: new Date().toISOString() },
      { merge: true }
    );
  };

  // Anonymous metrics counters
  const recordTicketClick = (showId: string, cityId: string) => {
    try {
      addDoc(collection(db, 'ticket_clicks'), {
        showId,
        cityId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Ignore
    }
  };

  const recordOfferClick = (offerId: string) => {
    try {
      addDoc(collection(db, 'offer_clicks'), {
        offerId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Ignore
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
        merchItems,
        siteSettings,
        members,
        inquiries,
        conversations,
        auditLogs,
        notifications,
        loading,
        isLiveConnected,
        syncSeedDataToFirestore,
        updateArtistProfile,
        updateSiteSettings,
        createMemberFromAdmin,
        updateMemberFromAdmin,
        deleteMemberFromAdmin,
        addRelease,
        updateRelease,
        deleteRelease,
        addTrack,
        updateTrack,
        deleteTrack,
        addShow,
        updateShow,
        deleteShow,
        addVenue,
        updateVenue,
        deleteVenue,
        addCity,
        updateCity,
        deleteCity,
        addOffer,
        updateOffer,
        deleteOffer,
        addMerchItem,
        updateMerchItem,
        deleteMerchItem,
        addNewsPost,
        updateNewsPost,
        deleteNewsPost,
        addCopyItem,
        updateCopyItem,
        updateCopyStatus,
        submitInquiry,
        updateInquiryStatus,
        deleteInquiry,
        sendAdminChatMessage,
        promptMemberChatFromAdmin,
        updateConversationStatus,
        sendNotificationToMember,
        broadcastNotification,
        markNotificationRead,
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
