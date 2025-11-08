


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "auth";


ALTER SCHEMA "auth" OWNER TO "supabase_admin";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "storage";


ALTER SCHEMA "storage" OWNER TO "supabase_admin";


CREATE TYPE "auth"."aal_level" AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE "auth"."aal_level" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."code_challenge_method" AS ENUM (
    's256',
    'plain'
);


ALTER TYPE "auth"."code_challenge_method" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_status" AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE "auth"."factor_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_type" AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE "auth"."factor_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_authorization_status" AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE "auth"."oauth_authorization_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_client_type" AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE "auth"."oauth_client_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_registration_type" AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE "auth"."oauth_registration_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_response_type" AS ENUM (
    'code'
);


ALTER TYPE "auth"."oauth_response_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."one_time_token_type" AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE "auth"."one_time_token_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "public"."achievement_type" AS ENUM (
    'academic',
    'sports',
    'cultural',
    'leadership',
    'community_service'
);


ALTER TYPE "public"."achievement_type" OWNER TO "postgres";


CREATE TYPE "public"."achievement_visibility" AS ENUM (
    'public',
    'school_only',
    'private'
);


ALTER TYPE "public"."achievement_visibility" OWNER TO "postgres";


CREATE TYPE "public"."allocation_status" AS ENUM (
    'pending',
    'allocated',
    'reversed',
    'adjusted'
);


ALTER TYPE "public"."allocation_status" OWNER TO "postgres";


CREATE TYPE "public"."club_activity_status" AS ENUM (
    'planned',
    'ongoing',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."club_activity_status" OWNER TO "postgres";


CREATE TYPE "public"."club_activity_type" AS ENUM (
    'meeting',
    'workshop',
    'competition',
    'event',
    'project'
);


ALTER TYPE "public"."club_activity_type" OWNER TO "postgres";


CREATE TYPE "public"."club_membership_role" AS ENUM (
    'member',
    'secretary',
    'treasurer',
    'president',
    'vice_president'
);


ALTER TYPE "public"."club_membership_role" OWNER TO "postgres";


CREATE TYPE "public"."club_membership_status" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'alumni'
);


ALTER TYPE "public"."club_membership_status" OWNER TO "postgres";


CREATE TYPE "public"."club_type" AS ENUM (
    'academic',
    'sports',
    'arts',
    'technical',
    'social'
);


ALTER TYPE "public"."club_type" OWNER TO "postgres";


CREATE TYPE "public"."discount_type" AS ENUM (
    'percentage',
    'fixed_amount'
);


ALTER TYPE "public"."discount_type" OWNER TO "postgres";


CREATE TYPE "public"."exam_status" AS ENUM (
    'pass',
    'fail',
    'absent',
    'NA'
);


ALTER TYPE "public"."exam_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."exam_status" IS 'if a student has passed the exam or not ';



CREATE TYPE "public"."meeting_frequency" AS ENUM (
    'weekly',
    'biweekly',
    'monthly'
);


ALTER TYPE "public"."meeting_frequency" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'authorized',
    'captured',
    'failed',
    'refunded',
    'partially_refunded',
    'disputed',
    'expired',
    'captured_allocation_failed'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."proficiency_level" AS ENUM (
    'expert',
    'intermediate',
    'basic'
);


ALTER TYPE "public"."proficiency_level" OWNER TO "postgres";


CREATE TYPE "public"."reconciliation_status" AS ENUM (
    'pending',
    'reconciled',
    'discrepancy',
    'under_review',
    'settled'
);


ALTER TYPE "public"."reconciliation_status" OWNER TO "postgres";


CREATE TYPE "public"."refund_status" AS ENUM (
    'pending',
    'processing',
    'processed',
    'failed',
    'cancelled'
);


ALTER TYPE "public"."refund_status" OWNER TO "postgres";


CREATE TYPE "storage"."buckettype" AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE "storage"."buckettype" OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "auth"."email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION "auth"."email"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."email"() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';



CREATE OR REPLACE FUNCTION "auth"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION "auth"."jwt"() OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION "auth"."role"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."role"() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';



CREATE OR REPLACE FUNCTION "auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION "auth"."uid"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."uid"() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';



CREATE OR REPLACE FUNCTION "public"."current_user_school_id"() RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  SELECT school_id
  FROM public.profiles
  WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."current_user_school_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_teacher_id"() RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  SELECT teacher_id
  FROM public.teachers
  WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."current_user_teacher_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COALESCE(auth.jwt() -> claim, 'null'::jsonb)
  );
END;
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_context"() RETURNS "test"."user_context"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    context user_context;
BEGIN
    -- Extract the core user and profile information
    SELECT
        p.user_id,
        p.school_id
    INTO
        context.user_id,
        context.school_id
    FROM
        public.profiles p
    WHERE
        p.user_id = auth.uid();

    -- Collect all role names for the user into an array
    SELECT
        array_agg(rd.role_name)
    INTO
        context.role_names
    FROM
        public.user_roles ur
    JOIN
        public.roles_definition rd ON ur.role_id = rd.role_id
    WHERE
        ur.user_id = context.user_id;

    -- If the user is a student, get their class and grade info
    SELECT
        s.student_id,
        s.current_class_id,
        c.grade_level
    INTO
        context.student_id,
        context.current_class_id,
        context.grade_level
    FROM
        public.students s
    LEFT JOIN
        public.classes c ON s.current_class_id = c.class_id
    WHERE
        s.user_id = context.user_id;

    RETURN context;
END;
$$;


ALTER FUNCTION "public"."get_user_context"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_context"() IS 'Single source of truth for the authenticated user''s context, used by all RLS policies.';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$BEGIN
  INSERT INTO public.profiles (user_id, school_id, first_name, last_name, phone_number, gender, date_of_birth)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'school_id')::INT, 0),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'gender',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE
  );
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_parent_of"("profile_user_id_to_check" "uuid", "student_id_to_check" integer) RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_contacts
    WHERE student_id = student_id_to_check
      AND profile_user_id = profile_user_id_to_check
  );
$$;


ALTER FUNCTION "public"."is_parent_of"("profile_user_id_to_check" "uuid", "student_id_to_check" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_student_in_teachers_class"("p_student_id" integer) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_teacher_id int;
BEGIN
  -- Get the teacher_id for the current user
  SELECT teacher_id INTO v_teacher_id FROM public.teachers WHERE user_id = auth.uid();

  RETURN EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON s.current_class_id = c.id
    WHERE s.id = p_student_id
    AND c.class_teacher_id = v_teacher_id
  );
END;
$$;


ALTER FUNCTION "public"."is_student_in_teachers_class"("p_student_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_a_contact_for_student"("p_student_id" integer) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.student_contacts
    WHERE student_contacts.student_id = p_student_id
    AND student_contacts.profile_user_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."is_user_a_contact_for_student"("p_student_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."trigger_set_timestamp"() IS 'Trigger function that automatically sets updated_at to current timestamp on row updates';



CREATE OR REPLACE FUNCTION "public"."who_am_i"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
  BEGIN
    RETURN current_user;
  END;
$$;


ALTER FUNCTION "public"."who_am_i"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "storage"."add_prefixes"("_bucket_id" "text", "_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION "storage"."add_prefixes"("_bucket_id" "text", "_name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."delete_leaf_prefixes"("bucket_ids" "text"[], "names" "text"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION "storage"."delete_leaf_prefixes"("bucket_ids" "text"[], "names" "text"[]) OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."delete_prefix"("_bucket_id" "text", "_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION "storage"."delete_prefix"("_bucket_id" "text", "_name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."delete_prefix_hierarchy_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION "storage"."delete_prefix_hierarchy_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."enforce_bucket_name_length"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION "storage"."enforce_bucket_name_length"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."extension"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION "storage"."extension"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."filename"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION "storage"."filename"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."foldername"("name" "text") RETURNS "text"[]
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION "storage"."foldername"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_level"("name" "text") RETURNS integer
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION "storage"."get_level"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_prefix"("name" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION "storage"."get_prefix"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_prefixes"("name" "text") RETURNS "text"[]
    LANGUAGE "plpgsql" IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION "storage"."get_prefixes"("name" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."get_size_by_bucket"() RETURNS TABLE("size" bigint, "bucket_id" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION "storage"."get_size_by_bucket"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "next_key_token" "text" DEFAULT ''::"text", "next_upload_token" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "id" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer, "next_key_token" "text", "next_upload_token" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."list_objects_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "start_after" "text" DEFAULT ''::"text", "next_token" "text" DEFAULT ''::"text") RETURNS TABLE("name" "text", "id" "uuid", "metadata" "jsonb", "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION "storage"."list_objects_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer, "start_after" "text", "next_token" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."lock_top_prefixes"("bucket_ids" "text"[], "names" "text"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION "storage"."lock_top_prefixes"("bucket_ids" "text"[], "names" "text"[]) OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_delete_cleanup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION "storage"."objects_delete_cleanup"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_insert_prefix_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."objects_insert_prefix_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_update_cleanup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION "storage"."objects_update_cleanup"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_update_level_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."objects_update_level_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."objects_update_prefix_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."objects_update_prefix_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."operation"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION "storage"."operation"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."prefixes_delete_cleanup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION "storage"."prefixes_delete_cleanup"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."prefixes_insert_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."prefixes_insert_trigger"() OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search_legacy_v1"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION "storage"."search_legacy_v1"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search_v1_optimised"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION "storage"."search_v1_optimised"("prefix" "text", "bucketname" "text", "limits" integer, "levels" integer, "offsets" integer, "search" "text", "sortcolumn" "text", "sortorder" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."search_v2"("prefix" "text", "bucket_name" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "start_after" "text" DEFAULT ''::"text", "sort_order" "text" DEFAULT 'asc'::"text", "sort_column" "text" DEFAULT 'name'::"text", "sort_column_after" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;

    sort_col := lower(sort_column);
    -- Validate sort column
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION "storage"."search_v2"("prefix" "text", "bucket_name" "text", "limits" integer, "levels" integer, "start_after" "text", "sort_order" "text", "sort_column" "text", "sort_column_after" "text") OWNER TO "supabase_storage_admin";


CREATE OR REPLACE FUNCTION "storage"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "storage"."update_updated_at_column"() OWNER TO "supabase_storage_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "payload" json,
    "created_at" timestamp with time zone,
    "ip_address" character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "auth"."audit_log_entries" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';



CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "auth_code" "text" NOT NULL,
    "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
    "code_challenge" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "provider_access_token" "text",
    "provider_refresh_token" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" "text" NOT NULL,
    "auth_code_issued_at" timestamp with time zone
);


ALTER TABLE "auth"."flow_state" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."flow_state" IS 'stores metadata for pkce logins';



CREATE TABLE IF NOT EXISTS "auth"."identities" (
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "identity_data" "jsonb" NOT NULL,
    "provider" "text" NOT NULL,
    "last_sign_in_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "email" "text" GENERATED ALWAYS AS ("lower"(("identity_data" ->> 'email'::"text"))) STORED,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "auth"."identities" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';



COMMENT ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';



CREATE TABLE IF NOT EXISTS "auth"."instances" (
    "id" "uuid" NOT NULL,
    "uuid" "uuid",
    "raw_base_config" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "auth"."instances" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';



CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
    "session_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "authentication_method" "text" NOT NULL,
    "id" "uuid" NOT NULL
);


ALTER TABLE "auth"."mfa_amr_claims" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';



CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
    "id" "uuid" NOT NULL,
    "factor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "ip_address" "inet" NOT NULL,
    "otp_code" "text",
    "web_authn_session_data" "jsonb"
);


ALTER TABLE "auth"."mfa_challenges" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';



CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friendly_name" "text",
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "secret" "text",
    "phone" "text",
    "last_challenged_at" timestamp with time zone,
    "web_authn_credential" "jsonb",
    "web_authn_aaguid" "uuid",
    "last_webauthn_challenge_data" "jsonb"
);


ALTER TABLE "auth"."mfa_factors" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';



COMMENT ON COLUMN "auth"."mfa_factors"."last_webauthn_challenge_data" IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';



CREATE TABLE IF NOT EXISTS "auth"."oauth_authorizations" (
    "id" "uuid" NOT NULL,
    "authorization_id" "text" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "redirect_uri" "text" NOT NULL,
    "scope" "text" NOT NULL,
    "state" "text",
    "resource" "text",
    "code_challenge" "text",
    "code_challenge_method" "auth"."code_challenge_method",
    "response_type" "auth"."oauth_response_type" DEFAULT 'code'::"auth"."oauth_response_type" NOT NULL,
    "status" "auth"."oauth_authorization_status" DEFAULT 'pending'::"auth"."oauth_authorization_status" NOT NULL,
    "authorization_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:03:00'::interval) NOT NULL,
    "approved_at" timestamp with time zone,
    CONSTRAINT "oauth_authorizations_authorization_code_length" CHECK (("char_length"("authorization_code") <= 255)),
    CONSTRAINT "oauth_authorizations_code_challenge_length" CHECK (("char_length"("code_challenge") <= 128)),
    CONSTRAINT "oauth_authorizations_expires_at_future" CHECK (("expires_at" > "created_at")),
    CONSTRAINT "oauth_authorizations_redirect_uri_length" CHECK (("char_length"("redirect_uri") <= 2048)),
    CONSTRAINT "oauth_authorizations_resource_length" CHECK (("char_length"("resource") <= 2048)),
    CONSTRAINT "oauth_authorizations_scope_length" CHECK (("char_length"("scope") <= 4096)),
    CONSTRAINT "oauth_authorizations_state_length" CHECK (("char_length"("state") <= 4096))
);


ALTER TABLE "auth"."oauth_authorizations" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."oauth_clients" (
    "id" "uuid" NOT NULL,
    "client_secret_hash" "text",
    "registration_type" "auth"."oauth_registration_type" NOT NULL,
    "redirect_uris" "text" NOT NULL,
    "grant_types" "text" NOT NULL,
    "client_name" "text",
    "client_uri" "text",
    "logo_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "client_type" "auth"."oauth_client_type" DEFAULT 'confidential'::"auth"."oauth_client_type" NOT NULL,
    CONSTRAINT "oauth_clients_client_name_length" CHECK (("char_length"("client_name") <= 1024)),
    CONSTRAINT "oauth_clients_client_uri_length" CHECK (("char_length"("client_uri") <= 2048)),
    CONSTRAINT "oauth_clients_logo_uri_length" CHECK (("char_length"("logo_uri") <= 2048))
);


ALTER TABLE "auth"."oauth_clients" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."oauth_consents" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "scopes" "text" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone,
    CONSTRAINT "oauth_consents_revoked_after_granted" CHECK ((("revoked_at" IS NULL) OR ("revoked_at" >= "granted_at"))),
    CONSTRAINT "oauth_consents_scopes_length" CHECK (("char_length"("scopes") <= 2048)),
    CONSTRAINT "oauth_consents_scopes_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "scopes")) > 0))
);


ALTER TABLE "auth"."oauth_consents" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."one_time_tokens" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" "text" NOT NULL,
    "relates_to" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length"("token_hash") > 0))
);


ALTER TABLE "auth"."one_time_tokens" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
    "instance_id" "uuid",
    "id" bigint NOT NULL,
    "token" character varying(255),
    "user_id" character varying(255),
    "revoked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "parent" character varying(255),
    "session_id" "uuid"
);


ALTER TABLE "auth"."refresh_tokens" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';



CREATE SEQUENCE IF NOT EXISTS "auth"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNER TO "supabase_auth_admin";


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNED BY "auth"."refresh_tokens"."id";



CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "entity_id" "text" NOT NULL,
    "metadata_xml" "text" NOT NULL,
    "metadata_url" "text",
    "attribute_mapping" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "name_id_format" "text",
    CONSTRAINT "entity_id not empty" CHECK (("char_length"("entity_id") > 0)),
    CONSTRAINT "metadata_url not empty" CHECK ((("metadata_url" = NULL::"text") OR ("char_length"("metadata_url") > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK (("char_length"("metadata_xml") > 0))
);


ALTER TABLE "auth"."saml_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';



CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "request_id" "text" NOT NULL,
    "for_email" "text",
    "redirect_to" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "flow_state_id" "uuid",
    CONSTRAINT "request_id not empty" CHECK (("char_length"("request_id") > 0))
);


ALTER TABLE "auth"."saml_relay_states" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';



CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" (
    "version" character varying(255) NOT NULL
);


ALTER TABLE "auth"."schema_migrations" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';



CREATE TABLE IF NOT EXISTS "auth"."sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "factor_id" "uuid",
    "aal" "auth"."aal_level",
    "not_after" timestamp with time zone,
    "refreshed_at" timestamp without time zone,
    "user_agent" "text",
    "ip" "inet",
    "tag" "text",
    "oauth_client_id" "uuid",
    "refresh_token_hmac_key" "text",
    "refresh_token_counter" bigint
);


ALTER TABLE "auth"."sessions" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';



COMMENT ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';



COMMENT ON COLUMN "auth"."sessions"."refresh_token_hmac_key" IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';



COMMENT ON COLUMN "auth"."sessions"."refresh_token_counter" IS 'Holds the ID (counter) of the last issued refresh token.';



CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "domain" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK (("char_length"("domain") > 0))
);


ALTER TABLE "auth"."sso_domains" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';



CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
    "id" "uuid" NOT NULL,
    "resource_id" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "disabled" boolean,
    CONSTRAINT "resource_id not empty" CHECK ((("resource_id" = NULL::"text") OR ("char_length"("resource_id") > 0)))
);


ALTER TABLE "auth"."sso_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';



COMMENT ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';



