import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Browse from "./pages/Browse";
import NewProduct from "./pages/NewProduct";
import ProductDetail from "./pages/ProductDetail";
import ProductOverview from "./pages/ProductOverview";
import ProductSources from "./pages/ProductSources";
import ProductDataDictionary from "./pages/ProductDataDictionary";
import ProductUsageExamples from "./pages/ProductUsageExamples";
import ProductBusinessNeeds from "./pages/ProductBusinessNeeds";
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
            <Route index element={<ProductOverview />} />
            <Route path="overview" element={<ProductOverview />} />
            <Route path="business-needs" element={<ProductBusinessNeeds />} />
            <Route path="sources" element={<ProductSources />} />
            <Route path="sources/:dsId" element={<SourceDetail />} />
            <Route path="data-dictionary" element={<ProductDataDictionary />} />
            <Route path="usage-examples" element={<ProductUsageExamples />} />
          </Route>
          <Route path="*" element={<Browse />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
