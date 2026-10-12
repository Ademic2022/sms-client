import type { ReactNode } from "react";

/**
 * Renders a privacy notice written in simple text: "## " starts a heading, "- " starts a
 * bullet, and blank lines separate paragraphs. Nothing else is interpreted, so a school
 * cannot inject markup into the notice.
 */
export function NoticeText({ body }: { body: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={`p${blocks.length}`} className="text-[15px] leading-relaxed text-ink">{paragraph.join(" ")}</p>);
      paragraph = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`u${blocks.length}`} className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink marker:text-muted">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushBullets();
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushBullets();
      blocks.push(<h2 key={`h${blocks.length}`} className="pt-2 font-display text-lg font-medium text-ink">{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushParagraph();
      bullets.push(line.slice(2));
    } else {
      flushBullets();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushBullets();
  return <div className="space-y-3">{blocks}</div>;
}
