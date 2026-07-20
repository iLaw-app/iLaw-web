// 검색어 하이라이트 + **볼드** 마크다운 제거 (원본 HighlightText 이식)
export function HighlightText({
  text,
  keyword = '',
  className,
}: {
  text: string;
  keyword?: string;
  className?: string;
}) {
  const clean = (text ?? '').replace(/\*\*(.*?)\*\*/g, '$1');
  const k = keyword.trim();
  if (!k) return <span className={className}>{clean}</span>;
  const parts = clean.split(new RegExp(`(${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.toLowerCase() === k.toLowerCase() ? (
          <mark key={i} className="hl-mark">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}
