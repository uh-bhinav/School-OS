export interface QueryRequest {
  session_id?: string;
  message: string;
  context?: {
    chips?: any[];
    ui_origin?: { path?: string; element_id?: string };
  };
  routing?: { auto: boolean };
}

export interface QueryResponse {
  session_id: string;
  message_id: string;
  role: "assistant";
  content: string;
  trace?: { module?: string; leaf?: string };
  streaming?: boolean;
}

export interface SessionMeta {
  id: string;
  title: string;
  createdAt: number;
}
