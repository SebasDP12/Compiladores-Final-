'use client';
import React, { useState, useEffect } from 'react';
import { ASTNode, ParseError } from '@/lib/compiler/types';

interface Props {
  ast: ASTNode | null;
  errors: ParseError[];
  isAnimating: boolean;
}

function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    Program: '📄', FunctionDef: '⚙️', If: '🔀', Elif: '🔀', While: '🔁',
    For: '🔄', Assign: '📌', AugAssign: '📌', Return: '↩️', Print: '🖨️',
    BinaryOp: '🔢', UnaryOp: '➖', Call: '📞', Identifier: '🏷️',
    NumberLiteral: '🔢', FloatLiteral: '🔢', StringLiteral: '📝',
    BoolLiteral: '✅', NoneLiteral: '∅', ListLiteral: '📋',
    ExprStmt: '▶️', MethodCall: '📞', Subscript: '🗂️', Unknown: '❓',
  };
  return icons[type] ?? '⬡';
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    Program: 'var(--primary)', FunctionDef: 'var(--purple)',
    If: 'var(--cyan)', Elif: 'var(--cyan)', While: 'var(--yellow)', For: 'var(--yellow)',
    Assign: 'var(--green)', AugAssign: 'var(--green)', Return: 'var(--red)',
    Print: 'var(--cyan)', BinaryOp: 'var(--purple)', UnaryOp: 'var(--purple)',
    Call: 'var(--cyan)', Identifier: '#93c5fd',
    NumberLiteral: '#fb923c', FloatLiteral: '#fdba74',
    StringLiteral: '#86efac', BoolLiteral: '#a78bfa',
    NoneLiteral: 'var(--text-muted)', ListLiteral: '#67e8f9',
  };
  return colors[type] ?? 'var(--text-secondary)';
}

function getNodeLabel(node: ASTNode): string {
  switch (node.type) {
    case 'Program': return `Programa (${(node.body as ASTNode[]).length} instrucciones)`;
    case 'FunctionDef': return `def ${node.name}(${(node.params as string[]).join(', ')})`;
    case 'If': return 'if condición:';
    case 'While': return 'while condición:';
    case 'For': return `for ${node.target} in ...`;
    case 'Assign': return `${node.name} = ...`;
    case 'AugAssign': return `${node.name} ${node.op} ...`;
    case 'Return': return 'return';
    case 'Print': return `print(${(node.args as ASTNode[]).length} arg${(node.args as ASTNode[]).length !== 1 ? 's' : ''})`;
    case 'BinaryOp': return `op: ${node.op}`;
    case 'UnaryOp': return `unary: ${node.op}`;
    case 'Call': return `${node.callee}(...)`;
    case 'Identifier': return String(node.name);
    case 'NumberLiteral': return String(node.value);
    case 'FloatLiteral': return String(node.value);
    case 'StringLiteral': return `"${String(node.value).slice(0, 20)}${String(node.value).length > 20 ? '...' : ''}"`;
    case 'BoolLiteral': return node.value ? 'True' : 'False';
    case 'NoneLiteral': return 'None';
    case 'ListLiteral': return `[${(node.elements as ASTNode[]).length} items]`;
    case 'ExprStmt': return 'Expresión';
    default: return node.type;
  }
}

function getChildren(node: ASTNode): { label: string; child: ASTNode }[] {
  const c: { label: string; child: ASTNode }[] = [];
  switch (node.type) {
    case 'Program': (node.body as ASTNode[]).forEach((s, i) => c.push({ label: `stmt[${i}]`, child: s })); break;
    case 'FunctionDef': (node.body as ASTNode[]).forEach((s, i) => c.push({ label: `body[${i}]`, child: s })); break;
    case 'If':
      if (node.test) c.push({ label: 'condición', child: node.test as ASTNode });
      (node.consequent as ASTNode[]).forEach((s, i) => c.push({ label: `then[${i}]`, child: s }));
      (node.alternate as ASTNode[]).forEach((s, i) => c.push({ label: `else[${i}]`, child: s }));
      break;
    case 'While':
      if (node.test) c.push({ label: 'condición', child: node.test as ASTNode });
      (node.body as ASTNode[]).forEach((s, i) => c.push({ label: `body[${i}]`, child: s }));
      break;
    case 'For':
      if (node.iter) c.push({ label: 'iterable', child: node.iter as ASTNode });
      (node.body as ASTNode[]).forEach((s, i) => c.push({ label: `body[${i}]`, child: s }));
      break;
    case 'Assign': if (node.value) c.push({ label: 'valor', child: node.value as ASTNode }); break;
    case 'AugAssign': if (node.value) c.push({ label: 'valor', child: node.value as ASTNode }); break;
    case 'Return': if (node.value) c.push({ label: 'valor', child: node.value as ASTNode }); break;
    case 'Print': (node.args as ASTNode[]).forEach((a, i) => c.push({ label: `arg[${i}]`, child: a })); break;
    case 'BinaryOp':
      if (node.left) c.push({ label: 'izq', child: node.left as ASTNode });
      if (node.right) c.push({ label: 'der', child: node.right as ASTNode });
      break;
    case 'UnaryOp': if (node.operand) c.push({ label: 'operando', child: node.operand as ASTNode }); break;
    case 'Call': (node.args as ASTNode[]).forEach((a, i) => c.push({ label: `arg[${i}]`, child: a })); break;
    case 'ExprStmt': if (node.expr) c.push({ label: 'expr', child: node.expr as ASTNode }); break;
    case 'ListLiteral': (node.elements as ASTNode[]).forEach((e, i) => c.push({ label: `[${i}]`, child: e })); break;
  }
  return c;
}

