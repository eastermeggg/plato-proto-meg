import React, { useState, useMemo } from 'react';
import { X, Search, Link as LinkIcon, FileUp, Tag, ChevronRight, Check, Loader2, FolderOpen, Landmark } from 'lucide-react';
import DECISIONS, { formatDateLong, getPrimaryAmount } from '../../data/mockDecisions';

const MODES = [
  { id: 'search', icon: Search,   label: 'Rechercher',     hint: 'Dans Plato JP ou réf. libre' },
  { id: 'link',   icon: LinkIcon, label: 'Coller un lien', hint: 'Légifrance, Doctrine…' },
  { id: 'upload', icon: FileUp,   label: 'Importer un PDF', hint: 'Décision en PDF' },
];

const Checkmark = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function CheckRow({ checked, onClick, icon: Icon, label, sublabel }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-md text-[14px] flex items-center gap-2 transition-colors"
      style={{
        backgroundColor: checked ? '#fdf8f4' : '#fafaf9',
        border: checked ? '1px solid #b9703f' : '1px solid #e7e5e3',
        color: '#44403c',
      }}
    >
      <div
        className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
        style={{ borderColor: checked ? '#b9703f' : '#d6d3d1', backgroundColor: checked ? '#b9703f' : 'white' }}
      >
        {checked && <Checkmark />}
      </div>
      {Icon && <Icon className="w-3.5 h-3.5 text-[#a8a29e] flex-shrink-0" />}
      <span className="font-medium">{label}</span>
      {sublabel && <span className="text-[#a8a29e] ml-0.5 text-[12px]">{sublabel}</span>}
    </button>
  );
}

