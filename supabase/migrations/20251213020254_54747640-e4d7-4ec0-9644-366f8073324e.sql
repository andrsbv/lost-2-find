-- Allow anyone to read profiles (for displaying user info on reports and messages)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Keep existing policies for insert and update (only owner can modify their own profile)