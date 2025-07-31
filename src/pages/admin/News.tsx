import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  news_type: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export default function News() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNews(news.filter(n => n.id !== id));
      toast({
        title: "Success",
        description: "News article deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting news article:', error);
      toast({
        title: "Error",
        description: "Failed to delete news article",
        variant: "destructive",
      });
    }
  };

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (isPublished: boolean) => {
    const variant = isPublished ? 'default' : 'secondary';
    return <Badge variant={variant}>{isPublished ? 'Published' : 'Draft'}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">News Articles</h1>
            <p className="text-muted-foreground">
              Manage your company news and announcements
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/admin/news/new')}>
            <Plus className="h-4 w-4" />
            Add Article
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* News Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Articles ({filteredNews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading articles...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{article.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {article.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.news_type ? (
                          <Badge variant="outline">{article.news_type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(article.is_published)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {article.is_featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.published_at 
                          ? new Date(article.published_at).toLocaleDateString()
                          : 'Not published'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(article.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/news/${article.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(article.id, article.title)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}