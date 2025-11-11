import { http, HttpResponse, delay } from "msw";

const streamResponse = async function* (text: string) {
  const words = text.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise((r) => setTimeout(r, 50));
  }
};

export const agentHandlers = [
  http.post("/api/agents/query", async ({ request }) => {
    const body = (await request.json()) as { message: string };
    const { message } = body;

    let reply = "I'm here to help you with SchoolOS! How can I assist you today?";

    if (message.toLowerCase().includes("exam"))
      reply =
        "The final exams are scheduled from December 15 to December 22. Would you like me to show you the detailed timetable?";
    if (message.toLowerCase().includes("mark"))
      reply =
        "Fetching marks for Class 8A — the class average is 78%. Top performer: Riya Sharma with 92%. Would you like a detailed breakdown?";
    if (message.toLowerCase().includes("attendance"))
      reply =
        "Attendance for this week is 92%. Monday had the highest attendance at 95%, while Friday was lowest at 88%.";
    if (message.toLowerCase().includes("timetable"))
      reply =
        "Generating timetable for Grade 10... The schedule shows Maths at 9 AM, Science at 10:30 AM, and English at 12 PM.";

    await delay(600);

    return HttpResponse.json({
      session_id: "demo_session",
      message_id: crypto.randomUUID(),
      role: "assistant",
      content: reply,
      trace: { module: "academics", leaf: "marks_agent" },
      streaming: false,
    });
  }),
];
