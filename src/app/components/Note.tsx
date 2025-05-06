type NoteProps = {
    type?: 'info' | 'success' | 'warning' | 'error'
    children: React.ReactNode
  }
  
  export default function Note({ type = 'info', children }: NoteProps) {
    return (
      <div className={`note note-${type}`}>
        {children}
      </div>
    )
  }
  