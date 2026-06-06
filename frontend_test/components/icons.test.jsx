import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  IconMap, IconRoute, IconPen, IconBookmark, IconUser, IconSearch,
  IconClock, IconSun, IconCloud, IconRain, IconNav, IconPlus,
  IconChevR, IconChevL, IconCheck, IconX, IconWalk, IconBike, IconCar,
  IconStar, IconLock, IconGlobe, IconWifiOff, IconMapOff, IconMail,
  IconLayers, WeatherGlyph,
} from '../../frontend/src/components/common/icons';

describe('icons', () => {
  const ICONS = [
    IconMap, IconRoute, IconPen, IconBookmark, IconUser, IconSearch,
    IconClock, IconSun, IconCloud, IconRain, IconNav, IconPlus,
    IconChevR, IconChevL, IconCheck, IconX, IconWalk, IconBike, IconCar,
    IconStar, IconLock, IconGlobe, IconWifiOff, IconMapOff, IconMail, IconLayers,
  ];

  ICONS.forEach((Icon) => {
    it(`${Icon.name}이 SVG를 렌더링한다`, () => {
      const { container } = render(<Icon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('fill=true 시 fill="currentColor"로 렌더링된다', () => {
    const { container } = render(<IconStar fill />);
    expect(container.querySelector('svg').getAttribute('fill')).toBe('currentColor');
  });

  it('커스텀 size가 적용된다', () => {
    const { container } = render(<IconMap size={30} />);
    expect(container.querySelector('svg').getAttribute('width')).toBe('30');
  });

  describe('WeatherGlyph', () => {
    it('"비"이면 IconRain을 렌더링한다', () => {
      const { container } = render(<WeatherGlyph kind="비" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('"눈"이면 IconCloud를 렌더링한다', () => {
      const { container } = render(<WeatherGlyph kind="눈" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('"흐림"이면 IconCloud를 렌더링한다', () => {
      const { container } = render(<WeatherGlyph kind="흐림" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('"구름많음"이면 IconCloud를 렌더링한다', () => {
      const { container } = render(<WeatherGlyph kind="구름많음" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('기본값("맑음")이면 IconSun을 렌더링한다', () => {
      const { container } = render(<WeatherGlyph kind="맑음" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('kind 없으면 기본값 사용한다', () => {
      const { container } = render(<WeatherGlyph />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
