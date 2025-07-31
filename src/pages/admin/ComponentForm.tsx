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
import { SpecificationsEditor } from '@/components/admin/forms/SpecificationsEditor';

const componentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  description: z.string().optional(),
  component_type: z.string().optional(),
  manufacturer: z.string().optional(),
  model_number: z.string().optional(),
  specifications: z.any().optional(),
  is_active: z.boolean().optional(),
});

type ComponentFormData = z.infer<typeof componentSchema>;

export default function ComponentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      specifications: {},
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetchComponent();
    }
  }, [id, isEdit]);

  const fetchComponent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const { data: component, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      form.reset({
        ...component,
        specifications: component.specifications || {},
      });

    } catch (error) {
      console.error('Error fetching component:', error);
      toast({
        title: "Error",
        description: "Failed to load component",
        variant: "destructive"
      });
      navigate('/admin/components');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ComponentFormData) => {
    try {
      setSaving(true);

      if (isEdit) {
        const { error } = await supabase
          .from('components')
          .update(data)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('components')
          .insert(data);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Component ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate('/admin/components');
    } catch (error) {
      console.error('Error saving component:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} component`,
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
            <div className="text-muted-foreground">Loading component...</div>
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
                  <BreadcrumbLink href="/admin/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isEdit ? 'Edit Component' : 'Add Component'}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Component' : 'Add New Component'}
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/components')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Components
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Component Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter component name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Component description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Component Type</Label>
                  <Select 
                    value={form.watch('component_type') || ''} 
                    onValueChange={(value) => form.setValue('component_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motor">Motor</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="actuator">Actuator</SelectItem>
                      <SelectItem value="controller">Controller</SelectItem>
                      <SelectItem value="pump">Pump</SelectItem>
                      <SelectItem value="valve">Valve</SelectItem>
                      <SelectItem value="bearing">Bearing</SelectItem>
                      <SelectItem value="gear">Gear</SelectItem>
                      <SelectItem value="belt">Belt</SelectItem>
                      <SelectItem value="filter">Filter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    {...form.register('manufacturer')}
                    placeholder="Component manufacturer"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="model_number">Model Number</Label>
                <Input
                  id="model_number"
                  {...form.register('model_number')}
                  placeholder="Model/Part number"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Active Component</Label>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <SpecificationsEditor
                specifications={form.watch('specifications') || {}}
                onChange={(specs) => form.setValue('specifications', specs)}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : (isEdit ? 'Update Component' : 'Create Component')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/components')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}