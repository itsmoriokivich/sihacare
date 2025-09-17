-- Update the system to recognize xxx75885@gmail.com as the admin account
-- First, update the existing record to admin status
UPDATE public.users 
SET 
    role = 'admin'::user_role,
    status = 'approved'::user_status,
    is_approved = true,
    name = 'System Administrator',
    updated_at = now()
WHERE email = 'xxx75885@gmail.com';

-- Update the trigger function to recognize the new admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this email already has a record and update it
    IF EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
        -- Update existing record with the real auth ID and proper role
        UPDATE public.users 
        SET 
            id = NEW.id,
            name = COALESCE(NEW.raw_user_meta_data->>'name', name),
            role = CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN 'admin'::user_role
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
        -- Insert new user record
        INSERT INTO public.users (id, email, name, role, status, is_approved)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            CASE 
                WHEN NEW.email = 'xxx75885@gmail.com' THEN 'admin'::user_role
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;