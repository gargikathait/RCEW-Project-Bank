import { Request, Response } from "express";
import { FacultyValidationStatus } from "./models/Project";

type Client = { id: number; res: Response };
const clients = new Map<number, Client>();
let nextClientId = 1;

export function handleStatusEvents(req: Request, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(`event: connected\ndata: {"ok":true}\n\n`);
  const id = nextClientId++;
  clients.set(id, { id, res });
  const heartbeat = setInterval(() => res.write(`event: heartbeat\ndata: {}\n\n`), 25000);
  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(id);
  });
}

export function emitProjectStatusUpdate(projectId: string, facultyValidation: FacultyValidationStatus, facultyComments?: string) {
  const payload = JSON.stringify({ projectId, facultyValidation, facultyComments, updatedAt: new Date().toISOString() });
  for (const client of clients.values()) client.res.write(`event: project-status\ndata: ${payload}\n\n`);
}
