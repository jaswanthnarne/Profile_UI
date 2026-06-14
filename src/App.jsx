import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundOrbs from './components/BackgroundOrbs';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import CoursesPage from './pages/CoursesPage';
import TestimonialsPage from './pages/TestimonialsPage';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCompanies from './pages/Admin/Companies';
import AdminGallery from './pages/Admin/GalleryManager';
import AdminTestimonials from './pages/Admin/Testimonials';
import AdminBlog from './pages/Admin/BlogManager';
import AdminCourses from './pages/Admin/Courses';
import AdminContacts from './pages/Admin/Contacts';
import AdminMoments from './pages/Admin/MomentsManager';
import AdminLayout from './components/AdminLayout';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return admin ? children : <Navigate to="/console/admin/login" replace />;
};

export default function App() {
  return (
    <>
      <BackgroundOrbs />
      <div className="relative z-10">
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/courses" element={<><Navbar /><CoursesPage /><Footer /></>} />
          <Route path="/gallery" element={<><Navbar /><Gallery /><Footer /></>} />
          <Route path="/gallery/:id" element={<><Navbar /><ProjectDetailsPage /><Footer /></>} />
          <Route path="/blog" element={<><Navbar /><Blog /><Footer /></>} />
          <Route path="/blog/:slug" element={<><Navbar /><BlogPost /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
          <Route path="/testimonials" element={<><Navbar /><TestimonialsPage /><Footer /></>} />

          {/* Admin Routes */}
          <Route path="/console/admin/login" element={<AdminLogin />} />
          <Route path="/console/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="moments" element={<AdminMoments />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
