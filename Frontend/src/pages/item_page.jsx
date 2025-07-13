import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Share2, 
  Eye, 
  Star, 
  MapPin, 
  Clock, 
  Tag, 
  Recycle, 
  Shirt,
  User,
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  ShoppingBag,
  Camera,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Shield,
  CheckCircle,
  X
} from 'lucide-react';

const ReWearItemPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapType, setSwapType] = useState('points');
  const [swapMessage, setSwapMessage] = useState('');
  const [selectedUserItem, setSelectedUserItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data based on your schema
  const itemData = {
    itemId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Vintage Harley Davidson Leather Jacket",
    description: "Authentic vintage Harley Davidson leather jacket in excellent condition. This iconic piece features genuine leather construction with classic styling. Perfect for motorcycle enthusiasts or anyone wanting to add a touch of rebellion to their wardrobe. Shows minimal wear with beautiful patina that adds character.",
    size: "Large",
    condition: "good",
    color: "Brown",
    brand: "Harley Davidson",
    tags: ["vintage", "leather", "jacket", "motorcycle", "harley", "davidson"],
    pointValue: 180,
    status: "approved",
    isFeatured: true,
    isAvailable: true,
    viewCount: 247,
    createdAt: "2024-01-15T10:30:00Z",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop"
    ],
    owner: {
      userId: "550e8400-e29b-41d4-a716-446655440001",
      firstName: "Akhilesh",
      lastName: "Pimple",
      username: "akhi_pie",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
      pointsBalance: 120,
      itemsShared: 2,
      successfulSwaps: 1,
      rating: 4.8,
      joinDate: "2023-06-10",
      bio: "Sustainable fashion enthusiast sharing quality pieces for a greener future! 🌱"
    },
    category: {
      name: "Outerwear",
      icon: "🧥"
    }
  };

  const userItems = [
    {
      itemId: "item1",
      title: "Designer Denim Jacket",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&h=200&fit=crop",
      pointValue: 50,
      condition: "like-new"
    },
    {
      itemId: "item2", 
      title: "Vintage Band T-Shirt",
      image: "https://images.unsplash.com/photo-1583743814966-8936f37f4cf9?w=200&h=200&fit=crop",
      pointValue: 45,
      condition: "good"
    },
    {
      itemId: "item3",
      title: "Wool Sweater",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop",
      pointValue: 85,
      condition: "good"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % itemData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + itemData.images.length) % itemData.images.length);
  };

  const handleSwapRequest = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setShowSwapModal(false);
    
    // Show success message
    alert(`Swap request sent successfully! ${swapType === 'points' ? `${itemData.pointValue} points will be used.` : 'Your item has been offered for trade.'}`);
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-emerald-100 text-emerald-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const timeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Shirt className="absolute top-20 left-20 w-6 h-6 text-emerald-300/50 animate-float" />
        <Recycle className="absolute top-32 right-32 w-5 h-5 text-teal-300/50 animate-float animation-delay-1000" />
        <Tag className="absolute bottom-32 left-32 w-7 h-7 text-cyan-300/50 animate-float animation-delay-2000" />
        <Sparkles className="absolute bottom-20 right-20 w-6 h-6 text-emerald-300/50 animate-float animation-delay-3000" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="p-2 hover:bg-emerald-50 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-emerald-600" />
              </button>
              <div className="ml-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center transform rotate-3">
                  <Recycle className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ReWear
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-emerald-50 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-emerald-600" />
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-600'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={itemData.images[currentImageIndex]} 
                  alt={itemData.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {itemData.isFeatured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Featured
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {itemData.images.length}
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors p-2 rounded-full shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors p-2 rounded-full shadow-lg"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {itemData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-emerald-500 shadow-lg' 
                      : 'hover:shadow-md opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${itemData.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Title and Stats */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{itemData.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {itemData.viewCount} views
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {timeAgo(itemData.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl font-bold text-xl">
                    {itemData.pointValue} pts
                  </div>
                </div>
              </div>

              {/* Tags and Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500 font-medium">Brand</span>
                  <p className="text-lg font-semibold text-gray-900">{itemData.brand}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Size</span>
                  <p className="text-lg font-semibold text-gray-900">{itemData.size}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Color</span>
                  <p className="text-lg font-semibold text-gray-900">{itemData.color}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Condition</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(itemData.condition)}`}>
                    {itemData.condition}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <span className="text-sm text-gray-500 font-medium mb-2 block">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {itemData.tags.map((tag, index) => (
                    <span key={index} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{itemData.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Request Swap</span>
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Owner Profile */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img 
                    src={itemData.owner.profileImage} 
                    alt={itemData.owner.firstName}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{itemData.owner.firstName} {itemData.owner.lastName}</h3>
                  <p className="text-gray-600">@{itemData.owner.username}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{itemData.owner.rating} • {itemData.owner.successfulSwaps} successful swaps</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-4">{itemData.owner.bio}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{itemData.owner.pointsBalance}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">{itemData.owner.itemsShared}</p>
                  <p className="text-xs text-gray-500">Items Shared</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-600">{itemData.owner.successfulSwaps}</p>
                  <p className="text-xs text-gray-500">Swaps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Request Swap</h3>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Swap Type Selection */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Choose Swap Type</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSwapType('points')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      swapType === 'points'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Use Points</p>
                    <p className="text-sm text-gray-600">{itemData.pointValue} pts</p>
                  </button>
                  <button
                    onClick={() => setSwapType('trade')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      swapType === 'trade'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Trade Item</p>
                    <p className="text-sm text-gray-600">Your item</p>
                  </button>
                </div>
              </div>

              {/* Item Selection for Trade */}
              {swapType === 'trade' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Your Item</h4>
                  <div className="space-y-3">
                    {userItems.map((item) => (
                      <button
                        key={item.itemId}
                        onClick={() => setSelectedUserItem(item)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                          selectedUserItem?.itemId === item.itemId
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.pointValue} pts • {item.condition}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Add a Message</h4>
                <textarea
                  value={swapMessage}
                  onChange={(e) => setSwapMessage(e.target.value)}
                  placeholder="Tell the owner why you'd like to swap..."
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSwapRequest}
                  disabled={isLoading || (swapType === 'trade' && !selectedUserItem)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Request</span>
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

export default ReWearItemPage;