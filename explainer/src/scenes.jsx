import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, serif, sans, mono } from "./theme";
import { Stage, Card, Kicker, Title, Body, Badge, PlatoMark, Caption, Window, useEnter, rise, sceneOpacity } from "./ui";

const Fade = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <div style={{ position: "absolute", inset: 0, opacity: sceneOpacity(frame, durationInFrames) }}>{children}</div>;
};

const Row = ({ icon, name, sub, right, hi, p = 1, y = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", height: 78, padding: "0 26px", borderBottom: `1px solid ${C.LINE}`, background: hi ? C.SUBTLE : C.WHITE, opacity: p, transform: `translateY(${y}px)` }}>
    <span style={{ width: 42, height: 42, borderRadius: 11, background: C.PAPER, border: `1px solid ${C.LINE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</span>
    <div style={{ marginLeft: 18, flex: 1 }}>
      <div style={{ fontFamily: sans, fontSize: 26, fontWeight: 600, color: C.INK }}>{name}</div>
      {sub && <div style={{ fontFamily: sans, fontSize: 19, color: C.MUTE }}>{sub}</div>}
    </div>
    {right}
  </div>
);

// ── S0 · Title ──────────────────────────────────────────────────────────
export const TitleScene = () => {
  const a = useEnter(4), b = useEnter(16), c = useEnter(30);
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", ...rise(a, 30) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 34 }}>
            <PlatoMark size={54} />
            <span style={{ fontFamily: mono, fontSize: 26, letterSpacing: 5, textTransform: "uppercase", color: C.MUTE }}>Plato</span>
          </div>
          <Title size={118} style={{ ...rise(b, 26) }}>Relevé d’heures</Title>
          <div style={{ ...rise(c, 20), marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <span style={{ width: 60, height: 1, background: C.LINE2 }} />
            <span style={{ fontFamily: sans, fontSize: 32, color: C.MUTE }}>Suivi des heures · Droit social</span>
            <span style={{ width: 60, height: 1, background: C.LINE2 }} />
          </div>
        </div>
      </Stage>
    </Fade>
  );
};

// ── S1 · Context / the problem ──────────────────────────────────────────
export const ContextScene = () => {
  const frame = useCurrentFrame();
  const a = useEnter(4), b = useEnter(18);
  const pieces = ["Contrat de travail", "Bulletins de paie", "Badges d’accès", "E-mails du manager"];
  return (
    <Fade>
      <Stage style={{ justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 90, alignItems: "center" }}>
          <div style={{ width: 820, ...rise(a, 26) }}>
            <Kicker>Le point de départ</Kicker>
            <Title size={72} style={{ marginTop: 22 }}>Reconstituer les heures travaillées</Title>
            <Body size={32} style={{ marginTop: 26, maxWidth: 760 }}>
              Dans un dossier de <b style={{ color: C.INK }}>rappel d’heures supplémentaires</b>, le relevé d’heures
              est la pièce maîtresse — il chiffre la demande et sert de commencement de preuve.
            </Body>
          </div>
          <div style={{ ...rise(b, 26) }}>
            {pieces.map((t, i) => {
              const p = useEnter(24 + i * 8);
              return (
                <div key={t} style={{ width: 420, height: 66, marginBottom: 14, background: C.WHITE, border: `1px solid ${C.LINE}`, borderRadius: 12, display: "flex", alignItems: "center", padding: "0 20px", gap: 14, ...rise(p, 18) }}>
                  <span style={{ width: 34, height: 34, borderRadius: 8, background: C.CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</span>
                  <span style={{ fontFamily: sans, fontSize: 24, color: C.INK2 }}>{t}</span>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 6, opacity: interpolate(frame, [70, 86], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              <div style={{ fontFamily: mono, fontSize: 22, color: C.BLUE }}>↓ un relevé unique</div>
            </div>
          </div>
        </div>
        <Caption>Un relevé, alimenté par les pièces du dossier.</Caption>
      </Stage>
    </Fade>
  );
};

// ── S2 · Chiffrage intrant (lawyer) ─────────────────────────────────────
export const ChiffrageScene = () => {
  const frame = useCurrentFrame();
  const a = useEnter(6);
  const agent = useEnter(46);
  const flip = interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <Kicker style={{ marginBottom: 22 }}>Côté avocat · onglet Chiffrage</Kicker>
        <Window title="Dossier · Chiffrage" w={1160} style={{ ...rise(a, 30) }}>
          <div style={{ padding: "28px 30px 12px" }}>
            <div style={{ fontFamily: mono, fontSize: 18, letterSpacing: 2, textTransform: "uppercase", color: C.MUTE }}>Variables</div>
            <div style={{ fontFamily: serif, fontSize: 34, color: C.INK, marginTop: 6 }}>Fondamentaux et variables du chiffrage</div>
          </div>
          <div style={{ margin: "12px 30px 30px", border: `1px solid ${C.LINE}`, borderRadius: 14, overflow: "hidden" }}>
            <Row icon="💶" name="Salaire de référence" sub="calculé depuis les bulletins" right={<Badge tone="blue">3 500 €</Badge>} />
            <div style={{ position: "relative" }}>
              <Row icon="🕐" name="Relevé d’heures" sub="temps de travail reconstitué" hi
                right={flip < 0.5 ? <Badge tone="cream">À définir</Badge> : <Badge tone="blue">430 H</Badge>} />
              <div style={{ position: "absolute", right: 26, bottom: -2, top: 0, display: "flex", alignItems: "center", opacity: agent * (1 - flip), transform: `translateX(${interpolate(agent, [0, 1], [30, 0])}px)` }}>
                <span style={{ fontFamily: sans, fontSize: 18, fontWeight: 600, color: C.BLUE, background: C.BLUE_BG, border: `1px solid ${C.BLUE_BORDER}`, borderRadius: 999, padding: "6px 14px" }}>✦ proposé par l’agent</span>
              </div>
            </div>
          </div>
        </Window>
        <Caption>L’agent fait apparaître les variables — le relevé passe de « À définir » à sa valeur.</Caption>
      </Stage>
    </Fade>
  );
};

// ── S3 · Define period + share ──────────────────────────────────────────
export const PeriodScene = () => {
  const frame = useCurrentFrame();
  const modal = useEnter(6);
  const share = useEnter(74);
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <Kicker style={{ marginBottom: 26 }}>Commencer → définir la période → partager</Kicker>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* period modal */}
          <Card w={620} style={{ ...rise(modal, 34) }}>
            <div style={{ fontFamily: serif, fontSize: 40, color: C.INK }}>Définir la période</div>
            <div style={{ fontFamily: sans, fontSize: 22, color: C.MUTE, marginTop: 8 }}>Le relevé sera limité à cette période.</div>
            <div style={{ marginTop: 24, background: C.BLUE_BG, border: `1px solid ${C.BLUE_BORDER}`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <div>
                <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 500, color: C.BLUE }}>01/01/25 → 30/06/26</div>
                <div style={{ fontFamily: sans, fontSize: 18, color: "#3a5488" }}>Période repérée par l’agent d’après les pièces</div>
              </div>
              <div style={{ marginLeft: "auto", fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.BLUE }}>Utiliser</div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
              {["Date de début", "Date de fin"].map((l) => (
                <div key={l} style={{ flex: 1 }}>
                  <div style={{ fontFamily: sans, fontSize: 18, fontWeight: 600, color: C.INK, marginBottom: 8 }}>{l}</div>
                  <div style={{ height: 52, border: `1px solid ${C.LINE}`, borderRadius: 10, background: C.WHITE }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26, height: 58, borderRadius: 12, background: C.INK, color: C.WHITE, fontFamily: sans, fontSize: 24, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>Accéder au relevé →</div>
          </Card>
          {/* share popover */}
          <Card w={520} pad={30} style={{ opacity: share, transform: `translateX(${interpolate(share, [0, 1], [40, 0])}px) translateY(20px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PlatoMark size={40} />
              <div style={{ fontFamily: sans, fontSize: 26, fontWeight: 700, color: C.INK }}>Partager au client ↗</div>
            </div>
            <div style={{ fontFamily: sans, fontSize: 21, color: C.MUTE, margin: "14px 0 18px", lineHeight: 1.4 }}>Envoyez le lien et le mot de passe à votre client.</div>
            <div style={{ background: C.SUBTLE, border: `1px solid ${C.LINE}`, borderRadius: 10, padding: "12px 14px", fontFamily: mono, fontSize: 20, color: C.INK2, marginBottom: 10 }}>🔗 norma.law/s/relv-9F3K2D</div>
            <div style={{ background: C.SUBTLE, border: `1px solid ${C.LINE}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: sans, fontSize: 19, color: C.MUTE }}>🔒 Mot de passe</span>
              <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: C.INK2, letterSpacing: 2 }}>7K2-9F3</span>
            </div>
            <div style={{ marginTop: 16, height: 54, borderRadius: 11, background: C.INK, color: C.WHITE, fontFamily: sans, fontSize: 22, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>Copier le lien et le mot de passe</div>
          </Card>
        </div>
        <Caption>La popover de partage s’ouvre — déléguez au client, ou saisissez vous-même.</Caption>
      </Stage>
    </Fade>
  );
};

// ── S4 · Client fills the hours ─────────────────────────────────────────
export const ClientScene = () => {
  const frame = useCurrentFrame();
  const a = useEnter(6);
  const pct = Math.round(interpolate(frame, [40, 140], [12, 74], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const days = [
    { d: "Lundi 6", v: "8 H 45" }, { d: "Mardi 7", v: "10 H 30" }, { d: "Mercredi 8", v: "9 H 30" },
    { d: "Jeudi 9", v: "6 H" }, { d: "Vendredi 10", v: "8 H" }, { d: "Samedi 11", rest: true },
  ];
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <Kicker style={{ marginBottom: 22 }}>Côté client · lien externe sécurisé</Kicker>
        <Window title="norma.law/s/relv-9F3K2D · Espace client" w={1120} style={{ ...rise(a, 30) }}>
          {/* month navigator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "22px 0", borderBottom: `1px solid ${C.LINE}`, background: C.SUBTLE }}>
            <span style={{ width: 46, height: 46, borderRadius: 10, border: `1px solid ${C.LINE}`, background: C.WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: C.MUTE }}>‹</span>
            <span style={{ fontFamily: serif, fontSize: 34, color: C.INK }}>Janvier <span style={{ color: C.MUTE }}>2025 ⌄</span></span>
            <span style={{ width: 46, height: 46, borderRadius: 10, border: `1px solid ${C.LINE}`, background: C.WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: C.MUTE }}>›</span>
          </div>
          {days.map((row, i) => {
            const p = useEnter(20 + i * 7);
            return (
              <Row key={row.d} icon={row.rest ? "☕" : "🕐"} name={row.d}
                sub={row.rest ? "Non travaillé" : undefined}
                p={p} y={interpolate(p, [0, 1], [14, 0])}
                right={row.rest ? <span style={{ fontFamily: sans, fontSize: 20, color: C.MUTE, background: C.WHITE, border: `1px solid ${C.LINE}`, borderRadius: 999, padding: "6px 14px" }}>☕ Non travaillé</span> : <Badge tone="blue">{row.v}</Badge>} />
            );
          })}
          {/* progress */}
          <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 20, background: C.CREAM }}>
            <span style={{ fontFamily: sans, fontSize: 22, fontWeight: 600, color: C.INK }}>Total saisi</span>
            <div style={{ flex: 1, height: 12, borderRadius: 99, background: C.WHITE, overflow: "hidden", border: `1px solid ${C.LINE}` }}>
              <div style={{ width: `${pct}%`, height: "100%", background: C.BLUE, borderRadius: 99 }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 600, color: C.BLUE, width: 70, textAlign: "right" }}>{pct}%</span>
          </div>
        </Window>
        <Caption>Le client remplit mois par mois, suit sa progression — et reprend quand il veut.</Caption>
      </Stage>
    </Fade>
  );
};

// ── S5 · Duplication ────────────────────────────────────────────────────
export const DuplicateScene = () => {
  const a = useEnter(6);
  const modal = useEnter(60);
  const opts = [
    { t: "Le mois suivant", s: "Février 2025", on: true },
    { t: "Tous les mois de la période", s: "jusqu’en juin 2026" },
    { t: "Une période personnalisée", s: "dates au choix" },
  ];
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <Kicker style={{ marginBottom: 24 }}>Reconstituer vite · duplication</Kicker>
        <div style={{ display: "flex", gap: 44, alignItems: "center" }}>
          <div style={{ ...rise(a, 26) }}>
            {[
              ["Un jour", "→ sur le reste de la semaine"],
              ["Une semaine", "→ sur les jours vides du mois"],
              ["Un mois", "→ sur les mois suivants"],
            ].map(([t, s], i) => {
              const p = useEnter(16 + i * 12);
              return (
                <div key={t} style={{ width: 560, height: 92, marginBottom: 16, background: C.WHITE, border: `1px solid ${C.LINE}`, borderRadius: 14, display: "flex", alignItems: "center", padding: "0 24px", gap: 18, ...rise(p, 18) }}>
                  <span style={{ fontFamily: mono, fontSize: 26, color: C.BLUE }}>⧉</span>
                  <div>
                    <div style={{ fontFamily: serif, fontSize: 30, color: C.INK }}>{t}</div>
                    <div style={{ fontFamily: sans, fontSize: 21, color: C.MUTE }}>{s}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Card w={520} style={{ opacity: modal, transform: `translateY(${interpolate(modal, [0, 1], [30, 0])}px)` }}>
            <div style={{ fontFamily: serif, fontSize: 36, color: C.INK, marginBottom: 18 }}>Dupliquer Janvier 2025</div>
            {opts.map((o) => (
              <div key={o.t} style={{ display: "flex", alignItems: "center", gap: 16, border: `1px solid ${o.on ? C.INK : C.LINE}`, background: o.on ? C.SUBTLE : C.WHITE, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${o.on ? C.INK : C.LINE2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{o.on && <span style={{ width: 10, height: 10, borderRadius: 99, background: C.INK }} />}</span>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 23, fontWeight: 600, color: C.INK }}>{o.t}</div>
                  <div style={{ fontFamily: sans, fontSize: 18, color: C.MUTE }}>{o.s}</div>
                </div>
              </div>
            ))}
            <div style={{ fontFamily: sans, fontSize: 19, color: C.MUTE, marginTop: 6 }}>Seuls les jours encore vides sont remplis — vos saisies ne sont jamais écrasées.</div>
          </Card>
        </div>
        <Caption>Dupliquez un jour, une semaine, un mois — sans jamais écraser une saisie.</Caption>
      </Stage>
    </Fade>
  );
};

// ── S6 · Total flows into the chiffrage ─────────────────────────────────
export const TotalScene = () => {
  const frame = useCurrentFrame();
  const a = useEnter(6);
  const flow = interpolate(frame, [44, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = useEnter(70);
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <Kicker style={{ marginBottom: 30 }}>Le relevé alimente le chiffrage</Kicker>
        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          <div style={{ ...rise(a, 26), width: 470, background: C.CREAM, border: `1px solid ${C.LINE}`, borderRadius: 16, padding: "30px 34px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.MUTE, fontFamily: sans, fontSize: 24, fontWeight: 600 }}>🕐 Total heures travaillées</div>
            <div style={{ fontFamily: serif, fontSize: 92, color: C.INK, marginTop: 10, letterSpacing: -2 }}>430 h 30</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 40, color: C.BLUE, opacity: flow, transform: `translateX(${interpolate(flow, [0, 1], [-16, 0])}px)` }}>──▶</div>
          <div style={{ opacity: b, transform: `translateY(${interpolate(b, [0, 1], [24, 0])}px)`, width: 640, background: C.WHITE, border: `1px solid ${C.LINE}`, borderRadius: 16, boxShadow: "0px 14px 34px -14px rgba(26,26,26,0.18)", overflow: "hidden" }}>
            <div style={{ padding: "20px 28px", fontFamily: mono, fontSize: 17, letterSpacing: 2, textTransform: "uppercase", color: C.MUTE, borderBottom: `1px solid ${C.LINE}` }}>Rappel de salaire</div>
            <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, borderBottom: `1px solid ${C.LINE}` }}>
              <span style={{ fontFamily: sans, fontSize: 24, color: C.INK }}>Rappel d’heures supplémentaires</span>
              <span style={{ fontFamily: serif, fontSize: 30, color: C.INK, whiteSpace: "nowrap" }}>48 000 €</span>
            </div>
            <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <span style={{ fontFamily: sans, fontSize: 24, color: C.INK }}>Congés payés afférents</span>
              <span style={{ fontFamily: serif, fontSize: 30, color: C.INK, whiteSpace: "nowrap" }}>4 800 €</span>
            </div>
          </div>
        </div>
        <Caption>Le total des heures nourrit les postes du chiffrage et l’argumentaire.</Caption>
      </Stage>
    </Fade>
  );
};

// ── S7 · Outro ──────────────────────────────────────────────────────────
export const OutroScene = () => {
  const a = useEnter(6), b = useEnter(22);
  return (
    <Fade>
      <Stage style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", ...rise(a, 26) }}>
          <Title size={86}>Un seul relevé, synchronisé.</Title>
          <Body size={34} style={{ marginTop: 24 }}>Avocat et client travaillent sur le même relevé — en temps réel.</Body>
          <div style={{ ...rise(b, 18), marginTop: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <PlatoMark size={48} />
            <span style={{ fontFamily: serif, fontSize: 44, color: C.INK }}>Plato</span>
          </div>
        </div>
      </Stage>
    </Fade>
  );
};
