-- Create audio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true);

-- RLS policies for audio bucket
CREATE POLICY "Teachers can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio');