-- Create table to track product views/browsing history
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own browsing history
CREATE POLICY "Users can view their own history"
ON public.product_views
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own views
CREATE POLICY "Users can track their views"
ON public.product_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own view counts
CREATE POLICY "Users can update their view counts"
ON public.product_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Create unique constraint for user + product
CREATE UNIQUE INDEX idx_product_views_user_product ON public.product_views(user_id, product_id);

-- Create index for faster queries
CREATE INDEX idx_product_views_user ON public.product_views(user_id);
CREATE INDEX idx_product_views_viewed_at ON public.product_views(viewed_at DESC);