import { useCallback, useLayoutEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

/**
 * Chỉ component gọi `useTheme()` (ThemeToggle) render lại khi đổi theme:
 * `children` do bên ngoài truyền vào nên cùng một element → React bỏ qua cây con;
 * màu đổi qua biến CSS theo `data-theme` chứ không qua props.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
