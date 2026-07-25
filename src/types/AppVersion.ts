export type AppPlatform = "android" | "ios";

export interface AppVersion {
  id: number;
  platform: AppPlatform;
  latest_version: string;
  min_required_version: string;
  is_force_update_enabled: boolean;
  update_message: string;
  update_url: string;
  release_notes: string;
  created_at: string;
  updated_at: string;
}

export interface AppVersionUpdatePayload {
  latest_version: string;
  min_required_version: string;
  is_force_update_enabled: boolean;
  update_message: string;
  update_url: string;
  release_notes: string;
}

export interface AppVersionCreatePayload extends AppVersionUpdatePayload {
  platform: AppPlatform;
}
