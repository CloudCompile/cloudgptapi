-- Add admin role for christopherhauser1234@gmail.com
-- If user already exists by ID, update their role. Otherwise insert new record.
INSERT INTO public.profiles (id, email, role, plan, created_at, updated_at)
VALUES (
  'christopherhauser_admin',
  'christopherhauser1234@gmail.com',
  'admin',
  'admin',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'christopherhauser1234@gmail.com',
  role = 'admin',
  plan = 'admin',
  updated_at = now();
