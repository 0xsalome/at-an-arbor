import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContentDetail from './pages/ContentDetail';
import SimplePage from './pages/SimplePage';
import Fieldwork from './pages/Fieldwork';
import Underground from './pages/Underground';
import Comet from './components/Comet';

const App: React.FC = () => {
  return (
    <Router>
      <div className="antialiased text-text-main bg-paper-white min-h-screen">
        <Comet />
        <Routes>
          <Route path="/at-an-arbor/" element={<Home />} />
          <Route path="/at-an-arbor/poems/:slug" element={<ContentDetail type="poem" />} />
          <Route path="/at-an-arbor/moments/:slug" element={<ContentDetail type="moment" />} />
          <Route path="/at-an-arbor/compost" element={<SimplePage type="compost" />} />
          <Route path="/at-an-arbor/underground" element={<Underground />} />
          <Route path="/at-an-arbor/blog" element={<SimplePage type="blog-list" />} />
          <Route path="/at-an-arbor/poems" element={<SimplePage type="poem-list" />} />
          <Route path="/at-an-arbor/moments" element={<SimplePage type="moment-list" />} />
          <Route path="/at-an-arbor/fieldwork" element={<Fieldwork />} />
          <Route path="/at-an-arbor/*" element={<div>404</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;