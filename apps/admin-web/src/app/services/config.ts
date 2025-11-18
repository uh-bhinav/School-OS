// ============================================================================
// SCHOOL CONFIGURATION API
// ============================================================================
// ✅ FIXED: Corrected endpoint path to match backend structure
// Backend: GET /api/v1/schools/{school_id} returns SchoolOut with configuration
// Note: Backend does NOT have a separate /configuration endpoint!
// The configuration is part of the school object itself
// ============================================================================

import { z } from "zod";
import { http } from "./http";

// ============================================================================
// PRODUCTION-GRADE ZOD SCHEMA - MATCHES BACKEND RESPONSE EXACTLY
// ============================================================================
// ✅ Updated to match the actual backend response structure
// ✅ All nullable fields properly marked
// ✅ Flexible with .passthrough() for extensibility
// ✅ Optional fields where backend may not provide them
// ============================================================================

export const SchoolConfigSchema = z
  .object({
    version: z.literal("1.0.0"),

    // ============================================================================
    // IDENTITY - School identification metadata
    // ============================================================================
    identity: z
      .object({
        school_code: z.string().nullable().optional(),
        display_name: z.string(),
        subdomain: z.string().nullable().optional(),
        external_ids: z
          .object({
            emis: z.any().nullable().optional(),
            legacy: z.any().nullable().optional()
          })
          .optional(),
      })
      .optional(),

    // ============================================================================
    // BRANDING - Visual identity and theming
    // ============================================================================
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
      typography: z.object({
        base_scale: z.number(),
        font_family: z.string()
      }),
      assets: z
        .object({
          // ✅ FIXED: favicon_url can be a valid URL OR null
          favicon_url: z.string().url().nullable().optional(),
          mobile_splash_url: z.string().url().nullable().optional(),
        })
        .optional(),
      layout: z.object({
        density: z.enum(["comfortable", "compact"]),
        corner_style: z.enum(["rounded", "square"]),
      }),
    }),

    // ============================================================================
    // LOCALE - Internationalization settings
    // ============================================================================
    locale: z.object({
      language: z.string(),
      timezone: z.string(),
      date_format: z.string(),
      time_format: z.string(),
      currency: z.string(),
      number_format: z.object({
        grouping: z.enum(["lakh", "western"])
      }),
    }),

    // ============================================================================
    // MODULES - Feature modules and settings
    // ============================================================================
    modules: z.object({
      catalog_version: z.string(),
      subscribed: z.array(z.string()),

      // ✅ FIXED: available modules schema matches backend response
      available: z.array(
        z
          .object({
            key: z.string(),
            label: z.string(),
            short_desc: z.string().optional(),
            price_hint: z.string().optional(),
            learn_more_url: z.string().url().nullable().optional(),
            video_url: z.string().url().nullable().optional(),
            contact: z
              .object({
                email: z.string().email().nullable().optional(),
                phone: z.string().nullable().optional(),
              })
              .optional(),
          })
          .passthrough() // Allow extra fields from backend
      ),

      // ✅ FIXED: settings is deeply nested - use passthrough for flexibility
      settings: z.record(z.string(), z.any()),

      dependencies: z.record(z.string(), z.array(z.string())).optional(),
    }),

    // ============================================================================
    // UI - Navigation and layout configuration
    // ============================================================================
    ui: z.object({
      nav_order: z.array(z.string()),
      landing: z.record(z.string(), z.string()),
      badges: z
        .object({
          beta: z.array(z.string())
        })
        .optional(),
    }),

    // ============================================================================
    // INTEGRATIONS - External service connections
    // ============================================================================
    integrations: z
      .record(z.string(), z.any())
      .optional(),

    // ============================================================================
    // ONBOARDING - School setup progress
    // ============================================================================
    onboarding: z.object({
      status: z.enum(["in_progress", "complete", "suspended"]),
      steps: z.array(
        z.object({
          key: z.string(),
          weight: z.number(),
          done: z.boolean()
        })
      ),
      checklist_notes: z.string().nullable().optional(),
    }),

    // ============================================================================
    // FEATURE FLAGS - Toggleable features
    // ============================================================================
    feature_flags: z
      .record(z.string(), z.boolean())
      .optional(),

    // ============================================================================
    // LIMITS - Quota and usage limits
    // ============================================================================
    limits: z
      .record(z.string(), z.any())
      .optional(),

    // ============================================================================
    // SUPPORT - Support channels and contact info
    // ============================================================================
    support: z
      .record(z.string(), z.any())
      .optional(),

    // ============================================================================
    // META - Audit trail metadata
    // ============================================================================
    meta: z
      .record(z.string(), z.any())
      .optional(),
  })
  .passthrough(); // ✅ CRITICAL: Allow unknown keys for backward compatibility

export type SchoolConfig = z.infer<typeof SchoolConfigSchema>;

// Full school response from backend
const SchoolOutSchema = z.object({
  school_id: z.number(),
  name: z.string(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  configuration: SchoolConfigSchema.nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
});

type SchoolOut = z.infer<typeof SchoolOutSchema>;

/**
 * Fetch school configuration
 *
 * ✅ FIXED: Endpoint is now /schools/{schoolId} (not /schools/{schoolId}/configuration)
 * Backend returns full SchoolOut object, we extract the configuration property
 * Gracefully handles null/missing configuration
 */
export async function fetchSchoolConfig(
  schoolId: number
): Promise<SchoolConfig> {
  try {
    console.log(`[CONFIG] Fetching school configuration for school_id: ${schoolId}`);

    // ✅ FIXED: Correct endpoint path
    const { data } = await http.get<SchoolOut>(`/schools/${schoolId}`);

    console.log(`[CONFIG] Received school data:`, data);

    // Extract configuration from school object
    if (!data.configuration) {
      console.warn(`[CONFIG] School ${schoolId} has no configuration set`);
      throw new Error(`School ${schoolId} has no configuration. Please contact administrator.`);
    }

    console.log(`[CONFIG] Raw configuration before validation:`, JSON.stringify(data.configuration, null, 2));

    // Validate configuration schema
    const validatedConfig = SchoolConfigSchema.parse(data.configuration);
    console.log(`[CONFIG] ✅ Configuration validated successfully for: ${validatedConfig.identity?.display_name || 'Unknown School'}`);

    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[CONFIG] ❌ Configuration validation failed:");
      console.error("Issues:", error.issues);
      console.error("Formatted errors:", error.format());
      throw new Error("Invalid configuration format received from server");
    }

    // Re-throw other errors (404, network, etc.)
    console.error("[CONFIG] Failed to fetch school configuration:", error);
    throw error;
  }
}
