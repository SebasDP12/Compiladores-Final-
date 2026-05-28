'use client';
import React, { useRef, useEffect, useState } from 'react';

const PYTHON_KEYWORDS = ['if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return', 'and', 'or', 'not', 'True', 'False', 'None', 'print', 'import', 'from', 'class', 'lambda', 'pass', 'break', 'continue', 'global', 'nonlocal', 'try', 'except', 'finally', 'raise', 'with', 'as', 'yield', 'assert', 'del'];

const EXAMPLES = [
  {
    label: '📐 Factorial',
    code: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

resultado = factorial(5)
print(resultado)`,
  },
  {
    label: '🔢 Fibonacci',
    code: `def fibonacci(n):
    if n <= 1:
        return n
    a = 0
    b = 1
    i = 2
    while i <= n:
        c = a + b
        a = b
        b = c
        i += 1
    return b

print(fibonacci(10))`,
  },
  {
    label: '🔁 Bucles',
    code: `suma = 0
for i in range(1, 11):
    suma += i

promedio = suma / 10
print(suma)
print(promedio)`,
  },
  {
    label: '🏷️ Variables',
    code: `nombre = "Python"
version = 3
precio = 99.99
activo = True

if activo:
    print(nombre)
    print(version)
else:
    print("Inactivo")`,
  },
  {
    label: '🚫 Con errores',
    code: `x = 10
y = "hola"
z = x + y

if x = 5:
    print(z)`,
  },
];

function tokenizeLine(line: string): { text: string; cls: string }[] {
  const parts: { text: string; cls: string }[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '#') { parts.push({ text: line.slice(i), cls: 'tok-comment' }); break; }
    if (ch === '"' || ch === "'") {
      let j = i + 1, str = ch;
      while (j < line.length && line[j] !== ch) { str += line[j++]; }
      str += line[j] ?? ''; j++;
      parts.push({ text: str, cls: 'tok-string' }); i = j; continue;
    }
    if (ch >= '0' && ch <= '9') {
      let num = '', j = i;
      while (j < line.length && (line[j] >= '0' && line[j] <= '9' || line[j] === '.')) num += line[j++];
      parts.push({ text: num, cls: num.includes('.') ? 'tok-float' : 'tok-number' }); i = j; continue;
    }
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let ident = '', j = i;
      while (j < line.length && (line[j].match(/[a-zA-Z0-9_]/))) ident += line[j++];
      const cls = PYTHON_KEYWORDS.includes(ident) ? (ident === 'True' || ident === 'False' ? 'tok-bool' : ident === 'None' ? 'tok-none' : 'tok-keyword') : 'tok-identifier';
      parts.push({ text: ident, cls }); i = j; continue;
    }
    if ('+-*/%=<>!&|^~'.includes(ch)) {
      let op = ch, j = i + 1;
      if (j < line.length && '=+-*/'.includes(line[j])) { op += line[j]; j++; }
      parts.push({ text: op, cls: 'tok-operator' }); i = j; continue;
    }
    if ('()[]{},:.;'.includes(ch)) { parts.push({ text: ch, cls: 'tok-delimiter' }); i++; continue; }
    if (ch === ' ' || ch === '\t') {
      let spaces = '', j = i;
      while (j < line.length && (line[j] === ' ' || line[j] === '\t')) spaces += line[j++];
      parts.push({ text: spaces, cls: '' }); i = j; continue;
    }
    parts.push({ text: ch, cls: '' }); i++;
  }
  return parts;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onCompile: () => void;
  isCompiling: boolean;
}

export default function CodeEditor({ value, onChange, onCompile, isCompiling }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showExamples, setShowExamples] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.slice(0, start) + '    ' + value.slice(end);
      onChange(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
    }
    if (e.key === 'Enter') {
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.slice(lineStart, start);
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';
      const needsExtraIndent = currentLine.trimEnd().endsWith(':');
      const newIndent = needsExtraIndent ? indent + '    ' : indent;
      e.preventDefault();
      const newVal = value.slice(0, start) + '\n' + newIndent + value.slice(ta.selectionEnd);
      onChange(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1 + newIndent.length; }, 0);
    }
  }

  const lines = value.split('\n');
  const lineCount = lines.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        background: 'var(--bg-card2)', borderRadius: '12px 12px 0 0',
        border: '1px solid var(--border)', borderBottom: 'none',
        flexWrap: 'wrap',
      }}>
        {/* Terminal dots */}
        <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-code)' }}>
          🐍 python_code.py
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
          {lineCount} línea{lineCount !== 1 ? 's' : ''} · {value.length} chars
        </span>

        {/* Examples dropdown */}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button onClick={() => setShowExamples(s => !s)} className="btn btn-ghost"
            style={{ padding: '6px 14px', fontSize: 12 }}>
            📚 Ejemplos ▾
          </button>
          {showExamples && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, zIndex: 100, marginTop: 4,
              background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
              borderRadius: 10, overflow: 'hidden', minWidth: 180,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {EXAMPLES.map(ex => (
                <button key={ex.label} onClick={() => { onChange(ex.code); setShowExamples(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', background: 'transparent', border: 'none',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
                    fontFamily: 'var(--font-ui)', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-glow)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => onChange('')} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
          🗑 Limpiar
        </button>
      </div>

      {/* Editor area */}
      <div style={{
        display: 'flex', position: 'relative', flex: 1,
        background: '#070810', border: '1px solid var(--border)',
        borderBottom: 'none', overflow: 'hidden', minHeight: 280,
      }}>
        {/* Line numbers */}
        <div style={{
          padding: '16px 0', minWidth: 48, background: '#07080f',
          borderRight: '1px solid var(--border)', userSelect: 'none', flexShrink: 0,
          overflowY: 'hidden',
        }}>
          {lines.map((_, i) => (
            <div key={i} style={{
              height: '23.8px', lineHeight: '23.8px',
              textAlign: 'right', paddingRight: 12,
              color: 'var(--text-muted)', fontSize: 12,
              fontFamily: 'var(--font-code)',
            }}>{i + 1}</div>
          ))}
        </div>

        {/* Highlight overlay */}
        <div style={{
          position: 'absolute', left: 48, top: 0, right: 0, bottom: 0,
          padding: '16px 16px 16px 12px', pointerEvents: 'none',
          fontFamily: 'var(--font-code)', fontSize: 13, lineHeight: '23.8px',
          whiteSpace: 'pre', overflowY: 'auto', color: 'transparent',
          zIndex: 1,
        }}>
          {lines.map((line, i) => {
            const parts = tokenizeLine(line);
            return (
              <div key={i} style={{ height: '23.8px', display: 'block' }}>
                {parts.map((p, j) => (
                  <span key={j} className={p.cls} style={{ color: p.cls ? undefined : 'transparent' }}>{p.text}</span>
                ))}
              </div>
            );
          })}
        </div>

        {/* Actual textarea */}
        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown} spellCheck={false}
          style={{
            flex: 1, padding: '16px 16px 16px 12px',
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font-code)', fontSize: 13, lineHeight: '23.8px',
            color: 'rgba(255,255,255,0.85)', resize: 'none', minHeight: 280,
            caretColor: 'var(--cyan)', zIndex: 2, position: 'relative',
          }}
          placeholder="# Escribe tu código Python aquí...
# Soporta: variables, if/elif/else, while, for, def, return, print

x = 10
if x > 5:
    print(x)"
        />
      </div>

      {/* Compile button */}
      <button onClick={onCompile} disabled={isCompiling || !value.trim()} className="btn btn-primary"
        style={{
          width: '100%', borderRadius: '0 0 12px 12px', padding: '14px',
          fontSize: 15, justifyContent: 'center', gap: 10,
        }}>
        {isCompiling ? (
          <><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> Compilando...</>
        ) : (
          <><span>▶</span> Compilar y Analizar</>
        )}
      </button>
    </div>
  );
}
