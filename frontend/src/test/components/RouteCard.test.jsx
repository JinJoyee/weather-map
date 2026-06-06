import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RouteCard from '../../components/Route/RouteCard';
import { IconSun } from '../../components/common/icons';

describe('RouteCard', () => {
  it('title을 표시한다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="최단 경로" />);
    expect(screen.getByText('최단 경로')).toBeInTheDocument();
  });

  it('recommended가 true일 때 "추천" 배지를 표시한다', () => {
    render(<RouteCard tone="weather" Icon={IconSun} title="날씨 최적" recommended />);
    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('recommended가 false일 때 "추천" 배지가 없다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="최단 경로" />);
    expect(screen.queryByText('추천')).not.toBeInTheDocument();
  });

  it('description을 표시한다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="t" description="카카오 내비 최단 경로" />);
    expect(screen.getByText('카카오 내비 최단 경로')).toBeInTheDocument();
  });

  it('eta를 표시한다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="t" eta={15} />);
    expect(screen.getByText('약 15분')).toBeInTheDocument();
  });

  it('distance를 표시한다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="t" distance="1.2km" />);
    expect(screen.getByText('· 1.2km')).toBeInTheDocument();
  });

  it('onSelect 클릭 시 콜백이 호출된다', async () => {
    const onSelect = vi.fn();
    render(<RouteCard tone="primary" Icon={IconSun} title="t" onSelect={onSelect} />);
    await userEvent.click(screen.getByText('t').closest('div[class*="rounded-card"]'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('selected일 때 ring 스타일이 적용된다', () => {
    const { container } = render(<RouteCard tone="primary" Icon={IconSun} title="t" selected />);
    expect(container.firstChild.className).toContain('ring-2');
  });

  it('onNavigate가 있으면 "카카오 내비로 안내" 버튼을 표시한다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="t" onNavigate={vi.fn()} />);
    expect(screen.getByText('카카오 내비로 안내')).toBeInTheDocument();
  });

  it('내비 버튼 클릭 시 onNavigate가 호출된다', async () => {
    const onNavigate = vi.fn();
    render(<RouteCard tone="primary" Icon={IconSun} title="t" onNavigate={onNavigate} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByText('카카오 내비로 안내'));
    expect(onNavigate).toHaveBeenCalled();
  });

  it('weather tone으로 렌더링된다', () => {
    const { container } = render(<RouteCard tone="weather" Icon={IconSun} title="t" />);
    expect(container.firstChild.className).toContain('border-weather');
  });

  it('eta와 distance가 모두 null이면 표시하지 않는다', () => {
    render(<RouteCard tone="primary" Icon={IconSun} title="t" />);
    expect(screen.queryByText(/분/)).not.toBeInTheDocument();
  });
});
