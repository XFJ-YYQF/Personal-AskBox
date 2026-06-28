import { liteClient as algoliasearch } from "algoliasearch/lite";
import { getEnv } from "./env";

export type SearchResult = {
  id: string;
  nickname: string | null;
  content: string;
  answer: string | null;
  status: string;
  attachment_key: string | null;
  created_at: string;
  published_at: string | null;
};

export function searchClient() {
  const appId = getEnv("NEXT_PUBLIC_ALGOLIA_APP_ID");
  const searchKey = getEnv("NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY");
  if (!appId || !searchKey) return null;
  return algoliasearch(appId, searchKey);
}

export async function searchQuestions(query: string, filters?: string) {
  const client = searchClient();
  const indexName = getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!client || !indexName) return { hits: [] as SearchResult[] };

  const results = await client.search<SearchResult>({
    requests: [{ indexName, query, filters, hitsPerPage: 20 }],
  });
  return { hits: (results.results[0] as any)?.hits ?? [] as SearchResult[] };
}
