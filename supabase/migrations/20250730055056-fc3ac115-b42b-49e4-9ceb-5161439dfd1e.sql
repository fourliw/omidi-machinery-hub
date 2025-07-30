-- Fix Security Definer views warnings
-- Convert security definer views to regular views with proper RLS

-- Drop the existing security definer views
DROP VIEW IF EXISTS public.products_with_categories;
DROP VIEW IF EXISTS public.products_with_component_count;

-- Recreate as regular views (they will inherit RLS policies from base tables)
CREATE VIEW public.products_with_categories AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id;

CREATE VIEW public.products_with_component_count AS
SELECT 
    p.*,
    COALESCE(COUNT(pc.component_id), 0) as total_components
FROM public.products p
LEFT JOIN public.product_components pc ON p.id = pc.product_id
GROUP BY p.id, p.name, p.slug, p.description, p.short_description, p.price, 
         p.price_currency, p.price_type, p.product_type, p.category_id, 
         p.specifications, p.production_capacity, p.power_consumption, 
         p.dimensions, p.weight, p.lead_time_days, p.warranty_months,
         p.automation_level, p.certification_standards, p.tags, 
         p.is_featured, p.is_bestseller, p.status, p.meta_title, 
         p.meta_description, p.search_vector, p.created_at, p.updated_at;