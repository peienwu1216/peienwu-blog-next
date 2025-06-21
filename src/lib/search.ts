import { allPosts } from 'contentlayer/generated';
import { Post } from 'contentlayer/generated';

export interface SearchResult {
  post: Post;
  score: number;
  matches: {
    title?: boolean;
    content?: boolean;
    category?: boolean;
    tags?: boolean;
  };
}

/**
 * 搜尋文章
 * @param query 搜尋關鍵字
 * @param limit 結果數量限制，預設20
 * @returns 搜尋結果陣列
 */
export function searchPosts(query: string, limit: number = 20): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  allPosts.forEach((post) => {
    let score = 0;
    const matches = {
      title: false,
      content: false,
      category: false,
      tags: false,
    };

    // 標題匹配 (權重最高)
    if (post.title.toLowerCase().includes(normalizedQuery)) {
      score += 10;
      matches.title = true;
    }

    // 分類匹配
    if (post.category && post.category.toLowerCase().includes(normalizedQuery)) {
      score += 5;
      matches.category = true;
    }

    // 標籤匹配
    if (post.tags && post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
      score += 3;
      matches.tags = true;
    }

    // 內容匹配 (權重較低)
    if (post.body && post.body.raw.toLowerCase().includes(normalizedQuery)) {
      score += 1;
      matches.content = true;
    }

    // 如果有任何匹配，加入結果
    if (score > 0) {
      results.push({
        post,
        score,
        matches,
      });
    }
  });

  // 按分數排序並限制數量
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 獲取搜尋建議（熱門關鍵字）
 */
export function getSearchSuggestions(): string[] {
  const suggestions = new Set<string>();
  
  // 從分類中獲取建議
  allPosts.forEach(post => {
    if (post.category) {
      suggestions.add(post.category);
    }
    
    // 從標籤中獲取建議
    if (post.tags) {
      post.tags.forEach(tag => suggestions.add(tag));
    }
  });

  return Array.from(suggestions).slice(0, 8);
}

/**
 * 高亮搜尋關鍵字
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
}

/**
 * 從內容中提取摘要
 */
export function extractExcerpt(content: string, query: string, maxLength: number = 150): string {
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = content.toLowerCase();
  
  // 尋找關鍵字在內容中的位置
  const queryIndex = normalizedContent.indexOf(normalizedQuery);
  
  if (queryIndex === -1) {
    // 如果沒有找到關鍵字，返回開頭部分
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }
  
  // 以關鍵字為中心提取摘要
  const start = Math.max(0, queryIndex - 50);
  const end = Math.min(content.length, start + maxLength);
  
  let excerpt = content.slice(start, end);
  
  // 添加省略號
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
} 