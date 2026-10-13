import { useAppSelector } from "../../app/hooks";
import { selectAllAssignments } from "../assignments/assignmentsSlice";
import { calcStats } from "../assignments/deadline";

export default function StatsPage() {
  const items = useAppSelector(selectAllAssignments);
  const stats = calcStats(items);

  const cards = [
    { label: "Tổng số bài", value: stats.total },
    { label: "Đã hoàn thành", value: stats.completed },
    { label: "Quá hạn", value: stats.overdue },
    { label: "Chưa hoàn thành", value: stats.pending },
  ];

  return (
    <section className="stats" aria-label="Thống kê bài tập">
      <dl className="stats__cards">
        {cards.map((c) => (
          <div className="stats__card" key={c.label}>
            <dt>{c.label}</dt>
            <dd>{c.value.toLocaleString("vi-VN")}</dd>
          </div>
        ))}
      </dl>

      <table className="stats__table">
        <caption>Theo môn học</caption>
        <thead>
          <tr>
            <th scope="col">Môn học</th>
            <th scope="col">Tổng</th>
            <th scope="col">Đã xong</th>
            <th scope="col">Quá hạn</th>
          </tr>
        </thead>
        <tbody>
          {stats.bySubject.map((s) => (
            <tr key={s.subject}>
              <th scope="row">{s.subject}</th>
              <td>{s.total.toLocaleString("vi-VN")}</td>
              <td>{s.completed.toLocaleString("vi-VN")}</td>
              <td>{s.overdue.toLocaleString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
