import { Shield, Map as MapIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden px-4 text-slate-100 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="z-10 max-w-3xl text-center backdrop-blur-[2px] bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Şehrindeki <span className="text-indigo-400">güvenli yerleri</span> keşfet
        </h1>
        
        <p className="text-sm md:text-base text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
          Aydınlık Sokaklar ve Güvenli Yol projesi, toplumsal güvenliği artırmak için açık veri kullanarak şehrindeki güvenli noktaları ve iyi aydınlatılmış rotaları bulmana yardımcı olur.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/map"
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-lg overflow-hidden transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <MapIcon className="w-4 h-4" />
            Haritayı Aç
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
