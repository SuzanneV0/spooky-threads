"use client";

import Link from "next/link";
import { useCompare, COMPARE_MAX_ITEMS } from "@/components/CompareProvider";

export default function CompareBar() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) return null;

  const slugsParam = items.map((item) => item.slug).join(",");

  return (
    <div className="compare-bar">
      <div className="compare-bar-heading">
        <span>
          Compare ({items.length}/{COMPARE_MAX_ITEMS})
        </span>
        <button type="button" className="compare-bar-clear" onClick={clear}>
          Clear
        </button>
      </div>
      <ul className="compare-bar-list">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <button
              type="button"
              aria-label={`Remove ${item.name} from compare`}
              onClick={() => remove(item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <Link href={`/compare?slugs=${encodeURIComponent(slugsParam)}`} className="button small">
        Compare now
      </Link>
    </div>
  );
}
