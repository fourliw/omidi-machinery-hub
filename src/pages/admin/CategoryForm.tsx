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

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface ParentCategory {
  id: string;
  name: string;
}

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      sort_order: 0,
      is_active: true,
    }
  });

  const watchName = form.watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchName && !isEdit) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  }, [watchName, form, isEdit]);

  useEffect(() => {
    fetchParentCategories();
    if (isEdit) {
      fetchCategory();
    }
  }, [id, isEdit]);

  const fetchParentCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('name');

      if (error) throw error;
      setParentCategories(data || []);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const fetchCategory = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      form.reset({
        ...category,
        parent_id: category.parent_id || undefined,
      });

    } catch (error) {
      console.error('Error fetching category:', error);
      toast({
        title: "Error",
        description: "Failed to load category",
        variant: "destructive"
      });
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setSaving(true);

      // Convert empty parent_id to null
      if (data.parent_id === '') {
        data.parent_id = undefined;
      }

      if (isEdit) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(data);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Category ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} category`,
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
            <div className="text-muted-foreground">Loading category...</div>
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
                  <BreadcrumbLink href="/admin/categories">Categories</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isEdit ? 'Edit Category' : 'Add Category'}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Category' : 'Add New Category'}
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/categories')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter category name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    {...form.register('slug')}
                    placeholder="category-url-slug"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Category description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Parent Category</Label>
                  <Select 
                    value={form.watch('parent_id') || ''} 
                    onValueChange={(value) => form.setValue('parent_id', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent (top level)</SelectItem>
                      {parentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    {...form.register('sort_order', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Active Category</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/categories')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}