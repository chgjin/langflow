import { ForwardedIconComponent } from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import ToolsComponent from "@/components/core/parameterRenderComponent/components/ToolsComponent";
import { Button } from "@/components/ui/button";
import { createApiKey } from "@/controllers/API";
import {
  useGetFlowsMCP,
  usePatchFlowsMCP,
} from "@/controllers/API/queries/mcp";
import useTheme from "@/customization/hooks/use-custom-theme";
import { customGetMCPUrl } from "@/customization/utils/custom-mcp-url";
import useAuthStore from "@/stores/authStore";
import { useFolderStore } from "@/stores/foldersStore";
import { MCPSettingsType } from "@/types/mcp";
import { parseString } from "@/utils/stringManipulation";
import { cn } from "@/utils/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";

const McpServerTab = ({ folderName }: { folderName: string }) => {
  const isDarkMode = useTheme().dark;
  const { folderId } = useParams();
  const myCollectionId = useFolderStore((state) => state.myCollectionId);
  const projectId = folderId ?? myCollectionId ?? "";
  const [isCopied, setIsCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);

  const { data: flowsMCP } = useGetFlowsMCP({ projectId });
  const { mutate: patchFlowsMCP } = usePatchFlowsMCP({ project_id: projectId });

  const isAutoLogin = useAuthStore((state) => state.autoLogin);

  const handleOnNewValue = (value) => {
    const flowsMCPData: MCPSettingsType[] = value.value.map((flow) => ({
      id: flow.id,
      action_name: flow.name,
      action_description: flow.description,
      mcp_enabled: flow.status,
    }));
    patchFlowsMCP(flowsMCPData);
  };

  const flowsMCPData = flowsMCP?.map((flow) => ({
    id: flow.id,
    name: flow.action_name,
    description: flow.action_description,
    display_name: flow.name,
    display_description: flow.description,
    status: flow.mcp_enabled,
    tags: [flow.name],
  }));

  const syntaxHighlighterStyle = {
    "hljs-string": {
      color: isDarkMode ? "hsla(158, 64%, 52%, 1)" : "#059669", // Accent Green
    },
    "hljs-attr": {
      color: isDarkMode ? "hsla(329, 86%, 70%, 1)" : "#DB2777", // Accent Pink
    },
  };

  const apiUrl = customGetMCPUrl(projectId);

  const MCP_SERVER_JSON = `{
  "mcpServers": {
    "lf-${parseString(folderName ?? "project", ["snake_case", "no_blank", "lowercase"]).slice(0, 11)}": {
      "command": "uvx",
      "args": [
        "mcp-proxy",${
          isAutoLogin
            ? ""
            : `
        "--headers",
        "x-api-key",
        "${apiKey || "YOUR_API_KEY"}",`
        }
        "${apiUrl}"
      ]
    }
  }
}`;

  const MCP_SERVER_TUTORIAL_LINK =
    "https://docs.langflow.org/mcp-server#connect-clients-to-use-the-servers-actions";

  const MCP_SERVER_DEPLOY_TUTORIAL_LINK =
    "https://docs.langflow.org/mcp-server#deploy-your-server-externally";

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(MCP_SERVER_JSON)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const generateApiKey = () => {
    setIsGeneratingApiKey(true);
    createApiKey(`MCP Server ${folderName}`)
      .then((res) => {
        setApiKey(res["api_key"]);
      })
      .catch((err) => {})
      .finally(() => {
        setIsGeneratingApiKey(false);
      });
  };

  return (
    <div>
      <div className="pb-2 text-sm font-medium" data-testid="mcp-server-title">
        MCP Server
      </div>
      <div className="pb-4 text-mmd text-muted-foreground">
        在 MCP 服务器中将项目的流程作为作进行访问。在我们的
        <a
          className="text-accent-pink-foreground"
          href={MCP_SERVER_DEPLOY_TUTORIAL_LINK}
          target="_blank"
          rel="noreferrer"
        >
          {" "}
          项目作为 MCP 服务器指南。
        </a>
      </div>
      <div className="flex flex-row">
        <div className="w-1/3">
          <div className="flex flex-row justify-between">
            <ShadTooltip
              content="Flows in this project can be exposed as callable MCP actions."
              side="right"
            >
              <div className="flex items-center text-mmd font-medium hover:cursor-help">
                Flows/Actions
                <ForwardedIconComponent
                  name="info"
                  className="ml-1.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </ShadTooltip>
          </div>
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            <ToolsComponent
              value={flowsMCPData}
              title="MCP 服务器 Actions"
              description="选择要添加到此服务器的操作"
              handleOnNewValue={handleOnNewValue}
              id="mcp-server-tools"
              button_description="编辑 Actions"
              editNode={false}
              isAction
              disabled={false}
            />
          </div>
        </div>
        <div className="w-2/3 pl-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <SyntaxHighlighter
              style={syntaxHighlighterStyle}
              CodeTag={({ children }) => (
                <div className="relative bg-background text-[13px]">
                  <div className="absolute right-4 top-4 flex items-center gap-6">
                    {!isAutoLogin && (
                      <Button
                        unstyled
                        className="flex items-center gap-2 font-sans text-muted-foreground hover:text-foreground"
                        disabled={apiKey !== ""}
                        loading={isGeneratingApiKey}
                        onClick={generateApiKey}
                      >
                        <ForwardedIconComponent
                          name={"key"}
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>
                          {apiKey === ""
                            ? "生成 API key"
                            : "已生成 API key"}
                        </span>
                      </Button>
                    )}
                    <Button
                      unstyled
                      size="icon"
                      className={cn(
                        "h-4 w-4 text-muted-foreground hover:text-foreground",
                      )}
                      onClick={copyToClipboard}
                    >
                      <ForwardedIconComponent
                        name={isCopied ? "check" : "copy"}
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                  <div className="overflow-x-auto p-4">{children}</div>
                </div>
              )}
              language="json"
            >
              {MCP_SERVER_JSON}
            </SyntaxHighlighter>
          </div>
          <div className="p-2 text-mmd text-muted-foreground">
            将此配置添加到您选择的客户端。需要帮助？请参阅{" "}
            <a
              href={MCP_SERVER_TUTORIAL_LINK}
              target="_blank"
              rel="noreferrer"
              className="text-accent-pink-foreground"
            >
              setup 指南
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default McpServerTab;
