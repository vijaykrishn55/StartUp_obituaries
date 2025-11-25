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

// Sample users
const users = [
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    password: 'Password123!',
    userType: 'founder',
    bio: 'Serial entrepreneur. Building the future of fintech.',
    company: 'FinTech Innovations',
    location: 'San Francisco, CA',
    verified: true,
    skills: [
      { name: 'Product Management', endorsements: 45 },
      { name: 'Fundraising', endorsements: 32 },
      { name: 'Team Building', endorsements: 28 }
    ]
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    password: 'Password123!',
    userType: 'investor',
    bio: 'Angel investor focused on early-stage SaaS startups.',
    company: 'Rodriguez Ventures',
    location: 'New York, NY',
    verified: true
  },
  {
    name: 'Emma Watson',
    email: 'emma@example.com',
    password: 'Password123!',
    userType: 'job-seeker',
    bio: 'Full-stack developer passionate about clean code and great UX.',
    location: 'Austin, TX',
    skills: [
      { name: 'React', endorsements: 18 },
      { name: 'Node.js', endorsements: 15 },
      { name: 'MongoDB', endorsements: 12 }
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

    // Create sample posts
    console.log('Creating posts...');
    const posts = [
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
        companyName: 'TaskFlow',
        foundedYear: '2022',
        closedYear: '2023',
        totalFunding: '$2M'
      },
      {
        author: createdUsers[0]._id,
        type: 'insight',
        title: 'Building a Remote-First Culture from Day One',
        content: 'Here are the practices that helped us build a strong remote culture with a distributed team across 3 continents...',
        tags: ['remote-work', 'culture', 'team'],
        published: true
      },
      {
        author: createdUsers[1]._id,
        type: 'funding',
        title: 'Excited to announce our $5M Series A!',
        subtitle: 'Leading the next wave of AI-powered analytics',
        content: 'We\'re thrilled to announce that we\'ve raised $5M in Series A funding led by Sequoia Capital...',
        tags: ['funding', 'series-a', 'ai'],
        published: true,
        fundingAmount: '$5M',
        fundingStage: 'Series A',
        investors: 'Sequoia Capital, Y Combinator'
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log(`✓ Created ${createdPosts.length} posts`);

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
        user: createdUsers[2]._id,
        name: 'Emma Watson',
        bio: 'Former healthcare tech CEO. Led a team through 2 pivots before eventual shutdown. Expert in regulatory challenges.',
        location: 'Austin, TX',
        previousStartup: 'HealthTrack (HealthTech)',
        skills: ['Healthcare', 'Compliance', 'B2B Sales'],
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
        type: 'Venture Capital',
        focus: 'Early-stage SaaS, Fintech',
        stage: 'Pre-seed to Series A',
        checkSize: '$250K - $2M',
        location: 'New York, NY',
        description: 'We invest in founders who\'ve learned from past experiences. Your failure story is your edge.',
        investments: [
          { company: 'TechFlow', amount: '$1M', year: '2023' },
          { company: 'DataSync', amount: '$500K', year: '2024' }
        ]
      }
    ];
    const createdInvestors = await Investor.insertMany(investors);
    console.log(`✓ Created ${createdInvestors.length} investor profiles`);

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
