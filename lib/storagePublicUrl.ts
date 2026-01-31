export function getPublicStorageUrl(bucket: string, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");

  // public object URL
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
