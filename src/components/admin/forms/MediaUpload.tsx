import { useState, useCallback } from 'react';
import { Upload, Link, X, Image, FileText, Video, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MediaItem {
  id?: string;
  file_url: string;
  file_name: string;
  media_type: 'image' | 'video' | 'document';
  is_primary: boolean;
  alt_text?: string;
  title?: string;
  sort_order: number;
}

interface MediaUploadProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
}

export function MediaUpload({ media, onChange }: MediaUploadProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const addMediaFromUrl = useCallback(() => {
    if (!urlInput.trim()) return;

    const mediaType = getMediaTypeFromUrl(urlInput);
    const fileName = urlInput.split('/').pop() || 'media-item';
    
    const newMedia: MediaItem = {
      file_url: urlInput.trim(),
      file_name: fileName,
      media_type: mediaType,
      is_primary: media.length === 0,
      sort_order: media.length
    };

    onChange([...media, newMedia]);
    setUrlInput('');
    toast({
      title: "Media Added",
      description: "Media item added successfully from URL",
    });
  }, [urlInput, media, onChange, toast]);

  const uploadToSupabase = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-media')
        .getPublicUrl(filePath);

      const mediaType = getMediaTypeFromFile(file);
      
      const newMedia: MediaItem = {
        file_url: publicUrl,
        file_name: file.name,
        media_type: mediaType,
        is_primary: media.length === 0,
        sort_order: media.length
      };

      onChange([...media, newMedia]);
      toast({
        title: "Upload Complete",
        description: "File uploaded successfully to storage",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to storage",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [media, onChange, toast]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      uploadToSupabase(file);
    });
  }, [uploadToSupabase]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeMedia = useCallback((index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    
    // Reorder and ensure we have a primary image
    const reorderedMedia = newMedia.map((item, i) => ({
      ...item,
      sort_order: i,
      is_primary: i === 0 && item.media_type === 'image'
    }));
    
    onChange(reorderedMedia);
  }, [media, onChange]);

  const moveMedia = useCallback((index: number, direction: 'up' | 'down') => {
    const newMedia = [...media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    
    const reorderedMedia = newMedia.map((item, i) => ({
      ...item,
      sort_order: i
    }));
    
    onChange(reorderedMedia);
  }, [media, onChange]);

  const setPrimary = useCallback((index: number) => {
    const newMedia = media.map((item, i) => ({
      ...item,
      is_primary: i === index && item.media_type === 'image'
    }));
    onChange(newMedia);
  }, [media, onChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Media Management
          <div className="flex items-center gap-2">
            <Label htmlFor="upload-mode">URL</Label>
            <Switch
              id="upload-mode"
              checked={uploadMode === 'upload'}
              onCheckedChange={(checked) => setUploadMode(checked ? 'upload' : 'url')}
            />
            <Label htmlFor="upload-mode">Upload</Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadMode === 'url' ? (
          <div className="flex gap-2">
            <Input
              placeholder="Enter image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMediaFromUrl()}
            />
            <Button onClick={addMediaFromUrl} disabled={!urlInput.trim()}>
              <Link className="h-4 w-4" />
              Add URL
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: Images (JPG, PNG, WebP), Videos (MP4, WebM), Documents (PDF)
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {media.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Media Items ({media.length})</h4>
            <div className="grid gap-3">
              {media.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {item.media_type === 'image' ? (
                      <img 
                        src={item.file_url} 
                        alt={item.alt_text || item.file_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : item.media_type === 'video' ? (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <Video className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.file_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.media_type}</Badge>
                      {item.is_primary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveMedia(index, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveMedia(index, 'down')}
                      disabled={index === media.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    {item.media_type === 'image' && !item.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrimary(index)}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getMediaTypeFromUrl(url: string): 'image' | 'video' | 'document' {
  const ext = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return 'image';
  }
  if (['mp4', 'webm', 'avi', 'mov'].includes(ext || '')) {
    return 'video';
  }
  return 'document';
}

function getMediaTypeFromFile(file: File): 'image' | 'video' | 'document' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}