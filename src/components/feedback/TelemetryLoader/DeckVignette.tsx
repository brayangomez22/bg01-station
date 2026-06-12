import styles from './TelemetryLoader.module.css';

/**
 * Crew scenes for the telemetry loader: one large blueprint astronaut per
 * destination deck, caught preparing the module (studying in the Archive,
 * logging in the Bitácora…). Same linework family as the EvaScan hero.
 * Pure decoration — always aria-hidden.
 *
 * Suit construction kit: <Tube> draws outlined limbs (outline pass + dark
 * core pass), <Helmet>/<Torso>/<Pack> assemble the suit, props use the
 * shared .shell/.panel/.detail ink classes.
 */
export function DeckVignette({ deckIndex }: { deckIndex: number }) {
  return (
    <svg
      className={styles.vignette}
      viewBox="0 0 340 300"
      aria-hidden="true"
      focusable="false"
    >
      <Frame />
      {VIGNETTES[deckIndex] ?? VIGNETTES[0]}
    </svg>
  );
}

/* ---- Suit construction kit -------------------------------------------- */

/** Outlined tube limb: outline stroke under a dark core stroke.
    stroke-width comes via attribute on purpose — the classes must not set
    it, or the cascade would flatten every limb to one width. */
function Tube({ d, w = 11 }: { d: string; w?: number }) {
  return (
    <>
      <path className={styles.tubeOut} d={d} strokeWidth={w} />
      <path className={styles.tubeIn} d={d} strokeWidth={w - 4} />
    </>
  );
}

function Glove({ x, y, r = 6.5 }: { x: number; y: number; r?: number }) {
  return <circle className={styles.pad} cx={x} cy={y} r={r} />;
}

function Boot({ x, y }: { x: number; y: number }) {
  return <rect className={styles.pad} x={x} y={y} width={22} height={10} rx={4.5} />;
}

function Helmet({
  cx,
  cy,
  r = 19,
  look = 1,
  tilt = 0,
}: {
  cx: number;
  cy: number;
  r?: number;
  /** 1 faces right, -1 faces left, 0 frontal. */
  look?: number;
  tilt?: number;
}) {
  return (
    <g transform={tilt ? `rotate(${tilt} ${cx} ${cy})` : undefined}>
      <circle className={styles.shell} cx={cx} cy={cy} r={r} />
      <ellipse
        className={styles.visor}
        cx={cx + look * r * 0.24}
        cy={cy + 1}
        rx={r * 0.6}
        ry={r * 0.66}
      />
      <path
        className={styles.detail}
        d={`M ${cx - 5 + look * 4} ${cy - 6} q 4 -3 9 -1`}
      />
      <line
        className={styles.shellLine}
        x1={cx - r * 0.5}
        y1={cy + r * 0.96}
        x2={cx + r * 0.5}
        y2={cy + r * 0.96}
      />
    </g>
  );
}

function Torso({
  x,
  y,
  w = 46,
  h = 56,
  lean = 0,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  lean?: number;
}) {
  const cx = x + w / 2;
  return (
    <g transform={lean ? `rotate(${lean} ${cx} ${y + h})` : undefined}>
      <rect className={styles.shell} x={x} y={y} width={w} height={h} rx={13} />
      <circle className={styles.joint} cx={x + 8} cy={y + 10} r={5} />
      <circle className={styles.joint} cx={x + w - 8} cy={y + 10} r={5} />
      <rect className={styles.panel} x={cx - 10} y={y + 16} width={20} height={13} rx={2} />
      <circle className={styles.dot} cx={cx - 4.5} cy={y + 22.5} r={1.7} />
      <circle className={styles.dotWarn} cx={cx + 4.5} cy={y + 22.5} r={1.7} />
      <line className={styles.shellLine} x1={x + 5} y1={y + h - 15} x2={x + w - 5} y2={y + h - 15} />
    </g>
  );
}

function Pack({ x, y, w = 18, h = 38 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect className={styles.shell} x={x} y={y} width={w} height={h} rx={5} />
      <line className={styles.shellLine} x1={x + 3} y1={y + 10} x2={x + w - 3} y2={y + 10} />
      <line className={styles.shellLine} x1={x + 3} y1={y + 18} x2={x + w - 3} y2={y + 18} />
    </g>
  );
}

