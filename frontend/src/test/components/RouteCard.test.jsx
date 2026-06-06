import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import RouteCard from '../../components/Route/RouteCard';

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

  it('selected=false 시 선택 링 스타일이 없다', () => {
    const { container } = render(<RouteCard {...baseProps} selected={false} />);
    expect(container.firstChild.className).not.toContain('ring-2');
  });

  it('selected=true 시 선택 링 스타일이 적용된다', () => {
    const { container } = render(<RouteCard {...baseProps} selected />);
    expect(container.firstChild.className).toContain('ring-2');
  });

  it('recommended=true 시 "추천" 배지를 표시한다', () => {
    render(<RouteCard {...baseProps} recommended />);
    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('eta=null 시 소요시간이 표시되지 않는다', () => {
    render(<RouteCard {...baseProps} eta={null} />);
    expect(screen.queryByText(/약.*분/)).not.toBeInTheDocument();
  });
});
