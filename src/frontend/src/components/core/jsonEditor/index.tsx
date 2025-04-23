import { jsonquery } from "@jsonquerylang/jsonquery";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  Content,
  createJSONEditor,
  JsonEditor as VanillaJsonEditor,
} from "vanilla-jsoneditor";
import useAlertStore from "../../../stores/alertStore";
import { cn } from "../../../utils/utils";

interface JsonEditorProps {
  data?: Content;
  onChange?: (data: Content) => void;
  readOnly?: boolean;
  options?: any;
  jsonRef?: React.MutableRefObject<VanillaJsonEditor | null>;
  width?: string;
  height?: string;
  className?: string;
  setFilter?: (filter: string) => void;
  allowFilter?: boolean;
  initialFilter?: string;
}

const JsonEditor = ({
  data = { json: {} },
  onChange,
  readOnly,
  jsonRef,
  options = {},
  width = "100%",
  height = "400px",
  className,
  setFilter,
  allowFilter = false,
  initialFilter,
}: JsonEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const jsonEditorRef = useRef<VanillaJsonEditor | null>(null);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const newRef = jsonRef ?? jsonEditorRef;
  const [transformQuery, setTransformQuery] = useState(initialFilter ?? "");
  const [originalData, setOriginalData] = useState(data);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Apply initial filter when component mounts
  useEffect(() => {
    if (initialFilter && newRef.current) {
      setTransformQuery(initialFilter);
      handleTransform(true);
    }
  }, [initialFilter, newRef.current]);

  const isValidResult = (result: any): boolean => {
    // Only allow objects and arrays
    return (
      result !== null &&
      (Array.isArray(result) ||
        (typeof result === "object" && !Array.isArray(result)))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransformQuery(e.target.value);
    setIsFiltered(false);
    setShowSuccess(false);
  };

  const applyFilter = (filtered: { json: any }, query: string) => {
    onChange?.(filtered);
    setFilter?.(query.trim());
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleTransform = (isInitial = false) => {
    if (!newRef.current) return;

    // If query is empty, act as reset
    if (!transformQuery.trim()) {
      handleReset();
      return;
    }

    try {
      // Always start with original data for transformation
      const json =
        "json" in originalData
          ? originalData.json
          : JSON.parse(originalData.text!);

      // Try JSONQuery first
      try {
        const result = jsonquery(json, transformQuery);
        if (result !== undefined) {
          // Validate that result is a JSON object or array
          if (isValidResult(result)) {
            try {
              JSON.stringify(result); // Still check JSON serializability
              const filteredContent = { json: result };
              newRef.current.set(filteredContent);
              if (isFiltered && !isInitial) {
                // Apply the filter
                applyFilter(filteredContent, transformQuery.trim());
              } else {
                // Just preview the filter
                setIsFiltered(true);
              }
              return;
            } catch (jsonError) {
              setErrorData({
                title: "无效结果",
                list: [
                  "筛选结果包含无法序列化为 JSON 的值",
                ],
              });
              return;
            }
          } else {
            setErrorData({
              title: "无效结果",
              list: [
                "筛选的结果必须是 JSON 对象或数组，而不是基元值",
              ],
            });
            return;
          }
        }
      } catch (jsonQueryError) {
        // If JSONQuery fails, continue with our path-based method
        console.debug(
          "JSONQuery 解析失败，回退到基于路径的方法:",
          jsonQueryError,
        );
      }

      // Fallback to our path-based method
      const normalizedQuery = transformQuery.replace(/\[/g, ".[");
      const path = normalizedQuery.trim().split(".").filter(Boolean);
      let result = json;

      for (const key of path) {
        if (result === undefined || result === null) {
          setErrorData({
            title: "路径无效",
            list: [`路径 '${transformQuery}' 导致 Undefined 或 Null 值`],
          });
          return;
        }
        if (Array.isArray(result)) {
          // Handle array access with [index] notation
          const indexMatch = key.match(/\[(\d+)\]/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            if (index >= result.length) {
              setErrorData({
                title: "无效的数组索引",
                list: [
                  `索引 ${index} 超出长度数组的边界 ${result.length}`,
                ],
              });
              return;
            }
            result = result[index];
            continue;
          }
          // Apply operation to all array items
          result = result
            .map((item) => {
              if (!(key in item)) {
                setErrorData({
                  title: "无效的属性",
                  list: [`属性 '${key}' 不存在于items中`],
                });
                return undefined;
              }
              return item[key];
            })
            .filter((item) => item !== undefined);
        } else {
          if (!(key in result)) {
            setErrorData({
              title: "无效的属性",
              list: [`属性 '${key}' 在 Object 中不存在`],
            });
            return;
          }
          result = result[key];
        }
      }

      if (result !== undefined) {
        // Validate that result is a JSON object or array
        if (isValidResult(result)) {
          try {
            JSON.stringify(result); // Still check JSON serializability
            const filteredContent = { json: result };
            newRef.current.set(filteredContent);

            if (isFiltered && !isInitial) {
              // Apply the filter
              applyFilter(filteredContent, transformQuery.trim());
            } else {
              // Just preview the filter
              setIsFiltered(true);
            }
            return;
          } catch (jsonError) {
            setErrorData({
              title: "无效结果",
              list: [
                "筛选结果包含无法序列化为 JSON 的值",
              ],
            });
          }
        } else {
          setErrorData({
            title: "无效结果",
            list: [
              "筛选的结果必须是 JSON 对象或数组，而不是基元值",
            ],
          });
        }
      } else {
        setErrorData({
          title: "无效结果",
          list: ["Transform 导致未定义的值"],
        });
      }
    } catch (error) {
      console.error("应用转换时出错:", error);
      setErrorData({
        title: "变换错误",
        list: [(error as Error).message],
      });
    }
  };

  const handleReset = () => {
    if (!newRef.current) return;
    newRef.current.set(originalData);
    onChange?.(originalData);
    setTransformQuery("");
    setFilter?.("");
    setIsFiltered(false);
    setShowSuccess(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTransform();
    }
  };

  const getFilteredContent = (
    sourceJson: any,
    query: string,
  ): { json: any } | undefined => {
    // Try JSONQuery first
    try {
      const result = jsonquery(sourceJson, query);
      if (result !== undefined && isValidResult(result)) {
        try {
          JSON.stringify(result); // Check serializability
          return { json: result };
        } catch {
          return undefined;
        }
      }
    } catch (jsonQueryError) {
      console.debug(
        "JSONQuery 解析失败，回退到基于路径的方法:",
        jsonQueryError,
      );
    }

    // Fallback to path-based method
    try {
      const normalizedQuery = query.replace(/\[/g, ".[");
      const path = normalizedQuery.trim().split(".").filter(Boolean);
      let result = sourceJson;

      for (const key of path) {
        if (result === undefined || result === null) return undefined;
        if (Array.isArray(result)) {
          const indexMatch = key.match(/\[(\d+)\]/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            if (index >= result.length) return undefined;
            result = result[index];
            continue;
          }
          result = result
            .map((item) => (key in item ? item[key] : undefined))
            .filter((item) => item !== undefined);
        } else {
          if (!(key in result)) return undefined;
          result = result[key];
        }
      }

      if (result !== undefined && isValidResult(result)) {
        try {
          JSON.stringify(result);
          return { json: result };
        } catch {
          return undefined;
        }
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let initialContent = data;
    if (initialFilter?.trim()) {
      try {
        const json = "json" in data ? data.json : JSON.parse(data.text!);
        const filtered = getFilteredContent(json, initialFilter);
        if (filtered) {
          initialContent = filtered;
        }
      } catch (error) {
        console.error("应用初始筛选器时出错:", error);
      }
    }

    // Ensure the container has the correct dimensions before creating the editor
    if (containerRef.current) {
      containerRef.current.style.width = width;
      containerRef.current.style.height = height;
    }

    const editor = createJSONEditor({
      target: containerRef.current,
      props: {
        ...options,
        navigationBar: false,
        mode: "text",
        content: initialContent,
        readOnly,
        onChange: (content) => {
          onChange?.(content);
        },
      },
    });

    setTimeout(() => editor.focus(), 100);

    newRef.current = editor;
    setOriginalData(data);

    return () => {
      if (newRef.current) {
        newRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* {allowFilter && (
        <div className="mb-2 flex shrink-0 gap-2">
          <Input
            placeholder="Enter path (e.g. users[0].name) or JSONQuery (e.g. .users | filter(.age > 25))"
            value={transformQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="font-mono text-sm"
          />
          <Button
            onClick={() => handleTransform()}
            variant="primary"
            size="sm"
            className={cn(
              "min-w-[60px] whitespace-nowrap",
              showSuccess && "!bg-green-500 hover:!bg-green-600",
            )}
          >
            {showSuccess ? (
              <Check className="h-4 w-4" />
            ) : isFiltered ? (
              "Apply"
            ) : (
              "Filter"
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            Clear
          </Button>
        </div>
      )} */}
      <div className="relative h-full min-h-0 flex-1">
        <div ref={containerRef} className={cn("!h-full w-full", className)} />
      </div>
    </div>
  );
};

export default JsonEditor;
