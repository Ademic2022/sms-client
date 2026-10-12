"use client";

import { useDeferredValue, useState } from "react";

import { useGql } from "@/lib/api";
import { StudentSearchDocument } from "@/lib/queries";

import { Input } from "./ui";

export interface PickedStudent {
  id: string;
  fullName: string;
  admissionNumber: string;
}

export function StudentPicker({ onPick }: { onPick: (s: PickedStudent) => void }) {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const { data } = useGql(StudentSearchDocument, deferred.length >= 2 ? { search: deferred } : null);
  return (
    <div className="relative">
      <Input type="search" placeholder="Type a name or admission number" value={search} onChange={(e) => setSearch(e.target.value)} />
      {deferred.length >= 2 && data && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          {data.students.items.length === 0 && <li className="px-3 py-2 text-sm text-muted">No match.</li>}
          {data.students.items.map((s) => (
            <li key={s.id}>
              <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-subtle" onClick={() => { onPick(s); setSearch(""); }}>
                <span className="font-medium">{s.fullName}</span> <span className="text-muted">· {s.admissionNumber} · {s.currentArm?.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
