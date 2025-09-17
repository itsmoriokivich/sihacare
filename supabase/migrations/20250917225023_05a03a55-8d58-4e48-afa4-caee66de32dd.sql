-- Create the admin user directly in auth.users and users table
-- Note: This creates a placeholder admin account that will be activated when they first sign up

-- First, let's create a function to ensure admin gets created properly
CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS void AS $$
BEGIN
  -- Check if admin already exists in users table
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@example.com') THEN
    -- Insert admin user record (this will be linked when they sign up through auth)
    INSERT INTO public.users (
      id, 
      email, 
      name, 
      role, 
      status, 
      is_approved,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, -- Temporary ID, will be updated when they sign up
      'admin@example.com',
      'System Administrator',
      'admin'::user_role,
      'approved'::user_status,
      true,
      now(),
      now()
    ) ON CONFLICT (email) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Run the function to ensure admin exists
SELECT public.ensure_admin_exists();

-- Also update the trigger to handle edge cases better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this email already has a pending record and update it
    IF EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
        -- Update existing record with the real auth ID
        UPDATE public.users 
        SET 
            id = NEW.id,
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
                WHEN NEW.email = 'admin@example.com' THEN 'admin'::user_role
                ELSE COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'unassigned'::user_role)
            END,
            CASE 
                WHEN NEW.email = 'admin@example.com' THEN 'approved'::user_status
                ELSE 'pending'::user_status
            END,
            CASE 
                WHEN NEW.email = 'admin@example.com' THEN true
                ELSE false
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;