// src/constants/constants.ts

import custom from "../customization/config-constants";
import { languageMap } from "../types/components";

/**
 * 工作流名称中的无效字符
 * @constant
 */
export const INVALID_CHARACTERS = [
  " ",
  ",",
  ".",
  ":",
  ";",
  "!",
  "?",
  "/",
  "\\",
  "(",
  ")",
  "[",
  "]",
  "\n",
];

/**
 * 用于突出显示文本中变量的正则表达式
 * @constant regexHighlight
 * @type {RegExp}
 * @default
 * @example
 * {{variable}} 或 {variable}
 * @returns {RegExp}
 * @description
 * 此正则表达式用于突出显示文本中���变量。
 * 它匹配文本中包含在 {{}} 或 {} 内的变量。
 */

export const regexHighlight = /\{\{(.*?)\}\}|\{([^{}]+)\}/g;
export const specialCharsRegex = /[!@#$%^&*()\-_=+[\]{}|;:'",.<>/?\\`´]/;

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  // 在此处添加更多文件扩展名，确保键与 CodeBlock.tsx 组件中的 language 属性相同
};
/**
 * 工具提示中滚动组件的最大数量
 * @constant
 */
export const MAX_LENGTH_TO_SCROLL_TOOLTIP = 200;

export const MESSAGES_TABLE_ORDER = [
  "timestamp",
  "message",
  "text",
  "sender",
  "sender_name",
  "session_id",
  "files",
];

/**
 * 工具提示中滚动组件的最大数量
 * @constant
 */
export const MAX_WORDS_HIGHLIGHT = 79;

/**
 * 字段模态框显示滚动条前的项目限制
 * @constant
 */
export const limitScrollFieldsModal = 10;

/**
 * 导出对话框（工具栏）的基本副标题文本
 * @constant
 */
export const EXPORT_DIALOG_SUBTITLE = "将工作流导出为JSON文件。";
/**
 * 工作流设置（菜单栏）的基本副标题文本
 * @constant
 */
export const SETTINGS_DIALOG_SUBTITLE = "自定义您的工作流。";

/**
 * 工作流日志（菜单栏）的基本副标题文本
 * @constant
 */
export const LOGS_DIALOG_SUBTITLE = "查看组件之间事件和交互的详细日志。";

/**
 * 代码对话框（工具栏）的基本副标题文本
 * @constant
 */
export const CODE_DIALOG_SUBTITLE = "导出您的工作流以便使用此代码进行集成。";

/**
 * 聊天表单的基本副标题文本
 * @constant
 */
export const CHAT_FORM_DIALOG_SUBTITLE = "与您的AI交互。监控输入、输出和记忆。";

/**
 * 编辑节点对话框的基本副标题文本
 * @constant
 */
export const EDIT_DIALOG_SUBTITLE = "调整组件设置并定义参数可见性。记得保存您的更改。";

/**
 * 代码对话框的基本副标题文本
 * @constant
 */
export const CODE_PROMPT_DIALOG_SUBTITLE = "编辑您的Python代码片段。有关如何编写自己的组件的更多信息，请参阅Langflow文档。";

export const CODE_DICT_DIALOG_SUBTITLE = "自定义您的字典，根据需要添加或编辑键值对。支持添加新对象{}或数组[]。";

/**
 * 提示对话框的基本副标题文本
 * @constant
 */
export const PROMPT_DIALOG_SUBTITLE = "创建您的提示。提示可以帮助指导语言模型的行为。使用花括号{}引入变量。";

export const CHAT_CANNOT_OPEN_TITLE = "无法打开聊天";

export const CHAT_CANNOT_OPEN_DESCRIPTION = "这不是一个聊天工作流。";

export const FLOW_NOT_BUILT_TITLE = "工作流未构建";

export const FLOW_NOT_BUILT_DESCRIPTION = "请在聊天前构建工作流。";

/**
 * 文本对话框的基本标题文本
 * @constant
 */
export const TEXT_DIALOG_TITLE = "编辑文本内容";

/**
 * 导入对话框的基本副标题文本
 * @constant
 */
