import { Product, Category, User, Condition, Review, ChatMessage } from '../types';

const PRODUCTS_KEY = 'fasterr_products';
const USER_KEY = 'fasterr_user';
const FAVORITES_KEY = 'fasterr_favorites';
const REVIEWS_KEY = 'fasterr_reviews';
const CHATS_KEY = 'fasterr_chats';

// Helper to generate dummy data
const generateDummyProducts = (count: number): Product[] => {
  const products: Product[] = [];
  const categories = Object.values(Category);
  const conditions: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  
  // Locations in "Area, City, State" format for better filtering
  const locations = [
    'Manhattan, New York, NY', 'Brooklyn, New York, NY', 'Queens, New York, NY',
    'Downtown, Los Angeles, CA', 'Hollywood, Los Angeles, CA', 'Venice, Los Angeles, CA',
    'Loop, Chicago, IL', 'Lincoln Park, Chicago, IL',
    'Downtown, Houston, TX', 'Montrose, Houston, TX',
    'Downtown, Phoenix, AZ', 'Center City, Philadelphia, PA',
    'Alamo Heights, San Antonio, TX', 'La Jolla, San Diego, CA',
    'Uptown, Dallas, TX', 'Silicon Valley, San Jose, CA',
    'Downtown, Austin, TX', 'Riverside, Jacksonville, FL'
  ];

  const items = [
    'iPhone 13', 'Samsung Galaxy S21', 'MacBook Air', 'Sony Headphones', 
    'Leather Sofa', 'Dining Table', 'Office Chair', 'Gaming PC', 
    'Mountain Bike', 'Road Bike', 'Toyota Camry', 'Honda Civic', 
    'Nike Sneakers', 'Vintage Jacket', 'Canon Camera', 'Guitar', 
    'Digital Watch', 'Smart TV', 'Bookshelf', 'Microwave',
    '2BHK Apartment', 'Commercial Office Space', 'Persian Cat', 'Labrador Puppy'
  ];
  const adjectives = [
    'Vintage', 'Brand New', 'Slightly Used', 'Refurbished', 'Custom', 
    'Rare', 'Modern', 'Classic', 'Premium', 'Budget'
  ];

  for (let i = 0; i < count; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Random date within last 60 days
    const timeAgo = Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000); 

    // 10% chance of being sold
    const isSold = Math.random() > 0.9;

    products.push({
      id: `dummy_${i}`,
      title: `${adj} ${item}`,
      // Scaled up for Rupees
      price: Math.floor(Math.random() * 100000) + 500,
      description: `Great deal on this ${adj.toLowerCase()} ${item}. Only used for a short time. Located in ${location}. Contact me for more details!`,
      category: category,
      condition: condition,
      image: `https://picsum.photos/seed/${i}/800/600`, // Deterministic random image
      images: [
        `https://picsum.photos/seed/${i}/800/600`, 
        `https://picsum.photos/seed/${i}extra/800/600`
      ],
      sellerId: `seller_${Math.floor(Math.random() * 50)}`,
      sellerName: `User_${Math.floor(Math.random() * 50)}`,
      createdAt: Date.now() - timeAgo,
      location: location,
      status: isSold ? 'sold' : 'active'
    });
  }
  return products;
};

