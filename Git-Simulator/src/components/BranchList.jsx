export default function BranchList({ branches, HEAD }) {
  return (
    <ul className="branch-list">
      {Object.entries(branches).map(([name, commit]) => (
        <li key={name}>
          {name} {HEAD.branch === name ? <strong>(HEAD)</strong> : ''} → {commit}
        </li>
      ))}
    </ul>
  );
}
