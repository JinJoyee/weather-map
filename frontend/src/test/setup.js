import '@testing-library/jest-dom';

// Kakao Maps SDK mock — vi.fn().mockImplementation은 일반 function 사용해야 new 키워드 동작
Object.defineProperty(window, 'kakao', {
  value: {
    maps: {
      Map: vi.fn().mockImplementation(function () {
        this.setCenter = vi.fn();
        this.setBounds = vi.fn();
        this.getCenter = vi.fn();
      }),
      Marker: vi.fn().mockImplementation(function () {
        this.setMap = vi.fn();
        this.setOptions = vi.fn();
      }),
      Polyline: vi.fn().mockImplementation(function () {
        this.setMap = vi.fn();
        this.setOptions = vi.fn();
      }),
      LatLng: vi.fn().mockImplementation(function (lat, lng) {
        this.getLat = () => lat;
        this.getLng = () => lng;
      }),
      LatLngBounds: vi.fn().mockImplementation(function () {
        this.extend = vi.fn();
        this.isEmpty = vi.fn(() => false);
      }),
      CustomOverlay: vi.fn().mockImplementation(function () {
        this.setMap = vi.fn();
      }),
      event: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  },
  writable: true,
});
