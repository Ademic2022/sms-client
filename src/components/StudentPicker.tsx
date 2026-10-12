"use client";

import { useDeferredValue, useState } from "react";

import { useGql } from "@/lib/api";
import { StudentSearchDocument } from "@/lib/queries";

import { SearchInput, Spinner } from "./ui";

export interface PickedStudent {
  id: string;
  fullName: string;
  admissionNumber: string;
}

export function StudentPicker({ onPick }: { onPick: (s: PickedStudent) => void }) {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const { data, isLoading } = useGql(StudentSearchDocument, deferred.length >= 2 ? { search: deferred } : null);
  const open = deferred.length >= 2;
  return (
    <div className="relative">
      <SearchInput placeholder="Search by name or admission number" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Find a student" autoComplete="off" />
      {open && (
        <div className="ui-pop-in absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          {isLoading && <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted"><Spinner small /> Searching</div>}
          {data && data.students.items.length === 0 && <div className="px-3 py-3 text-sm text-muted">No student matches “{deferred}”.</div>}
          {data && data.students.items.length > 0 && (
            <ul className="max-h-72 overflow-y-auto py-1">
              {data.students.items.map((s) => (
                <li key={s.id}>
                  <button type="button" className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-subtle" onClick={() => { onPick(s); setSearch(""); }}>
                    <span className="truncate font-medium text-ink">{s.fullName}</span>
                    <span className="flex-none text-[13px] text-muted">{s.admissionNumber} · {s.currentArm?.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
