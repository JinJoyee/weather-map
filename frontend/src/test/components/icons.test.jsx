import { render } from '@testing-library/react';
import {
  IconMap, IconRoute, IconPen, IconBookmark, IconUser, IconSearch, IconClock,
  IconSun, IconCloud, IconRain, IconNav, IconPlus, IconChevR, IconChevL,
  IconCheck, IconX, IconWalk, IconBike, IconCar, IconStar, IconLock,
  IconGlobe, IconWifiOff, IconMapOff, IconMail, IconLayers, WeatherGlyph,
} from '../../components/common/icons';

describe('icons', () => {
  it('모든 아이콘이 SVG를 렌더링한다', () => {
    const { container } = render(
      <>
        <IconMap /><IconRoute /><IconPen /><IconBookmark /><IconUser />
        <IconSearch /><IconClock /><IconSun /><IconCloud /><IconRain />
        <IconNav /><IconPlus /><IconChevR /><IconChevL /><IconCheck />
        <IconX /><IconWalk /><IconBike /><IconCar /><IconStar />
        <IconLock /><IconGlobe /><IconWifiOff /><IconMapOff /><IconMail />
        <IconLayers />
      </>
    );
    expect(container.querySelectorAll('svg').length).toBe(26);
  });

  it('아이콘에 size prop이 적용된다', () => {
    const { container } = render(<IconSun size={30} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '30');
  });

  it('아이콘에 className prop이 적용된다', () => {
    const { container } = render(<IconSun className="text-red-500" />);
    expect(container.querySelector('svg').getAttribute('class')).toContain('text-red-500');
  });

  it('fill=true일 때 fill이 currentColor로 설정된다', () => {
    const { container } = render(<IconSun fill={true} />);
    expect(container.querySelector('svg').getAttribute('fill')).toBe('currentColor');
  });

  it('WeatherGlyph kind="비"가 렌더링된다', () => {
    const { container } = render(<WeatherGlyph kind="비" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('WeatherGlyph kind="눈"이 렌더링된다', () => {
    const { container } = render(<WeatherGlyph kind="눈" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('WeatherGlyph kind="흐림"이 렌더링된다', () => {
    const { container } = render(<WeatherGlyph kind="흐림" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('WeatherGlyph kind="구름많음"이 렌더링된다', () => {
    const { container } = render(<WeatherGlyph kind="구름많음" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('WeatherGlyph 기본값(맑음)이 렌더링된다', () => {
    const { container } = render(<WeatherGlyph />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('WeatherGlyph에 custom className이 적용된다', () => {
    const { container } = render(<WeatherGlyph kind="비" className="text-custom" />);
    expect(container.querySelector('svg').getAttribute('class')).toContain('text-custom');
  });

  it('WeatherGlyph에 custom size가 적용된다', () => {
    const { container } = render(<WeatherGlyph kind="맑음" size={30} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '30');
  });
});
