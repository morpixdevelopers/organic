import React, { createContext, useState, useEffect } from "react";
import avalImg from "../img/aval.jpg";
import sugar from "../img/sugar.png";
import samba from "../img/samba_rice.png";

// Initial products data
const initialProducts = [
  {
    id: 1,
    name: "Karuppu Kavuni Aval",
    price: 160,
    image: avalImg,
    description:
      "It retains its earthy flavor and natural nutrients in the flattened form",
    category: "Aval",
  },
  {
    id: 2,
    name: "Country Sugar",
    price: 100,
    image: sugar,
    description:
      "Country sugar, also known as Nattu Sakkarai, is a traditional unrefined sweetener",
    category: "Sugar",
  },
  {
    id: 4,
    name: "Mappillai Samba Rice",
    price: 100,
    image: samba,
    description:
      "Its name means 'Bridegroom's Rice' as it was believed to give strength and stamina",
    category: "Rice",
  },
];

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    // Load products from localStorage or use initial products
    const savedProducts = localStorage.getItem("organicProducts");
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("organicProducts", JSON.stringify(products));
  }, [products]);

  // Add new product
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  // Update existing product
  const updateProduct = (id, updatedProduct) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...updatedProduct, id } : product
      )
    );
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  // Get product by id
  const getProductById = (id) => {
    return products.find((product) => product.id === id);
  };

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
