import { z } from "zod";
import { http } from "./http";

export const SchoolConfigSchema = z.object({
  version: z.literal("1.0.0"),
  identity: z
    .object({
      school_code: z.string().nullable().optional(),
      display_name: z.string(),
      subdomain: z.string().nullable().optional(),
      external_ids: z
        .object({ emis: z.any().nullable(), legacy: z.any().nullable() })
        .optional(),
    })
    .optional(),
  branding: z.object({
    logo: z.object({
      primary_url: z.string().url(),
      dark_mode_variant_url: z.string().url().nullable().optional(),
    }),
    colors: z.object({
      primary: z.string(),
      primary_contrast: z.string(),
      secondary: z.string(),
      surface: z.string(),
      surface_variant: z.string(),
      error: z.string(),
      success: z.string(),
      warning: z.string(),
    }),
    typography: z.object({ base_scale: z.number(), font_family: z.string() }),
    assets: z
      .object({
        favicon_url: z.string().url().optional(),
        mobile_splash_url: z.string().url().optional(),
      })
      .optional(),
    layout: z.object({
      density: z.enum(["comfortable", "compact"]),
      corner_style: z.enum(["rounded", "square"]),
    }),
  }),
  locale: z.object({
    language: z.string(),
    timezone: z.string(),
    date_format: z.string(),
    time_format: z.string(),
    currency: z.string(),
    number_format: z.object({ grouping: z.enum(["lakh", "western"]) }),
  }),
  modules: z.object({
    catalog_version: z.string(),
    subscribed: z.array(z.string()),
    available: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        short_desc: z.string().optional(),
        price_hint: z.string().optional(),
        learn_more_url: z.string().url().optional(),
        video_url: z.string().url().optional(),
        contact: z
          .object({
            email: z.string().email().optional(),
            phone: z.string().optional(),
          })
          .optional(),
      })
    ),
    settings: z.record(z.string(), z.any()),
    dependencies: z.record(z.string(), z.array(z.string())).optional(),
  }),
  ui: z.object({
    nav_order: z.array(z.string()),
    landing: z.record(z.string(), z.string()),
    badges: z.object({ beta: z.array(z.string()) }).optional(),
  }),
  integrations: z.record(z.string(), z.any()).optional(),
  onboarding: z.object({
    status: z.enum(["in_progress", "complete", "suspended"]),
    steps: z.array(
      z.object({ key: z.string(), weight: z.number(), done: z.boolean() })
    ),
    checklist_notes: z.string().optional(),
  }),
  feature_flags: z.record(z.string(), z.boolean()).optional(),
  limits: z.record(z.string(), z.any()).optional(),
  support: z.record(z.string(), z.any()).optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

export type SchoolConfig = z.infer<typeof SchoolConfigSchema>;

export async function fetchSchoolConfig(
  schoolId: number
): Promise<SchoolConfig> {
  try {
    const { data } = await http.get(`/schools/${schoolId}/configuration`);
    return SchoolConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Configuration validation failed:", error.issues);
      throw new Error("Invalid configuration format received from server");
    }
    throw error;
  }
}
