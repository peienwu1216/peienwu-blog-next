import Link from 'next/link';
import { Post } from 'contentlayer/generated';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex-1 p-6">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          <Link href={post.url} className="stretched-link">
            {post.title}
          </Link>
        </h2>
        
        <div className="mb-4 flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.date}>
            {format(new Date(post.date), 'yyyy-MM-dd')}
          </time>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
} 