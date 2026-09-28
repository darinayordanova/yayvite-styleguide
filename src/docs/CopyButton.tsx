import { useEffect, useState } from 'react';
import { IconButton } from '../components/IconButton/IconButton';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API can be blocked in some iframes; fall back to a hidden textarea.
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <IconButton
      size="sm"
      icon={copied ? 'check' : 'copy'}
      aria-label={copied ? `Copied ${text}` : `Copy ${text}`}
      title={copied ? 'Copied!' : `Copy "${text}"`}
      onClick={async () => {
        await copyText(text);
        setCopied(true);
      }}
    />
  );
}

/** A class name in monospace with a copy button next to it. */
export function ClassChip({ name }: { name: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <code
        className="text-neutral-900"
        style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, whiteSpace: 'nowrap' }}
      >
        .{name}
      </code>
      <CopyButton text={name} />
    </span>
  );
}
