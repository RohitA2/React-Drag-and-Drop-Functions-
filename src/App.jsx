// src/App.js
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/pages/dashboard/Dashboard";
import TemplateBuilder from "./components/templates/TemplateBuilder";
import Templates from "./components/templates/Templates";
import Products from "./components/Products/product"
import Snippets from "./components/Snippet/SnippetsTable";

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard layout pages */}
        <Route path="/" element={<Dashboard />}>
          {/* <Route index element={<ClientPage />} /> */}
          <Route path="templates" element={<Templates />} />
          <Route path="products" element={<Products />} />
          <Route path="Snippets" element={<Snippets />} />
        </Route>

        {/* FULLSCREEN editor (no dashboard layout) */}
        <Route path="/template-builder" element={<TemplateBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
