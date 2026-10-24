"use client";

import { FormEvent, useState } from "react";
import Brand from "@/components/Brand";
import PublicReports from "@/components/PublicReports";

type Announcement = { id: string; title: string; category: string; body: string; published_at: string };
const initialNews: Announcement[] = [
  { id: "starter-1", title: "Maligayang pagdating sa SARAKO", category: "Anunsyo", body: "Dito matatagpuan ang mga serbisyo, anunsyo, at paraan para makipag-ugnayan sa inyong lungsod.", published_at: "" },
  { id: "starter-2", title: "Mga programa para sa komunidad", category: "Komunidad", body: "Bisitahin ang inyong barangay o tanggapan ng lungsod para sa detalye ng mga kasalukuyang programa.", published_at: "" },
  { id: "starter-3", title: "Ibahagi ang inyong mga alalahanin", category: "Paalaala", body: "Gamitin ang online report form para maiparating sa kinauukulang tanggapan ang mga isyu sa komunidad.", published_at: "" },
];

export default function Home({ announcements }: { announcements: Announcement[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const news = announcements.length ? announcements : initialNews;
  const city = process.env.NEXT_PUBLIC_CITY_NAME || "SARAKO";
  const emergency = process.env.NEXT_PUBLIC_EMERGENCY_NUMBER || "911";
  const tagline = process.env.NEXT_PUBLIC_CITY_TAGLINE || "Malapit sa bawat mamamayan";

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/report", { method: "POST", body: form });
      const result = await response.json();
      if (response.ok) { setMessage(result.message || "Salamat. Natanggap ang report at rerepasuhin muna ng admin bago ito makita ng publiko."); formElement.reset(); }
      else setMessage(result.error || "Hindi naipadala ang report.");
    } catch { setMessage("Hindi naipadala ang report. Suriin ang internet at subukan muli."); }
    finally { setSending(false); }
  }

  return <>
    <header><div className="wrap nav"><Brand href="#home" subtitle="Serbisyo saranhon" /><button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buksan ang menu">☰</button><nav className={`links ${menuOpen ? "open" : ""}`}><a href="#serbisyo" onClick={() => setMenuOpen(false)}>Mga Serbisyo</a><a href="#balita" onClick={() => setMenuOpen(false)}>Balita at Anunsyo</a><a href="#hotline" onClick={() => setMenuOpen(false)}>Mga Hotline</a><a href="#report" onClick={() => { setMenuOpen(false); setReportOpen(true); }}>Magsumbong</a><a className="nav-cta" href="#serbisyo">Hanap Serbisyo <span>↗</span></a></nav></div></header>
    <main id="home">
      <section className="hero"><div className="wrap hero-inner"><div><div className="eyebrow">{tagline}</div><h1>Ang lungsod mo,<br/><span className="lime-text">mas abot-kamay.</span></h1><p>Mga serbisyo, balita, at tulong na kailangan mo—madaling hanapin, isang pindot lang.</p><div className="hero-actions"><a className="btn btn-lime" href="#serbisyo">Tingnan ang mga serbisyo <span>→</span></a><a className="btn btn-outline" href="#balita">Mga pinakabagong balita</a></div></div><div className="hero-art" aria-hidden="true"><div className="sun"/><div className="hero-note"><b>Serbisyo para sa lahat</b><span>Mas mabilis. Mas malinaw.</span></div><div className="city-card"><div className="roof"/><div className="building"/><div className="palm">🌴</div></div></div></div></section>
      <section className="section" id="serbisyo"><div className="wrap"><div className="section-head"><div><div className="kicker">Mabilis na access</div><h2>Ano ang maitutulong namin?</h2></div><a className="see-all" href="#serbisyo">Lahat ng serbisyo ↗</a></div><div className="service-grid"><a className="service" href="#report"><span className="service-arrow">↗</span><div className="service-icon">📋</div><b>Gabay sa mga Serbisyo</b><span>Mga kailangan at hakbang</span></a><a className="service" href="#report"><span className="service-arrow">↗</span><div className="service-icon">📄</div><b>Dokumento at Permit</b><span>Mga aplikasyon at bayarin</span></a><a className="service" href="#balita"><span className="service-arrow">↗</span><div className="service-icon">💼</div><b>Trabaho sa Lungsod</b><span>Mga bakanteng posisyon</span></a><a className="service" href="#balita"><span className="service-arrow">↗</span><div className="service-icon">📊</div><b>Transparency Portal</b><span>Badyet at ulat ng lungsod</span></a></div></div></section>
      <section className="section updates" id="balita"><div className="wrap"><div className="section-head"><div><div className="kicker">Mula sa city hall</div><h2>Balita at anunsyo</h2></div><a className="see-all" href="/admin">Admin ↗</a></div><div className="news-grid">{news.slice(0, 3).map((item, index) => <article className={`news ${index === 0 ? "featured" : ""}`} key={item.id}><div className="news-image"><span className="tag">{item.category}</span></div><div className="news-copy"><time>{item.published_at ? new Date(item.published_at).toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" }) : "Anunsyo ng Lungsod"}</time><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div></div></section>
      <section className="section" id="hotline"><div className="wrap lower"><div className="panel"><div className="kicker">Handang tumulong</div><h2>Mga emergency hotline</h2><div className="hotline"><span className="hotline-icon">🚑</span><div><b>Emergency Response</b><small>Ambulansya at agarang tulong</small></div><a href={`tel:${emergency}`}><strong>{emergency}</strong></a></div><div className="hotline"><span className="hotline-icon">🔥</span><div><b>Bumbero</b><small>Sunog at rescue</small></div><a href={`tel:${emergency}`}><strong>{emergency}</strong></a></div><div className="hotline"><span className="hotline-icon">👮</span><div><b>Pulis</b><small>Seguridad at kapayapaan</small></div><a href={`tel:${emergency}`}><strong>{emergency}</strong></a></div><p className="small-note">Ilagay ang opisyal na mga numero ng inyong lungsod sa Vercel environment variables.</p></div><div className="panel report-panel" id="report"><div className="kicker">Boses mo, aksyon natin</div><h2>May napansin kang problema?</h2><p>Ipaabot sa amin ang mga isyu sa inyong komunidad para matugunan ito ng kinauukulang tanggapan.</p><button className="btn" onClick={() => { setReportOpen(true); setMessage(""); }}>Mag-ulat ng isyu <span>→</span></button></div></div></section>
      <PublicReports />
    </main>
    <footer className="footer"><div className="wrap footer-inner"><Brand href="#home" subtitle="Serbisyo saranhon" subtitleClassName="footer-sub" /><span>Isang mas bukas at maasikasong lungsod para sa lahat.</span><a href="/admin">Admin login</a><span>© {new Date().getFullYear()} {city}</span></div></footer>
    {reportOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setReportOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="modal-close" aria-label="Isara" onClick={() => setReportOpen(false)}>×</button><div className="kicker">Ulat ng komunidad</div><h2 id="report-title">Mag-ulat ng isyu</h2><p className="modal-intro">Ibigay ang detalye para maiparating ito sa kinauukulang tanggapan.</p><form onSubmit={submitReport} className="form"><label>Pangalan<input required name="name" minLength={2} maxLength={100} placeholder="Buong pangalan"/></label><label>Telepono o email <span className="optional">(opsyonal)</span><input name="contact" maxLength={160} placeholder="Paano ka makokontak"/></label><label>Kategorya<select name="category" required defaultValue=""><option value="" disabled>Pumili ng kategorya</option>{["Kalsada", "Basura", "Ilaw", "Tubig", "Kaligtasan", "Iba pa"].map((x) => <option key={x}>{x}</option>)}</select></label><label>Lokasyon<input name="location" required minLength={3} maxLength={180} placeholder="Barangay, kalye o palatandaan"/></label><label>Paglalarawan<textarea name="description" required minLength={10} maxLength={3000} rows={4} placeholder="Ilarawan ang isyu at kung saan ito nangyari"/></label><label>Larawan<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required/><span className="file-note">JPG, PNG, o WebP · hanggang 4 MB</span></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button className="btn submit-btn" disabled={sending}>{sending ? "Ipinapadala…" : "Ipadala ang report →"}</button>{message && <p className="form-message" role="status">{message}</p>}</form></section></div>}
  </>;
}
