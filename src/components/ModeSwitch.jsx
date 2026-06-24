export default function ModeSwitch({ mode, onChange, compact }) {
  return (
    <div className={`mode-switch ${compact ? "compact" : ""}`}>
      <button
        className={mode === "local" ? "active" : ""}
        onClick={() => onChange("local")}
        type="button"
      >
        💾 LOCAL
      </button>
      <button
        className={mode === "cloud" ? "active" : ""}
        onClick={() => onChange("cloud")}
        type="button"
      >
        ☁ CLOUD
      </button>
    </div>
  );
}
