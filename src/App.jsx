import React, { useState } from "react";
import { AuthProvider } from "./authcontext.jsx";

import "./navbar.css";
import Navbar from "./navbar.jsx";

import "./sliderprograme.css";
import Slider from "./sliderprograme.jsx";

import "./uploadprogram.css";
import Test2 from "./uploadprogram.jsx";

import "./shoppage2.css";
import ShopPage2 from "./shoppage2.jsx";

import "./messages.css";
import Messages from "./messages.jsx";

import "./footer.css";
import Footer from "./footer.jsx";

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState("home"); // "home" | "messages"

  const goHome = () => {
    setSelectedProduct(null);
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AuthProvider>
      <Navbar
        hideLinks={!!selectedProduct || page === "messages"}
        onOpenMessages={() => {
          setSelectedProduct(null);
          setPage("messages");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onGoHome={goHome}
      />

      {page === "messages" ? (
        <Messages onBack={goHome} />
      ) : selectedProduct ? (
        <ShopPage2
          productId={selectedProduct}
          onBack={goHome}
        />
      ) : (
        <>
          <div id="hero">
            <Slider />
          </div>
          <Test2
            onProductClick={(id) => {
              setSelectedProduct(id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}

      {/* Footer is hidden on ShopPage2 and Messages page to prevent layout/scroll jumps */}
      {page !== "messages" && !selectedProduct && <Footer id="footer" />}
    </AuthProvider>
  );
}

export default App;