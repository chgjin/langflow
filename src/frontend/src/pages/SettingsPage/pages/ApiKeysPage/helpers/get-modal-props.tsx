export const getModalPropsApiKey = () => {
  const modalProps = {
    title: "创建 API key",
    description: "创建密钥 API key以使用 Langflow API。",
    inputPlaceholder: "我的 API key",
    buttonText: "生成 API key",
    generatedKeyMessage: (
      <>
        {" "}
        请将此密钥保存在安全且可访问的地方。出于安全原因，通过您的帐户<strong>无法次查看它</strong>。如果您丢失了此密钥，则需要生成一个新的密钥。
      </>
    ),
    showIcon: true,
    inputLabel: (
      <>
        <span className="text-sm">描述</span>{" "}
        <span className="text-xs text-muted-foreground">（可选）</span>
      </>
    ),
  };

  return modalProps;
};
