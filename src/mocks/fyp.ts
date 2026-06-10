export interface FYPVideo {
  id: string;
  videoUrl: string;
  username: string;
  avatar: string;
  description: string;
  likes: number;
  commentsCount: number;
  shares: number;
  saves: number;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingLocation: string;
  comments: {
    id: string;
    username: string;
    avatar: string;
    text: string;
    time: string;
  }[];
}

export const FYP_VIDEOS: FYPVideo[] = [
  {
    id: 'v1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-apartment-40455-large.mp4',
    username: 'kayla_residences',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    description: 'Tour of our Premium Solo Room! ✨ Private bath, high speed Wi-Fi, and 24/7 security. Perfect for MSU-IIT students. Dm for inquiries! #dormlife #college #roomtour',
    likes: 1240,
    commentsCount: 45,
    shares: 89,
    saves: 342,
    listingId: 'k2',
    listingTitle: "Kayla's Residences & Dormitory",
    listingPrice: 6000,
    listingLocation: 'Tibanga, Iligan City',
    comments: [
      { id: 'c1', username: 'andrea_c', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea67', text: 'Is this room still available for next semester?', time: '2h ago' },
      { id: 'c2', username: 'irvin_l', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Irvin99', text: 'Highly recommend this place, super quiet and safe!', time: '5h ago' },
      { id: 'c3', username: 'student_iit', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student', text: 'How far is this from the main gate?', time: '1d ago' }
    ]
  },
  {
    id: 'v2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-loft-apartment-interior-41551-large.mp4',
    username: 'executive_suites',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    description: 'Looking for luxury on a budget? Check out the Executive Solo Suite. Fully airconditioned, private balcony, heated shower. 💎 #aesthetic #roomdecor #apartmentliving',
    likes: 852,
    commentsCount: 28,
    shares: 42,
    saves: 198,
    listingId: 'k5',
    listingTitle: 'Executive Solo Suite',
    listingPrice: 8500,
    listingLocation: 'Mahayahay, Iligan City',
    comments: [
      { id: 'c4', username: 'rich_kid', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rich', text: 'Perfect room layout!', time: '1h ago' },
      { id: 'c5', username: 'mark_s', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarkSantos', text: 'Does the price include water and electricity?', time: '3h ago' }
    ]
  },
  {
    id: 'v3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cozy-living-room-with-a-christmas-tree-41716-large.mp4',
    username: 'yhuzuong_dorms',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    description: 'Shared room layout tour! 🛌 Walking distance to MSU-IIT. Free drinking water and fast study area wifi. Find a roommate and apply! #collegelife #roommatefinder #dormitory',
    likes: 934,
    commentsCount: 37,
    shares: 61,
    saves: 215,
    listingId: 'k1',
    listingTitle: 'Yhuzuong’s Dormitory',
    listingPrice: 5000,
    listingLocation: 'Pala-o, Iligan City',
    comments: [
      { id: 'c6', username: 'sophia_r', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SophiaReyes', text: 'Looking for a roommate here! CS major pref.', time: '12m ago' },
      { id: 'c7', username: 'elena_g', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaGomez', text: 'Super friendly landlord as well.', time: '4h ago' }
    ]
  }
];
