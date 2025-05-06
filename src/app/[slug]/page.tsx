import { allPosts } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { useMDXComponent } from 'next-contentlayer/hooks'
import Note from '../components/Note'

type Params = {
  slug: string
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post._raw.sourceFileName.replace(/\.mdx$/, ''),
  }))
}

export default function PostPage({ params }: { params: Params }) {
  const post = allPosts.find(
    (post) => post._raw.sourceFileName.replace(/\.mdx$/, '') === params.slug
  )

  if (!post) notFound()

  const MDXContent = useMDXComponent(post.body.code)

  const components = {
    Note,  // 👈 提供 MDX 裡用到的 <Note>
  }

  

return (
  <article className="prose mx-auto py-8">
    <h1>{post.title}</h1>
    <MDXContent components={{ Note }} />
  </article>
)
}
