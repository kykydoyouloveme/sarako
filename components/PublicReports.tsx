"use client";

import { useEffect, useState } from "react";

type PublicReport = { id: string; category: string; description: string; photo_comment?: string; location: string; created_at: string; has_photo: boolean };

export default function PublicReports() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/reports", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((items: PublicReport[]) => setReports(items))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return <section className="section public-reports" id="community-reports">
    <div className="wrap">
      <div className="section-head"><div><div className="kicker">Ulat na nasuri na</div><h2>Mga report sa komunidad</h2><p className="reports-intro">Ipinapakita rito ang mga report na inaprubahan ng admin.</p></div><span className="report-count">{reports.length} naaprubahan</span></div>
      {loading ? <div className="empty-state">Kinukuha ang mga report…</div> : reports.length ? <div className="public-report-grid">{reports.map((report) => <article className="public-report-card" key={report.id}>
        {report.has_photo && <img className="public-report-photo" src={`/api/reports/${report.id}/image`} alt={`Larawan ng report tungkol sa ${report.category}`} loading="lazy"/>}
        <div className="public-report-content"><span className="tag report-category">{report.category}</span><h3>{report.location}</h3>{report.photo_comment && <p className="photo-comment">Komento sa larawan: {report.photo_comment}</p>}<p>{report.description}</p><time>{new Date(report.created_at).toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" })}</time></div>
      </article>)}</div> : <div className="empty-state">Wala pang naaprubahang report. Lalabas dito ang mga report kapag nasuri na ng admin.</div>}
    </div>
  </section>;
}
