import React from 'react';
import { X } from 'lucide-react';
import { REDACTION_ACT_TYPES } from '../../data/redactionScenarios';

export default function RedactionStepper({ onClose, onSelectType }) {
  return (
    <div className="w-full" style={{ paddingRight: 16 }}>
      <div
        className="bg-white rounded-lg border border-[#e7e5e3] overflow-hidden"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0efed]" style={{ backgroundColor: '#fafaf9' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase' }}>
            Rédaction d'acte
          </span>
          <button onClick={onClose} className="p-1 hover:bg-[#eeece6] rounded transition-colors">
            <X className="w-3.5 h-3.5 text-[#a8a29e]" />
          </button>
        </div>

        {/* Type grid */}
        <div className="px-4 py-4">
          <div style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 8 }}>
            Quel type d'acte souhaitez-vous rédiger ?
          </div>
          <div className="grid grid-cols-2 gap-2">
            {REDACTION_ACT_TYPES.map(t => {
              const Icon = t.Icon;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectType?.(t.id)}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-[#fafaf9]"
                  style={{ border: '1px solid #e7e5e3' }}
                >
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#78716c' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#78716c', marginTop: 1, lineHeight: '14px' }}>{t.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center px-4 py-3 border-t border-[#f0efed]">
          <button
            onClick={onClose}
            className="text-[14px] text-[#78716c] hover:text-[#292524] transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
