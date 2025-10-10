-- Create app_role enum (reuse existing user_role enum values)
-- Note: We already have user_role enum, so we'll use it

-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's primary role (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'warehouse' THEN 3
      WHEN 'hospital' THEN 4
      WHEN 'clinician' THEN 5
      ELSE 6
    END
  LIMIT 1
$$;

-- Replace get_current_user_role to use new table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role(auth.uid())
$$;

-- Migrate existing roles from users table to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Set super admin for xxx75885@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::user_role
FROM public.users
WHERE email = 'xxx75885@gmail.com'
ON CONFLICT (user_id, role) DO UPDATE SET updated_at = now();

-- Update handle_new_user to use user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role user_role;
  user_status user_status;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if this is the super admin email
  is_super_admin := (NEW.email = 'xxx75885@gmail.com');
  
  -- Determine role and status
  IF is_super_admin THEN
    user_role := 'super_admin'::user_role;
    user_status := 'approved'::user_status;
  ELSE
    user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'unassigned'::user_role);
    user_status := 'pending'::user_status;
  END IF;
  
  -- Insert or update users table
  IF EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
    UPDATE public.users 
    SET 
      id = NEW.id,
      name = COALESCE(NEW.raw_user_meta_data->>'name', name),
      status = user_status,
      is_approved = is_super_admin,
      updated_at = now()
    WHERE email = NEW.email;
  ELSE
    INSERT INTO public.users (id, email, name, role, status, is_approved)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      user_role,
      user_status,
      is_super_admin
    );
  END IF;
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- RLS Policies for user_roles table

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins can view all roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Only super admins can insert/update roles
CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Prevent deletion of super admin role for xxx75885@gmail.com
CREATE POLICY "Cannot delete super admin role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  NOT (
    role = 'super_admin' 
    AND user_id IN (SELECT id FROM public.users WHERE email = 'xxx75885@gmail.com')
  )
);

-- Add trigger to prevent updating super admin's role
CREATE OR REPLACE FUNCTION public.protect_super_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent modification of super admin role for xxx75885@gmail.com
  IF OLD.role = 'super_admin' AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = OLD.user_id AND email = 'xxx75885@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Cannot modify super admin role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_super_admin_role_trigger
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION protect_super_admin_role();