'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Token } from '@/lib/compiler/types';

const TOKEN_COLORS: Record<string, string> = {
  IF: 'tok-keyword', ELIF: 'tok-keyword', ELSE: 'tok-keyword',
  WHILE: 'tok-keyword', FOR: 'tok-keyword', IN: 'tok-keyword',
  DEF: 'tok-keyword', RETURN: 'tok-keyword', AND: 'tok-keyword',
  OR: 'tok-keyword', NOT: 'tok-keyword', PRINT: 'tok-keyword',
  KEYWORD: 'tok-keyword', TRUE: 'tok-bool', FALSE: 'tok-bool',
  NONE: 'tok-none', STRING: 'tok-string', NUMBER: 'tok-number',
  FLOAT: 'tok-float', IDENTIFIER: 'tok-identifier',
  PLUS: 'tok-operator', MINUS: 'tok-operator', MULTIPLY: 'tok-operator',
  DIVIDE: 'tok-operator', MODULO: 'tok-operator', POWER: 'tok-operator',
  FLOOR_DIVIDE: 'tok-operator', ASSIGN: 'tok-operator', EQUAL: 'tok-operator',
  NOT_EQUAL: 'tok-operator', LESS: 'tok-operator', GREATER: 'tok-operator',
  LESS_EQUAL: 'tok-operator', GREATER_EQUAL: 'tok-operator',
  PLUS_ASSIGN: 'tok-operator', MINUS_ASSIGN: 'tok-operator',
  MULTIPLY_ASSIGN: 'tok-operator', DIVIDE_ASSIGN: 'tok-operator',
  LPAREN: 'tok-delimiter', RPAREN: 'tok-delimiter',
  LBRACKET: 'tok-delimiter', RBRACKET: 'tok-delimiter',
  LBRACE: 'tok-delimiter', RBRACE: 'tok-delimiter',
  COMMA: 'tok-delimiter', COLON: 'tok-delimiter', DOT: 'tok-delimiter',
  NEWLINE: 'tok-comment', INDENT: 'tok-comment', DEDENT: 'tok-comment',
  EOF: 'tok-comment',
};

interface Props {
  tokens: Token[];
  errors: { message: string; line: number; column: number }[];
  isAnimating: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
  IF: 'Palabra clave', ELIF: 'Palabra clave', ELSE: 'Palabra clave',
  WHILE: 'Palabra clave', FOR: 'Palabra clave', IN: 'Palabra clave',
  DEF: 'Palabra clave', RETURN: 'Palabra clave', AND: 'Palabra clave',
  OR: 'Palabra clave', NOT: 'Palabra clave', PRINT: 'Palabra clave',
  KEYWORD: 'Palabra clave', TRUE: 'Literal booleano', FALSE: 'Literal booleano',
  NONE: 'Literal nulo', STRING: 'Literal cadena', NUMBER: 'Literal entero',
  FLOAT: 'Literal decimal', IDENTIFIER: 'Identificador',
  PLUS: 'Operador', MINUS: 'Operador', MULTIPLY: 'Operador', DIVIDE: 'Operador',
  MODULO: 'Operador', POWER: 'Operador', FLOOR_DIVIDE: 'Operador',
  ASSIGN: 'Asignación', EQUAL: 'Comparación', NOT_EQUAL: 'Comparación',
  LESS: 'Comparación', GREATER: 'Comparación', LESS_EQUAL: 'Comparación',
  GREATER_EQUAL: 'Comparación', PLUS_ASSIGN: 'Asig. compuesta',
  MINUS_ASSIGN: 'Asig. compuesta', MULTIPLY_ASSIGN: 'Asig. compuesta',
  DIVIDE_ASSIGN: 'Asig. compuesta',
  LPAREN: 'Delimitador', RPAREN: 'Delimitador', LBRACKET: 'Delimitador',
  RBRACKET: 'Delimitador', LBRACE: 'Delimitador', RBRACE: 'Delimitador',
  COMMA: 'Delimitador', COLON: 'Delimitador', DOT: 'Delimitador',
  NEWLINE: 'Control', INDENT: 'Control', DEDENT: 'Control', EOF: 'Control',
};

const VISIBLE_TYPES = new Set([
  'IF','ELIF','ELSE','WHILE','FOR','IN','DEF','RETURN','AND','OR','NOT','PRINT','KEYWORD',
  'TRUE','FALSE','NONE','STRING','NUMBER','FLOAT','IDENTIFIER',
  'PLUS','MINUS','MULTIPLY','DIVIDE','MODULO','POWER','FLOOR_DIVIDE',
  'ASSIGN','EQUAL','NOT_EQUAL','LESS','GREATER','LESS_EQUAL','GREATER_EQUAL',
  'PLUS_ASSIGN','MINUS_ASSIGN','MULTIPLY_ASSIGN','DIVIDE_ASSIGN',
  'LPAREN','RPAREN','LBRACKET','RBRACKET','LBRACE','RBRACE','COMMA','COLON','DOT',
]);

