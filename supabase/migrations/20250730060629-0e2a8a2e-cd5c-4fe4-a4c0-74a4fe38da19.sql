-- Create storage bucket for product media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-media', 'product-media', true);

-- Create storage policies for product media uploads
CREATE POLICY "Public can view product media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-media');

CREATE POLICY "Authenticated users can upload product media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-media' AND auth.role() = 'authenticated');