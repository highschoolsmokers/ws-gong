// The résumé and CV PDFs live in the public Vercel Blob store, not in git
// (SPEC §13, §14). The site serves each at its own path through a rewrite.
const BLOB = "https://apie6diz2oc6rfb7.public.blob.vercel-storage.com";
export const PDFS = {
  resume: "wsgong_tech_writer_resume.pdf",
  cv: "wsgong_cv.pdf",
};
export const blobUrl = (name: string) => `${BLOB}/${name}`;
