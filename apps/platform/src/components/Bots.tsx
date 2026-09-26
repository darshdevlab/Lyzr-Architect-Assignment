import { useRef, useState } from 'react';
import {
  Bot as BotIcon,
  Plus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import type { Bot } from '../lib/model';
import { uid } from '../lib/model';
import { PageTitle, Status } from './UI';
import { readOnlyControls } from './ReadOnlyControls';
export default function Bots({
  bots,
  onChange: writeBots,
  readOnly = false,
}: {
  readOnly?: boolean;
  bots: Bot[];
  onChange: (b: Bot[]) => void;
}) {
  const onChange = (value: Bot[]) => {
    if (!readOnly) writeBots(value);
  };
  const [selected, setSelected] = useState('lead');
  const [drag, setDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const current = bots.find((b) => b.id === selected);
  function move(id: string, x: number, y: number) {
    onChange(
      bots.map((b) =>
        b.id === id
          ? { ...b, x: Math.max(10, Math.min(585, x)), y: Math.max(15, Math.min(330, y)) }
          : b,
      ),
    );
  }
  return readOnlyControls(
    <>
      <PageTitle
        eyebrow="Agents & bot teams"
        title="A team shaped around your goal."
        description="Arrange specialists, define their responsibilities and keep a clear line of ownership."
      >
        <button
          className="button primary"
          onClick={() => {
            const id = uid();
            onChange([
              ...bots,
              {
                id,
                name: 'New specialist',
                role: 'Define this agent’s responsibility',
                x: 270,
                y: 330,
                parent: 'lead',
              },
            ]);
            setSelected(id);
          }}
        >
          <Plus size={15} />
          Add specialist
        </button>
      </PageTitle>
      <div className="bot-layout">
        <div className="panel">
          <div className="panel-heading">
            <b>Delivery team</b>
            <Status>Configuration only</Status>
          </div>
          <div className="bot-scroll">
            <div ref={canvas} className="bot-canvas">
              <svg aria-hidden="true" viewBox="0 0 790 450">
                {bots
                  .filter((b) => b.parent)
                  .map((b) => {
                    const parent = bots.find((p) => p.id === b.parent);
                    return parent ? (
                      <path
                        key={b.id}
                        d={`M${parent.x + 95} ${parent.y + 92} C${parent.x + 95} ${b.y - 25} ${b.x + 95} ${parent.y + 150} ${b.x + 95} ${b.y}`}
                        fill="none"
                        stroke="var(--line-strong)"
                        strokeWidth="1.5"
                      />
                    ) : null;
                  })}
              </svg>
              {bots.map((b) => (
                <div
                  key={b.id}
                  className={'bot-node ' + (selected === b.id ? 'selected' : '')}
                  style={{ left: b.x, top: b.y }}
                >
                  <button
                    className="bot-drag"
                    aria-label={'Drag ' + b.name}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setDrag({ id: b.id, startX: e.clientX, startY: e.clientY, x: b.x, y: b.y });
                      setSelected(b.id);
                    }}
                    onPointerMove={(e) => {
                      if (drag?.id === b.id)
                        move(
                          b.id,
                          drag.x + e.clientX - drag.startX,
                          drag.y + e.clientY - drag.startY,
                        );
                    }}
                    onPointerUp={() => setDrag(null)}
                    onPointerCancel={() => setDrag(null)}
                  >
                    <GripVertical size={13} />
                    <span>{b.parent ? 'SPECIALIST' : 'LEAD AGENT'}</span>
                  </button>
                  <button data-view-control className="bot-body" onClick={() => setSelected(b.id)}>
                    <BotIcon size={19} />
                    <strong>{b.name}</strong>
                    <small>{b.role}</small>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-foot">
            Drag a handle to arrange the team. Keyboard users can use the position controls.
          </div>
        </div>
        <aside className="panel inspector">
          {current && (
            <>
              <div className="eyebrow">Agent configuration</div>
              <h2>{current.name}</h2>
              <label>
                Name
                <input
                  value={current.name}
                  maxLength={40}
                  onChange={(e) =>
                    onChange(
                      bots.map((b) => (b.id === current.id ? { ...b, name: e.target.value } : b)),
                    )
                  }
                />
              </label>
              <label>
                Responsibility
                <textarea
                  value={current.role}
                  maxLength={250}
                  onChange={(e) =>
                    onChange(
                      bots.map((b) => (b.id === current.id ? { ...b, role: e.target.value } : b)),
                    )
                  }
                />
              </label>
              <label>
                Reports to
                <input
                  readOnly
                  value={
                    current.parent
                      ? bots.find((b) => b.id === current.parent)?.name || 'Delivery lead'
                      : 'Workspace owner'
                  }
                />
              </label>
              <div className="eyebrow" style={{ marginTop: 20 }}>
                Position
              </div>
              <div className="row">
                {(
                  [
                    [ArrowLeft, -20, 0, 'left'],
                    [ArrowUp, 0, -20, 'up'],
                    [ArrowDown, 0, 20, 'down'],
                    [ArrowRight, 20, 0, 'right'],
                  ] as const
                ).map(([I, x, y, label]) => (
                  <button
                    key={label}
                    className="icon-button"
                    aria-label={'Move agent ' + label}
                    onClick={() => move(current.id, current.x + x, current.y + y)}
                  >
                    <I size={16} />
                  </button>
                ))}
              </div>
              <div className="notice">
                Execution, schedules and tool permissions will connect to the agent runtime. This
                canvas saves the team structure locally.
              </div>
              {current.parent && (
                <button
                  className="button danger"
                  onClick={() => {
                    onChange(bots.filter((b) => b.id !== current.id));
                    setSelected('lead');
                  }}
                >
                  <Trash2 size={14} />
                  Remove specialist
                </button>
              )}
            </>
          )}
        </aside>
      </div>
    </>,
    readOnly,
  );
}
