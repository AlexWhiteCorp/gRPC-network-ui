import { useState } from 'react';

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Read-only, pretty-printed JSON block. When `collapsible` is set and the value
 * is longer than `previewLines`, only the first few lines are shown with a
 * Show more / Show less toggle.
 */
export function JsonView({
  value,
  collapsible = false,
  previewLines = 6,
}: {
  value: unknown;
  collapsible?: boolean;
  previewLines?: number;
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const text = stringify(value);
  const lines = text.split('\n');
  const isLong = collapsible && lines.length > previewLines;
  const shown = isLong && !expanded ? lines.slice(0, previewLines).join('\n') : text;
  const hiddenCount = lines.length - previewLines;

  const renderToggle = (extraClass = ''): JSX.Element => (
    <button
      className={`json-toggle ${extraClass}`.trim()}
      onClick={() => setExpanded((e) => !e)}
      aria-expanded={expanded}
    >
      {expanded ? '▲ Show less' : `▼ Show ${hiddenCount} more lines`}
    </button>
  );

  return (
    <div className="json-block">
      {/* When expanded, offer the collapse control at the top too, so the user
          doesn't have to scroll a long payload to collapse it. */}
      {isLong && expanded && renderToggle('json-toggle-top')}
      <pre className="json-view">
        {shown}
        {isLong && !expanded ? '\n  …' : ''}
      </pre>
      {isLong && renderToggle()}
    </div>
  );
}
