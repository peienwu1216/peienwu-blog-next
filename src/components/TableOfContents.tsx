'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

type Heading = {
  level: number
  text: string
  slug: string
}

type TableOfContentsProps = {
  headings: Heading[]
  onSummary: () => void
  onAsk: () => void
}

export default function TableOfContents({
  headings,
  onSummary,
  onAsk,
}: TableOfContentsProps) {
  const [activeParent, setActiveParent] = useState<string | null>(null)
  const [activeId, setActiveId] = useState('')
  const observer = useRef<IntersectionObserver | null>(null)
  const [expandAll, setExpandAll] = useState(false)

  const childToParentMap = useMemo(() => {
    const map = new Map<string, string>()
    let currentParentSlug: string | null = null
    headings.forEach(heading => {
      if (heading.level === 2) {
        currentParentSlug = heading.slug
      } else if (heading.level === 3 && currentParentSlug) {
        map.set(heading.slug, currentParentSlug)
      }
    })
    return map
  }, [headings])

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      let topEntry: IntersectionObserverEntry | undefined;
      for (const entry of entries) {
        if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
                topEntry = entry;
            }
        }
      }

      if (topEntry) {
          const currentId = topEntry.target.id
          setActiveId(currentId)

          const parentSlug = childToParentMap.get(currentId)
          if (parentSlug) {
              setActiveParent(parentSlug)
          } else {
              setActiveParent(currentId)
          }
      }
    }

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '0px 0px -80% 0px',
    })

    const elements = document.querySelectorAll('h2, h3')
    elements.forEach((elem) => observer.current?.observe(elem))

    return () => observer.current?.disconnect()
  }, [childToParentMap])

  const nestedHeadings = useMemo(() => {
    const nested: (Heading & { children: Heading[] })[] = []
    headings.forEach(heading => {
      if (heading.level === 2) {
        nested.push({ ...heading, children: [] })
      } else if (heading.level === 3 && nested.length > 0) {
        nested[nested.length - 1].children.push(heading)
      }
    })
    return nested
  }, [headings])

  return (
    <div className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 flex flex-col max-h-[calc(100vh-7rem)]">
        <div className="overflow-y-auto pr-4 toc-scroll">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
            此頁內容
          </h3>
          <nav>
              <ul className="space-y-2">
                {nestedHeadings.map((h2) => (
                  <li key={h2.slug}>
                    <a
                      href={`#${h2.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveParent(h2.slug);
                        setActiveId(h2.slug);
                        document.getElementById(h2.slug)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`block text-sm transition-colors duration-200 toc-truncate ${
                        activeParent === h2.slug
                          ? 'text-sky-500 dark:text-sky-400 font-medium'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {h2.text}
                    </a>
                    {h2.children.length > 0 && (expandAll || activeParent === h2.slug) && (
                      <ul className="mt-2 space-y-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                        {h2.children.map((h3) => (
                          <li key={h3.slug} className="relative">
                            <a
                              href={`#${h3.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveId(h3.slug);
                                document.getElementById(h3.slug)?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`block pl-4 text-sm transition-colors duration-200 toc-truncate ${
                                activeId === h3.slug
                                  ? 'text-sky-500 dark:text-sky-400 font-medium'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              {activeId === h3.slug && (
                                <span className="absolute left-[-1px] top-1/2 -translate-y-1/2 h-4 w-0.5 bg-sky-500 dark:bg-sky-400"></span>
                              )}
                              {h3.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
          </nav>
        </div>
        
        <div className="mt-auto">
          {/* AI Assistant Dock */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="bg-indigo-50 rounded-lg p-3 dark:bg-indigo-900/20">
              <h4 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                AI 助理
              </h4>
              <div className="space-y-2">
                <button
                  onClick={onSummary}
                  className="block text-left w-full text-sm text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"
                >
                  📌 快速摘要
                </button>
                <button
                  onClick={onAsk}
                  className="block text-left w-full text-sm text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"
                >
                  💬 AI 問答
                </button>
              </div>
            </div>
          </div>

          {/* 快速導航 */}
          <div className="mt-6 space-y-2 text-sm">
            <button
              onClick={() => setExpandAll(prev => !prev)}
              className="block text-left w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {expandAll ? 'Collapse all' : 'Expand all'}
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="block text-left w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Back to top
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="block text-left w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Go to bottom
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 