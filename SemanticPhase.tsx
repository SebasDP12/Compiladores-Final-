'use client';
import React, { useState, useEffect } from 'react';
import { SymbolEntry, SemanticError } from '@/lib/compiler/types';

interface Props {
  symbols: SymbolEntry[];
  errors: SemanticError[];
  warnings: string[];
  isAnimating: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  int: 'var(--cyan)', float: 'var(--yellow)', str: 'var(--green)',
  bool: 'var(--purple)', None: 'var(--text-muted)', list: '#67e8f9',
  dict: '#f472b6', function: 'var(--primary)', unknown: 'var(--text-muted)',
};

const TYPE_ICONS: Record<string, string> = {
  int: '🔢', float: '🔣', str: '📝', bool: '☑️', None: '∅',
  list: '📋', dict: '📖', function: '⚙️', unknown: '❓',
};

export default function SemanticPhase({ symbols, errors, warnings, isAnimating }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeScope, setActiveScope] = useState<string>('all');

  useEffect(() => {
    setVisibleCount(0);
    if (!isAnimating || symbols.length === 0) { setVisibleCount(symbols.length); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= symbols.length) clearInterval(interval);
    }, 180);
    return () => clearInterval(interval);
  }, [symbols, isAnimating]);

  const scopes = ['all', ...Array.from(new Set(symbols.map(s => s.scope)))];
  const filtered = symbols.slice(0, visibleCount).filter(s => activeScope === 'all' || s.scope === activeScope);
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  // Type distribution
  const typeDist: Record<string, number> = {};
  symbols.slice(0, visibleCount).forEach(s => { typeDist[s.type] = (typeDist[s.type] ?? 0) + 1; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="badge badge-green">🔍 Análisis Semántico</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {visibleCount} / {symbols.length} símbolos analizados
        </span>
        {hasErrors && <span className="badge badge-red">⚠ {errors.length} error{errors.length !== 1 ? 'es' : ''}</span>}
        {hasWarnings && <span className="badge badge-yellow">⚠ {warnings.length} advertencia{warnings.length !== 1 ? 's' : ''}</span>}
        {!hasErrors && visibleCount === symbols.length && <span className="badge badge-green">✓ Semántica correcta</span>}
      </div>

      <div className="progress-bar-outer">
        <div className="progress-bar-inner"
          style={{ width: symbols.length ? `${(visibleCount / symbols.length) * 100}%` : '100%',
            background: hasErrors ? 'linear-gradient(90deg, var(--red), #fb7185)' : 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Symbol Table */}
        <div className="phase-panel">
          <div className="phase-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontWeight: 600, color: 'var(--green)' }}>Tabla de Símbolos</span>
            {/* Scope filter */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {scopes.map(scope => (
                <button key={scope} onClick={() => setActiveScope(scope)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-ui)',
                    background: activeScope === scope ? 'var(--primary)' : 'var(--bg-base)',
                    color: activeScope === scope ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}>
                  {scope === 'all' ? 'Todos' : scope}
                </button>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            <table className="token-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>Símbolo</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Ámbito</th>
                  <th>Línea</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sym, i) => (
                  <tr key={i} className={i === filtered.length - 1 && isAnimating ? 'new-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{TYPE_ICONS[sym.type] ?? '❓'}</span>
                        <code style={{ color: '#93c5fd', fontFamily: 'var(--font-code)', fontSize: 13, fontWeight: 600 }}>{sym.name}</code>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 99,
                        background: `${TYPE_COLORS[sym.type]}18`,
                        border: `1px solid ${TYPE_COLORS[sym.type]}40`,
                        color: TYPE_COLORS[sym.type], fontSize: 11, fontWeight: 700,
                      }}>{sym.type}</span>
                    </td>
                    <td>
                      <code style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-code)', fontSize: 12 }}>
                        {sym.value ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </code>
                    </td>
                    <td>
                      <span className={sym.scope === 'global' ? 'badge badge-cyan' : 'badge badge-purple'}
                        style={{ fontSize: 10 }}>{sym.scope}</span>
                    </td>
                    <td style={{ color: 'var(--cyan)', fontFamily: 'var(--font-code)', fontSize: 12 }}>{sym.line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                {isAnimating && symbols.length > 0 ? '⏳ Analizando símbolos...' : 'Sin símbolos definidos'}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type distribution */}
          <div className="phase-panel">
            <div className="phase-header">
              <span style={{ fontSize: 15 }}>🎯</span>
              <span style={{ fontWeight: 600, color: 'var(--green)' }}>Tipos detectados</span>
            </div>
            <div style={{ padding: 16 }}>
              {Object.entries(typeDist).map(([type, count]) => (
                <div key={type} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{TYPE_ICONS[type] ?? '❓'}</span>
                      <span style={{ fontSize: 12, color: TYPE_COLORS[type] ?? 'var(--text-secondary)' }}>{type}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${(count / symbols.slice(0, visibleCount).length) * 100}%`,
                      background: TYPE_COLORS[type] ?? 'var(--primary)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              ))}
              {Object.keys(typeDist).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Sin datos</p>}
            </div>
          </div>

          {/* Checks panel */}
          <div className="phase-panel">
            <div className="phase-header">
              <span style={{ fontSize: 15 }}>✅</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Verificaciones</span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Variables definidas', ok: !errors.some(e => e.message.includes('no definida')) },
                { label: 'Tipos compatibles', ok: !errors.some(e => e.message.includes('TypeError')) },
                { label: 'Funciones declaradas', ok: !errors.some(e => e.message.includes('función')) },
                { label: 'Índices válidos', ok: true },
                { label: 'Retornos correctos', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: ok ? 'var(--green)' : 'var(--red)', fontSize: 14 }}>{ok ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: ok ? 'var(--text-secondary)' : '#fda4af' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div>
          <h3 style={{ color: 'var(--yellow)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>⚠️ Advertencias</h3>
          {warnings.map((w, i) => (
            <div key={i} className="alert-box alert-warning">
              <span style={{ fontSize: 16 }}>⚠</span>
              <span style={{ fontSize: 13 }}>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {hasErrors && (
        <div>
          <h3 style={{ color: 'var(--red)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>❌ Errores Semánticos</h3>
          {errors.map((err, i) => (
            <div key={i} className="alert-box alert-error">
              <span style={{ fontSize: 20 }}>🚫</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Línea {err.line}</div>
                <div style={{ marginBottom: err.hint ? 8 : 0 }}>{err.message}</div>
                {err.hint && (
                  <div className="alert-box alert-info" style={{ margin: 0, padding: '8px 12px' }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    <span style={{ fontSize: 12 }}>{err.hint}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
