import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import LandingPage from './pages/LandingPage';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import ReportLostItem from './pages/ReportLostItem';
import ReportFoundItem from './pages/ReportFoundItem';
import Messages from './pages/Messages';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lost" element={<BrowseItems />} />
          <Route path="/found" element={<BrowseItems />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/lost/new" element={<ReportLostItem />} />
          <Route path="/found/new" element={<ReportFoundItem />} />
          <Route path="/about" element={<div className="p-8 text-center text-slate-500">About Page</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
