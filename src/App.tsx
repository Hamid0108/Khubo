import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import CategoryListings from './pages/CategoryListings';
import Messages from './pages/Messages';
import Maps from './pages/Maps';
import RoommateFinder from './pages/RoommateFinder';
import Profile from './pages/Profile';
import ManageListings from './pages/ManageListings';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider } from './lib/AuthContext';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/category/:categoryId" element={<CategoryListings />} />
              <Route path="/maps" element={<Maps />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/roommate" element={<RoommateFinder />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/manage-listings" element={<ManageListings />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
