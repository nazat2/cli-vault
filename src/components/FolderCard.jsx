function fmtDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function FolderCard({ folder, onOpen }) {
  const hasCode = Boolean(folder.code);
  const imgCount = folder.images?.length || 0;

  return (
    <div className="folder-card" onClick={() => onOpen(folder)}>
      <div className="folder-top">
        <span className="folder-icon">📁</span>
        <div className="folder-tags">
          {hasCode && <span className="tag tag-cli">CLI</span>}
          {imgCount > 0 && <span className="tag tag-img">FOTO {imgCount}</span>}
        </div>
      </div>
      <p className="folder-name">{folder.name}</p>
      <span className="folder-meta">{fmtDate(folder.createdAt)}</span>
    </div>
  );
}
