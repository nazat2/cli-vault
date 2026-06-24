export default function SetupBanner() {
  return (
    <div className="setup-banner">
      <span className="setup-icon">⚠</span>
      <div>
        <p className="setup-title">SUPABASE BELUM DIKONFIGURASI</p>
        <p className="setup-text">
          Mode CLOUD butuh konfigurasi Supabase di file <code>.env</code>. Lihat{" "}
          <code>README.md</code> bagian "Setup Supabase". Sementara itu, kamu masih bisa
          pakai mode <strong>LOCAL</strong> (lewat menu ☰) buat coba-coba dulu.
        </p>
      </div>
    </div>
  );
}
