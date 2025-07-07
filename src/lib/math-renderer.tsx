import katex from 'katex'
import 'katex/dist/katex.min.css'

// 解析文本中的行內數學公式並渲染為 React 元素
export function renderMathInText(text: string): React.ReactNode[] {
  // 匹配 $...$ 格式的行內數學公式
  const mathRegex = /\$([^$]+)\$/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = mathRegex.exec(text)) !== null) {
    // 添加數學公式前的普通文本
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // 渲染數學公式
    try {
      const mathHtml = katex.renderToString(match[1], {
        throwOnError: false,
        displayMode: false, // 行內模式
        output: 'html'
      })
      parts.push(
        <span 
          key={match.index}
          dangerouslySetInnerHTML={{ __html: mathHtml }}
          className="katex-inline"
        />
      )
    } catch (error) {
      // 如果渲染失敗，保留原始文本
      parts.push(match[0])
    }

    lastIndex = match.index + match[0].length
  }

  // 添加剩餘的普通文本
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

// 檢查文本是否包含數學公式
export function containsMath(text: string): boolean {
  return /\$[^$]+\$/.test(text)
} 