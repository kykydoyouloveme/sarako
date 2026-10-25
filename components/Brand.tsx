type BrandProps = { href?: string; subtitle: string; className?: string; subtitleClassName?: string };

export default function Brand({ href = "/", subtitle, className = "", subtitleClassName = "" }: BrandProps) {
  return <a className={`brand ${className}`} href={href} aria-label="SARAKO">
    <img className="brand-icon" src="/sara.png" alt="" aria-hidden="true" />
    <span className="brand-copy">
      <span className="brand-word" aria-label="SARAKO"><span>SAR</span><svg className="brand-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8.2-5.2-10.4-10C-.5 5.4 5.8.7 12 6c6.2-5.3 12.5-.6 10.4 5C20.2 15.8 12 21 12 21Z" /></svg><span>KO</span></span>
      <small className={subtitleClassName}>{subtitle}</small>
    </span>
  </a>;
}