export const IMPORT_DIALOG_SUBTITLE = "从JSON文件导入工作流或从预先存在的示例中选择。";

/**
 * 工具提示为空时显示的文本
 * @constant
 */
export const TOOLTIP_EMPTY = "未找到兼容的组件。";

export const CSVViewErrorTitle = "CSV输出";

export const CSVNoDataError = "无可用数据";

export const PDFViewConstant = "展开输出以查看PDF";

export const CSVError = "加载CSV错误";

export const PDFLoadErrorTitle = "加载PDF错误";

export const PDFCheckFlow = "请检查您的工作流并重试";

export const PDFErrorTitle = "PDF输出";

export const PDFLoadError = "运行工作流以查看pdf";

export const IMGViewConstant = "展开视图以查看图片";

export const IMGViewErrorMSG = "运行工作流或提供有效的URL以查看您的图片";

export const IMGViewErrorTitle = "图片输出";

/**
 * 代码对话框的基本副标题文本
 * @constant
 */
export const EXPORT_CODE_DIALOG = "生成代码以将您的工作流集成到外部应用程序中。";

/**
 * 代码对话框的基本副标题文本
 * @constant
 */
export const COLUMN_DIV_STYLE = " w-full h-full flex overflow-auto flex-col bg-muted px-16 ";

export const NAV_DISPLAY_STYLE = " w-full flex justify-between py-12 pb-2 px-6 ";

/**
 * 代码对话框的基本副标题文本
 * @constant
 */
export const DESCRIPTIONS: string[] = [
  "连接语言，掌握文字！",
  "语言架构师在工作！",
  "赋能语言工程。",
  "在此构建语言连接。",
  "创建，连接，对话。",
  "智能链，更智能的对话。",
  "为卓越架起提示桥梁。",
  "语言模型，尽情释放。",
  "您的文本生成中心。",
  "妙趣横生的提示！",
  "构建语言迷宫。",
  "Langflow：创建，链接，沟通。",
  "连接点，构建语言。",
  "互动语言编织。",
  "生成，创新，沟通。",
  "对话催化引擎。",
  "语言链接大师。",
  "用Langflow设计对话。",
  "在此培育NLP节点。",
  "对话制图已解锁。",
  "设计，开发，对话。",
];
export const BUTTON_DIV_STYLE = " flex gap-2 focus:ring-1 focus:ring-offset-1 focus:ring-ring focus:outline-none ";

/**
 * 代码对话框的基本副标题文本
 * @constant
 */
export const ADJECTIVES: string[] = [
  "admiring",
  "adoring",
  "agitated",
  "amazing",
  "angry",
  "awesome",
  "backstabbing",
  "berserk",
  "big",
  "boring",
  "clever",
  "cocky",
  "compassionate",
  "condescending",
  "cranky",
  "desperate",
  "determined",
  "distracted",
  "dreamy",
  "drunk",
  "ecstatic",
  "elated",
  "elegant",
  "evil",
  "fervent",
  "focused",
  "furious",
  "gigantic",
  "gloomy",
  "goofy",
  "grave",
  "happy",
  "high",
  "hopeful",
  "hungry",
  "insane",
  "jolly",
  "jovial",
  "kickass",
  "lonely",
  "loving",
  "mad",
  "modest",
  "naughty",
  "nauseous",
  "nostalgic",
  "pedantic",
  "pensive",
  "prickly",
  "reverent",
  "romantic",
  "sad",
  "serene",
  "sharp",
  "sick",
  "silly",
  "sleepy",
  "small",
  "stoic",
  "stupefied",
  "suspicious",
  "tender",
  "thirsty",
  "tiny",
  "trusting",
  "bubbly",
  "charming",
  "cheerful",
  "comical",
  "dazzling",
  "delighted",
  "dynamic",
  "effervescent",
  "enthusiastic",
  "exuberant",
  "fluffy",
  "friendly",
  "funky",
  "giddy",
  "giggly",
  "gleeful",
  "goofy",
  "graceful",
  "grinning",
  "hilarious",
  "inquisitive",
  "joyous",
  "jubilant",
  "lively",
  "mirthful",
  "mischievous",
  "optimistic",
  "peppy",
  "perky",
  "playful",
  "quirky",
  "radiant",
  "sassy",
  "silly",
  "spirited",
  "sprightly",
  "twinkly",
  "upbeat",
  "vibrant",
  "witty",
  "zany",
  "zealous",
];
/**
 * 工作流名称的名词
 * @constant
 *
 */
