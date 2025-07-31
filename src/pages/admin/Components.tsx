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

interface Component {
  id: string;
  name: string;
  component_type: string | null;
  manufacturer: string | null;
  model_number: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Components() {
  const navigate = useNavigate();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error('Error fetching components:', error);
      toast({
        title: "Error",
        description: "Failed to load components",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComponents(components.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Component deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting component:', error);
      toast({
        title: "Error",
        description: "Failed to delete component",
        variant: "destructive",
      });
    }
  };

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (component.manufacturer && component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (component.model_number && component.model_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (isActive: boolean) => {
    const variant = isActive ? 'default' : 'secondary';
    return <Badge variant={variant}>{isActive ? 'Active' : 'Inactive'}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Components</h1>
            <p className="text-muted-foreground">
              Manage machinery components and parts
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/admin/components/new')}>
            <Plus className="h-4 w-4" />
            Add Component
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
                  placeholder="Search components..."
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

        {/* Components Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Components ({filteredComponents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading components...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComponents.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          {component.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {component.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.component_type ? (
                          <Badge variant="outline">{component.component_type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {component.manufacturer || (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {component.model_number || (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(component.is_active)}
                      </TableCell>
                      <TableCell>
                        {new Date(component.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => navigate(`/admin/components/${component.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(component.id, component.name)}
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