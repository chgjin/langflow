import { AxiosError, AxiosHeaders } from "axios";

export const createNewError503 = (): AxiosError => {
  const headers = new AxiosHeaders({
    "Content-Type": "application/json",
  });

  const config = {
    url: "/",
    method: "get",
    headers: headers,
  };

  const error = new AxiosError("服务器繁忙", "ECONNABORTED", config, null, {
    status: 503,
    statusText: "服务不可用",
    data: "服务器当前正忙，请稍后重试。",
    headers: {},
    config: config,
  });

  return error;
};
