-- Add workplace assignment fields to users table
ALTER TABLE public.users 
ADD COLUMN hospital_id UUID REFERENCES public.hospitals(id),
ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id);

-- Add constraint to ensure user is assigned to either hospital OR warehouse, not both
ALTER TABLE public.users 
ADD CONSTRAINT check_single_workplace 
CHECK (
  (hospital_id IS NOT NULL AND warehouse_id IS NULL) OR 
  (hospital_id IS NULL AND warehouse_id IS NOT NULL) OR 
  (hospital_id IS NULL AND warehouse_id IS NULL AND role IN ('admin', 'unassigned'))
);

-- Create index for better performance on workplace queries
CREATE INDEX idx_users_hospital_id ON public.users(hospital_id);
CREATE INDEX idx_users_warehouse_id ON public.users(warehouse_id);