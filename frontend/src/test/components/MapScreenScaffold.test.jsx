import { render, screen } from '@testing-library/react';
import { vi, afterEach } from 'vitest';
import MapScreenScaffold from '../../layout/MapScreenScaffold';

describe('MapScreenScaffold', () => {
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
  });

  it('모바일(기본)에서 panel이 렌더링된다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
    const mapRef = { current: null };
    render(
      <MapScreenScaffold
        mapRef={mapRef}
        panel={<div>패널내용</div>}
        map={<div>맵오버레이</div>}
        sheetHeader={<div>헤더</div>}
      />
    );
    expect(screen.getByText('패널내용')).toBeInTheDocument();
  });

  it('모바일에서 sheetHeader가 렌더링된다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
    const mapRef = { current: null };
    render(
      <MapScreenScaffold
        mapRef={mapRef}
        panel={<div>p</div>}
        sheetHeader={<div>시트헤더</div>}
      />
    );
    expect(screen.getByText('시트헤더')).toBeInTheDocument();
  });

  it('데스크탑(width >= 1024)에서 panel이 렌더링된다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    const mapRef = { current: null };
    render(
      <MapScreenScaffold
        mapRef={mapRef}
        panel={<div>데스크탑패널</div>}
        map={<div>m</div>}
      />
    );
    expect(screen.getByText('데스크탑패널')).toBeInTheDocument();
  });

  it('데스크탑에서 Panel(aside)이 렌더링된다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    const mapRef = { current: null };
    const { container } = render(
      <MapScreenScaffold
        mapRef={mapRef}
        panel={<div>p</div>}
        map={<div>m</div>}
      />
    );
    expect(container.querySelector('aside')).toBeInTheDocument();
  });

  it('map 오버레이가 렌더링된다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
    const mapRef = { current: null };
    render(
      <MapScreenScaffold
        mapRef={mapRef}
        panel={<div>p</div>}
        map={<div>지도오버레이</div>}
      />
    );
    expect(screen.getByText('지도오버레이')).toBeInTheDocument();
  });
});
