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
  Loader2,
  AlertCircle,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

const API_BASE_URL = "http://localhost:8000"

const DashBoard = () => {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview")
  const [animatedStats, setAnimatedStats] = useState({
    points: 0,
    itemsListed: 0,
    swapsCompleted: 0,
    carbonSaved: 0,
  })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real data states
  const [userData, setUserData] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [userItems, setUserItems] = useState([])
  const [userSwaps, setUserSwaps] = useState([])
  const [categories, setCategories] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Get current user from JWT token
  const getCurrentUser = async () => {
    try {
      const response = await apiCall("/api/auth/me")
      return response.data
    } catch (error) {
      // Fallback: use a demo user ID for testing
      console.warn("Could not get current user, using demo user")
      return { user_id: "550e8400-e29b-41d4-a716-446655440001" }
    }
  }

  // Fetch user data
  const fetchUserData = async (userId) => {
    try {
      const response = await apiCall(`/api/users/${userId}`)
      setUserData(response.data)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setError("Failed to load user data")
    }
  }

  // Fetch user statistics
  const fetchUserStats = async (userId) => {
    try {
      const response = await apiCall(`/api/users/${userId}/stats`)
      setUserStats(response.data)
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  // Fetch user items
  const fetchUserItems = async (userId) => {
    try {
      const response = await apiCall(`/api/users/${userId}/items`)
      setUserItems(response.data || [])
    } catch (error) {
      console.error("Failed to fetch user items:", error)
      setUserItems([])
    }
  }

  // Fetch user swaps
  const fetchUserSwaps = async (userId) => {
    try {
      const response = await apiCall(`/api/users/${userId}/swaps`)
      setUserSwaps(response.data || [])
    } catch (error) {
      console.error("Failed to fetch user swaps:", error)
      setUserSwaps([])
    }
  }

  // Fetch notifications
  const fetchNotifications = async (userId) => {
    try {
      const response = await apiCall(`/api/users/${userId}/notifications`)
      setNotifications(response.data || [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      setNotifications([])
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await apiCall("/api/categories")
      setCategories(response.data || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([])
    }
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get current user
        const currentUser = await getCurrentUser()
        const userId = currentUser.user_id
        setCurrentUserId(userId)

        // Fetch all data in parallel
        await Promise.all([
          fetchUserData(userId),
          fetchUserStats(userId),
          fetchUserItems(userId),
          fetchUserSwaps(userId),
          fetchNotifications(userId),
          fetchCategories(),
        ])
      } catch (error) {
        console.error("Failed to initialize data:", error)
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // Animate stats when data is loaded
  useEffect(() => {
    if (userStats && userData) {
      const timer = setTimeout(() => {
        setAnimatedStats({
          points: userData.points_balance || 0,
          itemsListed: userStats.approved_items || 0,
          swapsCompleted: userStats.completed_swaps || 0,
          carbonSaved: (userStats.completed_swaps || 0) * 2.5,
        })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [userStats, userData])

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      swapped: "bg-blue-100 text-blue-800",
      deleted: "bg-gray-100 text-gray-800",
      accepted: "bg-emerald-100 text-emerald-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getConditionColor = (condition) => {
    const colors = {
      new: "bg-green-100 text-green-800",
      "like-new": "bg-emerald-100 text-emerald-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    }
    return colors[condition] || "bg-gray-100 text-gray-800"
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

  const ItemCard = ({ item }) => {
    const primaryImage = item.images?.find((img) => img.isPrimary) || item.images?.[0]
    const likesCount = Math.floor((item.viewCount || 0) * 0.1)

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
        <div className="relative">
          <img
            src={primaryImage?.imageUrl || "/placeholder.svg?height=200&width=300"}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div
            className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
          >
            {item.status}
          </div>
          <div
            className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
          >
            {item.condition}
          </div>
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{item.viewCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{likesCount}</span>
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1 text-emerald-600">
              <Recycle className="w-4 h-4" />
              <span className="font-medium">{item.pointValue} points</span>
            </div>
            <span className="text-sm text-gray-500">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
          {item.brand && <p className="text-sm text-gray-600 mb-1">Brand: {item.brand}</p>}
          {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
        </div>
      </div>
    )
  }

  const SwapCard = ({ swap }) => {
    const otherUser =
      swap.requester_id === currentUserId
        ? {
            first_name: swap.owner_first_name,
            last_name: swap.owner_last_name,
            username: swap.owner_username,
            profile_image: swap.owner_profile_image,
          }
        : {
            first_name: swap.requester_first_name,
            last_name: swap.requester_last_name,
            username: swap.requester_username,
            profile_image: swap.requester_profile_image,
          }

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={swap.item?.primaryImage || "/placeholder.svg?height=64&width=64"}
            alt={swap.item?.title || "Item"}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{swap.item?.title || "Unknown Item"}</h3>
            <div className="flex items-center space-x-2">
              <img
                src={otherUser?.profile_image || "/placeholder.svg?height=24&width=24"}
                alt={otherUser?.username || "User"}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">
                {otherUser?.first_name} {otherUser?.last_name}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>
            {swap.status}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Recycle className="w-4 h-4" />
              <span>{swap.swap_type === "points" ? `${swap.points_used || 0} points` : "Trade swap"}</span>
            </span>
          </div>
          <span>
            {swap.completed_at || swap.created_at
              ? new Date(swap.completed_at || swap.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        {swap.message && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 italic">"{swap.message}"</p>
          </div>
        )}
      </div>
    )
  }

  const AchievementBadge = ({ achievement }) => (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-2xl text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
      <Award className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm font-medium">{achievement}</p>
    </div>
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No user data
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No user data available</p>
        </div>
      </div>
    )
  }

  const achievements = ["First Swap", "Eco Warrior", "Top Contributor", "Verified User"]
  const nextLevelPoints = 3000

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
                <button onClick={()=>{navigate("/log")}} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <span>LogOut</span>
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white transition-colors relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications.filter((n) => !n.isRead).length > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {notifications.filter((n) => !n.isRead).length}
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Profile */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={userData.profile_image || "/placeholder.svg?height=48&width=48"}
                      alt={userData.first_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    {userData.email_verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Shield className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="font-semibold text-gray-900">
                      {userData.first_name} {userData.last_name}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{userData.user_type}</p>
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
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {userData.first_name}! 👋</h1>
                    <p className="text-emerald-100 text-lg mb-6">
                      You've saved {animatedStats.carbonSaved.toFixed(1)}kg of CO₂ through sustainable fashion choices!
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
                          <p className="text-2xl font-bold capitalize">{userData.user_type}</p>
                          <p className="text-emerald-100 text-sm">Account Type</p>
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
                      {userData.points_balance}/{nextLevelPoints}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((userData.points_balance / nextLevelPoints) * 100, 100)}%` }}
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
              subtitle="Approved listings"
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
              value={Math.round(animatedStats.carbonSaved)}
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
                <div onClick={()=>{navigate("/itemlisting")}} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
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
                  {notifications.length > 0 ? (
                    notifications.slice(0, 4).map((notification, index) => (
                      <div
                        key={notification.notificationId || index}
                        className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500">
                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
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
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Swapped</option>
                    <option>Rejected</option>
                  </select>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all">
                    Add New Item
                  </button>
                </div>
              </div>
              {userItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userItems.map((item) => (
                    <ItemCard key={item.itemId} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No items listed yet</p>
                  <p className="text-gray-400">Start by listing your first item!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "swaps" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">My Swaps ({userSwaps.length})</h2>
                <div className="flex items-center space-x-4">
                  <select className="bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>All Swaps</option>
                    <option>Pending</option>
                    <option>Accepted</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              {userSwaps.length > 0 ? (
                <div className="space-y-4">
                  {userSwaps.map((swap) => (
                    <SwapCard key={swap.swap_id} swap={swap} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Recycle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No swaps yet</p>
                  <p className="text-gray-400">Start swapping to see your activity here!</p>
                </div>
              )}
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
                <h3 className="text-3xl font-bold mb-2 capitalize">{userData.user_type} Member</h3>
                <p className="text-purple-100 mb-6">You're making a real difference in sustainable fashion!</p>
                <div className="bg-white/20 rounded-full h-4 mb-2">
                  <div
                    className="bg-white rounded-full h-4 transition-all duration-1000"
                    style={{ width: `${Math.min((userData.points_balance / nextLevelPoints) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-purple-100">
                  {Math.max(nextLevelPoints - userData.points_balance, 0)} points to next level
                </p>
              </div>

              {/* Achievement Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {achievements.map((achievement, index) => (
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
                    <h4 className="text-3xl font-bold text-gray-900">{animatedStats.carbonSaved.toFixed(1)}kg</h4>
                    <p className="text-gray-600">CO₂ Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Recycle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">{animatedStats.itemsListed}</h4>
                    <p className="text-gray-600">Items Shared</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">{animatedStats.swapsCompleted}</h4>
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

export default DashBoard
