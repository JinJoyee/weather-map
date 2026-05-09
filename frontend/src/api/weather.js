import { api } from "./client";
  /**
   * 현재 위치의 날씨 + UV 지수를 백엔드에서 가져옵니다.
   * 백엔드: GET /api/weather/current?lat={lat}&lng={lng}
   *
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @returns {Promise<{lat:number, lng:number, rain_probability:number, snow_probability:number,
  uv_index:number, weather:string}>}
   */
export const fetchCurrentWeather =async(lat,lng)=> {
    const {data} = await api.get('/api/weather/current',{
        params: {lat ,lng},
    });
    return data;
};