const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Post = require('./models/Post');
const Job = require('./models/Job');
const Story = require('./models/Story');
const Founder = require('./models/Founder');
const Investor = require('./models/Investor');
const Asset = require('./models/Asset');
const FailureReport = require('./models/FailureReport');
const WarRoom = require('./models/WarRoom');

// Comprehensive sample users - 8 users total
const users = [
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    password: 'Password123!',
    userType: 'founder',
    bio: 'Serial entrepreneur with 3 exits. Building the future of fintech after learning from 2 failed startups. Passionate about helping founders avoid my mistakes.',
    headline: 'Startup Founder | Fintech Innovator | 2x Failed, Now Thriving',
    company: 'FinTech Innovations',
    location: 'San Francisco, CA',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    website: 'https://sarahchen.dev',
    linkedIn: 'https://linkedin.com/in/sarahchen',
    twitter: 'https://twitter.com/sarahchen',
    skills: [
      { name: 'Product Management', endorsements: 45 },
      { name: 'Fundraising', endorsements: 32 },
      { name: 'Team Building', endorsements: 28 },
      { name: 'Fintech', endorsements: 38 },
      { name: 'Strategic Planning', endorsements: 25 }
    ],
    experiences: [
      { title: 'CEO & Co-Founder', company: 'FinTech Innovations', period: '2023 - Present', description: 'Building next-gen payment infrastructure for startups. Raised $5M Series A. Team of 25.' },
      { title: 'Founder & CEO', company: 'PayFlow (Failed)', period: '2020 - 2022', description: 'Built B2B payment solution. Raised $2M seed. Shut down due to market timing and co-founder conflict.' },
      { title: 'Product Manager', company: 'Stripe', period: '2018 - 2020', description: 'Led payment integration products. Managed team of 8 engineers.' }
    ],
    education: [
      { school: 'Stanford University', degree: 'MBA, Entrepreneurship', period: '2016 - 2018' },
      { school: 'UC Berkeley', degree: 'BS Computer Science', period: '2012 - 2016' }
    ],
    startupJourneys: [
      { name: 'FinTech Innovations', role: 'CEO', status: 'active', period: '2023 - Present', description: 'Payment infrastructure for startups. $5M raised, 25 employees.', color: 'green' },
      { name: 'PayFlow', role: 'Founder', status: 'closed', period: '2020 - 2022', description: 'B2B payments platform. Shut down after 18 months due to market timing.', lesson: 'Timing is everything. Validate market readiness before building.', color: 'red' }
    ],
    achievements: [
      { title: 'Forbes 30 Under 30', year: '2023', icon: 'trophy' },
      { title: 'TechCrunch Disrupt Finalist', year: '2023', icon: 'award' }
    ]
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    password: 'Password123!',
    userType: 'investor',
    bio: 'Angel investor focused on early-stage SaaS startups. Former founder of 2 companies (1 exit, 1 failure). I invest in resilient founders who have learned from setbacks.',
    headline: 'Angel Investor | Ex-Founder | Backing Resilient Founders',
    company: 'Rodriguez Ventures',
    location: 'New York, NY',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    website: 'https://rodriguezventures.com',
    linkedIn: 'https://linkedin.com/in/michaelrodriguez',
    twitter: 'https://twitter.com/mrodriguezvc',
    skills: [
      { name: 'Angel Investing', endorsements: 52 },
      { name: 'Due Diligence', endorsements: 41 },
      { name: 'Startup Strategy', endorsements: 38 },
      { name: 'SaaS Metrics', endorsements: 35 },
      { name: 'Board Governance', endorsements: 29 }
    ],
    experiences: [
      { title: 'Managing Partner', company: 'Rodriguez Ventures', period: '2021 - Present', description: 'Angel fund investing in pre-seed and seed stage startups. 23 portfolio companies, 4 exits.' },
      { title: 'Founder & CEO', company: 'DataSync (Acquired)', period: '2015 - 2020', description: 'Built and sold data analytics platform to Salesforce for $45M. Grew to 80 employees.' },
      { title: 'Co-Founder', company: 'CloudMetrics (Failed)', period: '2012 - 2014', description: 'Cloud monitoring startup. Failed due to inability to find product-market fit.' }
    ],
    education: [
      { school: 'Harvard Business School', degree: 'MBA', period: '2010 - 2012' },
      { school: 'MIT', degree: 'BS Electrical Engineering', period: '2006 - 2010' }
    ],
    startupJourneys: [
      { name: 'Rodriguez Ventures', role: 'Managing Partner', status: 'active', period: '2021 - Present', description: 'Angel fund with $10M AUM. Focus on SaaS and Fintech.', color: 'green' },
      { name: 'DataSync', role: 'Founder & CEO', status: 'acquired', period: '2015 - 2020', description: 'Acquired by Salesforce for $45M.', color: 'blue' },
      { name: 'CloudMetrics', role: 'Co-Founder', status: 'closed', period: '2012 - 2014', description: 'Pivoted 3 times, eventually ran out of runway.', lesson: 'Find PMF before scaling. Pivot faster.', color: 'red' }
    ],
    achievements: [
      { title: 'Successful Exit to Salesforce', year: '2020', icon: 'dollar' },
      { title: 'Angel Investor of the Year - NYC', year: '2023', icon: 'trophy' }
    ]
  },
  {
    name: 'Emma Watson',
    email: 'emma@example.com',
    password: 'Password123!',
    userType: 'job-seeker',
    bio: 'Full-stack developer with 6 years experience. Previously worked at 2 startups (both failed, learned a lot). Looking for my next adventure at an early-stage company.',
    headline: 'Full-Stack Developer | React & Node.js | Startup Survivor',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    website: 'https://emmawatson.dev',
    linkedIn: 'https://linkedin.com/in/emmawatsondev',
    github: 'https://github.com/emmawatsondev',
    skills: [
      { name: 'React', endorsements: 28 },
      { name: 'Node.js', endorsements: 25 },
      { name: 'MongoDB', endorsements: 22 },
      { name: 'TypeScript', endorsements: 20 },
      { name: 'AWS', endorsements: 18 },
      { name: 'PostgreSQL', endorsements: 15 },
      { name: 'GraphQL', endorsements: 12 }
    ],
    experiences: [
      { title: 'Senior Full-Stack Developer', company: 'TechStartup (Failed)', period: '2021 - 2023', description: 'Built core platform from scratch. Led team of 4 engineers. Company shut down due to funding issues.' },
      { title: 'Software Engineer', company: 'HealthTrack (Failed)', period: '2019 - 2021', description: 'Healthcare tech startup. Built patient management system. Failed due to regulatory challenges.' },
      { title: 'Junior Developer', company: 'WebAgency Pro', period: '2017 - 2019', description: 'Built web applications for various clients. Learned React and Node.js.' }
    ],
    education: [
      { school: 'University of Texas at Austin', degree: 'BS Computer Science', period: '2013 - 2017' }
    ],
    startupJourneys: [],
    achievements: [
      { title: 'Open Source Contributor - 500+ commits', year: '2023', icon: 'code' }
    ]
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: 'Password123!',
    userType: 'founder',
    bio: 'First-time founder building in the AI/ML space. Previously lead engineer at Google. Left to pursue my startup dream after seeing too many good ideas die in big companies.',
    headline: 'AI Founder | Ex-Google Staff Engineer | Building the Future',
    company: 'AI Innovations Inc',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    website: 'https://aiinnovations.io',
    linkedIn: 'https://linkedin.com/in/davidkim',
    twitter: 'https://twitter.com/davidkim_ai',
    skills: [
      { name: 'Machine Learning', endorsements: 55 },
      { name: 'Python', endorsements: 48 },
      { name: 'AI Architecture', endorsements: 42 },
      { name: 'Technical Leadership', endorsements: 35 },
      { name: 'TensorFlow', endorsements: 40 },
      { name: 'PyTorch', endorsements: 38 }
    ],
    experiences: [
      { title: 'Founder & CTO', company: 'AI Innovations Inc', period: '2023 - Present', description: 'Building AI-powered business automation. Pre-seed stage, team of 5.' },
      { title: 'Founder', company: 'SmartAssist (Failed)', period: '2022 - 2023', description: 'Consumer AI assistant app. Got 50K users but failed to monetize. Shut down after 14 months.' },
      { title: 'Staff Engineer', company: 'Google', period: '2018 - 2022', description: 'Led ML infrastructure team. Managed 12 engineers. Built systems processing 1B+ requests/day.' },
      { title: 'Senior ML Engineer', company: 'Google', period: '2015 - 2018', description: 'Worked on Google Assistant ML models.' }
    ],
    education: [
      { school: 'Stanford University', degree: 'MS Computer Science, AI Specialization', period: '2013 - 2015' },
      { school: 'Carnegie Mellon University', degree: 'BS Computer Science', period: '2009 - 2013' }
    ],
    startupJourneys: [
      { name: 'AI Innovations Inc', role: 'Founder & CTO', status: 'active', period: '2023 - Present', description: 'AI-powered business automation for SMBs.', color: 'green' },
      { name: 'SmartAssist', role: 'Founder', status: 'closed', period: '2022 - 2023', description: 'Consumer AI app. Failed to find sustainable business model.', lesson: 'B2C is hard. Focus on B2B for clearer monetization.', color: 'red' }
    ],
    achievements: [
      { title: 'Google Peer Bonus Award', year: '2021', icon: 'star' },
      { title: 'Patent: ML Inference Optimization', year: '2020', icon: 'award' }
    ]
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa@example.com',
    password: 'Password123!',
    userType: 'mentor',
    bio: '20 years in tech. Built and sold 3 companies. Now helping the next generation of founders avoid common pitfalls. Specialize in B2B SaaS and marketplace businesses.',
    headline: 'Startup Mentor | 3x Exited Founder | Helping Founders Succeed',
    company: 'Thompson Advisory',
    location: 'Boston, MA',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
    website: 'https://lisathompson.com',
    linkedIn: 'https://linkedin.com/in/lisathompson',
    twitter: 'https://twitter.com/lisathompson',
    skills: [
      { name: 'Mentorship', endorsements: 78 },
      { name: 'M&A', endorsements: 45 },
      { name: 'Scaling Startups', endorsements: 62 },
      { name: 'Board Advisory', endorsements: 38 },
      { name: 'Go-to-Market Strategy', endorsements: 55 },
      { name: 'Executive Coaching', endorsements: 42 }
    ],
    experiences: [
      { title: 'Founder & CEO', company: 'Thompson Advisory', period: '2020 - Present', description: 'Advising early-stage founders. 50+ companies mentored. Focus on B2B SaaS.' },
      { title: 'CEO', company: 'MarketHub (Acquired)', period: '2015 - 2020', description: 'B2B marketplace platform. Sold to Shopify for $120M. Grew to 200 employees.' },
      { title: 'Founder & CEO', company: 'SaaSMetrics (Acquired)', period: '2010 - 2015', description: 'Analytics for SaaS companies. Acquired by Mixpanel.' },
      { title: 'Co-Founder', company: 'TechConnect (Failed)', period: '2007 - 2009', description: 'Social network for professionals. Shut down, lessons learned about timing.' },
      { title: 'VP Engineering', company: 'Oracle', period: '2003 - 2007', description: 'Led cloud infrastructure team of 50 engineers.' }
    ],
    education: [
      { school: 'MIT Sloan School of Management', degree: 'MBA', period: '2001 - 2003' },
      { school: 'Cornell University', degree: 'BS Computer Science', period: '1997 - 2001' }
    ],
    startupJourneys: [
      { name: 'Thompson Advisory', role: 'Founder', status: 'active', period: '2020 - Present', description: 'Startup mentorship and advisory services.', color: 'green' },
      { name: 'MarketHub', role: 'CEO', status: 'acquired', period: '2015 - 2020', description: 'Acquired by Shopify for $120M.', color: 'blue' },
      { name: 'SaaSMetrics', role: 'Founder & CEO', status: 'acquired', period: '2010 - 2015', description: 'Acquired by Mixpanel.', color: 'blue' },
      { name: 'TechConnect', role: 'Co-Founder', status: 'closed', period: '2007 - 2009', description: 'Social network for professionals. Shut down.', lesson: 'LinkedIn was already dominating. Pick your battles.', color: 'red' }
    ],
    achievements: [
      { title: 'Inc. 500 Fastest Growing Companies', year: '2018', icon: 'trending' },
      { title: 'Boston Business Journal 40 Under 40', year: '2015', icon: 'trophy' },
      { title: 'Mentored 50+ Founders', year: '2024', icon: 'users' }
    ]
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    password: 'Password123!',
    userType: 'founder',
    bio: 'E-commerce entrepreneur. My first startup failed after burning through $1.5M. Learned hard lessons about unit economics. Now building a profitable D2C brand.',
    headline: 'E-commerce Founder | Failed Fast, Learning Faster | Profitability > Growth',
    company: 'EcoShop',
    location: 'Los Angeles, CA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    website: 'https://ecoshop.co',
    linkedIn: 'https://linkedin.com/in/jameswilson',
    twitter: 'https://twitter.com/jameswilson',
    skills: [
      { name: 'E-commerce', endorsements: 34 },
      { name: 'D2C Marketing', endorsements: 29 },
      { name: 'Supply Chain', endorsements: 22 },
      { name: 'Unit Economics', endorsements: 25 },
      { name: 'Shopify', endorsements: 20 },
      { name: 'Facebook Ads', endorsements: 18 }
    ],
    experiences: [
      { title: 'Founder & CEO', company: 'EcoShop', period: '2023 - Present', description: 'Sustainable e-commerce platform. $50K/month revenue, profitable from month 1. Team of 3.' },
      { title: 'CEO', company: 'FastShip (Failed)', period: '2020 - 2022', description: 'Same-day delivery startup. Raised $1.5M, burned through it in 18 months. Unit economics never worked.' },
      { title: 'Operations Manager', company: 'Amazon', period: '2017 - 2020', description: 'Managed fulfillment center operations. Led team of 150.' },
      { title: 'Supply Chain Analyst', company: 'Target', period: '2015 - 2017', description: 'Optimized inventory management systems.' }
    ],
    education: [
      { school: 'UCLA Anderson School of Management', degree: 'MBA', period: '2013 - 2015' },
      { school: 'USC', degree: 'BS Business Administration', period: '2009 - 2013' }
    ],
    startupJourneys: [
      { name: 'EcoShop', role: 'Founder & CEO', status: 'active', period: '2023 - Present', description: 'Sustainable products marketplace. Profitable, growing 20% MoM.', color: 'green' },
      { name: 'FastShip', role: 'CEO', status: 'closed', period: '2020 - 2022', description: 'Same-day delivery. Failed due to high burn rate and competition from Amazon.', lesson: 'Unit economics first. Growth without profit is just delayed failure.', color: 'red' }
    ],
    achievements: [
      { title: 'Profitable in Month 1', year: '2023', icon: 'dollar' }
    ]
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'Password123!',
    userType: 'investor',
    bio: 'Partner at Sunrise Ventures. We back founders who have experienced failure and grown from it. Focus on healthcare, fintech, and climate tech. Check size $500K-$3M.',
    headline: 'VC Partner | Backing Second-Time Founders | Healthcare + Climate + Fintech',
    company: 'Sunrise Ventures',
    location: 'Palo Alto, CA',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    website: 'https://sunriseventures.com',
    linkedIn: 'https://linkedin.com/in/priyapatel',
    twitter: 'https://twitter.com/priyapatel_vc',
    skills: [
      { name: 'Venture Capital', endorsements: 65 },
      { name: 'Healthcare Tech', endorsements: 48 },
      { name: 'Climate Tech', endorsements: 42 },
      { name: 'Fintech', endorsements: 38 },
      { name: 'Portfolio Management', endorsements: 35 },
      { name: 'Deal Sourcing', endorsements: 30 }
    ],
    experiences: [
      { title: 'Partner', company: 'Sunrise Ventures', period: '2021 - Present', description: 'Lead investments in healthcare, fintech, and climate tech. $150M fund. 23 portfolio companies.' },
      { title: 'Principal', company: 'Andreessen Horowitz', period: '2018 - 2021', description: 'Sourced and led 8 investments in healthcare tech. 2 unicorn outcomes.' },
      { title: 'Associate', company: 'Sequoia Capital', period: '2015 - 2018', description: 'Supported partners on fintech investments.' },
      { title: 'Investment Banking Analyst', company: 'Goldman Sachs', period: '2013 - 2015', description: 'Healthcare M&A advisory.' }
    ],
    education: [
      { school: 'Harvard Business School', degree: 'MBA', period: '2011 - 2013' },
      { school: 'University of Pennsylvania', degree: 'BS Economics, Wharton', period: '2007 - 2011' }
    ],
    startupJourneys: [
      { name: 'Sunrise Ventures', role: 'Partner', status: 'active', period: '2021 - Present', description: '$150M fund focused on second-time founders.', color: 'green' }
    ],
    achievements: [
      { title: 'Midas List Honorable Mention', year: '2023', icon: 'trophy' },
      { title: '2 Unicorn Investments', year: '2022', icon: 'star' }
    ]
  },
  {
    name: 'Alex Turner',
    email: 'alex@example.com',
    password: 'Password123!',
    userType: 'job-seeker',
    bio: 'Product designer with startup DNA. Survived 2 startup shutdowns, came out with thick skin and a killer portfolio. Looking for early-stage opportunities where design matters.',
    headline: 'Product Designer | Startup Veteran | Design Systems Expert',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    website: 'https://alexturner.design',
    linkedIn: 'https://linkedin.com/in/alexturnerdesign',
    github: 'https://dribbble.com/alexturner',
    skills: [
      { name: 'UI/UX Design', endorsements: 35 },
      { name: 'Figma', endorsements: 42 },
      { name: 'Design Systems', endorsements: 28 },
      { name: 'User Research', endorsements: 25 },
      { name: 'Prototyping', endorsements: 30 },
      { name: 'HTML/CSS', endorsements: 22 },
      { name: 'Webflow', endorsements: 18 }
    ],
    experiences: [
      { title: 'Lead Product Designer', company: 'SocialWave (Failed)', period: '2021 - 2023', description: 'First design hire. Built design system from scratch. Led team of 3 designers. Company shut down due to market conditions.' },
      { title: 'Senior Designer', company: 'TaskFlow (Failed)', period: '2019 - 2021', description: 'Designed productivity app used by 100K users. Company failed to raise Series A.' },
      { title: 'Product Designer', company: 'DesignStudio', period: '2017 - 2019', description: 'Designed products for Fortune 500 clients. Won 2 industry awards.' },
      { title: 'Junior Designer', company: 'CreativeAgency', period: '2015 - 2017', description: 'Started career in branding and web design.' }
    ],
    education: [
      { school: 'Rhode Island School of Design', degree: 'BFA Graphic Design', period: '2011 - 2015' }
    ],
    startupJourneys: [],
    achievements: [
      { title: 'Dribbble Top 100 Designer', year: '2022', icon: 'star' },
      { title: 'Webby Award Nominee', year: '2021', icon: 'award' }
    ]
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Job.deleteMany({});
    await Story.deleteMany({});
    await Founder.deleteMany({});
    await Investor.deleteMany({});
    await Asset.deleteMany({});
    await FailureReport.deleteMany({});
    await WarRoom.deleteMany({});
    console.log('✓ Cleared existing data');

    // Hash passwords and create users
    console.log('Creating users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        return {
          ...user,
          password: await bcrypt.hash(user.password, salt)
        };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Create 2 posts per user (16 posts total)
    console.log('Creating posts (2 per user)...');
    const postsData = [
      // Sarah Chen (0) - Founder
      {
        author: createdUsers[0]._id,
        type: 'postmortem',
        title: 'Why My First Startup Failed: 5 Critical Lessons',
        subtitle: 'From $2M funding to shutting down in 18 months',
        content: `After 18 months of building what I thought was the next big thing, we had to shut down. Here's what I learned:

1. **Market validation is everything** - We built a solution before understanding the problem.
2. **Cash flow > Revenue** - We had customers but terrible payment terms.
3. **Team chemistry matters** - Co-founder conflicts drained our energy.
4. **Focus is hard** - We tried to do too much too soon.
5. **Timing matters** - We were 2 years too early for our market.

These lessons shaped my next venture, which is now thriving. Failure isn't the end - it's education.`,
        tags: ['startup', 'failure', 'lessons', 'entrepreneurship'],
        published: true,
        trending: true,
        companyName: 'PayFlow',
        foundedYear: '2020',
        closedYear: '2022',
        totalFunding: '$2M'
      },
      {
        author: createdUsers[0]._id,
        type: 'insight',
        title: 'Building a Remote-First Culture from Day One',
        content: `Here are the practices that helped us build a strong remote culture with a distributed team across 3 continents:

1. **Async communication first** - We defaulted to written communication and documented everything.
2. **Regular video check-ins** - Weekly 1:1s and daily standups kept everyone aligned.
3. **Clear working agreements** - Response time expectations, meeting-free days, and overlap hours.
4. **Virtual team building** - Monthly virtual events, Slack channels for non-work chat.
5. **Trust over surveillance** - We focused on output, not hours logged.

These practices helped us maintain high engagement even when team members never met in person.`,
        tags: ['remote-work', 'culture', 'team', 'management'],
        published: true
      },

      // Michael Rodriguez (1) - Investor
      {
        author: createdUsers[1]._id,
        type: 'funding',
        title: 'Excited to announce our $5M Series A!',
        subtitle: 'Leading the next wave of AI-powered analytics',
        content: `We're thrilled to announce that we've raised $5M in Series A funding led by Sequoia Capital, with participation from Y Combinator and several strategic angels.

This milestone validates our approach to helping failed startup founders pivot their skills and resources.

The funding will be used to:
- Expand our platform features
- Grow our team from 10 to 25
- Launch in 3 new markets

Thank you to everyone who believed in us, especially those who shared their failure stories to help us build this.`,
        tags: ['funding', 'series-a', 'ai', 'announcement'],
        published: true,
        fundingAmount: '$5M',
        fundingStage: 'Series A',
        investors: 'Sequoia Capital, Y Combinator'
      },
      {
        author: createdUsers[1]._id,
        type: 'insight',
        title: 'What I Look For in Founders Who Have Failed',
        content: `As an angel investor, I've made it my thesis to invest in founders who have experienced failure. Here's why:

**1. They're battle-tested**
They know what it feels like when things go wrong. They've faced tough decisions and lived to tell the tale.

**2. They have realistic expectations**
No more "we'll be unicorns in 2 years." They understand that building a company is a marathon.

**3. They ask better questions**
Instead of "how fast can we grow?" they ask "how do we build something sustainable?"

**4. They value the right things**
Cash flow, customer retention, team culture - not just vanity metrics.

If you've failed and are starting again, reach out. Your failure story might be exactly what I'm looking for.`,
        tags: ['investing', 'founders', 'failure', 'advice'],
        published: true,
        trending: true
      },

      // Emma Watson (2) - Job Seeker
      {
        author: createdUsers[2]._id,
        type: 'question',
        title: 'How do you explain startup failures in job interviews?',
        content: `I've worked at 2 startups that both failed (through no fault of my own - well, mostly). Now I'm job hunting and I'm not sure how to frame this experience.

Should I:
- Lead with what I learned?
- Focus on the technical skills I gained?
- Be upfront about the failures early?
- Wait until they ask?

Any advice from folks who've been through this? I feel like the stigma is fading but I'm still nervous about it.

For context: I'm a full-stack developer with 6 years experience, strong in React/Node/MongoDB.`,
        tags: ['career', 'job-search', 'interview', 'advice-needed'],
        published: true
      },
      {
        author: createdUsers[2]._id,
        type: 'insight',
        title: 'Technical Debt: The Silent Killer of My Last Startup',
        content: `Our startup didn't fail because of the market or competition. It failed because we couldn't ship fast enough. And we couldn't ship fast enough because of technical debt.

Here's how it happened:

**Month 1-6:** "We'll fix it later"
We cut corners to hit deadlines. No tests. Spaghetti code. Quick hacks.

**Month 6-12:** "It's getting harder to add features"
What used to take days now took weeks. Every change broke something else.

**Month 12-18:** "We can't pivot because the code is too fragile"
When the market shifted, we needed to pivot. But our codebase couldn't handle it.

**The lesson:** Technical debt isn't just a engineering problem - it's a business problem. Future startups: please invest in code quality early. It's cheaper than failure.`,
        tags: ['technical-debt', 'engineering', 'lessons', 'startup'],
        published: true
      },

      // David Kim (3) - Founder (AI)
      {
        author: createdUsers[3]._id,
        type: 'pitch',
        title: 'Looking for Early Customers: AI-Powered Business Automation',
        subtitle: 'We help small businesses automate repetitive tasks without coding',
        content: `Hi everyone! I left Google to build AI Innovations Inc, and we're looking for early customers to try our platform.

**What we do:**
We use AI to help small businesses automate repetitive tasks - data entry, email responses, invoice processing - without any coding required.

**Who it's for:**
- Small businesses with 5-50 employees
- Currently spending 10+ hours/week on repetitive tasks
- Frustrated with complex enterprise solutions

**What we're offering early customers:**
- 3 months free access
- Direct input into our product roadmap
- Dedicated support from our founding team

If this sounds interesting, DM me or comment below. Would love to chat!`,
        tags: ['ai', 'automation', 'small-business', 'early-stage'],
        published: true
      },
      {
        author: createdUsers[3]._id,
        type: 'insight',
        title: 'Why I Left Google to Start a Company (Again)',
        content: `This is my second attempt at founding a company. The first one failed after 14 months. Here's why I'm trying again:

**What happened first time:**
Built a consumer AI app. Got 50K users but couldn't monetize. Ran out of runway.

**What I learned:**
- B2B is easier to monetize than B2C
- Distribution is as important as product
- Don't wait too long to charge

**Why Google wasn't enough:**
Despite the great salary and perks, I couldn't shake the entrepreneurial bug. Watching ideas die in committee meetings was painful.

**Why I'm more prepared now:**
- Clear monetization strategy from day 1
- Focus on B2B, not B2C
- Stronger network of advisors and potential customers
- Less ego, more pragmatism

Wish me luck!`,
        tags: ['founder', 'startup', 'google', 'entrepreneurship'],
        published: true
      },

      // Lisa Thompson (4) - Mentor
      {
        author: createdUsers[4]._id,
        type: 'insight',
        title: '20 Years of Startup Lessons in 10 Minutes',
        subtitle: 'Everything I wish someone told me when I started',
        content: `After building and selling 3 companies (and watching 2 fail), here are the lessons that actually matter:

**On Product:**
- Build for a hair-on-fire problem
- Talk to customers every single week
- Your first version should embarrass you

**On Team:**
- Hire slow, fire fast
- Culture is what happens when you're not looking
- Equity conversations should happen early

**On Fundraising:**
- Raise when you don't need to
- Investors bet on trends, not just ideas
- Your network is your net worth

**On Failure:**
- It's not if, it's when
- Document everything - you'll thank yourself later
- The best founders I know have all failed at least once

Happy to do 1:1 mentoring calls with founders who've experienced failure. DM me.`,
        tags: ['mentorship', 'advice', 'startup', 'lessons'],
        published: true,
        trending: true
      },
      {
        author: createdUsers[4]._id,
        type: 'insight',
        title: 'The Art of the Graceful Shutdown',
        content: `Shutting down a company is one of the hardest things a founder can do. But how you shut down matters as much as how you built.

**Here's the framework I used when shutting down my second company:**

**Week 1-2: Face reality**
- Honest conversation with co-founders
- Financial analysis: how long can we survive?
- Legal consultation

**Week 3-4: Communicate**
- Tell your team first (with severance details)
- Then investors
- Then customers
- Then the public

**Week 5-8: Execute**
- Help team members find jobs
- Wind down operations orderly
- Return unused capital if possible
- Document lessons learned

**The result:**
Despite the failure, 90% of my team went on to great opportunities (some I helped place). Two investors backed my next venture. And I maintained my reputation.

Shutdown doesn't have to be a disaster. It can be your final act of leadership.`,
        tags: ['shutdown', 'leadership', 'failure', 'advice'],
        published: true
      },

      // James Wilson (5) - Founder (E-commerce)
      {
        author: createdUsers[5]._id,
        type: 'postmortem',
        title: 'How I Burned Through $1.5M Building the Wrong Product',
        subtitle: 'A cautionary tale about unit economics',
        content: `FastShip was supposed to revolutionize same-day delivery for small businesses. Instead, it became an expensive lesson in unit economics.

**The idea:** Uber for local deliveries. Connect local couriers with businesses for same-day delivery.

**What went wrong:**

1. **Unit economics never worked**
   - Cost per delivery: $12
   - Average revenue per delivery: $8
   - We were losing money on every transaction

2. **Scaling made it worse**
   - More volume = more losses
   - VC money masked the problem temporarily

3. **Competition was brutal**
   - Amazon started same-day delivery in our markets
   - We couldn't compete on price or reliability

4. **We ignored the warning signs**
   - Advisors told us the math didn't work
   - We thought we'd "figure it out at scale"

**Total raised:** $1.5M
**Total lost:** $1.5M
**Time wasted:** 2 years

**What I'd do differently:** Validate unit economics before scaling. If you're losing money on each transaction, volume won't save you.`,
        tags: ['postmortem', 'unit-economics', 'failure', 'ecommerce'],
        published: true
      },
      {
        author: createdUsers[5]._id,
        type: 'insight',
        title: 'From Failed Startup to Profitable Business: My Pivot Story',
        content: `After FastShip failed, I took 6 months off. Then I started EcoShop with a completely different approach.

**FastShip (Failed):**
- VC-funded
- Growth at all costs
- Negative unit economics
- Complex operations

**EcoShop (Profitable):**
- Bootstrapped
- Profitable from month 1
- Simple dropshipping model
- Focus on niche (sustainable products)

**The key differences:**

1. **Bootstrapped mentality**
   - No VC pressure for hypergrowth
   - Every dollar matters

2. **Simple business model**
   - No warehouses, no delivery fleet
   - Partner with existing logistics

3. **Niche focus**
   - Sustainable/eco-friendly products
   - Strong brand affinity with target customers

4. **Profitable first, growth second**
   - Positive unit economics from day 1
   - Reinvest profits into growth

**Current status:** $50K/month revenue, 35% profit margin, 3-person team.

Not a unicorn, but I sleep well at night.`,
        tags: ['pivot', 'bootstrap', 'ecommerce', 'sustainable'],
        published: true
      },

      // Priya Patel (6) - Investor
      {
        author: createdUsers[6]._id,
        type: 'insight',
        title: 'Why We Only Invest in Second-Time Founders',
        subtitle: 'The Sunrise Ventures thesis on backing founders who have failed',
        content: `At Sunrise Ventures, we have a contrarian thesis: we specifically seek out founders who have failed before.

**Why?**

**1. Failure is the best teacher**
There's no substitute for the lessons learned from shutting down a company. It changes you in ways that success cannot.

**2. They're more coachable**
First-time founders often think they know everything. Second-time founders ask for help.

**3. They have better networks**
Failed founders have built relationships - with investors, potential hires, and customers.

**4. They're more capital-efficient**
They've felt the pain of running out of money. They don't waste it.

**Our track record:**
- 23 investments in second-time founders
- 4 exits (2 acquisitions, 2 IPOs)
- 2 failures
- 17 still building

**If you've failed and you're ready to try again, we want to talk. Check size: $500K - $3M. Focus: Healthcare, Fintech, Climate.**`,
        tags: ['investing', 'vc', 'founders', 'thesis'],
        published: true
      },
      {
        author: createdUsers[6]._id,
        type: 'question',
        title: 'What do you wish investors understood about failure?',
        content: `I'm working on improving how our fund evaluates founders with failed ventures. I want to hear directly from you.

**Questions I'm curious about:**

1. When you tell investors about your failure, what response do you wish you got?

2. What questions do investors ask that feel unfair or unhelpful?

3. What would make you more comfortable sharing your failure story with potential investors?

4. How long after a failure did you feel "ready" to start again?

This isn't just research - I want to change how our industry treats failed founders. Your answers will directly influence how we approach these conversations at Sunrise Ventures.

Please share openly - throwaway accounts welcome if you prefer anonymity.`,
        tags: ['investing', 'feedback', 'founders', 'failure'],
        published: true
      },

      // Alex Turner (7) - Job Seeker (Designer)
      {
        author: createdUsers[7]._id,
        type: 'insight',
        title: 'What 2 Failed Startups Taught Me About Design',
        content: `I was the first design hire at two startups. Both failed. Here's what I learned about design in the startup world:

**Lesson 1: Speed trumps perfection**
At a startup, a good design shipped today beats a perfect design shipped next month. I had to let go of my pixel-perfect tendencies.

**Lesson 2: Design systems save time**
Investing in a design system early on saved us hundreds of hours later. Even a simple one is better than none.

**Lesson 3: Talk to users, not just founders**
Founders have vision, but users have truth. The best design decisions came from user research, not exec opinions.

**Lesson 4: Learn to code (a little)**
Understanding HTML/CSS made me 10x more effective. I could prototype faster and communicate better with engineers.

**Lesson 5: Design can't save a bad product**
Both startups failed for business reasons, not design reasons. Great UX can't fix a product nobody wants.

**What I'm looking for next:**
Early-stage startup where design is valued. I want to be in the room where decisions are made. Remote-friendly, equity preferred.`,
        tags: ['design', 'ux', 'startup', 'lessons', 'career'],
        published: true
      },
      {
        author: createdUsers[7]._id,
        type: 'question',
        title: 'Design portfolios: How much failed work should I show?',
        content: `I'm updating my portfolio and I'm stuck on a dilemma:

Both of my previous startups failed. The products I designed no longer exist. But I'm proud of the work I did.

**My options:**

1. **Show everything** - Include failed startup work with context about what happened

2. **Show selectively** - Only include work that "succeeded" (even if the company failed)

3. **Focus on side projects** - Build new portfolio pieces instead of showing failed work

4. **Case study approach** - Write detailed case studies about the design process, regardless of outcome

**What I'm worried about:**
- Will showing failed work hurt my chances?
- Does it matter if the product is no longer live?
- How do I explain the failures without sounding defensive?

Any designers here who've been through this? How did you handle it?`,
        tags: ['design', 'portfolio', 'career', 'advice-needed'],
        published: true
      }
    ];

    const createdPosts = await Post.insertMany(postsData);
    console.log(`✓ Created ${createdPosts.length} posts (2 per user)`);

    // Create 1 asset per user (8 assets total)
    console.log('Creating assets (1 per user)...');
    const assetsData = [
      // Sarah Chen (0) - Founder - Domain Name
      {
        title: 'payflow.io Premium Domain',
        seller: createdUsers[0]._id,
        category: 'Domain Names',
        description: 'Premium .io domain from our failed fintech startup PayFlow. Great for any payment or financial services company. Includes existing SEO value with 500+ backlinks from tech publications that covered our launch and subsequent pivot. Domain has been registered since 2020 and has clean history.',
        askingPrice: 15000,
        originalValue: 25000,
        condition: 'Excellent',
        status: 'Available',
        location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        tags: ['fintech', 'premium-domain', 'payments', '.io'],
        views: 245,
        verificationStatus: 'Verified'
      },
      // Michael Rodriguez (1) - Investor - Source Code
      {
        title: 'DataSync Analytics Platform - Full Source Code',
        seller: createdUsers[1]._id,
        category: 'Source Code',
        description: 'Complete source code for DataSync, a real-time analytics platform built with React, Node.js, and PostgreSQL. Features include customizable dashboards, real-time data streaming, automated reporting, and REST API. Well-documented codebase with 80% test coverage. Includes 6 months of maintenance support from original engineering team.',
        askingPrice: 75000,
        originalValue: 350000,
        condition: 'Excellent',
        status: 'Available',
        location: { city: 'New York', state: 'NY', country: 'USA' },
        tags: ['saas', 'analytics', 'react', 'nodejs', 'postgresql'],
        views: 189,
        verificationStatus: 'Verified'
      },
      // Emma Watson (2) - Job Seeker - Brand Assets
      {
        title: 'HealthTrack Brand Package',
        seller: createdUsers[2]._id,
        category: 'Brand Assets',
        description: 'Complete brand identity package from HealthTrack, a healthcare technology startup. Includes logo files (AI, EPS, SVG, PNG), brand guidelines, color palette, typography specifications, business card designs, letterhead, and social media templates. Professional design by award-winning agency. Perfect for healthcare or wellness startups.',
        askingPrice: 5000,
        originalValue: 18000,
        condition: 'Excellent',
        status: 'Available',
        location: { city: 'Austin', state: 'TX', country: 'USA' },
        tags: ['healthcare', 'branding', 'logo', 'design'],
        views: 87,
        verificationStatus: 'Verified'
      },
      // David Kim (3) - Founder (AI) - Intellectual Property
      {
        title: 'ML Model for Document Classification - Patent Pending',
        seller: createdUsers[3]._id,
        category: 'Intellectual Property',
        description: 'Patent-pending machine learning model for automated document classification. Achieves 94% accuracy across 50+ document categories. Trained on 2M+ documents. Includes model weights, training pipeline, inference API, and technical documentation. Perfect for legal tech, fintech, or enterprise document management. Patent application and all IP rights included.',
        askingPrice: 120000,
        originalValue: 500000,
        condition: 'Excellent',
        status: 'Available',
        location: { city: 'Seattle', state: 'WA', country: 'USA' },
        tags: ['ai', 'ml', 'patent', 'document-classification', 'nlp'],
        views: 312,
        verificationStatus: 'Pending'
      },
      // Lisa Thompson (4) - Mentor - Customer Database
      {
        title: 'B2B SaaS Customer List - 2,500 Verified Leads',
        seller: createdUsers[4]._id,
        category: 'Customer Database',
        description: 'Verified customer database from a B2B SaaS company focused on SMB market. Contains 2,500 companies with decision-maker contact information, company size, industry, and technology stack. 85% email deliverability rate as of last month. GDPR compliant with documented consent. Includes Salesforce export and CSV format.',
        askingPrice: 8000,
        originalValue: 25000,
        condition: 'Good',
        status: 'Available',
        location: { city: 'Boston', state: 'MA', country: 'USA' },
        tags: ['b2b', 'leads', 'saas', 'smb', 'sales'],
        views: 156,
        verificationStatus: 'Verified'
      },
      // James Wilson (5) - Founder (E-commerce) - Physical Equipment
      {
        title: 'Warehouse Equipment from FastShip',
        seller: createdUsers[5]._id,
        category: 'Physical Equipment',
        description: 'Complete warehouse setup from FastShip operations. Includes: 10 industrial shelving units (6ft x 4ft x 2ft), 2 pallet jacks, packaging station with scale and label printer, 500+ shipping boxes (various sizes), tape dispensers, and organization bins. Equipment is 18 months old and in good working condition. Buyer responsible for pickup in Los Angeles area.',
        askingPrice: 4500,
        originalValue: 15000,
        condition: 'Good',
        status: 'Available',
        location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
        tags: ['warehouse', 'logistics', 'equipment', 'shipping'],
        views: 43,
        verificationStatus: 'Verified'
      },
      // Priya Patel (6) - Investor - Social Media Accounts
      {
        title: 'HealthTech Twitter & LinkedIn Accounts - 25K Followers',
        seller: createdUsers[6]._id,
        category: 'Social Media Accounts',
        description: 'Established social media presence from a healthcare technology startup. Twitter account with 15K followers (healthcare professionals, patients, industry leaders). LinkedIn company page with 10K followers. High engagement rates (3.5% average). Clean posting history focused on healthcare innovation. Includes analytics history and content calendar template.',
        askingPrice: 3500,
        originalValue: 8000,
        condition: 'Excellent',
        status: 'Available',
        location: { city: 'Palo Alto', state: 'CA', country: 'USA' },
        tags: ['social-media', 'healthcare', 'twitter', 'linkedin', 'followers'],
        views: 98,
        verificationStatus: 'Verified'
      },
      // Alex Turner (7) - Job Seeker (Designer) - Marketing Materials
      {
        title: 'SaaS Product Marketing Kit',
        seller: createdUsers[7]._id,
        category: 'Marketing Materials',
        description: 'Comprehensive marketing kit from SocialWave, a social commerce startup. Includes: 50+ landing page designs (Figma), email templates (12 campaigns), presentation decks (investor + sales), product screenshots and mockups, explainer video script and storyboard, customer testimonial videos (3), and photography assets (100+ images). All files in editable formats.',
        askingPrice: 6500,
        originalValue: 35000,
        condition: 'Excellent',
        status: 'Available',
        location: { city: 'Denver', state: 'CO', country: 'USA' },
        tags: ['marketing', 'design', 'figma', 'landing-pages', 'saas'],
        views: 124,
        verificationStatus: 'Verified'
      }
    ];

    const createdAssets = await Asset.insertMany(assetsData);
    console.log(`✓ Created ${createdAssets.length} assets (1 per user)`);

    // Create sample jobs
    console.log('Creating jobs...');
    const jobs = [
      {
        title: 'Senior Full-Stack Engineer',
        company: 'FinTech Innovations',
        location: 'San Francisco, CA',
        type: 'Full-time',
        isRemote: true,
        salary: '$120k - $180k',
        equity: '0.5% - 1.5%',
        description: 'We\'re looking for a talented full-stack engineer to join our early team and help build the future of financial technology.',
        requirements: '• 5+ years of experience with React and Node.js\n• Strong understanding of MongoDB and database design\n• Experience with AWS or similar cloud platforms\n• Startup experience preferred',
        tags: ['react', 'nodejs', 'mongodb', 'aws'],
        postedBy: createdUsers[0]._id,
        status: 'active',
        benefits: ['Health insurance', 'Remote work', 'Equity', 'Unlimited PTO'],
        companyInfo: {
          size: '10-50',
          founded: '2022',
          funding: 'Series A',
          website: 'https://fintechinnovations.example.com'
        }
      },
      {
        title: 'Product Designer',
        company: 'FinTech Innovations',
        location: 'Remote',
        type: 'Full-time',
        isRemote: true,
        salary: '$90k - $130k',
        equity: '0.3% - 0.8%',
        description: 'Join us as our first design hire and shape the user experience of our platform. You\'ll work directly with founders to create beautiful, intuitive interfaces that users love. This is a unique opportunity to establish our design system from the ground up and influence product direction.',
        requirements: '• 3+ years of product design experience\n• Strong portfolio showcasing web/mobile design\n• Experience with Figma\n• Understanding of design systems',
        tags: ['design', 'figma', 'ux', 'ui'],
        postedBy: createdUsers[0]._id,
        status: 'active',
        benefits: ['Health insurance', 'Remote work', 'Equity']
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(`✓ Created ${createdJobs.length} jobs`);

    // Create more jobs
    console.log('Creating additional jobs...');
    const moreJobs = [
      {
        title: 'VP of Engineering',
        company: 'CloudScale',
        location: 'San Francisco, CA',
        type: 'Full-time',
        isRemote: false,
        salary: '$180k - $250k',
        description: 'Lead our engineering team as we scale our cloud infrastructure platform to serve millions of users. You\'ll define technical strategy, build high-performing teams, and drive execution on mission-critical projects.',
        requirements: '• 10+ years engineering experience\n• 5+ years leadership experience\n• Deep knowledge of distributed systems',
        tags: ['leadership', 'cloud', 'distributed-systems'],
        postedBy: createdUsers[0]._id,
        status: 'active'
      },
      {
        title: 'Growth Marketing Lead',
        company: 'SocialWave',
        location: 'Austin, TX',
        type: 'Full-time',
        isRemote: true,
        salary: '$120k - $160k',
        description: 'Drive user acquisition and retention for our rapidly growing social media platform. You\'ll own the growth strategy, experiment with new channels, and optimize our funnel to achieve aggressive user growth targets.',
        requirements: '• 5+ years growth marketing experience\n• Experience with B2C products\n• Data-driven mindset',
        tags: ['marketing', 'growth', 'b2c'],
        postedBy: createdUsers[0]._id,
        status: 'active'
      },
      {
        title: 'Technical Co-Founder',
        company: 'AI Innovations Inc',
        location: 'Remote',
        type: 'Co-founder',
        isRemote: true,
        description: 'Looking for a technical co-founder to build cutting-edge AI-powered solutions that will transform how businesses operate. This is an opportunity to shape the future and build something extraordinary from the ground up.',
        requirements: '• Strong ML/AI background\n• Python expertise\n• Startup experience preferred',
        tags: ['ai', 'ml', 'python', 'cofounder'],
        postedBy: createdUsers[1]._id,
        status: 'active'
      }
    ];
    await Job.insertMany(moreJobs);
    console.log(`✓ Created ${moreJobs.length} additional jobs`);

    // Create stories
    console.log('Creating stories...');
    const stories = [
      {
        title: 'From $5M Funding to Shutdown: What I Learned About Product-Market Fit',
        excerpt: 'After raising significant capital, we realized too late that we were solving a problem nobody had. Here\'s what I wish I knew earlier.',
        content: 'After raising significant capital, we realized too late that we were solving a problem nobody had. We spent months building features nobody asked for. The warning signs were there - low engagement, high churn, and constantly pivoting our pitch. What I wish I knew: validate relentlessly before building. Talk to 100 customers before writing a single line of code. Product-market fit isn\'t about having a great product - it\'s about solving a real, painful problem that people will pay to solve.',
        author: { userId: createdUsers[0]._id, name: 'Sarah Chen', role: 'Founder' },
        category: 'Product',
        readTime: 8,
        published: true,
        trending: true
      },
      {
        title: 'The Pivot That Saved My Career: Lessons from a Failed SaaS',
        excerpt: 'Our SaaS platform failed, but the relationships we built led to my current success. Here\'s how to leverage your network.',
        content: 'Our SaaS platform failed after 2 years of hard work. We shut down with only $20K in the bank. But something unexpected happened - the relationships we built during those 2 years became our greatest asset. Former customers became advisors. Investors introduced us to new opportunities. Team members joined our next venture. The lesson: success isn\'t just about your product, it\'s about the people you meet along the way. Network with intention, help others genuinely, and those relationships will support you through failure and success.',
        author: { userId: createdUsers[0]._id, name: 'Sarah Chen', role: 'Founder' },
        category: 'Career',
        readTime: 6,
        published: true
      },
      {
        title: 'When to Call It Quits: A Founder\'s Guide to Knowing When to Stop',
        excerpt: 'Persistence is valued in startup culture, but knowing when to stop is equally important. Here are the signs I missed.',
        content: 'Startup culture glorifies persistence. "Never give up" is the mantra. But sometimes, the smartest thing you can do is quit. I learned this the hard way. We kept pushing for 18 months after the writing was on the wall. Team morale was low. Metrics weren\'t improving. We were out of ideas. The signs were clear, but we ignored them. Here\'s what I wish someone told me: if you\'ve tried everything and nothing is working, it\'s okay to stop. Failure teaches you more than mediocre success ever will.',
        author: { userId: createdUsers[1]._id, name: 'Michael Rodriguez', role: 'Investor' },
        category: 'Leadership',
        readTime: 10,
        published: true,
        trending: true
      },
      {
        title: 'Burn Rate Reality: How We Ran Out of Runway',
        excerpt: 'Financial mismanagement was our downfall. Here are the warning signs we ignored and what I\'d do differently.',
        content: 'We raised $2M and thought we had 18 months of runway. Six months later, we were scrambling. What happened? We underestimated expenses and overestimated revenue. Hiring too fast. Expensive office. Lavish team events. Meanwhile, sales were slower than projected. The burn rate crept up from $80K to $150K per month. Warning signs we ignored: cash balance dropping faster than expected, no clear path to profitability, spending on "nice to haves" instead of must-haves. What I\'d do differently: maintain a detailed financial model, review it weekly, and always assume things will take longer and cost more than you think.',
        author: { userId: createdUsers[0]._id, name: 'Sarah Chen', role: 'Founder' },
        category: 'Finance',
        readTime: 7,
        published: true
      }
    ];
    const createdStories = await Story.insertMany(stories);
    console.log(`✓ Created ${createdStories.length} stories`);

    // Create founder profiles
    console.log('Creating founder profiles...');
    const founders = [
      {
        user: createdUsers[0]._id,
        name: 'Sarah Chen',
        bio: 'Built and scaled a fintech startup to 50 employees before market shifts forced closure. Now helping others avoid my mistakes.',
        location: 'San Francisco, CA',
        previousStartup: 'PayFlow (Fintech)',
        skills: ['Product Strategy', 'Team Building', 'Fundraising'],
        openToConnect: true
      },
      {
        user: createdUsers[3]._id,
        name: 'David Kim',
        bio: 'Ex-Google ML engineer building AI-powered business automation. First-time founder after one failed consumer AI app.',
        location: 'Seattle, WA',
        previousStartup: 'AI Consumer App (Shut down)',
        skills: ['Machine Learning', 'AI Architecture', 'Python', 'Technical Leadership'],
        openToConnect: true
      },
      {
        user: createdUsers[5]._id,
        name: 'James Wilson',
        bio: 'E-commerce entrepreneur. Failed at same-day delivery (FastShip), now building a profitable sustainable products marketplace.',
        location: 'Los Angeles, CA',
        previousStartup: 'FastShip (E-commerce Logistics)',
        skills: ['E-commerce', 'Unit Economics', 'D2C Marketing', 'Supply Chain'],
        openToConnect: true
      }
    ];
    const createdFounders = await Founder.insertMany(founders);
    console.log(`✓ Created ${createdFounders.length} founder profiles`);

    // Create investor profiles
    console.log('Creating investor profiles...');
    const investors = [
      {
        user: createdUsers[1]._id,
        name: 'Michael Rodriguez',
        type: 'Angel Network',
        focus: 'Early-stage SaaS, Fintech',
        stage: 'Pre-seed to Series A',
        checkSize: '$250K - $2M',
        location: 'New York, NY',
        description: 'We invest in founders who\'ve learned from past experiences. Your failure story is your edge.',
        investments: [
          { company: 'TechFlow', amount: '$1M', year: '2023' },
          { company: 'DataSync', amount: '$500K', year: '2024' }
        ]
      },
      {
        user: createdUsers[6]._id,
        name: 'Priya Patel',
        type: 'Venture Capital',
        focus: 'Healthcare, Fintech, Climate Tech',
        stage: 'Seed to Series B',
        checkSize: '$500K - $3M',
        location: 'Palo Alto, CA',
        description: 'Partner at Sunrise Ventures. We specifically back founders who have failed before - they make better entrepreneurs.',
        investments: [
          { company: 'HealthBridge', amount: '$2M', year: '2023' },
          { company: 'ClimateAI', amount: '$1.5M', year: '2024' },
          { company: 'PaymentOS', amount: '$3M', year: '2024' }
        ]
      }
    ];
    const createdInvestors = await Investor.insertMany(investors);
    console.log(`✓ Created ${createdInvestors.length} investor profiles`);

    // Create failure reports
    console.log('Creating failure reports...');
    const failureReports = [
      // Sarah Chen's failure report
      {
        startupName: 'PayFlow',
        founder: createdUsers[0]._id,
        industry: 'Finance',
        location: {
          city: 'San Francisco',
          state: 'California',
          country: 'USA',
          coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] }
        },
        fundingRaised: 2000000,
        teamSize: 12,
        operationalMonths: 18,
        failureDate: new Date('2022-06-15'),
        primaryReason: 'Ran out of cash',
        detailedAnalysis: `PayFlow was built to revolutionize B2B payments for small businesses. We had a solid product, great team, and even paying customers. But we made critical mistakes that led to our shutdown.

Our burn rate was too high from the start. We hired too fast, got an expensive office in downtown SF, and spent on "nice to haves." We assumed our Series A was guaranteed because of our metrics, but the market shifted.

When fundraising dried up in 2022, we had only 3 months of runway left. We tried cutting costs, but it was too late. The team was demoralized, and our best engineers left for stable jobs.

Looking back, we should have been more conservative with spending and built a longer runway. The market timing was also off - we were building for a world that wasn't ready for our solution.`,
        lessonsLearned: [
          'Always maintain 12+ months of runway',
          'Don\'t assume the next round is guaranteed',
          'Hire slower, fire faster',
          'Remote-first saves significant costs',
          'Cash flow matters more than revenue on paper'
        ],
        mistakes: [
          'Hired too fast before product-market fit',
          'Expensive office lease we couldn\'t break',
          'Spent too much on marketing before proving unit economics',
          'Ignored early warning signs of market downturn'
        ],
        adviceForOthers: 'Be paranoid about runway. The best time to raise money is when you don\'t need it. And remember, your Series A is never guaranteed until the money is in the bank.',
        burnRate: 150000,
        revenueAtClosure: 45000,
        customerCount: 127,
        isPublic: true,
        anonymousPost: false
      },
      // David Kim's failure report
      {
        startupName: 'SmartAssist',
        founder: createdUsers[3]._id,
        industry: 'Technology',
        location: {
          city: 'Seattle',
          state: 'Washington',
          country: 'USA',
          coordinates: { type: 'Point', coordinates: [-122.3321, 47.6062] }
        },
        fundingRaised: 500000,
        teamSize: 5,
        operationalMonths: 14,
        failureDate: new Date('2023-03-20'),
        primaryReason: 'Business model failure',
        detailedAnalysis: `SmartAssist was a consumer AI assistant app that aimed to be "Siri, but actually useful." We built amazing technology - our AI could handle complex multi-step tasks that competitors couldn't.

The problem? We couldn't figure out how to make money. Users loved the free tier but refused to pay for premium features. We tried ads, but they ruined the user experience. We tried subscriptions, but churn was 40% monthly.

With 50,000 active users and zero sustainable revenue, we couldn't raise our next round. VCs wanted to see a path to profitability, and we didn't have one.

The core lesson: B2C AI is brutally hard to monetize. Users expect AI assistants to be free (thanks, Google and Apple). Without a clear business model from day one, you're building a science project, not a company.`,
        lessonsLearned: [
          'B2C is 10x harder to monetize than B2B',
          'Free users are not validation of a business',
          'Have a business model hypothesis before building',
          'Consumer habits are extremely hard to change',
          'Competing with free products from big tech is nearly impossible'
        ],
        mistakes: [
          'Built the product first, figured out monetization later',
          'Targeted consumers when enterprise would have been easier',
          'Underestimated the power of free alternatives',
          'Didn\'t validate willingness to pay early enough'
        ],
        adviceForOthers: 'If you\'re building in AI, consider B2B first. Enterprises have budgets and pain points they\'ll pay to solve. Consumers expect magic for free.',
        burnRate: 35000,
        revenueAtClosure: 2500,
        customerCount: 50000,
        isPublic: true,
        anonymousPost: false
      },
      // Michael Rodriguez's old failure
      {
        startupName: 'CloudMetrics',
        founder: createdUsers[1]._id,
        industry: 'Technology',
        location: {
          city: 'New York',
          state: 'New York',
          country: 'USA',
          coordinates: { type: 'Point', coordinates: [-74.0060, 40.7128] }
        },
        fundingRaised: 1500000,
        teamSize: 8,
        operationalMonths: 24,
        failureDate: new Date('2014-09-30'),
        primaryReason: 'No market need',
        detailedAnalysis: `CloudMetrics was a cloud infrastructure monitoring solution that I co-founded after MIT. We built sophisticated dashboards and alerting systems that we thought every DevOps team needed.

The problem was that we were solving a problem that wasn't painful enough. Companies had workarounds. They used a combination of AWS CloudWatch, custom scripts, and spreadsheets. Our solution was "nice to have" but not "must have."

We pivoted 3 times trying to find product-market fit. First from monitoring to analytics, then to cost optimization, then to security. Each pivot burned runway without gaining traction.

After 2 years and 3 pivots, we were exhausted and out of ideas. We returned what was left of the money to investors and shut down.

The irony? Two years later, Datadog IPO'd doing exactly what we tried to do. Timing matters.`,
        lessonsLearned: [
          'Pain point must be acute, not just annoying',
          'Pivot faster - don\'t wait until you\'re desperate',
          'Market timing can make or break a startup',
          'Being early is often the same as being wrong',
          'Listen to what customers do, not what they say'
        ],
        mistakes: [
          'Built a "nice to have" instead of "must have"',
          'Pivoted too slowly - should have made faster decisions',
          'Didn\'t talk to enough customers before building',
          'Team was too technical, not enough sales DNA'
        ],
        adviceForOthers: 'Before building anything, ask: "Would my target customer pay for this today, with their existing budget?" If the answer isn\'t a clear yes, keep validating.',
        burnRate: 62000,
        revenueAtClosure: 15000,
        customerCount: 23,
        isPublic: true,
        anonymousPost: false
      },
      // James Wilson's failure
      {
        startupName: 'FastShip',
        founder: createdUsers[5]._id,
        industry: 'E-commerce',
        location: {
          city: 'Los Angeles',
          state: 'California',
          country: 'USA',
          coordinates: { type: 'Point', coordinates: [-118.2437, 34.0522] }
        },
        fundingRaised: 3500000,
        teamSize: 45,
        operationalMonths: 30,
        failureDate: new Date('2021-11-15'),
        primaryReason: 'Pricing/Cost issues',
        detailedAnalysis: `FastShip aimed to be "Amazon Prime for local stores" - same-day delivery from any local retailer. We had the tech, the drivers, and the merchant partnerships. What we didn't have was unit economics that worked.

We were losing $8 on every delivery. We thought scale would fix this - it didn't. The more we grew, the more we lost. We raised $3.5M to "grow into profitability" but the math never worked.

Our customers loved us because we were essentially subsidizing their deliveries. But love doesn't pay the bills. When we tried to raise prices to sustainable levels, order volume dropped 70%.

In the end, we were a charity for convenience, not a business. The pandemic briefly gave us hope as delivery demand surged, but competitors with deeper pockets (DoorDash, Uber) crushed us.`,
        lessonsLearned: [
          'Unit economics must work from day one (or close to it)',
          'Scale doesn\'t magically fix bad economics',
          'Subsidizing customers creates false demand signals',
          'VC money is not a business model',
          'Logistics is a winner-take-most market'
        ],
        mistakes: [
          'Ignored negative unit economics for too long',
          'Believed "we\'ll figure it out at scale"',
          'Underestimated how much capital competitors would deploy',
          'Grew too fast before proving the model worked'
        ],
        adviceForOthers: 'Run the numbers before you scale. If you can\'t make money on one transaction, you won\'t make money on a million. And never compete on subsidies against companies with billions in the bank.',
        burnRate: 200000,
        revenueAtClosure: 180000,
        customerCount: 12000,
        isPublic: true,
        anonymousPost: false
      },
      // Lisa Thompson's old failure
      {
        startupName: 'TechConnect',
        founder: createdUsers[4]._id,
        industry: 'Technology',
        location: {
          city: 'Boston',
          state: 'Massachusetts',
          country: 'USA',
          coordinates: { type: 'Point', coordinates: [-71.0589, 42.3601] }
        },
        fundingRaised: 800000,
        teamSize: 6,
        operationalMonths: 20,
        failureDate: new Date('2009-05-01'),
        primaryReason: 'Product mis-timed',
        detailedAnalysis: `TechConnect was a professional social network we built in 2007 - before LinkedIn had critical mass. Our vision was connecting tech professionals for collaboration and job opportunities.

We actually had great traction initially - 50,000 users in the first year. But we made a fatal mistake: we tried to monetize too early with premium subscriptions instead of growing the network first.

LinkedIn, meanwhile, stayed free and focused purely on growth. By 2009, they had 50 million users to our 100,000. Network effects are brutal - once they won, it was game over.

The 2008 financial crisis was the final nail. Our enterprise clients (who we'd just started selling to) froze all spending. We couldn't raise more money in the recession. We shut down.`,
        lessonsLearned: [
          'In social networks, growth beats monetization early on',
          'Network effects create winner-take-all dynamics',
          'Timing your market is as important as building the product',
          'External economic factors can kill even good businesses',
          'First-mover advantage matters less than best-executor advantage'
        ],
        mistakes: [
          'Tried to monetize before achieving critical mass',
          'Didn\'t fully appreciate network effect dynamics',
          'Underestimated how long it takes to build a social network',
          'Didn\'t have enough runway to survive the financial crisis'
        ],
        adviceForOthers: 'If you\'re building a network-effect business, focus obsessively on growth before monetization. The network that gets big first usually wins, regardless of who was first.',
        burnRate: 40000,
        revenueAtClosure: 8000,
        customerCount: 100000,
        isPublic: true,
        anonymousPost: false
      },
      // Anonymous international failures
      {
        startupName: 'HealthTrack Pro',
        founder: createdUsers[2]._id,
        industry: 'Healthcare',
        location: {
          city: 'London',
          state: 'England',
          country: 'UK',
          coordinates: { type: 'Point', coordinates: [-0.1278, 51.5074] }
        },
        fundingRaised: 4000000,
        teamSize: 22,
        operationalMonths: 36,
        failureDate: new Date('2023-08-10'),
        primaryReason: 'Legal challenges',
        detailedAnalysis: `HealthTrack Pro was a digital health platform for managing chronic conditions. We had regulatory approval, clinical validation, and contracts with two major NHS trusts.

What killed us was GDPR compliance complexity. We stored sensitive health data across multiple EU jurisdictions. When regulations tightened in 2022, we faced a choice: spend 18 months and $2M on compliance infrastructure, or shut down.

We tried to raise a compliance-focused round, but investors were spooked by the regulatory uncertainty. Healthcare VCs saw too much risk, and tech VCs didn't understand the healthcare landscape.

In the end, the legal and compliance burden of operating in healthcare across multiple countries was too much for a startup our size.`,
        lessonsLearned: [
          'Regulatory complexity in healthcare is severely underestimated',
          'Cross-border data compliance is exponentially harder',
          'Healthcare startups need specialized legal counsel from day one',
          'Regulatory changes can invalidate your business model overnight',
          'Some markets are not startup-friendly'
        ],
        mistakes: [
          'Expanded to multiple countries before mastering one',
          'Underbudgeted for legal and compliance costs',
          'Didn\'t have regulatory expertise on the founding team',
          'Built tech before fully understanding regulatory requirements'
        ],
        adviceForOthers: 'If you\'re building in healthcare, hire a regulatory expert before you write a line of code. And think twice before expanding internationally - each country is essentially a new regulatory battle.',
        burnRate: 120000,
        revenueAtClosure: 95000,
        customerCount: 15000,
        isPublic: true,
        anonymousPost: true
      },
      {
        startupName: 'EduLearn Global',
        founder: createdUsers[7]._id,
        industry: 'Education',
        location: {
          city: 'Berlin',
          state: 'Berlin',
          country: 'Germany',
          coordinates: { type: 'Point', coordinates: [13.4050, 52.5200] }
        },
        fundingRaised: 1200000,
        teamSize: 10,
        operationalMonths: 22,
        failureDate: new Date('2023-04-30'),
        primaryReason: 'Got outcompeted',
        detailedAnalysis: `EduLearn Global was an online learning platform for coding bootcamps in Europe. We had solid curriculum, good instructors, and were growing 20% month-over-month.

Then Coursera and Udacity expanded aggressively into Europe. They had 100x our marketing budget and brand recognition. Within 6 months, our customer acquisition cost tripled as we competed for the same Google keywords.

We tried to differentiate with local content and language support, but it wasn't enough. Students wanted the prestige of big-name certificates. Our European focus became a limitation, not an advantage.

When our Series A fell through because investors preferred to bet on the global giants, we knew it was over.`,
        lessonsLearned: [
          'Competing with well-funded incumbents requires a true moat',
          'Geographic focus can be a trap, not a defensible niche',
          'Marketing spend wars favor companies with more capital',
          'Brand and credentialing power matters in education',
          'B2C marketplaces are brutal competitive environments'
        ],
        mistakes: [
          'Underestimated how quickly big players could expand to our market',
          'Didn\'t build a truly differentiated product',
          'Relied too heavily on paid acquisition',
          'Should have focused on B2B (corporate training) instead of B2C'
        ],
        adviceForOthers: 'Before entering a market, ask yourself: what happens when the giants decide to compete here? If your only advantage is local presence, it\'s not enough.',
        burnRate: 55000,
        revenueAtClosure: 40000,
        customerCount: 3500,
        isPublic: true,
        anonymousPost: false
      },
      {
        startupName: 'GreenDeliver',
        founder: createdUsers[0]._id,
        industry: 'Food & Beverage',
        location: {
          city: 'Singapore',
          state: 'Singapore',
          country: 'Singapore',
          coordinates: { type: 'Point', coordinates: [103.8198, 1.3521] }
        },
        fundingRaised: 2500000,
        teamSize: 35,
        operationalMonths: 24,
        failureDate: new Date('2022-09-15'),
        primaryReason: 'Got outcompeted',
        detailedAnalysis: `GreenDeliver was an eco-friendly food delivery service in Singapore using only electric vehicles and sustainable packaging. We positioned ourselves as the ethical alternative to Grab and Foodpanda.

Our thesis was that consumers would pay a premium for sustainable delivery. We were wrong. In surveys, 80% of people said they cared about sustainability. In practice, they chose the cheapest, fastest option every time.

When Grab launched their own "green" delivery option (largely greenwashing, but consumers didn't know), our differentiation evaporated. We couldn't compete on price or speed, and our sustainability story wasn't unique anymore.

The lesson: what consumers say they value and what they actually pay for are very different things.`,
        lessonsLearned: [
          'Consumer behavior rarely matches stated preferences',
          'Sustainability alone is not a business model',
          'Price and convenience beat values in most purchasing decisions',
          'Big competitors can copy positioning faster than you can grow',
          'Premium positioning requires truly premium value'
        ],
        mistakes: [
          'Over-indexed on sustainability as our sole differentiator',
          'Didn\'t validate actual willingness to pay for green options',
          'Assumed competitors couldn\'t copy our positioning',
          'Marketing message was ahead of consumer readiness'
        ],
        adviceForOthers: 'Never believe what customers tell you in surveys. Watch what they actually do. And remember: convenient + cheap beats ethical + expensive in most markets.',
        burnRate: 110000,
        revenueAtClosure: 75000,
        customerCount: 8500,
        isPublic: true,
        anonymousPost: false
      },
      {
        startupName: 'PropTech Solutions',
        founder: createdUsers[3]._id,
        industry: 'Real Estate',
        location: {
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          coordinates: { type: 'Point', coordinates: [55.2708, 25.2048] }
        },
        fundingRaised: 5000000,
        teamSize: 28,
        operationalMonths: 32,
        failureDate: new Date('2023-06-01'),
        primaryReason: 'Team/Investor issues',
        detailedAnalysis: `PropTech Solutions was a real estate marketplace for the Middle East. We had strong early traction - $5M raised, partnerships with major developers, and growing transaction volume.

What killed us was internal conflict. My co-founder and I had different visions for the company. I wanted to focus on residential, he wanted commercial. We argued about strategy, hiring, and spending. The board was split.

Instead of making decisions quickly, everything became a political battle. Key hires were delayed. Product roadmap changed constantly. The team saw the chaos and morale collapsed. Our best engineers left for more stable companies.

By the time we tried to raise Series A, our numbers had stalled and investors could sense the dysfunction. No one wants to invest in a house divided.`,
        lessonsLearned: [
          'Co-founder alignment is everything',
          'Disagreements must be resolved quickly or they metastasize',
          'Board dysfunction paralyzes companies',
          'Team morale is incredibly sensitive to founder conflict',
          'Investors can smell dysfunction from a mile away'
        ],
        mistakes: [
          'Didn\'t have explicit agreement on vision before starting',
          'Let disagreements fester instead of addressing them',
          'Brought in board members who took sides',
          'Prioritized being right over finding solutions'
        ],
        adviceForOthers: 'Before you start a company with someone, stress-test the relationship. Discuss worst-case scenarios. Have explicit agreements on who makes what decisions. And if conflict arises, deal with it immediately - it only gets worse with time.',
        burnRate: 160000,
        revenueAtClosure: 120000,
        customerCount: 450,
        isPublic: true,
        anonymousPost: false
      },
      {
        startupName: 'FarmTech India',
        founder: createdUsers[5]._id,
        industry: 'Technology',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          coordinates: { type: 'Point', coordinates: [72.8777, 19.0760] }
        },
        fundingRaised: 800000,
        teamSize: 15,
        operationalMonths: 18,
        failureDate: new Date('2022-12-01'),
        primaryReason: 'Ignored customers',
        detailedAnalysis: `FarmTech India was an agricultural technology platform connecting farmers directly with buyers. We built sophisticated mobile apps with AI-powered crop predictions, weather integration, and dynamic pricing.

The problem? We built what we thought farmers needed, not what they actually wanted. Our apps required smartphones and data plans. Most of our target farmers had feature phones with limited connectivity.

We assumed farmers wanted to eliminate middlemen. In reality, the middlemen provided credit, storage, and transportation - services we hadn't replicated. Our "disruption" actually made farmers' lives harder.

By the time we realized our mistake and tried to simplify, we had burned through most of our runway building features nobody used.`,
        lessonsLearned: [
          'Understand your customer\'s actual context, not your assumptions',
          'Technology solutions must fit real-world constraints',
          'Middlemen often provide valuable services you don\'t see',
          'Building for emerging markets requires deep local understanding',
          'Simplicity beats sophistication for non-tech users'
        ],
        mistakes: [
          'Built the product without spending time with actual farmers',
          'Assumed smartphone penetration that didn\'t exist',
          'Underestimated the value that middlemen provide',
          'Over-engineered the solution for the market'
        ],
        adviceForOthers: 'Before building anything for a market you don\'t belong to, spend serious time living in that world. Assumptions kill startups. Get out of the building and truly understand your customer.',
        burnRate: 45000,
        revenueAtClosure: 5000,
        customerCount: 1200,
        isPublic: true,
        anonymousPost: false
      }
    ];
    const createdFailureReports = await FailureReport.insertMany(failureReports);
    console.log(`✓ Created ${createdFailureReports.length} failure reports`);

    console.log('\n========================================');
    console.log('✓ Database seeded successfully!');
    console.log('========================================\n');
    console.log('Test credentials:');
    console.log('----------------------------------------');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.userType})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: Password123!`);
    });
    console.log('\n========================================\n');

  } catch (error) {
    console.error('✗ Seeding error:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

run();
