-- Create a function to approve users and confirm their email
CREATE OR REPLACE FUNCTION public.approve_user(user_email TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record users%ROWTYPE;
    auth_user_id UUID;
BEGIN
    -- Get the user record
    SELECT * INTO user_record FROM public.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Update the user status to approved
    UPDATE public.users 
    SET 
        status = 'approved'::user_status,
        is_approved = true,
        updated_at = now()
    WHERE email = user_email
    RETURNING id INTO auth_user_id;
    
    -- Confirm the user's email in auth.users
    -- This requires updating the auth.users table directly
    UPDATE auth.users 
    SET 
        email_confirmed_at = now(),
        updated_at = now()
    WHERE id = auth_user_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'User approved and email confirmed',
        'user_id', auth_user_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'Error approving user: ' || SQLERRM
        );
END;
$$;

-- Also create a function to get pending users for admin dashboard
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE(
    id UUID,
    email TEXT,
    name TEXT,
    role user_role,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT u.id, u.email, u.name, u.role, u.created_at
    FROM public.users u
    WHERE u.status = 'pending'::user_status
    ORDER BY u.created_at DESC;
$$;

-- Grant execute permissions to authenticated users (admins will be checked in RLS)
GRANT EXECUTE ON FUNCTION public.approve_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_users() TO authenticated;