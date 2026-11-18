import { ConvertError, convertUrlToMarkdown } from "@/lib/convert/extract";
import { parseWebUrl } from "@/lib/convert/url";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
  } | null;
  const url = typeof body?.url === "string" ? parseWebUrl(body.url) : null;
  if (!url) return Response.json({ error: "invalid" }, { status: 400 });

  try {
    return Response.json(await convertUrlToMarkdown(url));
  } catch (error) {
    const code = error instanceof ConvertError ? error.code : "fetch";
    return Response.json({ error: code }, { status: code === "empty" ? 422 : 502 });
  }
}