export const NOUNS: string[] = [
  "albattani",
  "allen",
  "almeida",
  "archimedes",
  "ardinghelli",
  "aryabhata",
  "austin",
  "babbage",
  "banach",
  "bardeen",
  "bartik",
  "bassi",
  "bell",
  "bhabha",
  "bhaskara",
  "blackwell",
  "bohr",
  "booth",
  "borg",
  "bose",
  "boyd",
  "brahmagupta",
  "brattain",
  "brown",
  "carson",
  "chandrasekhar",
  "colden",
  "cori",
  "cray",
  "curie",
  "darwin",
  "davinci",
  "dijkstra",
  "dubinsky",
  "easley",
  "einstein",
  "elion",
  "engelbart",
  "euclid",
  "euler",
  "fermat",
  "fermi",
  "feynman",
  "franklin",
  "galileo",
  "gates",
  "goldberg",
  "goldstine",
  "goldwasser",
  "golick",
  "goodall",
  "hamilton",
  "hawking",
  "heisenberg",
  "heyrovsky",
  "hodgkin",
  "hoover",
  "hopper",
  "hugle",
  "hypatia",
  "jang",
  "jennings",
  "jepsen",
  "joliot",
  "jones",
  "kalam",
  "kare",
  "keller",
  "khorana",
  "kilby",
  "kirch",
  "knuth",
  "kowalevski",
  "lalande",
  "lamarr",
  "leakey",
  "leavitt",
  "lichterman",
  "liskov",
  "lovelace",
  "lumiere",
  "mahavira",
  "mayer",
  "mccarthy",
  "mcclintock",
  "mclean",
  "mcnulty",
  "meitner",
  "meninsky",
  "mestorf",
  "minsky",
  "mirzakhani",
  "morse",
  "murdock",
  "newton",
  "nobel",
  "noether",
  "northcutt",
  "noyce",
  "panini",
  "pare",
  "pasteur",
  "payne",
  "perlman",
  "pike",
  "poincare",
  "poitras",
  "ptolemy",
  "raman",
  "ramanujan",
  "ride",
  "ritchie",
  "roentgen",
  "rosalind",
  "saha",
  "sammet",
  "shaw",
  "shirley",
  "shockley",
  "sinoussi",
  "snyder",
  "spence",
  "stallman",
  "stonebraker",
  "swanson",
  "swartz",
  "swirles",
  "tesla",
  "thompson",
  "torvalds",
  "turing",
  "varahamihira",
  "visvesvaraya",
  "volhard",
  "wescoff",
  "williams",
  "wilson",
  "wing",
  "wozniak",
  "wright",
  "yalow",
  "yonath",
  "coulomb",
  "degrasse",
  "dewey",
  "edison",
  "eratosthenes",
  "faraday",
  "galton",
  "gauss",
  "herschel",
  "hubble",
  "joule",
  "kaku",
  "kepler",
  "khayyam",
  "lavoisier",
  "maxwell",
  "mendel",
  "mendeleev",
  "ohm",
  "pascal",
  "planck",
  "riemann",
  "schrodinger",
  "sagan",
  "tesla",
  "tyson",
  "volta",
  "watt",
  "weber",
  "wien",
  "zoBell",
  "zuse",
];

/**
 * 用户项目的标题文本
 * @constant
 *
 */
export const USER_PROJECTS_HEADER = "我的收藏";

export const DEFAULT_FOLDER = "My Projects";

/**
 * 管理员页面的标题文本
 * @constant
 *
 */
export const ADMIN_HEADER_TITLE = "管理员页面";

/**
 * 管理员页面的描述文本
 * @constant
 *
 */
export const ADMIN_HEADER_DESCRIPTION = "浏览此部分以有效监督所有应用程序用户。从这里，您可以无缝管理用户账户。";

