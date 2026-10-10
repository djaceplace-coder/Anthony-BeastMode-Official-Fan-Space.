/**
 * Anthony BeastMode Website - Firestore Database Schema Types
 */

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'changes_requested';
export type ReleaseType = 'album' | 'ep' | 'single' | 'mixtape' | 'compilation';
export type ReleaseLifecycle = 'announced' | 'released' | 'archived';
export type LyricsStatus = 'not_shown' | 'licensed' | 'instrumental';
export type ShowStatus = 'on_sale' | 'low_tickets' | 'sold_out' | 'cancelled' | 'postponed' | 'past';
export type AgePolicy = 'all_ages' | '18_plus' | '21_plus';
export type OfferScope = 'all_visitors' | 'members_only' | 'city' | 'segment';
export type OfferType = 'fan_membership' | 'razer_gold' | 'apple' | 'merch' | 'other';
export type OfferStatus = 'draft' | 'approved' | 'paused' | 'expired';
export type InquiryCategory = 'fans' | 'press' | 'booking';
export type InquiryStatus = 'new' | 'contacted' | 'hold' | 'offer_sent' | 'booked' | 'declined' | 'closed';
export type UserRole = 'super_admin' | 'content_admin' | 'tour_admin' | 'fan_support' | 'partnerships' | 'member';

export interface ArtistProfile {
  id?: string;
  displayName: string;
  shortBio: string;
  longBio: string;
  originSummary: string;
  homeBase: string; // e.g. "Missouri"
  approvalStatus: ApprovalStatus;
  approvedAt?: string;
  approvedBy?: string;
  sourceNote?: string;
}

export interface PlatformLink {
  url: string;
  lastCheckedAt?: string;
  status?: 'active' | 'broken';
}

