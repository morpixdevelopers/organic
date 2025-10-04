import React from "react";
import { Link } from "react-router-dom";
import product from "../img/productCatalog.jpeg"


const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="relative text-white min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Premium Organic Products</h1>
            <p className="text-xl mb-8 opacity-90">
              Discover our carefully curated selection of organic rice varieties, natural sugars, and traditional grains - pure, healthy, and sustainably sourced.
            </p>
            <Link
              to="/products"
              className="inline-block bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg shadow-lg"
            >
              Explore Our Product
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose Our Organic Products?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From traditional rice varieties to natural sweeteners, our organic products are carefully sourced to bring you authentic, healthy, and nutritious options for your family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Natural</h3>
              <p className="text-gray-600">
                Our rice varieties, natural sugars, and traditional grains are completely organic, processed without chemicals or artificial additives.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Traditional Quality</h3>
              <p className="text-gray-600">
                Sourced directly from trusted organic farms, our products maintain their traditional nutritional value and authentic taste.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Health Focused</h3>
              <p className="text-gray-600">
                Rich in nutrients and free from processing chemicals, our organic grains and natural products support a healthy lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 flex-grow">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Experience Pure Organic Goodness</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our premium collection of organic rice, natural sugars, and traditional grains. Start your journey to healthier eating with our authentic organic products.
          </p>
          <Link
            to="/products"
            className="inline-block bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg"
          >
            Shop Our Product
          </Link>
        </div>
      </section>
      <section className="bg-gray-100 py-8 flex justify-center">
  <img
    src={product} // replace with your image path
    alt="Pricing"
    className="max-w-3xl w-full rounded-lg shadow-md"
  />
</section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>
            Developed by <span className="font-semibold">@prvn_onfleek</span> | 📞 +91-9500848503
          </p>
          <p className="text-gray-400 text-sm mt-2">&copy; {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
