import { useState, useCallback } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface SpecificationField {
  key: string;
  value: any;
  type: 'text' | 'number' | 'boolean' | 'array';
}

interface SpecificationsEditorProps {
  specifications: Record<string, any>;
  onChange: (specifications: Record<string, any>) => void;
}

export function SpecificationsEditor({ specifications, onChange }: SpecificationsEditorProps) {
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  const fields: SpecificationField[] = Object.entries(specifications).map(([key, value]) => ({
    key,
    value,
    type: inferType(value)
  }));

  const addField = useCallback(() => {
    const newKey = `new_field_${Date.now()}`;
    onChange({
      ...specifications,
      [newKey]: ''
    });
  }, [specifications, onChange]);

  const updateField = useCallback((oldKey: string, newKey: string, value: any, type: string) => {
    const newSpecs = { ...specifications };
    
    // Remove old key if it changed
    if (oldKey !== newKey) {
      delete newSpecs[oldKey];
    }
    
    // Convert value based on type
    let convertedValue = value;
    switch (type) {
      case 'number':
        convertedValue = value === '' ? null : Number(value);
        break;
      case 'boolean':
        convertedValue = Boolean(value);
        break;
      case 'array':
        if (typeof value === 'string') {
          convertedValue = value.split(',').map(s => s.trim()).filter(Boolean);
        }
        break;
      default:
        convertedValue = value;
    }
    
    newSpecs[newKey] = convertedValue;
    onChange(newSpecs);
  }, [specifications, onChange]);

  const removeField = useCallback((key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    onChange(newSpecs);
  }, [specifications, onChange]);

  const getDisplayValue = (value: any, type: string): string => {
    if (type === 'array' && Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value || '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Technical Specifications
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
            >
              {showJsonPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showJsonPreview ? 'Hide JSON' : 'Show JSON'}
            </Button>
            <Button onClick={addField} size="sm">
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showJsonPreview ? (
          <div className="space-y-2">
            <Label>JSON Preview</Label>
            <Textarea
              value={JSON.stringify(specifications, null, 2)}
              readOnly
              className="font-mono text-sm min-h-[200px]"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No specifications added yet. Click "Add Field" to get started.
              </div>
            ) : (
              fields.map((field, index) => (
                <FieldEditor
                  key={`${field.key}-${index}`}
                  field={field}
                  onUpdate={(newKey, value, type) => updateField(field.key, newKey, value, type)}
                  onRemove={() => removeField(field.key)}
                />
              ))
            )}
          </div>
        )}
        
        {fields.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <strong>{fields.length}</strong> specification{fields.length !== 1 ? 's' : ''} defined
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FieldEditorProps {
  field: SpecificationField;
  onUpdate: (key: string, value: any, type: string) => void;
  onRemove: () => void;
}

function FieldEditor({ field, onUpdate, onRemove }: FieldEditorProps) {
  const [localKey, setLocalKey] = useState(field.key);
  const [localType, setLocalType] = useState(field.type);

  const handleKeyChange = (newKey: string) => {
    setLocalKey(newKey);
    onUpdate(newKey, field.value, localType);
  };

  const handleTypeChange = (newType: string) => {
    setLocalType(newType as any);
    let newValue = field.value;
    
    // Convert existing value to new type
    switch (newType) {
      case 'boolean':
        newValue = Boolean(field.value);
        break;
      case 'number':
        newValue = Number(field.value) || 0;
        break;
      case 'array':
        newValue = Array.isArray(field.value) ? field.value : [String(field.value)].filter(Boolean);
        break;
      default:
        newValue = String(field.value || '');
    }
    
    onUpdate(localKey, newValue, newType);
  };

  const handleValueChange = (newValue: any) => {
    onUpdate(localKey, newValue, localType);
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-start p-3 border rounded-lg">
      <div className="col-span-3">
        <Label className="text-xs">Field Name</Label>
        <Input
          value={localKey}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="field_name"
          className="mt-1"
        />
      </div>
      
      <div className="col-span-2">
        <Label className="text-xs">Type</Label>
        <Select value={localType} onValueChange={handleTypeChange}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="array">Array</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-6">
        <Label className="text-xs">Value</Label>
        <div className="mt-1">
          {localType === 'boolean' ? (
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={handleValueChange}
              />
              <Label className="text-sm">{field.value ? 'True' : 'False'}</Label>
            </div>
          ) : localType === 'array' ? (
            <Input
              value={getDisplayValue(field.value, localType)}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="item1, item2, item3"
            />
          ) : (
            <Input
              type={localType === 'number' ? 'number' : 'text'}
              value={getDisplayValue(field.value, localType)}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={localType === 'number' ? '0' : 'Enter value'}
            />
          )}
        </div>
      </div>
      
      <div className="col-span-1 pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function inferType(value: any): 'text' | 'number' | 'boolean' | 'array' {
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  return 'text';
}

function getDisplayValue(value: any, type: string): string {
  if (type === 'array' && Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value || '');
}