// Type definitions only - all data now fetched from API

export interface Job {
  id?: string;
  _id?: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  salary?: string;
  equity?: string;
  postedDate?: string;
  createdAt?: string;
  tags: string[];
  isRemote: boolean;
  applicants?: number;
  description?: string;
  requirements?: string;
  benefits?: string[];
  status?: string;
  companyInfo?: {
    size: string;
    founded: string;
    funding: string;
    website: string;
    about?: string;
  };
}

export interface Founder {
  _id?: string;
  name: string;
  bio: string;
  location: string;
  previousStartup: string;
  skills: string[];
  openToConnect: boolean;
  avatar?: string;
  linkedIn?: string;
  twitter?: string;
}

export interface Investor {
  _id?: string;
  name: string;
  type: string;
  focus: string;
  stage: string;
  checkSize: string;
  location: string;
  description: string;
  website?: string;
  email?: string;
  investments?: Array<{
    company: string;
    amount: string;
    year: string;
  }>;
}

export interface Story {
  _id?: string;
  title: string;
  excerpt: string;
  content?: string;
  author: {
    userId?: string;
    name: string;
    role: string;
  };
  readTime: number;
  category: string;
  trending?: boolean;
  published?: boolean;
  createdAt?: string;
}

export interface Post {
  _id?: string;
  id?: string;
  author: {
    _id?: string;
    name: string;
    title?: string;
    avatar?: string;
    userId?: string;
  };
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  fundingAmount?: string;
  fundingStage?: string;
  investors?: string;
  coverImage?: string;
  timestamp?: string;
  createdAt?: string;
  tags: string[];
  stats?: {
    likes: number;
    comments: number;
    shares: number;
  };
  likes?: string[];
  comments?: any[];
  published?: boolean;
  trending?: boolean;
  poll?: {
    question: string;
    options: Array<{
      text: string;
      votes: number;
    }>;
    totalVotes: number;
  };
}

export interface Comment {
  _id?: string;
  id?: number;
  author: {
    _id?: string;
    name: string;
    title?: string;
    avatar?: string;
  };
  content: string;
  comment?: string;
  timestamp?: string;
  createdAt?: string;
  likes?: number;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  userType: string;
  avatar?: string;
  bio?: string;
  company?: string;
  location?: string;
  verified?: boolean;
  skills?: Array<{ name: string; endorsements?: number }>;
  experiences?: Array<{
    _id?: string;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  education?: Array<{
    _id?: string;
    school: string;
    degree: string;
    field: string;
    startYear: string;
    endYear?: string;
  }>;
  startupJourneys?: Array<{
    _id?: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
}

export interface Connection {
  _id?: string;
  requester?: User;
  recipient?: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}

export interface Notification {
  _id?: string;
  type: string;
  actor?: {
    _id?: string;
    name: string;
    avatar?: string;
  };
  message: string;
  read: boolean;
  createdAt?: string;
  relatedEntity?: {
    type: string;
    id: string;
  };
}

export interface Message {
  _id?: string;
  sender: {
    _id?: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt?: string;
  read?: boolean;
}

export interface Conversation {
  _id?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt?: string;
}
