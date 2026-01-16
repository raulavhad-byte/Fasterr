import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, IndianRupee, Tag, Type, MapPin, Wand2, Star, X } from 'lucide-react';
import { Category, User, Condition } from '../types';
import { addProduct, getProductById, updateProduct } from '../services/storageService';
import { generateProductDescription } from '../services/geminiService';

interface SellProps {
  user: User | null;
}

const Sell: React.FC<SellProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: Category.OTHER,
    condition: 'Good' as Condition,
    location: '',
    features: '' 
  });
  
  const [description, setDescription] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (editId) {
      const product = getProductById(editId);
      if (product) {
        if (user && product.sellerId !== user.id) {
            navigate('/');
            return;
        }

        setFormData({
            title: product.title,
            price: product.price.toString(),
            category: product.category,
            condition: product.condition,
            location: product.location,
            features: ''
        });
        setDescription(product.description);
        setImagePreviews(product.images || [product.image]);
      }
    }
  }, [editId, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeImage = (index: number) => {
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.features) {
      alert("Please enter a title and some key features first.");
      return;
    }
    
    setIsGenerating(true);
    const generated = await generateProductDescription(formData.title, formData.category, formData.features);
    setDescription(generated);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (imagePreviews.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const productData = {
        title: formData.title,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        description: description || formData.features,
        location: formData.location,
        image: imagePreviews[0],
        images: imagePreviews,
    };

    if (editId) {
        const existingProduct = getProductById(editId);
        if (existingProduct) {
             const updatedProduct = {
                ...existingProduct,
                ...productData,
                description: description || formData.features || existingProduct.description,
             };
             updateProduct(updatedProduct);
        }
    } else {
        const newProduct = {
            id: Date.now().toString(),
            ...productData,
            sellerId: user.id,
            sellerName: user.name,
            createdAt: Date.now(),
            status: 'active' as const
        };
        addProduct(newProduct);
    }
    
    navigate(editId ? '/my-listings' : '/');
  };

  const conditions: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{editId ? 'Edit Item' : 'Sell an Item'}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Photos</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {imagePreviews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={src} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          <X className="w-4 h-4" />
                      </button>
                  </div>
              ))}
              <div 
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-medium">Add Photo</span>
              </div>
          </div>
          <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple
              onChange={handleImageChange} 
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                name="title"
                required
                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                placeholder="e.g. iPhone 13 Pro Max"
                value={formData.title}
                onChange={handleChange}
                />
            </div>
            </div>

            {/* Price */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="number"
                name="price"
                required
                min="0"
                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                />
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                    name="category"
                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border bg-white"
                    value={formData.category}
                    onChange={handleChange}
                    >
                    {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                    </select>
                </div>
            </div>
            
             {/* Condition */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Star className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                    name="condition"
                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border bg-white"
                    value={formData.condition}
                    onChange={handleChange}
                    >
                    {conditions.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    </select>
                </div>
            </div>

            {/* Location */}
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="text"
                    name="location"
                    required
                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                    placeholder="e.g. Downtown, Chicago"
                    value={formData.location}
                    onChange={handleChange}
                    />
                </div>
            </div>
        </div>

        {/* AI Description Section */}
        <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-brand-900">
                    Smart Description
                </label>
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                    <Wand2 className="w-3.5 h-3.5" />
                    {isGenerating ? 'Generating...' : 'Enhance with AI'}
                </button>
            </div>
            
            <p className="text-xs text-brand-700 mb-3">
                {editId ? "Update features to regenerate description." : "Enter key features below, then click 'Enhance' to generate a professional sales pitch."}
            </p>

            <textarea
                name="features"
                rows={2}
                className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-brand-200 rounded-md mb-3 p-2 border"
                placeholder="Key features (e.g., 'Like new, battery health 90%, includes case')"
                value={formData.features}
                onChange={handleChange}
            />

            <label className="block text-xs font-medium text-gray-500 mb-1">Final Description</label>
            <textarea
                name="description"
                required
                rows={4}
                className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The final description will appear here..."
            />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all transform hover:scale-[1.01]"
          >
            {editId ? 'Update Item' : 'Post Item Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sell;