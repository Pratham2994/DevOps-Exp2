import { useState, useEffect, useRef } from 'react';

export default function CommandInput({ onRun }) {
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('git-sim-cmd-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [pointer, setPointer] = useState(-1);
  const inputRef = useRef();

  useEffect(() => {
    localStorage.setItem('git-sim-cmd-history', JSON.stringify(history));
  }, [history]);

  const submit = (e) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    onRun(cmd);
    setHistory((h) => {
      const updated = [cmd, ...h.filter((x) => x !== cmd)];
      return updated.slice(0, 50);
    });
    setCmd('');
    setPointer(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPointer((p) => {
        const next = Math.min(p + 1, history.length - 1);
        if (next >= 0) setCmd(history[next]);
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPointer((p) => {
        const next = Math.max(p - 1, -1);
        setCmd(next === -1 ? '' : history[next]);
        return next;
      });
    }
  };

  return (
    <div className="command-box">
      <form onSubmit={submit}>
        <input
          aria-label="command"
          placeholder="Type git commands, e.g., git add index.html"
          value={cmd}
          onChange={(e) => {
            setCmd(e.target.value);
            setPointer(-1);
          }}
          onKeyDown={onKeyDown}
          ref={inputRef}
          autoFocus
        />
        <button type="submit">Run</button>
      </form>
      <div className="history">
        <strong>Recent:</strong>{' '}
        {history.slice(0, 5).map((c, i) => (
          <div key={i} className="hist-item">
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