export const BASE_URL_API = custom.BASE_URL_API || "/api/v1/";

export const BASE_URL_API_V2 = custom.BASE_URL_API_V2 || "/api/v2/";

/**
 * 排除在错误重试之外的URL
 * @constant
 *
 */
export const URL_EXCLUDED_FROM_ERROR_RETRIES = [
  `${BASE_URL_API}validate/code`,
  `${BASE_URL_API}custom_component`,
  `${BASE_URL_API}validate/prompt`,
  `${BASE_URL_API}/login`,
  `${BASE_URL_API}api_key/store`,
];

export const skipNodeUpdate = [
  "CustomComponent",
  "PromptTemplate",
  "ChatMessagePromptTemplate",
  "SystemMessagePromptTemplate",
  "HumanMessagePromptTemplate",
];

export const CONTROL_INPUT_STATE = {
  password: "",
  cnfPassword: "",
  username: "",
};

export const CONTROL_PATCH_USER_STATE = {
  password: "",
  cnfPassword: "",
  profilePicture: "",
  apikey: "",
};

export const CONTROL_LOGIN_STATE = {
  username: "",
  password: "",
};

export const CONTROL_NEW_USER = {
  username: "",
  password: "",
  is_active: false,
  is_superuser: false,
};

export const tabsCode = [];

export const FETCH_ERROR_MESSAGE = "无法建立连接。";
export const FETCH_ERROR_DESCRIPION = "请检查一切是否正常运行并重试。";

export const TIMEOUT_ERROR_MESSAGE = "请稍等片刻，服务器正在处理您的请求。";
export const TIMEOUT_ERROR_DESCRIPION = "服务器忙碌中。";

export const SIGN_UP_SUCCESS = "账户已创建！等待管理员激活。";

export const API_PAGE_PARAGRAPH = "您的秘密Langflow API密钥列在下方。不要与他人共享您的API密钥，或在浏览器或其他客户端代码中暴露它。";

export const API_PAGE_USER_KEYS = "此用户目前没有分配任何密钥。";

export const LAST_USED_SPAN_1 = "上次使用此密钥的时间。";

export const LAST_USED_SPAN_2 = "最近使用后的小时内是准确的。";

export const LANGFLOW_SUPPORTED_TYPES = new Set([
  "str",
  "bool",
  "float",
  "code",
  "prompt",
  "file",
  "int",
  "dict",
  "NestedDict",
  "table",
  "link",
  "slider",
  "tab",
  "sortableList",
  "connect",
  "auth",
  "query",
]);

export const FLEX_VIEW_TYPES = ["bool"];

export const priorityFields = new Set(["code", "template", "mode"]);

export const INPUT_TYPES = new Set([
  "ChatInput",
  // "TextInput",
  // "KeyPairInput",
  // "JsonInput",
  // "StringListInput",
]);
export const OUTPUT_TYPES = new Set([
  "ChatOutput",
  // "TextOutput",
  // "PDFOutput",
  // "ImageOutput",
  // "CSVOutput",
  // "JsonOutput",
  // "KeyPairOutput",
  // "StringListOutput",
  // "DataOutput",
  // "TableOutput",
]);

export const CHAT_FIRST_INITIAL_TEXT = "开始对话并点击代理的记忆";

export const TOOLTIP_OUTDATED_NODE = "您的组件已过时。点击更新（数据可能会丢失）";

export const CHAT_SECOND_INITIAL_TEXT = "以检查先前的消息。";

export const TOOLTIP_OPEN_HIDDEN_OUTPUTS = "展开隐藏的输出";
export const TOOLTIP_HIDDEN_OUTPUTS = "折叠隐藏的输出";

export const ZERO_NOTIFICATIONS = "没有新通知";

export const SUCCESS_BUILD = "构建成功 ✨";

export const ALERT_SAVE_WITH_API = "注意：取消选中此框只会从专门指定用于API密钥的字段中删除API密钥。";

