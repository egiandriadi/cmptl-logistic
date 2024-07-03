import axios, { AxiosResponse } from "axios";
import { headerAxiosConfig } from "./config/axios-config";
import JneApi from "./jne-api";
import JneApiServiceInterface from "./jne-api-service.interface";
import CheckTariffRequestDto from "./dto/check-tariff-request.dto";
import CheckTariffResponseDto from "./dto/check-tariff-response.dto";
import CreateOrderRequestDto from "./dto/create-order-request.dto";
import CreateOrderResponseDto from "./dto/create-order-response.dto";
import CancelOrderRequestDto from "./dto/cancel-order-request.dto";
import CancelOrderResponseDto from "./dto/cancel-order-response.dto";
import TrackRequestDto from "./dto/track-request.dto";
import TrackResponseDto from "./dto/track-response.dto";
import { HTTP_STATUS } from "../../../constants/http-status";

export default class JneApiService implements JneApiServiceInterface {
  protected jneApi : JneApi;

  constructor() {
    this.jneApi = new JneApi();
  }

  async checkTariff(checkTariffRequestDto : CheckTariffRequestDto): Promise<CheckTariffResponseDto> {
    console.log("🚀 ~ JneApiService ~ checkTariff ~ checkTariffRequestDto:", checkTariffRequestDto);

    const res = await this.requestAxios(this.jneApi.checkTariff(), checkTariffRequestDto);
    const isHttpError = res.status !== HTTP_STATUS.OK;
    const isStatusError = res.data.status === false;

    if (isHttpError || isStatusError) {
      console.error("🚀 ~ JneApiService ~ checkTariff ~ error:", res.data);
      throw new Error(res.data?.error);
    }

    return new CheckTariffResponseDto(res.data);
  }

  async createOrder(createOrderRequestDto : CreateOrderRequestDto) : Promise<CreateOrderResponseDto> {
    console.log("🚀 ~ JneApiService ~ createOrder ~ createOrderRequestDto:", createOrderRequestDto);

    const res = await this.requestAxios(this.jneApi.createOrder(), createOrderRequestDto);
    const isHttpError = res.status !== HTTP_STATUS.OK;
    const isStatusError = res.data.status === false;

    if (isHttpError || isStatusError) {
      console.error("🚀 ~ JneApiService ~ createOrder ~ error:", res.data);
      throw new Error(res.data?.error);
    }

    return new CreateOrderResponseDto(res.data);
  }

  async cancelOrder(cancelOrderRequestDto : CancelOrderRequestDto) : Promise<CancelOrderResponseDto> {
    console.log("🚀 ~ JneApiService ~ cancelOrder ~ cancelOrderRequestDto:", cancelOrderRequestDto);

    const res = await this.requestAxios(this.jneApi.cancelOrder(), cancelOrderRequestDto);
    const isHttpError = res.status !== HTTP_STATUS.OK;
    const isStatusError = res.data.status === false;

    if (isHttpError || isStatusError) {
      console.error("🚀 ~ JneApiService ~ createOrder ~ error:", res.data);
      throw new Error(res.data?.error);
    }
    
    return new CancelOrderResponseDto(res.data);
  }

  async track(awbData: TrackRequestDto) : Promise<TrackResponseDto> {
    try {
      console.log("🚀 ~ JneApiService ~ track status:", awbData);
      const url = this.jneApi.trackStatus() + `/${awbData.awb}`;
      const params = Object.assign({}, {
        username: awbData.username,
        api_key: awbData.api_key
      });
      const res = await axios.post(url, params, headerAxiosConfig);
      console.log("🚀 ~ JneApiService ~ track response:", res.data);
      const { cnote, photo_history, detail, history, error } = res.data;
      if (error) throw new Error("Data gagal diambil");
      return TrackResponseDto.hydrate(cnote, photo_history, detail, history);
    } catch (error) {
      if (axios.isAxiosError(error)) throw new Error(error.response?.data.msg);
      else throw error;
    }
  }

  private async requestAxios(url: string, requestDto: any, method: string = "post") : Promise<AxiosResponse> {
    const options = {
      method: method,
      url,
      headers: headerAxiosConfig.headers,
      validateStatus: (status: number) => status >= HTTP_STATUS.OK && status <= HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timeout: 60000,
      data: requestDto,
    };

    return await axios.request(options);
  }
}