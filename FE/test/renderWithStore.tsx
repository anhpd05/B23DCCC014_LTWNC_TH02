import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeStore, type RootState } from '../src/app/store';
import { ThemeProvider } from '../src/shared/theme/ThemeProvider';

type UserEventOptions = Parameters<typeof userEvent.setup>[0];

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  userOptions?: UserEventOptions;
}

export function renderWithStore(
  ui: ReactElement,
  { preloadedState, userOptions, ...options }: Options = {},
) {
  const store = makeStore(preloadedState);
  const user = userEvent.setup(userOptions);
  const result = render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ThemeProvider>{children}</ThemeProvider>
      </Provider>
    ),
    ...options,
  });
  return { store, user, ...result };
}
