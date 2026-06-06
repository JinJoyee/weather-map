import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('../../api/client', () => ({
  api: { get: mockGet },
}));

import { fetchRouteRecommend } from '../../api/route';

describe('route API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 routes.normal을 반환한다', async () => {
    mockGet.mockResolvedValue({
      data: { routes: { normal: { polyline: [] }, context: { polyline: [] } } },
    });
    const result = await fetchRouteRecommend(36.33, 127.43, 36.37, 127.34);
    expect(result.routes.normal).toBeDefined();
  });

  it('성공 시 routes.context를 반환한다', async () => {
    mockGet.mockResolvedValue({
      data: { routes: { normal: {}, context: {} }, recommendation: '맑음' },
    });
    const result = await fetchRouteRecommend(36.33, 127.43, 36.37, 127.34);
    expect(result.routes.context).toBeDefined();
  });

  it('API 실패 시 에러를 throw한다', async () => {
    mockGet.mockRejectedValue(new Error('network'));
    await expect(fetchRouteRecommend(0, 0, 0, 0)).rejects.toThrow();
  });

  it('올바른 파라미터로 API를 호출한다', async () => {
    mockGet.mockResolvedValue({ data: { routes: {} } });
    await fetchRouteRecommend(36.33, 127.43, 36.37, 127.34);
    expect(mockGet).toHaveBeenCalledWith('/api/route/recommend', {
      params: { start_lat: 36.33, start_lng: 127.43, end_lat: 36.37, end_lng: 127.34 },
    });
  });

  it('recommendation 필드가 응답에 포함된다', async () => {
    mockGet.mockResolvedValue({ data: { routes: {}, recommendation: '맑은 날씨' } });
    const result = await fetchRouteRecommend(36.33, 127.43, 36.37, 127.34);
    expect(result.recommendation).toBe('맑은 날씨');
  });
});
