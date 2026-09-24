export const ASPECT_RATIOS = [
  { id: "1:1", name: "Square (1:1)", w: 1024, h: 1024 },
  { id: "16:9", name: "Landscape (16:9)", w: 1280, h: 720 },
  { id: "9:16", name: "Portrait (9:16)", w: 720, h: 1280 },
  { id: "4:3", name: "Classic (4:3)", w: 1024, h: 768 },
  { id: "3:4", name: "Vertical (3:4)", w: 768, h: 1024 },
  { id: "21:9", name: "Cinema (21:9)", w: 1536, h: 640 },
] as const;

export function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
