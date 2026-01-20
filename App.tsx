import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContentDetail from './pages/ContentDetail';
import SimplePage from './pages/SimplePage';
import BlogList from './pages/BlogList';
import Fieldwork from './pages/Fieldwork';
import Underground from './pages/Underground';
import Comet from './components/Comet';

const App: React.FC = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="antialiased text-text-main bg-paper-white min-h-screen">
        <Comet />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/poems/:slug" element={<ContentDetail type="poem" />} />
          <Route path="/moments/:slug" element={<ContentDetail type="moment" />} />
          <Route path="/compost" element={<SimplePage type="compost" />} />
          <Route path="/underground" element={<Underground />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/poems" element={<SimplePage type="poem-list" />} />
          <Route path="/moments" element={<SimplePage type="moment-list" />} />
          <Route path="/fieldwork" element={<Fieldwork />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;