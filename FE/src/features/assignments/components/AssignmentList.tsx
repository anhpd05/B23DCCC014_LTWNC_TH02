import { useMemo, useState, type PropsWithChildren } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  LayoutList,
  RotateCw,
  Search as SearchIcon,
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
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { filterByQuery } from "../search";
import { FILTERS, FILTER_LABEL, type Assignment, type FilterStatus } from "../types";

interface AssignmentListContextValue extends AssignmentsFacade {
  /** Giá trị ô nhập, đổi theo từng phím. */
  query: string;
  setQuery: (q: string) => void;
  /** `query` sau khi debounce — chính là chuỗi đã dùng để tính `visibleItems`. */
  appliedQuery: string;
  /** Đã lọc trạng thái + tìm kiếm + ghim lên đầu — nguồn DUY NHẤT cho Items và Empty. */
  visibleItems: Assignment[];
}

const [ListProvider, useListContext] =
  createSafeContext<AssignmentListContextValue>("AssignmentList");

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
  const [query, setQuery] = useState("");
  const appliedQuery = useDebounce(query, 300);
  const pinnedIds = usePinStore((s) => s.pinnedIds);
  const visibleItems = useMemo(
    () => pinnedFirst(filterByQuery(ctx.items, appliedQuery), pinnedIds),
    [ctx.items, appliedQuery, pinnedIds],
  );
  const value = useMemo(
    () => ({ ...ctx, query, setQuery, appliedQuery, visibleItems }),
    [ctx, query, appliedQuery, visibleItems],
  );

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
    <ListProvider value={value}>
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

function Search() {
  const { query, setQuery } = useListContext();
  return (
    <div className="search">
      <SearchIcon size={16} aria-hidden="true" />
      <input
        type="search"
        value={query}
        placeholder="Tìm theo tên bài hoặc môn học"
        aria-label="Tìm bài tập"
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
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
  const { visibleItems, toggle, remove, mutating } = useListContext();
  const pinnedIds = usePinStore((s) => s.pinnedIds);
  const togglePin = usePinStore((s) => s.togglePin);
  if (visibleItems.length === 0) return null;
  return (
    <ul>
      {visibleItems.map((a) => (
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
  const { visibleItems, appliedQuery } = useListContext();
  if (visibleItems.length > 0) return null;
  const searching = appliedQuery.trim() !== "";
  return (
    <div className="state">
      <Inbox size={30} strokeWidth={1.6} aria-hidden="true" />
      <p className="state__title">
        {searching ? `Không có bài tập khớp “${appliedQuery.trim()}”` : children}
      </p>
      <p>
        {searching
          ? "Thử từ khoá khác hoặc xoá ô tìm kiếm."
          : "Thêm bài tập mới bằng biểu mẫu phía trên, hoặc đổi bộ lọc để xem mục khác."}
      </p>
    </div>
  );
}

AssignmentList.Search = Search;
AssignmentList.Filters = Filters;
AssignmentList.Items = Items;
AssignmentList.Empty = Empty;

export { AssignmentList };
