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
    company: 'FinTech Innovations',
    location: 'San Francisco, CA',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    skills: [
      { name: 'Product Management', endorsements: 45 },
      { name: 'Fundraising', endorsements: 32 },
      { name: 'Team Building', endorsements: 28 },
      { name: 'Fintech', endorsements: 38 }
    ],
    experience: [
      { title: 'CEO & Co-Founder', company: 'FinTech Innovations', period: '2023 - Present', description: 'Building next-gen payment infrastructure' },
      { title: 'Founder', company: 'PayFlow (Failed)', period: '2020 - 2022', description: 'Built payment solution, learned valuable lessons' }
    ],
    education: [
      { school: 'Stanford University', degree: 'MBA', period: '2016 - 2018' }
    ],
    ventures: [
      { name: 'FinTech Innovations', role: 'CEO', status: 'active', period: '2023 - Present', description: 'Payment infrastructure for startups' },
      { name: 'PayFlow', role: 'Founder', status: 'failed', period: '2020 - 2022', description: 'B2B payments - shut down due to market timing' }
    ]
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    password: 'Password123!',
    userType: 'investor',
    bio: 'Angel investor focused on early-stage SaaS startups. Former founder of 2 companies (1 exit, 1 failure). I invest in resilient founders who have learned from setbacks.',
    company: 'Rodriguez Ventures',
    location: 'New York, NY',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    skills: [
      { name: 'Angel Investing', endorsements: 52 },
      { name: 'Due Diligence', endorsements: 41 },
      { name: 'Startup Strategy', endorsements: 38 }
    ],
    experience: [
      { title: 'Managing Partner', company: 'Rodriguez Ventures', period: '2021 - Present', description: 'Angel investing in early-stage startups' },
      { title: 'Founder & CEO', company: 'DataSync (Acquired)', period: '2015 - 2020', description: 'Built and sold data analytics platform' }
    ]
  },
  {
    name: 'Emma Watson',
    email: 'emma@example.com',
    password: 'Password123!',
    userType: 'job-seeker',
    bio: 'Full-stack developer with 6 years experience. Previously worked at 2 startups (both failed, learned a lot). Looking for my next adventure at an early-stage company.',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    skills: [
      { name: 'React', endorsements: 28 },
      { name: 'Node.js', endorsements: 25 },
      { name: 'MongoDB', endorsements: 22 },
      { name: 'TypeScript', endorsements: 20 },
      { name: 'AWS', endorsements: 18 }
    ],
    experience: [
      { title: 'Senior Full-Stack Developer', company: 'TechStartup (Failed)', period: '2021 - 2023', description: 'Built core platform before company shutdown' },
      { title: 'Software Engineer', company: 'HealthTrack (Failed)', period: '2019 - 2021', description: 'Healthcare tech startup, regulatory challenges' }
    ]
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: 'Password123!',
    userType: 'founder',
    bio: 'First-time founder building in the AI/ML space. Previously lead engineer at Google. Left to pursue my startup dream after seeing too many good ideas die in big companies.',
    company: 'AI Innovations Inc',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    skills: [
      { name: 'Machine Learning', endorsements: 55 },
      { name: 'Python', endorsements: 48 },
      { name: 'AI Architecture', endorsements: 42 },
      { name: 'Technical Leadership', endorsements: 35 }
    ],
    experience: [
      { title: 'Founder & CTO', company: 'AI Innovations Inc', period: '2023 - Present', description: 'Building AI-powered business automation' },
      { title: 'Staff Engineer', company: 'Google', period: '2018 - 2023', description: 'Led ML infrastructure team' }
    ]
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa@example.com',
    password: 'Password123!',
    userType: 'mentor',
    bio: '20 years in tech. Built and sold 3 companies. Now helping the next generation of founders avoid common pitfalls. Specialize in B2B SaaS and marketplace businesses.',
    company: 'Thompson Advisory',
    location: 'Boston, MA',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
    skills: [
      { name: 'Mentorship', endorsements: 78 },
      { name: 'M&A', endorsements: 45 },
      { name: 'Scaling Startups', endorsements: 62 },
      { name: 'Board Advisory', endorsements: 38 }
    ]
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    password: 'Password123!',
    userType: 'founder',
    bio: 'E-commerce entrepreneur. My first startup failed after burning through $1.5M. Learned hard lessons about unit economics. Now building a profitable D2C brand.',
    company: 'EcoShop',
    location: 'Los Angeles, CA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    skills: [
      { name: 'E-commerce', endorsements: 34 },
      { name: 'D2C Marketing', endorsements: 29 },
      { name: 'Supply Chain', endorsements: 22 }
    ],
    experience: [
      { title: 'Founder', company: 'EcoShop', period: '2023 - Present', description: 'Sustainable e-commerce platform' },
      { title: 'CEO', company: 'FastShip (Failed)', period: '2020 - 2022', description: 'Same-day delivery startup, burned through runway' }
    ],
    ventures: [
      { name: 'EcoShop', role: 'Founder', status: 'active', period: '2023 - Present', description: 'Sustainable products marketplace' },
      { name: 'FastShip', role: 'CEO', status: 'failed', period: '2020 - 2022', description: 'Failed due to high burn rate and competition from Amazon' }
    ]
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'Password123!',
    userType: 'investor',
    bio: 'Partner at Sunrise Ventures. We back founders who have experienced failure and grown from it. Focus on healthcare, fintech, and climate tech. Check size $500K-$3M.',
    company: 'Sunrise Ventures',
    location: 'Palo Alto, CA',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    skills: [
      { name: 'Venture Capital', endorsements: 65 },
      { name: 'Healthcare Tech', endorsements: 48 },
      { name: 'Climate Tech', endorsements: 42 }
    ]
  },
  {
    name: 'Alex Turner',
    email: 'alex@example.com',
    password: 'Password123!',
    userType: 'job-seeker',
    bio: 'Product designer with startup DNA. Survived 2 startup shutdowns, came out with thick skin and a killer portfolio. Looking for early-stage opportunities where design matters.',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    skills: [
      { name: 'UI/UX Design', endorsements: 35 },
      { name: 'Figma', endorsements: 42 },
      { name: 'Design Systems', endorsements: 28 },
      { name: 'User Research', endorsements: 25 }
    ],
    experience: [
      { title: 'Lead Product Designer', company: 'SocialWave (Failed)', period: '2021 - 2023', description: 'Led design for social commerce platform' },
      { title: 'Senior Designer', company: 'TaskFlow (Failed)', period: '2019 - 2021', description: 'First design hire at productivity startup' }
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
