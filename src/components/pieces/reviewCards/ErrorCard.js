import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { CardShell, CardIcon, CardLabel, btnLight } from './CardShell';

// Processing-error card — analysis failed for a document → Réessayer / Ignorer.
export default function ErrorCard({ name, onRetry, onIgnore }) {
  return (
    <CardShell>
      <CardIcon bg="#fdecec" color="#c0392b"><AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} /></CardIcon>
      <CardLabel name={name} state="Échec de l'analyse" />
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onRetry} className={btnLight}><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />Réessayer</button>
        <button onClick={onIgnore} className={btnLight}>Ignorer</button>
      </div>
    </CardShell>
  );
}
