import { render, screen } from '@testing-library/react';
import { Panel, PanelHead } from '../../components/common/Panel';

describe('Panel', () => {
  it('children이 렌더링된다', () => {
    render(<Panel><div>패널내용</div></Panel>);
    expect(screen.getByText('패널내용')).toBeInTheDocument();
  });

  it('aside 태그로 렌더링된다', () => {
    const { container } = render(<Panel><div>c</div></Panel>);
    expect(container.querySelector('aside')).toBeInTheDocument();
  });

  it('custom width가 적용된다', () => {
    const { container } = render(<Panel width={300}><div>c</div></Panel>);
    expect(container.querySelector('aside').style.width).toBe('300px');
  });
});

describe('PanelHead', () => {
  it('title을 표시한다', () => {
    render(<PanelHead title="경로 비교" />);
    expect(screen.getByText('경로 비교')).toBeInTheDocument();
  });

  it('sub가 있으면 표시한다', () => {
    render(<PanelHead title="t" sub="2개 추천" />);
    expect(screen.getByText('2개 추천')).toBeInTheDocument();
  });

  it('sub가 없으면 표시하지 않는다', () => {
    render(<PanelHead title="t" />);
    expect(screen.queryByText('2개 추천')).not.toBeInTheDocument();
  });

  it('action이 있으면 렌더링된다', () => {
    render(<PanelHead title="t" action={<button>액션버튼</button>} />);
    expect(screen.getByText('액션버튼')).toBeInTheDocument();
  });

  it('action이 없으면 렌더링되지 않는다', () => {
    render(<PanelHead title="t" />);
    expect(screen.queryByText('액션버튼')).not.toBeInTheDocument();
  });
});