export interface Release {
  id: string;
  slug: string;
  title: string;
  type: ReleaseType;
  releaseDate: string;
  status: ReleaseLifecycle;
  coverUrl?: string;
  coverMediaId?: string;
  explicit: boolean;
  cleanVersionUrl?: string;
  description?: string;
  credits?: Array<{ role: string; name: string; source?: string }>;
  platformLinks: Record<string, PlatformLink>;
  embedProvider?: 'spotify' | 'apple_music' | 'deezer' | 'youtube' | 'none';
  embedUrl?: string;
  featured: boolean;
  sortOrder: number;
  approvalStatus: ApprovalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Track {
  id: string;
  releaseId: string;
  trackNumber: number;
  title: string;
  durationSeconds: number;
  explicit: boolean;
  lyricsStatus: LyricsStatus;
  licensedLyricsUrl?: string;
  platformLinks?: Record<string, string>;
  createdAt?: string;
}

export interface PlatformConfig {
  id: string;
  name: string;
  urlPattern: string;
  embedSupported: boolean;
  embedHostAllowlist: string[];
  active: boolean;
}

export interface CityMetrics {
  monthlyListeners?: number;
  pastSales?: number;
  socialFollowers?: number;
  lastUpdated?: string;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  state: string;
  country: string;
  timeZone: string;
  heroImageUrl?: string;
  heroMediaId?: string;
  cityNote?: string; // Approved copy only
  priorityTier: 1 | 2 | 3;
  enabled: boolean;
  metricsPrivate?: CityMetrics;
  adminNote?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  cityId: string;
  capacityRange?: string; // Approved only
  website?: string;
  contactName?: string;
  contactEmail?: string; // Admin only
  timeZone: string;
}

export interface Tour {
  id: string;
  name: string;
  year: number;
  description?: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface ShowExperience {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  officialTicketUrl: string;
  limitedAvailability: boolean;
}

export interface Show {
  id: string;
  tourId?: string;
  cityId: string;
  venueId: string;
  date: string; // YYYY-MM-DD
  doorsTime?: string; // e.g. "7:00 PM"
  showTime: string; // e.g. "8:00 PM"
  timeZone: string;
  agePolicy: AgePolicy;
  opener?: string;
  status: ShowStatus;
  officialTicketUrl: string;
  ticketVendorName: string;
  priceLabel: string; // e.g. "$25 advance"
  priceSource: string; // vendor name
  priceVerifiedOn: string; // ISO date or YYYY-MM-DD
  experiences?: ShowExperience[];
  recapCopy?: string;
  recapMediaUrls?: string[];
  publicNotice?: string; // Cancellation or postponement details
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  cityId: string;
  venueId?: string;
  venueName?: string;
  eventType: 'meetup' | 'meet_and_greet' | 'listening_party' | 'merch_popup' | 'other';
  title: string;
  description: string;
  date: string;
  time: string;
  membersOnly: boolean;
  officialUrl?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface PartnerOffer {
  id: string;
  partnerName: string;
  partnerLogoUrl: string;
  offerType: OfferType;
  headline: string;
  discountText: string;
  scope: OfferScope;
  cityId?: string;
  segmentKey?: string;
  startAt: string; // ISO date
  endAt: string; // ISO date
  status: OfferStatus;
  ctaLabel: string;
  ctaUrl: string;
  finePrint: string; // REQUIRED
  signedTermsRef?: string;
  ticketRelated: boolean;
  ticketingPartnerApproved: boolean;
  ticketingVendorName?: string;
  sponsoredLabel: 'Sponsored';
  createdBy?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferMetrics {
  offerId: string;
  date: string;
  impressions: number;
  clicks: number;
  cityBreakdown?: Record<string, number>;
}

export interface Member {
  uid: string;
  email?: string;
  displayName: string;
  cityId?: string;
  segments: string[]; // e.g. 'rebel_family', 'city_fan', 'new_listener', 'press', 'venue_contact'
  confirmed18Plus: boolean;
  confirmed18PlusAt?: string;
  language?: string;
  notificationPrefs: {
    shows: boolean;
    presales: boolean;
    music: boolean;
    offers: boolean;
    messages: boolean;
  };
  accessibilitySettings?: {
    reduceMotion?: boolean;
    captionsDefault?: boolean;
  };
  status: 'active' | 'suspended' | 'removed';
  createdAt?: string;
}

export interface MemberFollow {
  id?: string;
  uid: string;
  cityId: string;
  followedAt: string;
}

export interface Conversation {
  id: string;
  memberUid: string;
  memberName: string;
  subject: string;
  status: 'open' | 'waiting' | 'closed';
  assigneeUid?: string;
  cityId?: string;
  segmentSnapshot?: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderUid: string;
  senderRole: 'member' | 'team';
  senderName: string;
  body: string;
  createdAt: string;
  hidden?: boolean;
  hiddenReason?: string;
}

export interface InternalNote {
  id: string;
  authorUid: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  uid: string;
  type: 'show_on_sale' | 'low_tickets' | 'sold_out' | 'show_cancelled' | 'new_release' | 'news' | 'offer' | 'message_reply' | 'presale';
  title: string;
  body: string;
  link?: string;
  channel: 'in_app' | 'email';
  createdAt: string;
  readAt?: string;
}

export interface Inquiry {
  id: string;
  category: InquiryCategory;
  name: string;
  email: string;
  city?: string;
  topic?: string;
  message: string;
  outlet?: string;
  deadline?: string;
  requestType?: string;
  proposedDate?: string;
  venueName?: string;
  capacity?: string;
  budgetRange?: string;
  status: InquiryStatus;
  assigneeUid?: string;
  internalNotes?: string;
  createdAt: string;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  body: string; // Approved copy only
  tags: string[];
  publishAt: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  authorTeam: string;
  heroImageUrl?: string;
  createdAt?: string;
}

export interface CopyItem {
  id: string;
  pageRef: string;
  key: string;
  body: string;
  status: ApprovalStatus;
  author: string;
  approvals: Array<{ approver: string; timestamp: string }>;
  sourceNote?: string;
  approvedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
  timestamp: string;
  ipHash?: string;
}

export interface MediaItem {
  id: string;
  masterPath: string;
  crops: {
    landscape?: string; // 16:9
    portrait?: string; // 4:5
    square?: string; // 1:1
  };
  altText: string;
  credit: string;
  rightsStatus: 'owned' | 'licensed' | 'permission_received' | 'pending';
  rightsEndDate?: string;
  approvalStatus: ApprovalStatus;
  tags: string[];
  cityId?: string;
  slotIds?: string[];
  uploadedBy: string;
  createdAt: string;
}

export interface FanDownload {
  id: string;
  assetKey: string;
  date: string;
  count: number;
}
