import { Globe } from "lucide-react";
import { useI18n, languageLabels, type Language } from "@/lib/i18n";

export default function AppHeader() {
  const { lang, setLang, t } = useI18n();

  const languages: Language[] = ["en", "hi", "te"];
  const nextLang = () => {
    const idx = languages.indexOf(lang);
    setLang(languages[(idx + 1) % languages.length]);
  };

  return (
    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-emerald-500/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1"></div>
        <button
          onClick={nextLang}
          className="tap-target flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 text-slate-300 text-sm font-medium hover:bg-emerald-500/10 hover:text-emerald-400 hover:border hover:border-emerald-500/30 transition-all duration-200"
        >
          <Globe size={16} />
          {languageLabels[lang]}
        </button>
      </div>
    </header>
  );
}