// Initial Mock Data (Static + Generated)
const STATIC_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Vintage Film Camera',
    price: 12000,
    description: 'A beautiful 35mm film camera in excellent condition. tested and working. Comes with a 50mm lens.',
    category: Category.ELECTRONICS,
    condition: 'Good',
    image: 'https://picsum.photos/id/250/800/600',
    images: ['https://picsum.photos/id/250/800/600', 'https://picsum.photos/id/251/800/600', 'https://picsum.photos/id/252/800/600'],
    sellerId: 'demo_user',
    sellerName: 'John Doe',
    createdAt: Date.now(),
    location: 'Manhattan, New York, NY',
    status: 'active'
  },
  {
    id: '2',
    title: 'Modern Lounge Chair',
    price: 6500,
    description: 'Mid-century modern style chair. distinctive wooden legs and grey fabric. Barely used.',
    category: Category.FURNITURE,
    condition: 'Like New',
    image: 'https://picsum.photos/id/1060/800/600',
    images: ['https://picsum.photos/id/1060/800/600', 'https://picsum.photos/id/1062/800/600'],
    sellerId: 'jane_smith',
    sellerName: 'Jane Smith',
    createdAt: Date.now() - 100000,
    location: 'San Francisco, CA',
    status: 'active'
  },
  {
    id: '3',
    title: 'Mountain Bike',
    price: 15000,
    description: 'Reliable mountain bike for trails. 21 speed, disc brakes. Recently serviced.',
    category: Category.BIKES,
    condition: 'Good',
    image: 'https://picsum.photos/id/146/800/600',
    images: ['https://picsum.photos/id/146/800/600'],
    sellerId: 'mike_b',
    sellerName: 'Mike B',
    createdAt: Date.now() - 200000,
    location: 'Downtown, Denver, CO',
    status: 'active'
  },
    {
    id: '4',
    title: 'Leather Jacket',
    price: 4000,
    description: 'Genuine leather jacket, vintage look. Size M. Very warm and stylish.',
    category: Category.FASHION,
    condition: 'Good',
    image: 'https://picsum.photos/id/1005/800/600',
    images: ['https://picsum.photos/id/1005/800/600', 'https://picsum.photos/id/1006/800/600'],
    sellerId: 'sara_k',
    sellerName: 'Sara K',
    createdAt: Date.now() - 300000,
    location: 'Austin, TX',
    status: 'sold'
  }
];

const MOCK_PRODUCTS = [...STATIC_PRODUCTS, ...generateDummyProducts(200)];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
    } catch (e) {
        console.warn("Storage quota exceeded, using in-memory data");
    }
    return MOCK_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  const newProducts = [product, ...products];
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
  } catch (e) {
    alert("Storage full! Cannot save new product in this demo.");
  }
};

export const updateProduct = (updatedProduct: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
        alert("Storage full! Cannot update product.");
    }
  }
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const loginUser = (name: string): User => {
  const user: User = {
    id: Date.now().toString(),
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Favorites
export const getFavorites = (): string[] => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const toggleFavorite = (productId: string): boolean => {
    const favorites = getFavorites();
    let newFavorites: string[];
    let isFavorited = false;

    if (favorites.includes(productId)) {
        newFavorites = favorites.filter(id => id !== productId);
    } else {
        newFavorites = [...favorites, productId];
        isFavorited = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    return isFavorited;
};

export const isProductFavorite = (productId: string): boolean => {
    const favorites = getFavorites();
    return favorites.includes(productId);
};

// Reviews
export const getReviews = (sellerId: string): Review[] => {
    const stored = localStorage.getItem(REVIEWS_KEY);
    const reviews: Review[] = stored ? JSON.parse(stored) : [];
    return reviews.filter(r => r.sellerId === sellerId).sort((a, b) => b.createdAt - a.createdAt);
};

export const addReview = (review: Review): void => {
    const stored = localStorage.getItem(REVIEWS_KEY);
    const reviews: Review[] = stored ? JSON.parse(stored) : [];
    reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

export const getSellerStats = (sellerId: string) => {
    const products = getProducts();
    const sellerProducts = products.filter(p => p.sellerId === sellerId);
    
    const reviews = getReviews(sellerId);
    // Mock base rating of 4.5 if no reviews, otherwise calculate
    const baseRating = 4.5;
    const baseCount = 10;
    
    let totalRating = baseRating * baseCount;
    let count = baseCount;

    if (reviews.length > 0) {
        const reviewSum = reviews.reduce((acc, r) => acc + r.rating, 0);
        totalRating += reviewSum;
        count += reviews.length;
    }

    return {
        totalListings: sellerProducts.length,
        averageRating: (totalRating / count).toFixed(1),
        reviewCount: count
    };
};

// Chat
export const getChatMessages = (productId: string): ChatMessage[] => {
    const stored = localStorage.getItem(CHATS_KEY);
    const chats: ChatMessage[] = stored ? JSON.parse(stored) : [];
    return chats.filter(c => c.productId === productId).sort((a, b) => a.createdAt - b.createdAt);
};

export const sendChatMessage = (message: ChatMessage): void => {
    const stored = localStorage.getItem(CHATS_KEY);
    const chats: ChatMessage[] = stored ? JSON.parse(stored) : [];
    chats.push(message);
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
};