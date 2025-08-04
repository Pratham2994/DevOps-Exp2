export default function FileList({ files = [], onEdit }) {
  return (
    <ul className="file-list">
      {files.map((f) => (
        <li key={f.name}>
          <div className="file-header">
            <span className={`status ${f.status}`}>{f.status}</span> <strong>{f.name}</strong>
          </div>
          <textarea
            aria-label={`content of ${f.name}`}
            value={f.content}
            onChange={(e) => onEdit && onEdit(f.name, e.target.value)}
            rows={4}
            style={{ width: '100%', marginTop: 4, fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
        </li>
      ))}
      {files.length === 0 && <li className="empty">— none —</li>}
    </ul>
  );
}
