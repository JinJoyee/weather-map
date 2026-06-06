import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../frontend/src/components/common/useViewport', () => ({
  default: vi.fn(),
  DESKTOP_MIN: 1024,
}));
vi.mock('../../frontend/src/components/common/MapArea', () => ({
  default: ({ children }) => <div data-testid="map-area">{children}</div>,
}));

import useViewport from '../../frontend/src/components/common/useViewport';
import MapScreenScaffold from '../../frontend/src/layout/MapScreenScaffold';

describe('MapScreenScaffold', () => {
  it('데스크톱 모드: Panel과 MapArea를 나란히 렌더링한다', () => {
    useViewport.mockReturnValue(true);
    render(
      <MapScreenScaffold panel={<div>패널 내용</div>} map={<div>맵 오버레이</div>} />
    );
    expect(screen.getByText('패널 내용')).toBeInTheDocument();
    expect(screen.getByTestId('map-area')).toBeInTheDocument();
  });

  it('모바일 모드: BottomSheet와 MapArea를 렌더링한다', () => {
    useViewport.mockReturnValue(false);
    render(
      <MapScreenScaffold
        panel={<div>패널 내용</div>}
        map={<div>맵 오버레이</div>}
        sheetHeader={<span>헤더</span>}
      />
    );
    expect(screen.getByText('패널 내용')).toBeInTheDocument();
    expect(screen.getByText('헤더')).toBeInTheDocument();
    expect(screen.getByTestId('map-area')).toBeInTheDocument();
  });

  it('panelWidth 커스텀 값이 패널에 적용된다', () => {
    useViewport.mockReturnValue(true);
    const { container } = render(
      <MapScreenScaffold panel={<div>내용</div>} panelWidth={500} />
    );
    const aside = container.querySelector('aside');
    expect(aside.style.width).toBe('500px');
  });
});
