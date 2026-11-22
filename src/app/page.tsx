import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Camera,
  Globe2,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/80 bg-surface/90">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-sm font-black text-white">BR</div>
            <div><p className="text-sm font-bold tracking-wide">BAU RACING</p><p className="text-[9px] uppercase tracking-[0.18em] text-muted">Formula Student Team</p></div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#about" className="hover:text-foreground">Takım</a>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#contact" className="hover:text-foreground">İletişim</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="h-9 rounded-lg px-3 text-sm leading-9 text-muted hover:bg-surface-muted">Giriş Yap</Link>
            <Link href="/register" className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold leading-9 text-white">Başvur</Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[620px] max-w-[1280px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-5 inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Bahçeşehir Formula Student</p>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Engineering speed.<br />Building the future.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted">BAU Racing’i bir araya getiren mühendislik platformu: görevleri, teknik bilgiyi, departmanları ve takım gelişimini tek çalışma alanında birleştirir.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="flex h-12 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white"><Users size={17} />Üyelik Başvurusu</Link>
            <Link href="/login" className="flex h-12 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-semibold">Giriş Yap<ArrowRight size={16} /></Link>
          </div>
          <div className="mt-10 flex gap-8 border-t border-border pt-6">
            <div><p className="text-2xl font-bold">5</p><p className="mt-1 text-xs text-muted">Departman</p></div>
            <div><p className="text-2xl font-bold">1</p><p className="mt-1 text-xs text-muted">Ortak hedef</p></div>
            <div><p className="text-2xl font-bold">360°</p><p className="mt-1 text-xs text-muted">Engineering view</p></div>
          </div>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-[620px] lg:h-[500px]">
          <div className="absolute inset-0 rounded-[28px] border border-border bg-[radial-gradient(circle_at_70%_30%,rgba(225,29,72,.18),transparent_28%),linear-gradient(135deg,var(--surface),var(--surface-muted))]" />
          <div className="absolute inset-[12%] grid place-items-center rounded-[24px] border border-dashed border-border">
            <div className="relative w-[78%] rotate-[-7deg]">
              <div className="h-20 rounded-[60%_45%_35%_55%] border-2 border-accent/50 bg-foreground/90 shadow-2xl" />
              <div className="absolute -bottom-7 left-[12%] h-16 w-16 rounded-full border-[10px] border-foreground bg-surface-muted" />
              <div className="absolute -bottom-7 right-[12%] h-16 w-16 rounded-full border-[10px] border-foreground bg-surface-muted" />
              <div className="absolute left-[28%] top-[-58px] h-20 w-28 skew-x-[18deg] rounded-t-full border border-accent/40 bg-surface-muted" />
              <div className="absolute left-[42%] top-[-22px] h-14 w-12 rounded-lg border border-accent/60 bg-accent/20" />
            </div>
          </div>
          <div className="absolute bottom-6 right-6 rounded-lg border border-border bg-surface px-4 py-3 shadow-xl"><p className="text-[10px] uppercase tracking-widest text-muted">System status</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500" />All systems ready</p></div>
        </div>
      </section>

      <section id="about" className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-16 sm:px-8 md:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Takımımız</p><h2 className="mt-3 text-3xl font-bold">Yarışmak için tasarlıyoruz.</h2></div>
          <p className="text-sm leading-7 text-muted">Mühendislik, üretim ve operasyon disiplinlerini tek bir çalışma kültüründe birleştiriyoruz. Formula Student standartlarında geliştirdiğimiz araçlarımızla tasarımı, analizi, testi ve performansı sürekli iyileştiriyoruz.</p>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8">
        <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Engineering workspace</p><h2 className="mt-3 text-3xl font-bold">Takımın dijital çalışma alanı</h2></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardCheck, title: "Task Management", text: "Görevleri önceliklendirin, atayın ve teslim tarihlerini takip edin." },
            { icon: BookOpen, title: "Technical Wiki", text: "Mühendislik bilgisi, tasarım kararları ve teknik standartları saklayın." },
            { icon: Network, title: "Departments", text: "Departmanları, alt ekipleri ve takım rollerini organize edin." },
            { icon: ShieldCheck, title: "Engineering Workspace", text: "Dosyaları, toplantıları ve takım raporlarını tek yerde yönetin." },
          ].map((feature) => {
            const Icon = feature.icon;
            return <article key={feature.title} className="rounded-xl border border-border bg-surface p-5"><div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-muted text-accent"><Icon size={19} /></div><h3 className="mt-5 font-semibold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p></article>;
          })}
        </div>
      </section>

      <footer id="contact" className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm sm:px-8"><div><p className="font-semibold">BAU Racing</p><p className="mt-1 text-xs text-muted">Bahçeşehir University Formula Student Team</p></div><div className="flex gap-3 text-muted"><a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:text-foreground"><Camera size={16} /></a><a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:text-foreground"><Globe2 size={16} /></a><a href="mailto:team@bauracing.team" className="flex h-9 items-center rounded-lg border border-border px-3 text-xs hover:text-foreground">team@bauracing.team</a></div></div>
      </footer>
    </main>
  );
}
