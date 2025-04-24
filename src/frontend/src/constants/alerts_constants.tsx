// 错误
export const MISSED_ERROR_ALERT = "Oops! Looks like you missed something";
export const INCOMPLETE_LOOP_ERROR_ALERT =
  "工作流具有不完整的循环。请检查您的连接，然后重试。";
export const INVALID_FILE_ALERT =
  "请选择一个有效的文件。只允许以下文件类型:";
export const CONSOLE_ERROR_MSG = "上传文件时出错";
export const CONSOLE_SUCCESS_MSG = "文件上传成功";
export const INFO_MISSING_ALERT =
  "哎呀！看起来您错过了一些必需的信息：";
export const FUNC_ERROR_ALERT = "您的函数中有错误";
export const IMPORT_ERROR_ALERT = "导入时出错";
export const BUG_ALERT = "出错了，请重试";
export const CODE_ERROR_ALERT =
  "此代码有问题，请查阅";
export const CHAT_ERROR_ALERT =
  "请在使用聊天之前重新构建流。";
export const MSG_ERROR_ALERT = "发送消息时出错";
export const PROMPT_ERROR_ALERT =
  "此提示有问题，请审核";
export const API_ERROR_ALERT =
  "保存 API key时出错，请重试。";
export const USER_DEL_ERROR_ALERT = "删除用户时出错";
export const USER_EDIT_ERROR_ALERT = "编辑用户时出错";
export const USER_ADD_ERROR_ALERT = "添加新用户时出错";
export const SIGNIN_ERROR_ALERT = "登录时出错";
export const DEL_KEY_ERROR_ALERT = "删除键时出错";
export const DEL_KEY_ERROR_ALERT_PLURAL = "删除键时出错";
export const UPLOAD_ERROR_ALERT = "上传文件时出错";
export const WRONG_FILE_ERROR_ALERT = "文件类型无效";
export const UPLOAD_ALERT_LIST = "请上传 JSON 文件";
export const INVALID_SELECTION_ERROR_ALERT = "选择无效";
export const EDIT_PASSWORD_ERROR_ALERT = "更改密码时出错";
export const EDIT_PASSWORD_ALERT_LIST = "密码不匹配";
export const SAVE_ERROR_ALERT = "保存更改时出错";
export const PROFILE_PICTURES_GET_ERROR_ALERT =
  "检索个人资料照片时出错";
export const SIGNUP_ERROR_ALERT = "注册时出错";
export const APIKEY_ERROR_ALERT = "API Key 错误";
export const NOAPI_ERROR_ALERT =
  "您没有 API key。请添加一个以使用 Langflow Store。";
export const INVALID_API_ERROR_ALERT =
  "您的 API key无效。请添加有效的 API key以使用 Langflow Store。";
export const COMPONENTS_ERROR_ALERT = "获取组件时出错。";

// 通知
export const NOCHATOUTPUT_NOTICE_ALERT =
  "工作流中没有 ChatOutput 组件。";
export const API_WARNING_NOTICE_ALERT =
  "警告：关键数据、JSON 文件可能包含 API key。";
export const COPIED_NOTICE_ALERT = "API Key 已复制!";
export const TEMP_NOTICE_ALERT = "您的模板没有任何变量。";

// SUCCESS
export const CODE_SUCCESS_ALERT = "代码已准备好运行";
export const PROMPT_SUCCESS_ALERT = "Prompt 已装备好";
export const API_SUCCESS_ALERT = "Success！您的 API key已保存。";
export const USER_DEL_SUCCESS_ALERT = "Success! 用户已删除!";
export const USER_EDIT_SUCCESS_ALERT = "Success! 完成用户编辑!";
export const USER_ADD_SUCCESS_ALERT = "Success! 已添加新用户!";
export const DEL_KEY_SUCCESS_ALERT = "Success! 已删除密钥!";
export const DEL_KEY_SUCCESS_ALERT_PLURAL = "Success! 已删除的密钥!";
export const FLOW_BUILD_SUCCESS_ALERT = `成功构建工作流`;
export const SAVE_SUCCESS_ALERT = "已成功保存更改!";
export const INVALID_FILE_SIZE_ALERT = (maxSizeMB) => {
  return `T文件大小太大。请选择小于 ${maxSizeMB} 的文件。`;
};
