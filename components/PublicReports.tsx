"use client";

import { FormEvent, useEffect, useState } from "react";

type PublicComment = { name: string; body: string; created_at: string };
type PublicReport = { id: string; category: string; description: string; location: string; created_at: string; has_photo: boolean; comments: PublicComment[] };

function CommentForm({ reportId, onComment }: { reportId: string; onComment: (comment: PublicComment) => void }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setMessage("");
    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body }),
      });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Hindi naipadala ang comment."); return; }
      onComment(result.comment);
      setBody("");
      setMessage("Naidagdag ang comment.");
    } catch { setMessage("Hindi naipadala ang comment. Pakisubukan muli."); }
    finally { setSending(false); }
  }

  return <form className="comment-form" onSubmit={submit}>
    <label>Pangalan <span className="optional">(opsyonal)</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Mamamayan"/></label>
    <label>Comment<textarea value={body} onChange={(event) => setBody(event.target.value)} required minLength={2} maxLength={1000} rows={2} placeholder="Mag-iwan ng comment sa report"/></label>
    <button className="approval-button" disabled={sending}>{sending ? "Ipinapadala…" : "Idagdag ang comment"}</button>
    {message && <p className="comment-message" role="status">{message}</p>}
  </form>;
}

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

  function addComment(reportId: string, comment: PublicComment) {
    setReports((current) => current.map((report) => report.id === reportId ? { ...report, comments: [...report.comments, comment] } : report));
  }

  return <section className="section public-reports" id="community-reports">
    <div className="wrap">
      <div className="section-head"><div><div className="kicker">Ulat na nasuri na</div><h2>Mga report sa komunidad</h2><p className="reports-intro">Ipinapakita rito ang mga report na inaprubahan ng admin.</p></div><span className="report-count">{reports.length} naaprubahan</span></div>
      {loading ? <div className="empty-state">Kinukuha ang mga report…</div> : reports.length ? <div className="public-report-grid">{reports.map((report) => <article className="public-report-card" key={report.id}>
        {report.has_photo && <img className="public-report-photo" src={`/api/reports/${report.id}/image`} alt={`Larawan ng report tungkol sa ${report.category}`} loading="lazy"/>}
        <div className="public-report-content"><span className="tag report-category">{report.category}</span><h3>{report.location}</h3><p>{report.description}</p><time>{new Date(report.created_at).toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" })}</time></div>
        <details className="report-comments"><summary aria-label={`${report.comments.length} comments on report`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2v-5.5A7.5 7.5 0 1 1 20 11.5Z"/></svg><span>{report.comments.length}</span></summary><div className="report-comments-body" aria-label={`Comments on report in ${report.location}`}><h4>Comments</h4>{report.comments.length ? <ul>{report.comments.map((comment, index) => <li key={`${comment.created_at}-${index}`}><b>{comment.name}</b><p>{comment.body}</p><time>{new Date(comment.created_at).toLocaleDateString("fil-PH", { year: "numeric", month: "long", day: "numeric" })}</time></li>)}</ul> : <p className="no-comments">No comments yet.</p>}<CommentForm reportId={report.id} onComment={(comment) => addComment(report.id, comment)}/></div></details>
      </article>)}</div> : <div className="empty-state">Wala pang naaprubahang report. Lalabas dito ang mga report kapag nasuri na ng admin.</div>}
    </div>
  </section>;
}
