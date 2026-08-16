export function createPublicStorageUrl(
  supabaseUrl: string,
  bucket: string,
  objectPath: string,
  downloadName?: string,
) {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const path = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const url = new URL(
    `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path}`,
  );

  if (downloadName) url.searchParams.set("download", downloadName);
  return url.toString();
}
