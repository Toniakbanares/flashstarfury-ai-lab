export function shareLinks(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  };
}

export async function shareLink(url: string, title: string): Promise<void> {
  if (navigator.share) {
    try { await navigator.share({ url, title }); return; } catch { /* fallback below */ }
  }
  await copyToClipboard(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
