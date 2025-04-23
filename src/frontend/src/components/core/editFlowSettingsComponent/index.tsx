import React, { ChangeEvent, useState } from "react";
import { InputProps } from "../../../types/components";
import { cn, isEndpointNameValid } from "../../../utils/utils";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

export const EditFlowSettings: React.FC<InputProps> = ({
  name,
  invalidNameList = [],
  description,
  endpointName,
  maxLength = 50,
  setName,
  setDescription,
  setEndpointName,
}: InputProps): JSX.Element => {
  const [isMaxLength, setIsMaxLength] = useState(false);
  const [validEndpointName, setValidEndpointName] = useState(true);
  const [isInvalidName, setIsInvalidName] = useState(false);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length >= maxLength) {
      setIsMaxLength(true);
    } else {
      setIsMaxLength(false);
    }
    let invalid = false;
    for (let i = 0; i < invalidNameList!.length; i++) {
      if (value === invalidNameList![i]) {
        invalid = true;
        break;
      }
      invalid = false;
    }
    setIsInvalidName(invalid);
    setName!(value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription!(event.target.value);
  };

  const handleEndpointNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Validate the endpoint name
    // use this regex r'^[a-zA-Z0-9_-]+$'
    const isValid = isEndpointNameValid(event.target.value, maxLength);
    setValidEndpointName(isValid);
    setEndpointName!(event.target.value);
  };

  //this function is necessary to select the text when double clicking, this was not working with the onFocus event
  const handleFocus = (event) => event.target.select();

  return (
    <>
      <Label>
        <div className="edit-flow-arrangement">
          <span className="font-medium">名称{setName ? "" : ":"}</span>{" "}
          {isMaxLength && (
            <span className="edit-flow-span">已达到字符限制</span>
          )}
          {isInvalidName && (
            <span className="edit-flow-span">
              名称无效或已存在
            </span>
          )}
        </div>
        {setName ? (
          <Input
            className="nopan nodelete nodrag noflow mt-2 font-normal"
            onChange={handleNameChange}
            type="text"
            name="name"
            value={name ?? ""}
            placeholder="工作流名称"
            id="name"
            maxLength={maxLength}
            onDoubleClickCapture={(event) => {
              handleFocus(event);
            }}
            data-testid="input-flow-name"
          />
        ) : (
          <span className="font-normal text-muted-foreground word-break-break-word">
            {name}
          </span>
        )}
      </Label>
      <Label>
        <div className="edit-flow-arrangement mt-3">
          <span className="font-medium">
            描述{setDescription ? " (可选)" : ":"}
          </span>
        </div>
        {setDescription ? (
          <Textarea
            name="description"
            id="description"
            onChange={handleDescriptionChange}
            value={description!}
            placeholder="工作流描述"
            className="mt-2 max-h-[250px] resize-none font-normal"
            rows={5}
            onDoubleClickCapture={(event) => {
              handleFocus(event);
            }}
          />
        ) : (
          <div
            className={cn(
              "max-h-[250px] overflow-auto pt-2 font-normal text-muted-foreground word-break-break-word",
              description === "" ? "font-light italic" : "",
            )}
          >
            {description === "" ? "无描述" : description}
          </div>
        )}
      </Label>
      {setEndpointName && (
        <Label>
          <div className="edit-flow-arrangement mt-3">
            <span className="font-medium">Endpoint Name</span>
            {!validEndpointName && (
              <span className="edit-flow-span">
                终结点名称无效。仅使用字母、数字、连字符和
                下划线 （最多{maxLength}个字符）。
              </span>
            )}
          </div>
          <Input
            className="nopan nodelete nodrag noflow mt-2 font-normal"
            onChange={handleEndpointNameChange}
            type="text"
            name="endpoint_name"
            value={endpointName ?? ""}
            placeholder="用于运行终端节点的备用名称"
            maxLength={maxLength}
            id="endpoint_name"
            onDoubleClickCapture={(event) => {
              handleFocus(event);
            }}
          />
        </Label>
      )}
    </>
  );
};

export default EditFlowSettings;
