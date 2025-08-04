import { useState, useEffect } from 'react';
import CommandInput from './components/CommandInput';
import RepoVisualization from './components/RepoVisualization';

const initialFiles = [
  { name: 'index.html', status: 'unmodified', content: '<!DOCTYPE html>\n<html></html>' },
  { name: 'app.js', status: 'unmodified', content: "console.log('hello');" },
  { name: 'README.md', status: 'unmodified', content: '# Git Simulator' },
];


function App() {
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('git-sim-files');
    return saved ? JSON.parse(saved) : initialFiles;
  });
  const [staged, setStaged] = useState(() => {
    const saved = localStorage.getItem('git-sim-staged');
    return saved ? JSON.parse(saved) : [];
  });
  const [commits, setCommits] = useState(() => {
    const saved = localStorage.getItem('git-sim-commits');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'c1',
            message: 'Initial commit',
            parents: [],
            branches: ['main'],
            timestamp: Date.now(),
            snapshot: initialFiles.map(f => ({ name: f.name, content: f.content })),
          },
        ];
  });
  
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('git-sim-branches');
    return saved ? JSON.parse(saved) : { main: 'c1' };
  });

  const [HEAD, setHEAD] = useState(() => {
    const saved = localStorage.getItem('git-sim-HEAD');
    return saved ? JSON.parse(saved) : { branch: 'main', commit: 'c1' };
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('git-sim-files', JSON.stringify(files));
    localStorage.setItem('git-sim-staged', JSON.stringify(staged));
    localStorage.setItem('git-sim-commits', JSON.stringify(commits));
    localStorage.setItem('git-sim-branches', JSON.stringify(branches));
    localStorage.setItem('git-sim-HEAD', JSON.stringify(HEAD));
  }, [files, staged, commits, branches, HEAD]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);



  const runCommand = (raw) => {
    const input = raw.trim();
    if (!input) return;
    const parts = input.split(/\s+/);
    if (parts[0] !== 'git') {
      setError(`"${parts[0]}" is not a git command.`);
      return;
    }

    const sub = parts[1];
    const args = parts.slice(2);

    switch (sub) {
      case 'status':
        break;

      case 'add': {
        if (args.length === 0) {
          setError('git add requires a target file.');
          return;
        }
        const target = args[0];
        const exists = files.find((f) => f.name === target);
        if (!exists) {
          setError(`No such file "${target}".`);
          return;
        }
        setFiles((f) =>
          f.map((file) =>
            file.name === target ? { ...file, status: 'staged' } : file
          )
        );
        setStaged((s) => (s.includes(target) ? s : [...s, target]));
        break;
      }

      case 'commit': {
        const msgIndex = args.findIndex((a) => a === '-m');
        if (msgIndex === -1 || !args[msgIndex + 1]) {
          setError('git commit requires a message. Use: git commit -m "your message"');
          return;
        }
        const message = args[msgIndex + 1].replace(/['"]+/g, '');
        if (staged.length === 0) {
          setError('Nothing to commit. Staging area is empty.');
          return;
        }
        const newId = 'c' + (commits.length + 1);
        const currentBranch = HEAD.branch;
        const parent = branches[currentBranch];
        const parentCommit = commits.find((c) => c.id === parent);
        const baseSnapshot = parentCommit
          ? parentCommit.snapshot.map((s) => ({ ...s }))
          : [];
        const updatedSnapshot = baseSnapshot.map((f) =>
          staged.includes(f.name)
            ? { name: f.name, content: files.find((x) => x.name === f.name)?.content || f.content }
            : f
        );
        staged.forEach((name) => {
          if (!updatedSnapshot.find((u) => u.name === name)) {
            const file = files.find((x) => x.name === name);
            if (file) updatedSnapshot.push({ name: file.name, content: file.content });
          }
        });

        const newCommit = {
          id: newId,
          message,
          parents: [parent],
          branches: [currentBranch],
          timestamp: Date.now(),
          snapshot: updatedSnapshot,
        };
        setCommits((c) => [...c, newCommit]);
        setBranches((b) => ({ ...b, [currentBranch]: newId }));
        setHEAD((h) => ({ ...h, commit: newId }));
        setStaged([]);
        setFiles((f) =>
          f.map((file) =>
            file.status === 'staged' ? { ...file, status: 'unmodified' } : file
          )
        );
        break;
      }

      case 'branch': {
        if (args.length === 0) {
          setError('git branch requires a name.');
          return;
        }
        const newBranch = args[0];
        if (branches[newBranch]) {
          setError(`Branch "${newBranch}" already exists.`);
          return;
        }
        setBranches((b) => ({ ...b, [newBranch]: branches[HEAD.branch] }));
        break;
      }

      case 'checkout': {
        if (args.length === 0) {
          setError('git checkout requires a branch or commit.');
          return;
        }
        const target = args[0];
        if (branches[target]) {
          setHEAD({ branch: target, commit: branches[target] });
        } else {
          const exists = commits.find((c) => c.id === target);
          if (!exists) {
            setError(`No such branch or commit "${target}".`);
            return;
          }
          setHEAD({ branch: null, commit: target });
        }
        break;
      }

      case 'merge': {
        if (args.length === 0) {
          setError('git merge requires a source branch.');
          return;
        }
        const source = args[0];
        const targetBranch = HEAD.branch;
        if (!targetBranch) {
          setError('You are in a detached HEAD; cannot merge.');
          return;
        }
        if (!branches[source]) {
          setError(`Branch "${source}" does not exist.`);
          return;
        }
        const sourceCommit = branches[source];
        const targetCommit = branches[targetBranch];
        const mergeId = 'c' + (commits.length + 1);

        const targetSnap = commits.find((c) => c.id === targetCommit)?.snapshot || [];
        const sourceSnap = commits.find((c) => c.id === sourceCommit)?.snapshot || [];

        const merged = [
          ...targetSnap.filter((f) => !sourceSnap.find((s) => s.name === f.name)),
          ...sourceSnap,
        ];

        const newCommit = {
          id: mergeId,
          message: `Merge ${source} into ${targetBranch}`,
          parents: [targetCommit, sourceCommit],
          branches: [targetBranch],
          timestamp: Date.now(),
          snapshot: merged,
        };
        setCommits((c) => [...c, newCommit]);
        setBranches((b) => ({ ...b, [targetBranch]: mergeId }));
        setHEAD((h) => ({ ...h, commit: mergeId }));
        break;
      }

      case 'reset': {
        if (args.length < 2 || args[0] !== '--hard') {
          setError('Usage: git reset --hard <commit-ish> (e.g., HEAD~1 or c3)');
          return;
        }
        const target = args[1];
        let targetCommitId = null;
        if (target.startsWith('HEAD~')) {
          const count = parseInt(target.slice(5)) || 1;
          let cur = HEAD.commit;
          for (let i = 0; i < count; i++) {
            const commitObj = commits.find((c) => c.id === cur);
            if (!commitObj || commitObj.parents.length === 0) break;
            cur = commitObj.parents[0];
          }
          targetCommitId = cur;
        } else {
          const exists = commits.find((c) => c.id === target);
          if (!exists) {
            setError(`commit "${target}" not found.`);
            return;
          }
          targetCommitId = target;
        }
        if (!HEAD.branch) {
          setError('Cannot reset in detached HEAD.');
          return;
        }
        setBranches((b) => ({ ...b, [HEAD.branch]: targetCommitId }));
        setHEAD((h) => ({ ...h, commit: targetCommitId }));
        break;
      }

      case 'revert': {
        if (args.length === 0) {
          setError('Usage: git revert <commit-id>');
          return;
        }
        const toRevert = args[0];
        const original = commits.find((c) => c.id === toRevert);
        if (!original) {
          setError(`commit "${toRevert}" not found.`);
          return;
        }
        if (!HEAD.branch) {
          setError('Cannot revert in detached HEAD.');
          return;
        }
        const revertId = 'c' + (commits.length + 1);
        const currentBranch = HEAD.branch;
        const parent = branches[currentBranch];
        const parentSnap = commits.find((c) => c.id === parent)?.snapshot || [];
        const newCommit = {
          id: revertId,
          message: `Revert "${original.message}" (${toRevert})`,
          parents: [parent],
          branches: [currentBranch],
          timestamp: Date.now(),
          snapshot: parentSnap,
        };
        setCommits((c) => [...c, newCommit]);
        setBranches((b) => ({ ...b, [currentBranch]: revertId }));
        setHEAD((h) => ({ ...h, commit: revertId }));
        break;
      }

      case 'log':
        break;

      default:
        setError(`unsupported git subcommand "${sub}".`);
    }
  };
  const handleEditFile = (name, newContent) => {
  setFiles((fs) =>
    fs.map((f) => {
      if (f.name === name) {
        const newStatus = f.status === 'staged' ? 'staged' : 'modified';
        return { ...f, content: newContent, status: newStatus };
      }
      return f;
    })
  );
  };

  return (
    <div className="app">
      <h1>Git Command Simulator</h1>
      {error && (
        <div className="error-banner">
          {error}{' '}
          <button onClick={() => setError(null)} aria-label="dismiss">
            ✕
          </button>
        </div>
      )}
      <div className="layout">
        <div className="left-pane">
          <RepoVisualization
            files={files}
            staged={staged}
            commits={commits}
            branches={branches}
            HEAD={HEAD}
            setFiles={setFiles}
            onEditFile={handleEditFile} 
          />
        </div>
        <div className="right-pane">
          <CommandInput onRun={runCommand} />
          <div className="hint">
            Try commands: <code>git status</code>, <code>git add app.js</code>,{' '}
            <code>git commit -m "msg"</code>, <code>git branch feature</code>,{' '}
            <code>git checkout feature</code>, <code>git merge feature</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
