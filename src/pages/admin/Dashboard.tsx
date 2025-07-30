import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Component, FileText, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface DashboardStats {
  totalProducts: number;
  totalComponents: number;
  totalNews: number;
  totalInquiries: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalComponents: 0,
    totalNews: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: productsCount },
          { count: componentsCount },
          { count: newsCount },
          { count: inquiriesCount }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('components').select('*', { count: 'exact', head: true }),
          supabase.from('news').select('*', { count: 'exact', head: true }),
          supabase.from('customer_inquiries').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalProducts: productsCount || 0,
          totalComponents: componentsCount || 0,
          totalNews: newsCount || 0,
          totalInquiries: inquiriesCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'Active products in catalog',
      trend: '+12% from last month'
    },
    {
      title: 'Components',
      value: stats.totalComponents,
      icon: Component,
      description: 'Available components',
      trend: '+3% from last month'
    },
    {
      title: 'News Articles',
      value: stats.totalNews,
      icon: FileText,
      description: 'Published articles',
      trend: '+8% from last month'
    },
    {
      title: 'Customer Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      description: 'Total inquiries received',
      trend: '+15% from last month'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your industrial machinery admin panel
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? '--' : stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                  Add Product
                </button>
                <button className="p-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">
                  Add Component
                </button>
                <button className="p-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors text-sm font-medium">
                  New Article
                </button>
                <button className="p-3 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm font-medium">
                  View Inquiries
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">New product added: Industrial Mixer XL</span>
                  <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Customer inquiry from Tech Foods Ltd</span>
                  <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-muted-foreground">News article published: Industry Update</span>
                  <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}