-- Fix critical security issues

-- 1. Add comprehensive RLS policies for customer_inquiries table
-- This table handles sensitive customer data and needs proper access control

-- Allow public to insert inquiries (contact forms)
CREATE POLICY "Allow public to submit inquiries" 
ON public.customer_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Only allow reading inquiries for authenticated users (future admin access)
CREATE POLICY "Authenticated users can view inquiries" 
ON public.customer_inquiries 
FOR SELECT 
USING (false); -- Disabled for now until authentication is implemented

-- Only allow authenticated users to update inquiries
CREATE POLICY "Authenticated users can update inquiries" 
ON public.customer_inquiries 
FOR UPDATE 
USING (false); -- Disabled for now until authentication is implemented

-- Only allow authenticated users to delete inquiries  
CREATE POLICY "Authenticated users can delete inquiries" 
ON public.customer_inquiries 
FOR DELETE 
USING (false); -- Disabled for now until authentication is implemented

-- 2. Add RLS policies for product_filters table
-- This controls product filtering functionality

-- Allow public read access for active filters
CREATE POLICY "Public read access for active product filters" 
ON public.product_filters 
FOR SELECT 
USING (is_active = true);

-- Restrict write operations until authentication is implemented
CREATE POLICY "Restrict product filter modifications" 
ON public.product_filters 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Restrict product filter updates" 
ON public.product_filters 
FOR UPDATE 
USING (false);

CREATE POLICY "Restrict product filter deletions" 
ON public.product_filters 
FOR DELETE 
USING (false);

-- 3. Secure database functions by adding search_path protection
-- This prevents search path attacks

CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_news_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;