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
import { Save, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaUpload, type MediaItem } from '@/components/admin/forms/MediaUpload';
import { SpecificationsEditor } from '@/components/admin/forms/SpecificationsEditor';
import { ComponentAssignment, type ProductComponent } from '@/components/admin/forms/ComponentAssignment';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  product_type: z.string().min(1, 'Product type is required'),
  price: z.number().nullable().optional(),
  price_currency: z.string().optional(),
  price_type: z.string().optional(),
  automation_level: z.string().optional(),
  tags: z.array(z.string()).optional(),
  weight: z.number().nullable().optional(),
  dimensions: z.any().optional(),
  power_consumption: z.any().optional(),
  production_capacity: z.any().optional(),
  specifications: z.any().optional(),
  lead_time_days: z.number().nullable().optional(),
  warranty_months: z.number().optional(),
  certification_standards: z.array(z.string()).optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_bestseller: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [productComponents, setProductComponents] = useState<ProductComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price_currency: 'USD',
      price_type: 'fixed',
      warranty_months: 12,
      status: 'active',
      is_featured: false,
      is_bestseller: false,
      tags: [],
      certification_standards: [],
      specifications: {},
      dimensions: {},
      power_consumption: {},
      production_capacity: {},
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
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Fetch product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      // Populate form
      form.reset({
        ...product,
        price: product.price ? Number(product.price) : null,
        weight: product.weight ? Number(product.weight) : null,
        tags: product.tags || [],
        certification_standards: product.certification_standards || [],
        specifications: product.specifications || {},
        dimensions: product.dimensions || {},
        power_consumption: product.power_consumption || {},
        production_capacity: product.production_capacity || {},
      });

      // Fetch media
      const { data: mediaData, error: mediaError } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', id)
        .order('sort_order');

      if (mediaError) throw mediaError;
      setMedia((mediaData || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video' | 'document'
      })));

      // Fetch components
      const { data: componentsData, error: componentsError } = await supabase
        .from('product_components')
        .select(`
          *,
          component:components(*)
        `)
        .eq('product_id', id)
        .order('sort_order');

      if (componentsError) throw componentsError;
      setProductComponents((componentsData || []).map(item => ({
        ...item,
        component: item.component ? {
          ...item.component,
          specifications: item.component.specifications as Record<string, any>
        } : undefined
      })));

    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive"
      });
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setSaving(true);

      let productId = id;

      if (isEdit) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(data)
          .select('id')
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      // Save media
      if (media.length > 0) {
        // Delete existing media if editing
        if (isEdit) {
          await supabase
            .from('product_media')
            .delete()
            .eq('product_id', productId);
        }

        const mediaToInsert = media.map((item, index) => ({
          product_id: productId,
          file_url: item.file_url,
          file_name: item.file_name,
          media_type: item.media_type,
          is_primary: item.is_primary,
          alt_text: item.alt_text,
          title: item.title,
          sort_order: index
        }));

        const { error: mediaError } = await supabase
          .from('product_media')
          .insert(mediaToInsert);

        if (mediaError) throw mediaError;
      }

      // Save components
      if (productComponents.length > 0) {
        // Delete existing components if editing
        if (isEdit) {
          await supabase
            .from('product_components')
            .delete()
            .eq('product_id', productId);
        }

        const componentsToInsert = productComponents.map((pc, index) => ({
          product_id: productId,
          component_id: pc.component_id,
          quantity: pc.quantity,
          is_optional: pc.is_optional,
          notes: pc.notes,
          sort_order: index
        }));

        const { error: componentsError } = await supabase
          .from('product_components')
          .insert(componentsToInsert);

        if (componentsError) throw componentsError;
      }

      toast({
        title: "Success",
        description: `Product ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} product`,
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
            <div className="text-muted-foreground">Loading product...</div>
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
                  <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isEdit ? 'Edit Product' : 'Add Product'}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter product name"
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
                    placeholder="product-url-slug"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  {...form.register('short_description')}
                  placeholder="Brief product summary for listings"
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Detailed product description"
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category & Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Category & Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={form.watch('category_id') || ''} 
                    onValueChange={(value) => form.setValue('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="product_type">Product Type *</Label>
                  <Select 
                    value={form.watch('product_type') || ''} 
                    onValueChange={(value) => form.setValue('product_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machinery">Machinery</SelectItem>
                      <SelectItem value="component">Component</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.product_type && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.product_type.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (Optional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select 
                    value={form.watch('price_currency')} 
                    onValueChange={(value) => form.setValue('price_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price Type</Label>
                  <Select 
                    value={form.watch('price_type')} 
                    onValueChange={(value) => form.setValue('price_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="quote">Price on Request</SelectItem>
                      <SelectItem value="starting_from">Starting From</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <SpecificationsEditor
            specifications={form.watch('specifications')}
            onChange={(specs) => form.setValue('specifications', specs)}
          />

          {/* Media Management */}
          <MediaUpload
            media={media}
            onChange={setMedia}
          />

          {/* Component Assignment */}
          <ComponentAssignment
            productComponents={productComponents}
            onChange={setProductComponents}
          />

          {/* Features & Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Automation Level</Label>
                  <Select 
                    value={form.watch('automation_level') || ''} 
                    onValueChange={(value) => form.setValue('automation_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select automation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="fully-automated">Fully Automated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...form.register('weight', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                  <Input
                    id="lead_time_days"
                    type="number"
                    {...form.register('lead_time_days', { valueAsNumber: true })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="warranty_months">Warranty (Months)</Label>
                  <Input
                    id="warranty_months"
                    type="number"
                    {...form.register('warranty_months', { valueAsNumber: true })}
                    placeholder="12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Fields */}
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
                  placeholder="SEO title for search engines"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  {...form.register('meta_description')}
                  placeholder="SEO description for search engines"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={form.watch('status')} 
                    onValueChange={(value) => form.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.watch('is_featured')}
                    onCheckedChange={(checked) => form.setValue('is_featured', checked)}
                  />
                  <Label>Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.watch('is_bestseller')}
                    onCheckedChange={(checked) => form.setValue('is_bestseller', checked)}
                  />
                  <Label>Bestseller</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Form
            </Button>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin/products')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}