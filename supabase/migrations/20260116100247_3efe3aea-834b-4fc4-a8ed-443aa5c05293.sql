-- Allow anyone to update helpful_count on reviews
CREATE POLICY "Anyone can update helpful count"
ON public.product_reviews
FOR UPDATE
USING (true)
WITH CHECK (true);