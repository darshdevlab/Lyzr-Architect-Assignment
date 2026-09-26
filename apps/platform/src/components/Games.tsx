import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { readDraft, writeDraft } from '../lib/builderState';
const symbols = ['◈', '✦', '●', '▲', '☀', '♥'];
function shuffle() {
  return [...symbols, ...symbols]
    .map((symbol, id) => ({ symbol, id, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort);
}
export default function Games({
  projectId = 'global',
  preferences,
}: {
  projectId?: string;
  preferences?: Record<string, string>;
}) {
  const [game, setGame] = useState(
      preferences?.game === 'Reaction challenge'
        ? 'reaction'
        : readDraft(projectId, 'game', 'memory'),
    ),
    [difficulty, setDifficulty] = useState(
      preferences?.difficulty || readDraft(projectId, 'difficulty', 'Standard'),
    ),
    [mode, setMode] = useState('Solo'),
    [players, setPlayers] = useState('You, Teammate'),
    [turn, setTurn] = useState(0),
    [scores, setScores] = useState<{ name: string; game: string; score: number }[]>(() => {
      try {
        return JSON.parse(readDraft(projectId, 'scores', '[]'));
      } catch {
        return [];
      }
    });
  const names = players
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const record = (game: string, score: number) => {
    const name = mode === 'Solo' ? 'You' : names[turn % Math.max(1, names.length)] || 'Player';
    const next = [{ name, game, score }, ...scores].slice(0, 20);
    setScores(next);
    writeDraft(projectId, 'scores', JSON.stringify(next));
    if (mode !== 'Solo') setTurn((t) => t + 1);
  };
  return (
    <div className="games">
      <div className="segmented">
        <button
          aria-pressed={game === 'memory'}
          onClick={() => {
            setGame('memory');
            writeDraft(projectId, 'game', 'memory');
          }}
        >
          Memory pairs
        </button>
        <button
          aria-pressed={game === 'reaction'}
          onClick={() => {
            setGame('reaction');
            writeDraft(projectId, 'game', 'reaction');
          }}
        >
          Reaction challenge
        </button>
      </div>
      <div className="grid-two">
        <label className="field">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              writeDraft(projectId, 'difficulty', e.target.value);
            }}
          >
            {['Relaxed', 'Standard', 'Challenge'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Challenge mode
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setTurn(0);
            }}
          >
            {['Solo', 'Local players', 'Local teams'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      {mode !== 'Solo' && (
        <div className="game-lobby">
          <label className="field">
            {mode === 'Local teams' ? 'Team names' : 'Player names'} (comma separated)
            <input value={players} onChange={(e) => setPlayers(e.target.value)} />
          </label>
          <p>
            Turn: <strong>{names[turn % Math.max(1, names.length)] || 'Add a player'}</strong>
          </p>
          <p className="muted">
            Pass-and-play on this device. Online invitations and remote matchmaking are not
            connected.
          </p>
          <button
            className="button"
            onClick={() => {
              navigator.clipboard?.writeText(
                `Architect build break: ${mode} — ${players}. Join me on the same device.`,
              );
            }}
          >
            Copy local challenge invitation
          </button>
        </div>
      )}
      <p className="muted">
        Scores stay in this browser session. Changing difficulty starts a new board.
      </p>
      <div hidden={game !== 'memory'}>
        <Memory
          key={'memory' + difficulty}
          difficulty={difficulty}
          onScore={(score) => record('memory', score)}
        />
      </div>
      <div hidden={game !== 'reaction'}>
        <Reaction
          key={'reaction' + difficulty}
          difficulty={difficulty}
          onScore={(score) => record('reaction', score)}
        />
      </div>
      {scores.length > 0 && (
        <details>
          <summary>Challenge scoreboard ({scores.length} rounds)</summary>
          <ol>
            {scores.map((s, i) => (
              <li key={i}>
                {s.name} · {s.game === 'memory' ? 'Memory' : 'Reaction'} · {s.score}{' '}
                {s.game === 'memory' ? 'moves' : 'ms'}
              </li>
            ))}
          </ol>
          <button
            className="button"
            onClick={() => {
              setScores([]);
              writeDraft(projectId, 'scores', '[]');
            }}
          >
            Clear scores
          </button>
        </details>
      )}
    </div>
  );
}

function Memory({ difficulty, onScore }: { difficulty: string; onScore: (score: number) => void }) {
  const [cards, setCards] = useState(shuffle),
    [open, setOpen] = useState<number[]>([]),
    [matched, setMatched] = useState<number[]>([]),
    [moves, setMoves] = useState(0);
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = setTimeout(
      () => {
        if (
          cards.find((c) => c.id === open[0])!.symbol ===
          cards.find((c) => c.id === open[1])!.symbol
        ) {
          setMatched((m) => [...m, ...open]);
          if (matched.length + 2 === cards.length) onScore(moves);
        }
        setOpen([]);
      },
      difficulty === 'Relaxed' ? 1100 : difficulty === 'Challenge' ? 350 : 650,
    );
    return () => clearTimeout(timer);
  }, [open, cards]);
  function restart() {
    setCards(shuffle());
    setOpen([]);
    setMatched([]);
    setMoves(0);
  }
  return (
    <>
      <div className="setting-row">
        <span>
          {moves} moves · {matched.length / 2}/6 pairs
        </span>
        <button className="button small" onClick={restart}>
          <RotateCcw size={14} />
          Restart
        </button>
      </div>
      <div
        className="memory-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}
      >
        {cards.map((c) => (
          <button
            className={'memory-card ' + (matched.includes(c.id) ? 'matched' : '')}
            style={{ minHeight: 64, fontSize: 24 }}
            key={c.id}
            disabled={matched.includes(c.id) || open.includes(c.id) || open.length === 2}
            aria-label={
              matched.includes(c.id)
                ? 'Matched ' + c.symbol
                : open.includes(c.id)
                  ? c.symbol
                  : 'Reveal card ' + (cards.indexOf(c) + 1)
            }
            onClick={() => {
              setOpen([...open, c.id]);
              if (open.length === 1) setMoves((m) => m + 1);
            }}
          >
            {open.includes(c.id) || matched.includes(c.id) ? c.symbol : '?'}
          </button>
        ))}
      </div>
      {matched.length === 12 && (
        <p role="status">
          <Trophy size={16} /> All pairs found in {moves} moves. Nicely done.
        </p>
      )}
    </>
  );
}
function Reaction({
  difficulty,
  onScore,
}: {
  difficulty: string;
  onScore: (score: number) => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go' | 'result' | 'early'>('idle'),
    [score, setScore] = useState(0),
    [best, setBest] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    start = useRef(0);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function play() {
    if (phase === 'wait') {
      if (timer.current) clearTimeout(timer.current);
      setPhase('early');
      return;
    }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - start.current);
      setScore(ms);
      onScore(ms);
      setBest((b) => (b === null ? ms : Math.min(b, ms)));
      setPhase('result');
      return;
    }
    setPhase('wait');
    timer.current = setTimeout(
      () => {
        start.current = performance.now();
        setPhase('go');
      },
      (difficulty === 'Relaxed' ? 2200 : 1000) +
        Math.random() * (difficulty === 'Challenge' ? 5000 : 2500),
    );
  }
  return (
    <>
      <button
        className={'reaction-target ' + phase}
        style={{ width: '100%', minHeight: 180, borderRadius: 18, fontSize: 22 }}
        onClick={play}
      >
        {phase === 'idle'
          ? 'Start challenge'
          : phase === 'wait'
            ? 'Wait for “Go”…'
            : phase === 'go'
              ? 'Go!'
              : phase === 'early'
                ? 'Too soon. Try again'
                : `${score} ms · Play again`}
      </button>
      <p aria-live="polite">
        {phase === 'go'
          ? 'Go! Activate the button now.'
          : best !== null
            ? `Your best: ${best} ms`
            : 'Use Enter, Space or a click. Speed is just for fun.'}
      </p>
    </>
  );
}
