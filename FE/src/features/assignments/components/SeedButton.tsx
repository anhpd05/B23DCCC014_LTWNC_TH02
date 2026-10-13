import { DatabaseZap, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  seedAssignments,
  selectMeta,
  selectSeedState,
  type SeedState,
} from "../assignmentsSlice";

const LABEL: Record<SeedState, string> = {
  idle: "Tạo 10.000 bài tập mẫu",
  seeding: "Đang tạo…",
  done: "Đã tạo 10.000 bài",
};

/** Stress test (đề TH02 B4): tạo xong thì khoá hẳn — muốn làm lại thì restart BE. */
export function SeedButton() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(selectMeta);
  const seedState = useAppSelector(selectSeedState);

  return (
    <button
      type="button"
      className="seed-btn"
      disabled={status !== "succeeded" || seedState !== "idle"}
      onClick={() => void dispatch(seedAssignments())}
    >
      {seedState === "seeding" ? (
        <Loader2 size={15} className="spin" aria-hidden="true" />
      ) : (
        <DatabaseZap size={15} aria-hidden="true" />
      )}
      {LABEL[seedState]}
    </button>
  );
}
