"use client"

import { useState } from "react"
import {
  Heart,
  Search,
  Grid3X3,
  List,
  Star,
  Clock,
  Eye,
  Recycle,
  Shirt,
  User,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  ShoppingBag,
  Shield,
  X,
  Plus,
  Flame,
  Crown,
  Gem,
  Upload,
  Camera,
  Tag,
  DollarSign,
  Package,
  Palette,
  Ruler,
  CheckCircle,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

const ReWearMarketplace = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [likedItems, setLikedItems] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showListItemModal, setShowListItemModal] = useState(false)
  const [filters, setFilters] = useState({
    condition: [],
    size: [],
    priceRange: [0, 500],
    brand: [],
    color: [],
  })

  // Form state for new item
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    pointValue: "",
    size: "",
    condition: "good",
    color: "",
    brand: "",
    tags: "",
    category: "tops",
    images: [],
  })

  // Sample data based on your schema
  const categories = [
    { id: "all", name: "All Items", icon: "🌟", count: 11 },
    { id: "jackets", name: "Jackets", icon: "🧥", count: 3 },
    { id: "dresses", name: "Dresses", icon: "👗", count: 1 },
    { id: "shoes", name: "Shoes", icon: "👟", count: 2 },
    { id: "tops", name: "Tops", icon: "👕", count: 3 },
    { id: "bottoms", name: "Bottoms", icon: "👖", count: 145 },
  ]

  const [items, setItems] = useState([
    {
      itemId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Vintage Leather Motorcycle Jacket",
      description: "Authentic vintage Harley Davidson leather jacket in excellent condition...",
      pointValue: 150,
      size: "Medium",
      condition: "good",
      color: "Rich Brown",
      brand: "Harley Davidson",
      tags: ["vintage", "leather", "jacket", "motorcycle"],
      status: "approved",
      isFeatured: true,
      isAvailable: true,
      viewCount: 1247,
      createdAt: "2024-01-15T10:30:00Z",
      images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"],
      owner: {
        firstName: "Sarah",
        lastName: "Johnson",
        username: "fashion_forward_sarah",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
        rating: 4.9,
        isVerified: true,
      },
    },
    {
      itemId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Designer Silk Evening Dress",
      description: "Elegant black silk dress perfect for special occasions...",
      pointValue: 200,
      size: "Small",
      condition: "like-new",
      color: "Midnight Black",
      brand: "Versace",
      tags: ["designer", "silk", "dress", "evening"],
      status: "approved",
      isFeatured: true,
      isAvailable: true,
      viewCount: 892,
      createdAt: "2024-01-14T15:20:00Z",
      images: ["https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=400&fit=crop"],
      owner: {
        firstName: "Emma",
        lastName: "Wilson",
        username: "elegant_emma",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 4.8,
        isVerified: true,
      },
    },
    {
      itemId: "550e8400-e29b-41d4-a716-446655440002",
      title: "Retro Denim Jacket",
      description: "Classic 90s denim jacket with unique distressing...",
      pointValue: 85,
      size: "Large",
      condition: "good",
      color: "Faded Blue",
      brand: "Levi's",
      tags: ["retro", "denim", "jacket", "90s"],
      status: "approved",
      isFeatured: false,
      isAvailable: true,
      viewCount: 634,
      createdAt: "2024-01-13T09:45:00Z",
      images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop"],
      owner: {
        firstName: "Mike",
        lastName: "Chen",
        username: "vintage_mike",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 4.7,
        isVerified: false,
      },
    },
    {
      itemId: "550e8400-e29b-41d4-a716-446655440003",
      title: "Luxury Cashmere Scarf",
      description: "Soft cashmere scarf in beautiful burgundy color...",
      pointValue: 120,
      size: "One Size",
      condition: "new",
      color: "Burgundy",
      brand: "Burberry",
      tags: ["luxury", "cashmere", "scarf", "winter"],
      status: "approved",
      isFeatured: false,
      isAvailable: true,
      viewCount: 445,
      createdAt: "2024-01-12T14:30:00Z",
      images: ["https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=400&h=400&fit=crop"],
      owner: {
        firstName: "Lisa",
        lastName: "Anderson",
        username: "luxury_lisa",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        rating: 5.0,
        isVerified: true,
      },
    },
    {
      itemId: "550e8400-e29b-41d4-a716-446655440004",
      title: "Athletic Running Shoes",
      description: "High-performance running shoes in excellent condition...",
      pointValue: 95,
      size: "9",
      condition: "good",
      color: "White/Blue",
      brand: "Nike",
      tags: ["athletic", "running", "shoes", "sports"],
      status: "approved",
      isFeatured: false,
      isAvailable: true,
      viewCount: 567,
      createdAt: "2024-01-11T11:15:00Z",
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
      owner: {
        firstName: "Alex",
        lastName: "Rodriguez",
        username: "active_alex",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        rating: 4.6,
        isVerified: false,
      },
    },
    {
      itemId: "550e8400-e29b-41d4-a716-446655440005",
      title: "Bohemian Maxi Dress",
      description: "Flowing bohemian dress perfect for summer festivals...",
      pointValue: 75,
      size: "Medium",
      condition: "good",
      color: "Floral Print",
      brand: "Free People",
      tags: ["bohemian", "maxi", "dress", "summer"],
      status: "approved",
      isFeatured: false,
      isAvailable: true,
      viewCount: 389,
      createdAt: "2024-01-10T16:45:00Z",
      images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"],
      owner: {
        firstName: "Maya",
        lastName: "Patel",
        username: "boho_maya",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        rating: 4.8,
        isVerified: true,
      },
    },
  ])

  const featuredItems = items.filter((item) => item.isFeatured)
  const regularItems = items.filter((item) => !item.isFeatured)

  const toggleLike = (itemId) => {
    setLikedItems((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId)
      } else {
        newLiked.add(itemId)
      }
      return newLiked
    })
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

  const generateItemId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleSubmitNewItem = (e) => {
    e.preventDefault()

    if (!newItem.title || !newItem.description || !newItem.pointValue) {
      alert("Please fill in all required fields")
      return
    }

    const itemToAdd = {
      itemId: generateItemId(),
      title: newItem.title,
      description: newItem.description,
      pointValue: Number.parseInt(newItem.pointValue),
      size: newItem.size,
      condition: newItem.condition,
      color: newItem.color,
      brand: newItem.brand,
      tags: newItem.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      status: "approved",
      isFeatured: false,
      isAvailable: true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      images: newItem.images.length > 0 ? newItem.images : ["/placeholder.svg?height=400&width=400"],
      owner: {
        firstName: "You",
        lastName: "",
        username: "current_user",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        rating: 4.5,
        isVerified: true,
      },
    }

    setItems((prevItems) => [itemToAdd, ...prevItems])
    setShowListItemModal(false)

    // Reset form
    setNewItem({
      title: "",
      description: "",
      pointValue: "",
      size: "",
      condition: "good",
      color: "",
      brand: "",
      tags: "",
      category: "tops",
      images: [],
    })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real app, you'd upload these to a server
    // For demo purposes, we'll use placeholder URLs
    const imageUrls = files.map(
      (file, index) =>
        `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&random=${Date.now() + index}`,
    )
    setNewItem((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }))
  }

  const removeImage = (indexToRemove) => {
    setNewItem((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  const ItemCard = ({ item, featured = false }) => (
    <div
      className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${featured ? "ring-2 ring-yellow-400 shadow-xl" : ""}`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
          <Crown className="w-4 h-4" />
          <span>Featured</span>
        </div>
      )}

      {/* New Item Badge */}
      {new Date(item.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
          <Sparkles className="w-4 h-4" />
          <span>New</span>
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleLike(item.itemId)
        }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
      >
        <Heart className={`w-5 h-5 ${likedItems.has(item.itemId) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
      </button>

      {/* Image */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={item.images[0] || "/placeholder.svg?height=400&width=400"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button className="bg-white/90 backdrop-blur-sm text-emerald-600 p-3 rounded-full hover:bg-white transition-colors">
              <Eye className="w-5 h-5" />
            </button>
            <button className="bg-emerald-500 text-white p-3 rounded-full hover:bg-emerald-600 transition-colors">
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Points */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1 mr-2">{item.title}</h3>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
            <Recycle className="w-3 h-3" />
            <span>{item.pointValue}</span>
          </div>
        </div>

        {/* Item Details */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
            {item.condition}
          </div>
          <span className="flex items-center space-x-1">
            <Shirt className="w-4 h-4" />
            <span>{item.size}</span>
          </span>
        </div>

        {/* Owner Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <img
              src={item.owner.profileImage || "/placeholder.svg?height=100&width=100"}
              alt={item.owner.firstName}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
            />
            {item.owner.isVerified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                <Shield className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.owner.firstName} {item.owner.lastName}
            </p>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-600">{item.owner.rating}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{item.viewCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-emerald-600 text-xs font-medium">+{item.tags.length - 3} more</span>
          )}
        </div>
      </div>
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
                    <p className="text-sm text-gray-600">Marketplace</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for items, brands, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowListItemModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Item</span>
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Item Modal */}
        {showListItemModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Plus className="w-6 h-6 mr-2 text-emerald-600" />
                    List New Item
                  </h2>
                  <button
                    onClick={() => setShowListItemModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitNewItem} className="space-y-6">
                  {/* Images Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Photos (up to 5)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload photos</p>
                      </label>
                    </div>
                    {newItem.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {newItem.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={newItem.title}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Vintage Leather Jacket"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={newItem.description}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your item in detail..."
                    />
                  </div>

                  {/* Row 1: Points, Size, Condition */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Points *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newItem.pointValue}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, pointValue: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Ruler className="w-4 h-4 mr-1" />
                        Size
                      </label>
                      <select
                        value={newItem.size}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, size: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="One Size">One Size</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        Condition
                      </label>
                      <select
                        value={newItem.condition}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, condition: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="new">New</option>
                        <option value="like-new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Brand, Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        value={newItem.brand}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Nike, Zara, H&M"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Palette className="w-4 h-4 mr-1" />
                        Color
                      </label>
                      <input
                        type="text"
                        value={newItem.color}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, color: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Black, Blue, Red"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newItem.tags}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., vintage, casual, summer"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowListItemModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>List Item</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{items.length}</h3>
              <p className="text-gray-600">Active Items</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">1</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">7</h3>
              <p className="text-gray-600">Items Swapped</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">325</h3>
              <p className="text-gray-600">Points Earned</p>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-emerald-600" />
              Browse Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-lg"
                      : "bg-white/80 backdrop-blur-sm border-white/20 text-gray-700 hover:border-emerald-200"
                  }`}
                >
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className={`text-xs ${selectedCategory === category.id ? "text-white/80" : "text-gray-500"}`}>
                    {category.count} items
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Items */}
          {featuredItems.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Flame className="w-8 h-8 mr-3 text-orange-500" />
                  Featured Items
                </h2>
                <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div onClick={()=>(navigate("/itempage"))} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.map((item) => (
                  <ItemCard key={item.itemId} item={item} featured={true} />
                ))}
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/80 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-2xl font-medium text-gray-700 hover:bg-white transition-all flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {showFilters && <X className="w-4 h-4" />}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-2xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="points-high">Highest Points</option>
                <option value="points-low">Lowest Points</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Condition</h4>
                  <div className="space-y-2">
                    {["new", "like-new", "good", "fair"].map((condition) => (
                      <label key={condition} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-emerald-500" />
                        <span className="text-sm capitalize">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Size</h4>
                  <div className="space-y-2">
                    {["XS", "S", "M", "L", "XL"].map((size) => (
                      <label key={size} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-emerald-500" />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Brand</h4>
                  <div className="space-y-2">
                    {["Nike", "Adidas", "Zara", "H&M"].map((brand) => (
                      <label key={brand} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-emerald-500" />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Points Range</h4>
                  <div className="space-y-3">
                    <input type="range" min="0" max="500" className="w-full accent-emerald-500" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0</span>
                      <span>500+</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-2xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">All Items ({regularItems.length})</h2>
            </div>
            <div
              className={`grid gap-8 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {regularItems.map((item) => (
                <ItemCard key={item.itemId} item={item} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-2">
            <button className="bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-gray-600 hover:bg-white transition-all">
              Previous
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-xl transition-all ${
                  page === currentPage
                    ? "bg-emerald-500 text-white"
                    : "bg-white/80 backdrop-blur-sm border border-white/20 text-gray-600 hover:bg-white"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="bg-white/80 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-gray-600 hover:bg-white transition-all">
              Next
            </button>
          </div>
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
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default ReWearMarketplace
