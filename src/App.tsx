import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Browse from "./pages/Browse";
import NewProduct from "./pages/NewProduct";
import ProductDetail from "./pages/ProductDetail";
import ProductSources from "./pages/ProductSources";
import ProductObjects from "./pages/ProductObjects";
import ProductConsume from "./pages/ProductConsume";
import Settings from "./pages/Settings";
import SourceDetail from "./pages/SourceDetail";
import ObjectsGraph from "./pages/ObjectsGraph";
import { useEffect } from "react";
import { seedIfEmpty } from "./storage";
import { makeSeedProducts } from "./mock";

export default function App() {
  useEffect(() => {
    seedIfEmpty(makeSeedProducts());
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/new" element={<NewProduct />} />
          <Route path="/objects" element={<ObjectsGraph />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/product/:id" element={<ProductDetail />}>
            <Route index element={<ProductSources />} />
            <Route path="sources" element={<ProductSources />} />
            <Route path="sources/:dsId" element={<SourceDetail />} />
            <Route path="objects" element={<ProductObjects />} />
            <Route path="consume" element={<ProductConsume />} />
          </Route>
          <Route path="*" element={<Browse />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
