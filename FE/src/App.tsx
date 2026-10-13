import { CalendarClock } from 'lucide-react';
import { AssignmentForm } from './features/assignments/components/AssignmentForm';
import { AssignmentList } from './features/assignments/components/AssignmentList';
import { ThemeToggle } from './shared/theme/ThemeToggle';

export default function App() {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <main className="app">
      <header className="app__head">
        <span className="app__mark" aria-hidden="true">
          <CalendarClock size={22} strokeWidth={1.9} />
        </span>
        <div>
          <h1 className="app__title">Student Deadline Tracker</h1>
          <p className="app__sub">Quản lý deadline bài tập cá nhân</p>
        </div>
        <p className="app__today">{today}</p>
        <ThemeToggle />
      </header>

      <AssignmentForm />

      <AssignmentList>
        <AssignmentList.Filters />
        <AssignmentList.Items />
        <AssignmentList.Empty>Chưa có bài tập nào trong mục này</AssignmentList.Empty>
      </AssignmentList>
    </main>
  );
}
