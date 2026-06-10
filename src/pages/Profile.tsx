import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing } from '../types';
import { 
  ArrowLeft,
  ChevronLeft, 
  Megaphone,
  GraduationCap,
  MapPin,
  Edit2,
  ArrowUpRight,
  Star,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  Bell,
  Globe,
  Building,
  Check,
  Loader2,
  X,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  Heart,
  Users,
  Mail
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { EditListingModal } from '../components/EditListingModal';
import { CreateListingModal } from '../components/CreateListingModal';
import { PhotoCarouselOverlay } from '../components/PhotoCarouselOverlay';
import { useToast } from '../components/ToastProvider';
import { cn } from '../lib/utils';
import { AuthModal } from '../components/AuthModal';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut, signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const [isLandlord, setIsLandlord] = useState(() => {
    return localStorage.getItem('khubo_is_landlord') === 'true';
  });
  const [hasLandlordAccount, setHasLandlordAccount] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);

  // Load saved profile setup data
  const [savedProfile, setSavedProfile] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('khubo_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  
  const menuItems = [
    { title: 'Notifications', icon: Bell, action: () => alert('Notifications clicked') },
    { title: 'Account settings', icon: Settings, action: () => alert('Account settings clicked') },
    { title: 'Languages & currency', icon: Globe, action: () => alert('Languages & currency clicked') },
    { title: 'Help Center', icon: HelpCircle, action: () => alert('Help Center clicked') },
  ];
  
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLandlordLogin, setIsLandlordLogin] = useState(true);
  const [landlordEmail, setLandlordEmail] = useState('');
  const [landlordPassword, setLandlordPassword] = useState('');
  const [showLandlordPassword, setShowLandlordPassword] = useState(false);

  // Profile data — use saved profile if available, else defaults
  const [profileName, setProfileName] = useState(() => savedProfile?.nickname || savedProfile?.full_name || user?.email?.split('@')[0] || 'Khubo User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileBio, setProfileBio] = useState(() => savedProfile?.bio || '"Clean and organized. Looking for a place near the city center. I cook often and enjoy a shared meal!"');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [profileTags, setProfileTags] = useState<string[]>(() => {
    if (savedProfile?.lifestyle && savedProfile.lifestyle.length > 0) {
      const labelMap: Record<string, string> = {
        pet_friendly: 'Pet-friendly', non_smoker: 'Non-smoker', vegan: 'Vegan',
        fitness: 'Gym lover', music: 'Into music', foodie: 'Foodie',
        social: 'Social butterfly', introvert: 'Introvert', remote_work: 'Remote worker', studious: 'Studious'
      };
      return savedProfile.lifestyle.map((id: string) => labelMap[id] || id);
    }
    return ['Introvert', 'Pet-friendly', 'Night owl', 'Studious', 'Non-smoker'];
  });
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedStatModal, setSelectedStatModal] = useState<string | null>(null);

  // Persistence helpers for profile fields
  const saveProfileData = async (updatedFields: any) => {
    const updatedProfile = {
      ...savedProfile,
      ...updatedFields,
      updated_at: new Date().toISOString()
    };
    setSavedProfile(updatedProfile);
    localStorage.setItem('khubo_user_profile', JSON.stringify(updatedProfile));

    if (user?.id) {
      try {
        const dbPayload: any = {
          updated_at: updatedProfile.updated_at,
          ...updatedFields
        };

        const { error } = await supabase
          .from('profiles')
          .update(dbPayload)
          .eq('id', user.id);

        if (error) {
          console.error('Failed to sync profile updates to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync profile updates to Supabase:', err);
      }
    }
  };

  const saveProfileTags = (newTags: string[]) => {
    setProfileTags(newTags);
    const reverseLabelMap: Record<string, string> = {
      'Pet-friendly': 'pet_friendly', 'Non-smoker': 'non_smoker', 'Vegan': 'vegan',
      'Gym lover': 'fitness', 'Into music': 'music', 'Foodie': 'foodie',
      'Social butterfly': 'social', 'Introvert': 'introvert', 'Remote worker': 'remote_work', 'Studious': 'studious'
    };
    const lifestyleIds = newTags.map(tag => reverseLabelMap[tag] || tag);
    saveProfileData({ lifestyle: lifestyleIds });
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    if (profileName.trim()) {
      saveProfileData({ nickname: profileName.trim() });
    }
  };

  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [myRoommatePosts, setMyRoommatePosts] = useState<any[]>([]);
  const [sentRoommateConvs, setSentRoommateConvs] = useState<any[]>([]);
  const [receivedRoommateConvs, setReceivedRoommateConvs] = useState<any[]>([]);
  const [loadingRoommates, setLoadingRoommates] = useState(false);

  // Landlord Dashboard specific state variables
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'vacancy' | 'tenants' | 'properties'>('overview');
  const [selectedReservationDetail, setSelectedReservationDetail] = useState<any | null>(null);

  const tabParam = searchParams.get('tab');
  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'settings') {
        setActiveTab('overview');
        setTimeout(() => {
          document.getElementById('settings-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (['overview', 'properties', 'reservations', 'tenants', 'vacancy'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, [tabParam]);

  // Helper declarations for profile statistics and lists
  const pendingReservations = reservations.filter((r) => r.status === 'Active');
  const approvedReservations = reservations.filter((r) => r.status === 'Approved');
  
  const pendingCount = pendingReservations.length;
  const tenantsCount = approvedReservations.length;
  const propertiesCount = myListings.length;
  const totalRevenue = approvedReservations.reduce((sum, r) => sum + r.price, 0);

  // Tenant stats
  const savedCount = savedListings.length;
  const activeReservationsCount = reservations.filter(r => r.status === 'Active' || r.status === 'Approved').length;
  const roommateCount = myRoommatePosts.length + sentRoommateConvs.length;
  const invitationCount = receivedRoommateConvs.length;

  const handleAcceptReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'accepted' })
        .eq('id', id);
      
      if (error) {
        showToast("Failed to approve reservation.");
      } else {
        showToast("Reservation approved successfully!");
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDenyReservation = async (id: string) => {
    const confirmDeny = window.confirm("Are you sure you want to deny this reservation request?");
    if (confirmDeny) {
      try {
        const { error } = await supabase
          .from('reservations')
          .update({ status: 'denied' })
          .eq('id', id);
        
        if (error) {
          showToast("Failed to deny reservation.");
        } else {
          showToast("Reservation request denied.");
          fetchReservations();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleRoomOccupancy = async (listingId: string, roomKey: 'room1Occupied' | 'room2Occupied') => {
    const listing = myListings.find(l => l.id === listingId);
    if (!listing) return;
    
    const updatedHost = {
      ...(listing.host || {}),
      [roomKey]: !(listing.host?.[roomKey])
    };
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ host: updatedHost })
        .eq('id', listingId);
      
      if (error) {
        showToast("Failed to update room occupancy.");
      } else {
        showToast(`Room marked as ${updatedHost[roomKey] ? 'Occupied' : 'Vacant'}`);
        fetchMyListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageTenant = (tenantName: string) => {
    const savedChatsStr = localStorage.getItem('khubo_conversations');
    const savedChats = savedChatsStr ? JSON.parse(savedChatsStr) : [];
    
    const existing = savedChats.find((c: any) => c.name === tenantName);
    if (!existing) {
      const newConv = {
        id: 'conv_tenant_' + tenantName.replace(/\s+/g, '_').toLowerCase(),
        name: tenantName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        lastMessage: 'Hi! Let\'s coordinate your move-in details.',
        time: 'Just now',
        unread: 0,
        online: true,
        role: 'Roommate'
      };
      
      const msgKey = `khubo_messages_${newConv.id}`;
      const initialMsgs = [
        { id: '1', text: `Hi ${tenantName}, I've approved your reservation request. Let's coordinate your move-in details.`, sender: 'me', time: 'Just now' }
      ];
      localStorage.setItem(msgKey, JSON.stringify(initialMsgs));
      localStorage.setItem('khubo_conversations', JSON.stringify([newConv, ...savedChats]));
    }
    
    navigate('/messages');
  };
  
  const handleOpenGallery = (listing: Listing | null, fallbackSrc: string = '') => {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1555819485-99aaa4aee26b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
    ];
    let imgs: string[] = [];
    if (listing?.gallery && Array.isArray(listing.gallery) && listing.gallery.length > 0) {
      imgs = listing.gallery;
    } else if (listing?.image) {
      imgs = [listing.image];
    } else if (fallbackSrc) {
      imgs = [fallbackSrc];
    }
    
    // Fallbacks just in case we only have 1 image but want to show a gallery anyway for styling (like how the listing detail does it)
    if (imgs.length < 4) {
      imgs = [...imgs, ...fallbackImages.slice(0, 4 - imgs.length)];
    }
    
    setGalleryImages(imgs);
    setIsPhotoGalleryOpen(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchProfileAndSetRole = async () => {
      if (!user) return;
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error loading profile:", error);
          return;
        }

        if (profile) {
          const mergedProfile = {
            ...profile,
            email: user.email
          };

          setSavedProfile(mergedProfile);
          localStorage.setItem('khubo_user_profile', JSON.stringify(mergedProfile));
          
          if (profile.nickname || profile.full_name) {
            setProfileName(profile.nickname || profile.full_name);
          }
          if (profile.bio) {
            setProfileBio(profile.bio);
          }
          if (profile.lifestyle && profile.lifestyle.length > 0) {
            const labelMap: Record<string, string> = {
              pet_friendly: 'Pet-friendly', non_smoker: 'Non-smoker', vegan: 'Vegan',
              fitness: 'Gym lover', music: 'Into music', foodie: 'Foodie',
              social: 'Social butterfly', introvert: 'Introvert', remote_work: 'Remote worker', studious: 'Studious'
            };
            setProfileTags(profile.lifestyle.map((id: string) => labelMap[id] || id));
          }
          
          if (profile.role === 'landlord') {
            setHasLandlordAccount(true);
            localStorage.setItem('khubo_landlord_registered', 'true');
          } else {
            setHasLandlordAccount(false);
            localStorage.setItem('khubo_landlord_registered', 'false');
            setIsLandlord(false);
          }
        }
      } catch (err) {
        console.error("Error fetching profile on load:", err);
      }
    };

    fetchProfileAndSetRole();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIsAuthModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('khubo_is_landlord', isLandlord.toString());
  }, [isLandlord]);

  const fetchReservations = React.useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          listings (
            title,
            image,
            location,
            price,
            landlord_id
          )
        `);
      
      if (error) {
        console.error("Error fetching reservations:", error);
        return;
      }
      
      const mapped = (data || []).map((res: any) => {
        const statusMap: Record<string, string> = {
          pending: 'Active',
          accepted: 'Approved',
          denied: 'Denied',
          cancelled: 'Cancelled'
        };
        
        return {
          id: res.id,
          listingId: res.listing_id,
          listingTitle: res.listings?.title || "Property",
          listingImage: res.listings?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
          listingLocation: res.listings?.location || "Iligan City",
          roomName: res.room_type,
          price: Number(res.total_price || res.listings?.price || 0),
          moveInDate: res.move_in_date,
          status: statusMap[res.status] || 'Active',
          paymentMethod: res.payment_method,
          createdAt: new Date(res.created_at).toLocaleDateString(),
          tenantName: res.tenant_name || "Guest User",
          tenantEmail: res.tenant_email,
          tenantPhone: res.tenant_phone,
          tenantAge: res.tenant_age?.toString(),
          tenantStudentId: res.tenant_id_url,
          tenantId: res.tenant_id,
          landlordId: res.listings?.landlord_id
        };
      });

      if (isLandlord) {
        setReservations(mapped.filter(r => r.landlordId === user.id));
      } else {
        setReservations(mapped.filter(r => r.tenantId === user.id));
      }
    } catch (err) {
      console.error(err);
    }
  }, [user, isLandlord]);

  const fetchProfileStatsData = React.useCallback(async () => {
    if (!user) return;
    
    // 1. Fetch Saved Listings
    setLoadingSaved(true);
    try {
      const savedStr = localStorage.getItem('khubo_saved_listings');
      const savedIds = savedStr ? JSON.parse(savedStr) : [];
      if (savedIds.length > 0) {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .in('id', savedIds);
        
        if (error) {
          console.error("Error fetching saved listings:", error);
          setSavedListings([]);
        } else {
          setSavedListings(data || []);
        }
      } else {
        setSavedListings([]);
      }
    } catch (err) {
      console.error(err);
      setSavedListings([]);
    } finally {
      setLoadingSaved(false);
    }

    // 2. Fetch Roommate Post & Roommate Conversations
    setLoadingRoommates(true);
    try {
      // Own roommate posts
      const { data: roommatePosts, error: roommatePostsErr } = await supabase
        .from('roommates')
        .select('*')
        .eq('user_id', user.id);

      if (roommatePostsErr) {
        console.error("Error fetching roommate posts:", roommatePostsErr);
        setMyRoommatePosts([]);
      } else {
        setMyRoommatePosts(roommatePosts || []);
      }

      // Roommate conversations
      const { data: convs, error: convsErr } = await supabase
        .from('conversations')
        .select(`
          *,
          sender:sender_id(role, avatar_url),
          receiver:receiver_id(role, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (convsErr) {
        console.error("Error fetching conversations:", convsErr);
        setSentRoommateConvs([]);
        setReceivedRoommateConvs([]);
      } else {
        const roommateConvs = (convs || []).map((c: any) => {
          const isReceiver = c.receiver_id === user?.id;
          const otherProfile = isReceiver ? c.sender : c.receiver;
          const otherName = isReceiver ? c.sender_name : c.receiver_name;
          const otherRole = otherProfile?.role 
            ? (otherProfile.role === 'landlord' ? 'Landlord' : 'Roommate') 
            : (otherName?.toLowerCase().includes('landlord') ? 'Landlord' : 'Roommate');
          const otherAvatar = otherProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`;

          return {
            id: c.id,
            name: otherName || 'Unknown',
            avatar: otherAvatar,
            lastMessage: c.last_message || '',
            time: c.last_message_time
              ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            unread: c.last_sender_id === user.id ? 0 : (c.unread_count || 0),
            role: otherRole,
            senderId: c.sender_id,
            receiverId: c.receiver_id,
            status: c.status || localStorage.getItem(`khubo_matched_${c.id}`) || 'active'
          };
        }).filter(c => c.role === 'Roommate');

        // Split into sent & received
        const sent = roommateConvs.filter(c => c.senderId === user.id);
        const received = roommateConvs.filter(c => c.receiverId === user.id);

        setSentRoommateConvs(sent);
        setReceivedRoommateConvs(received);
      }
    } catch (err) {
      console.error(err);
      setMyRoommatePosts([]);
      setSentRoommateConvs([]);
      setReceivedRoommateConvs([]);
    } finally {
      setLoadingRoommates(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReservations();
      fetchProfileStatsData();
    }
  }, [user, isLandlord, fetchReservations, fetchProfileStatsData]);

  useEffect(() => {
    if (user && selectedStatModal) {
      fetchProfileStatsData();
    }
  }, [user, selectedStatModal, fetchProfileStatsData]);

  const handleCancelReservation = async (id: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this reservation? The ₱1,000 holding deposit will be refunded to your source payment account.");
    if (confirmCancel) {
      try {
        const { error } = await supabase
          .from('reservations')
          .update({ status: 'cancelled' })
          .eq('id', id);
        
        if (error) {
          showToast("Failed to cancel reservation.");
        } else {
          showToast("Reservation cancelled successfully. Refund initiated.");
          fetchReservations();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleContactLandlord = async (landlordId: string, listingTitle: string) => {
    if (!user) return;
    
    const isUUID = landlordId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(landlordId);
    
    if (isUUID) {
      showToast('Initiating conversation with landlord...');
      let targetId: string | null = null;
      try {
        const prefilledText = `Hi! I am writing to inquire regarding my reservation for "${listingTitle}".`;
        
        const { data: existingConvs } = await supabase
          .from('conversations')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        const existing = existingConvs?.find(
          c => (c.sender_id === user.id && c.receiver_id === landlordId) ||
               (c.sender_id === landlordId && c.receiver_id === user.id)
        );

        if (existing) {
          targetId = existing.id;
          await supabase.from('messages').insert({
            conversation_id: existing.id,
            sender_id: user.id,
            text: prefilledText
          });
          await supabase
            .from('conversations')
            .update({
              last_message: prefilledText,
              last_message_time: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          const { data: landlordProfile } = await supabase
            .from('profiles')
            .select('full_name, nickname')
            .eq('id', landlordId)
            .single();
          
          const receiverName = landlordProfile?.full_name || landlordProfile?.nickname || 'Landlord';

          const { data: myProfile } = await supabase
            .from('profiles')
            .select('full_name, nickname')
            .eq('id', user.id)
            .single();

          const senderName = myProfile?.full_name || myProfile?.nickname || user.email?.split('@')[0] || 'User';

          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              sender_id: user.id,
              receiver_id: landlordId,
              sender_name: senderName,
              receiver_name: receiverName,
              last_message: prefilledText,
              last_message_time: new Date().toISOString()
            })
            .select()
            .single();

          if (newConv) {
            targetId = newConv.id;
            await supabase.from('messages').insert({
              conversation_id: newConv.id,
              sender_id: user.id,
              text: prefilledText
            });
          }
        }
      } catch (err) {
        console.error('Supabase landlord contact error:', err);
      } finally {
        setSelectedStatModal(null);
        if (targetId) {
          navigate(`/messages?id=${targetId}`);
        } else {
          navigate('/messages');
        }
      }
    } else {
      const hostId = `host_${landlordId || 'unknown'}`;
      const prefilledText = `Hi! I am writing to inquire regarding my reservation for "${listingTitle}".`;
      
      const newChat = {
        id: hostId,
        name: 'Landlord',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${hostId}`,
        lastMessage: prefilledText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        online: true,
        role: 'Landlord'
      };
      
      const chatsStr = localStorage.getItem('khubo_conversations');
      const chats = chatsStr ? JSON.parse(chatsStr) : [];
      
      if (!chats.some((c: any) => c.id === hostId)) {
        localStorage.setItem('khubo_conversations', JSON.stringify([newChat, ...chats]));
      }
      
      const newMsg = {
        id: Date.now().toString(),
        text: prefilledText,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      localStorage.setItem(`khubo_messages_${hostId}`, JSON.stringify([newMsg]));
      
      showToast('Initiating conversation with host...');
      setSelectedStatModal(null);
      setTimeout(() => {
        navigate(`/messages?id=${hostId}`);
      }, 1000);
    }
  };

  const handleAcceptRoommateInvitation = async (conv: any) => {
    if (!user) return;
    try {
      const systemText = `👋 Match confirmed! Roommate invitation accepted. You and ${conv.name} are now connected. Start coordinating your co-living plans!`;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conv.id);

      if (isUUID) {
        const { error: msgErr } = await supabase.from('messages').insert({
          conversation_id: conv.id,
          sender_id: user.id,
          text: systemText
        });

        if (msgErr) throw msgErr;

        let convErr;
        try {
          const { error } = await supabase
            .from('conversations')
            .update({
              last_message: systemText,
              last_message_time: new Date().toISOString(),
              status: 'accepted'
            })
            .eq('id', conv.id);
          convErr = error;
        } catch (err) {
          convErr = err;
        }

        if (convErr) {
          console.warn("DB status column might be missing. Attempting fallback update.", convErr);
          const { error: fallbackErr } = await supabase
            .from('conversations')
            .update({
              last_message: systemText,
              last_message_time: new Date().toISOString()
            })
            .eq('id', conv.id);
          if (fallbackErr) throw fallbackErr;
        }

        // Keep local storage synced as fallback/offline safety
        localStorage.setItem(`khubo_matched_${conv.id}`, 'accepted');
      } else {
        // Fallback for localStorage
        const key = `khubo_messages_${conv.id}`;
        const savedMsgsStr = localStorage.getItem(key);
        const savedMsgs = savedMsgsStr ? JSON.parse(savedMsgsStr) : [];
        const newMsg = {
          id: Date.now().toString(),
          text: systemText,
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        localStorage.setItem(key, JSON.stringify([...savedMsgs, newMsg]));

        const savedChatsStr = localStorage.getItem('khubo_conversations');
        if (savedChatsStr) {
          const chats = JSON.parse(savedChatsStr);
          const idx = chats.findIndex((c: any) => c.id === conv.id);
          if (idx !== -1) {
            chats[idx].lastMessage = newMsg.text;
            chats[idx].time = 'Just now';
            localStorage.setItem('khubo_conversations', JSON.stringify(chats));
          }
        }
      }

      showToast(`Match confirmed with ${conv.name}! 🎉`);
      fetchProfileStatsData();
    } catch (err) {
      console.error("Error accepting roommate invitation:", err);
      showToast("Failed to accept invitation.");
    }
  };

  const handleSignupAsLandlord = async () => {
    setIsSigningUp(true);
    try {
      if (isLandlordLogin) {
        const { error } = await signIn(landlordEmail, landlordPassword);
        if (error) {
          showToast(`Login failed: ${error.message || error}`);
          setIsSigningUp(false);
          return;
        }
      } else {
        const { error } = await signUp(landlordEmail, landlordPassword);
        if (error) {
          showToast(`Sign up failed: ${error.message || error}`);
          setIsSigningUp(false);
          return;
        }
      }

      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      if (!sessionUser) {
        showToast("Authentication error. Please try again.");
        setIsSigningUp(false);
        return;
      }

      // Create/Update the profile role in the profiles table to 'landlord'
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      const profilePayload = {
        role: 'landlord',
        updated_at: new Date().toISOString()
      };

      if (profile) {
        await supabase.from('profiles').update(profilePayload).eq('id', sessionUser.id);
      } else {
        await supabase.from('profiles').insert({
          id: sessionUser.id,
          full_name: sessionUser.email?.split('@')[0] || 'Landlord',
          nickname: sessionUser.email?.split('@')[0] || 'Landlord',
          role: 'landlord',
          onboarding_complete: false,
          ...profilePayload
        });
      }

      localStorage.setItem('khubo_landlord_registered', 'true');
      localStorage.setItem('khubo_is_landlord', 'true');
      
      const mergedProfile = profile 
        ? { ...profile, ...profilePayload }
        : { 
            id: sessionUser.id, 
            role: 'landlord', 
            full_name: sessionUser.email?.split('@')[0] || 'Landlord', 
            nickname: sessionUser.email?.split('@')[0] || 'Landlord',
            onboarding_complete: false,
            ...profilePayload
          };
      const storageProfile = {
        ...mergedProfile,
        email: sessionUser.email
      };
      localStorage.setItem('khubo_user_profile', JSON.stringify(storageProfile));
      setSavedProfile(storageProfile);

      setHasLandlordAccount(true);
      setIsLandlord(true);
      setShowSignupModal(false);
      showToast(isLandlordLogin ? "Logged in to Landlord dashboard! 🏠" : "Registered landlord account successfully! 🎉");
    } catch (err: any) {
      showToast(`Error: ${err.message || err}`);
    } finally {
      setIsSigningUp(false);
    }
  };

  const fetchMyListings = React.useCallback(async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('landlord_id', user.id);
      
      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        setMyListings(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLandlord) {
      fetchMyListings();
    }
  }, [user, isLandlord, fetchMyListings]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col justify-between pb-32">
        {/* Top Header */}
        <div className="w-full p-4 md:p-6 flex justify-between items-center text-neutral-900 border-b border-neutral-100 bg-white shadow-sm">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition cursor-pointer">
             <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-lg text-neutral-800">My Profile</span>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-[#2252D6]/10 text-[#2252D6] rounded-full flex items-center justify-center mb-8 shadow-inner animate-pulse">
            <Shield size={48} className="stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">Access Restricted</h2>
          <p className="text-neutral-500 text-sm mb-8 leading-relaxed font-semibold">
            Please log in or create an account to manage your profile, view saved listings, track bookings, and connect with other roommates.
          </p>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full bg-[#2252D6] hover:bg-[#1b43b3] text-white py-4 rounded-2xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#2252D6]/20 cursor-pointer"
          >
            Log In / Sign Up
          </button>
        </div>

        <BottomNav />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => {
            setIsAuthModalOpen(false);
            navigate('/');
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative min-h-[440px] md:h-[500px] w-full bg-black flex flex-col justify-end">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80&w=2000")', opacity: 0.6 }}
        />
        {/* Dark Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-0 w-full p-4 md:p-6 md:px-12 xl:px-20 flex justify-between items-center z-50 text-white pointer-events-none">
          <button onClick={handleBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition pointer-events-auto cursor-pointer">
             <ArrowLeft size={24} className="md:w-8 md:h-8" />
          </button>
          <button className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition pointer-events-auto cursor-pointer">
             <Megaphone className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>

        {/* Content Container */}
        <div className="relative md:absolute md:inset-0 max-w-[2520px] mx-auto px-4 md:px-12 xl:px-20 flex flex-col md:flex-row items-center justify-between z-10 pt-24 pb-8 md:pb-12">
          
          {/* Left Card: Profile Info */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 md:p-8 w-full md:w-[60%] lg:w-[45%] text-white shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                 {savedProfile?.avatar_url ? (
                   <img 
                     src={savedProfile.avatar_url} 
                     alt="Profile" 
                     className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-[#2252D6] object-cover bg-white" 
                   />
                 ) : (
                   <img 
                     src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" 
                     alt="Profile" 
                     className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-[#2252D6] object-cover bg-white" 
                   />
                 )}
                 <div className="flex-1 text-center sm:text-left">
                     <div className="flex items-center justify-center sm:justify-start gap-3">
                      {isEditingName ? (
                        <input
                          autoFocus
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          onBlur={handleSaveName}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                          className="text-2xl md:text-[28px] font-bold tracking-tight bg-transparent border-b border-white outline-none text-white w-full max-w-[250px]"
                        />
                      ) : (
                        <>
                          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-white">{profileName || 'Your Name'}</h1>
                          <button onClick={() => setIsEditingName(true)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                            <Edit2 className="w-4 h-4 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-sm text-white/90">
                       <GraduationCap className="w-4 h-4 shrink-0 text-white" />
                       <span>{savedProfile?.school_or_company || 'MSU-IIT'} | {savedProfile?.occupation?.replace('_', ' ') || 'Student'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-sm text-white/90">
                       <MapPin className="w-4 h-4 shrink-0 text-white" />
                       <span>{savedProfile?.location || 'Tibanga, Iligan City'}</span>
                    </div>
                 </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                 {profileTags.map(tag => (
                   <span key={tag} className="px-4 py-1.5 rounded-full border border-white/50 text-[11px] md:text-xs font-semibold bg-transparent text-white hover:bg-white/10 transition cursor-default group relative">
                     {tag}
                     <button
                       onClick={() => {
                         const updatedTags = profileTags.filter(t => t !== tag);
                         saveProfileTags(updatedTags);
                       }}
                       className="absolute -top-1 -right-1 bg-neutral-800 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X size={10} />
                     </button>
                   </span>
                 ))}
                 
                 {isEditingTags ? (
                   <form 
                     onSubmit={(e) => {
                       e.preventDefault();
                       if (newTagInput.trim() && !profileTags.includes(newTagInput.trim())) {
                         const updatedTags = [...profileTags, newTagInput.trim()];
                         saveProfileTags(updatedTags);
                       }
                       setNewTagInput('');
                       setIsEditingTags(false);
                     }}
                     className="inline-flex"
                   >
                     <input
                       autoFocus
                       type="text"
                       value={newTagInput}
                       onChange={(e) => setNewTagInput(e.target.value)}
                       onBlur={() => {
                         if (newTagInput.trim() && !profileTags.includes(newTagInput.trim())) {
                           const updatedTags = [...profileTags, newTagInput.trim()];
                           saveProfileTags(updatedTags);
                         }
                         setNewTagInput('');
                         setIsEditingTags(false);
                       }}
                       placeholder="Add tag..."
                       className="px-4 py-1.5 rounded-full border border-white/50 text-[11px] md:text-xs font-semibold bg-white/20 text-white outline-none w-24 placeholder:text-neutral-400"
                     />
                   </form>
                 ) : (
                   <button 
                     onClick={() => setIsEditingTags(true)}
                     className="px-4 py-1.5 rounded-full border border-white/50 border-dashed text-[11px] md:text-xs font-semibold bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
                   >
                     + Add tag
                   </button>
                 )}
              </div>
          </div>

          {/* Right Quote */}
          <div className="hidden md:block w-full md:w-[45%] lg:w-[40%] text-white text-xl lg:text-2xl font-semibold leading-relaxed drop-shadow-sm p-6 group">
             {isEditingBio ? (
               <textarea
                 autoFocus
                 value={profileBio}
                 onChange={(e) => setProfileBio(e.target.value)}
                 onBlur={() => {
                   setIsEditingBio(false);
                   saveProfileData({ bio: profileBio.trim() });
                 }}
                 className="w-full h-full bg-black/20 backdrop-blur-sm rounded-xl p-4 outline-none border border-white/20 resize-none text-white"
               />
             ) : (
               <div className="relative cursor-pointer hover:bg-white/10 p-2 rounded-xl transition" onClick={() => setIsEditingBio(true)}>
                 {profileBio}
                 <button className="absolute -top-4 right-0 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white/20 rounded-full">
                   <Edit2 size={16} className="text-white" />
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-[2520px] mx-auto px-4 md:px-12 xl:px-20 relative z-20 mt-6 md:mt-8">

        {/* Incomplete profile banner */}
        {!savedProfile?.onboarding_complete && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-[#2252D6]/10 to-[#3b6ef8]/5 border border-[#2252D6]/20 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2252D6]/10 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-[#2252D6]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#17294F]">Complete your profile</p>
                <p className="text-xs text-neutral-500">Add your info, ID, and lifestyle so landlords and roommates can trust you.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile-setup')}
              className="shrink-0 px-4 py-2 bg-[#2252D6] text-white text-xs font-bold rounded-xl hover:bg-[#1b43b3] transition-all active:scale-95 whitespace-nowrap"
            >
              Set Up →
            </button>
          </motion.div>
        )}

        {/* Landlord sub-navigation tabs */}

        {isLandlord && (
          <div className="flex border-b border-neutral-200 mb-8 mt-12 gap-6 text-xs font-bold uppercase tracking-wider text-neutral-400 select-none overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'reservations', label: `Reservations (${pendingCount})` },
              { id: 'vacancy', label: 'Vacancy Tracker' },
              { id: 'tenants', label: `Tenants (${tenantsCount})` },
              { id: 'properties', label: `My Listings (${propertiesCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab.id 
                    ? "border-[#2252D6] text-[#2252D6] font-black" 
                    : "border-transparent hover:text-neutral-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* 4 Stat Cards - Shown on overview tab or when in tenant mode */}
        {(!isLandlord || activeTab === 'overview') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 drop-shadow-sm">
             {(isLandlord ? [
               { title: 'Properties', count: propertiesCount.toString(), sub: 'Listed', tab: 'properties' },
               { title: 'Tenants', count: tenantsCount.toString(), sub: 'Active', tab: 'tenants' },
               { title: 'Reservations', count: pendingCount.toString(), sub: 'Pending', tab: 'reservations' },
               { title: 'Revenue', count: `₱${(totalRevenue / 1000).toFixed(1)}k`, sub: 'Earnings', tab: 'overview' }
             ] : [
               { title: 'Saved', count: savedCount.toString(), sub: 'Houses', tab: 'overview' },
               { title: 'Reservation', count: activeReservationsCount.toString(), sub: 'Active', tab: 'overview' },
               { title: 'Roommate', count: roommateCount.toString(), sub: 'Applications', tab: 'overview' },
               { title: 'Invitation', count: invitationCount.toString(), sub: 'Received', tab: 'overview' }
             ]).map((stat, i) => (
               <motion.div 
                 key={stat.title}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 onClick={() => {
                   if (isLandlord) {
                     setActiveTab(stat.tab as any);
                   } else {
                     setSelectedStatModal(stat.title);
                   }
                 }}
                 className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 flex flex-col relative group cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
               >
                 <div className="absolute top-5 right-5 md:top-6 md:right-6">
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-neutral-900" />
                 </div>
                 <h3 className="text-base md:text-lg font-bold text-neutral-900 mb-2 md:mb-4 pr-6">{stat.title}</h3>
                 <div className="flex items-baseline gap-2 mt-auto">
                   <span className="text-3xl md:text-[40px] font-bold text-[#17294F] leading-none">{stat.count}</span>
                   <span className="text-sm md:text-base text-neutral-500 font-medium">{stat.sub}</span>
                 </div>
               </motion.div>
             ))}
          </div>
        )}

        {/* --- LANDLORD VIEW ROUTING --- */}
        {isLandlord ? (
          <div className="mt-8">
            
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 text-left">
                {/* Activity Log */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
                  <h3 className="font-bold text-[#17294F] text-lg mb-4">Dashboard Activities</h3>
                  <div className="space-y-4 flex-1">
                    {approvedReservations.map((res, idx) => (
                      <div key={`act-app-${idx}`} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        <p className="text-xs text-neutral-600">
                          Approved reservation request for <span className="font-bold text-neutral-900">{res.tenantName}</span> at <span className="font-bold">{res.listingTitle}</span>
                        </p>
                      </div>
                    ))}
                    {pendingReservations.map((res, idx) => (
                      <div key={`act-pen-${idx}`} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                        <p className="text-xs text-neutral-600">
                          New reservation request from <span className="font-bold text-neutral-900">{res.tenantName}</span> waiting for review.
                        </p>
                      </div>
                    ))}
                    {reservations.filter(r => r.status === 'Cancelled').map((res, idx) => (
                      <div key={`act-can-${idx}`} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        <p className="text-xs text-neutral-600">
                          Reservation <span className="font-mono text-neutral-400">{res.id}</span> was aborted by tenant and holding deposit refunded.
                        </p>
                      </div>
                    ))}
                    {reservations.length === 0 && (
                      <p className="text-xs text-neutral-400 py-6 text-center">No recent activities.</p>
                    )}
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#17294F] text-lg mb-2">Earnings & Receivables</h3>
                    <p className="text-xs text-neutral-400 mb-6">Simulated billing logs based on linked GCash/PayMaya deposit checkouts.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Holding Deposits (₱1,000 / tenant)</span>
                      <span className="font-bold text-neutral-950">₱{(tenantsCount * 1000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Advance Rents (1 Month Approved)</span>
                      <span className="font-bold text-neutral-950">₱{approvedReservations.reduce((sum, r) => sum + r.price, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Security Deposits (1 Month Approved)</span>
                      <span className="font-bold text-neutral-950">₱{approvedReservations.reduce((sum, r) => sum + r.price, 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-neutral-100 pt-4 mt-2 flex justify-between items-center text-[#17294F]">
                      <span className="font-black text-xs uppercase tracking-wider">Gross Revenue</span>
                      <span className="font-black text-xl">₱{(totalRevenue * 2).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reservations Tab Content */}
            {activeTab === 'reservations' && (
              <div className="flex flex-col gap-6 mb-16 text-left">
                <h3 className="text-xl font-bold text-neutral-900 mb-1 px-1">Reservation Request List</h3>
                {reservations.map((res) => (
                  <div key={res.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 flex flex-col lg:flex-row gap-4 md:gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 w-full">
                    <img 
                      src={res.listingImage} 
                      alt={res.listingTitle} 
                      className="w-full lg:w-[260px] aspect-[16/10] lg:aspect-auto h-auto lg:h-[160px] object-cover rounded-xl shrink-0" 
                    />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-1">
                          <div>
                            <h4 className="text-lg font-bold text-neutral-950 tracking-tight">{res.listingTitle}</h4>
                            <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider mt-0.5">{res.roomName}</p>
                          </div>
                          <span className={cn(
                            "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0",
                            res.status === 'Active' ? "bg-blue-100 text-blue-700" :
                            res.status === 'Approved' ? "bg-green-100 text-green-700" :
                            res.status === 'Denied' ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-500"
                          )}>
                            {res.status === 'Active' ? 'Pending Approval' : res.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-3 font-semibold">Tenant applicant: <span className="text-neutral-800 font-black">{res.tenantName || 'Micheal B. Jordan'}</span></p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-neutral-50 pt-3 mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-black">₱{res.price.toLocaleString()}</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">/month</span>
                        </div>
                        <div className="flex gap-2.5 w-full sm:w-auto">
                          <button 
                            onClick={() => setSelectedReservationDetail(res)}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            View Details
                          </button>
                          {res.status === 'Active' && (
                            <>
                              <button 
                                onClick={() => handleDenyReservation(res.id)}
                                className="flex-1 sm:flex-none px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition cursor-pointer"
                              >
                                Deny
                              </button>
                              <button 
                                onClick={() => handleAcceptReservation(res.id)}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                Accept
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {reservations.length === 0 && (
                  <div className="text-center py-20 text-neutral-500 bg-white rounded-3xl border border-neutral-100">
                    No bookings found.
                  </div>
                )}
              </div>
            )}

            {/* Vacancy Tab Content */}
            {activeTab === 'vacancy' && (
              <div className="flex flex-col gap-6 mb-16 text-left">
                <h3 className="text-xl font-bold text-neutral-900 mb-1 px-1">Room Vacancy Tracker</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myListings.map((listing) => {
                    const isRoom1Occupied = listing.host?.room1Occupied || false;
                    const isRoom2Occupied = listing.host?.room2Occupied || false;
                    return (
                      <div key={listing.id} className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <img src={listing.image} alt={listing.title} className="w-14 h-14 rounded-xl object-cover" />
                          <div>
                            <h4 className="font-bold text-base text-neutral-900 truncate max-w-[200px]">{listing.title}</h4>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-0.5"><MapPin size={10} /> {listing.location.split(',')[0]}</p>
                          </div>
                        </div>
                        <div className="border-t border-neutral-100 pt-3 space-y-3 mt-1">
                          
                          {/* Room 1 */}
                          <div className="flex justify-between items-center py-1">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-neutral-950">Room 1 (Single Bed)</span>
                              <span className="text-[10px] text-neutral-400 mt-0.5">₱{listing.price.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                                isRoom1Occupied ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                              )}>
                                {isRoom1Occupied ? 'Occupied' : 'Vacant'}
                              </span>
                              <button 
                                onClick={() => handleToggleRoomOccupancy(listing.id, 'room1Occupied')}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition active:scale-95 cursor-pointer",
                                  isRoom1Occupied ? "border-green-600 text-green-600 hover:bg-green-50" : "border-amber-500 text-amber-500 hover:bg-amber-50"
                                )}
                              >
                                {isRoom1Occupied ? 'Free Room' : 'Book Room'}
                              </button>
                            </div>
                          </div>

                          {/* Room 2 */}
                          <div className="flex justify-between items-center py-1 border-t border-neutral-50 pt-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-neutral-950">Room 2 (Double Bed)</span>
                              <span className="text-[10px] text-neutral-400 mt-0.5">₱{Math.round(listing.price * 1.25).toLocaleString()}/mo</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                                isRoom2Occupied ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                              )}>
                                {isRoom2Occupied ? 'Occupied' : 'Vacant'}
                              </span>
                              <button 
                                onClick={() => handleToggleRoomOccupancy(listing.id, 'room2Occupied')}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition active:scale-95 cursor-pointer",
                                  isRoom2Occupied ? "border-green-600 text-green-600 hover:bg-green-50" : "border-amber-500 text-amber-500 hover:bg-amber-50"
                                )}
                              >
                                {isRoom2Occupied ? 'Free Room' : 'Book Room'}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tenants Tab Content */}
            {activeTab === 'tenants' && (
              <div className="flex flex-col gap-6 mb-16 text-left">
                <h3 className="text-xl font-bold text-neutral-900 mb-1 px-1">Active Co-living Tenants</h3>
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-500 font-extrabold uppercase tracking-wider border-b border-neutral-100">
                          <th className="py-4 px-6">Tenant</th>
                          <th className="py-4 px-6">Property</th>
                          <th className="py-4 px-6">Layout</th>
                          <th className="py-4 px-6">Monthly Rent</th>
                          <th className="py-4 px-6">Move-in timeline</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 font-semibold text-neutral-800">
                        {approvedReservations.map((res, idx) => (
                          <tr key={`tenant-row-${idx}`} className="hover:bg-neutral-50/50">
                            <td className="py-4 px-6 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#17294F] flex items-center justify-center font-black text-xs">
                                {res.tenantName?.charAt(0) || 'M'}
                              </div>
                              <span className="font-bold text-neutral-950">{res.tenantName || 'Micheal B. Jordan'}</span>
                            </td>
                            <td className="py-4 px-6 truncate max-w-[150px]">{res.listingTitle}</td>
                            <td className="py-4 px-6 font-medium text-[10px] text-neutral-500 uppercase tracking-wide">{res.roomName}</td>
                            <td className="py-4 px-6 font-bold text-neutral-950">₱{res.price.toLocaleString()}</td>
                            <td className="py-4 px-6 font-mono text-neutral-500">{res.moveInDate}</td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleMessageTenant(res.tenantName || 'Micheal B. Jordan')}
                                  className="px-3.5 py-1.5 bg-[#17294F] hover:bg-[#1e3466] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider active:scale-95 transition cursor-pointer"
                                >
                                  Message
                                </button>
                                <button 
                                  onClick={() => showToast(`Invoice slip ${res.id} generated & sent to ${res.tenantEmail}`)}
                                  className="px-3.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg font-bold text-[10px] uppercase tracking-wider active:scale-95 transition cursor-pointer"
                                >
                                  Receipt
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {approvedReservations.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-neutral-400 font-bold">
                              No active approved tenants. Approve a reservation request to populate your list.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Properties Tab Content */}
            {activeTab === 'properties' && (
              <div className="flex flex-col gap-6 mb-16 text-left">
                <div className="flex justify-between items-center mb-1 px-1">
                  <h3 className="text-xl font-bold text-neutral-900">Manage Properties</h3>
                  <button 
                    onClick={() => setIsCreateListingOpen(true)}
                    className="px-5 py-2 bg-[#17294F] hover:bg-[#1e3466] text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer"
                  >
                    + Add Property
                  </button>
                </div>
                
                {loadingListings ? (
                  <div className="text-center py-10 font-bold text-neutral-400 flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Loading listings...</div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 flex flex-col lg:flex-row gap-4 md:gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 w-full">
                        <img 
                          src={listing.image} 
                          alt={listing.title} 
                          className="w-full lg:w-[280px] aspect-[4/3] lg:aspect-auto h-auto lg:h-[180px] object-cover rounded-xl shrink-0" 
                        />
                        <div className="flex-1 flex flex-col justify-between py-1 px-1">
                          <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                              <h4 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">{listing.title}</h4>
                              <span className="bg-[#4E4F50] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                Active Listing
                              </span>
                            </div>
                            <p className="text-neutral-500 text-xs mb-3 flex items-center gap-0.5"><MapPin size={14} className="text-blue-500" /> {listing.location}</p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-neutral-50 pt-3 mt-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-black">₱{listing.price.toLocaleString()}</span>
                              <span className="text-[10px] text-neutral-400 font-bold">/month</span>
                            </div>
                            <div className="flex gap-2.5 w-full sm:w-auto">
                              <button 
                                onClick={() => navigate(`/listing/${listing.id}`)}
                                className="flex-1 sm:flex-none px-5 py-2.5 border border-neutral-300 text-neutral-600 rounded-xl text-xs font-bold hover:bg-neutral-50 transition cursor-pointer"
                              >
                                Preview
                              </button>
                              <button 
                                onClick={() => setEditingListing(listing)}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#17294F] hover:bg-[#1e3466] text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {myListings.length === 0 && (
                      <div className="text-center py-20 text-neutral-500 bg-white rounded-3xl border border-neutral-100">
                        You have no properties listed. Click "+ Add Property" to publish your first listing.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* --- TENANT REGULAR LIST VIEW --- */
          <div className="flex flex-col gap-6 mb-16 mt-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-1 px-1 text-left">My Active Bookings</h3>
            {reservations.map((res) => (
              <div key={res.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 flex flex-col lg:flex-row gap-4 md:gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 w-full text-left">
                <div 
                  className="w-full lg:w-[380px] aspect-[4/3] lg:aspect-auto h-auto lg:h-[260px] relative overflow-hidden rounded-2xl md:rounded-[1.5rem] group cursor-zoom-in shrink-0" 
                  onClick={() => handleOpenGallery(null, res.listingImage)}
                >
                  <img 
                    src={res.listingImage} 
                    alt={res.listingTitle} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1 px-1 md:py-2 md:px-2 md:pr-4">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 md:gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-2xl font-bold text-neutral-900 tracking-tight leading-tight truncate">{res.listingTitle}</h3>
                        <p className="text-[10px] text-neutral-400 font-extrabold uppercase mt-1 tracking-wider">{res.roomName}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] md:text-xs font-black px-3 py-1 md:px-3.5 md:py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm",
                        res.status === 'Active' ? "bg-blue-100 text-blue-700" :
                        res.status === 'Approved' ? "bg-green-100 text-green-700" :
                        res.status === 'Denied' ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-500"
                      )}>
                        {res.status === 'Active' ? 'Pending Approval' : res.status}
                      </span>
                    </div>
                    
                    <p className="text-neutral-500 text-xs md:text-sm mb-3 md:mb-4 flex items-center gap-1">
                      <MapPin size={14} className="shrink-0 text-blue-500" /> {res.listingLocation}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-600">
                      <div className="flex items-center gap-1 bg-white border border-neutral-100 px-3 py-1 rounded-full shadow-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-neutral-800">5.00</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
                        <CalendarIcon size={12} className="text-[#17294F]" />
                        <span>Move-in: <span className="text-neutral-900 font-bold">{res.moveInDate}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-8 md:mt-0 pt-4 border-t border-neutral-50">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-[28px] font-black text-black">₱{res.price.toLocaleString()}</span>
                        <span className="text-sm md:text-base font-medium text-neutral-500">/month</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                      {(res.status === 'Active' || res.status === 'Approved') ? (
                        <>
                          <button 
                            onClick={() => handleCancelReservation(res.id)}
                            className="flex-1 md:flex-none px-6 py-3 border-[1.5px] border-red-200 text-red-500 rounded-full font-bold hover:bg-red-50 transition active:scale-95 text-xs md:text-sm whitespace-nowrap cursor-pointer"
                          >
                            Cancel Reservation
                          </button>
                          <button 
                            onClick={() => handleContactLandlord(res.landlordId, res.listingTitle)}
                            className="flex-1 md:flex-none px-8 py-3 bg-[#17294F] text-white rounded-full font-bold hover:bg-[#1e3466] shadow-lg shadow-[#17294F]/20 transition active:scale-95 text-xs md:text-sm whitespace-nowrap cursor-pointer animate-none"
                          >
                            Contact Landlord
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider py-2">
                          Reservation {res.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {reservations.length === 0 && (
              <div className="text-center py-20 text-neutral-500 bg-white rounded-3xl border border-neutral-100 shadow-sm w-full">
                <p className="text-sm font-bold">No reservations found.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 px-6 py-2 bg-[#17294F] text-white rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Explore properties
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings & Preferences Section */}
        <div id="settings-section" className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100 mb-16">
          <div className="flex flex-col gap-6 md:gap-7 my-2 pl-2">

            {/* Landlord Toggle */}
            <div className="flex items-center justify-between w-full group cursor-pointer" onClick={async () => {
              if (hasLandlordAccount) {
                if (isLandlord) {
                  await signOut();
                  setIsLandlord(false);
                  localStorage.setItem('khubo_is_landlord', 'false');
                  localStorage.removeItem('khubo_landlord_registered');
                  showToast("Logged out of Landlord account. Switched to Tenant mode.");
                  navigate('/', { replace: true });
                } else {
                  setIsLandlord(true);
                  localStorage.setItem('khubo_is_landlord', 'true');
                  showToast("Switched to Landlord mode.");
                }
              } else {
                setShowSignupModal(true);
              }
            }}>
              <div className="flex items-center gap-5">
                <div className={`transition-colors duration-200 ${isLandlord ? 'text-[#2252D6]' : 'text-neutral-800 group-hover:text-[#2252D6]'}`}>
                  <Building className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className={`text-lg font-medium transition-colors duration-200 ${isLandlord ? 'text-neutral-950' : 'text-neutral-800 group-hover:text-neutral-950'}`}>
                  Landlord Mode
                </span>
              </div>
              
              {/* Toggle Switch */}
              <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isLandlord ? 'bg-[#2252D6]' : 'bg-neutral-300'}`}>
                <motion.div 
                  className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                  animate={{ x: isLandlord ? 24 : 0 }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                >
                  {isLandlord && <Check className="w-3 h-3 text-[#2252D6]" strokeWidth={3} />}
                </motion.div>
              </div>
            </div>
            
            {/* Notifications, Account, Language, Help */}
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={item.action}
                className="flex items-center gap-5 text-left w-full group cursor-pointer"
              >
                <div className="text-neutral-800 group-hover:text-[#2252D6] transition-colors duration-200">
                  <item.icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-lg font-medium text-neutral-800 group-hover:text-neutral-950 transition-colors duration-200">
                  {item.title}
                </span>
              </button>
            ))}

            {/* Separator before Log out */}
            <div className="h-px bg-neutral-100 my-2" />

            {/* Log out */}
            <button 
              onClick={async () => {
                await signOut();
                localStorage.removeItem('khubo_landlord_registered');
                localStorage.removeItem('khubo_is_landlord');
                showToast("Logged out successfully");
              }}
              className="flex items-center gap-5 text-left w-full group cursor-pointer"
            >
              <div className="text-red-500 group-hover:text-red-600 transition-colors duration-200">
                <LogOut className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-lg font-semibold text-red-500 group-hover:text-red-600 transition-colors duration-200">
                Log out
              </span>
            </button>

          </div>
        </div>

      </div>
      
      <BottomNav />

      {/* Landlord Sign Up Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setShowSignupModal(false)}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10"
          >
            <div className="flex items-center justify-center p-4 border-b border-neutral-100 relative">
               <button 
                 onClick={() => setShowSignupModal(false)}
                 className="absolute left-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
               >
                 <X size={20} />
               </button>
               <h2 className="font-bold text-lg">{isLandlordLogin ? 'Log in' : 'Sign up'}</h2>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-6 text-[#17294F]">Welcome to Khubo Landlords</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSignupAsLandlord(); }} className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                   <input 
                     type="email" 
                     placeholder="Email" 
                     value={landlordEmail}
                     onChange={(e) => setLandlordEmail(e.target.value)}
                     required
                     className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] focus:border-transparent transition-all"
                   />
                   <div className="relative">
                     <input 
                       type={showLandlordPassword ? "text" : "password"} 
                       placeholder="Password"
                       value={landlordPassword}
                       onChange={(e) => setLandlordPassword(e.target.value)}
                       required
                       minLength={6}
                       className="w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] focus:border-transparent transition-all"
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowLandlordPassword(!showLandlordPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                     >
                       {showLandlordPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                   </div>
                 </div>
                 <button 
                   type="submit"
                   disabled={isSigningUp}
                   className="w-full bg-[#17294F] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest mt-2 hover:bg-[#1e3466] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
                 >
                   {isSigningUp ? 'Processing...' : (isLandlordLogin ? 'Log-in' : 'Sign-up')}
                 </button>
              </form>
              
              <div className="flex items-center gap-4 my-6">
                <div className="h-[1px] bg-neutral-200 flex-1"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">or</span>
                <div className="h-[1px] bg-neutral-200 flex-1"></div>
              </div>
  
              <div className="flex flex-col gap-3">
                <button 
                   type="button"
                   className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors font-medium text-neutral-800"
                >
                  <Globe size={20} />
                  Continue with Google
                </button>
              </div>
            </div>
            <div className="bg-neutral-50 p-6 border-t border-neutral-100 flex items-center justify-center gap-2 text-sm text-neutral-600">
              {isLandlordLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                 type="button"
                 onClick={() => setIsLandlordLogin(!isLandlordLogin)}
                 className="font-bold text-[#17294F] hover:underline"
              >
                {isLandlordLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editingListing && (
        <EditListingModal 
          isOpen={true} 
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={() => {
            fetchMyListings();
            setEditingListing(null);
          }}
        />
      )}

      {isCreateListingOpen && (
        <CreateListingModal
          isOpen={isCreateListingOpen}
          onClose={() => setIsCreateListingOpen(false)}
          onSuccess={() => {
            fetchMyListings();
            setIsCreateListingOpen(false);
          }}
        />
      )}

      {/* Stat Card Modal */}
      {selectedStatModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setSelectedStatModal(null)}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
               <h2 className="text-xl font-bold text-neutral-900">{selectedStatModal}</h2>
               <button 
                 onClick={() => setSelectedStatModal(null)}
                 className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
               >
                 <X size={20} />
               </button>
            </div>
            <div className="p-6 h-[400px] overflow-y-auto">
              {selectedStatModal === 'Saved' && (
                loadingSaved ? (
                  <div className="flex items-center justify-center h-full text-neutral-400 font-bold gap-2">
                    <Loader2 className="animate-spin" size={18} /> Loading saved listings...
                  </div>
                ) : savedListings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                       <Heart className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold">No saved listings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedListings.map(listing => (
                      <div 
                        key={listing.id} 
                        onClick={() => {
                          setSelectedStatModal(null);
                          navigate(`/listing/${listing.id}`);
                        }}
                        className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-100 rounded-2xl cursor-pointer transition text-left"
                      >
                        <img 
                          src={listing.image} 
                          alt={listing.title} 
                          className="w-14 h-14 object-cover rounded-xl shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-neutral-900 text-sm truncate">{listing.title}</h4>
                          <p className="text-xs text-neutral-500 truncate">{listing.location}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-black text-black text-xs">₱{listing.price.toLocaleString()}/mo</span>
                            <span className="text-[10px] text-neutral-400 font-bold">★ {listing.rating || '5.0'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {selectedStatModal === 'Reservation' && (
                reservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                       <CalendarIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold">No reservations found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map(res => (
                      <div 
                        key={res.id} 
                        className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-left"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-neutral-900 text-sm">{res.listingTitle}</h4>
                            <p className="text-[10px] text-neutral-400 font-extrabold uppercase mt-0.5">{res.roomName}</p>
                          </div>
                          <span className={cn(
                            "text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                            res.status === 'Active' ? "bg-blue-100 text-blue-700" :
                            res.status === 'Approved' ? "bg-green-100 text-green-700" :
                            res.status === 'Denied' ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-500"
                          )}>
                            {res.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end text-xs mt-3 border-t border-neutral-100/50 pt-2">
                          <div>
                            <p className="text-neutral-500 font-medium">Move-in: <span className="font-bold text-neutral-800">{res.moveInDate}</span></p>
                            <p className="font-black text-black mt-0.5">₱{res.price.toLocaleString()}/mo</p>
                          </div>
                          {(res.status === 'Active' || res.status === 'Approved') && (
                            <button 
                              onClick={() => handleContactLandlord(res.landlordId, res.listingTitle)}
                              className="px-3.5 py-1.5 bg-[#17294F] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider active:scale-95 transition cursor-pointer"
                            >
                              Contact
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {selectedStatModal === 'Roommate' && (
                loadingRoommates ? (
                  <div className="flex items-center justify-center h-full text-neutral-400 font-bold gap-2">
                    <Loader2 className="animate-spin" size={18} /> Loading roommates info...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* My Roommate Profile Posts */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3 text-left">My Roommate Profile Posts</h3>
                      {myRoommatePosts.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic bg-neutral-50/50 p-3 rounded-xl border border-neutral-100 text-left">You haven't posted a roommate profile yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {myRoommatePosts.map(post => (
                            <div key={post.id} className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-left">
                              <img src={post.image} alt={post.name} className="w-10 h-10 rounded-full object-cover" />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-neutral-900 text-sm truncate">{post.name}</h4>
                                <p className="text-xs text-neutral-500 truncate">Prefers: {post.preferredPlace}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setSelectedStatModal(null);
                                  navigate('/roommate'); // Navigate to roommate finder
                                }}
                                className="px-3 py-1 bg-[#17294F] text-white text-[10px] font-bold rounded-lg uppercase transition cursor-pointer"
                              >
                                View Feed
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Applications Sent */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3 text-left">Applications Sent</h3>
                      {sentRoommateConvs.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic bg-neutral-50/50 p-3 rounded-xl border border-neutral-100 text-left">No active roommate applications sent.</p>
                      ) : (
                        <div className="space-y-3">
                          {sentRoommateConvs.map(conv => (
                            <div key={conv.id} className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-left">
                              <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-neutral-900 text-sm truncate">{conv.name}</h4>
                                <p className="text-xs text-neutral-500 truncate italic">"{conv.lastMessage}"</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setSelectedStatModal(null);
                                  navigate('/messages');
                                }}
                                className="px-3 py-1 bg-[#17294F] text-white text-[10px] font-bold rounded-lg uppercase transition cursor-pointer"
                              >
                                Chat
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {selectedStatModal === 'Invitation' && (
                loadingRoommates ? (
                  <div className="flex items-center justify-center h-full text-neutral-400 font-bold gap-2">
                    <Loader2 className="animate-spin" size={18} /> Loading invitations...
                  </div>
                ) : receivedRoommateConvs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                       <Users className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold">No invitations received.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedRoommateConvs.map(conv => (
                      <div key={conv.id} className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={conv.avatar} alt={conv.name} className="w-11 h-11 rounded-full object-cover border border-neutral-200" />
                          <div>
                            <h4 className="font-bold text-neutral-900 text-sm">{conv.name}</h4>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#2252D6] bg-[#2252D6]/10 px-2 py-0.5 rounded">Roommate Application</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600 bg-white border border-neutral-100/50 p-3 rounded-xl mb-3 italic">
                          "{conv.lastMessage}"
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedStatModal(null);
                              navigate(`/roommate?search=${encodeURIComponent(conv.name)}`);
                            }}
                            className="px-3 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 transition cursor-pointer"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedStatModal(null);
                              navigate('/messages');
                            }}
                            className="px-3 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 transition cursor-pointer"
                          >
                            Chat
                          </button>
                          {conv.status !== 'accepted' ? (
                            <button 
                              onClick={() => handleAcceptRoommateInvitation(conv)}
                              className="flex-1 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-green-700 transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Accept Request
                            </button>
                          ) : (
                            <span className="flex-1 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center">
                              Matched 🎉
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      <AnimatePresence>
        {selectedReservationDetail && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedReservationDetail(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl z-10 text-neutral-900"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                 <div className="text-left">
                   <h2 className="text-lg font-black text-[#17294F] uppercase tracking-wide">Reservation Details</h2>
                   <p className="text-[10px] text-neutral-400 font-bold tracking-widest mt-0.5">{selectedReservationDetail.id}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedReservationDetail(null)}
                   className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                 >
                   <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 h-[380px] overflow-y-auto space-y-5 text-left">
                {/* Tenant Profile */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black uppercase text-[#17294F] tracking-widest mb-2.5">Tenant Profile</h4>
                  <div className="space-y-2 text-xs font-semibold text-neutral-700">
                    <div className="flex justify-between"><span>Name:</span><span className="font-extrabold text-neutral-950">{selectedReservationDetail.tenantName}</span></div>
                    <div className="flex justify-between"><span>Email:</span><span>{selectedReservationDetail.tenantEmail}</span></div>
                    <div className="flex justify-between"><span>Phone:</span><span>{selectedReservationDetail.tenantPhone}</span></div>
                    <div className="flex justify-between"><span>Age / Gender:</span><span>{selectedReservationDetail.tenantAge} yrs / {selectedReservationDetail.tenantGender || 'Female'}</span></div>
                    <div className="flex justify-between"><span>ID / Student ID:</span><span className="font-mono">{selectedReservationDetail.tenantStudentId}</span></div>
                  </div>
                </div>

                {/* Booking & Rent Details */}
                <div className="border border-neutral-200 rounded-2xl p-4 space-y-2.5 text-xs font-semibold text-neutral-700 bg-neutral-50">
                  <h4 className="text-[10px] font-black uppercase text-[#17294F] tracking-widest mb-1">Rent Details</h4>
                  <div className="flex justify-between"><span>Property:</span><span className="font-bold text-neutral-950 truncate max-w-[180px]">{selectedReservationDetail.listingTitle}</span></div>
                  <div className="flex justify-between"><span>Room Layout:</span><span className="text-[#17294F] font-bold">{selectedReservationDetail.roomName}</span></div>
                  <div className="flex justify-between"><span>Move-in Date:</span><span className="font-bold text-neutral-950">{selectedReservationDetail.moveInDate}</span></div>
                  <div className="flex justify-between"><span>Monthly Rent:</span><span className="font-black text-neutral-950">₱{selectedReservationDetail.price.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Holding Deposit:</span><span className="text-green-600 font-extrabold">₱1,000 Paid (Authorized)</span></div>
                  <div className="flex justify-between"><span>Contract Terms:</span><span>6 Months Minimum</span></div>
                </div>

                {/* Digital Signature */}
                <div className="border border-dashed border-neutral-300 rounded-2xl p-4 text-xs font-semibold text-neutral-700 bg-neutral-50">
                  <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1.5">E-Agreement Signature</h4>
                  <div className="flex flex-col gap-1 text-center bg-white p-3 rounded-lg border border-neutral-200">
                    <span className="font-display font-extrabold text-[#17294F] text-base italic tracking-wide select-none">
                      {selectedReservationDetail.signatureText || selectedReservationDetail.tenantName}
                    </span>
                    <span className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest">Digitally Signed & Secured</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex gap-3">
                {selectedReservationDetail.status === 'Active' && (
                  <>
                    <button
                      onClick={() => {
                        handleDenyReservation(selectedReservationDetail.id);
                        setSelectedReservationDetail(null);
                      }}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-red-500/10 cursor-pointer"
                    >
                      Deny Request
                    </button>
                    <button
                      onClick={() => {
                        handleAcceptReservation(selectedReservationDetail.id);
                        setSelectedReservationDetail(null);
                      }}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-green-500/10 cursor-pointer"
                    >
                      Accept Tenant
                    </button>
                  </>
                )}
                {selectedReservationDetail.status === 'Approved' && (
                  <div className="w-full text-center text-green-700 bg-green-50 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-green-200">
                    Tenant Approved & Active
                  </div>
                )}
                {selectedReservationDetail.status === 'Denied' && (
                  <div className="w-full text-center text-red-600 bg-red-50 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-red-200">
                    Tenant Request Denied
                  </div>
                )}
                {selectedReservationDetail.status === 'Cancelled' && (
                  <div className="w-full text-center text-neutral-500 bg-neutral-100 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-neutral-200">
                    Cancelled by Tenant
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PhotoCarouselOverlay 
        isOpen={isPhotoGalleryOpen}
        images={galleryImages}
        initialIndex={0}
        onClose={() => setIsPhotoGalleryOpen(false)}
      />
    </div>
  );
}