interface TreeNodeProps { node: ASTNode; depth: number; delay: number; isAnimating: boolean; }

function TreeNode({ node, depth, delay, isAnimating }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 3);
  const [visible, setVisible] = useState(!isAnimating);
  const children = getChildren(node);
  const color = getNodeColor(node.type);
  const icon = getNodeIcon(node.type);

  useEffect(() => {
    if (!isAnimating) { setVisible(true); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [isAnimating, delay]);

  if (!visible) return null;

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 16, marginTop: 4, opacity: 0, animation: 'fadeInUp 0.3s ease forwards', animationDelay: `${delay}ms` }}>
      <div
        onClick={() => children.length > 0 && setExpanded(e => !e)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px',
          borderRadius: 8, cursor: children.length > 0 ? 'pointer' : 'default',
          background: `rgba(${color === 'var(--primary)' ? '99,102,241' : '255,255,255'},0.04)`,
          border: `1px solid ${color}30`, transition: 'all 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (children.length > 0) (e.currentTarget as HTMLElement).style.background = `${color}15`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `rgba(255,255,255,0.04)`; }}
      >
        {children.length > 0 && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
        )}
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ color, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-code)' }}>{node.type}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{getNodeLabel(node)}</span>
        {node.line && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>L{node.line as number}</span>}
        {children.length > 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 4 }}>{children.length} hijo{children.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {expanded && children.length > 0 && (
        <div style={{ borderLeft: `1px dashed ${color}40`, marginLeft: 16, paddingLeft: 4, marginTop: 2 }}>
          {children.map(({ label, child }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 2 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 10, paddingTop: 7, minWidth: 50, fontFamily: 'var(--font-code)' }}>{label}</span>
              <TreeNode node={child} depth={depth + 1} delay={delay + i * 50} isAnimating={isAnimating} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParserPhase({ ast, errors, isAnimating }: Props) {
  const [activeTab, setActiveTab] = useState<'tree' | 'rules'>('tree');
  const hasErrors = errors.length > 0;

  const grammarRules = [
    { rule: 'program', expansion: 'statement*', color: 'var(--primary)' },
    { rule: 'statement', expansion: 'assign | if_stmt | while_stmt | for_stmt | func_def | return | print | expr_stmt', color: 'var(--cyan)' },
    { rule: 'assign', expansion: 'IDENTIFIER "=" expression', color: 'var(--green)' },
    { rule: 'if_stmt', expansion: '"if" expression ":" block ("elif" expression ":" block)* ("else" ":" block)?', color: 'var(--yellow)' },
    { rule: 'while_stmt', expansion: '"while" expression ":" block', color: 'var(--yellow)' },
    { rule: 'for_stmt', expansion: '"for" IDENTIFIER "in" expression ":" block', color: 'var(--yellow)' },
    { rule: 'func_def', expansion: '"def" IDENTIFIER "(" params ")" ":" block', color: 'var(--purple)' },
    { rule: 'expression', expansion: 'or_expr', color: 'var(--text-secondary)' },
    { rule: 'or_expr', expansion: 'and_expr ("or" and_expr)*', color: 'var(--text-secondary)' },
    { rule: 'comparison', expansion: 'additive (("==" | "!=" | "<" | ">" | "<=" | ">=") additive)*', color: 'var(--text-secondary)' },
    { rule: 'additive', expansion: 'multiplicative (("+" | "-") multiplicative)*', color: 'var(--text-secondary)' },
    { rule: 'primary', expansion: 'NUMBER | FLOAT | STRING | TRUE | FALSE | IDENTIFIER | call | "(" expr ")"', color: 'var(--text-secondary)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="badge badge-purple">🌳 Análisis Sintáctico</span>
        {hasErrors
          ? <span className="badge badge-red">⚠ {errors.length} error{errors.length !== 1 ? 'es' : ''} sintáctico{errors.length !== 1 ? 's' : ''}</span>
          : ast && <span className="badge badge-green">✓ AST generado correctamente</span>
        }
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'tree' ? 'active' : ''}`} onClick={() => setActiveTab('tree')}>🌳 Árbol AST</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>📐 Gramática BNF</button>
      </div>

      {activeTab === 'tree' && (
        <div className="phase-panel">
          <div className="phase-header">
            <span style={{ fontSize: 16 }}>🌳</span>
            <span style={{ fontWeight: 600, color: 'var(--purple)' }}>Árbol de Sintaxis Abstracta (AST)</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>Click en nodos para expandir/contraer</span>
          </div>
          <div style={{ padding: 20, maxHeight: 500, overflowY: 'auto' }}>
            {ast ? (
              <TreeNode node={ast} depth={0} delay={0} isAnimating={isAnimating} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                {hasErrors ? '❌ No se pudo construir el AST debido a errores' : '⏳ Generando árbol...'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="phase-panel">
          <div className="phase-header">
            <span style={{ fontSize: 16 }}>📐</span>
            <span style={{ fontWeight: 600, color: 'var(--purple)' }}>Reglas Gramaticales (BNF)</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grammarRules.map(({ rule, expansion, color }, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <code style={{ color, fontFamily: 'var(--font-code)', fontSize: 13, fontWeight: 600, minWidth: 110, flexShrink: 0 }}>{rule}</code>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>→</span>
                <code style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-code)', fontSize: 12 }}>{expansion}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {hasErrors && (
        <div>
          <h3 style={{ color: 'var(--red)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>❌ Errores Sintácticos</h3>
          {errors.map((err, i) => (
            <div key={i} className="alert-box alert-error">
              <span style={{ fontSize: 20 }}>🚫</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  Línea {err.line}, Col {err.column}
                </div>
                <div style={{ marginBottom: 6 }}>{err.message}</div>
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
