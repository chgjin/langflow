import { UniqueInputsComponents } from "../types";

export const getDisabledTooltip = (
  SBItemName: string,
  uniqueInputsComponents: UniqueInputsComponents,
) => {
  if (SBItemName === "ChatInput" && uniqueInputsComponents.chatInput) {
    return "已添加聊天输入";
  }
  if (SBItemName === "Webhook" && uniqueInputsComponents.webhookInput) {
    return "已添加 Webhook";
  }
  return "";
};
