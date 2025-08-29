import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { analyticsAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [startupTrends, setStartupTrends] = useState([]);
  const [failureReasons, setFailureReasons] = useState([]);
  const [industryBreakdown, setIndustryBreakdown] = useState([]);
  const [engagement, setEngagement] = useState(null);
  const [funding, setFunding] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        userGrowthRes,
        startupTrendsRes,
        failureReasonsRes,
        industryRes,
        engagementRes,
        fundingRes,
        userRolesRes
      ] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getUserGrowth(),
        analyticsAPI.getStartupTrends(),
        analyticsAPI.getFailureReasons(),
        analyticsAPI.getIndustryBreakdown(),
        analyticsAPI.getEngagement(),
        analyticsAPI.getFunding(),
        analyticsAPI.getUserRoles()
      ]);

      setOverview(overviewRes.data);
      setUserGrowth(userGrowthRes.data);
      setStartupTrends(startupTrendsRes.data);
      setFailureReasons(failureReasonsRes.data);
      setIndustryBreakdown(industryRes.data);
      setEngagement(engagementRes.data);
      setFunding(fundingRes.data);
      setUserRoles(userRolesRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">Insights into platform usage and trends</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="btn-primary flex items-center"
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Users</p>
                <p className="text-3xl font-bold">{formatNumber(overview.totalUsers)}</p>
                <p className="text-sm text-blue-100">+{overview.newUsers} this month</p>
              </div>
              <UsersIcon className="h-12 w-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-r from-red-500 to-red-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total Startups</p>
                <p className="text-3xl font-bold">{formatNumber(overview.totalStartups)}</p>
                <p className="text-sm text-red-100">+{overview.newStartups} this month</p>
              </div>
              <BuildingOfficeIcon className="h-12 w-12 text-red-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-r from-green-500 to-green-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Reactions</p>
                <p className="text-3xl font-bold">{formatNumber(overview.totalReactions)}</p>
                <p className="text-sm text-green-100">Community engagement</p>
              </div>
              <HeartIcon className="h-12 w-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Active Users</p>
                <p className="text-3xl font-bold">{formatNumber(overview.activeUsers)}</p>
                <p className="text-sm text-purple-100">Last 30 days</p>
              </div>
              <ArrowTrendingUpIcon className="h-12 w-12 text-purple-200" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Failure Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-xl font-semibold">Top Failure Reasons</h3>
          </div>
          <div className="space-y-4">
            {failureReasons.slice(0, 6).map((reason, index) => (
              <div key={reason.reason} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-900">{reason.reason}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{reason.count}</div>
                  <div className="text-sm text-gray-500">{reason.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Industry Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-xl font-semibold">Top Industries</h3>
          </div>
          <div className="space-y-4">
            {industryBreakdown.slice(0, 6).map((industry, index) => (
              <div key={industry.industry} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-900">{industry.industry}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{industry.count}</div>
                  <div className="text-sm text-gray-500">{industry.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Engagement & Funding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Stats */}
        {engagement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <div className="flex items-center mb-6">
              <HeartIcon className="h-6 w-6 text-pink-500 mr-2" />
              <h3 className="text-xl font-semibold">Community Engagement</h3>
            </div>
            
            <div className="space-y-6">
              {/* Reaction Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reaction Types</h4>
                <div className="space-y-2">
                  {engagement.reactionStats.map((stat) => (
                    <div key={stat.type} className="flex items-center justify-between">
                      <span className="capitalize text-gray-700">{stat.type}</span>
                      <span className="font-semibold">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average Reactions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(engagement.avgReactions * 10) / 10}
                  </div>
                  <div className="text-sm text-gray-600">Average reactions per startup</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <UsersIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold">User Roles</h3>
          </div>
          <div className="space-y-4">
            {userRoles.map((role) => (
              <div key={role.role} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">{role.role}</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{role.count}</div>
                  <div className="text-sm text-gray-500">{role.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Funding Analysis */}
      {funding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-xl font-semibold">Funding Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Funding by Stage */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Funding by Stage</h4>
              <div className="space-y-3">
                {funding.fundingByStage.map((stage) => (
                  <div key={stage.stage} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{stage.stage}</span>
                      <span className="text-sm text-gray-600">{stage.startup_count} startups</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(stage.total_funding)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg: {formatCurrency(stage.avg_funding)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Ranges */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Funding Distribution</h4>
              <div className="space-y-3">
                {funding.fundingRanges.map((range) => (
                  <div key={range.funding_range} className="flex items-center justify-between">
                    <span className="text-gray-700">{range.funding_range}</span>
                    <span className="font-semibold text-gray-900">{range.count} startups</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsPage;
