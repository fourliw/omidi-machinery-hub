import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const newsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  news_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  featured_image_url: z.string().optional(),
  featured_image_alt: z.string().optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  published_at: z.string().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      is_published: false,
      is_featured: false,
      tags: [],
    }
  });

  const watchTitle = form.watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !isEdit) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  }, [watchTitle, form, isEdit]);

  useEffect(() => {
    if (isEdit) {
      fetchNews();
    }
  }, [id, isEdit]);

  const fetchNews = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const { data: article, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      form.reset({
        ...article,
        tags: article.tags || [],
        published_at: article.published_at || undefined,
      });

    } catch (error) {
      console.error('Error fetching news article:', error);
      toast({
        title: "Error",
        description: "Failed to load news article",
        variant: "destructive"
      });
      navigate('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: NewsFormData) => {
    try {
      setSaving(true);

      // Set published_at if publishing
      if (data.is_published && !data.published_at) {
        data.published_at = new Date().toISOString();
      }

      if (isEdit) {
        const { error } = await supabase
          .from('news')
          .update(data)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news')
          .insert(data);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `News article ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate('/admin/news');
    } catch (error) {
      console.error('Error saving news article:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} news article`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading article...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/news">News</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isEdit ? 'Edit Article' : 'Add Article'}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit News Article' : 'Add New Article'}
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/news')}>
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Article Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Enter article title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    {...form.register('slug')}
                    placeholder="article-url-slug"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...form.register('excerpt')}
                  placeholder="Brief article summary"
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  {...form.register('content')}
                  placeholder="Article content"
                  className="min-h-[200px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div>
                <Label>News Type</Label>
                <Select 
                  value={form.watch('news_type') || ''} 
                  onValueChange={(value) => form.setValue('news_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select news type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="product-release">Product Release</SelectItem>
                    <SelectItem value="company-news">Company News</SelectItem>
                    <SelectItem value="industry-news">Industry News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_published"
                  checked={form.watch('is_published')}
                  onCheckedChange={(checked) => form.setValue('is_published', checked)}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_featured"
                  checked={form.watch('is_featured')}
                  onCheckedChange={(checked) => form.setValue('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Featured Article</Label>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  {...form.register('meta_title')}
                  placeholder="SEO title"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  {...form.register('meta_description')}
                  placeholder="SEO description"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : (isEdit ? 'Update Article' : 'Create Article')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/news')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}