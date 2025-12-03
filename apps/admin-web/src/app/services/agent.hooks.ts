import { useMutation } from "@tanstack/react-query";
import { queryAgent } from "./agent.api";
import { QueryRequest } from "./agent.types";

export const useAgentQuery = () =>
  useMutation({
    mutationFn: ({
      body,
      auth,
    }: {
      body: QueryRequest;
      auth: { jwt: string; school_id: number };
    }) => queryAgent(body, auth),
  });
