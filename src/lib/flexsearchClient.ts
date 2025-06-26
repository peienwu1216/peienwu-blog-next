import { Document } from 'flexsearch';

export interface DocPayload {
  id: number;
  title: string;
  date: string;
  plainText: string;
  technicalText: string;
  codeText: string;
  mathText: string;
  category: string;
  tags: string;
  url: string;
  slug: string;
  [key: string]: string | number; // satisfy FlexSearch DocumentData constraint
}

let index: Document | null = null;
let loadingPromise: Promise<Document> | null = null;

function buildIndex(docs: DocPayload[]): Document {
  const docIndex = new Document({
    document: {
      id: 'id',
      index: [
        { field: 'title', tokenize: 'full' },
        { field: 'plainText', tokenize: 'full' },
        { field: 'technicalText', tokenize: 'forward' },
        { field: 'codeText', tokenize: 'forward' },
        { field: 'mathText', tokenize: 'forward' },
        { field: 'category', tokenize: 'full' },
        { field: 'tags', tokenize: 'full' },
      ],
    },
  });

  for (const doc of docs) {
    docIndex.add(doc);
  }
  return docIndex;
}

export async function ensureIndex(): Promise<Document> {
  if (index) return index;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch('/search-data.json')
    .then((res) => res.json())
    .then((docs: DocPayload[]) => {
      index = buildIndex(docs);
      return index;
    })
    .catch((err) => {
      console.error('Failed to load search data', err);
      throw err;
    });

  return loadingPromise;
}

export async function searchDocs(query: string, limit = 20): Promise<DocPayload[]> {
  if (!query.trim()) return [];

  // 判斷是否屬於數學 / 程式查詢（含 (), \\, ^, _ 等符號）
  const isMathLike = /[()\\^_]/.test(query);
  const minLen = isMathLike ? 1 : 2;

  // 清理查詢字串：移除標點並過濾過短 token
  const tokens = query
    .replace(/[^\p{L}\p{N}+]+/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= minLen);

  if (tokens.length === 0) return [];

  const cleaned = tokens.join(' ');

  const idx = await ensureIndex();
  const fields = ['title', 'tags', 'category', 'plainText', 'codeText', 'mathText'];
  const options = {
    limit,
    bool: 'and',
    boost: {
      title: 10,
      tags: 8,
      category: 8,
      plainText: 3,
      codeText: 1,
      mathText: 1,
    },
  } as any;
  const searchResults = (await idx.searchAsync(cleaned, fields as any, options));

  // Collect all unique document IDs from the search results
  const uniqueIds = new Set<number>();
  for (const resultSet of searchResults) {
    for (const id of resultSet.result) {
      uniqueIds.add(id as number);
    }
  }

  // FlexSearch may return ids as numbers; we need docs list; we can cache docs from json.
  // easiest: load docs once and store in array.
  const docs = (await ensureDocs()) as DocPayload[];
  const resultDocs: DocPayload[] = [];
  uniqueIds.forEach((id) => {
    const d = docs[Number(id)];
    if (d) resultDocs.push(d);
  });
  return resultDocs;
}

let docsCache: DocPayload[] | null = null;
async function ensureDocs(): Promise<DocPayload[]> {
  if (docsCache) return docsCache;
  const res = await fetch('/search-data.json');
  docsCache = (await res.json()) as DocPayload[];
  return docsCache;
} 