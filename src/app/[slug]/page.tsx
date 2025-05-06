import { allPosts } from 'contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { notFound } from 'next/navigation'
import Note from '../components/Note'    // 你的自訂 MDX 元件

type Params = { slug: string }

export async function generateStaticParams() {
  return allPosts.map(p => ({
    slug: p._raw.sourceFileName.replace(/\.mdx$/, ''),
  }))
}

export default function PostPage({ params }: { params: Params }) {
  const post = allPosts.find(
    p => p._raw.sourceFileName.replace(/\.mdx$/, '') === params.slug,
  )
  if (!post) notFound()

  const MDX = useMDXComponent(post.body.code)
  const components = { Note }

  return (
    <article className="prose lg:prose-lg mx-auto py-10
                        dark:prose-invert">
      <h1 className="mb-4">{post.title}</h1>
      <MDX components={components} />
    </article>
  )
}
