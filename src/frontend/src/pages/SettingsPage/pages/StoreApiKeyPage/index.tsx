import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { CONTROL_PATCH_USER_STATE } from "@/constants/constants";
import { AuthContext } from "@/contexts/authContext";
import { usePostAddApiKey } from "@/controllers/API/queries/api-keys";
import useAlertStore from "@/stores/alertStore";
import { useStoreStore } from "@/stores/storeStore";
import { inputHandlerEventType } from "@/types/components";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import useScrollToElement from "../hooks/use-scroll-to-element";
import StoreApiKeyFormComponent from "./components/StoreApiKeyForm";

const StoreApiKeyPage = () => {
  const { scrollId } = useParams();
  const [inputState, setInputState] = useState(CONTROL_PATCH_USER_STATE);
  const { storeApiKey } = useContext(AuthContext);
  useScrollToElement(scrollId);

  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const {
    validApiKey,
    hasApiKey,
    loadingApiKey,
    updateHasApiKey: setHasApiKey,
    updateValidApiKey: setValidApiKey,
    updateLoadingApiKey: setLoadingApiKey,
  } = useStoreStore();

  const { mutate: addApiKey } = usePostAddApiKey({
    onSuccess: () => {
      setSuccessData({ title: "已成功保存 API 密钥" });
      setHasApiKey(true);
      setValidApiKey(true);
      setLoadingApiKey(false);
      handleInput({ target: { name: "apikey", value: "" } });
    },
    onError: (error) => {
      setErrorData({
        title: "API 密钥保存错误",
        list: [(error as any)?.response?.data?.detail],
      });
      setHasApiKey(false);
      setValidApiKey(false);
      setLoadingApiKey(false);
    },
  });

  const handleSaveKey = (apikey: string) => {
    if (apikey) {
      addApiKey({ key: apikey });
      storeApiKey(apikey);
    }
  };

  const handleInput = ({ target: { name, value } }: inputHandlerEventType) => {
    setInputState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex w-full items-start gap-6">
        <div className="flex w-full flex-col">
          <h2 className="flex items-center text-lg font-semibold tracking-tight">
            Langflow 商店
            <ForwardedIconComponent
              name="Store"
              className="ml-2 h-5 w-5 text-primary"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            管理对 Langflow Store 的访问。
          </p>
        </div>
      </div>
      <StoreApiKeyFormComponent
        apikey={inputState.apikey}
        handleInput={handleInput}
        handleSaveKey={handleSaveKey}
        loadingApiKey={loadingApiKey}
        validApiKey={validApiKey}
        hasApiKey={hasApiKey}
      />
    </div>
  );
};

export default StoreApiKeyPage;
