import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('../../frontend/src/api/client', () => ({
  api: { get: mockGet },
}));

import { fetchCurrentWeather } from '../../frontend/src/api/weather';

describe('weather API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 날씨 데이터를 반환한다', async () => {
    mockGet.mockResolvedValue({ data: { weather: '맑음', uv_index: 3, rain_probability: 5 } });
    const result = await fetchCurrentWeather(36.35, 127.38);
    expect(result.weather).toBe('맑음');
  });

  it('응답에 uv_index, rain_probability 필드가 포함된다', async () => {
    mockGet.mockResolvedValue({ data: { weather: '흐림', uv_index: 1, rain_probability: 30 } });
    const result = await fetchCurrentWeather(36.35, 127.38);
    expect(result.uv_index).toBeDefined();
    expect(result.rain_probability).toBeDefined();
  });

  it('API 실패 시 에러를 throw한다', async () => {
    mockGet.mockRejectedValue(new Error('500'));
    await expect(fetchCurrentWeather(36.35, 127.38)).rejects.toThrow();
  });

  it('올바른 좌표 파라미터로 API를 호출한다', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await fetchCurrentWeather(36.35, 127.38);
    expect(mockGet).toHaveBeenCalledWith('/api/weather/current', {
      params: { lat: 36.35, lng: 127.38 },
    });
  });
});
