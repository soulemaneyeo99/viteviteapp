import React, { useState } from 'react';
import { ShoppingCart, Package, Truck, CreditCard, Clock, Star, Heart, Filter, Search, ChevronRight, Tag, Zap } from 'lucide-react';

const ViteviteMarketplace = () => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Tout', icon: '🎯' },
    { id: 'construction', name: 'Matériaux', icon: '🏗️' },
    { id: 'health', name: 'Santé', icon: '💊' },
    { id: 'electronics', name: 'Électronique', icon: '📱' },
    { id: 'services', name: 'Services', icon: '⚙️' }
  ];

  const products = [
    {
      id: 1,
      name: 'Ciment 50kg',
      category: 'construction',
      price: 4500,
      unit: 'sac',
      image: '🏗️',
      seller: 'Quincaillerie Moderne',
      rating: 4.8,
      reviews: 234,
      delivery: 'Livraison 2h',
      stock: 150,
      discount: 10,
      featured: true
    },
    {
      id: 2,
      name: 'Fer à béton 12mm',
      category: 'construction',
      price: 3200,
      unit: 'barre',
      image: '⚒️',
      seller: 'Sidérurgie CI',
      rating: 4.6,
      reviews: 189,
      delivery: 'Livraison 3h',
      stock: 85,
      discount: 0,
      featured: false
    },
    {
      id: 3,
      name: 'Paracétamol 500mg',
      category: 'health',
      price: 500,
      unit: 'boîte',
      image: '💊',
      seller: 'Pharmacie Santé Plus',
      rating: 4.9,
      reviews: 456,
      delivery: 'Livraison 1h',
      stock: 320,
      discount: 15,
      featured: true
    },
    {
      id: 4,
      name: 'Thermomètre digital',
      category: 'health',
      price: 2500,
      unit: 'pièce',
      image: '🌡️',
      seller: 'Pharmacie Santé Plus',
      rating: 4.7,
      reviews: 123,
      delivery: 'Livraison 1h',
      stock: 45,
      discount: 0,
      featured: false
    },
    {
      id: 5,
      name: 'Câble électrique 2.5mm',
      category: 'electronics',
      price: 1800,
      unit: 'mètre',
      image: '🔌',
      seller: 'Électro Pro',
      rating: 4.5,
      reviews: 98,
      delivery: 'Livraison 2h',
      stock: 200,
      discount: 5,
      featured: false
    },
    {
      id: 6,
      name: 'Plomberie - Réparation',
      category: 'services',
      price: 15000,
      unit: 'intervention',
      image: '🔧',
      seller: 'ArtisanCI Pro',
      rating: 4.9,
      reviews: 567,
      delivery: 'Sur RDV',
      stock: 999,
      discount: 0,
      featured: true
    }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const finalPrice = item.discount > 0
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + (finalPrice * item.quantity);
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">ViteVite Marketplace</h1>
                <p className="text-xs font-semibold text-purple-600">Achetez pendant que vous attendez</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-3 bg-purple-100 rounded-xl hover:bg-purple-200 transition-all">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total panier</div>
                <div className="text-lg font-bold text-purple-600">{cartTotal.toLocaleString()} FCFA</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero banner */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-10 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-6 h-6" />
                <span className="text-sm font-bold bg-yellow-400 text-gray-900 px-3 py-1 rounded-full">
                  NOUVEAU
                </span>
              </div>
              <h2 className="text-4xl font-black mb-3">Gagnez du temps !</h2>
              <p className="text-xl text-purple-100 mb-6 max-w-2xl">
                Profitez de votre temps d'attente pour commander ce dont vous avez besoin.
                Livraison rapide dans toute la zone d'Abidjan.
              </p>
              <div className="flex space-x-3">
                <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-xl transition-all">
                  Voir les offres du jour
                </button>
                <button className="px-6 py-3 bg-purple-500/30 text-white border-2 border-white rounded-xl font-bold hover:bg-purple-500/50 transition-all">
                  Comment ça marche ?
                </button>
              </div>
            </div>
            <div className="hidden lg:block text-8xl">
              🛍️
            </div>
          </div>
        </section>

        {/* Quick stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat icon={<Package />} value="500+" label="Produits" color="from-blue-500 to-blue-600" />
          <QuickStat icon={<Truck />} value="2h" label="Livraison" color="from-green-500 to-green-600" />
          <QuickStat icon={<Star />} value="4.8/5" label="Satisfaction" color="from-yellow-500 to-yellow-600" />
          <QuickStat icon={<Tag />} value="-20%" label="Promos actives" color="from-red-500 to-red-600" />
        </section>

        {/* Search and filters */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit, un vendeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-lg"
              />
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured products */}
        {filteredProducts.some(p => p.featured) && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              Offres vedettes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.filter(p => p.featured).map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} featured />
              ))}
            </div>
          </section>
        )}

        {/* All products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Tous les produits ({filteredProducts.length})
            </h2>
            <button className="flex items-center space-x-2 text-purple-600 font-semibold hover:text-purple-700">
              <Filter className="w-5 h-5" />
              <span>Plus de filtres</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        </section>

        {/* Benefits section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Pourquoi acheter sur ViteviteApp ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitCard
              icon="⚡"
              title="Livraison ultra-rapide"
              description="Recevez vos commandes en 1-3h dans toute la zone d'Abidjan"
            />
            <BenefitCard
              icon="💳"
              title="Paiement flexible"
              description="Carte, Mobile Money, ou paiement à la livraison"
            />
            <BenefitCard
              icon="🎁"
              title="Programme fidélité"
              description="Gagnez des points à chaque achat et bénéficiez de réductions"
            />
          </div>
        </section>

        {/* Floating cart */}
        {cartCount > 0 && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6 animate-bounce">
            <div className="flex items-center space-x-4">
              <ShoppingCart className="w-8 h-8" />
              <div>
                <div className="font-bold text-lg">{cartCount} article{cartCount > 1 ? 's' : ''}</div>
                <div className="text-2xl font-black">{cartTotal.toLocaleString()} FCFA</div>
              </div>
              <button className="ml-4 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-xl transition-all">
                Commander
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const QuickStat = ({ icon, value, label, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
    <div className="mb-3">{React.cloneElement(icon, { className: 'w-8 h-8' })}</div>
    <div className="text-3xl font-black mb-1">{value}</div>
    <div className="text-sm font-medium opacity-90">{label}</div>
  </div>
);

const ProductCard = ({ product, addToCart, featured = false }) => {
  const finalPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${
      featured ? 'ring-4 ring-yellow-400' : ''
    }`}>
      {/* Image and badges */}
      <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex items-center justify-center">
        <div className="text-7xl">{product.image}</div>
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        {featured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center">
            <Star className="w-4 h-4 mr-1" />
            VEDETTE
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all">
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.seller}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-sm">{product.rating}</span>
          </div>
          <span className="text-gray-400 text-sm">({product.reviews})</span>
        </div>

        {/* Delivery */}
        <div className="flex items-center space-x-2 text-sm text-green-600 font-semibold">
          <Truck className="w-4 h-4" />
          <span>{product.delivery}</span>
        </div>

        {/* Price */}
        <div className="flex items-end space-x-2">
          {product.discount > 0 && (
            <span className="text-gray-400 line-through text-sm">
              {product.price.toLocaleString()} FCFA
            </span>
          )}
          <span className="text-2xl font-black text-purple-600">
            {finalPrice.toLocaleString()} FCFA
          </span>
          <span className="text-gray-500 text-sm">/{product.unit}</span>
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${
            product.stock > 50 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {product.stock > 50 ? '✅ En stock' : `⚠️ ${product.stock} restants`}
          </span>
        </div>

        {/* Action */}
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Ajouter au panier</span>
        </button>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default ViteviteMarketplace;