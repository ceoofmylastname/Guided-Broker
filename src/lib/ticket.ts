/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared ticket submission. Used by BOTH the manual ticket form and Pete's
 * voice `open_ticket` tool, so a voice-created ticket is identical to a
 * hand-filled one. It (1) inserts a row into the Supabase `tickets` table that
 * the admin dashboard reads, and (2) POSTs to the GoHighLevel webhook.
 */
import { CONFIG } from "../config";

export interface TicketInput {
  department: string;
  firstName: string;
  lastName: string;
  email: string;
  summary: string;
  highPriority?: boolean;
  file?: File | null;
}

export function generateTicketId(): string {
  const base36 = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PH-${base36}-${rand}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function uploadFile(ticketId: string, file: File): Promise<string | null> {
  try {
    const objectPath = `${ticketId}/${encodeURIComponent(file.name)}`;
    const res = await fetch(
      `${CONFIG.supabaseUrl}/storage/v1/object/ticket-files/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: CONFIG.supabaseAnonKey,
          Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "false",
          "cache-control": "3600",
        },
        body: file,
      }
    );
    if (!res.ok) {
      console.warn("File upload failed (ticket still saved):", res.status);
      return null;
    }
    return objectPath;
  } catch (e) {
    console.warn("File upload error (ticket still saved):", e);
    return null;
  }
}

/**
 * Submit a ticket. Returns the generated ticket ID on success.
 * Throws only if the Supabase insert fails (so the UI/agent can report it);
 * webhook/file failures are logged but do not roll back the ticket.
 */
export async function submitTicket(input: TicketInput): Promise<{ ticketId: string }> {
  const ticketId = generateTicketId();

  let fileName: string | null = null;
  if (input.file) {
    fileName = await uploadFile(ticketId, input.file);
  }

  // 1) Insert into Supabase tickets (this is what the admin dashboard shows).
  const row = {
    ticket_id: ticketId,
    department: input.department,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    summary: input.summary,
    high_priority: !!input.highPriority,
    file_name: fileName,
  };

  const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/tickets`, {
    method: "POST",
    headers: {
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Could not save ticket (${res.status}). ${detail}`);
  }

  // 2) Fire the GoHighLevel webhook in the BACKGROUND (do not await), so the
  // caller (esp. Pete's voice tool, which has a short timeout) returns the
  // instant the ticket is saved. The ticket is already in the DB at this point.
  try {
    fetch(CONFIG.ticketWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId,
        department: input.department,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        summary: input.summary,
        highPriority: !!input.highPriority,
        file: input.file ? input.file.name : null,
        submittedAt: new Date().toISOString(),
        source: "GuidedBroker Concierge",
      }),
      keepalive: true,
    }).catch((e) => console.warn("Webhook POST failed (ticket already saved):", e));
  } catch (e) {
    console.warn("Webhook POST failed (ticket already saved):", e);
  }

  return { ticketId };
}