export const SAVE_WITH_API_CHECKBOX = "保存我的API密钥";
export const EDIT_TEXT_MODAL_TITLE = "编辑文本";
export const EDIT_TEXT_PLACEHOLDER = "在此输入信息。";
export const INPUT_HANDLER_HOVER = "可用的输入组件：";
export const OUTPUT_HANDLER_HOVER = "可用的输出组件：";
export const TEXT_INPUT_MODAL_TITLE = "输入";
export const OUTPUTS_MODAL_TITLE = "输出";
export const LANGFLOW_CHAT_TITLE = "Langflow 聊天";
export const CHAT_INPUT_PLACEHOLDER = "未找到聊天输入变量。点击运行您的工作流。";
export const CHAT_INPUT_PLACEHOLDER_SEND = "发送消息...";
export const EDIT_CODE_TITLE = "编辑代码";
export const MY_COLLECTION_DESC = "管理您的项目。下载和上传整个集合。";
export const STORE_DESC = "探索社区共享的工作流和组件。";
export const STORE_TITLE = "Langflow 商店";
export const NO_API_KEY = "您没有API密钥。";
export const INSERT_API_KEY = "插入您的Langflow API密钥。";
export const INVALID_API_KEY = "您的API密钥无效。";
export const CREATE_API_KEY = `没有API密钥？请注册于`;
export const STATUS_BUILD = "构建以验证状态。";
export const STATUS_INACTIVE = "执行已阻止";
export const STATUS_BUILDING = "构建中...";
export const SAVED_HOVER = "最后保存：";
export const RUN_TIMESTAMP_PREFIX = "上次运行：";
export const STARTER_FOLDER_NAME = "入门项目";
export const PRIORITY_SIDEBAR_ORDER = [
  "saved_components",
  "inputs",
  "outputs",
  "prompts",
  "data",
  "prompt",
  "models",
  "helpers",
  "vectorstores",
  "embeddings",
];

export const BUNDLES_SIDEBAR_FOLDER_NAMES = [
  "notion",
  "Notion",
  "AssemblyAI",
  "assemblyai",
  "LangWatch",
  "langwatch",
  "Youtube",
  "youtube",
];

export const AUTHORIZED_DUPLICATE_REQUESTS = [
  "/health",
  "/flows",
  "/logout",
  "/refresh",
  "/login",
  "/auto_login",
];

export const BROKEN_EDGES_WARNING = "由于无效，某些连接已被删除：";

export const SAVE_DEBOUNCE_TIME = 300;

export const IS_MAC = navigator.userAgent.toUpperCase().includes("MAC");

export const defaultShortcuts = [
  {
    display_name: "控制",
    name: "Advanced Settings",
    shortcut: "mod+shift+a",
  },
  {
    display_name: "在侧边栏搜索组件",
    name: "Search Components Sidebar",
    shortcut: "/",
  },
  {
    display_name: "最小化",
    name: "Minimize",
    shortcut: "mod+.",
  },
  {
    display_name: "代码",
    name: "Code",
    shortcut: "space",
  },
  {
    display_name: "复制",
    name: "Copy",
    shortcut: "mod+c",
  },
  {
    display_name: "复制",
    name: "Duplicate",
    shortcut: "mod+d",
  },
  {
    display_name: "组件分享",
    name: "Component Share",
    shortcut: "mod+shift+s",
  },
  {
    display_name: "文档",
    name: "Docs",
    shortcut: "mod+shift+d",
  },
  {
    display_name: "保存更改",
    name: "Changes Save",
    shortcut: "mod+s",
  },
  {
    display_name: "保存组件",
    name: "Save Component",
    shortcut: "mod+alt+s",
  },
  {
    display_name: "删除",
    name: "Delete",
    shortcut: "backspace",
  },
  {
    display_name: "打开 Playground",
    name: "Open Playground",
    shortcut: "mod+k",
  },
  {
    display_name: "撤销",
    name: "Undo",
    shortcut: "mod+z",
  },
  {
    display_name: "重做",
    name: "Redo",
    shortcut: "mod+y",
  },
  {
    display_name: "重做（替代）",
    name: "Redo Alt",
    shortcut: "mod+shift+z",
  },
  {
    display_name: "分组",
    name: "Group",
    shortcut: "mod+g",
  },
  {
    display_name: "剪切",
    name: "Cut",
    shortcut: "mod+x",
  },
  {
    display_name: "粘贴",
    name: "Paste",
    shortcut: "mod+v",
  },
  {
    display_name: "API",
    name: "API",
    shortcut: "r",
  },
  {
    display_name: "下载",
    name: "Download",
    shortcut: "mod+j",
  },
  {
    display_name: "更新",
    name: "Update",
    shortcut: "mod+u",
  },
  {
    display_name: "冻结",
    name: "Freeze Path",
    shortcut: "mod+shift+f",
  },
  {
    display_name: "工作流分享",
    name: "Flow Share",
    shortcut: "mod+shift+b",
  },
  {
    display_name: "播放",
    name: "Play",
    shortcut: "p",
  },
  {
    display_name: "输出检查",
    name: "Output Inspection",
    shortcut: "o",
  },
  {
    display_name: "工具模式",
    name: "Tool Mode",
    shortcut: "mod+shift+m",
  },
  {
    display_name: "切换侧边栏",
    name: "Toggle Sidebar",
    shortcut: "mod+b",
  },
];

