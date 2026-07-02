import { useState } from 'react';

/**
 * Interactive, read-only JSON tree. Every object/array node can be expanded or
 * collapsed independently (DevTools-style). Nodes deeper than `defaultExpandDepth`
 * start collapsed so large payloads don't flood the panel.
 */
export function JsonTree({
  value,
  defaultExpandDepth = 2,
}: {
  value: unknown;
  defaultExpandDepth?: number;
}): JSX.Element {
  return (
    <div className="json-tree">
      <JsonNode
        nodeKey={null}
        value={value}
        depth={0}
        defaultExpandDepth={defaultExpandDepth}
        trailingComma={false}
      />
    </div>
  );
}

interface JsonNodeProps {
  nodeKey: string | number | null;
  value: unknown;
  depth: number;
  defaultExpandDepth: number;
  trailingComma: boolean;
}

const INDENT_PX = 14;

function JsonNode({
  nodeKey,
  value,
  depth,
  defaultExpandDepth,
  trailingComma,
}: JsonNodeProps): JSX.Element {
  const [expanded, setExpanded] = useState(depth < defaultExpandDepth);

  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object';
  const pad = { paddingLeft: `${depth * INDENT_PX}px` };
  const comma = trailingComma ? ',' : '';

  const keyPart =
    nodeKey !== null ? (
      <>
        <span className="jt-key">{nodeKey}</span>
        <span className="jt-punct">: </span>
      </>
    ) : null;

  if (!isObject) {
    return (
      <div className="jt-line" style={pad}>
        <span className="jt-toggle-spacer" />
        {keyPart}
        <Primitive value={value} />
        <span className="jt-punct">{comma}</span>
      </div>
    );
  }

  const entries: [string | number, unknown][] = isArray
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.entries(value as Record<string, unknown>);
  const open = isArray ? '[' : '{';
  const close = isArray ? ']' : '}';

  // Empty object/array renders inline with no toggle.
  if (entries.length === 0) {
    return (
      <div className="jt-line" style={pad}>
        <span className="jt-toggle-spacer" />
        {keyPart}
        <span className="jt-punct">
          {open}
          {close}
          {comma}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="jt-line jt-expandable"
        style={pad}
        onClick={() => setExpanded((e) => !e)}
        role="button"
        aria-expanded={expanded}
      >
        <span className="jt-toggle">{expanded ? '▾' : '▸'}</span>
        {keyPart}
        <span className="jt-punct">{open}</span>
        {!expanded && (
          <span className="jt-collapsed">
            {' … '}
            {close}
            {comma}
            <span className="jt-count">
              {entries.length} {isArray ? 'items' : 'keys'}
            </span>
          </span>
        )}
      </div>

      {expanded && (
        <>
          {entries.map(([k, v], i) => (
            <JsonNode
              key={k}
              nodeKey={k}
              value={v}
              depth={depth + 1}
              defaultExpandDepth={defaultExpandDepth}
              trailingComma={i < entries.length - 1}
            />
          ))}
          <div className="jt-line" style={pad}>
            <span className="jt-toggle-spacer" />
            <span className="jt-punct">
              {close}
              {comma}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function Primitive({ value }: { value: unknown }): JSX.Element {
  if (value === null) return <span className="jt-null">null</span>;
  switch (typeof value) {
    case 'string':
      return <span className="jt-string">&quot;{value}&quot;</span>;
    case 'number':
      return <span className="jt-number">{String(value)}</span>;
    case 'boolean':
      return <span className="jt-boolean">{String(value)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
}
