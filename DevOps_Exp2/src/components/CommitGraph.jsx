import { useState } from 'react';

function diffLines(oldStr = '', newStr = '') {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const result = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const o = oldLines[i] ?? '';
    const n = newLines[i] ?? '';
    if (o === n) {
      result.push({ type: 'equal', line: o });
    } else {
      if (o) result.push({ type: 'removed', line: o });
      if (n) result.push({ type: 'added', line: n });
    }
  }
  return result;
}

export default function CommitGraph({ commits, branches, HEAD }) {
  const [selected, setSelected] = useState(null);

  const selectCommit = (c) => {
    setSelected(c);
  };

  const renderDiff = (commit) => {
    if (!commit) return null;
    const parentId = commit.parents[0];
    const parent = commits.find((c) => c.id === parentId);
    const parentMap = {};
    (parent?.snapshot || []).forEach((s) => (parentMap[s.name] = s.content));
    const currentMap = {};
    (commit.snapshot || []).forEach((s) => (currentMap[s.name] = s.content));

    const filenames = Array.from(new Set([...Object.keys(parentMap), ...Object.keys(currentMap)]));

    return (
      <div className="diff-panel">
        <h4>Diff of {commit.id}</h4>
        {filenames.map((name) => {
          const oldContent = parentMap[name] ?? '';
          const newContent = currentMap[name] ?? '';
          if (oldContent === newContent) return null;
          const diffs = diffLines(oldContent, newContent);
          return (
            <div key={name} className="file-diff">
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>{name}</div>
              <pre style={{ background: '#1b1f38', padding: 6, borderRadius: 4, overflowX: 'auto' }}>
                {diffs.map((d, i) => {
                  let prefix = ' ';
                  if (d.type === 'added') prefix = '+';
                  else if (d.type === 'removed') prefix = '-';
                  return (
                    <div key={i} style={{ display: 'flex' }}>
                      <div style={{ width: 20 }}>{prefix}</div>
                      <div style={{ flex: 1 }}>
                        <code>{d.line}</code>
                      </div>
                    </div>
                  );
                })}
              </pre>
            </div>
          );
        })}
        {filenames.every((name) => parentMap[name] === currentMap[name]) && (
          <div style={{ fontStyle: 'italic' }}>No changes versus parent.</div>
        )}
      </div>
    );
  };

  return (
    <div className="commit-graph-wrapper">
      <div className="commit-graph">
        {commits
          .slice()
          .reverse()
          .map((c) => (
            <div
              key={c.id}
              className={`commit-card ${HEAD.commit === c.id ? 'current' : ''}`}
              onClick={() => selectCommit(c)}
              style={{ cursor: 'pointer' }}
            >
              <div className="cid">{c.id}</div>
              <div className="msg">{c.message}</div>
              <div className="meta">
                Parents: {c.parents.join(', ') || 'none'} |{' '}
                {c.branches.map((b) => (
                  <span key={b} className="branch-tag">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
      <div className="diff-area">{selected && renderDiff(selected)}</div>
    </div>
  );
}
