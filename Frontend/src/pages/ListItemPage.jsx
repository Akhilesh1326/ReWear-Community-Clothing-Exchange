"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Heart,
  Recycle,
  Shirt,
  User,
  Sparkles,
  Award,
  X,
  Gem,
  Upload,
  Camera,
  Tag,
  Package,
  Palette,
  CheckCircle,
  ArrowLeft,
  Info,
  ImageIcon,
  Trash2,
  AlertCircle,
  Loader2,
  Eye,
  Star,
} from "lucide-react"

const ListItemPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointValue: "",
    size: "",
    condition: "",
    color: "",
    brand: "",
    categoryId: "",
    tags: [],
    images: [],
  })
  const [newTag, setNewTag] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [user, setUser] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/categories", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        } else {
          // Fallback to default categories if API fails
          setCategories([
            { category_id: "550e8400-e29b-41d4-a716-446655440001", name: "Jackets", icon: "🧥", is_active: true },
            { category_id: "550e8400-e29b-41d4-a716-446655440002", name: "Dresses", icon: "👗", is_active: true },
            { category_id: "550e8400-e29b-41d4-a716-446655440003", name: "Shoes", icon: "👟", is_active: true },
            { category_id: "550e8400-e29b-41d4-a716-446655440004", name: "Accessories", icon: "👜", is_active: true },
            { category_id: "550e8400-e29b-41d4-a716-446655440005", name: "Tops", icon: "👕", is_active: true },
            { category_id: "550e8400-e29b-41d4-a716-446655440006", name: "Bottoms", icon: "👖", is_active: true },
          ])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Use fallback categories
        setCategories([
          { category_id: "550e8400-e29b-41d4-a716-446655440001", name: "Jackets", icon: "🧥", is_active: true },
          { category_id: "550e8400-e29b-41d4-a716-446655440002", name: "Dresses", icon: "👗", is_active: true },
          { category_id: "550e8400-e29b-41d4-a716-446655440003", name: "Shoes", icon: "👟", is_active: true },
          { category_id: "550e8400-e29b-41d4-a716-446655440004", name: "Accessories", icon: "👜", is_active: true },
          { category_id: "550e8400-e29b-41d4-a716-446655440005", name: "Tops", icon: "👕", is_active: true },
          { category_id: "550e8400-e29b-41d4-a716-446655440006", name: "Bottoms", icon: "👖", is_active: true },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch user info for authentication check
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/auth/me", {
          credentials: "include",
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.data)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }
    fetchUserInfo()
  }, [])

  const conditions = [
    { value: "new", label: "New with tags", description: "Brand new, never worn", icon: "✨" },
    { value: "like-new", label: "Like New", description: "Excellent condition, barely worn", icon: "⭐" },
    { value: "good", label: "Good", description: "Good condition with minor signs of wear", icon: "👍" },
    { value: "fair", label: "Fair", description: "Noticeable wear but still functional", icon: "👌" },
  ]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"]

  const popularTags = [
    "vintage",
    "designer",
    "casual",
    "formal",
    "summer",
    "winter",
    "trendy",
    "classic",
    "boho",
    "minimalist",
    "streetwear",
    "sustainable",
  ]

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [validationErrors],
  )

  const addTag = useCallback(
    (tagToAdd = newTag) => {
      const trimmedTag = tagToAdd.trim().toLowerCase()
      if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, trimmedTag],
        }))
        setNewTag("")
      }
    },
    [newTag, formData.tags],
  )

  const removeTag = useCallback((tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }, [])

  const handleImageUpload = useCallback(
    (files) => {
      const newImages = Array.from(files).slice(0, 5 - formData.images.length)
      // Convert files to objects with both file and preview URL
      const imageObjects = newImages.map((file) => ({
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }))
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageObjects],
      }))
      // Clear validation error when images are added
      if (validationErrors.images) {
        setValidationErrors((prev) => ({ ...prev, images: "" }))
      }
    },
    [formData.images.length, validationErrors.images],
  )

  const removeImage = useCallback((indexToRemove) => {
    setFormData((prev) => {
      // Clean up the preview URL to prevent memory leaks
      const imageToRemove = prev.images[indexToRemove]
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return {
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
      }
    })
  }, [])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload(e.dataTransfer.files)
      }
    },
    [handleImageUpload],
  )

  // Client-side validation matching database schema
  const validateForm = useCallback(() => {
    const errors = {}

    // Title validation
    if (!formData.title.trim()) {
      errors.title = "Title is required"
    } else if (formData.title.length < 5 || formData.title.length > 100) {
      errors.title = "Title must be between 5 and 100 characters"
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    } else if (formData.description.length < 10 || formData.description.length > 1000) {
      errors.description = "Description must be between 10 and 1000 characters"
    }

    // Category validation
    if (!formData.categoryId) {
      errors.categoryId = "Category is required"
    }

    // Condition validation
    if (!formData.condition) {
      errors.condition = "Condition is required"
    }

    // Point value validation
    const points = Number.parseInt(formData.pointValue)
    if (!formData.pointValue) {
      errors.pointValue = "Point value is required"
    } else if (isNaN(points) || points < 1 || points > 1000) {
      errors.pointValue = "Point value must be between 1 and 1000"
    }

    // Images validation
    if (formData.images.length === 0) {
      errors.images = "At least one image is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Upload images to get URLs
  const uploadImages = async (images) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const imageUrls = images.map(
        (_, index) => `https://images.unsplash.com/photo-${Date.now()}-${index}?w=400&h=400&fit=crop`,
      )
      return imageUrls
    } catch (error) {
      throw new Error("Failed to upload images")
    }
  }

  // API call to create item
  const createItem = async (itemData) => {
    try {
      const response = await fetch("http://localhost:8000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(itemData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }
      return data
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check if the server is running.")
      }
      throw error
    }
  }

  const handleSubmit = async () => {
    setSubmitError("")
    setValidationErrors({})

    if (!user) {
      setSubmitError("You must be logged in to list an item. Please log in and try again.")
      return
    }

    if (!validateForm()) {
      setSubmitError("Please fix the validation errors below")
      return
    }

    setIsSubmitting(true)
    try {
      let imageUrls = []
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images)
      }

      const itemData = {
        categoryId: formData.categoryId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        size: formData.size || null,
        condition: formData.condition,
        color: formData.color.trim() || null,
        brand: formData.brand.trim() || null,
        tags: formData.tags,
        pointValue: Number.parseInt(formData.pointValue),
        imageUrls: imageUrls,
      }

      const result = await createItem(itemData)
      setSubmitSuccess(true)
      setSubmitError("")
      console.log("Item created successfully:", result)
    } catch (error) {
      console.error("Error creating item:", error)
      setSubmitError(error.message || "Failed to create item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepComplete = useMemo(() => {
    return (step) => {
      switch (step) {
        case 1:
          return (
            formData.title &&
            formData.description &&
            formData.categoryId &&
            formData.title.length >= 5 &&
            formData.title.length <= 100 &&
            formData.description.length >= 10 &&
            formData.description.length <= 1000
          )
        case 2:
          return (
            formData.condition &&
            formData.pointValue &&
            Number.parseInt(formData.pointValue) >= 1 &&
            Number.parseInt(formData.pointValue) <= 1000
          )
        case 3:
          return formData.images.length > 0
        default:
          return false
      }
    }
  }, [formData])

  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.category_id === formData.categoryId)
  }, [categories, formData.categoryId])

  // Show loading state while categories are being fetched
  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

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
                <button className="p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ReWear
                    </span>
                    <p className="text-sm text-gray-600">List New Item</p>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="hidden md:flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                        currentStep === step
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                          : isStepComplete(step)
                            ? "bg-green-500 text-white"
                            : "bg-white/80 backdrop-blur-sm text-gray-600"
                      }`}
                    >
                      {isStepComplete(step) ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-12 h-1 mx-2 rounded-full transition-all ${
                          isStepComplete(step) ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                {user && (
                  <div className="hidden sm:block text-sm text-gray-600">
                    Welcome, {user.first_name || user.username}
                  </div>
                )}
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="md:hidden bg-white/60 backdrop-blur-sm border-b border-white/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of 3</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step <= currentStep ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <Package className="w-8 md:w-10 h-8 md:h-10 mr-4 text-emerald-600" />
                  Tell us about your item
                </h1>
                <p className="text-lg md:text-xl text-gray-600">Let's start with the basics</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Item Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Vintage Leather Motorcycle Jacket"
                      className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                        validationErrors.title ? "border-red-300" : "border-white/20"
                      }`}
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.title}
                      </p>
                    )}
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
                      {formData.title.length > 80 && <p className="text-xs text-amber-600">Almost at limit!</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your item in detail. Include brand, material, fit, and any special features..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none ${
                        validationErrors.description ? "border-red-300" : "border-white/20"
                      }`}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.description}
                      </p>
                    )}
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">{formData.description.length}/1000 characters</p>
                      {formData.description.length > 800 && <p className="text-xs text-amber-600">Almost at limit!</p>}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-4">Category *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {categories
                        .filter((cat) => cat.is_active)
                        .map((category) => (
                          <button
                            key={category.category_id}
                            onClick={() => handleInputChange("categoryId", category.category_id)}
                            className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                              formData.categoryId === category.category_id
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500"
                                : "bg-white/80 backdrop-blur-sm border-white/20 text-gray-700 hover:border-emerald-200"
                            }`}
                          >
                            <div className="text-xl md:text-2xl mb-2">{category.icon}</div>
                            <div className="font-medium text-xs md:text-sm">{category.name}</div>
                          </button>
                        ))}
                    </div>
                    {validationErrors.categoryId && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.categoryId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <Info className="w-8 md:w-10 h-8 md:h-10 mr-4 text-emerald-600" />
                  Item Details
                </h1>
                <p className="text-lg md:text-xl text-gray-600">Help buyers understand your item better</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Condition */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-4">Condition *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {conditions.map((condition) => (
                        <button
                          key={condition.value}
                          onClick={() => handleInputChange("condition", condition.value)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                            formData.condition === condition.value
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500"
                              : "bg-white/80 backdrop-blur-sm border-white/20 text-gray-700 hover:border-emerald-200"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">{condition.icon}</span>
                            <span className="font-medium">{condition.label}</span>
                          </div>
                          <div
                            className={`text-sm ${
                              formData.condition === condition.value ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            {condition.description}
                          </div>
                        </button>
                      ))}
                    </div>
                    {validationErrors.condition && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.condition}
                      </p>
                    )}
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => handleInputChange("size", e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select size (optional)</option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Point Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Point Value *</label>
                    <div className="relative">
                      <Recycle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.pointValue}
                        onChange={(e) => handleInputChange("pointValue", e.target.value)}
                        placeholder="150"
                        className={`w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          validationErrors.pointValue ? "border-red-300" : "border-white/20"
                        }`}
                      />
                    </div>
                    {validationErrors.pointValue && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.pointValue}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Points must be between 1 and 1000</p>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                    <div className="relative">
                      <Palette className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        placeholder="e.g., Midnight Black"
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                      placeholder="e.g., Nike, Zara, H&M"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Tags */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tags ({formData.tags.length}/10)
                    </label>

                    {/* Popular Tags */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => addTag(tag)}
                            disabled={formData.tags.includes(tag) || formData.tags.length >= 10}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              formData.tags.includes(tag)
                                ? "bg-emerald-100 text-emerald-800 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current Tags */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
                          >
                            <span>#{tag}</span>
                            <button onClick={() => removeTag(tag)} className="text-emerald-600 hover:text-emerald-800">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Custom Tag */}
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                          placeholder="Add custom tag"
                          disabled={formData.tags.length >= 10}
                          className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={() => addTag()}
                        disabled={!newTag.trim() || formData.tags.length >= 10}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <Camera className="w-8 md:w-10 h-8 md:h-10 mr-4 text-emerald-600" />
                  Add Photos
                </h1>
                <p className="text-lg md:text-xl text-gray-600">Great photos help your item get noticed</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all ${
                    dragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-6 md:w-8 h-6 md:h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Drag and drop your photos here</h3>
                      <p className="text-gray-600 mb-4">or click to browse</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer inline-flex items-center space-x-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Choose Photos</span>
                      </label>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Upload up to 5 photos. First photo will be the main image.</p>
                      <p>Supported formats: JPG, PNG, WebP (max 10MB each)</p>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Your Photos ({formData.images.length}/5)</h3>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{showPreview ? "Hide" : "Show"} Preview</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {formData.images.map((imageObj, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageObj.preview || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-2xl cursor-pointer"
                            onClick={() => {
                              setSelectedImageIndex(index)
                              setShowPreview(true)
                            }}
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Main</span>
                            </div>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {validationErrors.images && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.images}
                      </p>
                    )}

                    {/* Image Preview Modal */}
                    {showPreview && (
                      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-4 max-w-2xl w-full">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">
                              Photo {selectedImageIndex + 1} of {formData.images.length}
                            </h4>
                            <button
                              onClick={() => setShowPreview(false)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <img
                            src={formData.images[selectedImageIndex]?.preview || "/placeholder.svg"}
                            alt={`Preview ${selectedImageIndex + 1}`}
                            className="w-full h-96 object-cover rounded-xl"
                          />
                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                              disabled={selectedImageIndex === 0}
                              className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() =>
                                setSelectedImageIndex(Math.min(formData.images.length - 1, selectedImageIndex + 1))
                              }
                              disabled={selectedImageIndex === formData.images.length - 1}
                              className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 font-medium">Error</p>
              </div>
              <p className="text-red-600 mt-1">{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700 font-medium">Success!</p>
              </div>
              <p className="text-green-600 mt-1">
                Your item has been submitted successfully and is pending approval. You'll receive a notification once
                it's reviewed.
              </p>
            </div>
          )}

          {/* Item Preview Card */}
          {(formData.title || formData.images.length > 0) && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </h3>
              <div className="bg-white rounded-xl p-4 border">
                <div className="flex space-x-4">
                  {formData.images.length > 0 && (
                    <img
                      src={formData.images[0].preview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{formData.title || "Your item title"}</h4>
                    {selectedCategory && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="mr-1">{selectedCategory.icon}</span>
                        {selectedCategory.name}
                      </p>
                    )}
                    {formData.pointValue && (
                      <p className="text-sm font-medium text-emerald-600 flex items-center mt-1">
                        <Recycle className="w-4 h-4 mr-1" />
                        {formData.pointValue} points
                      </p>
                    )}
                    {formData.condition && (
                      <p className="text-xs text-gray-500 mt-1">
                        Condition: {conditions.find((c) => c.value === formData.condition)?.label}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white/80 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-4">
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepComplete(currentStep)}
                  className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all ${
                    isStepComplete(currentStep)
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepComplete(currentStep) || isSubmitting || !user}
                  className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all flex items-center space-x-2 ${
                    isStepComplete(currentStep) && !isSubmitting && user
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Publish Item</span>
                    </>
                  )}
                </button>
              )}
            </div>
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
      `}</style>
    </div>
  )
}

export default ListItemPage
