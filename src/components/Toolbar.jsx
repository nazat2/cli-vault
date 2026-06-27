import ModeSwitch from "./ModeSwitch.jsx";

const FILTERS = [
  { key: "all", label: "SEMUA" },
  { key: "cli", label: "CLI" },
  { key: "image", label: "FOTO" },
];

export default function Toolbar({
  search,
  onSearch,
  filter,
  onFilter,
  mode,
  onModeChange,
  categories,
  categoryFilter,
  onCategoryFilter,
}) {
  return (
    <section className="toolbar">
      <input
        type="text"
        className="search"
        placeholder="Cari folder..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <div className="toolbar-right desktop-only">
        <select
          className="category-select"
          value={categoryFilter}
          onChange={(e) => onCategoryFilter(e.target.value)}
        >
          <option value="all">SEMUA KATEGORI</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>

        <div className="filter-group">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? "active" : ""}`}
              onClick={() => onFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ModeSwitch mode={mode} onChange={onModeChange} compact />
      </div>
    </section>
  );
}
