# LTWNC TH02 — Student Deadline Tracker (nâng cấp)

Sinh viên: Phạm Đức Anh — MSSV B23DCCC014. Nâng cấp bản TH01 (commit `0ee21d6`) theo đề TH02:
**A** state (Zustand, Context, redux-logger) · **B** hiệu năng (stress test 10.000 bài, 4 kỹ thuật tối ưu, đo trước/sau) · **C** kiểm thử (Jest + React Testing Library).

Toàn bộ ảnh trong báo cáo là ảnh chụp thật từ F12 (Chrome for Testing + React DevTools) hoặc từ trình duyệt; số liệu gốc nằm trong [`bao-cao/so-lieu/`](bao-cao/so-lieu/), ảnh nằm trong [`bao-cao/anh/`](bao-cao/anh/).

## Mục lục
1. [Cách chạy](#1-cách-chạy)
2. [Phần A — State](#2-phần-a--state)
3. [Phần B — Hiệu năng](#3-phần-b--hiệu-năng)
4. [Phần C — Kiểm thử](#4-phần-c--kiểm-thử)
5. [Hạn chế đã biết](#5-hạn-chế-đã-biết)
6. [Lịch sử commit](#6-lịch-sử-commit)

## 1. Cách chạy
```bash
# Backend (NestJS, dữ liệu trong bộ nhớ)         → http://localhost:3000
cd be-ltwnc && npm install && npm run start

# Frontend (Vite)                                 → http://localhost:5173 (proxy /api → 3000)
cd FE && npm install && npm run dev

# Test + coverage
cd FE && npm test                # 23 test
cd FE && npm run test:coverage   # fail nếu statements src/features/ < 70%
```
Số đo và ảnh trong báo cáo được thực hiện bằng React DevTools (Profiler), Lighthouse và Console/Network của Chrome; kết quả nằm trong `bao-cao/`.

## 2. Phần A — State

| Yêu cầu | Cách làm | File |
|---|---|---|
| A1 Ghim bài (Zustand) | `usePinStore` có `pinnedIds`, `togglePin`, `isPinned`; bài ghim luôn ở đầu danh sách (sau lọc trạng thái + tìm kiếm), xoá bài thành công thì bỏ ghim. Không đưa vào Redux vì là trạng thái giao diện thuần. | `FE/src/features/pins/usePinStore.ts` |
| A2 Theme (Context) | `ThemeContext` + `ThemeProvider` (`value` bọc `useMemo`, `toggleTheme` bọc `useCallback`) + `ThemeToggle`. Màu đổi qua biến CSS theo `data-theme` nên các component khác không phải render lại. | `FE/src/shared/theme/*` |
| A3 redux-logger | Gắn ngay trong `makeStore` ở `store.ts`, chỉ bật khi `IS_DEV`. | `FE/src/app/store.ts` |

Bằng chứng:
- **A1** — hai bài ghim nhảy lên đầu, và vẫn ở đầu khi lọc "Quá hạn": `bao-cao/anh/a1-ghim.png`, `a1-ghim-loc.png` (kiểm thứ tự DOM: `so-lieu/a1-ghim.json`). Ghim áp dụng sau khi lọc: bài ghim không khớp bộ lọc thì không hiển thị.
- **A2** — Profiler (React DevTools) ghi một lần bấm đổi theme: chỉ `ThemeProvider`, `ThemeToggle` (và phần tử con của nút) render, `AssignmentCard` render 0 lần: `bao-cao/anh/a2-profiler-theme.png`, `a2-profiler-theme-ranked.png`; số liệu `so-lieu/theme/`.
- **A3** — Console dev hiện nhóm log `assignments/create/fulfilled`, `assignments/update/fulfilled`, `assignments/delete/fulfilled`: `bao-cao/anh/a3-create.png`, `a3-update.png`, `a3-delete.png`. Bản production (`vite preview`) thêm/hoàn thành/xoá không in log redux-logger nào: `a3-prod-khong-log.png`, `so-lieu/logger-prod-check.txt`. Lưu ý: thư viện logger vẫn nằm trong bundle (import tĩnh để thấy ngay trong `store.ts`) nhưng không bao giờ được gắn ở production.

## 3. Phần B — Hiệu năng

**Workload:** 10.000 bài tạo bằng nút "Tạo 10.000 bài tập mẫu" (gọi `POST /api/assignments/bulk`; tạo xong thì nút khoá, nhãn "Đã tạo 10.000 bài") cộng 6 bài mock của BE = 10.006 bài. Hai làn đo dùng chung một BE đã seed nên cùng dữ liệu (fingerprint SHA-256 giống nhau: `so-lieu/fixture-phien.json`). Hàm sinh dữ liệu tự viết, PRNG cố định seed: `FE/src/features/assignments/mockData.ts`. Bản "trước" là tag `th02-baseline` (chưa tối ưu), bản "sau" là HEAD. React Compiler đã tắt để số đo "trước" có ý nghĩa.

**Kịch bản đo:** viewport 1400×1000, gõ `web` vào ô tìm kiếm (150 ms/phím), chờ 1 giây; React Profiler (dev, StrictMode). Lighthouse Mobile, mô phỏng throttling, 3 lần tuần tự, lấy trung vị, trên bản production `vite preview`.

**Định nghĩa "số render `AssignmentCard`":** Σ qua mọi commit, Σ qua mọi fiber `AssignmentCard` (khoá rootID + fiberID) có mặt trong `fiberActualDurations` của bản export Profiler (đếm cả fiber mount mới trong lúc ghi bằng cách replay `operations`). Đây là số *render đã commit*, không phải số commit, cũng không phải số lần gọi hàm. Component bọc `React.memo` hiện tên `Memo(AssignmentCard)` trong DevTools và được tính là cùng một card.

### Bảng so sánh trước/sau
| Chỉ số | Trước | Sau | Chênh lệch |
|---|---|---|---|
| Số render `AssignmentCard` khi gõ "web" (Σ commit × instance) | 3800 | 9 | −3791 (−99,8%) |
| Số instance `AssignmentCard` khác nhau đã render | 1268 | 9 | −1259 (−99,3%) |
| Số commit gốc khi gõ | 3 | 5 | +2 |
| Tổng thời gian commit khi gõ | 3766,2 ms | 153,4 ms | −3612,8 ms (−95,9%) |
| Số `AssignmentCard` trong DOM (10.000 bài) | 10006 | 11 | −9995 (−99,9%) |
| Lighthouse Performance (Mobile, trung vị 3 lần) | 38 | 64 | +26 |
| Lighthouse FCP | 1556 ms | 1510 ms | −46 ms |
| Lighthouse LCP | 12558 ms | 12817 ms | +259 ms |
| Lighthouse TBT | 27079 ms | 379 ms | −26700 ms (−98,6%) |
| Lighthouse CLS | 0,000 | 0,000 | 0 |
| Lighthouse Speed Index | 6932 ms | 3392 ms | −3541 ms (−51,1%) |
| JS tải ban đầu (gzip, 1 kB = 1024 B) | 107,51 kB | 111,82 kB | +4,31 kB (+4,0%) |

Nguồn từng số: `so-lieu/truoc|sau/render-count.json` (tính từ `profiler-search.json`, bản export gốc của Profiler), `lh-1..3.json` + `lighthouse-median.json`, `dom-bundle.json`; bảng gộp: `so-lieu/bang-so-sanh.md`. Ảnh: `bao-cao/anh/truoc-profiler-search.png`, `truoc-profiler-ranked.png`, `sau-profiler-search.png`, `sau-profiler-ranked.png` (kèm ảnh trang `*-trang.png`).

Nhận xét trung thực:
- Số commit gốc tăng (3 → 5) nhưng chúng rẻ: 3 commit đầu là 3 phím (chỉ cập nhật ô nhập, không đụng `AssignmentCard`), 1 commit là lần lọc sau 300 ms debounce (mount 9 card trong khung nhìn), 1 commit nhỏ ngoài thao tác không render card nào. Tổng thời gian commit giảm từ 3766 ms xuống 153 ms.
- **LCP không cải thiện** (12,6 s → 12,8 s): với mô phỏng mạng chậm, phần tử lớn nhất chỉ xuất hiện sau khi tải xong ~1,5 MB JSON của 10.000 bài; việc đó nằm ở mạng/BE, không phải ở render, nên tối ưu FE không đổi được.
- **JS ban đầu tăng nhẹ** (+4,3 kB gzip): `react-window` và `zustand` được thêm vào bundle chính, trong khi chunk Thống kê tách ra chỉ ~1,3 kB vì dùng chung `deadline.ts` với phần chính. Lazy-loading ở đây đúng kỹ thuật (xem `so-lieu/network-lazy.json`, `b6-network-truoc.png`, `b6-network-sau.png`: `StatsPage-*.js` chỉ tải sau khi bấm tab) nhưng không giảm được JS ban đầu.
- Ghi Profiler: trang đã nạp xong mới ghi (không reload) vì mỗi lần nạp bản baseline 10.000 card mất ~90 s. Các commit không do thao tác (vd. tick đếm ngược 60 s của card) được tách riêng (`foreignCommits`/`foreignRenders` trong `render-count.json`); trong bản ghi cuối không có render `AssignmentCard` nào thuộc commit ngoài thao tác ở cả hai làn (làn sau có 1 commit ngoài thao tác nhưng không render card nào).

### 4 kỹ thuật tối ưu — đúng chỗ, không lạm dụng
| Kỹ thuật | Áp dụng ở đâu | Cố ý KHÔNG áp dụng |
|---|---|---|
| `React.memo` + `useCallback` | `AssignmentCard` (render hàng nghìn lần, props ổn định); `setFilter/toggle/remove/retry` trong `useAssignments`, context value bằng `useMemo` | `Filters`, `Empty`, `AssignmentForm`, `ThemeToggle`, `SeedButton`, `StatsPage`: ít phần tử, render rẻ hoặc props luôn đổi |
| `useDebounce(300)` + `useMemo` | Ô tìm kiếm; `visibleItems` chỉ tính lại khi `items`/`query` đã debounce/`pinnedIds` đổi | Form thêm bài; phép tính rẻ (nhãn, className) |
| Virtualization `react-window` | Danh sách bài (DOM còn ≤ 40 card, thực tế 8–11); `rowKey` theo id để đổi chỗ (ghim/lọc/xoá) không chuyển state/focus sang bài khác; chiều cao dòng cố định theo 2 bố cục (≤640 px và rộng), kiểm bằng trình duyệt ở 360/640/641/1400 px với tên bài rất dài | — |
| `React.lazy` + `Suspense` | Tab Thống kê | Form và danh sách (luôn hiển thị ngay) |

## 4. Phần C — Kiểm thử
Jest 30 + ts-jest + React Testing Library + user-event, môi trường jsdom. **23 test** (đề tối thiểu 12), 9 file:

| Loại | Số test | File |
|---|---|---|
| Unit | 10 | `deadline.test.ts` (5), `assignmentsSlice.test.ts` (4), `usePinStore.test.ts` (1) |
| Component | 6 | `AssignmentCard.test.tsx` (3), `AssignmentForm.test.tsx` (2), `StatsPage.test.tsx` (1) |
| Async (mock API) | 6 | `AssignmentList.test.tsx` (5: tải/lỗi-thử lại/ghim+tìm kiếm/không khớp/xoá lỗi), `SeedButton.test.tsx` (1) |
| Hook | 1 | `useDebounce.test.ts` (fake timers) |

Coverage `src/features/`: statements **91,22%**, branches 72,66%, functions 84,82%, lines 91,66%; `coverageThreshold` đặt 70% trong `FE/jest.config.ts` (đã thử hạ ngưỡng thử lên 99% → lệnh thoát mã 1, rồi trả lại 70%). Ảnh kết quả: `bao-cao/anh/c-jest-coverage.png`; log gốc: `bao-cao/so-lieu/jest/jest-coverage.ansi.txt`. Các cảnh báo `console.warn` của middleware kiểm tra state trong output là của Redux Toolkit khi test nạp 10.000 bài.

## 5. Hạn chế đã biết
- Dữ liệu BE nằm trong bộ nhớ: restart BE là mất dữ liệu (và đổi dữ liệu mock vì dùng `Date.now()`); muốn seed lại phải restart BE.
- Virtualization: dòng ngoài màn hình bị unmount nên focus bàn phím mất khi cuộn khỏi dòng đó.
- Lighthouse dao động theo máy; số trong bảng là trung vị 3 lần trên cùng máy, cùng phiên, cùng dữ liệu. Chưa chụp được ảnh panel Lighthouse trong F12 (số liệu lấy từ Lighthouse CLI, JSON gốc trong `so-lieu/`).
- Số đo Profiler ở bản dev (StrictMode + overhead của DevTools) nên thời gian tuyệt đối chỉ để so sánh tương đối giữa hai làn.

## 6. Lịch sử commit
- `0ee21d6` — bản TH01 (nền để nâng cấp)
- Nền tảng và Phần A: tắt React Compiler, env boundary, store factory, hàm thuần deadline; ghim, theme, redux-logger
- `th02-baseline` — stress test 10.000 bài, tìm kiếm, tab Thống kê (chưa tối ưu)
- 4 commit tối ưu, mỗi kỹ thuật một commit: memo + useCallback → useDebounce + useMemo → react-window → lazy/Suspense
- Jest/RTL, 23 test, coverageThreshold
- `bao-cao/`: ảnh F12 và số liệu đo trước/sau
