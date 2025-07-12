"use client"

import { useState, useEffect } from "react"
import {
  Heart,
  Eye,
  Recycle,
  Shirt,
  MessageCircle,
  Award,
  Sparkles,
  Zap,
  Crown,
  Gem,
  Shield,
  Plus,
  Bell,
  CheckCircle,
  Leaf,
  Globe,
  Users,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Search,
  MoreHorizontal,
} from "lucide-react"

const ReWearDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [animatedStats, setAnimatedStats] = useState({
    points: 0,
    itemsListed: 0,
    swapsCompleted: 0,
    carbonSaved: 0,
  })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sample user data
  const userData = {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    firstName: "Sarah",
    lastName: "Johnson",
    username: "fashion_forward_sarah",
    email: "sarah.johnson@email.com",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
    pointsBalance: 2840,
    bio: "Sustainable fashion enthusiast | Vintage collector | Sharing my closet for a better world 🌍",
    joinedDate: "2023-06-12T00:00:00Z",
    itemsShared: 24,
    swapsCompleted: 18,
    rating: 4.9,
    isVerified: true,
    level: "Eco Warrior",
    nextLevelPoints: 3000,
    carbonFootprintSaved: 45.2, // kg CO2
    achievements: ["First Swap", "Eco Warrior", "Top Contributor", "Verified User"],
  }

  // Sample items data
  const userItems = [
    {
      itemId: "1",
      title: "Vintage Leather Jacket",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
      pointValue: 150,
      status: "available",
      views: 234,
      likes: 18,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      itemId: "2",
      title: "Designer Silk Dress",
      image: "https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=300&h=300&fit=crop",
      pointValue: 200,
      status: "swapped",
      views: 189,
      likes: 25,
      createdAt: "2024-01-10T15:20:00Z",
    },
    {
      itemId: "3",
      title: "Casual Denim Jacket",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=300&fit=crop",
      pointValue: 85,
      status: "pending",
      views: 67,
      likes: 8,
      createdAt: "2024-01-20T09:45:00Z",
    },
  ]

  // Sample swaps data
  const userSwaps = [
    {
      swapId: "1",
      type: "points",
      status: "completed",
      itemTitle: "Vintage Band T-Shirt",
      itemImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
      otherUser: "Emma Wilson",
      otherUserImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
      pointsUsed: 120,
      completedAt: "2024-01-18T14:30:00Z",
    },
    {
      swapId: "2",
      type: "trade",
      status: "ongoing",
      itemTitle: "Designer Handbag",
      itemImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop",
      otherUser: "Mike Chen",
      otherUserImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
      yourItem: "Leather Boots",
      createdAt: "2024-01-22T11:15:00Z",
    },
    {
      swapId: "3",
      type: "points",
      status: "pending",
      itemTitle: "Wool Winter Coat",
      itemImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop",
      otherUser: "Lisa Anderson",
      otherUserImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop",
      pointsUsed: 180,
      createdAt: "2024-01-25T16:45:00Z",
    },
  ]

  // Animate stats on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        points: userData.pointsBalance,
        itemsListed: userData.itemsShared,
        swapsCompleted: userData.swapsCompleted,
        carbonSaved: userData.carbonFootprintSaved,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      swapped: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-emerald-100 text-emerald-800",
      ongoing: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )

  const ItemCard = ({ item }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
      <div className="relative">
        <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
        >
          {item.status}
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{item.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{item.likes}</span>
              </div>
            </div>
            <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-emerald-600">
            <Recycle className="w-4 h-4" />
            <span className="font-medium">{item.pointValue} points</span>
          </div>
          <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )

  const SwapCard = ({ swap }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={swap.itemImage || "/placeholder.svg"}
          alt={swap.itemTitle}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{swap.itemTitle}</h3>
          <div className="flex items-center space-x-2">
            <img
              src={swap.otherUserImage || "/placeholder.svg"}
              alt={swap.otherUser}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">{swap.otherUser}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>{swap.status}</div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Recycle className="w-4 h-4" />
            <span>{swap.type === "points" ? `${swap.pointsUsed} points` : `Trade: ${swap.yourItem}`}</span>
          </span>
        </div>
        <span>{new Date(swap.completedAt || swap.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )

  const AchievementBadge = ({ achievement }) => (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-2xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
      <Award className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm font-medium">{achievement}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles className="absolute top-20 left-20 w-6 h-6 text-emerald-300 animate-float" />
        <Recycle className="absolute top-32 right-32 w-5 h-5 text-teal-300 animate-float animation-delay-1000" />
        <Shirt className="absolute bottom-32 left-32 w-7 h-7 text-cyan-300 animate-float animation-delay-2000" />
        <Heart className="absolute bottom-20 right-20 w-6 h-6 text-pink-300 animate-float animation-delay-3000" />
        <Gem className="absolute top-1/2 left-10 w-5 h-5 text-purple-300 animate-float animation-delay-1500" />
        <Award className="absolute top-3/4 right-10 w-6 h-6 text-yellow-300 animate-float animation-delay-2500" />
        <Leaf className="absolute top-1/4 right-1/4 w-6 h-6 text-green-300 animate-float animation-delay-3500" />
        <Globe className="absolute bottom-1/3 left-1/4 w-5 h-5 text-blue-300 animate-float animation-delay-4500" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ReWear
                    </span>
                    <p className="text-sm text-gray-600">Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-4">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>List Item</span>
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white transition-colors relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">3</span>
                    </div>
                  </button>
                </div>

                {/* Profile */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={userData.profileImage || "/placeholder.svg"}
                      alt={userData.firstName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    {userData.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Shield className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="font-semibold text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{userData.level}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-700/20"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {userData.firstName}! 👋</h1>
                    <p className="text-emerald-100 text-lg mb-6">
                      You've saved {userData.carbonFootprintSaved}kg of CO₂ through sustainable fashion choices!
                    </p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Recycle className="w-6 h-6" />
                        <div>
                          <p className="text-2xl font-bold">{animatedStats.points}</p>
                          <p className="text-emerald-100 text-sm">Points Balance</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Crown className="w-6 h-6" />
                        <div>
                          <p className="text-2xl font-bold">{userData.level}</p>
                          <p className="text-emerald-100 text-sm">Current Level</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                      <Leaf className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-100">Progress to next level</span>
                    <span className="text-white font-medium">
                      {userData.pointsBalance}/{userData.nextLevelPoints}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-1000 ease-out"
                      style={{ width: `${(userData.pointsBalance / userData.nextLevelPoints) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={Recycle}
              title="Total Points"
              value={animatedStats.points}
              subtitle="Available for swaps"
              trend={12}
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={Shirt}
              title="Items Listed"
              value={animatedStats.itemsListed}
              subtitle="Active listings"
              trend={8}
              color="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <StatCard
              icon={Zap}
              title="Swaps Completed"
              value={animatedStats.swapsCompleted}
              subtitle="Successful exchanges"
              trend={15}
              color="bg-gradient-to-br from-blue-500 to-cyan-600"
            />
            <StatCard
              icon={Leaf}
              title="CO₂ Saved"
              value={animatedStats.carbonSaved}
              subtitle="Kilograms"
              trend={22}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 inline-flex">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "items", label: "My Items", icon: Shirt },
                { id: "swaps", label: "Swaps", icon: Recycle },
                { id: "achievements", label: "Achievements", icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">List New Item</h3>
                  <p className="text-gray-600 mb-4">Share items from your closet and earn points</p>
                  <div className="flex items-center text-emerald-600 font-medium">
                    <span>Get started</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Items</h3>
                  <p className="text-gray-600 mb-4">Discover amazing items from other users</p>
                  <div className="flex items-center text-purple-600 font-medium">
                    <span>Explore now</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
                  <p className="text-gray-600 mb-4">Chat with other users about swaps</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>View messages</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-emerald-600" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: CheckCircle,
                      text: "Swap completed with Emma Wilson",
                      time: "2 hours ago",
                      color: "text-green-600",
                    },
                    {
                      icon: Heart,
                      text: "Your Vintage Jacket received 5 new likes",
                      time: "4 hours ago",
                      color: "text-pink-600",
                    },
                    {
                      icon: Zap,
                      text: "Earned 150 points from completed swap",
                      time: "1 day ago",
                      color: "text-yellow-600",
                    },
                    {
                      icon: MessageCircle,
                      text: "New message from Mike Chen",
                      time: "2 days ago",
                      color: "text-blue-600",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}
                      >
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.text}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">My Items ({userItems.length})</h2>
                <div className="flex items-center space-x-4">
                  <select className="bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>All Status</option>
                    <option>Available</option>
                    <option>Swapped</option>
                    <option>Pending</option>
                  </select>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all">
                    Add New Item
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <ItemCard key={item.itemId} item={item} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "swaps" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">My Swaps</h2>
                <div className="flex items-center space-x-4">
                  <select className="bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>All Swaps</option>
                    <option>Completed</option>
                    <option>Ongoing</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {userSwaps.map((swap) => (
                  <SwapCard key={swap.swapId} swap={swap} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Achievements</h2>
                <p className="text-xl text-gray-600">Celebrate your sustainable fashion journey!</p>
              </div>

              {/* Level Progress */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white text-center">
                <Crown className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">{userData.level}</h3>
                <p className="text-purple-100 mb-6">You're making a real difference in sustainable fashion!</p>
                <div className="bg-white/20 rounded-full h-4 mb-2">
                  <div
                    className="bg-white rounded-full h-4 transition-all duration-1000"
                    style={{ width: `${(userData.pointsBalance / userData.nextLevelPoints) * 100}%` }}
                  ></div>
                </div>
                <p className="text-purple-100">
                  {userData.nextLevelPoints - userData.pointsBalance} points to next level
                </p>
              </div>

              {/* Achievement Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {userData.achievements.map((achievement, index) => (
                  <AchievementBadge key={index} achievement={achievement} />
                ))}
              </div>

              {/* Impact Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Environmental Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Leaf className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">{userData.carbonFootprintSaved}kg</h4>
                    <p className="text-gray-600">CO₂ Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Recycle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">{userData.itemsShared}</h4>
                    <p className="text-gray-600">Items Shared</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">{userData.swapsCompleted}</h4>
                    <p className="text-gray-600">People Helped</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-2500 {
          animation-delay: 2.5s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-3500 {
          animation-delay: 3.5s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-4500 {
          animation-delay: 4.5s;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default ReWearDashboard