export default function LexerPhase({ tokens, errors, isAnimating }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLDivElement>(null);

  const visibleTokens = tokens.filter(t => VISIBLE_TYPES.has(t.type));

  useEffect(() => {
    setVisibleCount(0);
    setStats({});
    if (!isAnimating || visibleTokens.length === 0) {
      if (!isAnimating) { setVisibleCount(visibleTokens.length); buildStats(visibleTokens); }
      return;
    }
    let i = 0;
    const delay = Math.max(30, Math.min(120, 2000 / visibleTokens.length));
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      setStats(prev => {
        const cat = CATEGORY_MAP[visibleTokens[i - 1]?.type] ?? 'Otro';
        return { ...prev, [cat]: (prev[cat] ?? 0) + 1 };
      });
      if (tableRef.current) tableRef.current.scrollTop = tableRef.current.scrollHeight;
      if (i >= visibleTokens.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [tokens, isAnimating]);

  function buildStats(toks: Token[]) {
    const s: Record<string, number> = {};
    toks.forEach(t => { const cat = CATEGORY_MAP[t.type] ?? 'Otro'; s[cat] = (s[cat] ?? 0) + 1; });
    setStats(s);
  }

  const shown = visibleTokens.slice(0, visibleCount);
  const hasErrors = errors.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header info */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="badge badge-cyan">⚡ Análisis Léxico</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {visibleCount} / {visibleTokens.length} tokens procesados
        </span>
        {hasErrors && <span className="badge badge-red">⚠ {errors.length} error{errors.length > 1 ? 'es' : ''}</span>}
        {!hasErrors && visibleCount === visibleTokens.length && visibleCount > 0 && (
          <span className="badge badge-green">✓ Sin errores léxicos</span>
        )}
      </div>

      {/* Progress */}
      <div className="progress-bar-outer">
        <div className="progress-bar-inner"
          style={{ width: visibleTokens.length ? `${(visibleCount / visibleTokens.length) * 100}%` : '0%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Token Table */}
        <div className="phase-panel">
          <div className="phase-header">
            <span style={{ fontSize: 16 }}>📋</span>
            <span style={{ fontWeight: 600, color: 'var(--cyan)' }}>Tabla de Tokens</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>
              {shown.length} entradas
            </span>
          </div>
          <div ref={tableRef} style={{ maxHeight: 420, overflowY: 'auto', padding: 0 }}>
            <table className="token-table" style={{ width: '100%' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>#</th>
                  <th>Token</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Línea</th>
                  <th>Col</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((tok, i) => (
                  <tr key={i} className={i === shown.length - 1 && isAnimating ? 'new-row' : ''}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                    <td>
                      <code className={TOKEN_COLORS[tok.type] ?? 'tok-default'} style={{ fontFamily: 'var(--font-code)', fontSize: 13 }}>
                        {tok.value || `‹${tok.type}›`}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: 10 }}>{tok.type}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{CATEGORY_MAP[tok.type] ?? 'Otro'}</td>
                    <td style={{ color: 'var(--cyan)', fontSize: 12, fontFamily: 'var(--font-code)' }}>{tok.line}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-code)' }}>{tok.column}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                {isAnimating ? '⏳ Procesando tokens...' : 'Sin tokens'}
              </div>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="phase-panel">
            <div className="phase-header">
              <span style={{ fontSize: 15 }}>📊</span>
              <span style={{ fontWeight: 600, color: 'var(--purple)' }}>Estadísticas</span>
            </div>
            <div style={{ padding: '16px' }}>
              {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat}</span>
                    <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${(count / visibleTokens.length) * 100}%`,
                      background: 'linear-gradient(90deg, var(--primary), var(--cyan))',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              ))}
              {Object.keys(stats).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>Sin datos aún</p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="phase-panel">
            <div className="phase-header">
              <span style={{ fontSize: 15 }}>🎨</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Leyenda</span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { cls: 'tok-keyword', label: 'Palabras clave' },
                { cls: 'tok-identifier', label: 'Identificadores' },
                { cls: 'tok-string', label: 'Cadenas' },
                { cls: 'tok-number', label: 'Enteros' },
                { cls: 'tok-float', label: 'Decimales' },
                { cls: 'tok-operator', label: 'Operadores' },
                { cls: 'tok-bool', label: 'Booleanos' },
                { cls: 'tok-delimiter', label: 'Delimitadores' },
              ].map(({ cls, label }) => (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code className={cls} style={{ fontSize: 12, fontFamily: 'var(--font-code)' }}>■</code>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {hasErrors && (
        <div>
          <h3 style={{ color: 'var(--red)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
            ❌ Errores Léxicos Encontrados
          </h3>
          {errors.map((err, i) => (
            <div key={i} className="alert-box alert-error" style={{ animationDelay: `${i * 0.1}s` }}>
              <span style={{ fontSize: 18 }}>🚫</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Línea {err.line}, Col {err.column}</div>
                <div>{err.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
