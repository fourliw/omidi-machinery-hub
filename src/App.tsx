import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import News from './pages/admin/News';
import NewsForm from './pages/admin/NewsForm';
import Components from './pages/admin/Components';
import ComponentForm from './pages/admin/ComponentForm';
import Categories from './pages/admin/Categories';
import CategoryForm from './pages/admin/CategoryForm';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id/edit" element={<ProductForm />} />
            <Route path="/admin/news" element={<News />} />
            <Route path="/admin/news/new" element={<NewsForm />} />
            <Route path="/admin/news/:id/edit" element={<NewsForm />} />
            <Route path="/admin/components" element={<Components />} />
            <Route path="/admin/components/new" element={<ComponentForm />} />
            <Route path="/admin/components/:id/edit" element={<ComponentForm />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/categories/new" element={<CategoryForm />} />
            <Route path="/admin/categories/:id/edit" element={<CategoryForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;