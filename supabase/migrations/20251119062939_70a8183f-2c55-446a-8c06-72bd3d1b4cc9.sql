-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('TEACHER', 'STUDENT');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create audio_lessons table
CREATE TABLE public.audio_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on audio_lessons
ALTER TABLE public.audio_lessons ENABLE ROW LEVEL SECURITY;

-- Create mind_maps table
CREATE TABLE public.mind_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on mind_maps
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mind_maps_updated_at
  BEFORE UPDATE ON public.mind_maps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notes
CREATE POLICY "Teachers can create notes"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own notes"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own notes"
  ON public.notes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Everyone can view notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for audio_lessons
CREATE POLICY "Teachers can create audio lessons"
  ON public.audio_lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own audio lessons"
  ON public.audio_lessons FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Everyone can view audio lessons"
  ON public.audio_lessons FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for mind_maps
CREATE POLICY "Teachers can create mind maps"
  ON public.mind_maps FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own mind maps"
  ON public.mind_maps FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own mind maps"
  ON public.mind_maps FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'TEACHER') AND auth.uid() = teacher_id);

CREATE POLICY "Everyone can view mind maps"
  ON public.mind_maps FOR SELECT
  TO authenticated
  USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audio_lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mind_maps;