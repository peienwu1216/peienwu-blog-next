// src/components/Note.tsx
import React from 'react';

// 定義 Note 元件接受的 props 型別
interface NoteProps {
  children: React.ReactNode; // Note 區塊內的內容
  type?: 'info' | 'warning' | 'danger' | 'success' | 'default'; // Note 的類型，可選
  title?: string; // Note 的標題，可選
}

const Note: React.FC<NoteProps> = ({ children, type = 'default', title }) => {
  // 根據 type 決定背景色、邊框色等樣式
  // 你可以根據自己的 Tailwind CSS 設定或偏好來調整這些顏色
  let baseClasses = "px-4 py-3 rounded-lg shadow-md my-6"; // 基本樣式
  let titleClasses = "font-semibold text-lg mb-2"; // 標題樣式
  let icon = null; // 圖示 (可選)

  switch (type) {
    case 'info':
      baseClasses += " bg-sky-50 dark:bg-sky-900 border-l-4 border-sky-500 dark:border-sky-400 text-sky-700 dark:text-sky-300";
      titleClasses += " text-sky-800 dark:text-sky-200";
      // icon = <InfoIcon className="w-5 h-5 mr-2 inline-block" />; // 範例：可以加入 SVG 圖示
      break;
    case 'success':
      baseClasses += " bg-emerald-50 dark:bg-emerald-900 border-l-4 border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300";
      titleClasses += " text-emerald-800 dark:text-emerald-200";
      // icon = <SuccessIcon className="w-5 h-5 mr-2 inline-block" />;
      break;
    case 'warning':
      baseClasses += " bg-amber-50 dark:bg-amber-900 border-l-4 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300";
      titleClasses += " text-amber-800 dark:text-amber-200";
      // icon = <WarningIcon className="w-5 h-5 mr-2 inline-block" />;
      break;
    case 'danger':
      baseClasses += " bg-red-50 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300";
      titleClasses += " text-red-800 dark:text-red-200";
      // icon = <DangerIcon className="w-5 h-5 mr-2 inline-block" />;
      break;
    default: // 'default' or any other unspecified type
      baseClasses += " bg-slate-100 dark:bg-slate-700 border-l-4 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300";
      titleClasses += " text-slate-800 dark:text-slate-200";
      break;
  }

  return (
    <div className={baseClasses}>
      {title && (
        <h3 className={titleClasses}>
          {/* {icon} */}
          {title}
        </h3>
      )}
      <div className="prose prose-sm dark:prose-invert max-w-none"> {/* prose-sm 讓裡面的文字小一點 */}
        {children}
      </div>
    </div>
  );
};

export default Note;

// 範例 SVG 圖示元件 (你可以使用 react-icons 或其他圖示庫，或者直接用 SVG)
// const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
//   </svg>
// );