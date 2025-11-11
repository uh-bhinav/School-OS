import { QueryRequest, QueryResponse } from "./agent.types";
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

export const queryAgent = async (
  body: QueryRequest,
  auth: { jwt: string; school_id: number }
): Promise<QueryResponse> => {
  const res = await http.post<QueryResponse>("/api/agents/query", body, {
    headers: {
      Authorization: `Bearer ${auth.jwt}`,
      "X-School-Id": String(auth.school_id),
    },
  });
  return res.data;
};
