import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Eye, 
  ChevronUp, 
  ChevronDown,
  Image as ImageIcon,
  Loader
} from "lucide-react";
import {
  fetchAllCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides,
  clearError
} from "@/store/admin/carousel-slice";

const CarouselAdmin = () => {
  const dispatch = useDispatch();
  const { carouselList, isLoading, error } = useSelector(state => state.adminCarousel);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cta: "",
    category: "electronics",
    bg: "from-blue-500 to-indigo-500",
    isActive: true
  });
  

  const backgroundOptions = [
  { value: "from-blue-500 to-indigo-500", label: "Blue to Indigo" },
  { value: "from-pink-500 to-rose-500", label: "Pink to Rose" },
  { value: "from-yellow-400 to-orange-400", label: "Yellow to Orange" },
  { value: "from-green-500 to-emerald-500", label: "Green to Emerald" },
  { value: "from-purple-500 to-violet-500", label: "Purple to Violet" },
  { value: "from-red-500 to-pink-500", label: "Red to Pink" },

  // New vibrant, festival-inspired gradients
  { value: "from-orange-500 to-pink-500", label: "Sunset Orange to Pink (Diwali Glow)" },
  { value: "from-fuchsia-500 to-yellow-400", label: "Fuchsia to Yellow (Holi Splash)" },
  { value: "from-rose-500 to-purple-600", label: "Rose to Royal Purple (Navratri Vibes)" },
  { value: "from-teal-500 to-lime-400", label: "Teal to Lime (Spring Festival)" },
  { value: "from-amber-400 to-red-500", label: "Amber to Red (Festive Warmth)" },
  { value: "from-indigo-500 to-pink-500", label: "Indigo to Pink (Celebration Night)" },
  { value: "from-green-500 to-yellow-400", label: "Green to Yellow (Harvest Joy)" },
  { value: "from-cyan-400 to-violet-500", label: "Cyan to Violet (Fireworks Sky)" },
  // Indian Independence Day Tricolour
  { value: "from-orange-500 via-white to-green-500", label: "Indian Tricolour (Independence Day)" }
];


  // Fetch slides on component mount
  useEffect(() => {
    dispatch(fetchAllCarouselSlides());
  }, [dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Preview mode auto-slide
  useEffect(() => {
    if (previewMode && carouselList.length > 0) {
      const activeSlides = carouselList.filter(slide => slide.isActive);
      if (activeSlides.length > 0) {
        const interval = setInterval(() => {
          setCurrentPreview(prev => (prev + 1) % activeSlides.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [previewMode, carouselList]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const createFormData = () => {
    const form = new FormData();
    form.append('title', formData.title);
    form.append('subtitle', formData.subtitle);
    form.append('cta', formData.cta);
    form.append('link', `/shop/listing?category=${formData.category}`);
    form.append('bg', formData.bg);
    form.append('isActive', formData.isActive);
    
    if (imageFile) {
      form.append('image', imageFile);
    }
    
    return form;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile && !editingSlide) {
      alert('Please select an image');
      return;
    }

    const form = createFormData();

    try {
      if (editingSlide) {
        await dispatch(updateCarouselSlide({ 
          id: editingSlide._id, 
          formData: form 
        })).unwrap();
      } else {
        await dispatch(createCarouselSlide(form)).unwrap();
      }

      // Reset form and states
      resetForm();
      
      // Show success message
      alert(editingSlide ? 'Slide updated successfully!' : 'Slide created successfully!');
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      cta: "",
      link: "",
      bg: "from-blue-500 to-indigo-500",
      isActive: true
    });
    setImageFile(null);
    setImagePreview("");
    setIsAddingNew(false);
    setEditingSlide(null);
  };

  const handleEdit = (slide) => {
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta,
      category: new URLSearchParams(slide.link.split("?")[1]).get("category") || "",
      bg: slide.bg,
      isActive: slide.isActive
    });
    setImagePreview(slide.image);
    setEditingSlide(slide);
    setIsAddingNew(false);
  };

  const handleDelete = async (slideId) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        await dispatch(deleteCarouselSlide(slideId)).unwrap();
        alert('Slide deleted successfully!');
      } catch (error) {
        alert(`Error: ${error}`);
      }
    }
  };

  const handleReorder = async (slideId, direction) => {
    const currentIndex = carouselList.findIndex(s => s._id === slideId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === carouselList.length - 1)
    ) {
      return;
    }

    const newSlides = [...carouselList];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap slides
    [newSlides[currentIndex], newSlides[targetIndex]] = 
    [newSlides[targetIndex], newSlides[currentIndex]];
    
    // Create slideOrders array with new positions
    const slideOrders = newSlides.map((slide, index) => ({
      id: slide._id,
      order: index + 1
    }));

    try {
      await dispatch(reorderCarouselSlides(slideOrders)).unwrap();
    } catch (error) {
      alert(`Error reordering slides: ${error}`);
    }
  };

  const activeSlides = carouselList.filter(slide => slide.isActive);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold pr-8">Carousel Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Exit Preview" : "Preview"}
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            Add New Slide
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      )}

      {/* Preview Mode */}
      {previewMode && activeSlides.length > 0 && (
        <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
          <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            {activeSlides.map((slide, index) => (
              <div
                key={slide._id}
                className={`absolute top-0 left-0 w-full h-full flex items-center justify-between transition-opacity duration-1000 ${
                  index === currentPreview ? "opacity-100" : "opacity-0"
                } bg-gradient-to-r ${slide.bg}`}
              >
                <div className="px-16 flex-1 flex flex-col justify-center text-white">
                  <h1 className="text-5xl font-bold mb-3">{slide.title}</h1>
                  <p className="text-xl mb-5">{slide.subtitle}</p>
                  <button className="bg-white text-gray-800 font-semibold px-6 py-3 hover:bg-gray-200 w-fit rounded">
                    {slide.cta}
                  </button>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-[400px] h-auto rounded-lg shadow-lg object-contain"
                  />
                </div>
              </div>
            ))}
            
            {/* Preview dots */}
            <div className="absolute bottom-4 w-full flex justify-center gap-2">
              {activeSlides.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    index === currentPreview ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentPreview(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddingNew || editingSlide) && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingSlide ? "Edit Slide" : "Add New Slide"}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Call to Action *</label>
              <input
                type="text"
                name="cta"
                value={formData.cta}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Subtitle *</label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                rows="2"
                required
              />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="toys">Toys</option>
                    <option value="farming">Farming</option>
                </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Background Gradient</label>
              <select
                name="bg"
                value={formData.bg}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                {backgroundOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={`mt-2 h-8 rounded bg-gradient-to-r ${formData.bg}`}></div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Image {!editingSlide && "*"}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded cursor-pointer hover:bg-gray-200"
                >
                  <Upload className="w-4 h-4" />
                  {editingSlide ? "Change Image" : "Upload Image"}
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active (show in carousel)
              </label>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingSlide ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            Current Slides ({carouselList.length})
            {activeSlides.length !== carouselList.length && (
              <span className="text-sm text-gray-500 ml-2">
                ({activeSlides.length} active)
              </span>
            )}
          </h2>
        </div>
        
        <div className="divide-y">
          {carouselList.map((slide, index) => (
            <div key={slide._id} className="p-4 flex items-center gap-4">
              {/* Order controls */}
              <div className="flex flex-col">
                <button
                  onClick={() => handleReorder(slide._id, 'up')}
                  disabled={index === 0 || isLoading}
                  className="p-1 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 text-center">{index + 1}</span>
                <button
                  onClick={() => handleReorder(slide._id, 'down')}
                  disabled={index === carouselList.length - 1 || isLoading}
                  className="p-1 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Image */}
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{slide.title}</h3>
                  {!slide.isActive && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{slide.subtitle}</p>
                <p className="text-xs text-gray-400">
                  CTA: {slide.cta} | Link: {slide.link}
                </p>
              </div>

              {/* Background preview */}
              <div className={`w-12 h-8 rounded bg-gradient-to-r ${slide.bg}`}></div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  disabled={isLoading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  disabled={isLoading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {carouselList.length === 0 && !isLoading && (
            <div className="p-8 text-center text-gray-500">
              No slides created yet. Click "Add New Slide" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselAdmin;