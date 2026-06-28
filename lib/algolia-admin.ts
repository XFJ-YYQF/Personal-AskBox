import { getEnv } from "./env";

async function client() {
  const { algoliasearch } = await import("algoliasearch");
  const appId = getEnv("NEXT_PUBLIC_ALGOLIA_APP_ID");
  const adminKey = getEnv("ALGOLIA_ADMIN_API_KEY");
  if (!appId || !adminKey) return null;
  return algoliasearch(appId, adminKey);
}

export type AlgoliaQuestion = {
  objectID: string;
  nickname: string | null;
  content: string;
  answer: string | null;
  status: string;
  attachment_key: string | null;
  created_at: string;
  published_at: string | null;
};

export async function indexQuestion(record: AlgoliaQuestion) {
  const c = await client();
  const indexName = getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!c || !indexName) return;
  await c.saveObject({ indexName, body: record }).catch(() => null);
}

export async function partialUpdateQuestion(objectID: string, fields: Partial<AlgoliaQuestion>) {
  const c = await client();
  const indexName = getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!c || !indexName) return;
  await c.partialUpdateObject({ indexName, objectID, attributesToUpdate: fields }).catch(() => null);
}

export async function deleteQuestionFromIndex(objectID: string) {
  const c = await client();
  const indexName = getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!c || !indexName) return;
  await c.deleteObject({ indexName, objectID }).catch(() => null);
}
