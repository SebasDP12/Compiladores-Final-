'use client';
import React, { useState, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import LexerPhase from '@/components/LexerPhase';
import ParserPhase from '@/components/ParserPhase';
import SemanticPhase from '@/components/SemanticPhase';
import OutputPhase from '@/components/OutputPhase';
import FlowEditor from '@/components/flow/FlowEditor';
import { tokenize, parse, analyze, generateCode } from '@/lib/compiler';
import { LexerResult, ParseResult, SemanticResult, CodeGenResult } from '@/lib/compiler/types';

export default function Home() {
  const [code, setCode] = useState(`def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

resultado = factorial(5)
print(resultado)`);

  const [activePhase, setActivePhase] = useState<number>(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [inputType, setInputType] = useState<'code' | 'flow'>('flow');

  const [lexerRes, setLexerRes] = useState<LexerResult | null>(null);
  const [parserRes, setParserRes] = useState<ParseResult | null>(null);
  const [semanticRes, setSemanticRes] = useState<SemanticResult | null>(null);
  const [codeGenRes, setCodeGenRes] = useState<CodeGenResult | null>(null);

  const phases = [
    { id: 0, icon: '📝', label: 'Código', color: 'var(--text-secondary)' },
    { id: 1, icon: '⚡', label: 'Léxico', color: 'var(--cyan)' },
    { id: 2, icon: '🌳', label: 'Sintáctico', color: 'var(--purple)' },
    { id: 3, icon: '🔍', label: 'Semántico', color: 'var(--green)' },
    { id: 4, icon: '⚙️', label: 'Código Generado', color: 'var(--primary)' },
  ];

  const handleCompile = (sourceCode?: string) => {
    const codeToCompile = sourceCode || code;
    setIsCompiling(true);

    // Simular retraso para efecto visual
    setTimeout(() => {
      // 1. Análisis Léxico
      const lRes = tokenize(codeToCompile);
      setLexerRes(lRes);
      setActivePhase(1); // Mover a la fase léxica cuando ya hay resultados

      if (lRes.errors.length > 0) {
        setParserRes(null);
        setSemanticRes(null);
        setCodeGenRes(null);
        setIsCompiling(false);
        return;
      }

      // 2. Análisis Sintáctico
      setTimeout(() => {
        const pRes = parse(lRes.tokens);
        setParserRes(pRes);

        if (pRes.errors.length > 0 || !pRes.ast) {
          setSemanticRes(null);
          setCodeGenRes(null);
          setIsCompiling(false);
          setActivePhase(2);
          return;
        }

        // 3. Análisis Semántico
        setTimeout(() => {
          const sRes = analyze(pRes.ast!);
          setSemanticRes(sRes);

          if (sRes.errors.length > 0) {
            setCodeGenRes(null);
            setIsCompiling(false);
            setActivePhase(3);
            return;
          }

          // 4. Generación de Código
          setTimeout(() => {
            const cgRes = generateCode(pRes.ast!);
            setCodeGenRes(cgRes);
            setIsCompiling(false);
            
            // Avanzar fases poco a poco para la animación
            setTimeout(() => setActivePhase(2), 800);
            setTimeout(() => setActivePhase(3), 1600);
            setTimeout(() => setActivePhase(4), 2400);

          }, 400);
        }, 400);
      }, 400);
    }, 400);
  };

  return (
    <main style={{ padding: '20px 40px', maxWidth: 1400, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            PyCompiler Visual
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>
            Visualizador interactivo de las fases de compilación (Python a C/Assembly)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className="glass"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: 'none',
                background: activePhase === p.id ? `rgba(${p.color === 'var(--primary)' ? '99,102,241' : p.color === 'var(--cyan)' ? '34,211,238' : p.color === 'var(--purple)' ? '168,85,247' : p.color === 'var(--green)' ? '16,185,129' : '255,255,255'}, 0.15)` : 'var(--bg-surface)',
                color: activePhase === p.id ? p.color : 'var(--text-secondary)',
                boxShadow: activePhase === p.id ? `0 0 0 1px ${p.color}50` : '0 0 0 1px var(--border)',
                cursor: 'pointer', borderRadius: 99, transition: 'all 0.3s',
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                opacity: (p.id > 0 && !lexerRes) ? 0.5 : 1,
                pointerEvents: (p.id > 0 && !lexerRes) ? 'none' : 'auto',
              }}
            >
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activePhase === 0 && (
          <div className="animate-fade-in-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16 }}>
              <span className="badge badge-primary">Paso 1: Entrada</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
                Escribe tu código en Python o crea un diagrama de flujo.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button 
                  className={`btn ${inputType === 'flow' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setInputType('flow')}
                >
                  Diagrama de Flujo
                </button>
                <button 
                  className={`btn ${inputType === 'code' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setInputType('code')}
                >
                  Código Python
                </button>
              </div>
            </div>
            
            {inputType === 'code' ? (
              <CodeEditor
                value={code}
                onChange={setCode}
                onCompile={handleCompile}
                isCompiling={isCompiling}
              />
            ) : (
              <FlowEditor
                onCodeGenerated={(generatedCode) => setCode(generatedCode)}
                onCompile={handleCompile}
                isCompiling={isCompiling}
              />
            )}
          </div>
        )}

        {activePhase === 1 && lexerRes && (
          <div className="animate-fade-in-up">
            <LexerPhase tokens={lexerRes.tokens} errors={lexerRes.errors} isAnimating={true} />
          </div>
        )}

        {activePhase === 2 && parserRes && (
          <div className="animate-fade-in-up">
            <ParserPhase ast={parserRes.ast} errors={parserRes.errors} isAnimating={true} />
          </div>
        )}

        {activePhase === 3 && semanticRes && (
          <div className="animate-fade-in-up">
            <SemanticPhase symbols={semanticRes.symbols} errors={semanticRes.errors} warnings={semanticRes.warnings} isAnimating={true} />
          </div>
        )}

        {activePhase === 4 && codeGenRes && (
          <div className="animate-fade-in-up">
            <OutputPhase cCode={codeGenRes.c} assemblyCode={codeGenRes.assembly} />
          </div>
        )}
      </div>
    </main>
  );
}
