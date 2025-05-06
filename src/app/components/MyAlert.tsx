// src/components/MyAlert.tsx
export default function MyAlert({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px' }}>
        🚨 {children}
      </div>
    )
  }
  