CREATE TABLE IF NOT EXISTS "auth"."users" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "aud" character varying(255),
    "role" character varying(255),
    "email" character varying(255),
    "encrypted_password" character varying(255),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "confirmation_token" character varying(255),
    "confirmation_sent_at" timestamp with time zone,
    "recovery_token" character varying(255),
    "recovery_sent_at" timestamp with time zone,
    "email_change_token_new" character varying(255),
    "email_change" character varying(255),
    "email_change_sent_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "phone" "text" DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamp with time zone,
    "phone_change" "text" DEFAULT ''::character varying,
    "phone_change_token" character varying(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST("email_confirmed_at", "phone_confirmed_at")) STORED,
    "email_change_token_current" character varying(255) DEFAULT ''::character varying,
    "email_change_confirm_status" smallint DEFAULT 0,
    "banned_until" timestamp with time zone,
    "reauthentication_token" character varying(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamp with time zone,
    "is_sso_user" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_email_change_confirm_status_check" CHECK ((("email_change_confirm_status" >= 0) AND ("email_change_confirm_status" <= 2)))
);


ALTER TABLE "auth"."users" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';



COMMENT ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';



CREATE TABLE IF NOT EXISTS "public"."academic_years" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "name" character varying(64) NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_active" boolean DEFAULT true,
    "meta_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."academic_years" OWNER TO "postgres";


COMMENT ON TABLE "public"."academic_years" IS 'Defines each academic session for a school, e.g., "2025-2026".';



CREATE SEQUENCE IF NOT EXISTS "public"."academic_years_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."academic_years_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."academic_years_id_seq" OWNED BY "public"."academic_years"."id";



CREATE TABLE IF NOT EXISTS "public"."achievement_point_rules" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "achievement_type" "public"."achievement_type" NOT NULL,
    "category_name" character varying(100) NOT NULL,
    "base_points" integer DEFAULT 10 NOT NULL,
    "level_multiplier" "jsonb" DEFAULT '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "achievement_point_rules_base_points_check" CHECK (("base_points" >= 0))
);


ALTER TABLE "public"."achievement_point_rules" OWNER TO "postgres";


COMMENT ON TABLE "public"."achievement_point_rules" IS 'Configuration for achievement point calculation. Defines base points and multipliers for different achievement levels';



COMMENT ON COLUMN "public"."achievement_point_rules"."level_multiplier" IS 'JSON object with multipliers for different competition levels (district, state, national, international)';



CREATE SEQUENCE IF NOT EXISTS "public"."achievement_point_rules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."achievement_point_rules_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."achievement_point_rules_id_seq" OWNED BY "public"."achievement_point_rules"."id";



CREATE TABLE IF NOT EXISTS "public"."album_targets" (
    "id" integer NOT NULL,
    "album_id" integer NOT NULL,
    "target_type" character varying(255) NOT NULL,
    "target_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "album_targets_target_type_check" CHECK ((("target_type")::"text" = ANY ((ARRAY['class'::character varying, 'grade'::character varying, 'section'::character varying, 'stream'::character varying, 'individual_student'::character varying])::"text"[])))
);


ALTER TABLE "public"."album_targets" OWNER TO "postgres";


COMMENT ON TABLE "public"."album_targets" IS 'Centralizes all media access rules, linking albums to their intended audiences.';



COMMENT ON COLUMN "public"."album_targets"."target_type" IS 'The type of audience, e.g., ''grade'', ''class''.';



COMMENT ON COLUMN "public"."album_targets"."target_id" IS 'The specific ID of the target, e.g., grade level number or class_id.';



CREATE SEQUENCE IF NOT EXISTS "public"."album_targets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."album_targets_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."album_targets_id_seq" OWNED BY "public"."album_targets"."id";



CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" integer NOT NULL,
    "title" character varying(255),
    "school_id" integer,
    "published_by_id" "uuid",
    "is_public" boolean,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb",
    "album_type" character varying(255),
    "access_scope" character varying(255),
    CONSTRAINT "albums_access_scope_check" CHECK ((("access_scope")::"text" = ANY ((ARRAY['public'::character varying, 'targeted'::character varying, 'private'::character varying])::"text"[]))),
    CONSTRAINT "albums_album_type_check" CHECK ((("album_type")::"text" = ANY ((ARRAY['profile'::character varying, 'cultural'::character varying, 'ecommerce'::character varying])::"text"[])))
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


COMMENT ON COLUMN "public"."albums"."album_type" IS 'Differentiates between media types, e.g., ''profile'', ''cultural'', ''ecommerce''.';



COMMENT ON COLUMN "public"."albums"."access_scope" IS 'Defines the permission model: ''public'', ''targeted'', or ''private''.';



CREATE SEQUENCE IF NOT EXISTS "public"."albums_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."albums_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."albums_id_seq" OWNED BY "public"."albums"."id";



CREATE TABLE IF NOT EXISTS "public"."announcement_targets" (
    "id" integer NOT NULL,
    "announcement_id" integer,
    "target_type" character varying(255),
    "target_id" integer,
    CONSTRAINT "announcement_targets_check" CHECK ((((("target_type")::"text" = 'SCHOOL'::"text") AND ("target_id" IS NOT NULL)) OR ((("target_type")::"text" = 'GRADE'::"text") AND ("target_id" IS NOT NULL)) OR ((("target_type")::"text" = 'CLASS'::"text") AND ("target_id" IS NOT NULL))))
);


ALTER TABLE "public"."announcement_targets" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."announcement_targets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."announcement_targets_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."announcement_targets_id_seq" OWNED BY "public"."announcement_targets"."id";



CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" integer NOT NULL,
    "title" character varying(255),
    "school_id" integer,
    "content" "jsonb",
    "published_by_id" "uuid",
    "published_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "language" character varying(8) DEFAULT 'en'::character varying
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."announcements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."announcements_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."announcements_id_seq" OWNED BY "public"."announcements"."id";



CREATE TABLE IF NOT EXISTS "public"."applied_discounts" (
    "id" bigint NOT NULL,
    "invoice_id" integer NOT NULL,
    "discount_id" integer NOT NULL,
    "amount_discounted" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."applied_discounts" OWNER TO "postgres";


COMMENT ON TABLE "public"."applied_discounts" IS 'Creates a permanent record of which discount was used on which invoice, providing a full audit trail.';



CREATE SEQUENCE IF NOT EXISTS "public"."applied_discounts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."applied_discounts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."applied_discounts_id_seq" OWNED BY "public"."applied_discounts"."id";



CREATE TABLE IF NOT EXISTS "public"."attendance_records" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "class_id" integer NOT NULL,
    "date" "date" NOT NULL,
    "status" character varying(50),
    "period_id" integer,
    "teacher_id" integer,
    "notes" "text",
    "recorded_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "absence_type" character varying(50),
    "late_minutes" integer
);


ALTER TABLE "public"."attendance_records" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."attendance_records_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."attendance_records_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."attendance_records_id_seq" OWNED BY "public"."attendance_records"."id";



CREATE TABLE IF NOT EXISTS "public"."audits" (
    "audit_id" integer NOT NULL,
    "user_id" "uuid",
    "action_type" character varying(50) NOT NULL,
    "table_name" character varying(255) NOT NULL,
    "record_id" character varying(255) NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "action_timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "ip_address" character varying(255)
);


ALTER TABLE "public"."audits" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."audits_audit_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."audits_audit_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."audits_audit_id_seq" OWNED BY "public"."audits"."audit_id";



CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "cart_item_id" integer NOT NULL,
    "cart_id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "quantity" integer NOT NULL,
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cart_items_cart_item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cart_items_cart_item_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cart_items_cart_item_id_seq" OWNED BY "public"."cart_items"."cart_item_id";



