import { BuildStatus } from "@/constants/enums";
import { base64ToFloat32Array } from "../helpers/utils";

export const useHandleWebsocketMessage = (
  event: MessageEvent,
  interruptPlayback: () => void,
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  audioQueueRef: React.MutableRefObject<AudioBuffer[]>,
  isPlayingRef: React.MutableRefObject<boolean>,
  playNextAudioChunk: () => void,
  setIsBuilding: (isBuilding: boolean) => void,
  revertBuiltStatusFromBuilding: () => void,
  clearEdgesRunningByNodes: () => void,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  edges,
  setStatus: React.Dispatch<React.SetStateAction<string>>,
  messagesStore,
  setEdges,
  addDataToFlowPool: (data: any, nodeId: string) => void,
  updateEdgesRunningByNodes: (nodeIds: string[], isRunning: boolean) => void,
  updateBuildStatus: (nodeIds: string[], status: BuildStatus) => void,
  hasOpenAIAPIKey: boolean,
  showErrorAlert: (title: string, list: string[]) => void,
) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "response.content_part.added":
      if (data.part?.type === "text" && data.part.text) {
        setMessage((prev) => prev + data.part.text);
      }
      break;

    case "response.done":
      if (data.response?.status_details?.error?.code) {
        const errorCode =
          data.response?.status_details?.error?.code?.replaceAll("_", " ");
        setStatus(`API key错误: ${errorCode}`);
        showErrorAlert("API key错误: " + errorCode, [
          "请检查您的 API key，然后重试",
        ]);
      }
      break;

    case "response.cancelled":
      interruptPlayback();
      break;

    case "response.audio.delta":
      if (data.delta && audioContextRef.current) {
        try {
          const float32Data = base64ToFloat32Array(data.delta);
          const audioBuffer = audioContextRef.current.createBuffer(
            2,
            float32Data.length,
            24000,
          );
          audioBuffer.copyToChannel(float32Data, 0);
          audioBuffer.copyToChannel(float32Data, 1);
          audioQueueRef.current.push(audioBuffer);
          if (!isPlayingRef.current) {
            playNextAudioChunk();
          }
        } catch (error) {
          console.error("处理音频响应时出错:", error);
        }
      }
      break;

    case "flow.build.progress":
      const buildData = data.data;
      switch (buildData.event) {
        case "start":
          setIsBuilding(true);
          break;

        case "start_vertex":
          updateBuildStatus([buildData.vertex_id], BuildStatus.BUILDING);
          const newEdges = edges.map((edge) => {
            if (buildData.vertex_id === edge.data?.targetHandle?.id) {
              edge.animated = true;
              edge.className = "running";
            }
            return edge;
          });
          setEdges(newEdges);
          break;

        case "end_vertex":
          updateBuildStatus([buildData.vertex_id], BuildStatus.BUILT);
          addDataToFlowPool(
            {
              ...buildData.data.build_data,
              run_id: buildData.run_id,
              id: buildData.vertex_id,
              valid: true,
            },
            buildData.vertex_id,
          );
          updateEdgesRunningByNodes([buildData.vertex_id], false);
          break;

        case "error":
          updateBuildStatus([buildData.vertex_id], BuildStatus.ERROR);
          updateEdgesRunningByNodes([buildData.vertex_id], false);
          break;

        case "end":
          setIsBuilding(false);
          revertBuiltStatusFromBuilding();
          clearEdgesRunningByNodes();
          break;

        case "add_message":
          messagesStore.addMessage(buildData.data);
          break;
      }
      break;

    case "error":
      if (data.code === "api_key_missing") {
        setStatus("Error: " + "缺少 API key");
        showErrorAlert("API key无效", [
          "请检查您的 API ket，然后重试",
        ]);
        return;
      }
      if (data.error.message.toLowerCase().includes("api key")) {
        setStatus("Error: " + "缺少 API key");
        showErrorAlert("API key无效", [
          "请检查您的 API key，然后重试",
        ]);
        return;
      }
      data.error.message === "取消失败：未找到活动响应"
        ? interruptPlayback()
        : setStatus("Error: " + data.error);
      break;
  }
};
