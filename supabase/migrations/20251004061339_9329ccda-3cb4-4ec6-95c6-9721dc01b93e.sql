-- Allow admins to create batches
CREATE POLICY "Admins can create batches"
ON public.batches
FOR INSERT
WITH CHECK (get_current_user_role() = 'admin');