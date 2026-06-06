import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import RouteCard from '../../frontend/src/components/Route/RouteCard';

const baseProps = {
  tone: 'primary',
  Icon: () => <svg />,
  title: '최단 경로',
  description: '테스트 설명',
  eta: 15,
  distance: '3.2km',
  selected: false,
  onSelect: vi.fn(),
  onNavigate: vi.fn(),
};

describe('RouteCard', () => {
  it('title을 표시한다', () => {
    render(<RouteCard {...baseProps} />);
    expect(screen.getByText('최단 경로')).toBeInTheDocument();
  });

  it('description을 표시한다', () => {
    render(<RouteCard {...baseProps} />);
    expect(screen.getByText('테스트 설명')).toBeInTheDocument();
  });

  it('eta가 있으면 "약 15분"을 표시한다', () => {
    render(<RouteCard {...baseProps} />);
    expect(screen.getByText('약 15분')).toBeInTheDocument();
  });

  it('distance가 있으면 거리를 표시한다', () => {
    render(<RouteCard {...baseProps} />);
    expect(screen.getByText('· 3.2km')).toBeInTheDocument();
  });

  it('recommended=true 시 "추천" 배지를 표시한다', () => {
    render(<RouteCard {...baseProps} recommended />);
    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('onNavigate 있으면 "카카오 내비로 안내" 버튼을 표시한다', () => {
    render(<RouteCard {...baseProps} />);
    expect(screen.getByText('카카오 내비로 안내')).toBeInTheDocument();
  });

  it('eta=null 일 때 eta 텍스트가 없다', () => {
    render(<RouteCard {...baseProps} eta={null} />);
    expect(screen.queryByText(/약 \d+분/)).not.toBeInTheDocument();
  });

  it('selected=true 시 컨테이너에 ring-2 클래스가 적용된다', () => {
    const { container } = render(<RouteCard {...baseProps} selected />);
    expect(container.firstChild.className).toMatch(/ring-2/);
  });

  it('"카카오 내비로 안내" 버튼 클릭 시 onNavigate가 호출된다', () => {
    const onNavigate = vi.fn();
    render(<RouteCard {...baseProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('카카오 내비로 안내'));
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it('onNavigate 없으면 내비 버튼이 표시되지 않는다', () => {
    render(<RouteCard {...{ ...baseProps, onNavigate: undefined }} />);
    expect(screen.queryByText('카카오 내비로 안내')).not.toBeInTheDocument();
  });

  it('tone="weather" 시 weather 색상 클래스가 적용된다', () => {
    const { container } = render(<RouteCard {...baseProps} tone="weather" />);
    expect(container.firstChild.className).toMatch(/border-weather/);
  });
});
