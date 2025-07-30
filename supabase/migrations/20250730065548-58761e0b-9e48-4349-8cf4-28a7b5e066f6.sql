-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to assign default user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Admin CRUD policies for products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD policies for categories
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD policies for components
CREATE POLICY "Admins can insert components"
ON public.components
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update components"
ON public.components
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete components"
ON public.components
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD policies for news
CREATE POLICY "Admins can insert news"
ON public.news
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news"
ON public.news
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news"
ON public.news
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD policies for product_media
CREATE POLICY "Admins can insert product media"
ON public.product_media
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product media"
ON public.product_media
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product media"
ON public.product_media
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD policies for product_components
CREATE POLICY "Admins can insert product components"
ON public.product_components
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product components"
ON public.product_components
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product components"
ON public.product_components
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin CRUD policies for product_faqs
CREATE POLICY "Admins can insert product faqs"
ON public.product_faqs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product faqs"
ON public.product_faqs
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product faqs"
ON public.product_faqs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Secure customer inquiries access
CREATE POLICY "Admins can view customer inquiries"
ON public.customer_inquiries
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customer inquiries"
ON public.customer_inquiries
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update storage policies for admin-only uploads
CREATE POLICY "Admins can upload product media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' AND 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-media' AND 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-media' AND 
  public.has_role(auth.uid(), 'admin')
);