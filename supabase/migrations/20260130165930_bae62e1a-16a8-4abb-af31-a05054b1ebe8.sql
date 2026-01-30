-- Remove the email column from profiles table since it duplicates data from auth.users
-- and creates unnecessary exposure risk. Email is already available via auth session.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Also update the handle_new_user function to not copy email to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$function$;