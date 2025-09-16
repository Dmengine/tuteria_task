type Payload = Record<string, any>;

export async function postToCdnPostmarkService(payload: Payload) {
  const url = "https://api.postmarkapp.com/email/withTemplate";
  console.log("[postToCdn] Sending request to:", url);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Postmark-Server-Token": process.env.CDN_API_KEY!,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result = await res.json();
      console.log("[postToCdn] Success:", result);
      return result;
    }

    const text = await res.text();
    console.error("[postToCdn] Service error:", res.status, text);
    throw new Error(`Postmark service error: ${res.status} ${text}`);
  } catch (err: any) {
    console.error("[postToCdn] Fetch failed:", err.message);
    throw err;
  }
}
