/** Illustrative product visuals for the homepage. All names and figures are sample data. */

const SUBJECTS: [string, number, number, number, string, string][] = [
  ["English Studies", 17, 16, 48, "A", "4th"],
  ["Mathematics", 19, 18, 55, "A", "1st"],
  ["Intermediate Science", 15, 17, 44, "A", "6th"],
  ["Digital Technologies", 18, 19, 51, "A", "2nd"],
  ["Social & Citizenship", 14, 13, 39, "B", "11th"],
  ["Nigerian History", 16, 15, 42, "A", "5th"],
  ["Cultural & Creative Arts", 12, 14, 35, "B", "14th"],
  ["French", 11, 12, 33, "C", "19th"],
];

const cell = "border border-[#d9d4c7] px-1.5 py-[3px]";

/** Mirrors the real report card PDF the product generates. */
export function ReportCardMock() {
  return (
    <div className="relative w-[330px] rounded-[4px] border border-[var(--lp-rule)] bg-white p-5 text-[9.5px] leading-tight text-[var(--lp-ink)] shadow-[0_30px_60px_-20px_rgba(15,61,46,0.35),0_8px_20px_-8px_rgba(15,61,46,0.2)] sm:w-[390px]">
      {/* Letterhead */}
      <div className="flex items-center gap-2.5 border-b-2 border-[var(--lp-green)] pb-2">
        <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[var(--lp-green)] font-display text-[15px] font-bold text-white">G</div>
        <div>
          <div className="font-display text-[13.5px] font-bold uppercase tracking-wide text-[var(--lp-green)]">Greenfield Schools</div>
          <div className="text-[8.5px] italic text-[var(--lp-muted)]">Knowledge and Character</div>
          <div className="text-[7.5px] text-[var(--lp-muted)]">12 Admiralty Way, Lekki, Lagos · 0803 000 0001</div>
        </div>
      </div>
      <div className="my-2 text-center text-[8.5px] font-bold uppercase tracking-[0.2em]">First term report · 2026/2027 session</div>

      {/* Details */}
      <table className="w-full border-collapse text-[8.5px]">
        <tbody>
          <tr>
            <td className={`${cell} bg-[#f5f5f4] text-[var(--lp-muted)]`}>Name</td><td className={`${cell} font-bold`} colSpan={3}>Okafor Chidinma A.</td>
          </tr>
          <tr>
            <td className={`${cell} bg-[#f5f5f4] text-[var(--lp-muted)]`}>Class</td><td className={`${cell} font-bold`}>JSS 2B</td>
            <td className={`${cell} bg-[#f5f5f4] text-[var(--lp-muted)]`}>Admission no.</td><td className={`${cell} font-bold`}>GRE/2025/0142</td>
          </tr>
          <tr>
            <td className={`${cell} bg-[#f5f5f4] text-[var(--lp-muted)]`}>Days present</td><td className={`${cell} font-bold`}>61 of 62</td>
            <td className={`${cell} bg-[#f5f5f4] text-[var(--lp-muted)]`}>No. in class</td><td className={`${cell} font-bold`}>38</td>
          </tr>
        </tbody>
      </table>

      {/* Scores */}
      <table className="mt-2 w-full border-collapse tabular-nums">
        <thead>
          <tr className="bg-[var(--lp-green)] text-[8px] text-white">
            <th className="border border-[var(--lp-green)] px-1.5 py-1 text-left font-semibold">Subject</th>
            <th className="border border-[var(--lp-green)] font-semibold">CA1</th>
            <th className="border border-[var(--lp-green)] font-semibold">CA2</th>
            <th className="border border-[var(--lp-green)] font-semibold">Exam</th>
            <th className="border border-[var(--lp-green)] font-semibold">Total</th>
            <th className="border border-[var(--lp-green)] font-semibold">Grade</th>
            <th className="border border-[var(--lp-green)] px-1 font-semibold">Position</th>
          </tr>
        </thead>
        <tbody>
          {SUBJECTS.map(([name, a, b, c, g, p], i) => (
            <tr key={name} className={i % 2 ? "bg-[#fafaf9]" : ""}>
              <td className={cell}>{name}</td>
              <td className={`${cell} text-center`}>{a}</td>
              <td className={`${cell} text-center`}>{b}</td>
              <td className={`${cell} text-center`}>{c}</td>
              <td className={`${cell} text-center font-bold`}>{a + b + c}</td>
              <td className={`${cell} text-center font-bold`}>{g}</td>
              <td className={`${cell} text-center`}>{p}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-2 grid grid-cols-3 border border-[#d9d4c7]">
        {[["Average", "74.13"], ["Class average", "64.20"]].map(([k, v]) => (
          <div key={k} className="border-r border-[#e7e3d8] px-2 py-1.5">
            <div className="text-[7px] uppercase tracking-wide text-[var(--lp-muted)]">{k}</div>
            <div className="text-[12px] font-bold">{v}</div>
          </div>
        ))}
        <div className="px-2 py-1.5">
          <div className="text-[7px] uppercase tracking-wide text-[var(--lp-muted)]">Position in class</div>
          <div className="text-[12px] font-bold text-[var(--lp-green)]">3rd <span className="text-[9px] font-normal text-[var(--lp-muted)]">of 38</span></div>
        </div>
      </div>

      {/* Comments and signatures */}
      <div className="mt-2 border border-[#d9d4c7]">
        {[
          ["Class teacher", "A very good performance. Aim higher next term.", "Signature and date"],
          ["Principal", "Good. Keep working hard.", "Principal's signature"],
        ].map(([who, text, cap], i) => (
          <div key={who} className={`flex ${i === 0 ? "border-b border-[#e7e3d8]" : ""}`}>
            <div className="w-[22%] bg-[#f5f5f4] px-2 py-1.5 text-[8px] font-bold">{who}</div>
            <div className="flex-1 px-2 py-1.5 font-display text-[9px] italic">{text}</div>
            <div className="w-[28%] border-l border-[#e7e3d8] px-2 pb-1 pt-3">
              <div className="h-3 border-b border-[#8a8f8b]">{i === 1 && <span className="font-display text-[10px] italic leading-none text-[var(--lp-green)]">A. Nwachukwu</span>}</div>
              <div className="mt-0.5 text-[6.5px] text-[var(--lp-muted)]">{cap}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3 text-[8.5px]">
        <div>Next term begins <b>Wednesday, 6 January 2027</b></div>
        <div className="text-[7px] text-[var(--lp-muted)]">A 70–100 · B 60–69 · C 50–59</div>
      </div>

      {/* Approval stamp, over the principal's signature like the real thing */}
      <div className="lp-stamp pointer-events-none absolute bottom-8 right-[38%] grid h-[64px] w-[64px] place-items-center rounded-full border-[2.5px] border-double border-[var(--lp-clay)] text-center text-[6.5px] font-bold uppercase leading-tight tracking-wider text-[var(--lp-clay)]">
        <span>Greenfield<br /><span className="text-[9px]">Approved</span><br />12 Dec 2026</span>
      </div>
    </div>
  );
}

/** Mirrors the official receipt PDF parents receive. */
export function ReceiptMock() {
  const row = "flex justify-between gap-3 border-b border-[#ece8dd] py-[5px]";
  return (
    <div className="w-[300px] rounded-[4px] bg-white p-5 text-[9.5px] leading-snug text-[var(--lp-ink)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2 border-b-2 border-[var(--lp-green)] pb-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--lp-green)] font-display text-[12px] font-bold text-white">G</div>
        <div className="font-display text-[12px] font-bold text-[var(--lp-green)]">Greenfield Schools</div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-[9px] font-bold uppercase tracking-[0.18em]">Official receipt</div>
        <div className="text-right text-[7.5px] text-[var(--lp-muted)]">Receipt number<div className="text-[9.5px] font-bold text-[var(--lp-ink)]">RCT/2026/000318</div></div>
      </div>
      <div className="mt-2.5 border border-[#ddd8cb] bg-[#fafaf8] px-3 py-2">
        <div className="text-[7px] uppercase tracking-wider text-[var(--lp-muted)]">Amount received</div>
        <div className="text-[19px] font-bold leading-tight">₦85,000</div>
        <div className="text-[8.5px] italic text-[var(--lp-muted)]">Eighty-five thousand naira only</div>
      </div>
      <div className="mt-2">
        <div className={row}><span className="text-[var(--lp-muted)]">Received from</span><b className="font-medium">Mrs Ngozi Okafor</b></div>
        <div className={row}><span className="text-[var(--lp-muted)]">For</span><b className="font-medium">School fees, Chidinma Okafor</b></div>
        <div className={row}><span className="text-[var(--lp-muted)]">Term</span><b className="font-medium">First term, 2026/2027</b></div>
        <div className={row}><span className="text-[var(--lp-muted)]">Method</span><b className="font-medium">Bank transfer · TLR40817</b></div>
        <div className={row}><span className="text-[var(--lp-muted)]">Balance</span><b className="font-medium">₦0</b></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-[6.5px] text-[var(--lp-muted)]">
        <div><div className="h-3 border-b border-[#8a8f8b]" />Received by: Bola Adeyemi, Bursary</div>
        <div><div className="h-3 border-b border-[#8a8f8b]" />Signature and school stamp</div>
      </div>
    </div>
  );
}

export function PhoneMock() {
  return (
    <div className="w-[208px] rounded-[30px] border-[7px] border-[#16201b] bg-[#16201b] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)]">
      <div className="overflow-hidden rounded-[23px] bg-[#eef1ed]">
        <div className="flex items-center justify-between px-4 pb-1 pt-2 text-[9px] font-semibold text-[#16201b]">
          <span>9:41</span>
          <span className="h-3.5 w-14 rounded-full bg-[#16201b]" />
          <span>4G</span>
        </div>
        <div className="border-b border-black/5 bg-white/70 px-3 py-2 text-center">
          <div className="mx-auto mb-0.5 grid h-7 w-7 place-items-center rounded-full bg-[var(--lp-green)] text-[9px] font-bold text-[var(--lp-saffron)]">GS</div>
          <div className="text-[10px] font-semibold tracking-wide">GREENFIELD</div>
        </div>
        <div className="space-y-2 px-2.5 py-3 text-[10.5px] leading-snug">
          <div className="lp-pop max-w-[88%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm" style={{ animationDelay: "1.4s" }}>
            Greenfield Schools: N85,000 received for Chidinma Okafor (GRE/2025/0142). Receipt RCT/2026/000318. Balance N0.
          </div>
          <div className="lp-pop max-w-[88%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm" style={{ animationDelay: "1.9s" }}>
            First term results for Chidinma are now available. Log in at greenfield.akademiq.ng to view.
          </div>
          <div className="pt-1 text-center text-[8.5px] text-[#7b847e]">Today 4:12 PM</div>
        </div>
      </div>
    </div>
  );
}

/** A compact score-entry grid, as a teacher sees it on a phone. */
export function ScoreGridMock() {
  const rows: [string, string, string, string, boolean?][] = [
    ["Adeyemi Kemi", "18", "17", "56"],
    ["Bello Ibrahim", "15", "16", "48"],
    ["Eze Obinna", "19", "", "", true],
    ["Musa Halima", "14", "15", "44"],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--lp-rule)] bg-[var(--lp-card)] p-4 text-[12px] shadow-[0_20px_40px_-20px_rgba(15,61,46,0.3)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">Mathematics · JSS 1A</div>
          <div className="text-[11px] text-[var(--lp-muted)]">First term · 31 of 34 complete</div>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900">Saved on phone · will sync</span>
      </div>
      <table className="w-full tabular-nums">
        <thead className="text-[10px] uppercase text-[var(--lp-muted)]">
          <tr><th className="pb-1 text-left font-medium">Student</th><th className="font-medium">CA1/20</th><th className="font-medium">CA2/20</th><th className="font-medium">Exam/60</th><th className="font-medium">Total</th></tr>
        </thead>
        <tbody>
          {rows.map(([n, a, b, c, editing]) => (
            <tr key={n} className="border-t border-[var(--lp-rule)]">
              <td className="py-1.5">{n}</td>
              {[a, b, c].map((v, i) => (
                <td key={i} className="py-1 text-center">
                  <span className={`inline-block h-7 w-10 rounded-md border leading-7 ${editing && i === 1 ? "border-[var(--lp-green)] ring-2 ring-[var(--lp-green)]/20" : "border-[var(--lp-rule)]"} bg-white`}>{v}</span>
                </td>
              ))}
              <td className="text-center font-semibold">{a && b && c ? Number(a) + Number(b) + Number(c) : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Fee overview tiles as the owner sees them. */
export function FeesMock() {
  const bars = [62, 74, 48, 88, 91, 57];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.16em] text-white/60">First term · fees</div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div><div className="text-[11px] text-white/60">Expected</div><div className="font-display text-xl">₦50.4m</div></div>
        <div><div className="text-[11px] text-white/60">Collected</div><div className="font-display text-xl text-[var(--lp-saffron)]">₦38.9m</div></div>
        <div><div className="text-[11px] text-white/60">Owing</div><div className="font-display text-xl">₦11.5m</div></div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[77%] rounded-full bg-[var(--lp-saffron)]" /></div>
      <div className="mt-5 text-[11px] text-white/60">Collected by class</div>
      <div className="mt-2 flex h-20 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div className="w-full rounded-t bg-white/80" style={{ height: `${h * 0.8}%` }} />
            <span className="text-[9px] text-white/50">{["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
