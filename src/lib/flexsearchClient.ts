import { Document } from 'flexsearch';

interface DocPayload {
  id: number;
  title: string;
  plainText: string;
  technicalText: string;
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
        { field: 'title', tokenize: 'forward' },
        { field: 'plainText', tokenize: 'forward' },
        { field: 'technicalText', tokenize: 'forward' },
        { field: 'category', tokenize: 'forward' },
        { field: 'tags', tokenize: 'forward' },
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
  const idx = await ensureIndex();
  const fields = ['title', 'tags', 'category', 'plainText', 'technicalText'];
  const options = {
    limit,
    boost: {
      title: 10,
      tags: 8,
      category: 8,
      plainText: 3,
      technicalText: 1,
    },
  } as any;
  const idSet = (await idx.searchAsync(query, fields as any, options)) as unknown as (number | string)[];

  // FlexSearch may return ids as numbers; we need docs list; we can cache docs from json.
  // easiest: load docs once and store in array.
  const docs = (await ensureDocs()) as DocPayload[];
  const resultDocs: DocPayload[] = [];
  idSet.forEach((id) => {
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