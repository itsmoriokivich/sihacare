-- Update xxx75885@gmail.com to super_admin
UPDATE public.users 
SET role = 'super_admin'::user_role
WHERE email = 'xxx75885@gmail.com';

-- Update the handle_new_user function to set super_admin for xxx75885@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
        UPDATE public.users 
        SET 
            id = NEW.id,
            name = COALESCE(NEW.raw_user_meta_data->>'name', name),
            role = CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN 'super_admin'::user_role
                ELSE role
            END,
            status = CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN 'approved'::user_status
                ELSE status
            END,
            is_approved = CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN true
                ELSE is_approved
            END,
            updated_at = now()
        WHERE email = NEW.email;
    ELSE
        INSERT INTO public.users (id, email, name, role, status, is_approved)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN 'super_admin'::user_role
                ELSE COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'unassigned'::user_role)
            END,
            CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN 'approved'::user_status
                ELSE 'pending'::user_status
            END,
            CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN true
                ELSE false
            END
        );
    END IF;
    RETURN NEW;
END;
$function$;

-- Add RLS policies for super_admin
CREATE POLICY "Super admins have full access to batches"
ON public.batches FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins have full access to dispatches"
ON public.dispatches FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins have full access to hospitals"
ON public.hospitals FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins have full access to warehouses"
ON public.warehouses FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins have full access to patients"
ON public.patients FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins have full access to usage_records"
ON public.usage_records FOR ALL
USING (get_current_user_role() = 'super_admin');

-- Add column to track remaining quantity in batches
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS remaining_quantity integer;

-- Initialize remaining_quantity with current quantity for existing batches
UPDATE public.batches 
SET remaining_quantity = quantity 
WHERE remaining_quantity IS NULL;

-- Make remaining_quantity NOT NULL with default
ALTER TABLE public.batches 
ALTER COLUMN remaining_quantity SET NOT NULL,
ALTER COLUMN remaining_quantity SET DEFAULT 0;

-- Create trigger to decrease batch quantity when usage is recorded
CREATE OR REPLACE FUNCTION public.decrease_batch_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Decrease the remaining quantity
    UPDATE public.batches
    SET 
        remaining_quantity = remaining_quantity - NEW.quantity,
        status = CASE 
            WHEN remaining_quantity - NEW.quantity <= 0 THEN 'administered'::batch_status
            ELSE status
        END,
        updated_at = now()
    WHERE id = NEW.batch_id;
    
    RETURN NEW;
END;
$function$;

-- Create trigger on usage_records
DROP TRIGGER IF EXISTS on_usage_record_created ON public.usage_records;
CREATE TRIGGER on_usage_record_created
    AFTER INSERT ON public.usage_records
    FOR EACH ROW
    EXECUTE FUNCTION public.decrease_batch_quantity();