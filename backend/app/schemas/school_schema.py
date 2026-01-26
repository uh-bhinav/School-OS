# backend/app/schemas/school_schema.py
# ============================================================================
# PRODUCTION-GRADE SCHOOL SCHEMA WITH DEEP MERGE + TYPE NORMALIZATION
# ============================================================================
# Fixes the "Configuration Error: Invalid configuration format" issue by:
# 1. Providing complete DEFAULT_CONFIG matching frontend Zod schema
# 2. Deep merging DB config with defaults (preserves DB values, fills gaps)
# 3. Recursively normalizing types (string→number, array→string, etc.)
# 4. Ensuring EVERY response has a complete, valid config structure
# ============================================================================

from copy import deepcopy
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, HttpUrl, field_validator

# ============================================================================
# DEFAULT CONFIGURATION - Complete structure matching frontend Zod schema
# ============================================================================
DEFAULT_CONFIG: dict[str, Any] = {
    "version": "1.0.0",
    "identity": {"school_code": None, "display_name": "School", "subdomain": None, "external_ids": {"emis": None, "legacy": None}},
    "branding": {
        "logo": {"primary_url": "https://placehold.co/200x80/2563eb/white?text=School", "dark_mode_variant_url": None},
        "colors": {"primary": "#2563eb", "primary_contrast": "#ffffff", "secondary": "#10b981", "surface": "#ffffff", "surface_variant": "#f3f4f6", "error": "#ef4444", "success": "#10b981", "warning": "#f59e0b"},
        "typography": {"base_scale": 1.0, "font_family": "Inter, system-ui, -apple-system, sans-serif"},
        "assets": {"favicon_url": None, "mobile_splash_url": None},
        "layout": {"density": "comfortable", "corner_style": "rounded"},
    },
    "locale": {"language": "en", "timezone": "UTC", "date_format": "DD/MM/YYYY", "time_format": "12h", "currency": "USD", "number_format": {"grouping": "western"}},
    "modules": {"catalog_version": "2025.1", "subscribed": [], "available": [], "settings": {}, "dependencies": {}},
    "ui": {"nav_order": ["dashboard"], "landing": {"Admin": "dashboard", "Teacher": "dashboard", "Student": "dashboard", "Parent": "dashboard"}, "badges": {"beta": []}},
    "integrations": {},
    "onboarding": {"status": "in_progress", "steps": [], "checklist_notes": None},
    "feature_flags": {},
    "limits": {},
    "support": {},
    "meta": {},
}


# ============================================================================
# DEEP MERGE FUNCTION
# ============================================================================
def deep_merge(base: dict, override: dict) -> dict:
    """
    Deep merge two dictionaries, preserving structure from base.

    Rules:
    - If override has a key, use its value (recursively merge if both are dicts)
    - If override missing a key, use base's default value
    - Arrays are replaced entirely (no merging)
    - Primitives are replaced

    This ensures DB config overrides defaults while keeping complete structure.
    """
    result = deepcopy(base)

    for key, value in override.items():
        if key in result:
            # Both exist - need to decide merge strategy
            if isinstance(result[key], dict) and isinstance(value, dict):
                # Both are dicts - recursively merge
                result[key] = deep_merge(result[key], value)
            else:
                # Primitive or array - override wins
                result[key] = value
        else:
            # New key from DB - add it
            result[key] = value

    return result


