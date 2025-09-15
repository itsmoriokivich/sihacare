-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'warehouse', 'hospital', 'clinician', 'unassigned');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE batch_status AS ENUM ('created', 'dispatched', 'received', 'administered');
CREATE TYPE dispatch_status AS ENUM ('pending', 'in_transit', 'received');

-- Create users table (extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'unassigned',
    status user_status NOT NULL DEFAULT 'pending',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouses table
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status batch_status NOT NULL DEFAULT 'created',
    qr_code TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dispatches table
CREATE TABLE public.dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id),
    from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    to_hospital_id UUID NOT NULL REFERENCES hospitals(id),
    quantity INTEGER NOT NULL,
    status dispatch_status NOT NULL DEFAULT 'pending',
    dispatched_by UUID NOT NULL REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    medical_record TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_records table (renamed from administrations for consistency)
CREATE TABLE public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    clinician_id UUID NOT NULL REFERENCES users(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    quantity INTEGER NOT NULL,
    notes TEXT,
    administered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role::TEXT FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create function to get current user status
CREATE OR REPLACE FUNCTION public.get_current_user_status()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT status::TEXT FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Anyone can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- RLS Policies for hospitals table
CREATE POLICY "Approved users can view hospitals" ON public.hospitals
    FOR SELECT USING (public.get_current_user_status() = 'approved');

CREATE POLICY "Admins can insert hospitals" ON public.hospitals
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- RLS Policies for warehouses table
CREATE POLICY "Approved users can view warehouses" ON public.warehouses
    FOR SELECT USING (public.get_current_user_status() = 'approved');

CREATE POLICY "Admins can insert warehouses" ON public.warehouses
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- RLS Policies for batches table
CREATE POLICY "Approved users can view batches" ON public.batches
    FOR SELECT USING (public.get_current_user_status() = 'approved');

CREATE POLICY "Warehouse users can create batches" ON public.batches
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'warehouse');

CREATE POLICY "Warehouse users can update their batches" ON public.batches
    FOR UPDATE USING (public.get_current_user_role() = 'warehouse' AND created_by = auth.uid());

CREATE POLICY "Admins can update all batches" ON public.batches
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- RLS Policies for dispatches table
CREATE POLICY "Approved users can view dispatches" ON public.dispatches
    FOR SELECT USING (public.get_current_user_status() = 'approved');

CREATE POLICY "Warehouse users can create dispatches" ON public.dispatches
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'warehouse');

CREATE POLICY "Hospital users can update dispatches" ON public.dispatches
    FOR UPDATE USING (public.get_current_user_role() = 'hospital');

CREATE POLICY "Admins can update all dispatches" ON public.dispatches
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- RLS Policies for patients table
CREATE POLICY "Approved users can view patients" ON public.patients
    FOR SELECT USING (public.get_current_user_status() = 'approved');

CREATE POLICY "Hospital users can manage patients" ON public.patients
    FOR ALL USING (public.get_current_user_role() IN ('hospital', 'admin'));

-- RLS Policies for usage_records table
CREATE POLICY "Approved users can view usage records" ON public.usage_records
    FOR SELECT USING (public.get_current_user_status() = 'approved');

CREATE POLICY "Clinicians can create usage records" ON public.usage_records
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'clinician' AND clinician_id = auth.uid());

CREATE POLICY "Admins can manage all usage records" ON public.usage_records
    FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, status, is_approved)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'unassigned',
        'pending',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at
    BEFORE UPDATE ON public.batches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data: Create admin account and sample data
-- Note: The admin user will be created when they first sign up with admin@example.com
-- We'll create sample hospitals and warehouses
INSERT INTO public.hospitals (name, location, capacity) VALUES
    ('General Hospital', 'New York, NY', 500),
    ('City Medical Center', 'Los Angeles, CA', 300),
    ('Regional Health Center', 'Chicago, IL', 200);

INSERT INTO public.warehouses (name, location) VALUES
    ('Central Warehouse', 'New Jersey, NJ'),
    ('West Coast Facility', 'California, CA'),
    ('Midwest Distribution', 'Illinois, IL');

-- Enable realtime for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispatches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;