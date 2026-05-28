'use client';
import React, { useState } from 'react';

interface Props {
  cCode: string;
  assemblyCode: string;
}

function CodeView({ code, lang }: { code: string; lang: 'c' | 'asm' }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function highlight(line: string, lang: 'c' | 'asm'): React.ReactNode {
    if (lang === 'c') {
      const cKw = /\b(int|float|double|char|void|if|else|while|for|return|include|define|struct|printf|scanf|NULL|main)\b/g;
      const cPP = /^#.*/;

      if (line.trim().startsWith('//')) return <span className="tok-comment">{line}</span>;
      if (cPP.test(line.trim())) return <span style={{ color: '#c084fc' }}>{line}</span>;

      const tokens = line.split(/(\s+|[{}();,]|"[^"]*"|\b(?:int|float|double|char|void|if|else|while|for|return|printf|scanf|NULL|main|include|define)\b|\d+\.?\d*f?)/);
      return (
        <span>
          {tokens.map((t, i) => {
            if (/^".*"$/.test(t)) return <span key={i} className="tok-string">{t}</span>;
            if (/^\d/.test(t)) return <span key={i} className="tok-number">{t}</span>;
            if (/^(int|float|double|char|void|if|else|while|for|return|printf|scanf|NULL|main|include|define)$/.test(t))
              return <span key={i} className="tok-keyword">{t}</span>;
            if (/^[{}();,]$/.test(t)) return <span key={i} className="tok-delimiter">{t}</span>;
            return <span key={i}>{t}</span>;
          })}
        </span>
      );
    } else {
      if (line.trim().startsWith(';')) return <span className="tok-comment">{line}</span>;
      if (line.trim().startsWith('section')) return <span style={{ color: '#c084fc' }}>{line}</span>;
      if (/^[a-zA-Z_]\w*:/.test(line.trim())) return <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{line}</span>;

      const tokens = line.split(/(\s+|,)/);
      let first = true;
      return (
        <span>
          {tokens.map((t, i) => {
            const trimmed = t.trim();
            if (!trimmed || t.match(/^\s+$/)) return <span key={i}>{t}</span>;
            if (first && trimmed) {
              first = false;
              if (/^(mov|add|sub|mul|imul|div|idiv|push|pop|call|ret|jmp|je|jne|jl|jg|jle|jge|jge|cmp|xor|inc|dec|cdq|neg)$/.test(trimmed))
                return <span key={i} className="tok-keyword">{t}</span>;
            }
            if (/^(eax|ebx|ecx|edx|esp|ebp|eip|ax|bx|cx|dx)$/.test(trimmed)) return <span key={i} style={{ color: 'var(--cyan)' }}>{t}</span>;
            if (/^\d+$/.test(trimmed)) return <span key={i} className="tok-number">{t}</span>;
            if (/^(db|dd|dq|dw|byte|word|dword|qword)$/.test(trimmed)) return <span key={i} style={{ color: 'var(--yellow)' }}>{t}</span>;
            if (/^(global|extern)$/.test(trimmed)) return <span key={i} className="tok-keyword">{t}</span>;
            return <span key={i}>{t}</span>;
          })}
        </span>
      );
    }
  }

  const lines = code.split('\n');

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleCopy} style={{
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
        background: 'var(--bg-surface)', color: copied ? 'var(--green)' : 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-ui)', transition: 'all 0.2s',
      }}>
        {copied ? '✓ Copiado' : '📋 Copiar'}
      </button>
      <div style={{
        background: '#070810', border: '1px solid var(--border)', borderRadius: 10,
        overflowY: 'auto', maxHeight: 400, padding: '16px 0',
        fontFamily: 'var(--font-code)', fontSize: 13, lineHeight: 1.7,
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', minHeight: 22 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <span style={{
              minWidth: 48, paddingRight: 16, paddingLeft: 12, textAlign: 'right',
              color: 'var(--text-muted)', fontSize: 11, userSelect: 'none',
              borderRight: '1px solid var(--border)', flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ paddingLeft: 16, paddingRight: 16, color: '#c4d4f4', whiteSpace: 'pre' }}>
              {highlight(line, lang)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OutputPhase({ cCode, assemblyCode }: Props) {
  const [activeTab, setActiveTab] = useState<'c' | 'asm'>('c');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ stdout?: string; stderr?: string; error?: string } | null>(null);
  const [programInput, setProgramInput] = useState<string>('');

  const cLines = cCode.split('\n').length;
  const asmLines = assemblyCode.split('\n').length;

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activeTab === 'c' ? cCode : assemblyCode, lang: activeTab, input: programInput })
      });
      const data = await res.json();
      if (data.success) {
        setExecutionResult({ stdout: data.stdout, stderr: data.stderr });
      } else {
        setExecutionResult({ error: data.error });
      }
    } catch (err: any) {
      setExecutionResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="badge badge-primary">⚡ Código Generado</span>
        <span className="badge badge-green">✓ Compilación exitosa</span>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {[
          { icon: '🐍', label: 'Fuente', value: 'Python', sub: 'Lenguaje de entrada', color: 'var(--yellow)' },
          { icon: '⚙️', label: 'C', value: `${cLines} líneas`, sub: 'Código C generado', color: 'var(--cyan)' },
          { icon: '🔩', label: 'x86 ASM', value: `${asmLines} líneas`, sub: 'NASM (Intel 32-bit)', color: 'var(--purple)' },
        ].map(({ icon, label, value, sub, color }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px',
            borderTop: `2px solid ${color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'var(--font-code)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'c' ? 'active' : ''}`} onClick={() => setActiveTab('c')}>
          ⚙️ Código C
        </button>
        <button className={`tab-btn ${activeTab === 'asm' ? 'active' : ''}`} onClick={() => setActiveTab('asm')}>
          🔩 Assembly (x86 NASM)
        </button>
      </div>

      {/* Code */}
      <div className="phase-panel">
        <div className="phase-header" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{activeTab === 'c' ? '⚙️' : '🔩'}</span>
            <span style={{ fontWeight: 600, color: activeTab === 'c' ? 'var(--cyan)' : 'var(--purple)' }}>
              {activeTab === 'c' ? 'Código C Generado' : 'Código Assembly x86 (NASM)'}
            </span>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              style={{ 
                fontWeight: 'bold',
                padding: '6px 12px'
              }}
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting ? 'Ejecutando...' : '▶ Ejecutar Código'}
            </button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <CodeView code={activeTab === 'c' ? cCode : assemblyCode} lang={activeTab} />
        </div>
        
        {/* Program Input Area */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Entrada del Programa (stdin):
            <span style={{ fontWeight: 'normal', opacity: 0.7, marginLeft: 8 }}>Escribe aquí los datos si tu diagrama usa bloques "Input"</span>
          </div>
          <textarea
            value={programInput}
            onChange={(e) => setProgramInput(e.target.value)}
            placeholder="Si tu diagrama pide números (ej. edad o precio), escríbelos aquí separados por saltos de línea..."
            style={{
              width: '100%', height: 60, padding: 10, borderRadius: 8, border: '1px solid var(--border)',
              background: '#070810', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: 13,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Execution Result Terminal */}
        {executionResult && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            <div style={{ 
              background: '#000', 
              borderRadius: 8, 
              border: '1px solid #333',
              overflow: 'hidden'
            }}>
              <div style={{ background: '#111', padding: '6px 12px', borderBottom: '1px solid #333', fontSize: 12, color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                <span>Terminal de Salida</span>
                <span style={{ color: executionResult.error ? 'var(--red)' : 'var(--green)' }}>
                  {executionResult.error ? 'Error de Ejecución' : 'Completado'}
                </span>
              </div>
              <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 13, maxHeight: 200, overflowY: 'auto' }}>
                {executionResult.error && (
                  <div style={{ color: '#ef4444', whiteSpace: 'pre-wrap' }}>{executionResult.error}</div>
                )}
                {executionResult.stdout && (
                  <div style={{ color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>{executionResult.stdout}</div>
                )}
                {executionResult.stderr && (
                  <div style={{ color: '#f59e0b', whiteSpace: 'pre-wrap', marginTop: 8 }}>{executionResult.stderr}</div>
                )}
                {!executionResult.error && !executionResult.stdout && !executionResult.stderr && (
                  <div style={{ color: '#6b7280', fontStyle: 'italic' }}>El programa finalizó sin producir ninguna salida.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="alert-box alert-info">
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sobre el código generado</div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            El código C es una traducción directa del diagrama original. El Assembly generado sigue la sintaxis NASM para arquitectura x86 de 32-bits.
            <br/><br/>
            <strong>Nota de ejecución:</strong> El código C se ejecuta nativamente compilándolo con <code style={{ fontFamily: 'var(--font-code)', background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 4 }}>gcc</code> en el servidor local. Para el código Assembly (debido a las restricciones de arquitectura nativas de Mac), hemos implementado un <strong>Emulador de CPU x86 interno personalizado</strong> que simula los registros, la memoria y las instrucciones en tiempo real para brindarte el resultado exacto directamente aquí en tu navegador.
          </div>
        </div>
      </div>
    </div>
  );
}