export default function JPAddStepper({
  onClose,
  onSubmit,
  posteOptions = [],
  defaultPosteId = null,
}) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null); // 'search' | 'link' | 'upload'

  // Step 1 inputs (per-mode)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSelectedId, setSearchSelectedId] = useState(null);
  const [url, setUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [matchedCanonical, setMatchedCanonical] = useState(null);

  // Step 2 — Portée
  const [pinTransverse, setPinTransverse] = useState(true);
  const [pinPosteIds, setPinPosteIds] = useState(defaultPosteId ? [defaultPosteId] : []);

  // ── Search filter ────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return DECISIONS.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return DECISIONS.filter(d =>
      (d.jurisdiction || '').toLowerCase().includes(q) ||
      (d.numero || '').toLowerCase().includes(q) ||
      (d.category || '').toLowerCase().includes(q) ||
      d.amounts.some(a => a.poste.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQuery]);

  // Resolve canonical/orphan from step-1 inputs (used both by "Suivant" → step 2
  // in matter context and by the direct submit in user context).
  // Search mode handles both "pick from results" (canonical) and "type a free
  // reference" (fuzzy match → canonical or orphan customJP).
  const resolveCanonical = () => {
    if (mode === 'search') {
      if (searchSelectedId) return Promise.resolve({ canonicalId: searchSelectedId });
      const q = searchQuery.trim();
      if (!q) return Promise.resolve({ canonicalId: null });
      const lower = q.toLowerCase();
      const match = DECISIONS.find(d =>
        (d.jurisdiction && lower.includes(d.jurisdiction.toLowerCase())) ||
        (d.numero && lower.includes(d.numero.toLowerCase().slice(0, 8)))
      );
      return Promise.resolve({ canonicalId: match ? match.id : null });
    }
    if ((mode === 'link' && url.trim()) || (mode === 'upload' && pdfFile)) {
      setExtracting(true);
      return new Promise(resolve => {
        setTimeout(() => {
          const sample = DECISIONS[Math.floor(Math.random() * DECISIONS.length)];
          setMatchedCanonical(sample.id);
          setExtracting(false);
          resolve({ canonicalId: sample.id });
        }, 1500);
      });
    }
    return Promise.resolve({ canonicalId: null });
  };

  const togglePoste = (pid) => {
    setPinPosteIds(prev => prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]);
  };

  const canProceed1 =
    (mode === 'search' && (!!searchSelectedId || searchQuery.trim().length > 0)) ||
    (mode === 'link' && url.trim().length > 0) ||
    (mode === 'upload' && !!pdfFile);

  const canProceed2 = pinTransverse || pinPosteIds.length > 0;

  const submitWith = (canonicalId) => {
    onSubmit?.({
      mode,
      canonicalId,
      // When search mode has no canonical match, the typed text is the orphan
      // reference for a customJP entity.
      reference: mode === 'search' && !canonicalId ? searchQuery : null,
      url: mode === 'link' ? url : null,
      pdfFileName: mode === 'upload' && pdfFile ? pdfFile.name : null,
      attachments: { matterTransverse: pinTransverse, posteIds: pinPosteIds },
    });
    onClose?.();
  };

  // Step 1 → Next
  const handleStep1Action = async () => {
    const { canonicalId } = await resolveCanonical();
    setMatchedCanonical(canonicalId);
    setStep(2);
  };

  const handleStep2Submit = () => {
    submitWith(matchedCanonical);
  };

  const steps = [
    { num: 1, label: 'Source', icon: LinkIcon },
    { num: 2, label: 'Portée', icon: Tag },
  ];

  const headerSubtitle = 'Ajouter une décision';

  return (
    <div className="w-full">
      <div
        className="bg-white rounded-lg border border-[#e7e5e3] overflow-hidden"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0efed]" style={{ backgroundColor: '#fafaf9' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase' }}>
            {headerSubtitle}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-[#eeece6] rounded transition-colors">
            <X className="w-3.5 h-3.5 text-[#a8a29e]" />
          </button>
        </div>

        {/* Step indicators (hidden when only one step) */}
        {steps.length > 1 && (
          <div className="flex items-center gap-0 px-4 py-2.5 border-b border-[#f0efed]">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <React.Fragment key={s.num}>
                  {i > 0 && <div className="w-6 h-px mx-1" style={{ backgroundColor: isDone ? '#b9703f' : '#e7e5e3' }} />}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isDone ? '#b9703f' : isActive ? '#292524' : '#eeece6' }}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                      ) : (
                        <StepIcon className="w-2.5 h-2.5" style={{ color: isActive ? 'white' : '#a8a29e' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 500 : 400, color: isActive ? '#292524' : isDone ? '#b9703f' : '#a8a29e' }}>
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Step content */}
        <div className="px-4 py-4" style={{ minHeight: 220 }}>
          {/* ── Step 1 ────────────────────────────────────────────── */}
          {step === 1 && !extracting && (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {MODES.map(m => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setSearchSelectedId(null); }}
                      className="flex items-start gap-2 px-3 py-2.5 rounded-md text-left transition-all"
                      style={{
                        backgroundColor: active ? '#fdf8f4' : '#fafaf9',
                        border: active ? '1px solid #b9703f' : '1px solid #e7e5e3',
                      }}
                    >
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: active ? '#b9703f' : '#78716c' }} strokeWidth={1.75} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium leading-4" style={{ color: '#292524' }}>{m.label}</div>
                        <div className="text-[12px] leading-4 mt-0.5" style={{ color: '#a8a29e' }}>{m.hint}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {mode === 'search' && (
                <div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSearchSelectedId(null); }}
                    placeholder="Juridiction, numéro, poste — ou référence libre…"
                    className="w-full px-3 py-2 text-[14px] rounded-md border border-[#e7e5e3] bg-white text-[#292524] placeholder-[#a8a29e] focus:outline-none focus:border-[#aabcd5]"
                  />
                  {searchQuery.trim() && searchResults.length === 0 && (
                    <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 6 }}>
                      Pas de correspondance dans Plato JP. Cette référence sera ajoutée comme citation libre.
                    </p>
                  )}
                  <div className="mt-2 max-h-[180px] overflow-y-auto space-y-1">
                    {searchResults.map(d => {
                      const isSel = d.id === searchSelectedId;
                      const amt = getPrimaryAmount(d);
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSearchSelectedId(d.id)}
                          className="w-full text-left px-2.5 py-2 rounded transition-colors"
                          style={{
                            backgroundColor: isSel ? '#fdf8f4' : 'transparent',
                            border: isSel ? '1px solid #b9703f' : '1px solid transparent',
                          }}
                          onMouseOver={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = '#fafaf9'; }}
                          onMouseOut={(e) => { if (!isSel) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <Landmark className="w-3 h-3 text-[#b9703f]" />
                            <span className="text-[14px] font-medium" style={{ color: '#292524' }}>
                              {d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}
                            </span>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#c8c5c0' }}>
                              {formatDateLong(d.date)}
                            </span>
                            {amt && <span className="badge badge-sm badge-secondary">{amt.poste}</span>}
                          </div>
                          <div className="text-[12px] mt-0.5 truncate" style={{ color: '#a8a29e' }}>
                            {d.numero} · {d.category}
                          </div>
                        </button>
                      );
                    })}
                    {searchResults.length === 0 && (
                      <p className="text-[12px] text-[#a8a29e] text-center py-3">Aucun résultat.</p>
                    )}
                  </div>
                </div>
              )}

              {mode === 'link' && (
                <div>
                  <label htmlFor="jp-add-url" style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 6 }}>
                    URL Légifrance ou autre source
                  </label>
                  <input
                    id="jp-add-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.legifrance.gouv.fr/juri/id/..."
                    className="w-full px-3 py-2 text-[14px] rounded-md border border-[#e7e5e3] bg-white text-[#292524] placeholder-[#a8a29e] focus:outline-none focus:border-[#aabcd5]"
                  />
                  <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 6 }}>
                    Les métadonnées seront extraites automatiquement.
                  </p>
                </div>
              )}

              {mode === 'upload' && (
                <div>
                  <label htmlFor="jp-add-pdf" style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 6 }}>
                    Décision au format PDF
                  </label>
                  <label
                    className="flex items-center justify-center gap-2 w-full h-16 rounded-md border border-dashed cursor-pointer transition-colors"
                    style={{ borderColor: pdfFile ? '#b9703f' : '#e7e5e3', backgroundColor: pdfFile ? '#fdf8f4' : '#fafaf9' }}
                  >
                    <FileUp className="w-4 h-4" style={{ color: pdfFile ? '#b9703f' : '#78716c' }} />
                    <span className="text-[14px]" style={{ color: pdfFile ? '#b9703f' : '#78716c' }}>
                      {pdfFile ? pdfFile.name : 'Sélectionner un PDF'}
                    </span>
                    <input
                      id="jp-add-pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {step === 1 && extracting && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-[#b9703f] animate-spin" />
              <span className="text-[14px] text-[#78716c] mt-3">Extraction des métadonnées…</span>
            </div>
          )}

          {/* ── Step 2 — Portée ─────────────────────── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 6 }}>
                Où dans ce dossier ?
              </div>
              <div className="space-y-1.5">
                <CheckRow
                  checked={pinTransverse}
                  onClick={() => setPinTransverse(v => !v)}
                  icon={FolderOpen}
                  label="Dossier"
                  sublabel="(transverse)"
                />
                {posteOptions.length > 0 && (
                  <div
                    className="space-y-1 max-h-[200px] overflow-y-auto rounded-md p-1.5"
                    style={{ border: '1px solid #f0efed', backgroundColor: '#fafaf9' }}
                  >
                    {posteOptions.map(p => {
                      const isChecked = pinPosteIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePoste(p.id)}
                          className="w-full text-left px-2 py-1.5 rounded text-[12px] flex items-center gap-2 transition-colors"
                          style={{ backgroundColor: isChecked ? 'white' : 'transparent' }}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: isChecked ? '#b9703f' : '#d6d3d1', backgroundColor: isChecked ? '#b9703f' : 'white' }}
                          >
                            {isChecked && <Checkmark />}
                          </div>
                          <span className="badge badge-sm badge-secondary">{p.acronym}</span>
                          <span className="text-[#78716c] truncate">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0efed]">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose?.()}
            disabled={extracting}
            className="text-[14px] text-[#78716c] hover:text-[#292524] transition-colors disabled:opacity-50"
          >
            {step > 1 ? '← Retour' : 'Annuler'}
          </button>

          {step === 1 && (
            <button
              onClick={handleStep1Action}
              disabled={!canProceed1 || extracting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium transition-all"
              style={{
                backgroundColor: canProceed1 && !extracting ? '#292524' : '#eeece6',
                color: canProceed1 && !extracting ? 'white' : '#a8a29e',
                cursor: canProceed1 && !extracting ? 'pointer' : 'not-allowed',
              }}
            >
              Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleStep2Submit}
              disabled={!canProceed2}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium transition-all"
              style={{
                backgroundColor: canProceed2 ? '#292524' : '#eeece6',
                color: canProceed2 ? 'white' : '#a8a29e',
                cursor: canProceed2 ? 'pointer' : 'not-allowed',
              }}
            >
              <Check className="w-3.5 h-3.5" />
              Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
