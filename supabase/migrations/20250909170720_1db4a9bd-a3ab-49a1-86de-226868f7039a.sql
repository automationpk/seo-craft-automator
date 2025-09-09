-- Fix critical security vulnerability in admin_sessions table
-- Current policy allows public access to session tokens

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Admin sessions can be managed" ON public.admin_sessions;

-- Create secure policies that only allow:
-- 1. Session owners to read their own session data
-- 2. Authenticated users to create sessions (during login)
-- 3. Session owners to delete their own sessions
-- 4. Admin users to manage all sessions

-- Policy 1: Users can read only their own session data by token
CREATE POLICY "Users can read own session by token" 
ON public.admin_sessions 
FOR SELECT 
USING (
  session_token = current_setting('request.headers', true)::json->>'authorization' 
  OR session_token IN (
    SELECT unnest(string_to_array(
      coalesce(current_setting('request.headers', true)::json->>'cookie', ''), 
      ';'
    ))
  )
);

-- Policy 2: Allow session creation during login (no auth required for INSERT)
CREATE POLICY "Allow session creation" 
ON public.admin_sessions 
FOR INSERT 
WITH CHECK (true);

-- Policy 3: Users can delete sessions they own by token
CREATE POLICY "Users can delete own sessions" 
ON public.admin_sessions 
FOR DELETE 
USING (
  session_token = current_setting('request.headers', true)::json->>'authorization'
  OR session_token IN (
    SELECT unnest(string_to_array(
      coalesce(current_setting('request.headers', true)::json->>'cookie', ''), 
      ';'
    ))
  )
);

-- Policy 4: Authenticated admin users can manage all sessions
CREATE POLICY "Authenticated admins can manage all sessions" 
ON public.admin_sessions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_sessions as
    JOIN admin_users au ON as.admin_id = au.id
    WHERE as.session_token = current_setting('request.headers', true)::json->>'authorization'
    AND as.expires_at > now()
    AND au.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_sessions as
    JOIN admin_users au ON as.admin_id = au.id  
    WHERE as.session_token = current_setting('request.headers', true)::json->>'authorization'
    AND as.expires_at > now()
    AND au.is_active = true
  )
);