import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  deleteAssignment,
  fetchAssignments,
  selectCounts,
  selectFilter,
  selectMeta,
  selectMutatingIds,
  selectVisibleAssignments,
  setFilter as setFilterAction,
  updateAssignment,
  type AssignmentsStatus,
} from "../assignmentsSlice";
import { usePinStore } from "../../pins/usePinStore";
import type { Assignment, FilterStatus } from "../types";

export interface AssignmentsFacade {
  items: Assignment[];
  counts: Record<FilterStatus, number>;
  filter: FilterStatus;
  status: AssignmentsStatus;
  error: string | null;
  mutating: string[];
  setFilter: (f: FilterStatus) => void;
  toggle: (a: Assignment) => void;
  remove: (id: string) => void;
  retry: () => void;
}

export function useAssignments(): AssignmentsFacade {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectVisibleAssignments);
  const counts = useAppSelector(selectCounts);
  const filter = useAppSelector(selectFilter);
  const mutating = useAppSelector(selectMutatingIds);
  const { status, error } = useAppSelector(selectMeta);

  useEffect(() => {
    if (status === "idle") void dispatch(fetchAssignments());
  }, [status, dispatch]);

  const setFilter = useCallback(
    (f: FilterStatus) => dispatch(setFilterAction(f)),
    [dispatch],
  );
  const toggle = useCallback(
    (a: Assignment) =>
      dispatch(
        updateAssignment({ id: a.id, changes: { completed: !a.completed } }),
      ),
    [dispatch],
  );
  const remove = useCallback(
    (id: string) => {
      void dispatch(deleteAssignment(id))
        .unwrap()
        .then(
          () => {
            const pins = usePinStore.getState();
            if (pins.isPinned(id)) pins.togglePin(id);
          },
          () => {},
        );
    },
    [dispatch],
  );
  const retry = useCallback(() => dispatch(fetchAssignments()), [dispatch]);

  return useMemo(
    () => ({
      items,
      counts,
      filter,
      status,
      error,
      mutating,
      setFilter,
      toggle,
      remove,
      retry,
    }),
    [items, counts, filter, status, error, mutating, setFilter, toggle, remove, retry],
  );
}
