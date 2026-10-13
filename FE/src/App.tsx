import { lazy, Suspense, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { AssignmentForm } from './features/assignments/components/AssignmentForm';
import { AssignmentList } from './features/assignments/components/AssignmentList';
import { SeedButton } from './features/assignments/components/SeedButton';
import { ThemeToggle } from './shared/theme/ThemeToggle';

const StatsPage = lazy(() => import('./features/stats/StatsPage'));

type Tab = 'list' | 'stats';

const TABS: { id: Tab; label: string }[] = [
  { id: 'list', label: 'Danh sách' },
  { id: 'stats', label: 'Thống kê' },
];

function StatsSkeleton() {
  return (
    <div className="skeleton-list" role="status" aria-label="Đang tải thống kê">
      {[0, 1].map((i) => (
        <div className="skeleton" key={i}>
          <i />
          <div className="skeleton__lines">
            <i style={{ width: '38%' }} />
            <i style={{ width: '72%' }} />
          </div>
          <i style={{ height: 18 }} />
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('list');
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

      <div className="tabs" role="tablist" aria-label="Chế độ xem">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="tab-panel"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'list' ? (
          <>
            <SeedButton />
            <AssignmentList>
              <AssignmentList.Search />
              <AssignmentList.Filters />
              <AssignmentList.Items />
              <AssignmentList.Empty>Chưa có bài tập nào trong mục này</AssignmentList.Empty>
            </AssignmentList>
          </>
        ) : (
          <Suspense fallback={<StatsSkeleton />}>
            <StatsPage />
          </Suspense>
        )}
      </div>
    </main>
  );
}
