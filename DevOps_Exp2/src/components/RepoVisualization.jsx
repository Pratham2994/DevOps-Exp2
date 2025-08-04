import CommitGraph from './CommitGraph';
import FileList from './FileList';
import BranchList from './BranchList';

export default function RepoVisualization({
  files,
  staged,
  commits,
  branches,
  HEAD,
  onEditFile,
}) {
  const workingDirFiles = files.filter((f) => f.status !== 'staged');
  const stagedFiles = files.filter((f) => f.status === 'staged');

  return (
    <div className="viz">
      <div className="section">
        <h2>Branches</h2>
        <BranchList branches={branches} HEAD={HEAD} />
      </div>
      <div className="section">
        <h2>Commit Graph</h2>
        <CommitGraph commits={commits} branches={branches} HEAD={HEAD} />
      </div>
      <div className="section row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>Working Directory</h3>
          <FileList files={workingDirFiles} onEdit={onEditFile} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>Staging Area</h3>
          <FileList files={stagedFiles} onEdit={onEditFile} />
        </div>
      </div>
    </div>
  );
}
