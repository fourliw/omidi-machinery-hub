import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Component {
  id: string;
  name: string;
  component_type: string;
  manufacturer: string;
  description: string;
  specifications: Record<string, any>;
}

export interface ProductComponent {
  component_id: string;
  component?: Component;
  quantity: number;
  is_optional: boolean;
  notes?: string;
  sort_order: number;
}

interface ComponentAssignmentProps {
  productComponents: ProductComponent[];
  onChange: (components: ProductComponent[]) => void;
}

export function ComponentAssignment({ productComponents, onChange }: ComponentAssignmentProps) {
  const [availableComponents, setAvailableComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableComponents((data || []).map(item => ({
        ...item,
        specifications: item.specifications as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching components:', error);
      toast({
        title: "Error",
        description: "Failed to load components",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = availableComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.component_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedComponentIds = new Set(productComponents.map(pc => pc.component_id));
  const unassignedComponents = filteredComponents.filter(c => !assignedComponentIds.has(c.id));

  const addComponent = useCallback((component: Component) => {
    const newProductComponent: ProductComponent = {
      component_id: component.id,
      component,
      quantity: 1,
      is_optional: false,
      sort_order: productComponents.length
    };

    onChange([...productComponents, newProductComponent]);
    setSelectedComponent(null);
    toast({
      title: "Component Added",
      description: `${component.name} has been added to the product`,
    });
  }, [productComponents, onChange, toast]);

  const removeComponent = useCallback((componentId: string) => {
    const newComponents = productComponents.filter(pc => pc.component_id !== componentId);
    const reorderedComponents = newComponents.map((pc, index) => ({
      ...pc,
      sort_order: index
    }));
    onChange(reorderedComponents);
  }, [productComponents, onChange]);

  const updateComponent = useCallback((componentId: string, updates: Partial<ProductComponent>) => {
    const newComponents = productComponents.map(pc =>
      pc.component_id === componentId ? { ...pc, ...updates } : pc
    );
    onChange(newComponents);
  }, [productComponents, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Component Assignment
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select Components</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading components...
                  </div>
                ) : unassignedComponents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No components found matching your search' : 'All available components are already assigned'}
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {unassignedComponents.map((component) => (
                      <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {component.component_type} • {component.manufacturer}
                          </div>
                          {component.description && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {component.description}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addComponent(component)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {productComponents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4" />
            <p>No components assigned yet</p>
            <p className="text-sm">Add components to define what makes up this product</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {productComponents.length} component{productComponents.length !== 1 ? 's' : ''} assigned
            </div>
            {productComponents.map((productComponent, index) => (
              <div key={productComponent.component_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {productComponent.component?.name || 'Unknown Component'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {productComponent.component?.component_type} • {productComponent.component?.manufacturer}
                    </div>
                    {productComponent.component?.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {productComponent.component.description}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComponent(productComponent.component_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={productComponent.quantity}
                      onChange={(e) => updateComponent(
                        productComponent.component_id,
                        { quantity: parseInt(e.target.value) || 1 }
                      )}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={productComponent.is_optional}
                      onCheckedChange={(checked) => updateComponent(
                        productComponent.component_id,
                        { is_optional: checked }
                      )}
                    />
                    <Label className="text-sm">Optional</Label>
                  </div>

                  <div className="flex items-center pt-6">
                    {productComponent.is_optional && (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    placeholder="Special requirements or notes for this component..."
                    value={productComponent.notes || ''}
                    onChange={(e) => updateComponent(
                      productComponent.component_id,
                      { notes: e.target.value }
                    )}
                    className="mt-1 min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}