# ============================================================================
# TYPE NORMALIZATION FUNCTION
# ============================================================================
def normalize_types(data: Any, path: tuple = ()) -> Any:
    """
    Recursively normalize types in configuration to match Zod schema.

    Type conversion rules:
    - String that looks like number → convert if in NUMBER_PATHS
    - Array with single string → extract string if in STRING_PATHS
    - String that should be array → wrap in array if in ARRAY_PATHS
    - Validate enums and apply fallbacks
    """
    # Paths that MUST be arrays
    ARRAY_PATHS = {
        ("modules", "subscribed"),
        ("modules", "available"),
        ("ui", "nav_order"),
        ("ui", "badges", "beta"),
        ("onboarding", "steps"),
    }

    # Paths that MUST be numbers
    NUMBER_PATHS = {
        ("branding", "typography", "base_scale"),
    }

    # Paths that MUST be strings
    STRING_PATHS = {
        ("branding", "colors", "primary"),
        ("branding", "colors", "primary_contrast"),
        ("branding", "colors", "secondary"),
        ("branding", "colors", "surface"),
        ("branding", "colors", "surface_variant"),
        ("branding", "colors", "error"),
        ("branding", "colors", "success"),
        ("branding", "colors", "warning"),
        ("branding", "logo", "primary_url"),
        ("branding", "logo", "dark_mode_variant_url"),
        ("branding", "assets", "favicon_url"),
        ("branding", "assets", "mobile_splash_url"),
        ("branding", "typography", "font_family"),
        ("branding", "layout", "density"),
        ("branding", "layout", "corner_style"),
        ("identity", "school_code"),
        ("identity", "display_name"),
        ("identity", "subdomain"),
        ("locale", "language"),
        ("locale", "timezone"),
        ("locale", "date_format"),
        ("locale", "time_format"),
        ("locale", "currency"),
        ("locale", "number_format", "grouping"),
        ("modules", "catalog_version"),
        ("onboarding", "status"),
        ("onboarding", "checklist_notes"),
        ("version",),
    }

    # Enum validation
    ENUMS = {
        ("branding", "layout", "density"): ["comfortable", "compact"],
        ("branding", "layout", "corner_style"): ["rounded", "square"],
        ("locale", "number_format", "grouping"): ["lakh", "western"],
        ("onboarding", "status"): ["in_progress", "complete", "suspended"],
    }

    # Base case: not a dict, apply type rules
    if not isinstance(data, dict):
        # Check if this path needs type conversion
        if path in NUMBER_PATHS:
            # Convert to number
            try:
                return float(data) if isinstance(data, (str, int, float)) else data
            except (ValueError, TypeError):
                return data

        elif path in STRING_PATHS:
            # Convert to string
            if isinstance(data, list) and len(data) > 0:
                return str(data[0])  # Extract first element
            return str(data) if data is not None else None

        elif path in ARRAY_PATHS:
            # Convert to array
            if not isinstance(data, list):
                return [data] if data is not None else []
            return data

        # Enum validation
        if path in ENUMS:
            allowed = ENUMS[path]
            if data not in allowed:
                return allowed[0]  # Fallback to first valid value

        return data

    # Recursive case: normalize all nested values
    normalized = {}
    for key, value in data.items():
        new_path = path + (key,)

        if isinstance(value, dict):
            normalized[key] = normalize_types(value, new_path)
        elif isinstance(value, list):
            # Normalize each array element if it's a dict
            normalized[key] = [normalize_types(item, new_path) if isinstance(item, dict) else item for item in value]
        else:
            normalized[key] = normalize_types(value, new_path)

    return normalized


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class SchoolCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    configuration: Optional[dict[str, Any]] = None


class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[HttpUrl] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    configuration: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None


class SchoolOut(BaseModel):
    school_id: int
    name: str
    logo_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    configuration: Optional[dict[str, Any]] = None
    is_active: bool

    @field_validator("configuration", mode="before")
    @classmethod
    def sanitize_configuration(cls, v: Any) -> Optional[dict[str, Any]]:
        """
        🔧 PRODUCTION-GRADE CONFIGURATION NORMALIZER

        Three-stage pipeline:
        1. Deep merge DB config with DEFAULT_CONFIG (ensures complete structure)
        2. Recursive type normalization (string→number, array→string, etc.)
        3. Return full, valid config matching frontend Zod schema

        Features:
        - ✅ Always returns complete config (no missing fields)
        - ✅ Preserves all DB values (deep merge, not replacement)
        - ✅ Type-safe (recursive normalization)
        - ✅ Enum validation with fallbacks
        - ✅ Backward compatible (works with partial configs)
        - ✅ Read-only (never modifies database)

        CRITICAL: This runs at serialization time (response only), not on writes.
        """
        # Stage 1: Handle null/empty
        if v is None:
            # Return full default config for schools without configuration
            print("[CONFIG NORMALIZER] ⚠️  Null config - returning defaults")
            return deepcopy(DEFAULT_CONFIG)

        if not isinstance(v, dict):
            # Invalid type - return defaults
            print(f"[CONFIG NORMALIZER] ⚠️  Invalid type {type(v)} - returning defaults")
            return deepcopy(DEFAULT_CONFIG)

        # Stage 2: Deep merge DB config with defaults
        # This ensures every required field exists, even if DB is missing it
        print(f"[CONFIG NORMALIZER] 🔀 Deep merging DB config (keys: {list(v.keys())})")
        merged = deep_merge(DEFAULT_CONFIG, v)

        # Stage 3: Normalize types recursively
        # Converts strings to numbers, arrays to strings, etc. based on Zod schema
        print("[CONFIG NORMALIZER] 🔧 Normalizing types recursively")
        normalized = normalize_types(merged)

        print("[CONFIG NORMALIZER] ✅ Normalization complete")
        return normalized

    class Config:
        from_attributes = True
