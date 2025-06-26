import fs from 'fs';
import path from 'path';
import { allPosts } from 'contentlayer/generated';

// Build a lightweight dataset for client-side FlexSearch
const docs = allPosts.map((post, idx) => ({
  id: idx,
  title: post.title,
  plainText: (post).plainText,
  technicalText: (post).technicalText,
  category: post.category || '',
  tags: (post.tags || []).join(' '),
  url: post.url,
  slug: post.slug,
}));

const outputPath = path.join(process.cwd(), 'public', 'search-data.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(docs));
console.log(`✅ Search data generated at ${outputPath}`); 