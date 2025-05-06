// src/app/hello/page.tsx

import { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'node:fs/promises'
import path from 'node:path'

import MyAlert from '../components/MyAlert'

export const metadata: Metadata = {
  title: 'Hello MDX',
}

export default async function HelloPage() {
  const mdxPath = path.join(process.cwd(), 'src/app/hello/content.mdx')
  const mdxSource = await fs.readFile(mdxPath, 'utf8')

  return <MDXRemote source={mdxSource} components={{ MyAlert }} />
}
