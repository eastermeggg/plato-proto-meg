import React from 'react';

// Icon + label rows for a plan features array ({ icon, label, hint }).
// Shared by settings ("Mon usage" INCLUS DANS VOTRE LICENCE, "Plan et
// facturation" INCLUS DANS CHAQUE LICENCE) and the onboarding flow.
//   dense  - tighter rows (13px / gap-3), used on the per-user "Mon usage" view.
//   subtle - lighter border/dividers (/60), matching the "Mon usage" card.
export default function PlanFeatureList({ features, dense = false, subtle = false }) {
  return (
    <div className={`bg-white rounded-lg overflow-hidden ${subtle ? 'border border-border/60 divide-y divide-border/60' : 'border border-border divide-y divide-border'}`}>
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div key={i} className={`flex items-center px-5 py-3.5 ${dense ? 'gap-3' : 'gap-4'}`}>
            <Icon className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.5} />
            <span className={`${dense ? 'text-[13px]' : 'text-[14px]'} text-foreground font-medium`}>{f.label}</span>
            {f.hint && <span className="text-[12px] text-foreground-muted">({f.hint})</span>}
          </div>
        );
      })}
    </div>
  );
}
