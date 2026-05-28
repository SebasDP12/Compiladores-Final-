import React from 'react';
import { Handle, Position } from '@xyflow/react';

const nodeStyle = {
  padding: '10px 15px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  fontFamily: 'var(--font-ui)',
  minWidth: '120px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  padding: '4px 8px',
  borderRadius: '4px',
  marginTop: '5px',
  fontFamily: 'monospace',
  fontSize: '12px',
};

const DiamondBg = ({ color }: { color: string }) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
    <polygon points="50,2 98,50 50,98 2,50" fill="var(--bg-surface)" stroke={color} strokeWidth="2" />
  </svg>
);

const ParallelogramBg = ({ color }: { color: string }) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
    <polygon points="15,2 98,2 85,98 2,98" fill="var(--bg-surface)" stroke={color} strokeWidth="2" />
  </svg>
);

export const StartNode = ({ data }: any) => (
  <div style={{ ...nodeStyle, background: 'var(--green)', color: '#000', fontWeight: 'bold', textAlign: 'center', borderRadius: '50px', padding: '10px 30px' }}>
    Inicio
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const EndNode = ({ data }: any) => (
  <div style={{ ...nodeStyle, background: 'var(--red, #ef4444)', color: '#fff', fontWeight: 'bold', textAlign: 'center', borderRadius: '50px', padding: '10px 30px' }}>
    <Handle type="target" position={Position.Top} />
    Fin
  </div>
);

export const AssignNode = ({ data, id }: any) => {
  return (
    <div style={{ ...nodeStyle, borderRadius: '4px' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ marginBottom: 4, fontWeight: 'bold', color: 'var(--cyan)' }}>Proceso (Assign)</div>
      <input 
        style={inputStyle} 
        value={data.variable || ''} 
        onChange={(e) => data.onChange(id, 'variable', e.target.value)} 
        placeholder="var (e.g. x)" 
      />
      <div style={{ textAlign: 'center', margin: '2px 0' }}>=</div>
      <input 
        style={inputStyle} 
        value={data.value || ''} 
        onChange={(e) => data.onChange(id, 'value', e.target.value)} 
        placeholder="value (e.g. 5 or x+1)" 
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const PrintNode = ({ data, id }: any) => (
  <div style={{ position: 'relative', width: '160px', padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ParallelogramBg color="var(--border)" />
    <Handle type="target" position={Position.Top} />
    <div style={{ marginBottom: 4, fontWeight: 'bold', color: 'var(--purple)' }}>E/S (Print)</div>
    <input 
      style={{ ...inputStyle, width: '100%' }} 
      value={data.message || ''} 
      onChange={(e) => data.onChange(id, 'message', e.target.value)} 
      placeholder="expr (e.g. x)" 
    />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const IfNode = ({ data, id }: any) => (
  <div style={{ position: 'relative', width: '160px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="target" position={Position.Top} />
    <DiamondBg color="var(--primary)" />
    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100px' }}>
      <div style={{ marginBottom: 4, fontWeight: 'bold', color: 'var(--primary)' }}>Decisión (If)</div>
      <input 
        style={{ ...inputStyle, textAlign: 'center' }} 
        value={data.condition || ''} 
        onChange={(e) => data.onChange(id, 'condition', e.target.value)} 
        placeholder="cond" 
      />
    </div>
    <div style={{ position: 'absolute', bottom: 15, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 30px', fontSize: 10, color: 'var(--text-secondary)', boxSizing: 'border-box' }}>
      <span>V</span>
      <span>F</span>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: '35%', bottom: -5 }} />
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: '65%', bottom: -5 }} />
  </div>
);

export const WhileNode = ({ data, id }: any) => (
  <div style={{ position: 'relative', width: '160px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="target" position={Position.Top} />
    <DiamondBg color="#eab308" />
    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100px' }}>
      <div style={{ marginBottom: 4, fontWeight: 'bold', color: '#eab308' }}>Decisión (While)</div>
      <input 
        style={{ ...inputStyle, textAlign: 'center' }} 
        value={data.condition || ''} 
        onChange={(e) => data.onChange(id, 'condition', e.target.value)} 
        placeholder="cond" 
      />
    </div>
    <div style={{ position: 'absolute', bottom: 15, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 20px', fontSize: 10, color: 'var(--text-secondary)', boxSizing: 'border-box' }}>
      <span>Cuerpo</span>
      <span>Fin</span>
    </div>
    <Handle type="source" position={Position.Bottom} id="body" style={{ left: '30%', bottom: -5 }} />
    <Handle type="source" position={Position.Bottom} id="done" style={{ left: '70%', bottom: -5 }} />
  </div>
);

export const InputNode = ({ data, id }: any) => (
  <div style={{ position: 'relative', width: '160px', padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ParallelogramBg color="var(--cyan)" />
    <Handle type="target" position={Position.Top} />
    <div style={{ marginBottom: 4, fontWeight: 'bold', color: 'var(--cyan)' }}>E/S (Input)</div>
    <input 
      style={{ ...inputStyle, width: '100%', marginBottom: 4 }} 
      value={data.variable || ''} 
      onChange={(e) => data.onChange(id, 'variable', e.target.value)} 
      placeholder="var (e.g. x)" 
    />
    <input 
      style={{ ...inputStyle, width: '100%' }} 
      value={data.prompt || ''} 
      onChange={(e) => data.onChange(id, 'prompt', e.target.value)} 
      placeholder="prompt" 
    />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  assign: AssignNode,
  print: PrintNode,
  input: InputNode,
  if: IfNode,
  while: WhileNode,
};
