import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronsUp,
  Clock,
  Equal,
  Loader2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useCountdown } from "../../../shared/hooks/useCountdown";
import { PRIORITY_LABEL, type Assignment, type Priority } from "../types";

interface AssignmentCardProps {
  data: Assignment;
  busy: boolean;
  onToggle: (a: Assignment) => void;
  onRemove: (id: string) => void;
}

type Tone = "ok" | "warn" | "danger";

/** Icon độ ưu tiên — Record ép khai báo đủ 3 nhánh của Priority. */
const PRIORITY_ICON: Record<Priority, LucideIcon> = {
  high: ChevronsUp,
  medium: Equal,
  low: ChevronDown,
};

/** Icon theo mức gấp của hạn nộp. */
const TONE_ICON: Record<Tone, LucideIcon> = {
  ok: CalendarCheck,
  warn: Clock,
  danger: AlertTriangle,
};

export function AssignmentCard({
  data,
  busy,
  onToggle,
  onRemove,
}: AssignmentCardProps) {
  const countdown = useCountdown(data.dueDate);
  const PriorityIcon = PRIORITY_ICON[data.priority];
  const ToneIcon = TONE_ICON[countdown.tone];
  const accent = data.completed ? "done" : countdown.tone;

  return (
    <li
      className={`assignment-item assignment-item--${accent}${busy ? " assignment-item--busy" : ""}`}
      aria-busy={busy}
    >
      <label className="check">
        <input
          className="check__input"
          type="checkbox"
          checked={data.completed}
          disabled={busy}
          onChange={() => onToggle(data)}
          aria-label={`Đánh dấu hoàn thành ${data.title}`}
        />
        <span className="check__box" aria-hidden="true">
          <Check size={13} strokeWidth={3.25} />
        </span>
      </label>

      <div className="assignment-item__body">
        <p className="assignment-item__subject">
          <BookOpen size={12} aria-hidden="true" />
          {data.subject}
        </p>

        <p
          className={
            data.completed
              ? "assignment-item__title assignment-item__title--done"
              : "assignment-item__title"
          }
        >
          {data.title}
        </p>

        <p className="assignment-item__due">
          <span>
            <CalendarDays size={13} aria-hidden="true" />
            {new Date(data.dueDate).toLocaleDateString("vi-VN")}
          </span>
          <span
            className={`countdown countdown--${data.completed ? "muted" : countdown.tone}`}
          >
            <ToneIcon size={13} aria-hidden="true" />
            {countdown.label}
          </span>
        </p>
      </div>

      <span className={`badge badge--${data.priority}`}>
        <PriorityIcon size={12} aria-hidden="true" />
        {PRIORITY_LABEL[data.priority]}
      </span>

      <button
        type="button"
        className="icon-btn"
        disabled={busy}
        title={`Xoá ${data.title}`}
        aria-label={`Xoá ${data.title}`}
        onClick={() => onRemove(data.id)}
      >
        {busy ? (
          <Loader2 size={16} className="spin" aria-hidden="true" />
        ) : (
          <Trash2 size={16} aria-hidden="true" />
        )}
      </button>
    </li>
  );
}
