import BaseModal from "@/modals/baseModal";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { CardData } from "@/types/templates/types";
import memoryChatbot from "../../../../assets/temp-pat-1.png";
import vectorRag from "../../../../assets/temp-pat-2.png";
import multiAgent from "../../../../assets/temp-pat-3.png";
import memoryChatbotHorizontal from "../../../../assets/temp-pat-m-1.png";
import vectorRagHorizontal from "../../../../assets/temp-pat-m-2.png";
import multiAgentHorizontal from "../../../../assets/temp-pat-m-3.png";

import TemplateGetStartedCardComponent from "../TemplateGetStartedCardComponent";

export default function GetStartedComponent() {
  const examples = useFlowsManagerStore((state) => state.examples);

  // Define the card data
  const cardData: CardData[] = [
    {
      bgImage: memoryChatbot,
      bgHorizontalImage: memoryChatbotHorizontal,
      icon: "MessagesSquare",
      category: "会话工作流",
      flow: examples.find((example) => example.name === "基本对话工作流"),
    },
    {
      bgImage: vectorRag,
      bgHorizontalImage: vectorRagHorizontal,
      icon: "Database",
      category: "知识库RAG",
      flow: examples.find((example) => example.name === "知识库RAG"),
    },
    {
      bgImage: multiAgent,
      bgHorizontalImage: multiAgentHorizontal,
      icon: "Bot",
      category: "智能体",
      flow: examples.find((example) => example.name === "简单智能体"),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <BaseModal.Header description="从展示 Langflow 的会话工作流、RAG和智能体用例的模板开始。">
        开始使用
      </BaseModal.Header>
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        {cardData.map((card, index) => (
          <TemplateGetStartedCardComponent key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
