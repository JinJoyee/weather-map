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

  it('eta가 있으면 "15분"을 표시한다', () => {
    render(<RouteCard {...baseProps} />);
    expect(screen.getByText('15분')).toBeInTheDocument();
  });

  it('selected=false 시 "이 경로 선택" 버튼을 표시한다', () => {
    render(<RouteCard {...baseProps} selected={false} />);
    expect(screen.getByText('이 경로 선택')).toBeInTheDocument();
  });

  it('selected=true 시 "선택됨" 버튼을 표시한다', () => {
    render(<RouteCard {...baseProps} selected />);
    expect(screen.getByText('선택됨')).toBeInTheDocument();
  });

  it('recommended=true 시 "추천" 배지를 표시한다', () => {
    render(<RouteCard {...baseProps} recommended />);
    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('eta=null 시 "이 이동수단은 지원하지 않아요"를 표시한다', () => {
    render(<RouteCard {...baseProps} eta={null} />);
    expect(screen.getByText('이 이동수단은 지원하지 않아요')).toBeInTheDocument();
  });
});
