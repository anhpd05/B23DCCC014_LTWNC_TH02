import { createSlice, createSelector, isAnyOf } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { createAppAsyncThunk } from "../../app/hooks";
import { api } from "./api";
import { isApiError } from "../../shared/ApiError";
import { isOverdue } from "./deadline";
import { STRESS_COUNT, generateAssignments } from "./mockData";
import {
  FILTERS,
  PRIORITY_WEIGHT,
  type Assignment,
  type FilterStatus,
  type NewAssignmentDto,
  type UpdateAssignmentDto,
} from "./types";

export type AssignmentsStatus = "idle" | "loading" | "succeeded" | "failed";

/** idle: chưa tạo (hoặc tạo lỗi, được thử lại) · seeding: đang gọi BE · done: đã tạo xong, khoá hẳn. */
export type SeedState = "idle" | "seeding" | "done";

export interface AssignmentsState {
  items: Assignment[];
  status: AssignmentsStatus;
  error: string | null;
  mutatingIds: string[];
  filter: FilterStatus;
  seedState: SeedState;
}

const initialState: AssignmentsState = {
  items: [],
  status: "idle",
  error: null,
  mutatingIds: [],
  filter: "all",
  seedState: "idle",
};

// ---- Thunks ----

export const fetchAssignments = createAppAsyncThunk(
  "assignments/fetch",
  async (_: void, { rejectWithValue }) => {
    try {
      return await api.getAll();
    } catch (e) {
      return rejectWithValue(
        isApiError(e) ? e.message : "Không tải được danh sách",
      );
    }
  },
  {
    condition: (_, { getState }) => getState().assignments.status !== "loading",
  },
);

export const createAssignment = createAppAsyncThunk(
  "assignments/create",
  async (dto: NewAssignmentDto, { rejectWithValue }) => {
    try {
      return await api.create(dto);
    } catch (e) {
      return rejectWithValue(
        isApiError(e) ? e.message : "Không thêm được bài tập",
      );
    }
  },
);

/**
 * Stress test: tạo `STRESS_COUNT` bài qua BE. `condition` (không chỉ khoá ở UI)
 * chặn seed khi danh sách chưa tải xong — nếu không, `fetchAssignments.fulfilled`
 * (thay toàn bộ `items`) có thể ghi đè 10.000 bài vừa tạo.
 */
export const seedAssignments = createAppAsyncThunk(
  "assignments/seed",
  async (_: void, { rejectWithValue }) => {
    try {
      return await api.bulkCreate(generateAssignments(STRESS_COUNT, Date.now()));
    } catch (e) {
      return rejectWithValue(
        isApiError(e) ? e.message : "Không tạo được bài tập mẫu",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { status, seedState } = getState().assignments;
      return status === "succeeded" && seedState === "idle";
    },
  },
);

export const updateAssignment =createAppAsyncThunk(
  "assignments/update",
  async (
    arg: { id: string; changes: UpdateAssignmentDto },
    { rejectWithValue },
  ) => {
    try {
      return await api.update(arg.id, arg.changes);
    } catch (e) {
      return rejectWithValue(isApiError(e) ? e.message : "Không cập nhật được");
    }
  },
);

export const deleteAssignment = createAppAsyncThunk(
  "assignments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.remove(id);
    } catch (e) {
      return rejectWithValue(isApiError(e) ? e.message : "Không xoá được");
    }
  },
);

// ---- Slice ----

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<FilterStatus>) {
      state.filter = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload;
      })
      .addCase(fetchAssignments.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? "Lỗi không xác định";
      })
      .addCase(createAssignment.fulfilled, (s, a) => {
        s.items.push(a.payload);
      })
      .addCase(seedAssignments.pending, (s) => {
        s.seedState = "seeding";
        s.error = null;
      })
      .addCase(seedAssignments.fulfilled, (s, a) => {
        s.items.push(...a.payload);
        s.seedState = "done";
      })
      .addCase(seedAssignments.rejected, (s) => {
        s.seedState = "idle";
      })
      .addCase(updateAssignment.pending, (s, a) => {
        s.mutatingIds.push(a.meta.arg.id);
      })
      .addCase(deleteAssignment.pending, (s, a) => {
        s.mutatingIds.push(a.meta.arg);
      })
      .addCase(updateAssignment.fulfilled, (s, a) => {
        const i = s.items.findIndex((x) => x.id === a.payload.id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(deleteAssignment.fulfilled, (s, a) => {
        s.items = s.items.filter((x) => x.id !== a.payload.id);
      })
      .addMatcher(
        isAnyOf(
          updateAssignment.fulfilled,
          updateAssignment.rejected,
          deleteAssignment.fulfilled,
          deleteAssignment.rejected,
        ),
        (s, a) => {
          const id =
            typeof a.meta.arg === "string" ? a.meta.arg : a.meta.arg.id;
          s.mutatingIds = s.mutatingIds.filter((x) => x !== id);
        },
      )
      .addMatcher(
        isAnyOf(
          createAssignment.rejected,
          updateAssignment.rejected,
          deleteAssignment.rejected,
          seedAssignments.rejected,
        ),
        (s, a) => {
          s.error = a.payload ?? "Thao tác thất bại";
        },
      );
  },
});

export const { setFilter, clearError } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;

// ---- Selectors ----

export const selectAllAssignments = (s: RootState) => s.assignments.items;
export const selectMeta = createSelector(
  [
    (s: RootState) => s.assignments.status,
    (s: RootState) => s.assignments.error,
  ],
  (status, error) => ({ status, error }),
);
export const selectMutatingIds = (s: RootState) => s.assignments.mutatingIds;
export const selectSeedState = (s: RootState) => s.assignments.seedState;
export const selectFilter =(s: RootState) => s.assignments.filter;

type Matcher = (a: Assignment, now: number) => boolean;

const MATCHERS: Record<FilterStatus, Matcher> = {
  all: () => true,
  pending: (a, now) => !a.completed && !isOverdue(a, now),
  overdue: (a, now) => isOverdue(a, now),
  completed: (a) => a.completed,
};

export const selectVisibleAssignments = createSelector(
  [selectAllAssignments, selectFilter],
  (items, filter) => {
    const now = Date.now();
    return items
      .filter((a) => MATCHERS[filter](a, now))
      .sort(
        (a, b) =>
          Date.parse(a.dueDate) - Date.parse(b.dueDate) ||
          PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority],
      );
  },
);

export const selectCounts = createSelector([selectAllAssignments], (items) => {
  const now = Date.now();
  return FILTERS.reduce(
    (acc, f) => {
      acc[f] = items.filter((a) => MATCHERS[f](a, now)).length;
      return acc;
    },
    {} as Record<FilterStatus, number>,
  );
});
