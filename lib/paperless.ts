// Paperless-ngx API client
// Docs: https://docs.paperless-ngx.com/api/
//
// Required env vars:
//   PAPERLESS_URL   — e.g. http://localhost:8000
//   PAPERLESS_TOKEN — API token from Settings > Administration > Auth Tokens

const BASE_URL = process.env.PAPERLESS_URL ?? "http://localhost:8000";
const TOKEN = process.env.PAPERLESS_TOKEN ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaperlessDocument {
  id: number;
  title: string;
  content: string;
  tags: number[];
  document_type: number | null;
  correspondent: number | null;
  created: string;
  modified: string;
  added: string;
  archive_serial_number: string | null;
  original_file_name: string;
  archived_file_name: string | null;
}

export interface PaperlessTag {
  id: number;
  name: string;
  colour: number;
  slug: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  is_inbox_tag: boolean;
  document_count: number;
}

export interface PaperlessCorrespondent {
  id: number;
  name: string;
  slug: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
}

export interface PaperlessDocumentType {
  id: number;
  name: string;
  slug: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
}

export interface PaperlessList<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DocumentQuery {
  query?: string;
  tags__id__all?: number[];
  tags__id__in?: number[];
  correspondent__id?: number;
  document_type__id?: number;
  created__date__gt?: string; // ISO date
  created__date__lt?: string; // ISO date
  ordering?: string;          // e.g. "-created", "title"
  page?: number;
  page_size?: number;
}

// ─── Client ───────────────────────────────────────────────────────────────────

function headers(): HeadersInit {
  return {
    Authorization: `Token ${TOKEN}`,
    Accept: "application/json; version=5",
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...init,
    headers: { ...headers(), ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`Paperless API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function listDocuments(
  query: DocumentQuery = {},
  options?: { revalidate?: number },
): Promise<PaperlessList<PaperlessDocument>> {
  const params = new URLSearchParams();

  if (query.query) params.set("query", query.query);
  if (query.correspondent__id) params.set("correspondent__id", String(query.correspondent__id));
  if (query.document_type__id) params.set("document_type__id", String(query.document_type__id));
  if (query.created__date__gt) params.set("created__date__gt", query.created__date__gt);
  if (query.created__date__lt) params.set("created__date__lt", query.created__date__lt);
  if (query.ordering) params.set("ordering", query.ordering);
  if (query.page) params.set("page", String(query.page));
  if (query.page_size) params.set("page_size", String(query.page_size));
  query.tags__id__all?.forEach((id) => params.append("tags__id__all", String(id)));
  query.tags__id__in?.forEach((id) => params.append("tags__id__in", String(id)));

  const qs = params.toString();
  return request<PaperlessList<PaperlessDocument>>(
    `/documents/${qs ? `?${qs}` : ""}`,
    { next: { revalidate: options?.revalidate ?? 60 } } as RequestInit,
  );
}

export async function getDocument(id: number): Promise<PaperlessDocument> {
  return request<PaperlessDocument>(`/documents/${id}/`);
}

export async function updateDocument(
  id: number,
  fields: Partial<Pick<PaperlessDocument, "title" | "tags" | "document_type" | "correspondent" | "created" | "archive_serial_number">>,
): Promise<PaperlessDocument> {
  return request<PaperlessDocument>(`/documents/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

export async function uploadDocument(
  file: File | Blob,
  filename: string,
  meta?: { title?: string; correspondent?: number; document_type?: number; tags?: number[] },
): Promise<void> {
  const form = new FormData();
  form.append("document", file, filename);
  if (meta?.title) form.append("title", meta.title);
  if (meta?.correspondent) form.append("correspondent", String(meta.correspondent));
  if (meta?.document_type) form.append("document_type", String(meta.document_type));
  meta?.tags?.forEach((tag) => form.append("tags", String(tag)));

  await request<void>("/documents/post_document/", { method: "POST", body: form });
}

export async function deleteDocument(id: number): Promise<void> {
  await request<void>(`/documents/${id}/`, { method: "DELETE" });
}

/** Returns a URL to stream the original file — pass as an href or fetch with auth headers. */
export function documentDownloadUrl(id: number): string {
  return `${BASE_URL}/api/documents/${id}/download/`;
}

/** Returns a URL to the document thumbnail. */
export function documentThumbUrl(id: number): string {
  return `${BASE_URL}/api/documents/${id}/thumb/`;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function listTags(): Promise<PaperlessTag[]> {
  const data = await request<PaperlessList<PaperlessTag>>("/tags/?page_size=500");
  return data.results;
}

export async function getTag(id: number): Promise<PaperlessTag> {
  return request<PaperlessTag>(`/tags/${id}/`);
}

// ─── Correspondents ───────────────────────────────────────────────────────────

export async function listCorrespondents(): Promise<PaperlessCorrespondent[]> {
  const data = await request<PaperlessList<PaperlessCorrespondent>>("/correspondents/?page_size=500");
  return data.results;
}

// ─── Document Types ───────────────────────────────────────────────────────────

export async function listDocumentTypes(): Promise<PaperlessDocumentType[]> {
  const data = await request<PaperlessList<PaperlessDocumentType>>("/document_types/?page_size=500");
  return data.results;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function autocomplete(term: string, limit = 10): Promise<string[]> {
  return request<string[]>(
    `/search/autocomplete/?term=${encodeURIComponent(term)}&limit=${limit}`,
  );
}
