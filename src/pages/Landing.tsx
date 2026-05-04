import { Shield, Map as MapIcon, ChevronRight, Sun, Moon, Eye, Navigation, Star, Info, Camera, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Temayı değiştir"
      className="fixed top-4 right-4 z-50 p-2.5 rounded-full border transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-color)",
        color: "var(--text-primary)",
        boxShadow: "0 4px 16px var(--badge-shadow)",
      }}
    >
      {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
    </button>
  );
}

const features = [
  {
    icon: Shield,
    title: "Güvenli Noktalar",
    desc: "Polis karakolu, itfaiye, hastane gibi resmi güvenlik noktalarını anında görün.",
    color: "#6366f1",
  },
  {
    icon: Eye,
    title: "Aydınlık Sokaklar",
    desc: "Cadde ve sokakların aydınlatma durumunu ve güvenlik skorunu karşılaştırın.",
    color: "#f59e0b",
  },
  {
    icon: Navigation,
    title: "Yol Tarifi",
    desc: "Seçtiğiniz noktaya doğrudan Google Maps ile navigasyon başlatın.",
    color: "#10b981",
  },
  {
    icon: Camera,
    title: "Kamera Varlığı",
    desc: "Güvenlik kameraları bulunan bölgeleri harita üzerinde takip edin.",
    color: "#3b82f6",
  },
  {
    icon: Star,
    title: "Topluluk Yorumları",
    desc: "Gerçek kullanıcıların bölge hakkındaki değerlendirmelerini okuyun.",
    color: "#ec4899",
  },
  {
    icon: Zap,
    title: "Anlık Veriler",
    desc: "Tüm veriler açık kaynaklardan ve topluluk katkılarından beslenir.",
    color: "#8b5cf6",
  },
];

const steps = [
  { number: "01", title: "Haritayı Aç", desc: "Ana sayfadan haritaya gidin ve Üsküdar'ı keşfetmeye başlayın." },
  { number: "02", title: "Nokta Seçin", desc: "Listeden veya haritadan bir güvenli nokta seçin." },
  { number: "03", title: "Detayları İncele", desc: "Adres, kategori, güvenlik skoru ve yorumları görüntüleyin." },
  { number: "04", title: "Yola Çıkın", desc: "Google Maps ile seçtiğiniz noktaya yol tarifi alın." },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <ThemeToggle />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Background dots */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(var(--dot-color) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "#10b981" }}
        />

        <div
          className="relative z-10 max-w-3xl w-full text-center p-8 md:p-12 rounded-3xl border backdrop-blur-sm animate-fade-in-up"
          style={{
            background: "var(--bg-surface-2)",
            borderColor: "var(--border-color)",
            boxShadow: "0 24px 80px var(--badge-shadow)",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-2xl animate-float animate-pulse-glow"
              style={{ background: "var(--accent)" }}
            >
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: "var(--accent-bg)", color: "var(--accent-hover)" }}
            >
              Üsküdar · Açık Veri Projesi
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Şehrindeki{" "}
            <span style={{ color: "var(--accent-hover)" }}>güvenli yerleri</span>{" "}
            keşfet
          </h1>

          <p className="text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Aydınlık Sokaklar ve Güvenli Yol projesi, toplumsal güvenliği artırmak için açık veri kullanarak şehrindeki güvenli noktaları ve iyi aydınlatılmış rotaları bulmana yardımcı olur.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/map"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold text-sm rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 20px var(--shadow-accent)",
              }}
            >
              <MapIcon className="w-4 h-4" />
              Haritayı Aç
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#proje-hakkinda"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-sm rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
                background: "var(--bg-surface)",
              }}
            >
              <Info className="w-4 h-4" />
              Proje Hakkında
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce" style={{ color: "var(--text-muted)" }}>
          <span className="text-xs font-medium">Aşağı kaydır</span>
          <div className="w-0.5 h-8 rounded-full" style={{ background: "var(--border-color)" }} />
        </div>
      </section>

      {/* ── PROJE HAKKINDA ───────────────────────────────── */}
      <section id="proje-hakkinda" className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: "var(--accent-bg)", color: "var(--accent-hover)" }}
          >
            Proje Hakkında
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-4 mb-4" style={{ color: "var(--text-primary)" }}>
            Neden Güvenli Yol?
          </h2>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Üsküdar'da yaşayan, çalışan veya ziyaret eden herkesin güvenli bir şekilde hareket etmesini sağlamak amacıyla
            geliştirilmiş bu platform; açık veriler, topluluk katkıları ve coğrafi kodlama teknolojisini bir araya getirir.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Güvenli Nokta", value: "50+", icon: Shield, color: "#6366f1" },
            { label: "Kategori", value: "6", icon: MapIcon, color: "#10b981" },
            { label: "Açık Veri", value: "100%", icon: Zap, color: "#f59e0b" },
            { label: "Kullanıcılar", value: "Herkese Açık", icon: Users, color: "#ec4899" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border text-center animate-fade-in-up delay-${(i + 1) * 100}`}
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {features.map((f, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border group transition-all duration-300 hover:-translate-y-1 animate-fade-in-up delay-${i * 100}`}
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${f.color}20` }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NASIL KULLANILIR ─────────────────────────────── */}
      <section
        className="py-24"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: "var(--accent-bg)", color: "var(--accent-hover)" }}
            >
              Nasıl Kullanılır?
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-4" style={{ color: "var(--text-primary)" }}>
              4 Adımda Başla
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl border animate-fade-in-up delay-${i * 100}`}
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div
                  className="text-3xl font-black shrink-0 leading-none"
                  style={{ color: "var(--accent-hover)", opacity: 0.4 }}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/map"
              className="group inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 24px var(--shadow-accent)",
              }}
            >
              <MapIcon className="w-5 h-5" />
              Haritayı Aç
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        className="py-10 px-4 border-t text-center"
        style={{ borderColor: "var(--border-color)", background: "var(--bg-base)" }}
      >
        <div className="flex justify-center items-center gap-2 mb-3">
          <Shield className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Güvenli Yol Üsküdar</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Açık verilerle toplumsal güvenliği destekleyen bir proje · OpenStreetMap · Google Sheets
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all hover:scale-105"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
              background: "var(--bg-surface)",
            }}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            {isDark ? "Gündüz moduna geç" : "Gece moduna geç"}
          </button>
        </div>
      </footer>
    </div>
  );
}