/* ---- Scene dressing ----------------------------------------------------- */

function Frame() {
  return (
    <g>
      <path className={styles.frameLine} d="M 10 24 L 10 10 L 24 10" />
      <path className={styles.frameLine} d="M 316 10 L 330 10 L 330 24" />
      <path className={styles.frameLine} d="M 10 276 L 10 290 L 24 290" />
      <path className={styles.frameLine} d="M 330 276 L 330 290 L 316 290" />
    </g>
  );
}

function Stamp({ text }: { text: string }) {
  return (
    <text className={styles.stamp} x="306" y="288" textAnchor="end">
      {text}
    </text>
  );
}

function Spark({ x, y, s = 4, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <path
      className={styles.sparkle}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      d={`M ${x - s} ${y} L ${x + s} ${y} M ${x} ${y - s} L ${x} ${y + s}`}
    />
  );
}

function Star({ x, y, r = 1.4 }: { x: number; y: number; r?: number }) {
  return <circle className={styles.star} cx={x} cy={y} r={r} />;
}

/* ---- The seven scenes --------------------------------------------------- */

const VIGNETTES: Record<number, React.JSX.Element> = {
  /* 00 PUENTE — standing watch at the command console */
  0: (
    <g>
      <Star x={62} y={56} />
      <Star x={170} y={36} r={1.1} />
      <Spark x={48} y={104} s={3} delay={400} />
      {/* Console wall with orbit plot */}
      <path className={styles.shell} d="M 212 84 L 314 64 L 314 196 L 212 208 Z" />
      <path className={styles.panel} d="M 224 96 L 302 80 L 302 154 L 224 166 Z" />
      <circle className={styles.detail} cx="262" cy="124" r="22" fill="none" />
      <ellipse
        className={styles.tether}
        cx="262"
        cy="124"
        rx="30"
        ry="10"
        transform="rotate(-16 262 124)"
      />
      <circle className={styles.dot} cx="284" cy="114" r="2" />
      <line className={styles.detail} x1="228" y1="178" x2="270" y2="172" />
      <line className={styles.detail} x1="228" y1="186" x2="254" y2="182" />
      {/* Crew member */}
      <Pack x={78} y={116} />
      <Torso x={96} y={108} />
      <Helmet cx={126} cy={90} look={1} />
      <Tube d="M 138 126 Q 172 134 202 141" />
      <Glove x={205} y={142} />
      <Tube d="M 106 132 Q 96 158 102 176" />
      <Glove x={103} y={178} />
      <Tube d="M 112 164 L 108 246" />
      <Tube d="M 128 164 L 132 246" />
      <Boot x={94} y={245} />
      <Boot x={122} y={245} />
      <line className={styles.floor} x1="36" y1="254" x2="312" y2="254" />
      <Stamp text="OPS · PUESTO DE MANDO" />
    </g>
  ),

  /* 01 PILOTO — welcoming salute, service record floating alongside */
  1: (
    <g>
      <Star x={66} y={66} />
      <Star x={262} y={210} r={1.1} />
      <Spark x={246} y={58} s={3.5} delay={300} />
      {/* Floating service card */}
      <rect className={styles.panel} x={214} y={120} width={48} height={32} rx={3} />
      <circle className={styles.detail} cx="226" cy="133" r="5" fill="none" />
      <line className={styles.detail} x1="236" y1="129" x2="254" y2="129" />
      <line className={styles.detail} x1="236" y1="137" x2="248" y2="137" />
      <line className={styles.shellLine} x1="220" y1="145" x2="254" y2="145" />
      {/* Crew member, frontal */}
      <Torso x={104} y={118} w={48} h={58} />
      <Helmet cx={128} cy={98} r={18} look={0} />
      <Tube d="M 150 134 Q 178 124 188 96" />
      <Glove x={189} y={93} />
      <path className={styles.detail} d="M 198 86 a 10 10 0 0 1 -4 10" />
      <path className={styles.detail} d="M 206 80 a 16 16 0 0 1 -6 15" />
      <Tube d="M 106 138 Q 92 156 98 172" />
      <Glove x={99} y={174} />
      <Tube d="M 116 176 L 112 252" />
      <Tube d="M 140 176 L 144 252" />
      <Boot x={98} y={250} />
      <Boot x={136} y={250} />
      <line className={styles.floor} x1="40" y1="260" x2="300" y2="260" />
      <Stamp text="CREW · SALUDO DE BIENVENIDA" />
    </g>
  ),

  /* 02 SISTEMAS — core diagnostics on an open service panel */
  2: (
    <g>
      <Star x={64} y={52} />
      <Spark x={196} y={56} s={3} delay={250} />
      <Spark x={172} y={84} s={2.2} delay={700} />
      {/* Service bay with exposed conduit */}
      <rect className={styles.shell} x={218} y={84} width={78} height={106} rx={4} />
      <path className={styles.detail} d="M 230 98 q 16 14 6 32 q -9 17 8 32" />
      <path className={styles.detail} d="M 248 98 q 14 18 4 38 q -8 16 10 30" />
      <circle className={styles.joint} cx={278} cy={108} r={5} />
      <circle className={styles.joint} cx={278} cy={166} r={5} />
      {/* Hazard ticks along the hatch lip */}
      <path className={styles.shellLine} d="M 218 92 l -8 8 M 218 110 l -8 8 M 218 128 l -8 8 M 218 146 l -8 8 M 218 164 l -8 8" />
      {/* Floating gear */}
      <circle className={styles.shell} cx={196} cy={40} r={9} />
      <circle className={styles.detail} cx={196} cy={40} r={3} fill="none" />
      <path className={styles.shellLine} d="M 196 28 v -5 M 196 52 v 5 M 184 40 h -5 M 208 40 h 5 M 188 32 l -4 -4 M 204 48 l 4 4 M 204 32 l 4 -4 M 188 48 l -4 4" />
      {/* Crew member crouched at the bay */}
      <Pack x={74} y={142} />
      <Torso x={92} y={134} w={44} h={50} lean={10} />
      <Helmet cx={120} cy={118} look={1} tilt={8} />
      <Tube d="M 130 150 Q 172 150 218 136" />
      <Glove x={219} y={135} />
      <path className={styles.shell} d="M 226 128 a 6 6 0 1 0 9 6" fill="none" />
      <line className={styles.shellLine} x1="221" y1="134" x2="229" y2="129" />
      <Tube d="M 102 158 Q 100 176 112 186" />
      <Glove x={113} y={187} />
      <Tube d="M 104 182 Q 120 194 134 202" />
      <Tube d="M 134 202 L 132 240" />
      <Boot x={120} y={238} />
      <Tube d="M 98 184 L 92 232" />
      <Tube d="M 92 232 L 84 240" w={10} />
      <Boot x={70} y={238} />
      <line className={styles.floor} x1="36" y1="248" x2="310" y2="248" />
      <Stamp text="MNT · DIAGNÓSTICO DE NÚCLEO" />
    </g>
  ),

  /* 03 MISIONES — zero-g cargo maneuver, tethered to the station */
  3: (
    <g>
      <Star x={60} y={210} />
      <Star x={300} y={50} r={1.1} />
      <Spark x={296} y={216} s={3} delay={500} />
      <path className={styles.tether} d="M 88 116 Q 44 80 30 26" />
      {/* Cargo crate */}
      <rect className={styles.shell} x={214} y={98} width={78} height={78} rx={3} />
      <path className={styles.detail} d="M 214 98 L 292 176 M 292 98 L 214 176" />
      <line className={styles.shellLine} x1="214" y1="120" x2="292" y2="120" />
      <line className={styles.shellLine} x1="214" y1="154" x2="292" y2="154" />
      {/* Crew member, drifting into the push */}
      <g transform="rotate(-14 160 150)">
        <Pack x={84} y={118} />
        <Torso x={102} y={110} w={46} h={54} />
        <Helmet cx={132} cy={92} look={1} tilt={4} />
        <Tube d="M 142 126 Q 178 122 206 122" />
        <Glove x={209} y={122} />
        <Tube d="M 140 144 Q 178 148 206 148" />
        <Glove x={209} y={148} />
        <Tube d="M 112 164 Q 96 196 78 212" />
        <Glove x={76} y={214} r={5.5} />
        <Tube d="M 128 164 Q 122 198 110 222" />
        <Glove x={108} y={224} r={5.5} />
      </g>
      {/* Cold-gas puffs behind the trailing boots */}
      <path className={styles.detail} d="M 56 232 h 8 M 44 240 h 6 M 66 244 h 5" />
      <Stamp text="EVA · MANIOBRA DE CARGA" />
    </g>
  ),

  /* 04 BITÁCORA — floating free, logging the day's entry */
  4: (
    <g>
      {/* Timeline rail, echoing the logbook page */}
      <line className={styles.tether} x1="58" y1="44" x2="58" y2="258" />
      <circle className={styles.joint} cx={58} cy={84} r={5} />
      <circle className={styles.joint} cx={58} cy={150} r={5} />
      <circle className={styles.dot} cx={58} cy={150} r={1.8} />
      <circle className={styles.joint} cx={58} cy={216} r={5} />
      <Star x={282} y={64} />
      <Spark x={262} y={196} s={3} delay={350} />
      {/* Drifting loose page */}
      <g transform="rotate(14 244 84)">
        <rect className={styles.panel} x={232} y={70} width={26} height={32} rx={2} />
        <line className={styles.detail} x1="237" y1="78" x2="253" y2="78" />
        <line className={styles.detail} x1="237" y1="85" x2="253" y2="85" />
        <line className={styles.detail} x1="237" y1="92" x2="247" y2="92" />
      </g>
      {/* Crew member, knees up, slate on the lap */}
      <Pack x={202} y={118} />
      <Torso x={158} y={110} lean={-6} />
      <Helmet cx={172} cy={92} look={-1} tilt={-8} />
      <Tube d="M 172 162 Q 152 160 136 150" />
      <Tube d="M 136 150 Q 134 176 140 194" />
      <Glove x={141} y={196} r={5.5} />
      <Tube d="M 178 166 Q 160 168 146 160" />
      <Tube d="M 146 160 Q 144 186 150 202" />
      <Glove x={151} y={204} r={5.5} />
      {/* Slate */}
      <g transform="rotate(16 142 140)">
        <rect className={styles.panel} x={118} y={126} width={46} height={30} rx={2} />
        <line className={styles.detail} x1="125" y1="134" x2="156" y2="134" />
        <line className={styles.detail} x1="125" y1="141" x2="156" y2="141" />
        <line className={styles.detail} x1="125" y1="148" x2="144" y2="148" />
      </g>
      <Tube d="M 164 124 Q 152 134 144 139" />
      <Glove x={143} y={140} />
      <line className={styles.detail} x1="140" y1="143" x2="132" y2="152" />
      <Spark x={129} y={156} s={2.4} delay={150} />
      <Tube d="M 198 130 Q 190 148 174 154" />
      <Glove x={173} y={155} />
      <Stamp text="LOG · ENTRADA DE BITÁCORA" />
    </g>
  ),

  /* 05 COMMS — raising the uplink mast */
  5: (
    <g>
      <Star x={70} y={64} />
      <Star x={120} y={40} r={1.1} />
      {/* Mast, dish and guy wire */}
      <line className={styles.mast} x1="232" y1="62" x2="232" y2="230" />
      <path className={styles.shell} d="M 210 64 q 20 -34 52 -14" fill="none" />
      <line className={styles.shellLine} x1="232" y1="62" x2="236" y2="44" />
      <circle className={styles.dot} cx={237} cy={42} r={2} />
      <path className={styles.tether} d="M 232 124 Q 264 176 290 228" />
      {/* Expanding uplink */}
      <path className={`${styles.detail} ${styles.pulse}`} d="M 270 44 a 12 12 0 0 1 -4 11" />
      <path
        className={`${styles.detail} ${styles.pulse}`}
        style={{ animationDelay: '300ms' }}
        d="M 280 36 a 20 20 0 0 1 -7 18"
      />
      <path
        className={`${styles.detail} ${styles.pulse}`}
        style={{ animationDelay: '600ms' }}
        d="M 290 28 a 28 28 0 0 1 -10 25"
      />
      {/* Ground relay */}
      <rect className={styles.shell} x={258} y={208} width={32} height={22} rx={3} />
      <circle className={styles.dot} cx={266} cy={219} r={1.7} />
      <path className={styles.shellLine} d="M 232 226 Q 246 218 258 218" />
      {/* Crew member bracing the mast */}
      <Pack x={120} y={132} />
      <Torso x={138} y={124} />
      <Helmet cx={166} cy={106} look={1} tilt={-12} />
      <Tube d="M 180 138 Q 208 124 224 113" />
      <Glove x={227} y={112} />
      <Tube d="M 178 156 Q 206 152 224 149" />
      <Glove x={227} y={148} />
      <Tube d="M 152 180 L 148 246" />
      <Tube d="M 170 180 L 176 246" />
      <Boot x={134} y={245} />
      <Boot x={166} y={245} />
      <line className={styles.floor} x1="40" y1="254" x2="306" y2="254" />
      <Stamp text="COM · ENLACE ASCENDENTE" />
    </g>
  ),

  /* 06 ARCHIVO — study session at the records desk */
  6: (
    <g>
      {/* Station viewport behind */}
      <path className={styles.frameLine} d="M 226 26 A 96 96 0 0 1 322 122" />
      <path className={styles.frameLine} d="M 240 26 A 82 82 0 0 1 322 108" />
      <Star x={300} y={84} r={1.5} />
      <Star x={258} y={44} r={1.2} />
      <Spark x={284} y={56} s={3} delay={450} />
      <Spark x={56} y={66} s={3} delay={150} />
      {/* Desk with terminal */}
      <path className={styles.shell} d="M 148 202 L 312 202 L 306 214 L 154 214 Z" />
      <line className={styles.shellLine} x1="170" y1="214" x2="166" y2="250" />
      <line className={styles.shellLine} x1="292" y1="214" x2="296" y2="250" />
      <path className={styles.panel} d="M 266 156 L 298 148 L 298 196 L 266 202 Z" />
      <circle className={styles.detail} cx="282" cy="176" r="8" fill="none" />
      <circle className={styles.dot} cx="282" cy="176" r="1.7" />
      {/* Open journal */}
      <path className={styles.page} d="M 182 202 Q 204 188 226 202" />
      <path className={styles.page} d="M 184 203 Q 204 193 224 203" />
      <line className={styles.page} x1="204" y1="192" x2="204" y2="202" />
      <path className={styles.detail} d="M 190 198 q 6 -3 11 -3 M 212 195 q 6 0 10 3" />
      {/* Bench (drawn first, behind the crew member) */}
      <rect className={styles.shell} x={84} y={172} width={48} height={8} rx={3} />
      <line className={styles.shellLine} x1="94" y1="180" x2="92" y2="254" />
      <line className={styles.shellLine} x1="124" y1="180" x2="126" y2="254" />
      {/* Crew member, seated and writing */}
      <Pack x={70} y={120} />
      <Torso x={88} y={112} lean={8} />
      <Helmet cx={124} cy={92} look={1} tilt={10} />
      {/* Writing arm, articulated at the elbow */}
      <Tube d="M 122 130 Q 142 140 154 158" />
      <Tube d="M 154 158 Q 170 178 186 194" />
      <circle className={styles.joint} cx={154} cy={158} r={4} />
      <Glove x={188} y={196} />
      <line className={styles.detail} x1="192" y1="199" x2="200" y2="207" />
      <Spark x={204} y={211} s={2.4} delay={0} />
      {/* Support arm */}
      <Tube d="M 110 136 Q 126 156 140 170" />
      <Tube d="M 140 170 Q 158 186 172 197" />
      <circle className={styles.joint} cx={140} cy={170} r={4} />
      <Glove x={174} y={199} />
      {/* Seated legs down to the deck floor */}
      <Tube d="M 102 162 Q 122 170 138 174" />
      <Tube d="M 138 174 L 136 250" />
      <Boot x={126} y={248} />
      <Tube d="M 96 166 Q 112 178 126 182" />
      <Tube d="M 126 182 L 122 252" />
      <Boot x={110} y={250} />
      <line className={styles.floor} x1="36" y1="258" x2="312" y2="258" />
      <Stamp text="ARC · SESIÓN DE ESTUDIO" />
    </g>
  ),
};
