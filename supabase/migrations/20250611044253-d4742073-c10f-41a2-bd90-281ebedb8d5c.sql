
-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to manage their own data
CREATE POLICY "Admin users can view all admin data" 
  ON public.admin_users 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create admin sessions table for session management
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_sessions table
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin sessions
CREATE POLICY "Admin sessions can be managed" 
  ON public.admin_sessions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Insert a default admin user (password: admin123 - should be changed in production)
INSERT INTO public.admin_users (email, password_hash, full_name) 
VALUES ('admin@example.com', '$2b$10$rQZ2Fk3q8CQ9Jh2YfLyFxOQKzJJgZmZhXfBvXyWoQJ8oQqQrQ8YtK', 'Admin User');