CREATE TABLE IF NOT EXISTS "public"."carts" (
    "cart_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."carts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."carts_cart_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."carts_cart_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."carts_cart_id_seq" OWNED BY "public"."carts"."cart_id";



CREATE MATERIALIZED VIEW "public"."class_attendance_weekly" AS
 SELECT "class_id",
    "date_trunc"('week'::"text", ("date")::timestamp with time zone) AS "week_start_date",
    "avg"(
        CASE
            WHEN (("status")::"text" = 'Present'::"text") THEN 100.0
            ELSE 0.0
        END) AS "attendance_percentage"
   FROM "public"."attendance_records"
  GROUP BY "class_id", ("date_trunc"('week'::"text", ("date")::timestamp with time zone))
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."class_attendance_weekly" OWNER TO "postgres";


COMMENT ON MATERIALIZED VIEW "public"."class_attendance_weekly" IS 'A pre-computed summary of weekly class attendance percentages for fast AI queries.';



CREATE TABLE IF NOT EXISTS "public"."class_fee_structure" (
    "id" integer NOT NULL,
    "class_id" integer NOT NULL,
    "component_id" integer NOT NULL,
    "academic_year_id" integer NOT NULL,
    "amount" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."class_fee_structure" OWNER TO "postgres";


COMMENT ON TABLE "public"."class_fee_structure" IS 'Applies fee components to a specific class for a given academic year.';



CREATE SEQUENCE IF NOT EXISTS "public"."class_fee_structure_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."class_fee_structure_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."class_fee_structure_id_seq" OWNED BY "public"."class_fee_structure"."id";



CREATE TABLE IF NOT EXISTS "public"."class_subjects" (
    "id" integer NOT NULL,
    "class_id" integer NOT NULL,
    "subject_id" integer NOT NULL,
    "is_elective" boolean DEFAULT false,
    "stream_id" integer
);


ALTER TABLE "public"."class_subjects" OWNER TO "postgres";


COMMENT ON TABLE "public"."class_subjects" IS 'The crucial mapping table that defines the curriculum for each class.';



CREATE SEQUENCE IF NOT EXISTS "public"."class_subjects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."class_subjects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."class_subjects_id_seq" OWNED BY "public"."class_subjects"."id";



CREATE TABLE IF NOT EXISTS "public"."classes" (
    "class_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "grade_level" integer NOT NULL,
    "section" character varying(10) NOT NULL,
    "class_teacher_id" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "academic_year_id" integer
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."classes_class_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."classes_class_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."classes_class_id_seq" OWNED BY "public"."classes"."class_id";



CREATE TABLE IF NOT EXISTS "public"."club_activities" (
    "id" integer NOT NULL,
    "club_id" integer NOT NULL,
    "student_id" integer,
    "activity_name" character varying(255) NOT NULL,
    "activity_type" "public"."club_activity_type" NOT NULL,
    "description" "text",
    "scheduled_date" "date" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "venue" character varying(255),
    "attendance_mandatory" boolean DEFAULT false NOT NULL,
    "max_participants" integer,
    "budget_allocated" numeric(10,2),
    "status" "public"."club_activity_status" DEFAULT 'planned'::"public"."club_activity_status" NOT NULL,
    "outcome_notes" "text",
    "media_urls" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_activity_scheduled_future" CHECK (("scheduled_date" >= (CURRENT_DATE - '1 year'::interval))),
    CONSTRAINT "chk_activity_time" CHECK ((("end_time" IS NULL) OR ("start_time" IS NULL) OR ("end_time" > "start_time"))),
    CONSTRAINT "club_activities_budget_allocated_check" CHECK ((("budget_allocated" IS NULL) OR ("budget_allocated" >= (0)::numeric))),
    CONSTRAINT "club_activities_max_participants_check" CHECK ((("max_participants" IS NULL) OR ("max_participants" > 0)))
);


ALTER TABLE "public"."club_activities" OWNER TO "postgres";


COMMENT ON TABLE "public"."club_activities" IS 'All club events, meetings, workshops, and competitions with scheduling and outcome tracking';



COMMENT ON COLUMN "public"."club_activities"."outcome_notes" IS 'Summary of what was achieved, attendance, feedback after activity completion';



COMMENT ON COLUMN "public"."club_activities"."media_urls" IS 'JSON array of photo/video URLs from the activity';



CREATE SEQUENCE IF NOT EXISTS "public"."club_activities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."club_activities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."club_activities_id_seq" OWNED BY "public"."club_activities"."id";



CREATE TABLE IF NOT EXISTS "public"."club_memberships" (
    "id" integer NOT NULL,
    "club_id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "approved_by_user_id" "uuid" NOT NULL,
    "role" "public"."club_membership_role" DEFAULT 'member'::"public"."club_membership_role" NOT NULL,
    "joined_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "status" "public"."club_membership_status" DEFAULT 'active'::"public"."club_membership_status" NOT NULL,
    "attendance_count" integer DEFAULT 0 NOT NULL,
    "contribution_score" integer DEFAULT 0 NOT NULL,
    "exit_date" "date",
    "exit_reason" "text",
    "notes" "text",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_membership_dates" CHECK ((("exit_date" IS NULL) OR ("exit_date" > "joined_date"))),
    CONSTRAINT "chk_membership_exit_status" CHECK ((("exit_date" IS NULL) OR ("status" <> 'active'::"public"."club_membership_status"))),
    CONSTRAINT "club_memberships_attendance_count_check" CHECK (("attendance_count" >= 0)),
    CONSTRAINT "club_memberships_contribution_score_check" CHECK (("contribution_score" >= 0))
);


ALTER TABLE "public"."club_memberships" OWNER TO "postgres";


COMMENT ON TABLE "public"."club_memberships" IS 'Student membership records in clubs with roles, attendance tracking, and contribution scores';



COMMENT ON COLUMN "public"."club_memberships"."contribution_score" IS 'Points awarded for active participation, event organization, etc.';



CREATE SEQUENCE IF NOT EXISTS "public"."club_memberships_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."club_memberships_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."club_memberships_id_seq" OWNED BY "public"."club_memberships"."id";



CREATE TABLE IF NOT EXISTS "public"."clubs" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "teacher_in_charge_id" integer NOT NULL,
    "assistant_teacher_id" integer,
    "academic_year_id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "club_type" "public"."club_type" NOT NULL,
    "logo_url" character varying(500),
    "meeting_schedule" "jsonb",
    "meeting_frequency" "public"."meeting_frequency" DEFAULT 'weekly'::"public"."meeting_frequency" NOT NULL,
    "max_members" integer,
    "current_member_count" integer DEFAULT 0 NOT NULL,
    "registration_open" boolean DEFAULT true NOT NULL,
    "registration_start_date" "date",
    "registration_end_date" "date",
    "club_rules" "text",
    "objectives" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_club_member_capacity" CHECK ((("max_members" IS NULL) OR ("current_member_count" <= "max_members"))),
    CONSTRAINT "chk_club_registration_dates" CHECK ((("registration_end_date" IS NULL) OR ("registration_end_date" > "registration_start_date"))),
    CONSTRAINT "clubs_current_member_count_check" CHECK (("current_member_count" >= 0)),
    CONSTRAINT "clubs_max_members_check" CHECK ((("max_members" IS NULL) OR ("max_members" > 0)))
);


ALTER TABLE "public"."clubs" OWNER TO "postgres";


COMMENT ON TABLE "public"."clubs" IS 'Extra-curricular clubs and student organizations with registration and membership management';



COMMENT ON COLUMN "public"."clubs"."meeting_schedule" IS 'JSON object with meeting details: day, time, room/location';



COMMENT ON COLUMN "public"."clubs"."objectives" IS 'JSON array of club objectives and goals';



CREATE SEQUENCE IF NOT EXISTS "public"."clubs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."clubs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."clubs_id_seq" OWNED BY "public"."clubs"."id";



CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(50),
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "conversation_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "title" character varying(255),
    "status" character varying(50) DEFAULT 'Open'::character varying,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."conversations_conversation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."conversations_conversation_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."conversations_conversation_id_seq" OWNED BY "public"."conversations"."conversation_id";



CREATE TABLE IF NOT EXISTS "public"."discounts" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "type" "public"."discount_type" NOT NULL,
    "value" numeric(10,2) NOT NULL,
    "rules" "jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_discount_percentage" CHECK ((("type" <> 'percentage'::"public"."discount_type") OR (("value" >= (0)::numeric) AND ("value" <= (100)::numeric)))),
    CONSTRAINT "chk_discount_value_positive" CHECK (("value" > (0)::numeric)),
    CONSTRAINT "discounts_value_check" CHECK (("value" > (0)::numeric))
);

ALTER TABLE ONLY "public"."discounts" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."discounts" OWNER TO "postgres";


COMMENT ON TABLE "public"."discounts" IS 'Master library of reusable discount templates that can be applied to students';



COMMENT ON COLUMN "public"."discounts"."type" IS 'Discount calculation method: percentage (e.g., 10%) or fixed_amount (e.g., ₹500)';



COMMENT ON COLUMN "public"."discounts"."rules" IS 'JSONB field storing discount application rules. Example: {"applicable_to_component_ids": [1, 5]} limits discount to specific fee components';



CREATE SEQUENCE IF NOT EXISTS "public"."discounts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."discounts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."discounts_id_seq" OWNED BY "public"."discounts"."id";



CREATE TABLE IF NOT EXISTS "public"."employment_statuses" (
    "status_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "status_name" character varying(255) NOT NULL
);


ALTER TABLE "public"."employment_statuses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."employment_statuses_status_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."employment_statuses_status_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."employment_statuses_status_id_seq" OWNED BY "public"."employment_statuses"."status_id";



CREATE TABLE IF NOT EXISTS "public"."event_rsvps" (
    "id" integer NOT NULL,
    "event_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" character varying(32) NOT NULL,
    "responded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_rsvps" OWNER TO "postgres";


COMMENT ON TABLE "public"."event_rsvps" IS 'Tracks user RSVPs for events.';



CREATE SEQUENCE IF NOT EXISTS "public"."event_rsvps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."event_rsvps_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."event_rsvps_id_seq" OWNED BY "public"."event_rsvps"."id";



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "title" character varying(256) NOT NULL,
    "description" "text",
    "start_at" timestamp with time zone NOT NULL,
    "end_at" timestamp with time zone,
    "created_by" "uuid",
    "rsvp_required" boolean DEFAULT false,
    "rsvp_close_at" timestamp with time zone
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON TABLE "public"."events" IS 'Manages school events like Sports Day or PTMs.';



CREATE SEQUENCE IF NOT EXISTS "public"."events_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."events_id_seq" OWNED BY "public"."events"."id";



CREATE TABLE IF NOT EXISTS "public"."exam_types" (
    "exam_type_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "type_name" character varying(255) NOT NULL
);


ALTER TABLE "public"."exam_types" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."exam_types_exam_type_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."exam_types_exam_type_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."exam_types_exam_type_id_seq" OWNED BY "public"."exam_types"."exam_type_id";



CREATE TABLE IF NOT EXISTS "public"."exams" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "exam_name" character varying(255),
    "exam_type_id" integer,
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "marks" numeric,
    "academic_year_id" integer,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."exams" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."exams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."exams_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."exams_id_seq" OWNED BY "public"."exams"."id";



CREATE TABLE IF NOT EXISTS "public"."fee_components" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "component_name" character varying(128) NOT NULL,
    "component_type" character varying(64) NOT NULL,
    "base_amount" numeric(10,2),
    "is_mandatory" boolean DEFAULT true,
    "payment_frequency" character varying(64) DEFAULT 'Annual'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fee_components" OWNER TO "postgres";


COMMENT ON TABLE "public"."fee_components" IS 'Defines individual fee items like ''Tuition Fee'', ''Library Fee'', etc.';



CREATE SEQUENCE IF NOT EXISTS "public"."fee_components_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fee_components_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fee_components_id_seq" OWNED BY "public"."fee_components"."id";



CREATE TABLE IF NOT EXISTS "public"."fee_templates" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "total_amount" numeric,
    "school_id" integer NOT NULL,
    "status" character varying(50),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "description" "text",
    "start_date" "date",
    "end_date" "date",
    "academic_year_id" integer
);


ALTER TABLE "public"."fee_templates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."fee_structure_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fee_structure_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fee_structure_id_seq" OWNED BY "public"."fee_templates"."id";



CREATE TABLE IF NOT EXISTS "public"."fee_template_components" (
    "id" bigint NOT NULL,
    "fee_template_id" integer NOT NULL,
    "fee_component_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fee_template_components" OWNER TO "postgres";


COMMENT ON TABLE "public"."fee_template_components" IS 'Establishes the many-to-many relationship between fee_templates and fee_components, defining what items make up a fee package.';



CREATE SEQUENCE IF NOT EXISTS "public"."fee_template_components_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fee_template_components_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fee_template_components_id_seq" OWNED BY "public"."fee_template_components"."id";



CREATE TABLE IF NOT EXISTS "public"."fee_terms" (
    "id" integer NOT NULL,
    "fee_template_id" integer NOT NULL,
    "name" character varying(64) NOT NULL,
    "due_date" "date" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fee_terms" OWNER TO "postgres";


COMMENT ON TABLE "public"."fee_terms" IS 'Defines payment installments for a fee template.';



CREATE SEQUENCE IF NOT EXISTS "public"."fee_terms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."fee_terms_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."fee_terms_id_seq" OWNED BY "public"."fee_terms"."id";



CREATE TABLE IF NOT EXISTS "public"."form_submissions" (
    "id" integer NOT NULL,
    "form_id" integer,
    "submitted_by_user_id" "uuid",
    "responses" "jsonb",
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "submission_status" character varying(50),
    "ip_address" character varying(255)
);


ALTER TABLE "public"."form_submissions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."form_submissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."form_submissions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."form_submissions_id_seq" OWNED BY "public"."form_submissions"."id";



CREATE TABLE IF NOT EXISTS "public"."forms" (
    "id" integer NOT NULL,
    "title" character varying(255),
    "structure" "jsonb",
    "school_id" integer,
    "form_type" character varying(50),
    "status" character varying(50),
    "created_by_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "description" "text"
);


ALTER TABLE "public"."forms" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."forms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."forms_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."forms_id_seq" OWNED BY "public"."forms"."id";



CREATE TABLE IF NOT EXISTS "public"."gateway_webhook_events" (
    "id" integer NOT NULL,
    "gateway_name" character varying(50) DEFAULT 'razorpay'::character varying NOT NULL,
    "event_id" character varying(255) NOT NULL,
    "payload" "jsonb",
    "status" character varying(50) NOT NULL,
    "processing_error" "text",
    "received_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gateway_webhook_events" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."gateway_webhook_events_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."gateway_webhook_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."gateway_webhook_events_id_seq" OWNED BY "public"."gateway_webhook_events"."id";



CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" bigint NOT NULL,
    "school_id" integer NOT NULL,
    "invoice_id" integer NOT NULL,
    "fee_component_id" integer NOT NULL,
    "original_amount" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "final_amount" numeric(10,2) NOT NULL,
    "amount_paid" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "payment_status" character varying(50) DEFAULT 'unpaid'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "component_name" character varying NOT NULL
);

ALTER TABLE ONLY "public"."invoice_items" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoice_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invoice_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invoice_items_id_seq" OWNED BY "public"."invoice_items"."id";



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" integer NOT NULL,
    "student_id" integer,
    "fee_structure_id" integer,
    "status" character varying(50),
    "invoice_number" character varying(255),
    "due_date" "date",
    "amount_due" numeric,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "payment_date" "date",
    "payment_method" character varying(255),
    "fine_amount" numeric,
    "fee_term_id" integer,
    "late_fee_applied" numeric(10,2) DEFAULT 0,
    "scholarship_ref" character varying(128),
    "amount_paid" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "payment_status" character varying(50) DEFAULT 'unpaid'::character varying NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."invoices"."amount_paid" IS 'The total amount paid against this invoice so far. Updated by the payment allocation service.';



COMMENT ON COLUMN "public"."invoices"."payment_status" IS 'A denormalized status for quick reference (e.g., unpaid, partially_paid, paid). Updated by the payment allocation service.';



CREATE SEQUENCE IF NOT EXISTS "public"."invoices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invoices_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invoices_id_seq" OWNED BY "public"."invoices"."id";



CREATE TABLE IF NOT EXISTS "public"."logs" (
    "log_id" integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "log_level" character varying(20),
    "message" "text",
    "details" "jsonb"
);


ALTER TABLE "public"."logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."logs_log_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."logs_log_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."logs_log_id_seq" OWNED BY "public"."logs"."log_id";



CREATE TABLE IF NOT EXISTS "public"."marks" (
    "id" bigint NOT NULL,
    "school_id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "exam_id" integer NOT NULL,
    "subject_id" integer NOT NULL,
    "marks_obtained" numeric(5,2) NOT NULL,
    "max_marks" numeric(5,2) DEFAULT 100.00 NOT NULL,
    "remarks" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."marks" OWNER TO "postgres";


COMMENT ON TABLE "public"."marks" IS 'Stores the academic marks for students in various exams and subjects.';



COMMENT ON COLUMN "public"."marks"."school_id" IS 'Multi-tenancy key to isolate marks by school.';



CREATE SEQUENCE IF NOT EXISTS "public"."marks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."marks_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."marks_id_seq" OWNED BY "public"."marks"."id";



CREATE TABLE IF NOT EXISTS "public"."media_items" (
    "id" integer NOT NULL,
    "album_id" integer,
    "storage_path" character varying(255),
    "uploaded_by_id" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb",
    "mime_type" character varying(255),
    "file_size_bytes" bigint
);


ALTER TABLE "public"."media_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."media_items"."storage_path" IS 'Relative path to the file in the storage bucket, e.g., /cultural/sports-day/photo1.jpg.';



COMMENT ON COLUMN "public"."media_items"."mime_type" IS 'The MIME type of the file, e.g., ''image/jpeg''.';



COMMENT ON COLUMN "public"."media_items"."file_size_bytes" IS 'The size of the file in bytes.';



CREATE SEQUENCE IF NOT EXISTS "public"."media_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."media_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."media_items_id_seq" OWNED BY "public"."media_items"."id";



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "message_id" integer NOT NULL,
    "conversation_id" integer NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "is_read" boolean DEFAULT false,
    "sent_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "language" character varying(8) DEFAULT 'en'::character varying
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."messages_message_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."messages_message_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."messages_message_id_seq" OWNED BY "public"."messages"."message_id";



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" integer NOT NULL,
    "order_id" integer,
    "product_id" integer,
    "quantity" integer,
    "price_at_time_of_order" numeric,
    "status" character varying(50),
    "package_id" integer
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."order_items_id_seq" OWNED BY "public"."order_items"."id";



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "order_id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "parent_user_id" "uuid" NOT NULL,
    "order_number" character varying(255),
    "total_amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "school_id" integer DEFAULT 1 NOT NULL,
    "status" "test"."order_status" DEFAULT 'pending_payment'::"test"."order_status"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."orders_order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."orders_order_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."orders_order_id_seq" OWNED BY "public"."orders"."order_id";



CREATE TABLE IF NOT EXISTS "public"."package_items" (
    "package_id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "package_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."package_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_allocations" (
    "id" bigint NOT NULL,
    "payment_id" bigint NOT NULL,
    "amount_allocated" numeric(10,2) NOT NULL,
    "notes" "text",
    "allocated_by_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "invoice_item_id" bigint,
    CONSTRAINT "payment_allocations_amount_allocated_check" CHECK (("amount_allocated" > (0)::numeric))
);

ALTER TABLE ONLY "public"."payment_allocations" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_allocations" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_allocations" IS 'Provides a granular, auditable trail of how funds from a single payment are distributed across specific invoice line items.';



CREATE SEQUENCE IF NOT EXISTS "public"."payment_allocations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payment_allocations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payment_allocations_id_seq" OWNED BY "public"."payment_allocations"."id";



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" bigint NOT NULL,
    "school_id" integer NOT NULL,
    "student_id" integer,
    "user_id" "uuid" NOT NULL,
    "invoice_id" integer,
    "order_id" bigint,
    "currency" character varying(3) DEFAULT 'INR'::character varying NOT NULL,
    "gateway_name" character varying(50) DEFAULT 'razorpay'::character varying NOT NULL,
    "gateway_payment_id" character varying(255),
    "gateway_order_id" character varying(255) NOT NULL,
    "gateway_signature" "text",
    "status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "reconciliation_status" "public"."reconciliation_status" DEFAULT 'pending'::"public"."reconciliation_status" NOT NULL,
    "method" character varying(50),
    "error_code" character varying(255),
    "error_description" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount_paid" numeric(10,2),
    CONSTRAINT "chk_payment_target" CHECK (((("invoice_id" IS NOT NULL) AND ("order_id" IS NULL)) OR (("invoice_id" IS NULL) AND ("order_id" IS NOT NULL))))
);

ALTER TABLE ONLY "public"."payments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON TABLE "public"."payments" IS 'Central ledger for every payment attempt, linking a transaction to an invoice or an e-commerce order.';



COMMENT ON CONSTRAINT "chk_payment_target" ON "public"."payments" IS 'Ensures a payment is linked to either an invoice or an order, but never both.';



CREATE SEQUENCE IF NOT EXISTS "public"."payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payments_id_seq" OWNED BY "public"."payments"."id";



CREATE TABLE IF NOT EXISTS "public"."periods" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "period_number" integer,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "duration_minutes" integer,
    "is_recess" boolean DEFAULT false,
    "period_name" character varying(255),
    "day_of_week" character varying(50),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."periods" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."periods_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."periods_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."periods_id_seq" OWNED BY "public"."periods"."id";



CREATE TABLE IF NOT EXISTS "public"."product_album_links" (
    "id" bigint NOT NULL,
    "product_id" integer NOT NULL,
    "album_id" integer NOT NULL,
    "storage_path" character varying(1024) NOT NULL,
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_album_links" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_album_links" IS 'Links products to their images, which are organized into albums for access control.';



COMMENT ON COLUMN "public"."product_album_links"."storage_path" IS 'The exact file path in the storage bucket, e.g., /products/uniforms/shirt.jpg.';



COMMENT ON COLUMN "public"."product_album_links"."is_primary" IS 'Marks the main image for a product.';



CREATE SEQUENCE IF NOT EXISTS "public"."product_album_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_album_links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_album_links_id_seq" OWNED BY "public"."product_album_links"."id";



CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "category_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "category_name" character varying(255),
    "description" "text",
    "display_order" integer,
    "icon_url" character varying(500),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_categories_category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_categories_category_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_categories_category_id_seq" OWNED BY "public"."product_categories"."category_id";



CREATE TABLE IF NOT EXISTS "public"."product_package_rules" (
    "id" integer NOT NULL,
    "product_package_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "grade_level" integer,
    "academic_year_id" integer,
    "is_mandatory" boolean DEFAULT false
);


ALTER TABLE "public"."product_package_rules" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_package_rules" IS 'Creates rules to proactively recommend e-commerce packages to parents.';



CREATE SEQUENCE IF NOT EXISTS "public"."product_package_rules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_package_rules_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_package_rules_id_seq" OWNED BY "public"."product_package_rules"."id";



CREATE TABLE IF NOT EXISTS "public"."product_packages" (
    "id" integer NOT NULL,
    "name" character varying(255),
    "school_id" integer,
    "price" numeric,
    "academic_year" character varying(255),
    "is_active" boolean,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "description" "text",
    "image_url" character varying(255),
    "category" character varying(50)
);


ALTER TABLE "public"."product_packages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_packages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_packages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_packages_id_seq" OWNED BY "public"."product_packages"."id";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "product_id" integer NOT NULL,
    "name" character varying(255),
    "price" numeric,
    "stock_quantity" integer,
    "category_id" integer,
    "school_id" integer,
    "sku" character varying(255),
    "is_active" boolean,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "description" "text",
    "manufacturer" character varying(255),
    "reorder_level" integer,
    "reorder_quantity" integer,
    "image_url" character varying(255)
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."products_product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."products_product_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."products_product_id_seq" OWNED BY "public"."products"."product_id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "school_id" integer NOT NULL,
    "first_name" character varying(255),
    "last_name" character varying(255),
    "phone_number" character varying(20),
    "gender" character varying(50),
    "date_of_birth" "date",
    "profile_picture_url" character varying(255),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "aadhaar_last4" character varying(4),
    "aadhaar_encrypted" "bytea"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."refunds" (
    "id" bigint NOT NULL,
    "payment_id" bigint NOT NULL,
    "gateway_refund_id" character varying(255),
    "amount" numeric(10,2) NOT NULL,
    "currency" character varying(3) DEFAULT 'INR'::character varying NOT NULL,
    "reason" "text" NOT NULL,
    "status" "public"."refund_status" DEFAULT 'pending'::"public"."refund_status" NOT NULL,
    "notes" "text",
    "processed_by_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "refunds_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."refunds" OWNER TO "postgres";


COMMENT ON TABLE "public"."refunds" IS 'Immutable ledger for all money returned to parents, providing a clear audit trail for every refund transaction.';



COMMENT ON COLUMN "public"."refunds"."payment_id" IS 'Links the refund to the original successful payment transaction.';



COMMENT ON COLUMN "public"."refunds"."gateway_refund_id" IS 'Stores the unique transaction ID provided by the payment gateway (e.g., Razorpay) for this specific refund.';



CREATE SEQUENCE IF NOT EXISTS "public"."refunds_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."refunds_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."refunds_id_seq" OWNED BY "public"."refunds"."id";



CREATE TABLE IF NOT EXISTS "public"."roles_definition" (
    "role_id" integer NOT NULL,
    "role_name" character varying(50) NOT NULL
);


ALTER TABLE "public"."roles_definition" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."roles_definition_role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."roles_definition_role_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."roles_definition_role_id_seq" OWNED BY "public"."roles_definition"."role_id";



CREATE TABLE IF NOT EXISTS "public"."rte_reservations" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "academic_year_id" integer NOT NULL,
    "admitted_under_rte" boolean DEFAULT false,
    "documents" "jsonb"
);


ALTER TABLE "public"."rte_reservations" OWNER TO "postgres";


COMMENT ON TABLE "public"."rte_reservations" IS 'Tracks student admissions under the Right to Education (RTE) Act quota.';



CREATE SEQUENCE IF NOT EXISTS "public"."rte_reservations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."rte_reservations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rte_reservations_id_seq" OWNED BY "public"."rte_reservations"."id";



CREATE TABLE IF NOT EXISTS "public"."schools" (
    "school_id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "logo_url" character varying(255),
    "address" "text",
    "city" character varying(255),
    "state" character varying(255),
    "postal_code" character varying(20),
    "country" character varying(100),
    "phone_number" character varying(20),
    "email" character varying(255),
    "website" character varying(255),
    "configuration" "jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "razorpay_key_secret_encrypted" "bytea",
    "razorpay_webhook_secret_encrypted" "bytea",
    "razorpay_key_id_encrypted" "bytea"
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


COMMENT ON COLUMN "public"."schools"."razorpay_key_secret_encrypted" IS 'Stores the school''s Razorpay Key ID, encrypted at the application layer before insertion.';



COMMENT ON COLUMN "public"."schools"."razorpay_webhook_secret_encrypted" IS 'Stores the school''s unique Razorpay Webhook Secret, encrypted at the application layer before insertion.';



CREATE SEQUENCE IF NOT EXISTS "public"."schools_school_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."schools_school_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."schools_school_id_seq" OWNED BY "public"."schools"."school_id";



CREATE TABLE IF NOT EXISTS "public"."stream_subjects" (
    "stream_id" integer NOT NULL,
    "subject_id" integer NOT NULL
);


ALTER TABLE "public"."stream_subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."streams" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "code" character varying(32),
    "name" character varying(128) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."streams" OWNER TO "postgres";


COMMENT ON TABLE "public"."streams" IS 'Defines available subject streams like "Science" or "Commerce".';



CREATE SEQUENCE IF NOT EXISTS "public"."streams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."streams_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."streams_id_seq" OWNED BY "public"."streams"."id";



CREATE TABLE IF NOT EXISTS "public"."student_achievements" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "academic_year_id" integer NOT NULL,
    "awarded_by_user_id" "uuid" NOT NULL,
    "verified_by_user_id" "uuid",
    "achievement_type" "public"."achievement_type" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "achievement_category" character varying(100) NOT NULL,
    "points_awarded" integer DEFAULT 0 NOT NULL,
    "date_awarded" "date" NOT NULL,
    "certificate_url" character varying(500),
    "evidence_urls" "jsonb" DEFAULT '[]'::"jsonb",
    "is_verified" boolean DEFAULT false NOT NULL,
    "verified_at" timestamp with time zone,
    "visibility" "public"."achievement_visibility" DEFAULT 'school_only'::"public"."achievement_visibility" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "student_achievements_date_awarded_check" CHECK (("date_awarded" <= CURRENT_DATE)),
    CONSTRAINT "student_achievements_points_awarded_check" CHECK (("points_awarded" >= 0))
);


ALTER TABLE "public"."student_achievements" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_achievements" IS 'Comprehensive record of all student achievements including academic awards, sports medals, cultural performances, and community service';



COMMENT ON COLUMN "public"."student_achievements"."points_awarded" IS 'Points calculated based on achievement_point_rules configuration';



COMMENT ON COLUMN "public"."student_achievements"."evidence_urls" IS 'JSON array of URLs to supporting documents (photos, certificates, news articles)';



CREATE SEQUENCE IF NOT EXISTS "public"."student_achievements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."student_achievements_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."student_achievements_id_seq" OWNED BY "public"."student_achievements"."id";



CREATE TABLE IF NOT EXISTS "public"."student_contacts" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "profile_user_id" "uuid",
    "name" character varying(256) NOT NULL,
    "phone" character varying(32) NOT NULL,
    "email" character varying(256),
    "relationship_type" character varying(64) NOT NULL,
    "is_emergency_contact" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "custody_notes" "text"
);


ALTER TABLE "public"."student_contacts" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_contacts" IS 'Stores multiple contacts (parents, guardians, emergency) for each student.';



CREATE SEQUENCE IF NOT EXISTS "public"."student_contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."student_contacts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."student_contacts_id_seq" OWNED BY "public"."student_contacts"."id";



CREATE TABLE IF NOT EXISTS "public"."student_fee_assignments" (
    "id" bigint NOT NULL,
    "student_id" integer NOT NULL,
    "fee_component_id" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."student_fee_assignments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_fee_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_fee_assignments" IS 'Handles exceptions to class-level fee structures. Records here indicate a student''s fee plan deviates from their class default (e.g., opting out of a bus fee).';



COMMENT ON COLUMN "public"."student_fee_assignments"."is_active" IS 'If ''false'', this student is exempt from this fee component, even if it''s part of their assigned class fee template.';



CREATE SEQUENCE IF NOT EXISTS "public"."student_fee_assignments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."student_fee_assignments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."student_fee_assignments_id_seq" OWNED BY "public"."student_fee_assignments"."id";



CREATE TABLE IF NOT EXISTS "public"."student_fee_discounts" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "discount_id" integer NOT NULL,
    "fee_term_id" integer,
    "amount" numeric(10,2),
    "valid_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valid_until" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "applied_by_user_id" "uuid" NOT NULL,
    "reason" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_student_discount_custom_value" CHECK ((("amount" IS NULL) OR ("amount" > (0)::numeric))),
    CONSTRAINT "chk_student_discount_validity" CHECK ((("valid_until" IS NULL) OR ("valid_until" >= "valid_from"))),
    CONSTRAINT "student_fee_discounts_custom_value_check" CHECK (("amount" > (0)::numeric))
);

ALTER TABLE ONLY "public"."student_fee_discounts" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_fee_discounts" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_fee_discounts" IS 'Junction table linking students to applicable discount templates. Enables many-to-many relationship between students and discounts.';



COMMENT ON COLUMN "public"."student_fee_discounts"."fee_term_id" IS 'Optional: Links discount to specific fee term. NULL means discount applies to all terms.';



COMMENT ON COLUMN "public"."student_fee_discounts"."amount" IS 'Optional override for discount value specific to this student. If NULL, uses value from discounts table.';



COMMENT ON COLUMN "public"."student_fee_discounts"."valid_from" IS 'Start date for discount validity. Default is current date.';



COMMENT ON COLUMN "public"."student_fee_discounts"."valid_until" IS 'End date for discount validity. NULL means no expiration.';



CREATE SEQUENCE IF NOT EXISTS "public"."student_fee_discounts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."student_fee_discounts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."student_fee_discounts_id_seq" OWNED BY "public"."student_fee_discounts"."id";



CREATE TABLE IF NOT EXISTS "public"."student_transport_assignments" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "route_id" integer NOT NULL,
    "stop_id" integer NOT NULL,
    "academic_year_id" integer NOT NULL,
    "active_from" "date" DEFAULT "now"(),
    "active_to" "date"
);


ALTER TABLE "public"."student_transport_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."student_transport_assignments" IS 'Links a student to the transport service for a specific academic year.';



CREATE SEQUENCE IF NOT EXISTS "public"."student_transport_assignments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."student_transport_assignments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."student_transport_assignments_id_seq" OWNED BY "public"."student_transport_assignments"."id";



CREATE TABLE IF NOT EXISTS "public"."students" (
    "student_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "current_class_id" integer,
    "proctor_teacher_id" integer,
    "roll_number" character varying(50),
    "enrollment_date" "date",
    "academic_status" character varying(50) DEFAULT 'Active'::character varying,
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."students_student_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."students_student_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."students_student_id_seq" OWNED BY "public"."students"."student_id";



CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "subject_id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "short_code" character varying(50),
    "description" "text",
    "category" character varying(100),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subjects_subject_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."subjects_subject_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subjects_subject_id_seq" OWNED BY "public"."subjects"."subject_id";



CREATE TABLE IF NOT EXISTS "public"."teacher_subjects" (
    "id" integer NOT NULL,
    "teacher_id" integer NOT NULL,
    "subject_id" integer NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "proficiency_level" "public"."proficiency_level" DEFAULT 'intermediate'::"public"."proficiency_level" NOT NULL,
    "years_teaching_subject" integer DEFAULT 0,
    "certification_number" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "teacher_subjects_years_teaching_subject_check" CHECK (("years_teaching_subject" >= 0))
);


ALTER TABLE "public"."teacher_subjects" OWNER TO "postgres";


COMMENT ON TABLE "public"."teacher_subjects" IS 'Many-to-many relationship tracking which subjects each teacher can teach, with proficiency levels for intelligent timetable generation';



COMMENT ON COLUMN "public"."teacher_subjects"."is_primary" IS 'Indicates if this is the teacher''s primary subject expertise';



COMMENT ON COLUMN "public"."teacher_subjects"."proficiency_level" IS 'Teacher''s expertise level: expert (10+ years), intermediate (3-10 years), basic (<3 years)';



CREATE SEQUENCE IF NOT EXISTS "public"."teacher_subjects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."teacher_subjects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."teacher_subjects_id_seq" OWNED BY "public"."teacher_subjects"."id";



CREATE TABLE IF NOT EXISTS "public"."teachers" (
    "teacher_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "department" character varying(255),
    "subject_specialization" character varying(255),
    "hire_date" "date",
    "employment_status_id" integer,
    "years_of_experience" integer,
    "is_certified" boolean DEFAULT false,
    "bio" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "school_id" integer DEFAULT 1 NOT NULL,
    "qualifications" "jsonb"
);


ALTER TABLE "public"."teachers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."teachers"."qualifications" IS 'Stores educational qualifications as a JSON array, e.g., [{"degree": "M.Sc.", "field": "Physics"}, {"degree": "B.Ed."}]'';';



CREATE SEQUENCE IF NOT EXISTS "public"."teachers_teacher_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."teachers_teacher_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."teachers_teacher_id_seq" OWNED BY "public"."teachers"."teacher_id";



CREATE TABLE IF NOT EXISTS "public"."timetable" (
    "id" integer NOT NULL,
    "class_id" integer,
    "subject_id" integer,
    "teacher_id" integer,
    "period_id" integer,
    "day_of_week" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "academic_year_id" integer,
    "school_id" integer DEFAULT 1 NOT NULL,
    "last_modified_by" "uuid",
    "is_editable" boolean DEFAULT true NOT NULL,
    "last_modified_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."timetable" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."timetable_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."timetable_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."timetable_id_seq" OWNED BY "public"."timetable"."id";



CREATE TABLE IF NOT EXISTS "public"."transfer_certificates" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "issued_by" "uuid",
    "issue_date" "date" NOT NULL,
    "reason" "text",
    "tc_document_url" character varying(255),
    "metadata" "jsonb"
);


ALTER TABLE "public"."transfer_certificates" OWNER TO "postgres";


COMMENT ON TABLE "public"."transfer_certificates" IS 'Stores details of issued Transfer Certificates (TCs).';



CREATE SEQUENCE IF NOT EXISTS "public"."transfer_certificates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."transfer_certificates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transfer_certificates_id_seq" OWNED BY "public"."transfer_certificates"."id";



CREATE TABLE IF NOT EXISTS "public"."transport_routes" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "name" character varying(128) NOT NULL,
    "vehicle_id" integer,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."transport_routes" OWNER TO "postgres";


COMMENT ON TABLE "public"."transport_routes" IS 'Defines a named route, like "Jayanagar Route A".';



CREATE SEQUENCE IF NOT EXISTS "public"."transport_routes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."transport_routes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transport_routes_id_seq" OWNED BY "public"."transport_routes"."id";



CREATE TABLE IF NOT EXISTS "public"."transport_stops" (
    "id" integer NOT NULL,
    "route_id" integer NOT NULL,
    "name" character varying(128) NOT NULL,
    "stop_order" integer,
    "pickup_time" time without time zone,
    "drop_time" time without time zone,
    "lat" numeric(9,6),
    "lon" numeric(9,6),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."transport_stops" OWNER TO "postgres";


COMMENT ON TABLE "public"."transport_stops" IS 'Defines the individual stops that make up a transport route.';



CREATE SEQUENCE IF NOT EXISTS "public"."transport_stops_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."transport_stops_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transport_stops_id_seq" OWNED BY "public"."transport_stops"."id";



CREATE TABLE IF NOT EXISTS "public"."transport_vehicles" (
    "id" integer NOT NULL,
    "school_id" integer NOT NULL,
    "registration_number" character varying(64) NOT NULL,
    "vehicle_model" character varying(128),
    "capacity" integer,
    "driver_profile_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."transport_vehicles" OWNER TO "postgres";


COMMENT ON TABLE "public"."transport_vehicles" IS 'Stores information about each vehicle in the school''s fleet.';



CREATE SEQUENCE IF NOT EXISTS "public"."transport_vehicles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."transport_vehicles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transport_vehicles_id_seq" OWNED BY "public"."transport_vehicles"."id";



CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "user_id" "uuid" NOT NULL,
    "preferences" "jsonb"
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role_id" integer NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_positions" (
    "id" bigint NOT NULL,
    "vehicle_id" integer NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "lat" numeric(9,6),
    "lon" numeric(9,6),
    "speed" numeric(5,2),
    "raw_payload" "jsonb"
);


ALTER TABLE "public"."vehicle_positions" OWNER TO "postgres";


COMMENT ON TABLE "public"."vehicle_positions" IS 'Optimized for fast writes of high-volume GPS location data.';



CREATE SEQUENCE IF NOT EXISTS "public"."vehicle_positions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vehicle_positions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vehicle_positions_id_seq" OWNED BY "public"."vehicle_positions"."id";



CREATE TABLE IF NOT EXISTS "storage"."buckets" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "public" boolean DEFAULT false,
    "avif_autodetection" boolean DEFAULT false,
    "file_size_limit" bigint,
    "allowed_mime_types" "text"[],
    "owner_id" "text",
    "type" "storage"."buckettype" DEFAULT 'STANDARD'::"storage"."buckettype" NOT NULL
);


ALTER TABLE "storage"."buckets" OWNER TO "supabase_storage_admin";


COMMENT ON COLUMN "storage"."buckets"."owner" IS 'Field is deprecated, use owner_id instead';



CREATE TABLE IF NOT EXISTS "storage"."buckets_analytics" (
    "id" "text" NOT NULL,
    "type" "storage"."buckettype" DEFAULT 'ANALYTICS'::"storage"."buckettype" NOT NULL,
    "format" "text" DEFAULT 'ICEBERG'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "storage"."buckets_analytics" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."migrations" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "hash" character varying(40) NOT NULL,
    "executed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "storage"."migrations" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."objects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bucket_id" "text",
    "name" "text",
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    "path_tokens" "text"[] GENERATED ALWAYS AS ("string_to_array"("name", '/'::"text")) STORED,
    "version" "text",
    "owner_id" "text",
    "user_metadata" "jsonb",
    "level" integer
);


ALTER TABLE "storage"."objects" OWNER TO "supabase_storage_admin";


COMMENT ON COLUMN "storage"."objects"."owner" IS 'Field is deprecated, use owner_id instead';



CREATE TABLE IF NOT EXISTS "storage"."prefixes" (
    "bucket_id" "text" NOT NULL,
    "name" "text" NOT NULL COLLATE "pg_catalog"."C",
    "level" integer GENERATED ALWAYS AS ("storage"."get_level"("name")) STORED NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "storage"."prefixes" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."s3_multipart_uploads" (
    "id" "text" NOT NULL,
    "in_progress_size" bigint DEFAULT 0 NOT NULL,
    "upload_signature" "text" NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "version" "text" NOT NULL,
    "owner_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_metadata" "jsonb"
);


ALTER TABLE "storage"."s3_multipart_uploads" OWNER TO "supabase_storage_admin";


CREATE TABLE IF NOT EXISTS "storage"."s3_multipart_uploads_parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "upload_id" "text" NOT NULL,
    "size" bigint DEFAULT 0 NOT NULL,
    "part_number" integer NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "etag" "text" NOT NULL,
    "owner_id" "text",
    "version" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "storage"."s3_multipart_uploads_parts" OWNER TO "supabase_storage_admin";


ALTER TABLE ONLY "auth"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"auth"."refresh_tokens_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."academic_years" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."academic_years_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."achievement_point_rules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."achievement_point_rules_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."album_targets" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."album_targets_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."albums" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."albums_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."announcement_targets" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."announcement_targets_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."announcements" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."announcements_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."applied_discounts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."applied_discounts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."attendance_records" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."attendance_records_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."audits" ALTER COLUMN "audit_id" SET DEFAULT "nextval"('"public"."audits_audit_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cart_items" ALTER COLUMN "cart_item_id" SET DEFAULT "nextval"('"public"."cart_items_cart_item_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."carts" ALTER COLUMN "cart_id" SET DEFAULT "nextval"('"public"."carts_cart_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."class_fee_structure" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."class_fee_structure_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."class_subjects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."class_subjects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."classes" ALTER COLUMN "class_id" SET DEFAULT "nextval"('"public"."classes_class_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."club_activities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."club_activities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."club_memberships" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."club_memberships_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."clubs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."clubs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."conversations" ALTER COLUMN "conversation_id" SET DEFAULT "nextval"('"public"."conversations_conversation_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."discounts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."discounts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."employment_statuses" ALTER COLUMN "status_id" SET DEFAULT "nextval"('"public"."employment_statuses_status_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."event_rsvps" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."event_rsvps_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."exam_types" ALTER COLUMN "exam_type_id" SET DEFAULT "nextval"('"public"."exam_types_exam_type_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."exams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."exams_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fee_components" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fee_components_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fee_template_components" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fee_template_components_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fee_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fee_structure_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."fee_terms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."fee_terms_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."form_submissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."form_submissions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."forms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."forms_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."gateway_webhook_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."gateway_webhook_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."invoice_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invoice_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."invoices" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invoices_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."logs" ALTER COLUMN "log_id" SET DEFAULT "nextval"('"public"."logs_log_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."marks" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."marks_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."media_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."media_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."messages" ALTER COLUMN "message_id" SET DEFAULT "nextval"('"public"."messages_message_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."order_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."order_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."orders" ALTER COLUMN "order_id" SET DEFAULT "nextval"('"public"."orders_order_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payment_allocations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payment_allocations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."periods" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."periods_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_album_links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_album_links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_categories" ALTER COLUMN "category_id" SET DEFAULT "nextval"('"public"."product_categories_category_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_package_rules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_package_rules_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_packages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_packages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."products" ALTER COLUMN "product_id" SET DEFAULT "nextval"('"public"."products_product_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."refunds" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."refunds_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."roles_definition" ALTER COLUMN "role_id" SET DEFAULT "nextval"('"public"."roles_definition_role_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rte_reservations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rte_reservations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."schools" ALTER COLUMN "school_id" SET DEFAULT "nextval"('"public"."schools_school_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."streams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."streams_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."student_achievements" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."student_achievements_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."student_contacts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."student_contacts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."student_fee_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."student_fee_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."student_fee_discounts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."student_fee_discounts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."student_transport_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."student_transport_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."students" ALTER COLUMN "student_id" SET DEFAULT "nextval"('"public"."students_student_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subjects" ALTER COLUMN "subject_id" SET DEFAULT "nextval"('"public"."subjects_subject_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."teacher_subjects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."teacher_subjects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."teachers" ALTER COLUMN "teacher_id" SET DEFAULT "nextval"('"public"."teachers_teacher_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."timetable" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."timetable_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."transfer_certificates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."transfer_certificates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."transport_routes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."transport_routes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."transport_stops" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."transport_stops_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."transport_vehicles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."transport_vehicles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vehicle_positions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vehicle_positions_id_seq"'::"regclass");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."audit_log_entries"
    ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."flow_state"
    ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");



ALTER TABLE ONLY "auth"."instances"
    ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_authorization_code_key" UNIQUE ("authorization_code");



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_authorization_id_key" UNIQUE ("authorization_id");



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_user_client_unique" UNIQUE ("user_id", "client_id");



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academic_years"
    ADD CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."academic_years"
    ADD CONSTRAINT "academic_years_school_id_name_key" UNIQUE ("school_id", "name");



ALTER TABLE ONLY "public"."achievement_point_rules"
    ADD CONSTRAINT "achievement_point_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."album_targets"
    ADD CONSTRAINT "album_targets_album_id_target_type_target_id_key" UNIQUE ("album_id", "target_type", "target_id");



ALTER TABLE ONLY "public"."album_targets"
    ADD CONSTRAINT "album_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcement_targets"
    ADD CONSTRAINT "announcement_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applied_discounts"
    ADD CONSTRAINT "applied_discounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audits"
    ADD CONSTRAINT "audits_pkey" PRIMARY KEY ("audit_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("cart_item_id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("cart_id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."class_fee_structure"
    ADD CONSTRAINT "class_fee_structure_class_id_component_id_academic_year_id_key" UNIQUE ("class_id", "component_id", "academic_year_id");



ALTER TABLE ONLY "public"."class_fee_structure"
    ADD CONSTRAINT "class_fee_structure_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."class_subjects"
    ADD CONSTRAINT "class_subjects_class_id_subject_id_key" UNIQUE ("class_id", "subject_id");



ALTER TABLE ONLY "public"."class_subjects"
    ADD CONSTRAINT "class_subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("class_id");



ALTER TABLE ONLY "public"."club_activities"
    ADD CONSTRAINT "club_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."club_memberships"
    ADD CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id");



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employment_statuses"
    ADD CONSTRAINT "employment_statuses_pkey" PRIMARY KEY ("status_id");



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_event_id_user_id_key" UNIQUE ("event_id", "user_id");



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_types"
    ADD CONSTRAINT "exam_types_pkey" PRIMARY KEY ("exam_type_id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_components"
    ADD CONSTRAINT "fee_components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_templates"
    ADD CONSTRAINT "fee_structure_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_template_components"
    ADD CONSTRAINT "fee_template_components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_terms"
    ADD CONSTRAINT "fee_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gateway_webhook_events"
    ADD CONSTRAINT "gateway_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."logs"
    ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("log_id");



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_items"
    ADD CONSTRAINT "media_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id");



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_pkey" PRIMARY KEY ("package_id", "product_id");



ALTER TABLE ONLY "public"."payment_allocations"
    ADD CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_gateway_payment_id_key" UNIQUE ("gateway_payment_id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."periods"
    ADD CONSTRAINT "periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_album_links"
    ADD CONSTRAINT "product_album_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_album_links"
    ADD CONSTRAINT "product_album_links_product_id_display_order_key" UNIQUE ("product_id", "display_order");



ALTER TABLE ONLY "public"."product_album_links"
    ADD CONSTRAINT "product_album_links_storage_path_key" UNIQUE ("storage_path");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("category_id");



ALTER TABLE ONLY "public"."product_package_rules"
    ADD CONSTRAINT "product_package_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_packages"
    ADD CONSTRAINT "product_packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("product_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_gateway_refund_id_key" UNIQUE ("gateway_refund_id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles_definition"
    ADD CONSTRAINT "roles_definition_pkey" PRIMARY KEY ("role_id");



ALTER TABLE ONLY "public"."roles_definition"
    ADD CONSTRAINT "roles_definition_role_name_key" UNIQUE ("role_name");



ALTER TABLE ONLY "public"."rte_reservations"
    ADD CONSTRAINT "rte_reservations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rte_reservations"
    ADD CONSTRAINT "rte_reservations_student_id_academic_year_id_key" UNIQUE ("student_id", "academic_year_id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("school_id");



ALTER TABLE ONLY "public"."stream_subjects"
    ADD CONSTRAINT "stream_subjects_pkey" PRIMARY KEY ("stream_id", "subject_id");



ALTER TABLE ONLY "public"."streams"
    ADD CONSTRAINT "streams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_contacts"
    ADD CONSTRAINT "student_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_fee_assignments"
    ADD CONSTRAINT "student_fee_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_fee_discounts"
    ADD CONSTRAINT "student_fee_discounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_transport_assignments"
    ADD CONSTRAINT "student_transport_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_transport_assignments"
    ADD CONSTRAINT "student_transport_assignments_student_id_academic_year_id_key" UNIQUE ("student_id", "academic_year_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("student_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("subject_id");



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transfer_certificates"
    ADD CONSTRAINT "transfer_certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transfer_certificates"
    ADD CONSTRAINT "transfer_certificates_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."transport_routes"
    ADD CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transport_stops"
    ADD CONSTRAINT "transport_stops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transport_vehicles"
    ADD CONSTRAINT "transport_vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transport_vehicles"
    ADD CONSTRAINT "transport_vehicles_registration_number_key" UNIQUE ("registration_number");



ALTER TABLE ONLY "public"."achievement_point_rules"
    ADD CONSTRAINT "unique_achievement_rule_per_school" UNIQUE ("school_id", "achievement_type", "category_name");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "unique_invoice_fee_component" UNIQUE ("invoice_id", "fee_component_id");



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "unique_student_exam_subject_mark" UNIQUE ("student_id", "exam_id", "subject_id");



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "unique_teacher_subject" UNIQUE ("teacher_id", "subject_id");



ALTER TABLE ONLY "public"."fee_template_components"
    ADD CONSTRAINT "unique_template_component" UNIQUE ("fee_template_id", "fee_component_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");



ALTER TABLE ONLY "public"."vehicle_positions"
    ADD CONSTRAINT "vehicle_positions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."buckets_analytics"
    ADD CONSTRAINT "buckets_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."buckets"
    ADD CONSTRAINT "buckets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."prefixes"
    ADD CONSTRAINT "prefixes_pkey" PRIMARY KEY ("bucket_id", "level", "name");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");



CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token") WHERE (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current") WHERE (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new") WHERE (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");



CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);



CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");



COMMENT ON INDEX "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';



CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");



CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");



CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");



CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id") WHERE (TRIM(BOTH FROM "friendly_name") <> ''::"text");



CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");



CREATE INDEX "oauth_auth_pending_exp_idx" ON "auth"."oauth_authorizations" USING "btree" ("expires_at") WHERE ("status" = 'pending'::"auth"."oauth_authorization_status");



CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" USING "btree" ("deleted_at");



CREATE INDEX "oauth_consents_active_client_idx" ON "auth"."oauth_consents" USING "btree" ("client_id") WHERE ("revoked_at" IS NULL);



CREATE INDEX "oauth_consents_active_user_client_idx" ON "auth"."oauth_consents" USING "btree" ("user_id", "client_id") WHERE ("revoked_at" IS NULL);



CREATE INDEX "oauth_consents_user_order_idx" ON "auth"."oauth_consents" USING "btree" ("user_id", "granted_at" DESC);



CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");



CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");



CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");



CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token") WHERE (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token") WHERE (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");



CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");



CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");



CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");



CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);



CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");



CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);



CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");



CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");



CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);



CREATE INDEX "sessions_oauth_client_id_idx" ON "auth"."sessions" USING "btree" ("oauth_client_id");



CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower"("domain"));



CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");



CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower"("resource_id"));



CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING "btree" ("resource_id" "text_pattern_ops");



CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");



CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");



CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email") WHERE ("is_sso_user" = false);



COMMENT ON INDEX "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';



CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower"(("email")::"text"));



CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");



CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");



CREATE UNIQUE INDEX "gateway_webhook_events_event_id_idx" ON "public"."gateway_webhook_events" USING "btree" ("event_id");



CREATE INDEX "idx_achievement_rules_active" ON "public"."achievement_point_rules" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_achievement_rules_school" ON "public"."achievement_point_rules" USING "btree" ("school_id");



CREATE INDEX "idx_achievement_rules_type" ON "public"."achievement_point_rules" USING "btree" ("achievement_type");



CREATE INDEX "idx_achievements_date" ON "public"."student_achievements" USING "btree" ("date_awarded" DESC);



CREATE INDEX "idx_achievements_leaderboard" ON "public"."student_achievements" USING "btree" ("school_id", "academic_year_id", "points_awarded" DESC);



CREATE INDEX "idx_achievements_school" ON "public"."student_achievements" USING "btree" ("school_id");



CREATE INDEX "idx_achievements_school_year" ON "public"."student_achievements" USING "btree" ("school_id", "academic_year_id");



CREATE INDEX "idx_achievements_student" ON "public"."student_achievements" USING "btree" ("student_id");



CREATE INDEX "idx_achievements_type" ON "public"."student_achievements" USING "btree" ("achievement_type");



CREATE INDEX "idx_achievements_verified" ON "public"."student_achievements" USING "btree" ("is_verified") WHERE ("is_verified" = true);



CREATE INDEX "idx_achievements_visibility" ON "public"."student_achievements" USING "btree" ("visibility");



CREATE INDEX "idx_album_targets_composite" ON "public"."album_targets" USING "btree" ("album_id", "target_type", "target_id");



CREATE INDEX "idx_announcement_targets_announcement_id" ON "public"."announcement_targets" USING "btree" ("announcement_id");



CREATE INDEX "idx_applied_discounts_discount_id" ON "public"."applied_discounts" USING "btree" ("discount_id");



CREATE INDEX "idx_applied_discounts_invoice_id" ON "public"."applied_discounts" USING "btree" ("invoice_id");



CREATE INDEX "idx_attendance_records_student_id" ON "public"."attendance_records" USING "btree" ("student_id");



CREATE INDEX "idx_attendance_student_date" ON "public"."attendance_records" USING "btree" ("student_id", "date");



CREATE INDEX "idx_classes_class_teacher_id" ON "public"."classes" USING "btree" ("class_teacher_id");



CREATE INDEX "idx_club_active_members" ON "public"."club_memberships" USING "btree" ("club_id", "status") WHERE ("status" = 'active'::"public"."club_membership_status");



CREATE INDEX "idx_club_activities_club" ON "public"."club_activities" USING "btree" ("club_id");



CREATE INDEX "idx_club_activities_date" ON "public"."club_activities" USING "btree" ("scheduled_date" DESC);



CREATE INDEX "idx_club_activities_organizer" ON "public"."club_activities" USING "btree" ("student_id") WHERE ("student_id" IS NOT NULL);



CREATE INDEX "idx_club_activities_status" ON "public"."club_activities" USING "btree" ("status");



CREATE INDEX "idx_club_activities_type" ON "public"."club_activities" USING "btree" ("activity_type");



CREATE INDEX "idx_club_membership_club" ON "public"."club_memberships" USING "btree" ("club_id");



CREATE INDEX "idx_club_membership_role" ON "public"."club_memberships" USING "btree" ("role");



CREATE INDEX "idx_club_membership_status" ON "public"."club_memberships" USING "btree" ("status");



CREATE INDEX "idx_club_membership_student" ON "public"."club_memberships" USING "btree" ("student_id");



CREATE INDEX "idx_club_upcoming_activities" ON "public"."club_activities" USING "btree" ("club_id", "scheduled_date", "status") WHERE ("status" = ANY (ARRAY['planned'::"public"."club_activity_status", 'ongoing'::"public"."club_activity_status"]));



CREATE INDEX "idx_clubs_academic_year" ON "public"."clubs" USING "btree" ("academic_year_id");



CREATE INDEX "idx_clubs_active" ON "public"."clubs" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_clubs_active_type" ON "public"."clubs" USING "btree" ("school_id", "club_type", "is_active");



CREATE INDEX "idx_clubs_registration_open" ON "public"."clubs" USING "btree" ("registration_open") WHERE ("registration_open" = true);



CREATE INDEX "idx_clubs_school" ON "public"."clubs" USING "btree" ("school_id");



CREATE INDEX "idx_clubs_teacher" ON "public"."clubs" USING "btree" ("teacher_in_charge_id");



CREATE INDEX "idx_clubs_type" ON "public"."clubs" USING "btree" ("club_type");



CREATE INDEX "idx_discounts_active" ON "public"."discounts" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_discounts_school_id" ON "public"."discounts" USING "btree" ("school_id");



CREATE UNIQUE INDEX "idx_discounts_school_name" ON "public"."discounts" USING "btree" ("school_id", "name") WHERE ("is_active" = true);



CREATE INDEX "idx_fee_terms_fee_template_id" ON "public"."fee_terms" USING "btree" ("fee_template_id");



CREATE INDEX "idx_ftc_fee_component_id" ON "public"."fee_template_components" USING "btree" ("fee_component_id");



CREATE INDEX "idx_ftc_fee_template_id" ON "public"."fee_template_components" USING "btree" ("fee_template_id");



CREATE INDEX "idx_invoice_items_fee_component_id" ON "public"."invoice_items" USING "btree" ("fee_component_id");



CREATE INDEX "idx_invoice_items_invoice_id" ON "public"."invoice_items" USING "btree" ("invoice_id");



CREATE INDEX "idx_invoice_items_school_id" ON "public"."invoice_items" USING "btree" ("school_id");



CREATE INDEX "idx_invoices_payment_status" ON "public"."invoices" USING "btree" ("payment_status");



CREATE INDEX "idx_invoices_status" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "idx_invoices_student_id" ON "public"."invoices" USING "btree" ("student_id");



CREATE INDEX "idx_marks_exam_id" ON "public"."marks" USING "btree" ("exam_id");



CREATE INDEX "idx_marks_student_exam" ON "public"."marks" USING "btree" ("student_id", "exam_id");



CREATE INDEX "idx_marks_student_id" ON "public"."marks" USING "btree" ("student_id");



CREATE INDEX "idx_messages_conversation_sent" ON "public"."messages" USING "btree" ("conversation_id", "sent_at");



CREATE INDEX "idx_orders_parent_user_id" ON "public"."orders" USING "btree" ("parent_user_id");



CREATE INDEX "idx_orders_school_id" ON "public"."orders" USING "btree" ("school_id");



CREATE INDEX "idx_payment_allocations_payment_id" ON "public"."payment_allocations" USING "btree" ("payment_id");



CREATE INDEX "idx_payments_gateway_order_id" ON "public"."payments" USING "btree" ("gateway_order_id");



CREATE INDEX "idx_payments_gateway_payment_id" ON "public"."payments" USING "btree" ("gateway_payment_id");



CREATE INDEX "idx_payments_invoice_id" ON "public"."payments" USING "btree" ("invoice_id");



CREATE INDEX "idx_payments_order_id" ON "public"."payments" USING "btree" ("order_id");



CREATE INDEX "idx_payments_reconciliation_status" ON "public"."payments" USING "btree" ("reconciliation_status");



CREATE INDEX "idx_payments_school_id" ON "public"."payments" USING "btree" ("school_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_payments_student_id" ON "public"."payments" USING "btree" ("student_id");



CREATE INDEX "idx_product_album_links_product_id" ON "public"."product_album_links" USING "btree" ("product_id");



CREATE INDEX "idx_products_school_category" ON "public"."products" USING "btree" ("school_id", "category_id");



CREATE INDEX "idx_refunds_payment_id" ON "public"."refunds" USING "btree" ("payment_id");



CREATE INDEX "idx_student_contacts_profile_user_id" ON "public"."student_contacts" USING "btree" ("profile_user_id");



CREATE INDEX "idx_student_contacts_student_id" ON "public"."student_contacts" USING "btree" ("student_id");



CREATE INDEX "idx_student_contacts_user_student" ON "public"."student_contacts" USING "btree" ("profile_user_id", "student_id");



CREATE UNIQUE INDEX "idx_student_fee_assignments_student_component_unique" ON "public"."student_fee_assignments" USING "btree" ("student_id", "fee_component_id");



CREATE INDEX "idx_student_fee_assignments_student_id" ON "public"."student_fee_assignments" USING "btree" ("student_id");



CREATE INDEX "idx_student_fee_discounts_active" ON "public"."student_fee_discounts" USING "btree" ("is_active", "valid_from", "valid_until");



CREATE INDEX "idx_student_fee_discounts_applied_by" ON "public"."student_fee_discounts" USING "btree" ("applied_by_user_id");



CREATE INDEX "idx_student_fee_discounts_discount_id" ON "public"."student_fee_discounts" USING "btree" ("discount_id");



CREATE INDEX "idx_student_fee_discounts_student_id" ON "public"."student_fee_discounts" USING "btree" ("student_id") WHERE ("is_active" = true);



CREATE UNIQUE INDEX "idx_student_fee_discounts_unique" ON "public"."student_fee_discounts" USING "btree" ("student_id", "discount_id", "fee_term_id") WHERE ("is_active" = true);



CREATE INDEX "idx_student_transport_assignments_student_id" ON "public"."student_transport_assignments" USING "btree" ("student_id");



CREATE INDEX "idx_students_current_class_id" ON "public"."students" USING "btree" ("current_class_id");



CREATE INDEX "idx_teacher_subjects_primary" ON "public"."teacher_subjects" USING "btree" ("teacher_id", "is_primary") WHERE ("is_primary" = true);



CREATE INDEX "idx_teacher_subjects_proficiency" ON "public"."teacher_subjects" USING "btree" ("proficiency_level");



CREATE INDEX "idx_teacher_subjects_subject" ON "public"."teacher_subjects" USING "btree" ("subject_id");



CREATE INDEX "idx_teacher_subjects_teacher" ON "public"."teacher_subjects" USING "btree" ("teacher_id");



CREATE INDEX "idx_timetable_class_day" ON "public"."timetable" USING "btree" ("class_id", "day_of_week");



CREATE INDEX "idx_timetable_teacher_day" ON "public"."timetable" USING "btree" ("teacher_id", "day_of_week");



CREATE UNIQUE INDEX "idx_unique_active_club_membership" ON "public"."club_memberships" USING "btree" ("club_id", "student_id") WHERE ("status" = 'active'::"public"."club_membership_status");



CREATE INDEX "idx_vehicle_positions_vehicle_time" ON "public"."vehicle_positions" USING "btree" ("vehicle_id", "recorded_at" DESC);



CREATE UNIQUE INDEX "bname" ON "storage"."buckets" USING "btree" ("name");



CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" USING "btree" ("bucket_id", "name");



CREATE INDEX "idx_multipart_uploads_list" ON "storage"."s3_multipart_uploads" USING "btree" ("bucket_id", "key", "created_at");



CREATE UNIQUE INDEX "idx_name_bucket_level_unique" ON "storage"."objects" USING "btree" ("name" COLLATE "C", "bucket_id", "level");



CREATE INDEX "idx_objects_bucket_id_name" ON "storage"."objects" USING "btree" ("bucket_id", "name" COLLATE "C");



CREATE INDEX "idx_objects_lower_name" ON "storage"."objects" USING "btree" (("path_tokens"["level"]), "lower"("name") "text_pattern_ops", "bucket_id", "level");



CREATE INDEX "idx_prefixes_lower_name" ON "storage"."prefixes" USING "btree" ("bucket_id", "level", (("string_to_array"("name", '/'::"text"))["level"]), "lower"("name") "text_pattern_ops");



CREATE INDEX "name_prefix_search" ON "storage"."objects" USING "btree" ("name" "text_pattern_ops");



CREATE UNIQUE INDEX "objects_bucket_id_level_idx" ON "storage"."objects" USING "btree" ("bucket_id", "level", "name" COLLATE "C");



CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



CREATE OR REPLACE TRIGGER "set_timestamp_achievements" BEFORE UPDATE ON "public"."student_achievements" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_club_activities" BEFORE UPDATE ON "public"."club_activities" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_club_memberships" BEFORE UPDATE ON "public"."club_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_clubs" BEFORE UPDATE ON "public"."clubs" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp_teacher_subjects" BEFORE UPDATE ON "public"."teacher_subjects" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_discounts_updated_at" BEFORE UPDATE ON "public"."discounts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_invoice_items_updated_at" BEFORE UPDATE ON "public"."invoice_items" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_payment_allocations_updated_at" BEFORE UPDATE ON "public"."payment_allocations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_refunds_updated_at" BEFORE UPDATE ON "public"."refunds" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_student_fee_assignments_updated_at" BEFORE UPDATE ON "public"."student_fee_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_student_fee_discounts_updated_at" BEFORE UPDATE ON "public"."student_fee_discounts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_update_club_member_count" AFTER INSERT OR DELETE OR UPDATE OF "status" ON "public"."club_memberships" FOR EACH ROW EXECUTE FUNCTION "test"."update_club_member_count"();



CREATE OR REPLACE TRIGGER "update_product_categories_updated_at" BEFORE UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "test"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "enforce_bucket_name_length_trigger" BEFORE INSERT OR UPDATE OF "name" ON "storage"."buckets" FOR EACH ROW EXECUTE FUNCTION "storage"."enforce_bucket_name_length"();



CREATE OR REPLACE TRIGGER "objects_delete_delete_prefix" AFTER DELETE ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."delete_prefix_hierarchy_trigger"();



CREATE OR REPLACE TRIGGER "objects_insert_create_prefix" BEFORE INSERT ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."objects_insert_prefix_trigger"();



CREATE OR REPLACE TRIGGER "objects_update_create_prefix" BEFORE UPDATE ON "storage"."objects" FOR EACH ROW WHEN ((("new"."name" <> "old"."name") OR ("new"."bucket_id" <> "old"."bucket_id"))) EXECUTE FUNCTION "storage"."objects_update_prefix_trigger"();



CREATE OR REPLACE TRIGGER "prefixes_create_hierarchy" BEFORE INSERT ON "storage"."prefixes" FOR EACH ROW WHEN (("pg_trigger_depth"() < 1)) EXECUTE FUNCTION "storage"."prefixes_insert_trigger"();



CREATE OR REPLACE TRIGGER "prefixes_delete_hierarchy" AFTER DELETE ON "storage"."prefixes" FOR EACH ROW EXECUTE FUNCTION "storage"."delete_prefix_hierarchy_trigger"();



CREATE OR REPLACE TRIGGER "update_objects_updated_at" BEFORE UPDATE ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."update_updated_at_column"();



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_oauth_client_id_fkey" FOREIGN KEY ("oauth_client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."academic_years"
    ADD CONSTRAINT "academic_years_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."achievement_point_rules"
    ADD CONSTRAINT "achievement_point_rules_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."album_targets"
    ADD CONSTRAINT "album_targets_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."announcement_targets"
    ADD CONSTRAINT "announcement_targets_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."applied_discounts"
    ADD CONSTRAINT "applied_discounts_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."applied_discounts"
    ADD CONSTRAINT "applied_discounts_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("class_id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("teacher_id");



ALTER TABLE ONLY "public"."audits"
    ADD CONSTRAINT "audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("cart_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_fee_structure"
    ADD CONSTRAINT "class_fee_structure_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."class_fee_structure"
    ADD CONSTRAINT "class_fee_structure_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("class_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_fee_structure"
    ADD CONSTRAINT "class_fee_structure_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "public"."fee_components"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_subjects"
    ADD CONSTRAINT "class_subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("class_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_subjects"
    ADD CONSTRAINT "class_subjects_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id");



ALTER TABLE ONLY "public"."class_subjects"
    ADD CONSTRAINT "class_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."club_activities"
    ADD CONSTRAINT "club_activities_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."club_activities"
    ADD CONSTRAINT "club_activities_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."club_memberships"
    ADD CONSTRAINT "club_memberships_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."club_memberships"
    ADD CONSTRAINT "club_memberships_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."club_memberships"
    ADD CONSTRAINT "club_memberships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_assistant_teacher_id_fkey" FOREIGN KEY ("assistant_teacher_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_teacher_in_charge_id_fkey" FOREIGN KEY ("teacher_in_charge_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employment_statuses"
    ADD CONSTRAINT "employment_statuses_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."exam_types"
    ADD CONSTRAINT "exam_types_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_exam_type_id_fkey" FOREIGN KEY ("exam_type_id") REFERENCES "public"."exam_types"("exam_type_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."fee_components"
    ADD CONSTRAINT "fee_components_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fee_templates"
    ADD CONSTRAINT "fee_structure_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."fee_templates"
    ADD CONSTRAINT "fee_structure_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."fee_template_components"
    ADD CONSTRAINT "fee_template_components_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "public"."fee_components"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."fee_template_components"
    ADD CONSTRAINT "fee_template_components_fee_template_id_fkey" FOREIGN KEY ("fee_template_id") REFERENCES "public"."fee_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fee_terms"
    ADD CONSTRAINT "fee_terms_fee_template_id_fkey" FOREIGN KEY ("fee_template_id") REFERENCES "public"."fee_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_allocations"
    ADD CONSTRAINT "fk_payment_allocations_invoice_item" FOREIGN KEY ("invoice_item_id") REFERENCES "public"."invoice_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "public"."fee_components"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."fee_templates"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_fee_term_id_fkey" FOREIGN KEY ("fee_term_id") REFERENCES "public"."fee_terms"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id");



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marks"
    ADD CONSTRAINT "marks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."media_items"
    ADD CONSTRAINT "media_items_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id");



ALTER TABLE ONLY "public"."media_items"
    ADD CONSTRAINT "media_items_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."product_packages"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id");



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."product_packages"("id");



ALTER TABLE ONLY "public"."package_items"
    ADD CONSTRAINT "package_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id");



ALTER TABLE ONLY "public"."payment_allocations"
    ADD CONSTRAINT "payment_allocations_allocated_by_user_id_fkey" FOREIGN KEY ("allocated_by_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payment_allocations"
    ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."periods"
    ADD CONSTRAINT "periods_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."product_album_links"
    ADD CONSTRAINT "product_album_links_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_album_links"
    ADD CONSTRAINT "product_album_links_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."product_package_rules"
    ADD CONSTRAINT "product_package_rules_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."product_package_rules"
    ADD CONSTRAINT "product_package_rules_product_package_id_fkey" FOREIGN KEY ("product_package_id") REFERENCES "public"."product_packages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_package_rules"
    ADD CONSTRAINT "product_package_rules_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."product_packages"
    ADD CONSTRAINT "product_packages_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_processed_by_user_id_fkey" FOREIGN KEY ("processed_by_user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."rte_reservations"
    ADD CONSTRAINT "rte_reservations_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."rte_reservations"
    ADD CONSTRAINT "rte_reservations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."rte_reservations"
    ADD CONSTRAINT "rte_reservations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id");



ALTER TABLE ONLY "public"."stream_subjects"
    ADD CONSTRAINT "stream_subjects_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id");



ALTER TABLE ONLY "public"."stream_subjects"
    ADD CONSTRAINT "stream_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id");



ALTER TABLE ONLY "public"."streams"
    ADD CONSTRAINT "streams_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_awarded_by_user_id_fkey" FOREIGN KEY ("awarded_by_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."student_contacts"
    ADD CONSTRAINT "student_contacts_profile_user_id_fkey" FOREIGN KEY ("profile_user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."student_contacts"
    ADD CONSTRAINT "student_contacts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_fee_assignments"
    ADD CONSTRAINT "student_fee_assignments_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "public"."fee_components"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."student_fee_assignments"
    ADD CONSTRAINT "student_fee_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_fee_discounts"
    ADD CONSTRAINT "student_fee_discounts_applied_by_user_id_fkey" FOREIGN KEY ("applied_by_user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."student_fee_discounts"
    ADD CONSTRAINT "student_fee_discounts_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."student_fee_discounts"
    ADD CONSTRAINT "student_fee_discounts_fee_term_id_fkey" FOREIGN KEY ("fee_term_id") REFERENCES "public"."fee_terms"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."student_fee_discounts"
    ADD CONSTRAINT "student_fee_discounts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_transport_assignments"
    ADD CONSTRAINT "student_transport_assignments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."student_transport_assignments"
    ADD CONSTRAINT "student_transport_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id");



ALTER TABLE ONLY "public"."student_transport_assignments"
    ADD CONSTRAINT "student_transport_assignments_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "public"."transport_stops"("id");



ALTER TABLE ONLY "public"."student_transport_assignments"
    ADD CONSTRAINT "student_transport_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_current_class_id_fkey" FOREIGN KEY ("current_class_id") REFERENCES "public"."classes"("class_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_proctor_teacher_id_fkey" FOREIGN KEY ("proctor_teacher_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id");



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("teacher_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_employment_status_id_fkey" FOREIGN KEY ("employment_status_id") REFERENCES "public"."employment_statuses"("status_id");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("class_id");



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id");



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id");



ALTER TABLE ONLY "public"."timetable"
    ADD CONSTRAINT "timetable_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("teacher_id");



ALTER TABLE ONLY "public"."transfer_certificates"
    ADD CONSTRAINT "transfer_certificates_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."transfer_certificates"
    ADD CONSTRAINT "transfer_certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id");



ALTER TABLE ONLY "public"."transport_routes"
    ADD CONSTRAINT "transport_routes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transport_routes"
    ADD CONSTRAINT "transport_routes_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."transport_vehicles"("id");



ALTER TABLE ONLY "public"."transport_stops"
    ADD CONSTRAINT "transport_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transport_vehicles"
    ADD CONSTRAINT "transport_vehicles_driver_profile_id_fkey" FOREIGN KEY ("driver_profile_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."transport_vehicles"
    ADD CONSTRAINT "transport_vehicles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("school_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles_definition"("role_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicle_positions"
    ADD CONSTRAINT "vehicle_positions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."transport_vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."prefixes"
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");



ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "storage"."s3_multipart_uploads"("id") ON DELETE CASCADE;



ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Admins can manage RTE reservations." ON "public"."rte_reservations" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage albums." ON "public"."albums" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage all transport assignments." ON "public"."student_transport_assignments" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "student_transport_assignments"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "student_transport_assignments"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage announcement targets" ON "public"."announcement_targets" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage announcements" ON "public"."announcements" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage attendance records" ON "public"."attendance_records" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "attendance_records"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "attendance_records"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage class fee structures." ON "public"."class_fee_structure" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_fee_structure"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_fee_structure"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage class subjects" ON "public"."class_subjects" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_subjects"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_subjects"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage classes" ON "public"."classes" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage config tables." ON "public"."employment_statuses" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage config tables." ON "public"."product_categories" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage discounts for their school" ON "public"."discounts" TO "authenticated" USING ((("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text"))) WITH CHECK ((("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text")));



CREATE POLICY "Admins can manage events" ON "public"."events" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage exam types" ON "public"."exam_types" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage exams" ON "public"."exams" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage fee components." ON "public"."fee_components" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage fee templates." ON "public"."fee_templates" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage fee terms." ON "public"."fee_terms" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."fee_templates" "ft"
  WHERE (("ft"."id" = "fee_terms"."fee_template_id") AND ("ft"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage forms" ON "public"."forms" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage invoices." ON "public"."invoices" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "invoices"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "invoices"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage marks for their school" ON "public"."marks" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage package items." ON "public"."package_items" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."product_packages" "pp"
  WHERE (("pp"."id" = "package_items"."package_id") AND ("pp"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."product_packages" "pp"
  WHERE (("pp"."id" = "package_items"."package_id") AND ("pp"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage periods" ON "public"."periods" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage product package rules." ON "public"."product_package_rules" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage stream subjects" ON "public"."stream_subjects" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."streams" "s"
  WHERE (("s"."id" = "stream_subjects"."stream_id") AND ("s"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."streams" "s"
  WHERE (("s"."id" = "stream_subjects"."stream_id") AND ("s"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage streams" ON "public"."streams" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage student contacts" ON "public"."student_contacts" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "student_contacts"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "student_contacts"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage student discount assignments" ON "public"."student_fee_discounts" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."classes" "c" ON (("s"."current_class_id" = "c"."class_id")))
  WHERE (("s"."student_id" = "student_fee_discounts"."student_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."classes" "c" ON (("s"."current_class_id" = "c"."class_id")))
  WHERE (("s"."student_id" = "student_fee_discounts"."student_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text")));



CREATE POLICY "Admins can manage student fee assignments" ON "public"."student_fee_assignments" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."classes" "c" ON (("s"."current_class_id" = "c"."class_id")))
  WHERE (("s"."student_id" = "student_fee_assignments"."student_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."classes" "c" ON (("s"."current_class_id" = "c"."class_id")))
  WHERE (("s"."student_id" = "student_fee_assignments"."student_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text")));



CREATE POLICY "Admins can manage students" ON "public"."students" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "students"."user_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "students"."user_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage subjects" ON "public"."subjects" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage teachers." ON "public"."teachers" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "teachers"."user_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "teachers"."user_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage timetable" ON "public"."timetable" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage transfer certificates." ON "public"."transfer_certificates" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "transfer_certificates"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE (("s"."student_id" = "transfer_certificates"."student_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage transport routes" ON "public"."transport_routes" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can manage transport stops" ON "public"."transport_stops" TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."transport_routes" "tr"
  WHERE (("tr"."id" = "transport_stops"."route_id") AND ("tr"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."transport_routes" "tr"
  WHERE (("tr"."id" = "transport_stops"."route_id") AND ("tr"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can manage transport vehicles" ON "public"."transport_vehicles" TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can update profiles in their school" ON "public"."profiles" FOR UPDATE TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can view academic years from their school." ON "public"."academic_years" FOR SELECT TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can view all form submissions for their school." ON "public"."form_submissions" FOR SELECT TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."forms" "f"
  WHERE (("f"."id" = "form_submissions"."form_id") AND ("f"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can view all vehicle positions for their school." ON "public"."vehicle_positions" FOR SELECT TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."transport_vehicles" "tv"
  WHERE (("tv"."id" = "vehicle_positions"."vehicle_id") AND ("tv"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Admins can view payments in their school" ON "public"."payments" FOR SELECT TO "authenticated" USING ((("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer) AND ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text")));



CREATE POLICY "Admins can view profiles in their school" ON "public"."profiles" FOR SELECT TO "school_admin" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Admins can view role definitions." ON "public"."roles_definition" FOR SELECT TO "school_admin" USING (true);



CREATE POLICY "Admins can view the audit trail for their school." ON "public"."audits" FOR SELECT TO "school_admin" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "audits"."user_id") AND ("p"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Allow Admins to create refunds" ON "public"."refunds" FOR INSERT WITH CHECK (((("public"."get_my_claim"('role'::"text"))::"text" = 'Admin'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."payments" "p"
  WHERE (("p"."id" = "refunds"."payment_id") AND ("p"."school_id" = ("public"."get_my_claim"('school_id'::"text"))::integer))))));



CREATE POLICY "Allow Admins to delete refunds" ON "public"."refunds" FOR DELETE USING (((("public"."get_my_claim"('role'::"text"))::"text" = 'Admin'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."payments" "p"
  WHERE (("p"."id" = "refunds"."payment_id") AND ("p"."school_id" = ("public"."get_my_claim"('school_id'::"text"))::integer))))));



CREATE POLICY "Allow Admins to update refunds" ON "public"."refunds" FOR UPDATE USING (((("public"."get_my_claim"('role'::"text"))::"text" = 'Admin'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."payments" "p"
  WHERE (("p"."id" = "refunds"."payment_id") AND ("p"."school_id" = ("public"."get_my_claim"('school_id'::"text"))::integer))))));



CREATE POLICY "Allow view access based on invoice ownership" ON "public"."applied_discounts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."invoices"
  WHERE ("invoices"."id" = "applied_discounts"."invoice_id"))));



CREATE POLICY "Allow view access based on user role and ownership" ON "public"."refunds" FOR SELECT USING ((((("public"."get_my_claim"('role'::"text"))::"text" = 'Admin'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."payments" "p"
  WHERE (("p"."id" = "refunds"."payment_id") AND ("p"."school_id" = ("public"."get_my_claim"('school_id'::"text"))::integer))))) OR (EXISTS ( SELECT 1
   FROM "public"."payments" "p"
  WHERE (("p"."id" = "refunds"."payment_id") AND ("p"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Authenticated users can view discounts for their school" ON "public"."discounts" FOR SELECT TO "authenticated" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Class teachers can update their class" ON "public"."classes" FOR UPDATE TO "teacher" USING (("class_teacher_id" = ( SELECT "t"."teacher_id"
   FROM "public"."teachers" "t"
  WHERE ("t"."user_id" = "auth"."uid"())
 LIMIT 1))) WITH CHECK (("class_teacher_id" = ( SELECT "t"."teacher_id"
   FROM "public"."teachers" "t"
  WHERE ("t"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Disallow direct deletes" ON "public"."applied_discounts" FOR DELETE USING (false);



CREATE POLICY "Disallow direct inserts" ON "public"."applied_discounts" FOR INSERT WITH CHECK (false);



CREATE POLICY "Disallow direct updates" ON "public"."applied_discounts" FOR UPDATE USING (false);



CREATE POLICY "Enable select for student on own invoices" ON "public"."invoices" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."student_id" = "invoices"."student_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enforce multi-tenant and role-based select on invoices" ON "public"."invoices" FOR SELECT USING (((((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer = ( SELECT "p"."school_id"
   FROM ("public"."students" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."user_id")))
  WHERE ("s"."student_id" = "invoices"."student_id"))) AND (((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'Admin'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."student_contacts" "sc"
  WHERE (("sc"."student_id" = "invoices"."student_id") AND ("sc"."profile_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."student_id" = "invoices"."student_id") AND ("s"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Only admins and teachers can modify album targets" ON "public"."album_targets" USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE (('School Admin'::"text" = ANY ("get_user_context"."role_names")) OR ('Teacher'::"text" = ANY ("get_user_context"."role_names"))))));



CREATE POLICY "Parents can manage their own orders." ON "public"."orders" TO "parent" USING (("parent_user_id" = "auth"."uid"())) WITH CHECK (("parent_user_id" = "auth"."uid"()));



CREATE POLICY "Parents can only view the position of their child's assigned bu" ON "public"."vehicle_positions" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM (("public"."student_transport_assignments" "sta"
     JOIN "public"."transport_routes" "tr" ON (("sta"."route_id" = "tr"."id")))
     JOIN "public"."student_contacts" "sc" ON (("sta"."student_id" = "sc"."student_id")))
  WHERE (("tr"."vehicle_id" = "vehicle_positions"."vehicle_id") AND ("sc"."profile_user_id" = "auth"."uid"())))));



CREATE POLICY "Parents can only view their own order items." ON "public"."order_items" FOR SELECT TO "parent" USING (("order_id" IN ( SELECT "orders"."order_id"
   FROM "public"."orders"
  WHERE ("orders"."parent_user_id" = "auth"."uid"()))));



CREATE POLICY "Parents can see items for their school's packages." ON "public"."package_items" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."product_packages" "pp"
  WHERE (("pp"."id" = "package_items"."package_id") AND ("pp"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Parents can see their child's transport assignment." ON "public"."student_transport_assignments" FOR SELECT TO "parent" USING (("student_id" IN ( SELECT "student_contacts"."student_id"
   FROM "public"."student_contacts"
  WHERE ("student_contacts"."profile_user_id" = "auth"."uid"()))));



CREATE POLICY "Parents can see transport routes for their school." ON "public"."transport_routes" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can update their own contact information." ON "public"."student_contacts" FOR UPDATE TO "parent" USING ((( SELECT "auth"."uid"() AS "uid") = "profile_user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_user_id"));



CREATE POLICY "Parents can view academic data from their school." ON "public"."timetable" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "timetable"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Parents can view academic years from their school." ON "public"."academic_years" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view announcement targets for their school." ON "public"."announcement_targets" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Parents can view announcements from their school." ON "public"."announcements" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view class-subject links for their school." ON "public"."class_subjects" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_subjects"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Parents can view discounts for their children" ON "public"."student_fee_discounts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."student_contacts" "sc"
  WHERE (("sc"."student_id" = "student_fee_discounts"."student_id") AND ("sc"."profile_user_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view events for their school." ON "public"."events" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view exams for their school." ON "public"."exams" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view fee assignments for their children" ON "public"."student_fee_assignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."student_contacts" "sc"
  WHERE (("sc"."student_id" = "student_fee_assignments"."student_id") AND ("sc"."profile_user_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view forms for their school." ON "public"."forms" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view product packages from their own school." ON "public"."product_packages" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view products from their own school." ON "public"."products" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view streams for their school." ON "public"."streams" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view subjects for their school." ON "public"."subjects" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view their children's attendance." ON "public"."attendance_records" FOR SELECT TO "parent" USING (("student_id" IN ( SELECT "sc"."student_id"
   FROM "public"."student_contacts" "sc"
  WHERE ("sc"."profile_user_id" = "auth"."uid"()))));



CREATE POLICY "Parents can view their children's classes from their school." ON "public"."classes" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view their children's marks" ON "public"."marks" FOR SELECT TO "parent" USING (("student_id" IN ( SELECT "sc"."student_id"
   FROM "public"."student_contacts" "sc"
  WHERE ("sc"."profile_user_id" = "auth"."uid"()))));



CREATE POLICY "Parents can view their linked children's records." ON "public"."students" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."student_contacts" "sc"
  WHERE (("sc"."student_id" = "students"."student_id") AND ("sc"."profile_user_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view their own child's invoices." ON "public"."invoices" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."student_contacts"
  WHERE (("student_contacts"."student_id" = "invoices"."student_id") AND ("student_contacts"."profile_user_id" = "auth"."uid"())))));



CREATE POLICY "Parents can view their own school." ON "public"."schools" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Parents can view transport stops for their school." ON "public"."transport_stops" FOR SELECT TO "parent" USING ((EXISTS ( SELECT 1
   FROM "public"."transport_routes" "tr"
  WHERE (("tr"."id" = "transport_stops"."route_id") AND ("tr"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Parents can view transport vehicles for their own school." ON "public"."transport_vehicles" FOR SELECT TO "parent" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can only access media in visible albums." ON "public"."media_items" FOR SELECT USING (("album_id" IN ( SELECT "albums"."id"
   FROM "public"."albums"
  WHERE ("albums"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))));



CREATE POLICY "Public can see items for their school's packages." ON "public"."package_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."product_packages" "pp"
  WHERE (("pp"."id" = "package_items"."package_id") AND ("pp"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Public can see transport routes for their school." ON "public"."transport_routes" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view academic data from their school." ON "public"."timetable" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "timetable"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Public can view announcements from their school." ON "public"."announcements" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view events for their own school." ON "public"."events" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view exam types for their own school." ON "public"."exam_types" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view exams for their own school." ON "public"."exams" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view forms for their own school." ON "public"."forms" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view period data from their school." ON "public"."periods" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view product packages from their own school." ON "public"."product_packages" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view streams for their own school." ON "public"."streams" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view subjects for their own school." ON "public"."subjects" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view their own school." ON "public"."schools" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Public can view transport stops for their school." ON "public"."transport_stops" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."transport_routes" "tr"
  WHERE (("tr"."id" = "transport_stops"."route_id") AND ("tr"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Public can view transport vehicles for their own school." ON "public"."transport_vehicles" FOR SELECT USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can see items for their school's packages." ON "public"."package_items" FOR SELECT TO "student" USING ((EXISTS ( SELECT 1
   FROM "public"."product_packages" "pp"
  WHERE (("pp"."id" = "package_items"."package_id") AND ("pp"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Students can see transport routes for their school." ON "public"."transport_routes" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view academic data from their school." ON "public"."timetable" FOR SELECT TO "student" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "timetable"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Students can view academic years from their school." ON "public"."academic_years" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view announcement targets for their school." ON "public"."announcement_targets" FOR SELECT TO "student" USING ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Students can view announcements from their school." ON "public"."announcements" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view class-subject links for their school." ON "public"."class_subjects" FOR SELECT TO "student" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_subjects"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Students can view classes from their school." ON "public"."classes" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view events for their school." ON "public"."events" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view exams for their school." ON "public"."exams" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view forms for their school." ON "public"."forms" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view period data from their school." ON "public"."periods" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view product packages from their own school." ON "public"."product_packages" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view products from their own school." ON "public"."products" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view streams for their school." ON "public"."streams" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view subjects for their school." ON "public"."subjects" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view their own attendance." ON "public"."attendance_records" FOR SELECT TO "student" USING (("student_id" IN ( SELECT "s"."student_id"
   FROM "public"."students" "s"
  WHERE ("s"."user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view their own discounts" ON "public"."student_fee_discounts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."student_id" = "student_fee_discounts"."student_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Students can view their own fee assignments" ON "public"."student_fee_assignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."student_id" = "student_fee_assignments"."student_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Students can view their own marks" ON "public"."marks" FOR SELECT TO "student" USING ((EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."student_id" = "marks"."student_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Students can view their own record." ON "public"."students" FOR SELECT TO "student" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Students can view their own school." ON "public"."schools" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Students can view transport stops for their school." ON "public"."transport_stops" FOR SELECT TO "student" USING ((EXISTS ( SELECT 1
   FROM "public"."transport_routes" "tr"
  WHERE (("tr"."id" = "transport_stops"."route_id") AND ("tr"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Students can view transport vehicles for their own school." ON "public"."transport_vehicles" FOR SELECT TO "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can manage announcement targets" ON "public"."announcement_targets" TO "teacher" USING ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Teachers can manage announcements" ON "public"."announcements" TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)) WITH CHECK (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can manage marks for students in their classes" ON "public"."marks" TO "teacher" USING ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."classes" "c" ON (("s"."current_class_id" = "c"."class_id")))
  WHERE (("s"."student_id" = "marks"."student_id") AND ("c"."class_teacher_id" = ( SELECT "teachers"."teacher_id"
           FROM "public"."teachers"
          WHERE ("teachers"."user_id" = "auth"."uid"()))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."classes" "c" ON (("s"."current_class_id" = "c"."class_id")))
  WHERE (("s"."student_id" = "marks"."student_id") AND ("c"."class_teacher_id" = ( SELECT "teachers"."teacher_id"
           FROM "public"."teachers"
          WHERE ("teachers"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Teachers can see items for their school's packages." ON "public"."package_items" FOR SELECT TO "teacher" USING ((EXISTS ( SELECT 1
   FROM "public"."product_packages" "pp"
  WHERE (("pp"."id" = "package_items"."package_id") AND ("pp"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Teachers can see transport routes for their school." ON "public"."transport_routes" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view academic data from their school." ON "public"."timetable" FOR SELECT TO "teacher" USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "timetable"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Teachers can view academic years from their school." ON "public"."academic_years" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view and manage attendance for their class." ON "public"."attendance_records" TO "teacher" USING (("class_id" IN ( SELECT "c"."class_id"
   FROM "public"."classes" "c"
  WHERE ("c"."class_teacher_id" = ( SELECT "t"."teacher_id"
           FROM "public"."teachers" "t"
          WHERE ("t"."user_id" = "auth"."uid"())
         LIMIT 1))))) WITH CHECK (("class_id" IN ( SELECT "c"."class_id"
   FROM "public"."classes" "c"
  WHERE ("c"."class_teacher_id" = ( SELECT "t"."teacher_id"
           FROM "public"."teachers" "t"
          WHERE ("t"."user_id" = "auth"."uid"())
         LIMIT 1)))));



CREATE POLICY "Teachers can view classes from their school." ON "public"."classes" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view contacts for their class students." ON "public"."student_contacts" FOR SELECT TO "teacher" USING (("student_id" IN ( SELECT "s"."student_id"
   FROM "public"."students" "s"
  WHERE ("s"."current_class_id" IN ( SELECT "c"."class_id"
           FROM "public"."classes" "c"
          WHERE ("c"."class_teacher_id" = ( SELECT "t"."teacher_id"
                   FROM "public"."teachers" "t"
                  WHERE ("t"."user_id" = "auth"."uid"())
                 LIMIT 1)))))));



CREATE POLICY "Teachers can view events for their school." ON "public"."events" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view exams for their school." ON "public"."exams" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view forms for their school." ON "public"."forms" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view period data from their school." ON "public"."periods" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view product packages from their school." ON "public"."product_packages" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view products from their school." ON "public"."products" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view streams for their school." ON "public"."streams" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view students in their classes." ON "public"."students" FOR SELECT TO "teacher" USING (("current_class_id" IN ( SELECT "c"."class_id"
   FROM "public"."classes" "c"
  WHERE ("c"."class_teacher_id" = ( SELECT "t"."teacher_id"
           FROM "public"."teachers" "t"
          WHERE ("t"."user_id" = "auth"."uid"())
         LIMIT 1)))));



CREATE POLICY "Teachers can view subjects for their school." ON "public"."subjects" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view their own school." ON "public"."schools" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Teachers can view transport stops for their school." ON "public"."transport_stops" FOR SELECT TO "teacher" USING ((EXISTS ( SELECT 1
   FROM "public"."transport_routes" "tr"
  WHERE (("tr"."id" = "transport_stops"."route_id") AND ("tr"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Teachers can view transport vehicles for their school." ON "public"."transport_vehicles" FOR SELECT TO "teacher" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Users can access messages in their conversations." ON "public"."messages" USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own event RSVPs." ON "public"."event_rsvps" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own form submissions." ON "public"."form_submissions" USING (("submitted_by_user_id" = "auth"."uid"())) WITH CHECK (("submitted_by_user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own preferences." ON "public"."user_preferences" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can only access their own cart's items." ON "public"."cart_items" TO "school_admin", "teacher", "parent", "student" USING (("cart_id" IN ( SELECT "carts"."cart_id"
   FROM "public"."carts"
  WHERE ("carts"."user_id" = "auth"."uid"())))) WITH CHECK (("cart_id" IN ( SELECT "carts"."cart_id"
   FROM "public"."carts"
  WHERE ("carts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can only access their own cart." ON "public"."carts" TO "school_admin", "teacher", "parent", "student" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can only see participants in their own conversations." ON "public"."conversation_participants" FOR SELECT USING (("conversation_id" IN ( SELECT "conversation_participants_1"."conversation_id"
   FROM "public"."conversation_participants" "conversation_participants_1"
  WHERE ("conversation_participants_1"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can see targets for their school's announcements." ON "public"."announcement_targets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."announcements" "a"
  WHERE (("a"."id" = "announcement_targets"."announcement_id") AND ("a"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Users can view albums for their school." ON "public"."albums" FOR SELECT TO "teacher", "parent", "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Users can view allocations for payments they can access" ON "public"."payment_allocations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."payments" "p"
  WHERE ("p"."id" = "payment_allocations"."payment_id"))));



CREATE POLICY "Users can view and update their own profile." ON "public"."profiles" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view class-subject links from their school." ON "public"."class_subjects" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."classes" "c"
  WHERE (("c"."class_id" = "class_subjects"."class_id") AND ("c"."school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer)))));



CREATE POLICY "Users can view conversations they are a part of." ON "public"."conversations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view items for invoices they can access" ON "public"."invoice_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."invoices" "i"
  WHERE ("i"."id" = "invoice_items"."invoice_id"))));



CREATE POLICY "Users can view products from their school." ON "public"."products" FOR SELECT TO "school_admin", "teacher", "parent", "student" USING (("school_id" = ((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'school_id'::"text"))::integer));



CREATE POLICY "Users can view targets for albums in their school" ON "public"."album_targets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."albums" "a"
  WHERE (("a"."id" = "album_targets"."album_id") AND ("a"."school_id" = ( SELECT "get_user_context"."school_id"
           FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")))))));



CREATE POLICY "Users can view their own and their children's payments" ON "public"."payments" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."student_id" = "payments"."student_id") AND ("s"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."student_contacts" "sc"
  WHERE (("sc"."student_id" = "payments"."student_id") AND ("sc"."profile_user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."academic_years" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."album_targets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcement_targets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applied_discounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendance_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_fee_structure" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employment_statuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_rsvps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_components" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_template_components" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."package_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_allocations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."periods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_package_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_packages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."refunds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles_definition" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rte_reservations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."streams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_fee_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_fee_discounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_transport_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teachers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timetable" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transfer_certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transport_routes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transport_stops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transport_vehicles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_positions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Admins can update profile pictures" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'profile-pictures'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "ctx"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE ('School Admin'::"text" = ANY ("ctx"."role_names"))))));



CREATE POLICY "Admins can upload profile pictures" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'profile-pictures'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "ctx"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE ('School Admin'::"text" = ANY ("ctx"."role_names"))))));



CREATE POLICY "Admins can view any profile picture in their school" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'profile-pictures'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."get_user_context"() "ctx"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
     JOIN "public"."profiles" "p" ON (((("storage"."foldername"("objects"."name"))[1])::"uuid" = "p"."user_id")))
  WHERE (("ctx"."school_id" = "p"."school_id") AND ('School Admin'::"text" = ANY ("ctx"."role_names")))))));



CREATE POLICY "Anyone can view public cultural albums" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'school-media-cultural'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."media_items" "mi"
     JOIN "public"."albums" "a" ON (("mi"."album_id" = "a"."id")))
  WHERE ((("mi"."storage_path")::"text" = "objects"."name") AND ("a"."is_public" = true) AND (("a"."access_scope")::"text" = 'public'::"text") AND ("a"."school_id" = ( SELECT "get_user_context"."school_id"
           FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id"))))))));



CREATE POLICY "School Admins can delete product images" ON "storage"."objects" FOR DELETE USING ((("bucket_id" = 'school-media-ecommerce'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE ('School Admin'::"text" = ANY ("get_user_context"."role_names"))))));



CREATE POLICY "School Admins can update product images" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'school-media-ecommerce'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE ('School Admin'::"text" = ANY ("get_user_context"."role_names"))))));



CREATE POLICY "School Admins can upload product images" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'school-media-ecommerce'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE ('School Admin'::"text" = ANY ("get_user_context"."role_names"))))));



CREATE POLICY "Teachers and admins can upload cultural media" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'school-media-cultural'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."get_user_context"() "get_user_context"("user_id", "school_id", "role_names", "current_class_id", "grade_level", "student_id")
  WHERE (('Teacher'::"text" = ANY ("get_user_context"."role_names")) OR ('School Admin'::"text" = ANY ("get_user_context"."role_names")))))));



CREATE POLICY "Users can view their own profile picture" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'profile-pictures'::"text") AND (("storage"."foldername"("name"))[1] = ("auth"."uid"())::"text")));



ALTER TABLE "storage"."buckets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."buckets_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."prefixes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."s3_multipart_uploads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "storage"."s3_multipart_uploads_parts" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "auth" TO "anon";
GRANT USAGE ON SCHEMA "auth" TO "authenticated";
GRANT USAGE ON SCHEMA "auth" TO "service_role";
GRANT ALL ON SCHEMA "auth" TO "supabase_auth_admin";
GRANT ALL ON SCHEMA "auth" TO "dashboard_user";
GRANT USAGE ON SCHEMA "auth" TO "postgres";



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "storage" TO "postgres" WITH GRANT OPTION;
GRANT USAGE ON SCHEMA "storage" TO "anon";
GRANT USAGE ON SCHEMA "storage" TO "authenticated";
GRANT USAGE ON SCHEMA "storage" TO "service_role";
GRANT ALL ON SCHEMA "storage" TO "supabase_storage_admin";
GRANT ALL ON SCHEMA "storage" TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."email"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."jwt"() TO "postgres";
GRANT ALL ON FUNCTION "auth"."jwt"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."role"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."uid"() TO "dashboard_user";



GRANT ALL ON FUNCTION "public"."current_user_school_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_school_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_school_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_teacher_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_teacher_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_teacher_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_context"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_context"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_context"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."is_parent_of"("profile_user_id_to_check" "uuid", "student_id_to_check" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_parent_of"("profile_user_id_to_check" "uuid", "student_id_to_check" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_parent_of"("profile_user_id_to_check" "uuid", "student_id_to_check" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."is_parent_of"("profile_user_id_to_check" "uuid", "student_id_to_check" integer) TO "parent";



GRANT ALL ON FUNCTION "public"."is_student_in_teachers_class"("p_student_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_student_in_teachers_class"("p_student_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_student_in_teachers_class"("p_student_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_a_contact_for_student"("p_student_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_a_contact_for_student"("p_student_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_a_contact_for_student"("p_student_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."who_am_i"() TO "anon";
GRANT ALL ON FUNCTION "public"."who_am_i"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."who_am_i"() TO "service_role";



GRANT ALL ON TABLE "auth"."audit_log_entries" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."audit_log_entries" TO "postgres";
GRANT SELECT ON TABLE "auth"."audit_log_entries" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."flow_state" TO "postgres";
GRANT SELECT ON TABLE "auth"."flow_state" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."flow_state" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."identities" TO "postgres";
GRANT SELECT ON TABLE "auth"."identities" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."identities" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."instances" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."instances" TO "postgres";
GRANT SELECT ON TABLE "auth"."instances" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_amr_claims" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_amr_claims" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_amr_claims" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_challenges" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_challenges" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_challenges" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_factors" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_factors" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_factors" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_authorizations" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_authorizations" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_clients" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_clients" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_consents" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_consents" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."one_time_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."one_time_tokens" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."one_time_tokens" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."refresh_tokens" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."refresh_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."refresh_tokens" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "dashboard_user";
GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "postgres";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_providers" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_relay_states" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_relay_states" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_relay_states" TO "dashboard_user";



GRANT SELECT ON TABLE "auth"."schema_migrations" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sessions" TO "postgres";
GRANT SELECT ON TABLE "auth"."sessions" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sessions" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_domains" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_domains" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_domains" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_providers" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."users" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."users" TO "postgres";
GRANT SELECT ON TABLE "auth"."users" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "public"."academic_years" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."academic_years" TO "school_admin";
GRANT SELECT ON TABLE "public"."academic_years" TO "teacher";
GRANT SELECT ON TABLE "public"."academic_years" TO "parent";
GRANT SELECT ON TABLE "public"."academic_years" TO "student";



GRANT ALL ON SEQUENCE "public"."academic_years_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."academic_years_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."achievement_point_rules" TO "anon";
GRANT ALL ON TABLE "public"."achievement_point_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_point_rules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."achievement_point_rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."achievement_point_rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."achievement_point_rules_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."album_targets" TO "anon";
GRANT ALL ON TABLE "public"."album_targets" TO "authenticated";
GRANT ALL ON TABLE "public"."album_targets" TO "service_role";



GRANT ALL ON SEQUENCE "public"."album_targets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."album_targets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."album_targets_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON SEQUENCE "public"."albums_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."albums_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."announcement_targets" TO "service_role";



GRANT ALL ON SEQUENCE "public"."announcement_targets_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."announcement_targets_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."announcements" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."announcements" TO "school_admin";
GRANT SELECT ON TABLE "public"."announcements" TO "teacher";
GRANT SELECT ON TABLE "public"."announcements" TO "parent";
GRANT SELECT ON TABLE "public"."announcements" TO "student";



GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."announcements_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."applied_discounts" TO "anon";
GRANT ALL ON TABLE "public"."applied_discounts" TO "authenticated";
GRANT ALL ON TABLE "public"."applied_discounts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."applied_discounts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."applied_discounts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."applied_discounts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_records" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."attendance_records" TO "teacher";
GRANT SELECT ON TABLE "public"."attendance_records" TO "parent";
GRANT SELECT ON TABLE "public"."attendance_records" TO "student";



GRANT ALL ON SEQUENCE "public"."attendance_records_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."attendance_records_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."audits" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audits_audit_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."audits_audit_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."cart_items" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."cart_items" TO "school_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."cart_items" TO "teacher";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."cart_items" TO "parent";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."cart_items" TO "student";



GRANT ALL ON SEQUENCE "public"."cart_items_cart_item_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."cart_items_cart_item_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."carts" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."carts" TO "school_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."carts" TO "teacher";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."carts" TO "parent";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."carts" TO "student";



GRANT ALL ON SEQUENCE "public"."carts_cart_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."carts_cart_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."class_attendance_weekly" TO "service_role";



GRANT ALL ON TABLE "public"."class_fee_structure" TO "service_role";



GRANT ALL ON SEQUENCE "public"."class_fee_structure_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."class_fee_structure_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."class_subjects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."class_subjects_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."class_subjects_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."classes" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."classes" TO "school_admin";
GRANT SELECT ON TABLE "public"."classes" TO "teacher";
GRANT SELECT ON TABLE "public"."classes" TO "parent";
GRANT SELECT ON TABLE "public"."classes" TO "student";



GRANT ALL ON SEQUENCE "public"."classes_class_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."classes_class_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."club_activities" TO "anon";
GRANT ALL ON TABLE "public"."club_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."club_activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."club_activities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."club_activities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."club_activities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."club_memberships" TO "anon";
GRANT ALL ON TABLE "public"."club_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."club_memberships" TO "service_role";



GRANT ALL ON SEQUENCE "public"."club_memberships_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."club_memberships_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."club_memberships_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clubs" TO "anon";
GRANT ALL ON TABLE "public"."clubs" TO "authenticated";
GRANT ALL ON TABLE "public"."clubs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clubs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clubs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clubs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";
GRANT SELECT ON TABLE "public"."conversation_participants" TO "school_admin";
GRANT SELECT ON TABLE "public"."conversation_participants" TO "teacher";
GRANT SELECT ON TABLE "public"."conversation_participants" TO "parent";
GRANT SELECT ON TABLE "public"."conversation_participants" TO "student";



GRANT ALL ON TABLE "public"."conversations" TO "service_role";
GRANT SELECT ON TABLE "public"."conversations" TO "school_admin";
GRANT SELECT ON TABLE "public"."conversations" TO "teacher";
GRANT SELECT ON TABLE "public"."conversations" TO "parent";
GRANT SELECT ON TABLE "public"."conversations" TO "student";



GRANT ALL ON SEQUENCE "public"."conversations_conversation_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."conversations_conversation_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."discounts" TO "anon";
GRANT ALL ON TABLE "public"."discounts" TO "authenticated";
GRANT ALL ON TABLE "public"."discounts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."discounts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."discounts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."discounts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employment_statuses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employment_statuses_status_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."employment_statuses_status_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."event_rsvps" TO "service_role";



GRANT ALL ON SEQUENCE "public"."event_rsvps_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."event_rsvps_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."events" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."events" TO "school_admin";
GRANT SELECT ON TABLE "public"."events" TO "teacher";
GRANT SELECT ON TABLE "public"."events" TO "parent";
GRANT SELECT ON TABLE "public"."events" TO "student";



GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."events_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."exam_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exam_types_exam_type_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."exam_types_exam_type_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."exams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."exams_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."fee_components" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."fee_components" TO "school_admin";



GRANT ALL ON SEQUENCE "public"."fee_components_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."fee_components_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."fee_templates" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."fee_templates" TO "school_admin";



GRANT ALL ON SEQUENCE "public"."fee_structure_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."fee_structure_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."fee_template_components" TO "anon";
GRANT ALL ON TABLE "public"."fee_template_components" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_template_components" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fee_template_components_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fee_template_components_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fee_template_components_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fee_terms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fee_terms_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."fee_terms_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."form_submissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."form_submissions_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."form_submissions_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."forms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forms_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."forms_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."gateway_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."gateway_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."gateway_webhook_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."gateway_webhook_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."gateway_webhook_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."gateway_webhook_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoice_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoice_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "service_role";
GRANT SELECT ON TABLE "public"."invoices" TO "parent";



GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."invoices_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."logs_log_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."logs_log_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."marks" TO "anon";
GRANT ALL ON TABLE "public"."marks" TO "authenticated";
GRANT ALL ON TABLE "public"."marks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."marks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."marks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."marks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."media_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."media_items_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."media_items_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."messages" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."messages" TO "school_admin";
GRANT SELECT,INSERT ON TABLE "public"."messages" TO "teacher";
GRANT SELECT,INSERT ON TABLE "public"."messages" TO "parent";
GRANT SELECT,INSERT ON TABLE "public"."messages" TO "student";



GRANT ALL ON SEQUENCE "public"."messages_message_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."messages_message_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."order_items" TO "service_role";
GRANT SELECT ON TABLE "public"."order_items" TO "parent";



GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."order_items_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."orders" TO "service_role";
GRANT SELECT ON TABLE "public"."orders" TO "parent";



GRANT ALL ON SEQUENCE "public"."orders_order_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."orders_order_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."package_items" TO "service_role";



GRANT ALL ON TABLE "public"."payment_allocations" TO "anon";
GRANT ALL ON TABLE "public"."payment_allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_allocations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payment_allocations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payment_allocations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payment_allocations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."periods" TO "service_role";



GRANT ALL ON SEQUENCE "public"."periods_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."periods_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."product_album_links" TO "anon";
GRANT ALL ON TABLE "public"."product_album_links" TO "authenticated";
GRANT ALL ON TABLE "public"."product_album_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_album_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_album_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_album_links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_categories_category_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."product_categories_category_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."product_package_rules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_package_rules_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."product_package_rules_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."product_packages" TO "service_role";
GRANT SELECT ON TABLE "public"."product_packages" TO "school_admin";
GRANT SELECT ON TABLE "public"."product_packages" TO "teacher";
GRANT SELECT ON TABLE "public"."product_packages" TO "parent";
GRANT SELECT ON TABLE "public"."product_packages" TO "student";



GRANT ALL ON SEQUENCE "public"."product_packages_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."product_packages_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."products" TO "service_role";
GRANT SELECT ON TABLE "public"."products" TO "school_admin";
GRANT SELECT ON TABLE "public"."products" TO "teacher";
GRANT SELECT ON TABLE "public"."products" TO "parent";
GRANT SELECT ON TABLE "public"."products" TO "student";



GRANT ALL ON SEQUENCE "public"."products_product_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."products_product_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT,UPDATE ON TABLE "public"."profiles" TO "school_admin";
GRANT SELECT,UPDATE ON TABLE "public"."profiles" TO "teacher";
GRANT SELECT,UPDATE ON TABLE "public"."profiles" TO "parent";
GRANT SELECT,UPDATE ON TABLE "public"."profiles" TO "student";



GRANT ALL ON TABLE "public"."refunds" TO "anon";
GRANT ALL ON TABLE "public"."refunds" TO "authenticated";
GRANT ALL ON TABLE "public"."refunds" TO "service_role";



GRANT ALL ON SEQUENCE "public"."refunds_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."refunds_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."refunds_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."roles_definition" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_definition_role_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."roles_definition_role_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."rte_reservations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rte_reservations_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."rte_reservations_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."schools" TO "service_role";
GRANT SELECT ON TABLE "public"."schools" TO "teacher";
GRANT SELECT ON TABLE "public"."schools" TO "parent";
GRANT SELECT ON TABLE "public"."schools" TO "student";



GRANT ALL ON SEQUENCE "public"."schools_school_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."schools_school_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."stream_subjects" TO "anon";
GRANT ALL ON TABLE "public"."stream_subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."stream_subjects" TO "service_role";



GRANT ALL ON TABLE "public"."streams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."streams_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."streams_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."student_achievements" TO "anon";
GRANT ALL ON TABLE "public"."student_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."student_achievements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_achievements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_achievements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_achievements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_contacts" TO "service_role";
GRANT SELECT ON TABLE "public"."student_contacts" TO "teacher";
GRANT SELECT,UPDATE ON TABLE "public"."student_contacts" TO "parent";



GRANT ALL ON SEQUENCE "public"."student_contacts_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."student_contacts_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."student_fee_assignments" TO "anon";
GRANT ALL ON TABLE "public"."student_fee_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."student_fee_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_fee_assignments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_fee_assignments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_fee_assignments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_fee_discounts" TO "anon";
GRANT ALL ON TABLE "public"."student_fee_discounts" TO "authenticated";
GRANT ALL ON TABLE "public"."student_fee_discounts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_fee_discounts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."student_fee_discounts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."student_fee_discounts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."student_transport_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."student_transport_assignments_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."student_transport_assignments_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."students" TO "service_role";
GRANT SELECT ON TABLE "public"."students" TO "parent";



GRANT ALL ON SEQUENCE "public"."students_student_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."students_student_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."subjects" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."subjects" TO "school_admin";
GRANT SELECT ON TABLE "public"."subjects" TO "teacher";
GRANT SELECT ON TABLE "public"."subjects" TO "parent";
GRANT SELECT ON TABLE "public"."subjects" TO "student";



GRANT ALL ON SEQUENCE "public"."subjects_subject_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."subjects_subject_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."teacher_subjects" TO "anon";
GRANT ALL ON TABLE "public"."teacher_subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_subjects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teacher_subjects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teacher_subjects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teacher_subjects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."teachers" TO "service_role";
GRANT SELECT ON TABLE "public"."teachers" TO "teacher";



GRANT ALL ON SEQUENCE "public"."teachers_teacher_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."teachers_teacher_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."timetable" TO "service_role";
GRANT SELECT ON TABLE "public"."timetable" TO "teacher";
GRANT SELECT ON TABLE "public"."timetable" TO "parent";
GRANT SELECT ON TABLE "public"."timetable" TO "student";



GRANT ALL ON SEQUENCE "public"."timetable_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."timetable_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."transfer_certificates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transfer_certificates_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."transfer_certificates_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."transport_routes" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."transport_routes" TO "school_admin";



GRANT ALL ON SEQUENCE "public"."transport_routes_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."transport_routes_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."transport_stops" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transport_stops_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."transport_stops_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."transport_vehicles" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."transport_vehicles" TO "school_admin";



GRANT ALL ON SEQUENCE "public"."transport_vehicles_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."transport_vehicles_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_positions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vehicle_positions_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."vehicle_positions_id_seq" TO "authenticated";



GRANT ALL ON TABLE "storage"."buckets" TO "anon";
GRANT ALL ON TABLE "storage"."buckets" TO "authenticated";
GRANT ALL ON TABLE "storage"."buckets" TO "service_role";
GRANT ALL ON TABLE "storage"."buckets" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "storage"."buckets_analytics" TO "service_role";
GRANT ALL ON TABLE "storage"."buckets_analytics" TO "authenticated";
GRANT ALL ON TABLE "storage"."buckets_analytics" TO "anon";



GRANT ALL ON TABLE "storage"."objects" TO "anon";
GRANT ALL ON TABLE "storage"."objects" TO "authenticated";
GRANT ALL ON TABLE "storage"."objects" TO "service_role";
GRANT ALL ON TABLE "storage"."objects" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "storage"."prefixes" TO "service_role";
GRANT ALL ON TABLE "storage"."prefixes" TO "authenticated";
GRANT ALL ON TABLE "storage"."prefixes" TO "anon";



GRANT ALL ON TABLE "storage"."s3_multipart_uploads" TO "service_role";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads" TO "authenticated";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads" TO "anon";



GRANT ALL ON TABLE "storage"."s3_multipart_uploads_parts" TO "service_role";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads_parts" TO "authenticated";
GRANT SELECT ON TABLE "storage"."s3_multipart_uploads_parts" TO "anon";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "storage" GRANT ALL ON TABLES TO "service_role";