export const DEFAULT_TABLE_ALERT_MSG = `抱歉！目前似乎没有数据可显示。请稍后再查看。`;

export const DEFAULT_TABLE_ALERT_TITLE = "无可用数据";

export const NO_COLUMN_DEFINITION_ALERT_TITLE = "无列定义";

export const NO_COLUMN_DEFINITION_ALERT_DESCRIPTION = "此表格没有可用的列定义。";

export const LOCATIONS_TO_RETURN = ["/flow/", "/settings/"];

export const MAX_BATCH_SIZE = 50;

export const MODAL_CLASSES =
  "nopan nodelete nodrag  noflow fixed inset-0 bottom-0 left-0 right-0 top-0 z-50 overflow-auto bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

export const ALLOWED_IMAGE_INPUT_EXTENSIONS = ["png", "jpg", "jpeg"];

export const componentsToIgnoreUpdate = ["CustomComponent"];

export const FS_ERROR_TEXT = "请确保您的文件具有以下扩展名之一：";
export const SN_ERROR_TEXT = ALLOWED_IMAGE_INPUT_EXTENSIONS.join(", ");

export const ERROR_UPDATING_COMPONENT = "更新组件时发生意外错误。请重试。";
export const TITLE_ERROR_UPDATING_COMPONENT = "更新组件时出错";

export const EMPTY_INPUT_SEND_MESSAGE = "未提供输入消息。";

export const EMPTY_OUTPUT_SEND_MESSAGE = "消息为空。";

export const TABS_ORDER = [
  "curl",
  "python api",
  "js api",
  "python code",
  "chat widget html",
];

export const LANGFLOW_ACCESS_TOKEN = "access_token_lf";
export const LANGFLOW_API_TOKEN = "apikey_tkn_lflw";
export const LANGFLOW_AUTO_LOGIN_OPTION = "auto_login_lf";
export const LANGFLOW_REFRESH_TOKEN = "refresh_token_lf";

export const LANGFLOW_ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 60 - 60 * 60 * 0.1;
export const LANGFLOW_ACCESS_TOKEN_EXPIRE_SECONDS_ENV =
  Number(process.env?.ACCESS_TOKEN_EXPIRE_SECONDS ?? 60) -
  Number(process.env?.ACCESS_TOKEN_EXPIRE_SECONDS ?? 60) * 0.1;
export const TEXT_FIELD_TYPES: string[] = ["str", "SecretStr"];
export const NODE_WIDTH = 384;
export const NODE_HEIGHT = NODE_WIDTH * 3;

export const SHORTCUT_KEYS = ["cmd", "ctrl", "mod", "alt", "shift"];

export const SERVER_HEALTH_INTERVAL = 10000;
export const REFETCH_SERVER_HEALTH_INTERVAL = 20000;
export const DRAG_EVENTS_CUSTOM_TYPESS = {
  genericnode: "genericNode",
  notenode: "noteNode",
  "text/plain": "text/plain",
};

export const NOTE_NODE_MIN_WIDTH = 324;
export const NOTE_NODE_MIN_HEIGHT = 324;
export const NOTE_NODE_MAX_HEIGHT = 800;
export const NOTE_NODE_MAX_WIDTH = 600;

