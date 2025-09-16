-- Create admin user account
-- Note: This creates the admin user in the users table. 
-- The admin will need to sign up with these credentials through the UI first

-- Insert admin user data (this will be linked when they sign up)
-- We'll update the trigger to handle admin account setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;