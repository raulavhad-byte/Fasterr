import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, isProductFavorite, toggleFavorite, getSellerStats, getReviews, addReview, getChatMessages, sendChatMessage } from '../services/storageService';
import { Product, User, Review, ChatMessage } from '../types';
import { MapPin, Calendar, Share2, MessageCircle, Phone, ArrowLeft, ShieldCheck, Heart, ChevronLeft, ChevronRight, Star, Send, X, Paperclip, ImageIcon, Bell } from 'lucide-react';

interface ProductDetailProps {
    user: User | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isFav, setIsFav] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [sellerStats, setSellerStats] = useState<{totalListings: number, averageRating: string, reviewCount: number} | null>(null);
  const [sellerReviews, setSellerReviews] = useState<Review[]>([]);
  
  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const showChatRef = useRef(showChat);

  // Keep ref in sync with state for async operations
  useEffect(() => {
    showChatRef.current = showChat;
    if (showChat) {
        setUnreadCount(0);
        setShowNotification(false);
    }
  }, [showChat]);

  useEffect(() => {
    if (id) {
      const found = getProductById(id);
      if (found) {
          setProduct(found);
          setIsFav(isProductFavorite(id));
          setImages(found.images && found.images.length > 0 ? found.images : [found.image]);
          setSellerStats(getSellerStats(found.sellerId));
          setSellerReviews(getReviews(found.sellerId));
          if (user) {
              setChatMessages(getChatMessages(found.id));
          }
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
                <Link to="/" className="text-brand-600 hover:underline mt-4 block">Return Home</Link>
            </div>
        </div>
    );
  }

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
          alert("Link copied to clipboard!");
      }).catch(err => {
          console.error("Failed to copy", err);
      });
  };

  const handleToggleFavorite = () => {
      const newState = toggleFavorite(product.id);
      setIsFav(newState);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const simulateSellerReply = () => {
    setTimeout(() => {
        if (!product) return;
        
        const replyText = "Thanks for your interest! Yes, the item is still available. Would you like to come see it?";
        const replyMsg: ChatMessage = {
            id: Date.now().toString(),
            productId: product.id,
            senderId: product.sellerId, // Simulated seller ID
            text: replyText,
            createdAt: Date.now()
        };
        
        sendChatMessage(replyMsg);
        setChatMessages(prev => [...prev, replyMsg]);

        // If chat is closed, trigger notification
        if (!showChatRef.current) {
            setUnreadCount(prev => prev + 1);
            setShowNotification(true);
            
            // Auto-hide notification after 4 seconds
            setTimeout(() => setShowNotification(false), 4000);
        }
    }, 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !user) return;
      
      const msg: ChatMessage = {
          id: Date.now().toString(),
          productId: product.id,
          senderId: user.id,
          text: newMessage,
          createdAt: Date.now()
      };
      
      sendChatMessage(msg);
      setChatMessages([...chatMessages, msg]);
      setNewMessage('');
      
      // Trigger simulation
      simulateSellerReply();
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const msg: ChatMessage = {
          id: Date.now().toString(),
          productId: product.id,
          senderId: user.id,
          text: 'Sent an attachment',
          attachment: reader.result as string,
          createdAt: Date.now()
        };
        sendChatMessage(msg);
        setChatMessages(prev => [...prev, msg]);
        simulateSellerReply();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationShare = () => {
     if (!user) return;
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition((position) => {
             const msg: ChatMessage = {
                 id: Date.now().toString(),
                 productId: product.id,
                 senderId: user.id,
                 text: 'Shared a location',
                 location: {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                 },
                 createdAt: Date.now()
             };
             sendChatMessage(msg);
             setChatMessages(prev => [...prev, msg]);
             simulateSellerReply();
         }, (err) => {
             alert("Could not access location");
         });
     } else {
         alert("Geolocation not supported");
     }
  };

  const submitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      const review: Review = {
          id: Date.now().toString(),
          sellerId: product.sellerId,
          buyerId: user.id,
          buyerName: user.name,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: Date.now()
      };
      addReview(review);
      setSellerReviews([review, ...sellerReviews]);
      setSellerStats(getSellerStats(product.sellerId));
      setShowReviewModal(false);
      setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 relative pb-24 md:pb-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
        </Link>

        {/* Notification Toast */}
        {showNotification && (
            <div className="fixed bottom-24 right-4 md:bottom-10 md:right-8 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl z-[70] flex items-center gap-3 animate-bounce-in">
                <div className="relative">
                    <div className="bg-brand-500 rounded-full p-2">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
                <div className="cursor-pointer" onClick={() => { setShowChat(true); setShowNotification(false); }}>
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">{product.sellerName}</p>
                    <p className="text-sm font-medium">New message received</p>
                </div>
                <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-white ml-2">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Images & Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 relative h-[300px] md:h-[500px] bg-gray-50 group">
                    <img 
                        src={images[currentImageIndex]} 
                        alt={`${product.title} - ${currentImageIndex + 1}`} 
                        className="w-full h-full object-contain"
                    />
                    
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-brand-600' : 'bg-gray-300'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Google Maps Integration */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                         <h2 className="text-lg font-bold text-gray-900">Location</h2>
                         <p className="text-sm text-gray-500">{product.location}</p>
                    </div>
                    <div className="h-64 w-full bg-gray-100 relative">
                        {/* Use embed iframe for map - no API key needed for basic search embed */}
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(product.location)}&output=embed`}
                            className="w-full h-full"
                            title="Product Location"
                        ></iframe>
                    </div>
                </div>

                 <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Reviews ({sellerReviews.length})</h2>
                    {sellerReviews.length > 0 ? (
                        <div className="space-y-4">
                            {sellerReviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-gray-900">{review.buyerName}</span>
                                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No reviews yet.</p>
                    )}
                </div>
            </div>

            {/* Right Column: Details & Seller */}
            <div className="space-y-6">
                
                {/* Price Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                            <div className="flex gap-2">
                                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                                    {product.category}
                                </span>
                                <span className="inline-block bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                                    {product.condition}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleToggleFavorite}
                                className={`p-2 rounded-full transition-colors ${isFav ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
                            >
                                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                                onClick={handleShare}
                                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-brand-600 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-3xl font-black text-gray-900 mb-6">₹{product.price.toLocaleString('en-IN')}</p>
                    
                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                         <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brand-500" />
                            <span>{product.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-500" />
                            <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="hidden md:grid grid-cols-2 gap-3 mb-3">
                        <button 
                            onClick={() => {
                                if (!user) { navigate('/login'); return; }
                                setShowChat(!showChat);
                            }}
                            className="relative flex items-center justify-center gap-2 bg-brand-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                         <button 
                            onClick={() => alert("Phone number hidden for privacy in demo.")}
                            className="flex items-center justify-center gap-2 bg-white text-brand-600 border-2 border-brand-600 py-3 px-4 rounded-lg font-semibold hover:bg-brand-50 transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            Call
                        </button>
                    </div>
                </div>

                {/* Seller Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
                    <div className="flex items-center gap-4 mb-4">
                         <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product.sellerName)}&background=random`} 
                            alt={product.sellerName}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{product.sellerName}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{sellerStats?.averageRating}</span>
                                <span className="text-gray-400">({sellerStats?.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3">
                        <span>Items for sale</span>
                        <span className="font-semibold text-gray-900">{sellerStats?.totalListings}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 z-40">
             <button 
                onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    setShowChat(!showChat);
                }}
                className="relative flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-lg font-bold shadow-lg"
            >
                <MessageCircle className="w-5 h-5" />
                Chat
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>
            <button 
                onClick={() => alert("Phone number hidden for privacy in demo.")}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-brand-600 border-2 border-brand-600 py-3 rounded-lg font-bold"
            >
                <Phone className="w-5 h-5" />
                Call
            </button>
        </div>

        {/* Chat Box */}
        {showChat && (
            <div className="fixed bottom-20 md:bottom-4 right-4 w-[90%] md:w-96 bg-white rounded-t-xl rounded-b-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[500px]">
                <div className="p-4 bg-brand-600 text-white rounded-t-xl flex justify-between items-center">
                    <div className="font-bold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Chat with {product.sellerName}</span>
                    </div>
                    <button onClick={() => setShowChat(false)} className="hover:bg-brand-700 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 h-80 space-y-3" ref={chatScrollRef}>
                    {chatMessages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm mt-4">Start the conversation!</p>
                    ) : (
                        chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] space-y-1`}>
                                    <div className={`px-3 py-2 rounded-lg text-sm shadow-sm ${msg.senderId === user?.id ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                        {msg.attachment && (
                                            <img src={msg.attachment} alt="Attachment" className="w-full h-32 object-cover rounded mb-2 border border-black/10" />
                                        )}
                                        {msg.location && (
                                             <div className="mb-2 rounded overflow-hidden">
                                                <iframe 
                                                    width="100%" 
                                                    height="120" 
                                                    frameBorder="0" 
                                                    scrolling="no" 
                                                    marginHeight={0} 
                                                    marginWidth={0} 
                                                    src={`https://maps.google.com/maps?q=${msg.location.lat},${msg.location.lng}&output=embed`}
                                                    className="w-full block pointer-events-none"
                                                    title="Shared Location"
                                                ></iframe>
                                                <div className="bg-gray-100 p-1 text-[10px] text-center text-gray-500 font-medium">Shared Location</div>
                                            </div>
                                        )}
                                        {msg.text && <p>{msg.text}</p>}
                                    </div>
                                    <div className={`text-[10px] text-gray-400 ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-lg flex gap-2 items-center">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button 
                        type="button" 
                        onClick={handleAttachmentClick}
                        className="text-gray-500 hover:text-brand-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Attach Image"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                        type="button" 
                        onClick={handleLocationShare}
                        className="text-gray-500 hover:text-brand-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Share Location"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <button type="submit" className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 shadow-sm transition-transform active:scale-95">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        )}
    </div>
  );
};

export default ProductDetail;