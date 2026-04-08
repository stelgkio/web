export type Organization = {
  id: string;
  name: string;
  slug?: string | null;
  discovery_enabled: boolean;
  approval_mode: string;
  created_at: string;
  updated_at: string;
};

export type InviteValidateResponse = {
  valid: boolean;
  organization_id: string;
  expires_at: string;
};
