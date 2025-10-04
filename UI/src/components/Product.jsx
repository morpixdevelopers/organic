import React, { useState } from 'react';
import Cart from './Cart';
import avalImg from "../img/aval.jpg"
import sugar from "../img/sugar.png"
import samba from "../img/samba_rice.png"


const Product = ({ addToCart, cart, updateQuantity, isCartOpen, setIsCartOpen, getCartTotal, removeFromCart }) => {
    const [products] = useState([
        {
            id: 1,
            name: "Karuppu Kavuni Aval",
            price: 160,
            image: avalImg,
            description: "It retains its earthy flavor and natural nutrients in the flattened form",
            category: "Aval"
        },
        {
            id: 2,
            name: "Country Sugar",
            price: 100,
            image: sugar,
            description: "Country sugar, also known as Nattu Sakkarai, is a traditional unrefined sweetener",
            category: "Sugar"
        },
        {
            id: 4,
            name: "Mappillai Samba Rice",
            price: 100,
            image: samba,
            description: "Its name means “Bridegroom’s Rice” as it was believed to give strength and stamina",
            category: "Rice"
        }
    ]);

    const [quantities, setQuantities] = useState({});

    const handleQuantityChange = (productId, change) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) + change)
        }));
    };

    const handleAddToCart = (product) => {
        const quantity = quantities[product.id] || 1;
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        // Reset quantity after adding to cart
        setQuantities(prev => ({
            ...prev,
            [product.id]: 1
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Organic Products</h1>
                <div className="text-sm text-gray-600">
                    {products.length} products available
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="relative">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                {product.category}
                            </span>
                        </div>
                        
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-4">{product.description}</p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                            </div>
                            
                            {/* Quantity selector */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleQuantityChange(product.id, -1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold"
                                        disabled={quantities[product.id] === 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-semibold">
                                        {quantities[product.id] || 1}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(product.id, 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Component */}
            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                getCartTotal={getCartTotal}
            />
        </div>
    );
}
 
export default Product;