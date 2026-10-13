import type { PropsWithChildren } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  LayoutList,
  RotateCw,
  ServerCrash,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";
import { createSafeContext } from "../../../shared/createSafeContext";
import {
  useAssignments,
  type AssignmentsFacade,
} from "../hooks/useAssignments";
import { AssignmentCard } from "./AssignmentCard";
import { pinnedFirst, usePinStore } from "../../pins/usePinStore";
import { useAppDispatch } from "../../../app/hooks";
import { clearError } from "../assignmentsSlice";
import { FILTERS, FILTER_LABEL, type FilterStatus } from "../types";

const [ListProvider, useListContext] =
  createSafeContext<AssignmentsFacade>("AssignmentList");

/** ic cho từng bộ lọc — Record ép khai báo đủ 4 nhánh của FilterStatus. */
const FILTER_ICON: Record<FilterStatus, LucideIcon> = {
  all: LayoutList,
  pending: Timer,
  overdue: AlertTriangle,
  completed: CheckCircle2,
};

function LoadingList() {
  return (
    <div
      className="skeleton-list"
      role="status"
      aria-label="Đang tải danh sách bài tập"
    >
      {[0, 1, 2].map((i) => (
        <div className="skeleton" key={i}>
          <i />
          <div className="skeleton__lines">
            <i style={{ width: "38%" }} />
            <i style={{ width: "72%" }} />
            <i style={{ width: "52%" }} />
          </div>
          <i style={{ height: 18 }} />
        </div>
      ))}
    </div>
  );
}

function AssignmentList({ children }: PropsWithChildren) {
  const ctx = useAssignments();
  const dispatch = useAppDispatch();

  if (ctx.status === "loading" || ctx.status === "idle") return <LoadingList />;

  if (ctx.status === "failed") {
    return (
      <div className="state state--error" role="alert">
        <ServerCrash size={30} strokeWidth={1.6} aria-hidden="true" />
        <p className="state__title">Không tải được danh sách</p>
        <p>{ctx.error}</p>
        <button type="button" className="state__retry" onClick={ctx.retry}>
          <RotateCw size={15} aria-hidden="true" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <ListProvider value={ctx}>
      <section className="list">
        {ctx.error && (
          <div className="banner banner--error" role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <p>{ctx.error}</p>
            <button
              type="button"
              className="banner__close"
              onClick={() => dispatch(clearError())}
            >
              <X size={14} aria-hidden="true" />
              Đóng
            </button>
          </div>
        )}
        {children}
      </section>
    </ListProvider>
  );
}

function Filters() {
  const { filter, setFilter, counts } = useListContext();
  return (
    <nav className="filters" aria-label="Lọc theo trạng thái">
      {FILTERS.map((f) => {
        const Icon = FILTER_ICON[f];
        return (
          <button
            key={f}
            type="button"
            aria-pressed={f === filter}
            onClick={() => setFilter(f)}
          >
            <Icon size={14} aria-hidden="true" />
            {FILTER_LABEL[f]}
            <span className="n">{counts[f]}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Items() {
  const { items, toggle, remove, mutating } = useListContext();
  const pinnedIds = usePinStore((s) => s.pinnedIds);
  const togglePin = usePinStore((s) => s.togglePin);
  if (items.length === 0) return null;
  return (
    <ul>
      {pinnedFirst(items, pinnedIds).map((a) => (
        <AssignmentCard
          key={a.id}
          data={a}
          busy={mutating.includes(a.id)}
          pinned={pinnedIds.includes(a.id)}
          onToggle={toggle}
          onRemove={remove}
          onTogglePin={togglePin}
        />
      ))}
    </ul>
  );
}

function Empty({ children }: PropsWithChildren) {
  const { items } = useListContext();
  if (items.length > 0) return null;
  return (
    <div className="state">
      <Inbox size={30} strokeWidth={1.6} aria-hidden="true" />
      <p className="state__title">{children}</p>
      <p>
        Thêm bài tập mới bằng biểu mẫu phía trên, hoặc đổi bộ lọc để xem mục
        khác.
      </p>
    </div>
  );
}

AssignmentList.Filters = Filters;
AssignmentList.Items = Items;
AssignmentList.Empty = Empty;

export { AssignmentList };
