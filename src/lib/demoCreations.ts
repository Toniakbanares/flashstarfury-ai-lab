// Demo seed for Explore — shown only when there are no real user creations yet.
// Every item is clearly marked `is_demo: true` so the UI can badge them.
export type DemoCreation = {
  id: string;
  prompt: string;
  tool_type: "image" | "video" | "3d" | "avatar" | "logo" | "text";
  image_url: string | null;
  video_url?: string | null;
  result_text: string | null;
  created_at: string;
  likes_count: number;
  is_demo: true;
  profiles: { display_name: string; avatar_url: null };
};

const pic = (seed: string, w = 640, h = 640) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const DEMO_CREATIONS: DemoCreation[] = [
  { id: "demo_1", prompt: "Neon cyberpunk city at night, rain-slick streets, cinematic", tool_type: "image", image_url: pic("nova-cyber", 640, 800), result_text: null, created_at: new Date(Date.now() - 3600e3).toISOString(), likes_count: 42, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_2", prompt: "Golden retriever astronaut on the moon, ultra realistic", tool_type: "image", image_url: pic("nova-dog", 640, 640), result_text: null, created_at: new Date(Date.now() - 7200e3).toISOString(), likes_count: 27, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_3", prompt: "Minimalist logo for a coffee brand named Lumen", tool_type: "logo", image_url: pic("nova-logo", 640, 640), result_text: null, created_at: new Date(Date.now() - 10800e3).toISOString(), likes_count: 15, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_4", prompt: "Anime portrait of a warrior with silver hair", tool_type: "avatar", image_url: pic("nova-avatar", 640, 640), result_text: null, created_at: new Date(Date.now() - 14400e3).toISOString(), likes_count: 33, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_5", prompt: "Isometric 3D render of a floating island with a waterfall", tool_type: "3d", image_url: pic("nova-3d", 640, 640), result_text: null, created_at: new Date(Date.now() - 18000e3).toISOString(), likes_count: 21, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_6", prompt: "Short intro copy for an AI art studio", tool_type: "text", image_url: null, result_text: "# Welcome to PixelNova AI\n\nCreate anything — images, videos, 3D, logos and copy — powered by AI, in seconds.", created_at: new Date(Date.now() - 21600e3).toISOString(), likes_count: 9, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_7", prompt: "Watercolor landscape of Japanese mountains at sunrise", tool_type: "image", image_url: pic("nova-watercolor", 640, 720), result_text: null, created_at: new Date(Date.now() - 25200e3).toISOString(), likes_count: 51, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
  { id: "demo_8", prompt: "Futuristic sports car driving through the desert", tool_type: "video", image_url: pic("nova-car", 640, 360), result_text: null, created_at: new Date(Date.now() - 28800e3).toISOString(), likes_count: 18, is_demo: true, profiles: { display_name: "PixelNova Demo", avatar_url: null } },
];
