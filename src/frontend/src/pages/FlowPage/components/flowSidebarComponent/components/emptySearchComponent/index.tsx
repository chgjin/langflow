const NoResultsMessage = ({
  onClearSearch,
  message = "未找到组件。",
  clearSearchText = "清除您的搜索",
  additionalText = "或筛选并尝试其他查询。",
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-3 text-center">
      <p className="text-sm text-secondary-foreground">
        {message}{" "}
        <a
          className="cursor-pointer underline underline-offset-4"
          onClick={onClearSearch}
        >
          {clearSearchText}
        </a>{" "}
        {additionalText}
      </p>
    </div>
  );
};

export default NoResultsMessage;
