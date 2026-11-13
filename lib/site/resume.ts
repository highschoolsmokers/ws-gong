// The resume PDF lives in the public Vercel Blob store, not in git (SPEC §22, §23).
// The site serves it at RESUME_PATH through a rewrite, so existing links keep working.
export const RESUME_PATH = "/wsgong_tech_writer_resume.pdf";
export const RESUME_BLOB_URL =
  "https://apie6diz2oc6rfb7.public.blob.vercel-storage.com/wsgong_tech_writer_resume.pdf";
