import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Panel, PanelHead } from '../../frontend/src/components/common/Panel';

describe('Panel', () => {
  it('children을 렌더링한다', () => {
    render(<Panel><div>내용</div></Panel>);
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('기본 width가 aside에 적용된다', () => {
    const { container } = render(<Panel><div /></Panel>);
    expect(container.querySelector('aside').style.width).toBe('404px');
  });

  it('커스텀 width가 적용된다', () => {
    const { container } = render(<Panel width={300}><div /></Panel>);
    expect(container.querySelector('aside').style.width).toBe('300px');
  });
});

describe('PanelHead', () => {
  it('title을 표시한다', () => {
    render(<PanelHead title="경로 비교" />);
    expect(screen.getByText('경로 비교')).toBeInTheDocument();
  });

  it('sub가 있으면 표시한다', () => {
    render(<PanelHead title="제목" sub="서브" />);
    expect(screen.getByText('서브')).toBeInTheDocument();
  });

  it('sub 없으면 표시되지 않는다', () => {
    render(<PanelHead title="제목" />);
    expect(screen.queryByText('서브')).not.toBeInTheDocument();
  });

  it('action이 있으면 렌더링된다', () => {
    render(<PanelHead title="제목" action={<button>새 탐색</button>} />);
    expect(screen.getByText('새 탐색')).toBeInTheDocument();
  });

  it('action 없으면 ml-auto 컨테이너가 없다', () => {
    const { container } = render(<PanelHead title="제목" />);
    expect(container.querySelector('.ml-auto')).not.toBeInTheDocument();
  });
});
