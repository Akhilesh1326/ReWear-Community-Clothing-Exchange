 import React, { useState, useEffect } from 'react';
import { 
  Recycle, 
  Shirt, 
  ArrowRight, 
  Star, 
  Users, 
  TrendingUp, 
  Heart, 
  ShoppingBag, 
  Leaf, 
  Award,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Globe,
  Sparkles
} from 'lucide-react';

const ReWearLanding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const featuredItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop",
      category: "Jackets",
      condition: "Like New",
      points: 150,
      user: "Sarah M."
    },
    {
      id: 2,
      title: "Designer Silk Blouse",
      image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=500&fit=crop",
      category: "Tops",
      condition: "Excellent",
      points: 200,
      user: "Emma K."
    },
    {
      id: 3,
      title: "Sustainable Sneakers",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
      category: "Shoes",
      condition: "Good",
      points: 120,
      user: "Alex R."
    },
    {
      id: 4,
      title: "Boho Summer Dress",
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
      category: "Dresses",
      condition: "Like New",
      points: 180,
      user: "Maya L."
    }
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Recycle, value: "50K+", label: "Items Exchanged" },
    { icon: Leaf, value: "2M+", label: "CO2 Saved (kg)" },
    { icon: Award, value: "98%", label: "Satisfaction Rate" }
  ];

  const features = [
    {
      icon: ShoppingBag,
      title: "Direct Swaps",
      description: "Exchange items directly with other users for instant satisfaction"
    },
    {
      icon: Star,
      title: "Points System",
      description: "Earn points by listing items and redeem them for pieces you love"
    },
    {
      icon: CheckCircle,
      title: "Quality Assured",
      description: "Every item is verified for condition and authenticity"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with fashion enthusiasts worldwide"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Shirt className="absolute top-20 left-20 w-8 h-8 text-emerald-300 animate-float" />
        <Recycle className="absolute top-32 right-32 w-6 h-6 text-teal-300 animate-float animation-delay-1000" />
        <Heart className="absolute top-1/2 left-10 w-5 h-5 text-cyan-300 animate-float animation-delay-2000" />
        <Sparkles className="absolute top-40 left-1/2 w-7 h-7 text-emerald-300 animate-float animation-delay-3000" />
        <Leaf className="absolute bottom-32 right-10 w-6 h-6 text-teal-300 animate-float animation-delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center transform -rotate-12">
              <Shirt className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ReWear
            </h1>
            <p className="text-xs text-gray-600">Sustainable Fashion</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">Browse</a>
          <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">How It Works</a>
          <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">Community</a>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
                Fashion
                <br />
                <span className="relative inline-block">
                  Reimagined
                  <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transform scale-x-0 animate-scale-x animation-delay-1000"></div>
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join the sustainable fashion revolution. Exchange, discover, and give your clothes a second life while earning rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2">
                  <span>Start Swapping</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 border border-white/20">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 transform transition-all duration-700 hover:scale-105 hover:shadow-lg ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ animationDelay: `${index * 200}ms` }}>
                <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Items Carousel */}
      <div className="relative z-10 px-6 py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Featured Items</h3>
            <p className="text-xl text-gray-600">Discover amazing pieces from our community</p>
          </div>
          
          <div className="relative">
            <div className="flex overflow-hidden rounded-3xl">
              {featuredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 w-full md:w-1/3 lg:w-1/4 p-4 transition-transform duration-500 ease-in-out`}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.condition}
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        {item.points} pts
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm mb-4">{item.category} • by {item.user}</p>
                      <div className="flex space-x-3">
                        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 text-sm font-medium">
                          Swap Request
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-medium">
                          Redeem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-emerald-500 scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Why Choose ReWear?</h3>
            <p className="text-xl text-gray-600">Experience the future of sustainable fashion</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Wardrobe?
          </h3>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion enthusiasts who are already making sustainable choices. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2">
              <span>Browse Items</span>
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2">
              <span>List an Item</span>
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/20 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg">
                  <Recycle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center transform -rotate-12">
                  <Shirt className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h5 className="text-xl font-bold text-gray-800">ReWear</h5>
                <p className="text-sm text-gray-600">Sustainable Fashion Exchange</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-600">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2025 ReWear. All rights reserved. Made with ❤️ for a sustainable future.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes scale-x {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-scale-x {
          animation: scale-x 0.8s ease-out forwards;
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
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ReWearLanding;