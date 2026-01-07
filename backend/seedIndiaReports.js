/**
 * Seed script to add sample failure reports for India with different cities
 * Run with: node seedIndiaReports.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const FailureReport = require('./models/FailureReport');
const User = require('./models/User');

// India city coordinates for realistic data
const indiaCities = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
];

const sampleReports = [
  {
    startupName: 'FoodKart Express',
    industry: 'Food & Beverage',
    city: 'Mumbai',
    fundingRaised: 250000,
    teamSize: 12,
    operationalMonths: 18,
    primaryReason: 'Ran out of cash',
    detailedAnalysis: 'We burned through our seed funding too quickly on aggressive marketing without achieving unit economics. High delivery costs in Mumbai and intense competition from Swiggy and Zomato made it impossible to sustain operations.',
    lessonsLearned: ['Focus on unit economics first', 'Don\'t compete directly with well-funded giants'],
    burnRate: 15000
  },
  {
    startupName: 'TechEd Solutions',
    industry: 'Education',
    city: 'Bangalore',
    fundingRaised: 500000,
    teamSize: 25,
    operationalMonths: 24,
    primaryReason: 'No market need',
    detailedAnalysis: 'Built an AI-powered learning platform for corporate training, but discovered most Indian companies weren\'t ready to pay premium prices for automated solutions. We misjudged market readiness and willingness to adopt AI in education sector.',
    lessonsLearned: ['Validate market demand before building', 'Price sensitivity is critical in Indian market'],
    burnRate: 22000
  },
  {
    startupName: 'HealthTech India',
    industry: 'Healthcare',
    city: 'Delhi',
    fundingRaised: 800000,
    teamSize: 30,
    operationalMonths: 30,
    primaryReason: 'Legal challenges',
    detailedAnalysis: 'Telemedicine platform faced numerous regulatory hurdles with Indian medical council. Licensing requirements across states became unmanageable, and legal compliance costs exceeded our runway.',
    lessonsLearned: ['Understand regulatory landscape before starting', 'Healthcare in India requires significant legal preparation'],
    burnRate: 28000
  },
  {
    startupName: 'FinFlow Payments',
    industry: 'Finance',
    city: 'Hyderabad',
    fundingRaised: 1200000,
    teamSize: 40,
    operationalMonths: 28,
    primaryReason: 'Got outcompeted',
    detailedAnalysis: 'Digital payments space in India became saturated with PhonePe, Paytm, and Google Pay. We couldn\'t differentiate enough, and customer acquisition costs skyrocketed as competition intensified.',
    lessonsLearned: ['Blue ocean strategy is crucial in fintech', 'Timing matters - we entered too late'],
    burnRate: 45000
  },
  {
    startupName: 'ShopLocal E-commerce',
    industry: 'E-commerce',
    city: 'Chennai',
    fundingRaised: 350000,
    teamSize: 18,
    operationalMonths: 20,
    primaryReason: 'Business model failure',
    detailedAnalysis: 'Hyperlocal e-commerce for regional products seemed promising, but logistics costs and low order values made profitability impossible. Return rates were high due to quality issues with local vendors.',
    lessonsLearned: ['Logistics infrastructure is critical in India', 'Quality control cannot be compromised'],
    burnRate: 18000
  },
  {
    startupName: 'CodeCraft Academy',
    industry: 'Education',
    city: 'Pune',
    fundingRaised: 180000,
    teamSize: 10,
    operationalMonths: 15,
    primaryReason: 'Poor marketing',
    detailedAnalysis: 'Excellent coding bootcamp curriculum but failed to reach target audience. Relied heavily on organic growth while competitors spent aggressively on digital marketing and partnerships with colleges.',
    lessonsLearned: ['Great product isn\'t enough', 'Marketing budget is essential'],
    burnRate: 12000
  },
  {
    startupName: 'PropertyTech Solutions',
    industry: 'Real Estate',
    city: 'Ahmedabad',
    fundingRaised: 400000,
    teamSize: 15,
    operationalMonths: 22,
    primaryReason: 'Product mis-timed',
    detailedAnalysis: 'Virtual property tours platform launched just before COVID, but the market wasn\'t ready. By the time COVID made it relevant, we had already pivoted twice and lost focus. Competitors caught up quickly.',
    lessonsLearned: ['Timing can make or break a startup', 'Stick to vision during tough times'],
    burnRate: 19000
  },
  {
    startupName: 'AI Recruitment Hub',
    industry: 'Technology',
    city: 'Kolkata',
    fundingRaised: 220000,
    teamSize: 12,
    operationalMonths: 16,
    primaryReason: 'Ignored customers',
    detailedAnalysis: 'Built features we thought recruiters needed without talking to actual users. When we finally got feedback, discovered our AI matching was too complex and recruiters preferred simpler solutions.',
    lessonsLearned: ['Customer feedback is invaluable', 'Build with users, not for users'],
    burnRate: 14000
  },
  {
    startupName: 'GreenEnergy Startup',
    industry: 'Manufacturing',
    city: 'Gurgaon',
    fundingRaised: 900000,
    teamSize: 35,
    operationalMonths: 32,
    primaryReason: 'Pricing/Cost issues',
    detailedAnalysis: 'Solar panel manufacturing unit faced Chinese competition with 40% lower prices. Government subsidies weren\'t enough to offset cost disadvantages. Raw material import costs killed margins.',
    lessonsLearned: ['Manufacturing in India requires scale', 'Compete on innovation, not price against China'],
    burnRate: 30000
  },
  {
    startupName: 'StreamFlix India',
    industry: 'Entertainment',
    city: 'Noida',
    fundingRaised: 600000,
    teamSize: 22,
    operationalMonths: 26,
    primaryReason: 'Lost focus',
    detailedAnalysis: 'Started as regional content streaming platform, then added gaming, then social features. Spread too thin trying to compete with Netflix, Amazon Prime, and Hotstar simultaneously.',
    lessonsLearned: ['Focus is everything', 'Niche can be powerful'],
    burnRate: 24000
  }
];

async function seedIndiaReports() {
  try {
    // Connect to MongoDB - use environment variable or default
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-failure-db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find a user to assign as founder
    let founder = await User.findOne({ role: 'founder' });
    
    // If no founder role, just use the first user
    if (!founder) {
      founder = await User.findOne();
    }
    
    if (!founder) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using user: ${founder.name} (${founder._id})`);

    // Create reports
    const reports = [];
    for (const report of sampleReports) {
      const cityData = indiaCities.find(c => c.city === report.city);
      
      const failureReport = new FailureReport({
        startupName: report.startupName,
        founder: founder._id,
        industry: report.industry,
        location: {
          city: cityData.city,
          state: cityData.state,
          country: 'India',
          coordinates: {
            type: 'Point',
            coordinates: [cityData.lng, cityData.lat] // [longitude, latitude]
          }
        },
        fundingRaised: report.fundingRaised,
        teamSize: report.teamSize,
        operationalMonths: report.operationalMonths,
        failureDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        primaryReason: report.primaryReason,
        detailedAnalysis: report.detailedAnalysis,
        lessonsLearned: report.lessonsLearned,
        burnRate: report.burnRate,
        revenueAtClosure: Math.floor(report.fundingRaised * 0.1),
        customerCount: Math.floor(Math.random() * 5000) + 100,
        isPublic: true,
        anonymousPost: false
      });

      await failureReport.save();
      reports.push(failureReport);
      console.log(`✓ Created report for ${report.startupName} in ${cityData.city}`);
    }

    console.log(`\n✅ Successfully created ${reports.length} failure reports across India`);
    console.log('\nCities covered:');
    indiaCities.forEach(city => {
      console.log(`  - ${city.city}, ${city.state}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedIndiaReports();