export const COLOR_OPTIONS = {
  amber: "hsl(var(--note-amber))",
  neutral: "hsl(var(--note-neutral))",
  rose: "hsl(var(--note-rose))",
  blue: "hsl(var(--note-blue))",
  lime: "hsl(var(--note-lime))",
  transparent: null,
};

export const maxSizeFilesInBytes = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_TEXT_LENGTH = 99999;

export const SEARCH_TABS = ["All", "Flows", "Components"];
export const PAGINATION_SIZE = 12;
export const PAGINATION_PAGE = 1;

export const STORE_PAGINATION_SIZE = 12;
export const STORE_PAGINATION_PAGE = 1;

export const PAGINATION_ROWS_COUNT = [12, 24, 48, 96];
export const STORE_PAGINATION_ROWS_COUNT = [12, 24, 48, 96];

export const GRADIENT_CLASS =
  "linear-gradient(to right, hsl(var(--background) / 0.3), hsl(var(--background)))";

export const GRADIENT_CLASS_DISABLED =
  "linear-gradient(to right, hsl(var(--muted) / 0.3), hsl(var(--muted)))";

export const RECEIVING_INPUT_VALUE = "Receiving input";
export const SELECT_AN_OPTION = "选择一个选项";

export const ICON_STROKE_WIDTH = 1.5;

export const DEFAULT_PLACEHOLDER = "输入内容...";

export const DEFAULT_TOOLSET_PLACEHOLDER = "用作Tool";

export const SAVE_API_KEY_ALERT = "已成功保存 API key";
export const PLAYGROUND_BUTTON_NAME = "Playground";
export const POLLING_MESSAGES = {
  ENDPOINT_NOT_AVAILABLE: "终端节点不可用",
  STREAMING_NOT_SUPPORTED: "不支持流式处理",
} as const;

export const POLLING_INTERVAL = 100;

export const IS_AUTO_LOGIN =
  !process?.env?.LANGFLOW_AUTO_LOGIN ||
  String(process?.env?.LANGFLOW_AUTO_LOGIN)?.toLowerCase() !== "false";

export const AUTO_LOGIN_RETRY_DELAY = 2000;
export const AUTO_LOGIN_MAX_RETRY_DELAY = 60000;

export const ALL_LANGUAGES = [
  { value: "en-US", name: "English (US)" },
  { value: "en-GB", name: "English (UK)" },
  { value: "it-IT", name: "Italian" },
  { value: "fr-FR", name: "French" },
  { value: "es-ES", name: "Spanish" },
  { value: "de-DE", name: "German" },
  { value: "ja-JP", name: "Japanese" },
  { value: "pt-BR", name: "Portuguese (Brazil)" },
  { value: "zh-CN", name: "Chinese (Simplified)" },
  { value: "ru-RU", name: "Russian" },
  { value: "ar-SA", name: "Arabic" },
  { value: "hi-IN", name: "Hindi" },
];

export const DEBOUNCE_FIELD_LIST = [
  "SecretStrInput",
  "MessageTextInput",
  "TextInput",
  "MultilineInput",
  "SecretStrInput",
  "IntInput",
  "FloatInput",
  "SliderInput",
];

export const OPENAI_VOICES = [
  { name: "alloy", value: "alloy" },
  { name: "ash", value: "ash" },
  { name: "ballad", value: "ballad" },
  { name: "coral", value: "coral" },
  { name: "echo", value: "echo" },
  { name: "sage", value: "sage" },
  { name: "shimmer", value: "shimmer" },
  { name: "verse", value: "verse" },
];

export const DEFAULT_POLLING_INTERVAL = 5000;
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_FILE_PICKER_TIMEOUT = 60000;
export const DISCORD_URL = "https://discord.com/invite/EqksyE2EX9";
export const GITHUB_URL = "https://github.com/langflow-ai/langflow";
export const TWITTER_URL = "https://x.com/langflow_ai";
export const DOCS_URL = "https://docs.langflow.org";

export const UUID_PARSING_ERROR = "uuid_parsing";
