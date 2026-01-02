import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContentDetail from './pages/ContentDetail';
import SimplePage from './pages/SimplePage';
import Comet from './components/Comet';

const App: React.FC = () => {
  return (
    <Router>
      <div className="antialiased text-text-main bg-paper-white min-h-screen">
        <Comet />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<ContentDetail type="blog" />} />
          <Route path="/poems/:slug" element={<ContentDetail type="poem" />} />
          <Route path="/moments/:slug" element={<ContentDetail type="moment" />} />
          <Route path="/profile" element={<SimplePage type="profile" />} />
          <Route path="/blog" element={<SimplePage type="blog-list" />} />
          <Route path="/poems" element={<SimplePage type="poem-list" />} />
          <Route path="/moments" element={<SimplePage type="moment-list" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;