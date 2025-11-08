SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict XuUYrzNkLwAT3PwhFteT4gVeyZJrDUXeCMjKOC7L04vFWbppdJmCsWzgR9LTtOL

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '8b487ef5-24af-41ad-84be-0f04b13f976c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"principal.sharma@tapasyavp.edu.in","user_id":"a9267b32-4379-42f5-b842-045a10283cde","user_phone":""}}', '2025-09-21 03:54:42.351162+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb599aad-89f5-4d52-a5a0-99efeada8fbb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.patel@tapasyavp.edu.in","user_id":"13461b44-7c08-4728-aed4-0ec4d5723f73","user_phone":""}}', '2025-09-21 03:54:43.278942+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f3cb0d8b-2c98-44e9-9138-17423c8d48cf', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aisha.khan@tapasyavp.edu.in","user_id":"464f6a1e-8427-4819-999a-a7aa754ca7ec","user_phone":""}}', '2025-09-21 03:54:43.545416+00', ''),
	('00000000-0000-0000-0000-000000000000', '1facab38-93c2-4d92-b4b0-7016f0b9082b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.imran.khan@tapasyavp.edu.in","user_id":"6dab6b1f-ae9a-4898-b744-a8d1365358a6","user_phone":""}}', '2025-09-21 03:54:43.777133+00', ''),
	('00000000-0000-0000-0000-000000000000', '497dc04c-20be-4014-af14-012c0007374a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.imran.khan@tapasyavp.edu.in","user_id":"6dab6b1f-ae9a-4898-b744-a8d1365358a6","user_phone":""}}', '2025-09-21 04:04:40.429466+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e5075bb-ed7d-4df7-be6f-e2a65cf71ddb', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"principal.sharma@tapasyavp.edu.in","user_id":"a9267b32-4379-42f5-b842-045a10283cde","user_phone":""}}', '2025-09-21 04:04:40.432669+00', ''),
	('00000000-0000-0000-0000-000000000000', '5eefe838-46a4-44b9-960c-cf1941ff6017', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aisha.khan@tapasyavp.edu.in","user_id":"464f6a1e-8427-4819-999a-a7aa754ca7ec","user_phone":""}}', '2025-09-21 04:04:40.451798+00', ''),
	('00000000-0000-0000-0000-000000000000', '53ddbeec-0efa-49c5-8893-b08f9eda4c3d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.patel@tapasyavp.edu.in","user_id":"13461b44-7c08-4728-aed4-0ec4d5723f73","user_phone":""}}', '2025-09-21 04:04:40.456297+00', ''),
	('00000000-0000-0000-0000-000000000000', '76697842-4f0c-4f3b-ad0b-b6cb27cc0f7c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"principal.sharma@tapasyavp.edu.in","user_id":"dbadcb15-f0dc-4187-ba4b-8a3b86ce3129","user_phone":""}}', '2025-09-21 04:04:53.982275+00', ''),
	('00000000-0000-0000-0000-000000000000', '47ca28bf-af31-471e-826c-0c9bd620019c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.patel@tapasyavp.edu.in","user_id":"a132784e-0409-4d5b-bb99-4a0b307a0270","user_phone":""}}', '2025-09-21 04:04:54.810027+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f9e82de-73eb-4854-b7ac-58cae757a3df', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aisha.khan@tapasyavp.edu.in","user_id":"b8448d3c-9ac1-4716-a69b-db1f99637b22","user_phone":""}}', '2025-09-21 04:04:55.123756+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ee6d011-6468-4e94-b770-b3c76c9d5ff7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.imran.khan@tapasyavp.edu.in","user_id":"cfccf5c7-e9e3-49b5-b3f6-31ebb66eb627","user_phone":""}}', '2025-09-21 04:04:55.45181+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fa03d648-5a6d-4d96-b306-6078cfed25b0', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.imran.khan@tapasyavp.edu.in","user_id":"cfccf5c7-e9e3-49b5-b3f6-31ebb66eb627","user_phone":""}}', '2025-09-21 05:36:03.07649+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad931037-1ef4-4fe2-8897-fb5bfcc23e90', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.patel@tapasyavp.edu.in","user_id":"a132784e-0409-4d5b-bb99-4a0b307a0270","user_phone":""}}', '2025-09-21 05:36:03.076377+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d67a536-2b98-46cc-ac3b-7dfebfb20f2e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aisha.khan@tapasyavp.edu.in","user_id":"b8448d3c-9ac1-4716-a69b-db1f99637b22","user_phone":""}}', '2025-09-21 05:36:03.073096+00', ''),
	('00000000-0000-0000-0000-000000000000', '41ce6af5-f9da-4ddd-9646-4bd8ef07271b', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"principal.sharma@tapasyavp.edu.in","user_id":"dbadcb15-f0dc-4187-ba4b-8a3b86ce3129","user_phone":""}}', '2025-09-21 05:36:03.072329+00', ''),
	('00000000-0000-0000-0000-000000000000', '6cff09b3-007f-4e24-8979-022772d030a8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"principal.sharma@tapasyavp.edu.in","user_id":"b2da062d-2273-4719-93ef-d3e8dcb9a678","user_phone":""}}', '2025-09-21 05:51:29.877455+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c32cc27d-28a2-41e9-9397-6497434c94dc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.patel@tapasyavp.edu.in","user_id":"3608a497-bb52-4598-8640-1559d2a8ed7e","user_phone":""}}', '2025-09-21 05:51:30.660418+00', ''),
	('00000000-0000-0000-0000-000000000000', '45c351e8-b5be-475b-a8cd-0e71c80cd058', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.gupta@tapasyavp.edu.in","user_id":"4203fb46-15ff-434c-9998-c10853408319","user_phone":""}}', '2025-09-21 05:51:30.979672+00', ''),
	('00000000-0000-0000-0000-000000000000', '27746469-bd13-4e6a-a971-094795538a1d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.kumar@tapasyavp.edu.in","user_id":"ca099d8b-bfd3-445b-adf6-ecbb46f93e8c","user_phone":""}}', '2025-09-21 05:51:31.21725+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b317f1d-adb8-483c-b552-86f57aff467f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.verma@tapasyavp.edu.in","user_id":"f1e04b94-8a64-4e61-b999-9c78c0cfab31","user_phone":""}}', '2025-09-21 05:51:31.530724+00', ''),
	('00000000-0000-0000-0000-000000000000', '48b0e772-5c89-494f-b735-a93480fb9641', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.mishra@tapasyavp.edu.in","user_id":"e54cd608-f602-44b7-936f-dd13cdc53185","user_phone":""}}', '2025-09-21 05:51:31.785113+00', ''),
	('00000000-0000-0000-0000-000000000000', '93dc01b2-9618-46f0-8803-ab98c2d6d93d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.singh@tapasyavp.edu.in","user_id":"1b65e458-d4fe-4bac-92ce-6853f0fd31c9","user_phone":""}}', '2025-09-21 05:51:32.044986+00', ''),
	('00000000-0000-0000-0000-000000000000', '97fec944-247a-439c-a8a6-e293ded54605', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.rao@tapasyavp.edu.in","user_id":"23baaec2-ed42-47c0-83b1-66781dd0764d","user_phone":""}}', '2025-09-21 05:51:32.281865+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a161b47-0eb2-48f4-a9f2-2fb5bbdaaffa', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.nair@tapasyavp.edu.in","user_id":"293525d6-cd67-4f05-b800-89ad14d0cc13","user_phone":""}}', '2025-09-21 05:51:32.530718+00', ''),
	('00000000-0000-0000-0000-000000000000', '89f71a26-acc1-4f20-bffe-114374196e43', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.iyer@tapasyavp.edu.in","user_id":"cd24f8eb-6429-4541-ae75-4cf7e38b2483","user_phone":""}}', '2025-09-21 05:51:32.760066+00', ''),
	('00000000-0000-0000-0000-000000000000', '60d25ee4-4c48-43f6-8090-e601e3d174a4', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aarav.sharma@tapasyavp.edu.in","user_id":"6a41e5c9-14fd-46fd-afc2-7c0fbf465c22","user_phone":""}}', '2025-09-21 05:51:33.132899+00', ''),
	('00000000-0000-0000-0000-000000000000', '99d4aaab-fd03-4ced-b547-b4771d3968b8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.diya.patel@tapasyavp.edu.in","user_id":"da9b4e94-755e-41aa-af2c-915d3cc20611","user_phone":""}}', '2025-09-21 05:51:33.459777+00', ''),
	('00000000-0000-0000-0000-000000000000', '9df866f6-25d4-4744-824e-a1e36c34333b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.rohan.kumar@tapasyavp.edu.in","user_id":"3131565b-0d92-4ffb-bbfd-477c6f6c7635","user_phone":""}}', '2025-09-21 05:51:33.753475+00', ''),
	('00000000-0000-0000-0000-000000000000', '009351c7-f350-42cb-a153-3960447632e7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.priya.singh@tapasyavp.edu.in","user_id":"ca1a715c-fe4d-4fbd-964a-292e031ba2a4","user_phone":""}}', '2025-09-21 05:51:34.162748+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a21c8a8b-40c7-4d88-9f7e-a86603d690bd', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aditya.verma@tapasyavp.edu.in","user_id":"ffd968d2-a8fe-4038-b10f-2b56346abe82","user_phone":""}}', '2025-09-21 05:51:34.462043+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd407f4fe-906e-4a8f-a48f-8ca86e402d07', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ananya.gupta@tapasyavp.edu.in","user_id":"a710dedc-b6d6-4f2b-9654-32109469b23c","user_phone":""}}', '2025-09-21 05:51:34.73385+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aae21267-dd27-4473-a9e9-18d98eb8de88', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vihaan.reddy@tapasyavp.edu.in","user_id":"b1a053de-bd7a-40eb-a83d-fa1b8908bebb","user_phone":""}}', '2025-09-21 05:51:35.018644+00', ''),
	('00000000-0000-0000-0000-000000000000', '9cac1014-53e0-4ec3-83fd-61754c84f85d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ishita.nair@tapasyavp.edu.in","user_id":"25ccc1e3-4e81-4fc6-bb13-693e58e67627","user_phone":""}}', '2025-09-21 05:51:35.391569+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0f6216c-5f6d-45c0-b274-640262383ec3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.arjun.menon@tapasyavp.edu.in","user_id":"5ed406f3-d75b-4970-b31e-bfe3a85fb7aa","user_phone":""}}', '2025-09-21 05:51:35.707527+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb5ad6a5-ab79-4092-a3c7-88891eca1873', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.saanvi.joshi@tapasyavp.edu.in","user_id":"da0026fd-e437-4fae-85df-896a14d5e083","user_phone":""}}', '2025-09-21 05:51:35.971982+00', ''),
	('00000000-0000-0000-0000-000000000000', '39f15d2a-129b-4498-b2d9-ad763cbec42f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.kabir.shah@tapasyavp.edu.in","user_id":"26f5f3f5-d334-4af6-ac70-55bb043314d8","user_phone":""}}', '2025-09-21 05:51:36.24188+00', ''),
	('00000000-0000-0000-0000-000000000000', '0a3222e3-f400-4144-b6f5-0b7a03e19aaa', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.myra.mishra@tapasyavp.edu.in","user_id":"8388fe61-7a7f-4c0b-b9fb-680c004d9308","user_phone":""}}', '2025-09-21 05:51:36.637238+00', ''),
	('00000000-0000-0000-0000-000000000000', '49eb5793-ee17-4c84-8e49-2ad41fb0568c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vivaan.rao@tapasyavp.edu.in","user_id":"210b4388-9eee-41cc-8cf2-5d4db6d0b469","user_phone":""}}', '2025-09-21 05:51:36.928379+00', ''),
	('00000000-0000-0000-0000-000000000000', '051242d9-38d6-4e7e-ae4a-19545f854ab6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.zara.khan@tapasyavp.edu.in","user_id":"28ad06ae-f2db-4c76-bbde-994746d966af","user_phone":""}}', '2025-09-21 05:51:37.282907+00', ''),
	('00000000-0000-0000-0000-000000000000', '1de258c6-4378-45bd-a998-9caa88142666', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aryan.iyer@tapasyavp.edu.in","user_id":"fc71588c-e37d-4582-b7ba-6b2095cf5f98","user_phone":""}}', '2025-09-21 05:51:37.716742+00', ''),
	('00000000-0000-0000-0000-000000000000', '07caeb72-6dac-4f17-9c06-4665d9ffc68d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.avni.pillai@tapasyavp.edu.in","user_id":"78b4b776-aa6d-4aa0-ae18-e04a8fa36b3a","user_phone":""}}', '2025-09-21 05:51:38.106008+00', ''),
	('00000000-0000-0000-0000-000000000000', '14113c13-e8b8-49c3-a4a5-72fa74ad4544', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.reyansh.shetty@tapasyavp.edu.in","user_id":"5eb42a53-05a8-4e58-9b8c-4a6adae52741","user_phone":""}}', '2025-09-21 05:51:38.435776+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4892c67-3d57-4b35-aedf-54bf584e6e42', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.anika.agarwal@tapasyavp.edu.in","user_id":"bd33298e-e6b8-482a-94dc-bf51589d5d0b","user_phone":""}}', '2025-09-21 05:51:38.844084+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd35c6299-a79b-48de-bc70-234b56dc04f0', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.krishna.murthy@tapasyavp.edu.in","user_id":"6c4ea37f-bbd9-40fc-ae93-beeaf13245ba","user_phone":""}}', '2025-09-21 05:51:39.178785+00', ''),
	('00000000-0000-0000-0000-000000000000', '8088c98a-8d20-45ab-8831-8e742776e159', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aadhya.das@tapasyavp.edu.in","user_id":"4b450e1f-99c6-45dc-b779-45dcb3ff3209","user_phone":""}}', '2025-09-21 05:51:39.45945+00', ''),
	('00000000-0000-0000-0000-000000000000', 'baaf64c7-43b2-42fb-a164-b76aa6ab28fe', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.suresh.sharma@tapasyavp.edu.in","user_id":"5063563b-e796-48f6-819b-a14c569cf69b","user_phone":""}}', '2025-09-21 05:51:39.820731+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc3f0254-973e-4c15-be26-998745b43729', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rina.sharma@tapasyavp.edu.in","user_id":"60717299-9aad-48de-8848-9b442c7726d3","user_phone":""}}', '2025-09-21 05:51:40.020722+00', ''),
	('00000000-0000-0000-0000-000000000000', '04b8f9db-9cf2-46db-a01e-d64216f09a5f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.hitesh.patel@tapasyavp.edu.in","user_id":"6bdbefcb-4cd8-4f1c-b20a-2ee4aebfdd52","user_phone":""}}', '2025-09-21 05:51:40.229092+00', ''),
	('00000000-0000-0000-0000-000000000000', '04574444-6180-4ae4-8df4-d67e1a0820ee', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.pooja.patel@tapasyavp.edu.in","user_id":"18d9ee47-f978-445f-b8a6-10ccb5b53eeb","user_phone":""}}', '2025-09-21 05:51:40.431988+00', ''),
	('00000000-0000-0000-0000-000000000000', '5fa3e6c0-4060-4e44-a598-35e709458cb2', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.manoj.kumar@tapasyavp.edu.in","user_id":"627ad4dc-95d2-4623-8a70-2c9cd6b071a4","user_phone":""}}', '2025-09-21 05:51:40.658421+00', ''),
	('00000000-0000-0000-0000-000000000000', '3bd2cb73-92ef-4a54-bc92-b3e674036735', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.geeta.singh@tapasyavp.edu.in","user_id":"7d12b2b1-1108-4143-8af1-9bc7ea5584bb","user_phone":""}}', '2025-09-21 05:51:41.006628+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d8da20b-34ab-4281-8229-209444c4bafa', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.nitin.verma@tapasyavp.edu.in","user_id":"939c233c-8f8b-47b4-b1c3-7b6825f4be13","user_phone":""}}', '2025-09-21 05:51:41.238984+00', ''),
	('00000000-0000-0000-0000-000000000000', '0112de53-d44e-4133-86ac-96c881e95916', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.deepika.verma@tapasyavp.edu.in","user_id":"5667673b-d28e-4c91-9519-cf4412b752e3","user_phone":""}}', '2025-09-21 05:51:41.458037+00', ''),
	('00000000-0000-0000-0000-000000000000', '33c330d0-e105-42c4-98ca-7ea41c8ebea3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.alok.gupta@tapasyavp.edu.in","user_id":"7bfcedbb-bab9-4376-9efd-14d4900291df","user_phone":""}}', '2025-09-21 05:51:41.727039+00', ''),
	('00000000-0000-0000-0000-000000000000', '97c9b0c6-5b6f-4d47-85fd-645d2f49e0f7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.vikram.reddy@tapasyavp.edu.in","user_id":"31e617a7-cc62-4f95-9f08-a1bb2655c462","user_phone":""}}', '2025-09-21 05:51:42.071771+00', ''),
	('00000000-0000-0000-0000-000000000000', '427f0203-ac30-4cf7-9caf-f7baa26e4e84', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.lakshmi.reddy@tapasyavp.edu.in","user_id":"b7e028c3-dce6-4120-b9bf-d0141d4eb0f2","user_phone":""}}', '2025-09-21 05:51:42.281848+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dc06d56a-a38a-4a76-abd3-afd8e5e2dbcb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rajesh.nair@tapasyavp.edu.in","user_id":"40b3793b-a58d-4f7d-9c3f-d7434edc4a01","user_phone":""}}', '2025-09-21 05:51:42.554553+00', ''),
	('00000000-0000-0000-0000-000000000000', '83908a47-5efc-4ee2-bb8b-19688885d88f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anjali.menon@tapasyavp.edu.in","user_id":"6f2e4ea2-adbb-4f79-b0aa-95a4a694fec2","user_phone":""}}', '2025-09-21 05:51:42.802531+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd88d2dfd-c088-4f60-a7ca-17f6729513d3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anil.joshi@tapasyavp.edu.in","user_id":"23ecfabf-7402-429d-923f-c2e191f725ad","user_phone":""}}', '2025-09-21 05:51:43.037548+00', ''),
	('00000000-0000-0000-0000-000000000000', '125c84ec-721b-4abb-a1be-bb0524a328dc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.kavya.joshi@tapasyavp.edu.in","user_id":"9dc8a342-1916-4369-8f95-1d8b5181f4e1","user_phone":""}}', '2025-09-21 05:51:43.287036+00', ''),
	('00000000-0000-0000-0000-000000000000', '41ee107e-b21b-4023-b27f-9776de878d1a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"principal.sharma@tapasyavp.edu.in","user_id":"0c852322-1d78-41e8-bcbf-9d3327189665","user_phone":""}}', '2025-09-21 06:05:58.506488+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b45307a5-99f5-4870-bd81-2e9310073aa1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.patel@tapasyavp.edu.in","user_id":"55a08a1f-c9aa-4eaa-94e7-4a63641bd5f5","user_phone":""}}', '2025-09-21 06:05:59.021136+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f20c07c4-8817-4b3b-b558-33ccac15d48c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.gupta@tapasyavp.edu.in","user_id":"463cac92-b885-491c-b6d0-a481d0b88e9b","user_phone":""}}', '2025-09-21 06:05:59.339434+00', ''),
	('00000000-0000-0000-0000-000000000000', '0da00439-b7c8-4f5e-8cec-ec81bd655700', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.kumar@tapasyavp.edu.in","user_id":"50528172-7f24-47b6-a8f7-8b40fedc73b6","user_phone":""}}', '2025-09-21 06:05:59.63859+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d1fc9a4-7669-44ba-bb39-9fd57cb48a95', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.verma@tapasyavp.edu.in","user_id":"4bea54c0-32b7-4e6c-82ac-a069738c493a","user_phone":""}}', '2025-09-21 06:05:59.915173+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ca50b90-a19a-423c-9645-e6e14914aaaf', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.mishra@tapasyavp.edu.in","user_id":"018d2e33-5b52-4d65-87f1-11d17beab132","user_phone":""}}', '2025-09-21 06:06:00.220777+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a637af5f-983c-49d6-beaf-e02bfb584015', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.singh@tapasyavp.edu.in","user_id":"4cf055de-3f73-43a7-9b43-b16d3e1eee05","user_phone":""}}', '2025-09-21 06:06:00.492347+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9942b17-0bac-40c4-a152-4a1287428681', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.rao@tapasyavp.edu.in","user_id":"cefda8f5-9342-4a33-ada5-0c04ea2b9b2a","user_phone":""}}', '2025-09-21 06:06:00.927278+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f14452a6-8abe-426f-a8e4-157f9bfbcfbf', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.nair@tapasyavp.edu.in","user_id":"5b173373-fe7f-4d29-be1a-be2d68411a8b","user_phone":""}}', '2025-09-21 06:06:01.193509+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad8c3378-73f1-483b-86cc-7ba7f9d4b4ce', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.iyer@tapasyavp.edu.in","user_id":"d333b5c5-986c-4b31-b5ce-cd9e870b762b","user_phone":""}}', '2025-09-21 06:06:01.549143+00', ''),
	('00000000-0000-0000-0000-000000000000', '1473a7bd-afd3-4fe5-b3ad-34fc21ede2c9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aarav.sharma@tapasyavp.edu.in","user_id":"ae2c7c44-b8d5-4d5b-a34b-a9945c96793c","user_phone":""}}', '2025-09-21 06:06:01.825939+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d99d234-6670-4568-9f0d-74001bf22293', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.diya.patel@tapasyavp.edu.in","user_id":"3976b317-a687-4a9d-a993-fdd4a52996ec","user_phone":""}}', '2025-09-21 06:06:02.210764+00', ''),
	('00000000-0000-0000-0000-000000000000', '884f42a1-0140-4818-b107-3f540ac2445c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.rohan.kumar@tapasyavp.edu.in","user_id":"6a3c7480-12b1-4608-a83e-b530256fd9ef","user_phone":""}}', '2025-09-21 06:06:02.566718+00', ''),
	('00000000-0000-0000-0000-000000000000', '4174b5b1-b9f0-48ac-ad2f-5b49829177ef', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.priya.singh@tapasyavp.edu.in","user_id":"9f88d782-3a97-4478-9ace-264817f28098","user_phone":""}}', '2025-09-21 06:06:02.953294+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1784c8a-5abb-495d-aa92-a0c66bfd2404', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aditya.verma@tapasyavp.edu.in","user_id":"bb070b19-72f6-4e4f-aba1-860673611d6d","user_phone":""}}', '2025-09-21 06:06:03.357255+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fc572ae-ddfc-4505-a390-9ae6c19eeb82', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ananya.gupta@tapasyavp.edu.in","user_id":"d910492b-f20b-4991-b9cf-729b449ae779","user_phone":""}}', '2025-09-21 06:06:03.694192+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cb033da-3c16-45bf-87fc-c3472e44dfc3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vihaan.reddy@tapasyavp.edu.in","user_id":"80c9c30e-8d24-4e42-a6cf-ef62fad22cc8","user_phone":""}}', '2025-09-21 06:06:03.98998+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c4a41064-f079-4199-90af-66e7e477b3fd', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ishita.nair@tapasyavp.edu.in","user_id":"a5404e61-7d4b-436d-a2c1-e997a2687759","user_phone":""}}', '2025-09-21 06:06:04.261733+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b8ad124b-9b46-445f-8681-8f8ab0a4e930', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.arjun.menon@tapasyavp.edu.in","user_id":"9483227a-468e-402d-8157-a3717b6bd035","user_phone":""}}', '2025-09-21 06:06:04.573319+00', ''),
	('00000000-0000-0000-0000-000000000000', '73a36498-c1a4-4325-b741-c3a9a266038a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.saanvi.joshi@tapasyavp.edu.in","user_id":"1155dc41-bdc6-4f32-848f-a3c5c9509602","user_phone":""}}', '2025-09-21 06:06:04.865988+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1f00527-c11a-438b-989e-97c1e5d78de2', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.kabir.shah@tapasyavp.edu.in","user_id":"e6e83f42-d6aa-4a2e-b341-a13de5e60984","user_phone":""}}', '2025-09-21 06:06:05.180264+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cbb47dbb-76b9-4270-94e1-3305cac7d0c7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.myra.mishra@tapasyavp.edu.in","user_id":"e86c035c-ea1a-4c17-aef8-72fc1080c379","user_phone":""}}', '2025-09-21 06:06:05.631461+00', ''),
	('00000000-0000-0000-0000-000000000000', '0831cc03-fe21-4cd7-8f39-9cc5b239adcd', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vivaan.rao@tapasyavp.edu.in","user_id":"1bd6c433-c89c-42a7-bc8b-d8ac6aa772b6","user_phone":""}}', '2025-09-21 06:06:05.941676+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea3f1e7d-62d7-4bbb-addb-acc036e2a307', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.zara.khan@tapasyavp.edu.in","user_id":"2f7b20e5-c23d-4f41-ad0d-6f987097abfa","user_phone":""}}', '2025-09-21 06:06:06.228217+00', ''),
	('00000000-0000-0000-0000-000000000000', '32979d94-ad25-4a9e-ad50-b21e838c3256', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aryan.iyer@tapasyavp.edu.in","user_id":"c5bdbbb2-4593-4af4-aa0d-c8344188eb86","user_phone":""}}', '2025-09-21 06:06:06.701795+00', ''),
	('00000000-0000-0000-0000-000000000000', '6da712d8-a3a5-4d16-9709-23749c27eb8e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.avni.pillai@tapasyavp.edu.in","user_id":"37116632-8340-4851-b6f2-303acb3cef25","user_phone":""}}', '2025-09-21 06:06:07.077444+00', ''),
	('00000000-0000-0000-0000-000000000000', '79a0e4cd-6088-458f-9ece-dbe9a91b0cdc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.reyansh.shetty@tapasyavp.edu.in","user_id":"990cf284-2986-403b-8610-40170ac2f4ba","user_phone":""}}', '2025-09-21 06:06:07.363971+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c716b8b-58aa-4f8a-8cc9-e74b4ad533e7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.anika.agarwal@tapasyavp.edu.in","user_id":"dae851e6-5ea3-46e7-8856-e4f92bc126f1","user_phone":""}}', '2025-09-21 06:06:07.619153+00', ''),
	('00000000-0000-0000-0000-000000000000', '674b180a-8c81-4da2-90fc-11c2be22847d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.krishna.murthy@tapasyavp.edu.in","user_id":"400b9a96-a5c8-49a4-b660-4f803b5385f0","user_phone":""}}', '2025-09-21 06:06:07.974344+00', ''),
	('00000000-0000-0000-0000-000000000000', '6adb4ca1-56a5-4e98-83d3-bc32f20032e7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aadhya.das@tapasyavp.edu.in","user_id":"dc3baa9c-4150-4b52-be09-41db1c4f2eaf","user_phone":""}}', '2025-09-21 06:06:08.306453+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9ecc770-bdfd-44a1-9210-220b1370c92e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.suresh.sharma@tapasyavp.edu.in","user_id":"bfe2d613-2142-4b4d-abde-8066bed6cc7a","user_phone":""}}', '2025-09-21 06:06:08.626634+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c4768797-0e21-4a38-9f47-d07a63bb5b67', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rina.sharma@tapasyavp.edu.in","user_id":"b9175662-b5a1-4239-a6e1-78fea76a27f0","user_phone":""}}', '2025-09-21 06:06:08.870225+00', ''),
	('00000000-0000-0000-0000-000000000000', '88806400-5c15-4028-978b-31fa9de59673', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.hitesh.patel@tapasyavp.edu.in","user_id":"414b6120-b477-4c03-bcec-ea92b62a418e","user_phone":""}}', '2025-09-21 06:06:09.122195+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec1cb10b-a4fe-41c5-9131-a27125ef5cf5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.pooja.patel@tapasyavp.edu.in","user_id":"61f14139-e623-44f9-9428-48e441fdbc2e","user_phone":""}}', '2025-09-21 06:06:09.361875+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b4f7232-d077-42dd-831c-f5d875a69a5f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.manoj.kumar@tapasyavp.edu.in","user_id":"3ab510d8-01e3-4929-bca5-8ca82509ab9a","user_phone":""}}', '2025-09-21 06:06:09.690784+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cbaf204e-c9df-490c-befd-3271be45b10d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.geeta.singh@tapasyavp.edu.in","user_id":"967a8fa6-29b2-47ac-841c-0c83e368e9bc","user_phone":""}}', '2025-09-21 06:06:09.918378+00', ''),
	('00000000-0000-0000-0000-000000000000', '75a1f51d-5365-418d-910e-f4b92c9b9ee3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.nitin.verma@tapasyavp.edu.in","user_id":"00dc8446-7631-4692-a114-ec47946f1cce","user_phone":""}}', '2025-09-21 06:06:10.18979+00', ''),
	('00000000-0000-0000-0000-000000000000', '978277da-93c3-4b7c-96ac-c0b2ec820a2e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.deepika.verma@tapasyavp.edu.in","user_id":"13281fbe-4069-47af-9cdf-f0443ffd73a0","user_phone":""}}', '2025-09-21 06:06:10.43154+00', ''),
	('00000000-0000-0000-0000-000000000000', '95cdef25-3e0c-4cb6-9816-968448b12473', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.alok.gupta@tapasyavp.edu.in","user_id":"ca386a00-7dd4-4d0c-b01a-b541c7d45816","user_phone":""}}', '2025-09-21 06:06:10.657583+00', ''),
	('00000000-0000-0000-0000-000000000000', '24243c0b-1db5-4f34-8e38-c181de55284e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.vikram.reddy@tapasyavp.edu.in","user_id":"ffe8ea50-7780-402e-9249-18448468629d","user_phone":""}}', '2025-09-21 06:06:10.896894+00', ''),
	('00000000-0000-0000-0000-000000000000', '121a6684-940b-4171-81b8-9630ab239e17', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.lakshmi.reddy@tapasyavp.edu.in","user_id":"fa1c999f-6810-4901-9191-4b6873359eb3","user_phone":""}}', '2025-09-21 06:06:11.195405+00', ''),
	('00000000-0000-0000-0000-000000000000', '92ea6981-e7fd-44bc-aa4a-6e522ff43bf5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rajesh.nair@tapasyavp.edu.in","user_id":"b76cbcbc-1131-4c44-81d0-29fe4c85977d","user_phone":""}}', '2025-09-21 06:06:11.420005+00', ''),
	('00000000-0000-0000-0000-000000000000', '907bf12e-0e75-4026-8274-ffb0b848c01a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anjali.menon@tapasyavp.edu.in","user_id":"f6c3ad4c-5699-4a61-9b4d-2f0690cfe3e0","user_phone":""}}', '2025-09-21 06:06:11.67681+00', ''),
	('00000000-0000-0000-0000-000000000000', '398914ac-ec06-4633-957c-020f6fc70f90', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anil.joshi@tapasyavp.edu.in","user_id":"73873ed6-66cc-4cbc-a76a-b20b8bc7b6d7","user_phone":""}}', '2025-09-21 06:06:11.937528+00', ''),
	('00000000-0000-0000-0000-000000000000', '59bab867-eecd-4c4a-9415-7e769e38f2ec', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.kavya.joshi@tapasyavp.edu.in","user_id":"d8260b94-8fd7-4b9d-aba1-7a56f84aad73","user_phone":""}}', '2025-09-21 06:06:12.200739+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c12cdd7-e603-4c48-917a-445eb4cebd01', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.rajesh.nair@tapasyavp.edu.in","user_id":"b76cbcbc-1131-4c44-81d0-29fe4c85977d","user_phone":""}}', '2025-09-22 18:10:22.589705+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fd16b92-60d3-4a42-bd2f-e6061e62f36b', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.kumar@tapasyavp.edu.in","user_id":"50528172-7f24-47b6-a8f7-8b40fedc73b6","user_phone":""}}', '2025-09-22 18:10:22.600528+00', ''),
	('00000000-0000-0000-0000-000000000000', '06696393-45be-4056-9552-5fffd99a8fd5', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.anjali.menon@tapasyavp.edu.in","user_id":"f6c3ad4c-5699-4a61-9b4d-2f0690cfe3e0","user_phone":""}}', '2025-09-22 18:10:22.608697+00', ''),
	('00000000-0000-0000-0000-000000000000', '78418867-58c9-4ce1-9477-5b078d30e59d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.lakshmi.reddy@tapasyavp.edu.in","user_id":"fa1c999f-6810-4901-9191-4b6873359eb3","user_phone":""}}', '2025-09-22 18:10:22.63132+00', ''),
	('00000000-0000-0000-0000-000000000000', '8a40a9eb-52ea-4235-b4cb-242ec99cec7b', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.anil.joshi@tapasyavp.edu.in","user_id":"73873ed6-66cc-4cbc-a76a-b20b8bc7b6d7","user_phone":""}}', '2025-09-22 18:10:22.637782+00', ''),
	('00000000-0000-0000-0000-000000000000', '35a603c1-f26b-41d7-94bf-9c201b3eaf82', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.diya.patel@tapasyavp.edu.in","user_id":"3976b317-a687-4a9d-a993-fdd4a52996ec","user_phone":""}}', '2025-09-22 18:10:22.664084+00', ''),
	('00000000-0000-0000-0000-000000000000', '06a2dad6-1180-40c9-96d2-b9030edcf6b5', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"principal.sharma@tapasyavp.edu.in","user_id":"0c852322-1d78-41e8-bcbf-9d3327189665","user_phone":""}}', '2025-09-22 18:10:22.667972+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ad10d82-def9-4e84-a81f-4b50be3faea6', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.patel@tapasyavp.edu.in","user_id":"55a08a1f-c9aa-4eaa-94e7-4a63641bd5f5","user_phone":""}}', '2025-09-22 18:10:22.676975+00', ''),
	('00000000-0000-0000-0000-000000000000', '9825dc41-7ffc-49a8-88d6-5d584bba2fb7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.singh@tapasyavp.edu.in","user_id":"4cf055de-3f73-43a7-9b43-b16d3e1eee05","user_phone":""}}', '2025-09-22 18:10:22.68084+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b4c617e-8c9a-4708-8dd2-efccc93d5e6a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.iyer@tapasyavp.edu.in","user_id":"d333b5c5-986c-4b31-b5ce-cd9e870b762b","user_phone":""}}', '2025-09-22 18:10:22.684357+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3046b77-bfd2-4b31-b74e-32d796ad2041', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.mishra@tapasyavp.edu.in","user_id":"018d2e33-5b52-4d65-87f1-11d17beab132","user_phone":""}}', '2025-09-22 18:10:22.690143+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd2dd324-dea9-435b-b406-124b673e3c9e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.vikram.reddy@tapasyavp.edu.in","user_id":"ffe8ea50-7780-402e-9249-18448468629d","user_phone":""}}', '2025-09-22 18:10:22.695031+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e666f921-4c9d-4ddf-9f0b-e607f093ef9f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.nair@tapasyavp.edu.in","user_id":"5b173373-fe7f-4d29-be1a-be2d68411a8b","user_phone":""}}', '2025-09-22 18:10:22.708831+00', ''),
	('00000000-0000-0000-0000-000000000000', '1e9abc82-e8ab-4e57-8d56-b53e3e22bef3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.gupta@tapasyavp.edu.in","user_id":"463cac92-b885-491c-b6d0-a481d0b88e9b","user_phone":""}}', '2025-09-22 18:10:22.712626+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b6b57a6-f66c-40ce-ad07-fc9522c2acc3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.rohan.kumar@tapasyavp.edu.in","user_id":"6a3c7480-12b1-4608-a83e-b530256fd9ef","user_phone":""}}', '2025-09-22 18:10:22.715522+00', ''),
	('00000000-0000-0000-0000-000000000000', '22af377d-9343-4b53-bbcc-1b9e7da260db', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.kavya.joshi@tapasyavp.edu.in","user_id":"d8260b94-8fd7-4b9d-aba1-7a56f84aad73","user_phone":""}}', '2025-09-22 18:10:22.721294+00', ''),
	('00000000-0000-0000-0000-000000000000', '28e216a7-44c3-4e22-9a7b-247c7da262df', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.verma@tapasyavp.edu.in","user_id":"4bea54c0-32b7-4e6c-82ac-a069738c493a","user_phone":""}}', '2025-09-22 18:10:22.725343+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e320e11c-c45e-4c0d-8f04-3e921a5ec28f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.rao@tapasyavp.edu.in","user_id":"cefda8f5-9342-4a33-ada5-0c04ea2b9b2a","user_phone":""}}', '2025-09-22 18:10:22.730363+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b32c695d-d844-4b41-ae2d-cc0514acb717', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.priya.singh@tapasyavp.edu.in","user_id":"9f88d782-3a97-4478-9ace-264817f28098","user_phone":""}}', '2025-09-22 18:10:22.732964+00', ''),
	('00000000-0000-0000-0000-000000000000', '5cdc1f8e-e95a-4150-8e38-44ee833f4bad', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aarav.sharma@tapasyavp.edu.in","user_id":"ae2c7c44-b8d5-4d5b-a34b-a9945c96793c","user_phone":""}}', '2025-09-22 18:10:22.995637+00', ''),
	('00000000-0000-0000-0000-000000000000', '3bfad02c-0a8f-4470-ab8f-d842adc24eca', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.kabir.shah@tapasyavp.edu.in","user_id":"e6e83f42-d6aa-4a2e-b341-a13de5e60984","user_phone":""}}', '2025-09-22 18:10:44.776923+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e2ee961f-babc-42dc-9072-faae92737490', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.ishita.nair@tapasyavp.edu.in","user_id":"a5404e61-7d4b-436d-a2c1-e997a2687759","user_phone":""}}', '2025-09-22 18:10:44.779429+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e56c8762-d92c-483e-bd91-62183fba684e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.zara.khan@tapasyavp.edu.in","user_id":"2f7b20e5-c23d-4f41-ad0d-6f987097abfa","user_phone":""}}', '2025-09-22 18:10:44.815544+00', ''),
	('00000000-0000-0000-0000-000000000000', '9cb58b3b-eeb0-4b34-b806-45749dc90405', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.avni.pillai@tapasyavp.edu.in","user_id":"37116632-8340-4851-b6f2-303acb3cef25","user_phone":""}}', '2025-09-22 18:10:44.815803+00', ''),
	('00000000-0000-0000-0000-000000000000', '64415309-ed3d-46ea-a4d5-e9f42f5b7f90', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.suresh.sharma@tapasyavp.edu.in","user_id":"bfe2d613-2142-4b4d-abde-8066bed6cc7a","user_phone":""}}', '2025-09-22 18:10:44.830507+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eaf8e88a-1563-4777-9bd8-0fd1a1c01745', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aditya.verma@tapasyavp.edu.in","user_id":"bb070b19-72f6-4e4f-aba1-860673611d6d","user_phone":""}}', '2025-09-22 18:10:44.896534+00', ''),
	('00000000-0000-0000-0000-000000000000', '478e186b-1a8f-40f3-8b4a-905cc1ee541c', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.myra.mishra@tapasyavp.edu.in","user_id":"e86c035c-ea1a-4c17-aef8-72fc1080c379","user_phone":""}}', '2025-09-22 18:10:44.900546+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db56d2d9-5f17-4efa-a16d-fa67fad19c5c', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aadhya.das@tapasyavp.edu.in","user_id":"dc3baa9c-4150-4b52-be09-41db1c4f2eaf","user_phone":""}}', '2025-09-22 18:10:44.918918+00', ''),
	('00000000-0000-0000-0000-000000000000', '076613cf-483f-4357-a5be-8f132ce48efa', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.ananya.gupta@tapasyavp.edu.in","user_id":"d910492b-f20b-4991-b9cf-729b449ae779","user_phone":""}}', '2025-09-22 18:10:44.922882+00', ''),
	('00000000-0000-0000-0000-000000000000', '1bf18c2c-fce1-404d-875c-0484011ce4c9', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.vihaan.reddy@tapasyavp.edu.in","user_id":"80c9c30e-8d24-4e42-a6cf-ef62fad22cc8","user_phone":""}}', '2025-09-22 18:10:44.931795+00', ''),
	('00000000-0000-0000-0000-000000000000', '0abb9a76-7eaa-4fb2-a645-f18fa43ed251', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.vivaan.rao@tapasyavp.edu.in","user_id":"1bd6c433-c89c-42a7-bc8b-d8ac6aa772b6","user_phone":""}}', '2025-09-22 18:10:44.920006+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1ab1e27-1d85-4ee1-9398-3a36498bca9f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aryan.iyer@tapasyavp.edu.in","user_id":"c5bdbbb2-4593-4af4-aa0d-c8344188eb86","user_phone":""}}', '2025-09-22 18:10:44.93007+00', ''),
	('00000000-0000-0000-0000-000000000000', '3fedd401-88b1-47ad-b412-3b65ad634425', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.krishna.murthy@tapasyavp.edu.in","user_id":"400b9a96-a5c8-49a4-b660-4f803b5385f0","user_phone":""}}', '2025-09-22 18:10:44.93964+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b40b5044-f880-4fd8-addf-a8a75c91db2e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.rina.sharma@tapasyavp.edu.in","user_id":"b9175662-b5a1-4239-a6e1-78fea76a27f0","user_phone":""}}', '2025-09-22 18:10:44.951697+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f2d1761a-2e93-4873-a49a-0600f9df74ad', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.reyansh.shetty@tapasyavp.edu.in","user_id":"990cf284-2986-403b-8610-40170ac2f4ba","user_phone":""}}', '2025-09-22 18:10:44.925015+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1c97ea5-e51c-4d6e-8c34-39719ef60704', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.hitesh.patel@tapasyavp.edu.in","user_id":"414b6120-b477-4c03-bcec-ea92b62a418e","user_phone":""}}', '2025-09-22 18:10:44.936557+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e18db4ff-1771-4ade-befa-d408bf0273c3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.arjun.menon@tapasyavp.edu.in","user_id":"9483227a-468e-402d-8157-a3717b6bd035","user_phone":""}}', '2025-09-22 18:10:44.951242+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e989a6c4-4446-46d8-84f2-31fe469de225', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.saanvi.joshi@tapasyavp.edu.in","user_id":"1155dc41-bdc6-4f32-848f-a3c5c9509602","user_phone":""}}', '2025-09-22 18:10:44.932357+00', ''),
	('00000000-0000-0000-0000-000000000000', '85c6d1c2-f0a5-4048-939a-b5fa251c49cc', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.anika.agarwal@tapasyavp.edu.in","user_id":"dae851e6-5ea3-46e7-8856-e4f92bc126f1","user_phone":""}}', '2025-09-22 18:10:44.954314+00', ''),
	('00000000-0000-0000-0000-000000000000', '779f6e20-6eda-4f7a-9f32-7cf7e9362ca8', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.pooja.patel@tapasyavp.edu.in","user_id":"61f14139-e623-44f9-9428-48e441fdbc2e","user_phone":""}}', '2025-09-22 18:10:44.954457+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f0ec39c-a8c5-4677-b402-2181990bee05', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.manoj.kumar@tapasyavp.edu.in","user_id":"3ab510d8-01e3-4929-bca5-8ca82509ab9a","user_phone":""}}', '2025-09-22 18:10:50.74649+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cac05eb0-b8c8-44fa-a85e-c13c999131ce', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.deepika.verma@tapasyavp.edu.in","user_id":"13281fbe-4069-47af-9cdf-f0443ffd73a0","user_phone":""}}', '2025-09-22 18:10:50.867695+00', ''),
	('00000000-0000-0000-0000-000000000000', '623b0dd3-72b6-45f5-895b-f8fab15243aa', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.nitin.verma@tapasyavp.edu.in","user_id":"00dc8446-7631-4692-a114-ec47946f1cce","user_phone":""}}', '2025-09-22 18:10:50.873093+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd5b058b-18c8-423d-b065-970a8692c1f8', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.geeta.singh@tapasyavp.edu.in","user_id":"967a8fa6-29b2-47ac-841c-0c83e368e9bc","user_phone":""}}', '2025-09-22 18:10:50.875186+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd559c1bd-f567-4b93-92db-f299ab10f69e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.alok.gupta@tapasyavp.edu.in","user_id":"ca386a00-7dd4-4d0c-b01a-b541c7d45816","user_phone":""}}', '2025-09-22 18:10:50.893734+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fcd1f1d4-4ab4-452a-a003-ffd30a8c6ebc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"principal.sharma@tapasyavp.edu.in","user_id":"687048d5-5618-44a1-9346-b11bb7aedd8b","user_phone":""}}', '2025-09-22 18:14:32.11612+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3978737-7f72-4a71-8ef1-098d291e7bf9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.patel@tapasyavp.edu.in","user_id":"4f139f53-19c8-4997-9b64-9628ba4e7517","user_phone":""}}', '2025-09-22 18:14:33.27877+00', ''),
	('00000000-0000-0000-0000-000000000000', '8a498cdf-bc1a-4877-bb92-46c9014fed26', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.gupta@tapasyavp.edu.in","user_id":"f5a206f1-22c4-443d-8438-26924135b557","user_phone":""}}', '2025-09-22 18:14:33.627426+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c1132a9-8f0a-4ccc-b200-de175d255029', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.kumar@tapasyavp.edu.in","user_id":"a0c32336-f40c-4ec9-889f-c9e9f39792fa","user_phone":""}}', '2025-09-22 18:14:33.992097+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ffa1209-db35-4380-984f-c000a646cc9f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.verma@tapasyavp.edu.in","user_id":"052eb263-2d20-4e76-8f79-2d88ed603d01","user_phone":""}}', '2025-09-22 18:14:34.313313+00', ''),
	('00000000-0000-0000-0000-000000000000', '179ea722-8b8d-44a3-81b7-4775bb653617', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.mishra@tapasyavp.edu.in","user_id":"562d4754-ec2e-457b-9af6-5ca842018e14","user_phone":""}}', '2025-09-22 18:14:34.633557+00', ''),
	('00000000-0000-0000-0000-000000000000', '9410bba9-da84-4303-8ef0-60a1edc2baf1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.singh@tapasyavp.edu.in","user_id":"a06aeb7d-dffa-49ed-a28a-9034ca97902a","user_phone":""}}', '2025-09-22 18:14:34.917836+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c0764c5-579a-448b-95fe-d8b2d29e56e1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.rao@tapasyavp.edu.in","user_id":"68351320-3274-45ac-925e-d38c184cb4ba","user_phone":""}}', '2025-09-22 18:14:35.247743+00', ''),
	('00000000-0000-0000-0000-000000000000', '541abc23-75f0-4565-8411-090df9058831', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.nair@tapasyavp.edu.in","user_id":"41c53899-dfed-48b8-b7ed-bf2c9fd0f69f","user_phone":""}}', '2025-09-22 18:14:35.62137+00', ''),
	('00000000-0000-0000-0000-000000000000', '769b40c7-d75b-402e-a614-334f9020f6e2', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.iyer@tapasyavp.edu.in","user_id":"95c8d375-1586-41c3-9427-cbc0f7c00be6","user_phone":""}}', '2025-09-22 18:14:35.911505+00', ''),
	('00000000-0000-0000-0000-000000000000', '69dcc4ba-30bb-4598-8ceb-c3624b884126', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aarav.sharma@tapasyavp.edu.in","user_id":"f28b1aae-297f-4649-9154-aec2e4a42181","user_phone":""}}', '2025-09-22 18:14:36.235693+00', ''),
	('00000000-0000-0000-0000-000000000000', '1191e20e-ea7d-485d-a5bb-b0b7c1973d1d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.diya.patel@tapasyavp.edu.in","user_id":"d91f9164-c681-44d2-afeb-b41926c0c08d","user_phone":""}}', '2025-09-22 18:14:36.601943+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f6f8060-5bd8-4f1d-b59f-7bfc7dc86a9b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.rohan.kumar@tapasyavp.edu.in","user_id":"f94e486f-e704-4888-8c97-7a59dd06f77b","user_phone":""}}', '2025-09-22 18:14:36.897144+00', ''),
	('00000000-0000-0000-0000-000000000000', '441b367a-2e59-4fc6-935a-b49427177f85', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.priya.singh@tapasyavp.edu.in","user_id":"24f3b93d-3591-4fcc-a311-c7c6ae87c270","user_phone":""}}', '2025-09-22 18:14:37.275897+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c62c7f8-5ba6-402e-af01-e83af92c6737', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aditya.verma@tapasyavp.edu.in","user_id":"ccf16e64-c7f5-4624-9fe9-ac565de0b01a","user_phone":""}}', '2025-09-22 18:14:37.649428+00', ''),
	('00000000-0000-0000-0000-000000000000', '46e366a2-7426-4637-a3e6-fe735ffa44f5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ananya.gupta@tapasyavp.edu.in","user_id":"3a70e4b4-369f-4500-969b-424c4e4ae28f","user_phone":""}}', '2025-09-22 18:14:37.914657+00', ''),
	('00000000-0000-0000-0000-000000000000', '5f437dcb-4e07-4e87-a4ea-a91787a714ce', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vihaan.reddy@tapasyavp.edu.in","user_id":"bc44a3dd-35b0-4b27-b080-4858b492c835","user_phone":""}}', '2025-09-22 18:14:38.2222+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb207431-9ceb-4e86-8136-4dace2da2192', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ishita.nair@tapasyavp.edu.in","user_id":"5fb766ba-5e52-4d8b-a92d-80616decea5a","user_phone":""}}', '2025-09-22 18:14:38.488153+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f3be616-f86d-4501-a09b-ae4db4e180c7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.arjun.menon@tapasyavp.edu.in","user_id":"7624d12c-bfe1-45c9-b0dd-94ab18988fc5","user_phone":""}}', '2025-09-22 18:14:38.815033+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd898ff9c-e6d9-4d58-90b8-a0de8799560c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.saanvi.joshi@tapasyavp.edu.in","user_id":"f8bd6b88-3fb1-4ead-801e-d477d1efca46","user_phone":""}}', '2025-09-22 18:14:39.082138+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e53b43a-2070-4336-a67c-ee959d784fd6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.kabir.shah@tapasyavp.edu.in","user_id":"1d8d91e4-992b-451d-b78f-604a49fd9643","user_phone":""}}', '2025-09-22 18:14:39.343213+00', ''),
	('00000000-0000-0000-0000-000000000000', 'df29d10f-f2dd-4ad4-94ed-9194bcb01f86', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.myra.mishra@tapasyavp.edu.in","user_id":"a9897273-8003-46d9-b002-555f24a1cd54","user_phone":""}}', '2025-09-22 18:14:39.626747+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a26b6614-119e-41e7-9f3f-8b9f3d262532', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vivaan.rao@tapasyavp.edu.in","user_id":"6c78f298-2682-4101-b54f-05ca3186eba3","user_phone":""}}', '2025-09-22 18:14:39.888455+00', ''),
	('00000000-0000-0000-0000-000000000000', '0549823f-045b-4171-99dd-89c8f1e026ca', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.zara.khan@tapasyavp.edu.in","user_id":"7b4c92ef-bd3c-403b-9fb0-7621159e30e1","user_phone":""}}', '2025-09-22 18:14:40.137674+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9ffce64-df1e-49a5-a1a2-69166fe29d14', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aryan.iyer@tapasyavp.edu.in","user_id":"8c4d5695-53c7-49c9-b515-8f425dd722ba","user_phone":""}}', '2025-09-22 18:14:40.387037+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec203f1f-50f5-49e1-ba18-540d65739c69', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.avni.pillai@tapasyavp.edu.in","user_id":"9c6f8e3e-d422-481c-8210-502afcd91b29","user_phone":""}}', '2025-09-22 18:14:40.641402+00', ''),
	('00000000-0000-0000-0000-000000000000', '2622651f-b1df-4de5-a918-b5e8f14a9b11', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.reyansh.shetty@tapasyavp.edu.in","user_id":"994886cc-cda2-4948-8cad-6f8b5dd1a3ef","user_phone":""}}', '2025-09-22 18:14:40.880899+00', ''),
	('00000000-0000-0000-0000-000000000000', '5380dbf9-9de5-4d48-865b-340e04e4002c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.anika.agarwal@tapasyavp.edu.in","user_id":"01b2f1e2-f31c-44c8-8806-b3895856eab3","user_phone":""}}', '2025-09-22 18:14:41.166998+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ea9aef6-b44f-4cba-b346-89be5d87f91f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.krishna.murthy@tapasyavp.edu.in","user_id":"92e593af-3c16-4171-9dbc-c2bd39a1c05c","user_phone":""}}', '2025-09-22 18:14:41.447713+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e78f4ba-05ad-4456-9614-242b22007477', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aadhya.das@tapasyavp.edu.in","user_id":"d255fe07-9955-4964-b9ba-210a6bfefd63","user_phone":""}}', '2025-09-22 18:14:41.715658+00', ''),
	('00000000-0000-0000-0000-000000000000', '1852195c-64cd-4398-b563-2e575f7402d5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.suresh.sharma@tapasyavp.edu.in","user_id":"805672d6-b4d0-4b06-b76e-756e81860a64","user_phone":""}}', '2025-09-22 18:14:41.982387+00', ''),
	('00000000-0000-0000-0000-000000000000', '692b9ead-6c55-4779-8cfc-60ee3d0a6a58', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rina.sharma@tapasyavp.edu.in","user_id":"d8411207-c875-4123-8720-703b845ab0d6","user_phone":""}}', '2025-09-22 18:14:42.183142+00', ''),
	('00000000-0000-0000-0000-000000000000', '38421503-06c6-4f6c-93d8-1c1f2144949a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.hitesh.patel@tapasyavp.edu.in","user_id":"1dcdfeff-be95-4cd6-a265-202cf48f315a","user_phone":""}}', '2025-09-22 18:14:42.414839+00', ''),
	('00000000-0000-0000-0000-000000000000', '680883b3-c83b-4ef2-b94c-43b376497618', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.pooja.patel@tapasyavp.edu.in","user_id":"22913906-47ec-42b8-a4ca-1824c53b20ef","user_phone":""}}', '2025-09-22 18:14:42.638573+00', ''),
	('00000000-0000-0000-0000-000000000000', '11d7d5e7-fd54-477c-9e60-d2c6021d34d3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.manoj.kumar@tapasyavp.edu.in","user_id":"15cf4a27-fdf9-4970-99fc-fa3d3320fd70","user_phone":""}}', '2025-09-22 18:14:42.908472+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a93fbb2b-8f5a-47d9-a264-445006b720fa', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.geeta.singh@tapasyavp.edu.in","user_id":"8f38971b-79e4-45f6-991a-dc42c52dc0ac","user_phone":""}}', '2025-09-22 18:14:43.108554+00', ''),
	('00000000-0000-0000-0000-000000000000', 'efbf91d9-3ac0-4f84-a537-f5f33177a97f', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.nitin.verma@tapasyavp.edu.in","user_id":"59672aca-ae60-4b8e-a3cd-6f470f72d20a","user_phone":""}}', '2025-09-22 18:14:43.310469+00', ''),
	('00000000-0000-0000-0000-000000000000', '36247b90-c8ed-4036-8260-7b66680950cb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.deepika.verma@tapasyavp.edu.in","user_id":"90404cae-5425-4d70-9824-316ad97ac6bb","user_phone":""}}', '2025-09-22 18:14:43.508379+00', ''),
	('00000000-0000-0000-0000-000000000000', '11a8dd0c-55e1-4355-b32b-e91512e53111', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.alok.gupta@tapasyavp.edu.in","user_id":"22fda726-9110-4773-99a7-db3d25227b50","user_phone":""}}', '2025-09-22 18:14:43.712836+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ede87b0c-2ad7-41ed-a8f1-8b97d7a41f42', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.vikram.reddy@tapasyavp.edu.in","user_id":"5c9bde64-2168-4a24-b6d1-e4425d6ba85c","user_phone":""}}', '2025-09-22 18:14:44.001423+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ce79575-cf7c-42ea-a6f2-7039775c1dd9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.lakshmi.reddy@tapasyavp.edu.in","user_id":"57081167-c641-4265-a924-16a22b99a11b","user_phone":""}}', '2025-09-22 18:14:44.215934+00', ''),
	('00000000-0000-0000-0000-000000000000', '91e782e6-8d1e-4808-8e4c-7f46be232295', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rajesh.nair@tapasyavp.edu.in","user_id":"668765d6-2f9c-4d64-acb0-cd1843924380","user_phone":""}}', '2025-09-22 18:14:44.465082+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f74e8bf-a779-444d-a6df-4ce8bf1ed44d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anjali.menon@tapasyavp.edu.in","user_id":"b69632f6-492d-4873-b881-5a7d70b01c3e","user_phone":""}}', '2025-09-22 18:14:44.669282+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd6950f3c-def7-4c75-8fb7-01408aaf5d3b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anil.joshi@tapasyavp.edu.in","user_id":"1173f334-e258-4c01-aa86-603f73a9e4ac","user_phone":""}}', '2025-09-22 18:14:44.893442+00', ''),
	('00000000-0000-0000-0000-000000000000', '696f15ff-2be5-43f5-b455-ce6928420737', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.kavya.joshi@tapasyavp.edu.in","user_id":"4423eea0-e4ae-423a-86bc-0ca816bad73a","user_phone":""}}', '2025-09-22 18:14:45.1023+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f3eba4cc-ec87-463b-8103-3aed0a10bad6', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aarav.sharma@tapasyavp.edu.in","user_id":"f28b1aae-297f-4649-9154-aec2e4a42181","user_phone":""}}', '2025-09-22 18:19:52.208856+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5faad10-76a2-4dac-b64a-1a96aff7418c', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.vikram.reddy@tapasyavp.edu.in","user_id":"5c9bde64-2168-4a24-b6d1-e4425d6ba85c","user_phone":""}}', '2025-09-22 18:19:52.229525+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db60a66d-1dc0-47ed-9999-8262601526cd', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.mishra@tapasyavp.edu.in","user_id":"562d4754-ec2e-457b-9af6-5ca842018e14","user_phone":""}}', '2025-09-22 18:19:52.241142+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ca8b3d8-a209-4d47-8fcd-73c068556a59', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.verma@tapasyavp.edu.in","user_id":"052eb263-2d20-4e76-8f79-2d88ed603d01","user_phone":""}}', '2025-09-22 18:19:52.262083+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b8f34b5-b17a-48cb-bfe9-befcb9d730a7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.kavya.joshi@tapasyavp.edu.in","user_id":"4423eea0-e4ae-423a-86bc-0ca816bad73a","user_phone":""}}', '2025-09-22 18:19:52.26661+00', ''),
	('00000000-0000-0000-0000-000000000000', '10d4790f-2604-473f-9627-6814daff6054', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.deepika.verma@tapasyavp.edu.in","user_id":"90404cae-5425-4d70-9824-316ad97ac6bb","user_phone":""}}', '2025-09-22 18:19:52.347608+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6a62224-2a87-42c5-828e-93930ff92dff', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.anjali.menon@tapasyavp.edu.in","user_id":"b69632f6-492d-4873-b881-5a7d70b01c3e","user_phone":""}}', '2025-09-22 18:19:52.350329+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f99f3c1-8029-4c5b-9342-da59dbd8b886', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.rao@tapasyavp.edu.in","user_id":"68351320-3274-45ac-925e-d38c184cb4ba","user_phone":""}}', '2025-09-22 18:19:52.351875+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb2646b9-7916-4dde-9e9c-889cdc8d4d4f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.rajesh.nair@tapasyavp.edu.in","user_id":"668765d6-2f9c-4d64-acb0-cd1843924380","user_phone":""}}', '2025-09-22 18:19:52.361665+00', ''),
	('00000000-0000-0000-0000-000000000000', '237bb461-3873-40e4-b4c6-53951256d54a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.lakshmi.reddy@tapasyavp.edu.in","user_id":"57081167-c641-4265-a924-16a22b99a11b","user_phone":""}}', '2025-09-22 18:19:52.368827+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c04b1b57-6153-4fe1-b17f-23f63d7d7fce', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.kumar@tapasyavp.edu.in","user_id":"a0c32336-f40c-4ec9-889f-c9e9f39792fa","user_phone":""}}', '2025-09-22 18:19:52.373925+00', ''),
	('00000000-0000-0000-0000-000000000000', '12774754-07cf-4633-92ce-be35075e859e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.iyer@tapasyavp.edu.in","user_id":"95c8d375-1586-41c3-9427-cbc0f7c00be6","user_phone":""}}', '2025-09-22 18:19:52.390904+00', ''),
	('00000000-0000-0000-0000-000000000000', '09c0a243-b7df-4d88-9143-2f9106bc0ccc', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.gupta@tapasyavp.edu.in","user_id":"f5a206f1-22c4-443d-8438-26924135b557","user_phone":""}}', '2025-09-22 18:19:52.392559+00', ''),
	('00000000-0000-0000-0000-000000000000', '18ee2466-cb5a-4e4e-a2bb-c89da3248ffc', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.anil.joshi@tapasyavp.edu.in","user_id":"1173f334-e258-4c01-aa86-603f73a9e4ac","user_phone":""}}', '2025-09-22 18:19:52.399611+00', ''),
	('00000000-0000-0000-0000-000000000000', '89e3a603-69c4-41c9-9184-f108bdf480f1', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"principal.sharma@tapasyavp.edu.in","user_id":"687048d5-5618-44a1-9346-b11bb7aedd8b","user_phone":""}}', '2025-09-22 18:19:52.405092+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a376f09-af8f-41ca-a3d5-c6310d671f93', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.singh@tapasyavp.edu.in","user_id":"a06aeb7d-dffa-49ed-a28a-9034ca97902a","user_phone":""}}', '2025-09-22 18:19:52.400986+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ebaa885-b4c0-4484-ab1e-b5a59df6b50e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.nair@tapasyavp.edu.in","user_id":"41c53899-dfed-48b8-b7ed-bf2c9fd0f69f","user_phone":""}}', '2025-09-22 18:19:52.408625+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe1c0ba2-c7db-4c21-ae7c-ac71ecb4a743', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.diya.patel@tapasyavp.edu.in","user_id":"d91f9164-c681-44d2-afeb-b41926c0c08d","user_phone":""}}', '2025-09-22 18:19:52.419819+00', ''),
	('00000000-0000-0000-0000-000000000000', '60082139-61b9-4164-85e3-52f415fd5639', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.rohan.kumar@tapasyavp.edu.in","user_id":"f94e486f-e704-4888-8c97-7a59dd06f77b","user_phone":""}}', '2025-09-22 18:19:52.421927+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e499852-59b7-46b8-823a-3cc5c0266c4a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher.patel@tapasyavp.edu.in","user_id":"4f139f53-19c8-4997-9b64-9628ba4e7517","user_phone":""}}', '2025-09-22 18:19:52.423027+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9d2ded8-0822-4cd2-81a8-6e136382a70a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.priya.singh@tapasyavp.edu.in","user_id":"24f3b93d-3591-4fcc-a311-c7c6ae87c270","user_phone":""}}', '2025-09-22 18:20:15.90321+00', ''),
	('00000000-0000-0000-0000-000000000000', '59e4d52d-2fc8-482e-a63e-333e5330d505', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.suresh.sharma@tapasyavp.edu.in","user_id":"805672d6-b4d0-4b06-b76e-756e81860a64","user_phone":""}}', '2025-09-22 18:20:15.92454+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9e51809-1ad5-4d1f-b0b4-78658ea1e69d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.vivaan.rao@tapasyavp.edu.in","user_id":"6c78f298-2682-4101-b54f-05ca3186eba3","user_phone":""}}', '2025-09-22 18:20:15.955568+00', ''),
	('00000000-0000-0000-0000-000000000000', '787df898-26cf-432a-a5c7-24cff5a8b3c8', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.zara.khan@tapasyavp.edu.in","user_id":"7b4c92ef-bd3c-403b-9fb0-7621159e30e1","user_phone":""}}', '2025-09-22 18:20:15.955706+00', ''),
	('00000000-0000-0000-0000-000000000000', '45c65838-bc27-4212-9771-7e770c17a8e7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.krishna.murthy@tapasyavp.edu.in","user_id":"92e593af-3c16-4171-9dbc-c2bd39a1c05c","user_phone":""}}', '2025-09-22 18:20:15.962074+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c73c3585-1829-4e52-ae74-0c92f116f215', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.vihaan.reddy@tapasyavp.edu.in","user_id":"bc44a3dd-35b0-4b27-b080-4858b492c835","user_phone":""}}', '2025-09-22 18:20:16.038763+00', ''),
	('00000000-0000-0000-0000-000000000000', '3be93f78-5bae-44fb-b4a9-82506f81907a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.ananya.gupta@tapasyavp.edu.in","user_id":"3a70e4b4-369f-4500-969b-424c4e4ae28f","user_phone":""}}', '2025-09-22 18:20:16.03908+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1934612-b873-47aa-b9f5-0ab81321f25c', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aryan.iyer@tapasyavp.edu.in","user_id":"8c4d5695-53c7-49c9-b515-8f425dd722ba","user_phone":""}}', '2025-09-22 18:20:16.04404+00', ''),
	('00000000-0000-0000-0000-000000000000', '7a4b3d48-0ab3-4aad-b1bc-ee656d04fd57', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.arjun.menon@tapasyavp.edu.in","user_id":"7624d12c-bfe1-45c9-b0dd-94ab18988fc5","user_phone":""}}', '2025-09-22 18:20:16.045989+00', ''),
	('00000000-0000-0000-0000-000000000000', '53a13d4b-d19e-4f9a-ba5e-b561928caa45', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.rina.sharma@tapasyavp.edu.in","user_id":"d8411207-c875-4123-8720-703b845ab0d6","user_phone":""}}', '2025-09-22 18:20:16.047924+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a5226f46-f8b0-44da-bb5a-62b112a265d4', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.ishita.nair@tapasyavp.edu.in","user_id":"5fb766ba-5e52-4d8b-a92d-80616decea5a","user_phone":""}}', '2025-09-22 18:20:16.052998+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0d61f22-87f7-4b53-bb5e-d1d42e5d6033', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.kabir.shah@tapasyavp.edu.in","user_id":"1d8d91e4-992b-451d-b78f-604a49fd9643","user_phone":""}}', '2025-09-22 18:20:16.054234+00', ''),
	('00000000-0000-0000-0000-000000000000', '6043bc82-87bc-459d-81d9-4c1c55600a34', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.avni.pillai@tapasyavp.edu.in","user_id":"9c6f8e3e-d422-481c-8210-502afcd91b29","user_phone":""}}', '2025-09-22 18:20:16.06082+00', ''),
	('00000000-0000-0000-0000-000000000000', '4daf3f6c-7d08-4a1a-82b8-90d6a1b9698a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.saanvi.joshi@tapasyavp.edu.in","user_id":"f8bd6b88-3fb1-4ead-801e-d477d1efca46","user_phone":""}}', '2025-09-22 18:20:16.068914+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2e5702f-ac74-479d-b089-6d6979f942f2', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:00:59.357425+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b6d8044-78b5-4f65-851c-2255a2704ace', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.hitesh.patel@tapasyavp.edu.in","user_id":"1dcdfeff-be95-4cd6-a265-202cf48f315a","user_phone":""}}', '2025-09-22 18:20:16.070571+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aedd0879-a343-4778-9d56-58df3d8fbaec', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aditya.verma@tapasyavp.edu.in","user_id":"ccf16e64-c7f5-4624-9fe9-ac565de0b01a","user_phone":""}}', '2025-09-22 18:20:16.073987+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cc799fd-ddd4-4046-8ca2-261aa6b37f5e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.myra.mishra@tapasyavp.edu.in","user_id":"a9897273-8003-46d9-b002-555f24a1cd54","user_phone":""}}', '2025-09-22 18:20:16.079947+00', ''),
	('00000000-0000-0000-0000-000000000000', '91019fba-2f6c-4d90-a91b-d83b517c9272', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.anika.agarwal@tapasyavp.edu.in","user_id":"01b2f1e2-f31c-44c8-8806-b3895856eab3","user_phone":""}}', '2025-09-22 18:20:16.081878+00', ''),
	('00000000-0000-0000-0000-000000000000', '0c2d99e3-d5ac-46b4-8fe2-c6f427460ef3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.reyansh.shetty@tapasyavp.edu.in","user_id":"994886cc-cda2-4948-8cad-6f8b5dd1a3ef","user_phone":""}}', '2025-09-22 18:20:16.081405+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd863a5a5-1be8-467d-8cb0-4e8dd0e964dc', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.geeta.singh@tapasyavp.edu.in","user_id":"8f38971b-79e4-45f6-991a-dc42c52dc0ac","user_phone":""}}', '2025-09-22 18:20:24.139842+00', ''),
	('00000000-0000-0000-0000-000000000000', '94a24a28-7d4a-4209-a27f-02753f9cac26', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.pooja.patel@tapasyavp.edu.in","user_id":"22913906-47ec-42b8-a4ca-1824c53b20ef","user_phone":""}}', '2025-09-22 18:20:24.14709+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c5a1e61-7cfb-4e7f-93f6-597826ef2ad4', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.nitin.verma@tapasyavp.edu.in","user_id":"59672aca-ae60-4b8e-a3cd-6f470f72d20a","user_phone":""}}', '2025-09-22 18:20:24.171906+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5156764-90f6-4a54-809d-ea0bd4f36da7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.alok.gupta@tapasyavp.edu.in","user_id":"22fda726-9110-4773-99a7-db3d25227b50","user_phone":""}}', '2025-09-22 18:20:24.280642+00', ''),
	('00000000-0000-0000-0000-000000000000', '7b61cf27-b814-4662-a4c3-624a3d9f5667', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"parent.manoj.kumar@tapasyavp.edu.in","user_id":"15cf4a27-fdf9-4970-99fc-fa3d3320fd70","user_phone":""}}', '2025-09-22 18:20:24.332768+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd870b4ff-9587-4ea3-82e8-abd023f03921', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"principal.sharma@tapasyavp.edu.in","user_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","user_phone":""}}', '2025-09-22 18:20:34.959445+00', ''),
	('00000000-0000-0000-0000-000000000000', '57888f0e-66f4-4eb4-bef4-a10d270c5fbf', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.patel@tapasyavp.edu.in","user_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","user_phone":""}}', '2025-09-22 18:20:35.518618+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b99e138-3c22-411a-bfab-95d2583fbd1b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.gupta@tapasyavp.edu.in","user_id":"da134162-0d5d-4215-b93b-aefb747ffa17","user_phone":""}}', '2025-09-22 18:20:35.839285+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f3db625-6a8f-471e-be8d-25d83de06ffa', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.kumar@tapasyavp.edu.in","user_id":"dbcff9aa-f28d-47d8-90a6-d7688bb6c41a","user_phone":""}}', '2025-09-22 18:20:36.104853+00', ''),
	('00000000-0000-0000-0000-000000000000', '54c3e963-fbb2-4266-8335-5eaa0e2030f5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.verma@tapasyavp.edu.in","user_id":"b393e32d-fb28-4de5-9713-eeebad9d2c06","user_phone":""}}', '2025-09-22 18:20:36.377658+00', ''),
	('00000000-0000-0000-0000-000000000000', '264c4e2d-ca73-4038-bbaf-35d54c6e290c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.mishra@tapasyavp.edu.in","user_id":"70cee473-d0a2-4484-8a84-e0a5cd4e584c","user_phone":""}}', '2025-09-22 18:20:36.636839+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f3245a0-2dbd-459a-ae5d-e96d0ede3ede', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.singh@tapasyavp.edu.in","user_id":"97f8b48a-4302-4f0e-baf8-4a85f8da0cca","user_phone":""}}', '2025-09-22 18:20:36.894421+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e60a2af6-1da4-4e60-87d3-a894e14f8777', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.rao@tapasyavp.edu.in","user_id":"ce4ef0c4-c548-49ac-a71f-49655c7482d4","user_phone":""}}', '2025-09-22 18:20:37.166733+00', ''),
	('00000000-0000-0000-0000-000000000000', '6fcb0168-c3f2-497c-83a1-64ea7f84d830', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.nair@tapasyavp.edu.in","user_id":"8585907d-5de4-4f6d-ae9a-28b26b0e86a0","user_phone":""}}', '2025-09-22 18:20:37.420657+00', ''),
	('00000000-0000-0000-0000-000000000000', '6916b3a4-ad9a-400e-bf9d-4c8f6a98bbbc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher.iyer@tapasyavp.edu.in","user_id":"ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b","user_phone":""}}', '2025-09-22 18:20:37.687139+00', ''),
	('00000000-0000-0000-0000-000000000000', '158dc793-304e-4f02-9fdf-cf8f250b0d46', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aarav.sharma@tapasyavp.edu.in","user_id":"63bed14f-2514-45a2-a718-04c1d0a0b7f0","user_phone":""}}', '2025-09-22 18:20:37.962656+00', ''),
	('00000000-0000-0000-0000-000000000000', '337bfaf4-8c7b-4138-9fc9-45ac7976f6f8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.diya.patel@tapasyavp.edu.in","user_id":"48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da","user_phone":""}}', '2025-09-22 18:20:38.225847+00', ''),
	('00000000-0000-0000-0000-000000000000', '688cdf95-bcbc-494b-8856-f7a7ba3a6454', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.rohan.kumar@tapasyavp.edu.in","user_id":"45c6ac9c-9306-40f1-a23d-fbfea313c794","user_phone":""}}', '2025-09-22 18:20:38.483952+00', ''),
	('00000000-0000-0000-0000-000000000000', '2f3db88c-55a5-489c-82d9-5ba2e57e9f55', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.priya.singh@tapasyavp.edu.in","user_id":"cb0cf1e2-19d0-4ae3-93ed-3073a47a5058","user_phone":""}}', '2025-09-22 18:20:38.733577+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b418d895-b332-4f08-b668-7dd8c1c72949', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aditya.verma@tapasyavp.edu.in","user_id":"9caad150-de2c-478a-87b6-a712e412947f","user_phone":""}}', '2025-09-22 18:20:38.991214+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c7f01b5-fb6a-481e-bc7f-585e8fbd14c9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ananya.gupta@tapasyavp.edu.in","user_id":"3b3f1289-d861-45e2-b4e4-f18d72ca5036","user_phone":""}}', '2025-09-22 18:20:39.280046+00', ''),
	('00000000-0000-0000-0000-000000000000', '2eb07c3f-f180-474a-b775-3d3f5bc2213f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"student.aadhya.das@tapasyavp.edu.in","user_id":"d255fe07-9955-4964-b9ba-210a6bfefd63","user_phone":""}}', '2025-09-22 18:20:16.082481+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c42db062-da58-4b0a-b37f-df68c33e12b5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vihaan.reddy@tapasyavp.edu.in","user_id":"604f3f2f-0741-4ec8-9667-d3f0ecdc76be","user_phone":""}}', '2025-09-22 18:20:39.537603+00', ''),
	('00000000-0000-0000-0000-000000000000', '2eee3f9a-6e72-4d1e-a633-a98fcce38bc8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ishita.nair@tapasyavp.edu.in","user_id":"226cb810-8e16-4a3d-a879-2c1b325edbeb","user_phone":""}}', '2025-09-22 18:20:39.795933+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7edc4b1-4c2c-4c2d-8c05-36bc8c7a50b2', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.arjun.menon@tapasyavp.edu.in","user_id":"d77de604-114c-4c71-8b8c-5616db827da7","user_phone":""}}', '2025-09-22 18:20:40.055892+00', ''),
	('00000000-0000-0000-0000-000000000000', '6733194b-33ce-4fab-808d-ca7e16a02be5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.saanvi.joshi@tapasyavp.edu.in","user_id":"12fcf33f-7c54-4466-a44c-ad7602b2c2bc","user_phone":""}}', '2025-09-22 18:20:40.322665+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab78b44a-c5e6-43d9-b965-0b1aa8189cf5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.kabir.shah@tapasyavp.edu.in","user_id":"d8fab006-304c-43bc-a8db-597fdf947c9e","user_phone":""}}', '2025-09-22 18:20:40.591951+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d9e64d3-d78c-4ff4-95eb-9c9a339e2981', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.myra.mishra@tapasyavp.edu.in","user_id":"6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4","user_phone":""}}', '2025-09-22 18:20:40.86101+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1d9b404-af18-4d68-9752-94ec0216d62d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.vivaan.rao@tapasyavp.edu.in","user_id":"706c538d-4134-4cc1-be7e-fb11fa771bfb","user_phone":""}}', '2025-09-22 18:20:41.125283+00', ''),
	('00000000-0000-0000-0000-000000000000', '619cfe2e-e2de-4316-9a85-a89d03b92e49', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.zara.khan@tapasyavp.edu.in","user_id":"25d8b8be-ab84-4758-91e0-427db617eeab","user_phone":""}}', '2025-09-22 18:20:41.382214+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6f0c37f-a38b-4b29-b093-efbb574e916a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aryan.iyer@tapasyavp.edu.in","user_id":"f46c80a9-0e4f-4308-b266-8ddc28ff2228","user_phone":""}}', '2025-09-22 18:20:41.644329+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5364824-de3b-496b-8403-58c0eafcf3a6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.avni.pillai@tapasyavp.edu.in","user_id":"b4e9499b-5580-488e-8163-e4706459dfb8","user_phone":""}}', '2025-09-22 18:20:41.901115+00', ''),
	('00000000-0000-0000-0000-000000000000', '298290ac-ade9-4f89-bc82-93821617778e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.reyansh.shetty@tapasyavp.edu.in","user_id":"dff67664-a554-4629-8e07-f0a6f640ee6d","user_phone":""}}', '2025-09-22 18:20:42.154721+00', ''),
	('00000000-0000-0000-0000-000000000000', '21b8ebaf-f8ca-4ad0-a0e6-5bb03d06ad06', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.anika.agarwal@tapasyavp.edu.in","user_id":"4d68700c-6741-4abf-a51e-718a58b75500","user_phone":""}}', '2025-09-22 18:20:42.405972+00', ''),
	('00000000-0000-0000-0000-000000000000', '30ae914e-bd03-44d3-8505-94c12e960467', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.krishna.murthy@tapasyavp.edu.in","user_id":"6bbe0fc4-7caa-4705-a87d-2114dd189669","user_phone":""}}', '2025-09-22 18:20:42.660445+00', ''),
	('00000000-0000-0000-0000-000000000000', '99d9fd79-09d4-4dc7-b727-cb8ce207866c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.aadhya.das@tapasyavp.edu.in","user_id":"b195fe70-8761-4c73-a7db-5c95f68ca89b","user_phone":""}}', '2025-09-22 18:20:42.925928+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f780fa2-9431-49e4-bbc7-ad1b8226c92a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.suresh.sharma@tapasyavp.edu.in","user_id":"0841a053-7266-426e-b681-1d6fab5f9974","user_phone":""}}', '2025-09-22 18:20:43.195169+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7a04cde-b842-447a-8a2e-0694fd098597', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rina.sharma@tapasyavp.edu.in","user_id":"bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3","user_phone":""}}', '2025-09-22 18:20:43.426099+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cff5aa83-a8b6-4b3f-9d0f-0830dcfddcb1', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.hitesh.patel@tapasyavp.edu.in","user_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","user_phone":""}}', '2025-09-22 18:20:43.642402+00', ''),
	('00000000-0000-0000-0000-000000000000', '4f17ff1f-4ed7-4418-b4e0-e6594eb9a78e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.pooja.patel@tapasyavp.edu.in","user_id":"e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404","user_phone":""}}', '2025-09-22 18:20:43.848077+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac22ad57-175d-4ea4-bc43-0b17f0526aff', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.manoj.kumar@tapasyavp.edu.in","user_id":"437bdd8c-d32c-42f2-911a-cd0b6768fa9d","user_phone":""}}', '2025-09-22 18:20:44.109632+00', ''),
	('00000000-0000-0000-0000-000000000000', '01a1a531-4093-4ded-8962-7cb767acbdab', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.geeta.singh@tapasyavp.edu.in","user_id":"2a2a83fa-2910-4fb5-8e23-23a3c3b667a3","user_phone":""}}', '2025-09-22 18:20:44.400266+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd98874a-f528-4f0f-91e0-860822bab4de', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.nitin.verma@tapasyavp.edu.in","user_id":"6016ef26-05d5-4d23-b0b1-8b6d6af73cad","user_phone":""}}', '2025-09-22 18:20:44.682923+00', ''),
	('00000000-0000-0000-0000-000000000000', '48cad535-216d-4589-91ca-bb1ff50e8082', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.deepika.verma@tapasyavp.edu.in","user_id":"c238591e-69ed-424f-b633-8fe0f68f81be","user_phone":""}}', '2025-09-22 18:20:44.884788+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a680ec77-0775-49fa-ab85-61d847b72aa9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.alok.gupta@tapasyavp.edu.in","user_id":"fbd44ebd-1994-4c93-8359-8dbdea32a1e9","user_phone":""}}', '2025-09-22 18:20:45.449049+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cec60c74-b03b-4e00-b04a-c74be2b75a96', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.vikram.reddy@tapasyavp.edu.in","user_id":"99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4","user_phone":""}}', '2025-09-22 18:20:45.738841+00', ''),
	('00000000-0000-0000-0000-000000000000', '448ac04d-d3fc-470f-849b-29814b77643e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.lakshmi.reddy@tapasyavp.edu.in","user_id":"2327bda4-89df-401f-9d83-3050ee53b23e","user_phone":""}}', '2025-09-22 18:20:45.942113+00', ''),
	('00000000-0000-0000-0000-000000000000', '68d82011-aa03-45e7-bf21-5f16efa0ce58', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.rajesh.nair@tapasyavp.edu.in","user_id":"3f720771-43ec-4bb3-9ebf-02ac19d8960c","user_phone":""}}', '2025-09-22 18:20:46.206992+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d4c96db-a34e-42b7-bfa7-6e33c0c16f4c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anjali.menon@tapasyavp.edu.in","user_id":"eb064229-c344-4350-b01b-3e8d09be68b3","user_phone":""}}', '2025-09-22 18:20:46.409173+00', ''),
	('00000000-0000-0000-0000-000000000000', '1a356009-7489-4203-8c13-beb89503befb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.anil.joshi@tapasyavp.edu.in","user_id":"de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac","user_phone":""}}', '2025-09-22 18:20:46.614967+00', ''),
	('00000000-0000-0000-0000-000000000000', '5a0a0347-3bdd-4cf7-b3a1-f512b775ae30', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"parent.kavya.joshi@tapasyavp.edu.in","user_id":"d0aba71f-57b7-46bd-8d6d-a76c66987810","user_phone":""}}', '2025-09-22 18:20:46.811052+00', ''),
	('00000000-0000-0000-0000-000000000000', '178df77b-1f43-44db-b93b-8a9b8e29ec39', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:23:23.435028+00', ''),
	('00000000-0000-0000-0000-000000000000', '13521ffc-80e0-4932-8a7e-9e7209d321c2', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:24:45.16976+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c286bb75-5df6-4094-97a2-d83dfdb6e7ce', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:27:55.394988+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f77b9fb0-9def-42da-b6b1-74196dc151d6', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:31:14.593843+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f36b00c2-efb8-40ab-9ea2-37c1bdfabc19', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:35:13.815091+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f11da643-d657-4b80-8f98-2f550bab68da', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:36:51.65603+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c29418e8-dd83-477f-88c8-107e62c8a043', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 10:52:26.768753+00', ''),
	('00000000-0000-0000-0000-000000000000', '1054c276-ea4b-4e83-935c-d5ed5c75eb35', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:02:55.53695+00', ''),
	('00000000-0000-0000-0000-000000000000', 'beb7afa1-1c4f-40e2-b6b1-94a9adcf929b', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:11:57.66083+00', ''),
	('00000000-0000-0000-0000-000000000000', '254f1d9f-4715-4537-8605-83f69d0771fa', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:46:04.168132+00', ''),
	('00000000-0000-0000-0000-000000000000', '451448b5-ea2e-44bb-bab9-0e69314c30ad', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:49:41.19983+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb9e53cc-4873-4968-bf01-c6ec60133080', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:50:20.972038+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b627518-47ca-4155-831d-4b7c596d2174', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:54:29.788268+00', ''),
	('00000000-0000-0000-0000-000000000000', '3341bd7e-e7c5-4f83-b680-15aac6de9993', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 11:56:43.751371+00', ''),
	('00000000-0000-0000-0000-000000000000', '111289c6-fc22-4aba-8e81-8b842c02abad', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:04:04.848926+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ecefa429-f1e8-4ab7-9ea7-4f8744c25621', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:08:17.515816+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef4b966a-944c-4c8a-8cef-cc8645af0a5c', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:11:05.584138+00', ''),
	('00000000-0000-0000-0000-000000000000', '566729d9-1e73-4171-bc67-936fb0d3b66a', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:19:17.933812+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ce0d98a6-5913-422c-9aab-9297a9e1404e', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:26:40.311759+00', ''),
	('00000000-0000-0000-0000-000000000000', '53d80383-ebd7-4d20-a879-35a38a58b1b3', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:29:48.082041+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a3f2798-4eb6-449c-a42c-ca90d40804e4', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:30:08.148354+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c8802d1-4acd-444c-90ca-db62f23c683f', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:30:55.802804+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aac597e5-1bf8-4184-b960-be516c25d364', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:34:48.566079+00', ''),
	('00000000-0000-0000-0000-000000000000', '44a45c0e-163b-493a-9983-ef11ea8402ed', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:44:24.670982+00', ''),
	('00000000-0000-0000-0000-000000000000', '7caad4de-a203-43b7-aff6-20db55dac311', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:44:40.940986+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff50597f-ad3c-4e2c-8b0b-90ec9d6a5962', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:49:39.885356+00', ''),
	('00000000-0000-0000-0000-000000000000', '6778fba1-fb15-47e7-a6c8-68559e710e4c', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:50:23.633578+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d0b1c98-b29f-4689-a5cd-184c9c89cc35', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:51:28.108305+00', ''),
	('00000000-0000-0000-0000-000000000000', '175e08ad-cb03-4ee4-87a9-511dd69e1362', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 12:54:13.941482+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d28c99a-fa37-4dc6-9ce8-c149b526f627', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:57:59.269012+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd3a7471-4596-4761-a5b7-1c5c42942509', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:58:04.795063+00', ''),
	('00000000-0000-0000-0000-000000000000', '08fd817a-8b76-4444-aca7-3c8bb07b4f03', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"parent.suresh.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-03 12:58:14.071752+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d210a71-de97-443b-8f30-6adc6ffcf656', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abhaybs2305@gmail.com","user_id":"685c4887-fc38-4d76-a342-ec29de3e0f85"}}', '2025-10-03 13:00:42.535881+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7cde924-c326-425f-84f9-1589e1fb7213', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.88482d9a-dbe5-4c42-8eca-ec691eda9402@schoolos.com","user_id":"05a88040-b0e2-481c-a9a3-f4b5e169dedd","user_phone":""}}', '2025-10-05 18:51:51.038144+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d8f73ae-6471-4029-86bb-55f5899bda8d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.624d7db5-75ab-4274-afd7-3889b312307d@schoolos.com","user_id":"a36b35d2-021c-42a9-b8e7-d13465b82281","user_phone":""}}', '2025-10-05 18:51:52.531781+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2c108dd-3bb8-4816-89b4-0d98a5aed10e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.93cc417f-51d4-4aaa-9b39-fdf7dab824c4@schoolos.com","user_id":"09351a3e-1149-465e-8e5d-dce65f769985","user_phone":""}}', '2025-10-05 18:55:06.496053+00', ''),
	('00000000-0000-0000-0000-000000000000', '9933a35f-0a2d-42ed-a611-b1a27caea2b7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.44f5165b-6747-48e7-a00a-86d7d3445535@schoolos.com","user_id":"8e7d4e76-d195-4a53-a1eb-89f7b2cf1420","user_phone":""}}', '2025-10-05 19:13:46.850455+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c3ee645b-1648-4122-b968-bd2497e76a4b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.65df74bf-1602-46db-b8ee-8209d5abbc29@schoolos.com","user_id":"a6ce33ac-9988-44a2-9905-d2c11066b511","user_phone":""}}', '2025-10-05 19:13:48.703903+00', ''),
	('00000000-0000-0000-0000-000000000000', '75bf2563-2be7-42e0-a76f-b0c34be69c5c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.00af20b6-a91f-4ee2-9f42-45ae0084aaf7@example.com","user_id":"5549f19f-68c7-4de1-96c9-3a9626675850","user_phone":""}}', '2025-10-06 08:49:34.171092+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd01dad9e-1a8c-495e-85be-0517141300db', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.9bbf7366-9f01-4c7c-a03b-9959b80f9bc6@example.com","user_id":"9be00d6e-f4fd-4095-8a42-339eae5b751d","user_phone":""}}', '2025-10-06 08:58:24.443439+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f400d694-d2f8-4ad7-9b51-16346a705103', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test.student.7927544e-a625-4d05-ada9-06bd13963c5f@example.com","user_id":"2c0d82ea-c145-4fa9-82eb-9e5f7556b416","user_phone":""}}', '2025-10-06 09:01:04.226258+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f706a06-96a8-424c-a163-b8672170b276', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.0da71fb4-4baf-4701-aae1-1ad30d878930@example.com","user_id":"18ad651a-fce9-44aa-9d8c-1c4942b752af","user_phone":""}}', '2025-10-06 15:23:02.089127+00', ''),
	('00000000-0000-0000-0000-000000000000', '1377d80a-a8e2-4319-a7ae-65571e0cbc79', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.3fa504f7-eb3e-4ae2-9e47-bc8cc9e58722@example.com","user_id":"bba67f0f-0c9f-4899-9302-63ae117577f7","user_phone":""}}', '2025-10-06 15:29:21.470013+00', ''),
	('00000000-0000-0000-0000-000000000000', '93f92579-e742-40ca-8e39-302c3a803032', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.1310f718-6edd-43c8-99e3-ab2fcf1e862c@example.com","user_id":"9afe1c7f-2102-4d5f-aa96-447fbc1b3392","user_phone":""}}', '2025-10-06 15:31:48.656712+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7611ca8-3fd5-47e2-b46d-20627cc2d08e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.60e259cc-6d6e-4c64-91ae-8d7b78cbf02a@example.com","user_id":"a646d383-77db-42af-936d-f5587be4d961","user_phone":""}}', '2025-10-07 06:35:12.236875+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da0a177d-662e-4101-b0e2-0406e1d31743', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.2ccc8ae5-a102-4164-aa4f-f9aed8909378@example.com","user_id":"eafae832-a41c-426f-a182-f8f6b1f87e97","user_phone":""}}', '2025-10-07 06:41:33.887194+00', ''),
	('00000000-0000-0000-0000-000000000000', '95ef2785-acbb-4e36-b5ec-c95fa0f25326', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.b55551ba-f5c2-4ce0-a587-020adba598bb@example.com","user_id":"24ec3525-99b3-4269-8fe9-2bdd4698bfda","user_phone":""}}', '2025-10-07 06:44:57.233223+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbdc8cda-8dfd-4b8f-85c5-85ca615eb849', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.379a5e2b-2730-474d-9a2f-f76a27aa7d0c@example.com","user_id":"70b549df-b616-4be5-b2c1-1d51af813207","user_phone":""}}', '2025-10-07 06:45:50.148146+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2021af5-1253-498c-9b3b-82acdf38aa73', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.e9782921-02b1-4281-b2e7-90829f9a2a7c@example.com","user_id":"7d67227c-8e03-491c-805f-609726eed87d","user_phone":""}}', '2025-10-07 06:49:11.652172+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6cac1df-a33d-4f68-8c58-86b4e1920702', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ce5d65d4-db9c-4146-a822-388d613e0dc0@example.com","user_id":"509ab322-fb8f-4cbb-b778-b881d3ca0e11","user_phone":""}}', '2025-10-07 06:53:00.542683+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5e90807-b2ee-4876-a609-8ee5b343fa34', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.67ca9f6e-cd8b-4595-8b85-89fd8f9ee065@example.com","user_id":"5f6f441a-ae4c-413c-9539-19e0e2ff9a66","user_phone":""}}', '2025-10-07 07:00:14.049713+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f6df9d8-790d-4ef5-a8d5-66fb7a9eb346', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.0a33e359-28bc-46d9-91dc-1f77745e81ef@example.com","user_id":"73dc447f-7fc6-4e19-bac9-b3ba62b86e0a","user_phone":""}}', '2025-10-07 07:03:41.031823+00', ''),
	('00000000-0000-0000-0000-000000000000', '091faff4-7bc4-4118-9e00-cf5c98ea1531', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.2eeaef70-8379-408e-9323-fe58c88a2a9c@example.com","user_id":"6ed6b164-9b11-49b3-a9ef-8241681fce37","user_phone":""}}', '2025-10-07 07:15:25.022341+00', ''),
	('00000000-0000-0000-0000-000000000000', '81ec9abc-1f01-47b6-819e-f40e1275210a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.f5804710-8402-4750-80e3-8302ee54b3a0@example.com","user_id":"86ee5391-69dd-48db-9673-edc6aa5a61bd","user_phone":""}}', '2025-10-07 07:19:26.382408+00', ''),
	('00000000-0000-0000-0000-000000000000', '91de746a-bf32-4bd4-8f37-35da07ff3ef2', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.ebf03fc5-626e-4dae-959d-69235e5d50ae@example.com","user_id":"59b9e466-f181-4383-97a4-749e45777a84","user_phone":""}}', '2025-10-07 07:22:33.660469+00', ''),
	('00000000-0000-0000-0000-000000000000', '1446288b-d44f-443d-873e-632a558dbc6b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.01eac18b-d003-44a8-8305-51281da82b79@example.com","user_id":"3a834f54-5135-4dab-8fe5-fa4ef16dd792","user_phone":""}}', '2025-10-07 07:24:46.103315+00', ''),
	('00000000-0000-0000-0000-000000000000', '60561137-c6fc-488b-8af9-017a6c5d2623', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.18f19378-6193-45a2-a709-a18394c66270@example.com","user_id":"4c7bdf24-d6b1-42ea-9ced-638773d08527","user_phone":""}}', '2025-10-07 07:30:41.198924+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf18dd99-89ae-4001-a99c-3dea00086065', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.3fd11782-d909-4639-8e94-90109f53d6a6@example.com","user_id":"8e1c55bf-3a17-4ea9-bf99-77d7a459feb1","user_phone":""}}', '2025-10-07 07:36:23.305936+00', ''),
	('00000000-0000-0000-0000-000000000000', '87587d27-3ee0-4486-ba3e-2bf48910cea7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.add386d4-39b0-460b-8650-97f11cfcf357@example.com","user_id":"e1fb9cce-230b-48cc-b2de-6e30ccd74139","user_phone":""}}', '2025-10-07 07:39:12.277503+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec5eb6b0-593c-446d-9b66-8d1c3ce9eeea', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.dda3781d-abc1-467c-bbb6-2dd82233e03d@example.com","user_id":"5d9e1c9f-980c-47b1-bd87-2b54c6810c86","user_phone":""}}', '2025-10-07 07:50:19.464272+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f2ed2dbc-6b6b-432c-a6b6-f25c573ec865', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.091b27f4-a062-448a-8d3e-489caf4ba627@example.com","user_id":"aebd8219-5fd4-4ede-86c0-344c0e6cd257","user_phone":""}}', '2025-10-07 07:54:49.727564+00', ''),
	('00000000-0000-0000-0000-000000000000', '363646ea-ccc7-47ba-ae84-f3b1f3a08bea', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-07 08:33:25.232382+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f3685813-4f65-4e1b-be0e-93a4bd3ad29b', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-07 08:34:47.745118+00', ''),
	('00000000-0000-0000-0000-000000000000', '68878524-b60e-4a45-82ee-94add4e13da7', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-07 09:45:03.047192+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de4cb8eb-1cdf-4fbd-a18a-2a5f093f7f5b', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-07 09:45:23.680299+00', ''),
	('00000000-0000-0000-0000-000000000000', '02154459-a237-40d8-8dc2-364346dd28d4', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-08 05:58:04.477717+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c4a5a80-f043-49ef-96de-dc252a7f1981', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-08 05:58:19.713867+00', ''),
	('00000000-0000-0000-0000-000000000000', '49d73e07-19ab-4c7a-8b14-10aaea47a9af', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-08 07:00:03.170842+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d31bf5e-7d12-4d06-80a4-efc44f8713a6', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-08 07:00:32.889377+00', ''),
	('00000000-0000-0000-0000-000000000000', '26c96c89-216e-4e0e-b2b3-81041112b8df', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-08 08:57:48.201221+00', ''),
	('00000000-0000-0000-0000-000000000000', '885b58d9-678e-4fc7-b84c-85df41a3f81c', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhinavmaheshgurkar224@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-08 08:58:02.48068+00', ''),
	('00000000-0000-0000-0000-000000000000', '187de15e-b53e-4aed-b23d-4ee4900e00f7', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"zenwear.in@gmail.com","user_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","user_phone":""}}', '2025-10-08 15:10:12.108405+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af917312-5309-4cdd-b2ba-4b92ceab05eb', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"zenwear.in@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-08 15:11:32.698708+00', ''),
	('00000000-0000-0000-0000-000000000000', '93fa25a2-2cbc-4834-977a-8bbc3134dcf5', '{"action":"login","actor_id":"70cee473-d0a2-4484-8a84-e0a5cd4e584c","actor_username":"teacher.mishra@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-08 15:32:26.380384+00', ''),
	('00000000-0000-0000-0000-000000000000', '9e765185-02f8-4025-87e5-b1c731892497', '{"action":"login","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-09 05:10:22.088616+00', ''),
	('00000000-0000-0000-0000-000000000000', '749f0d3c-16ee-4daf-b79e-971ce4ff8938', '{"action":"user_recovery_requested","actor_id":"685c4887-fc38-4d76-a342-ec29de3e0f85","actor_username":"abhaybs2305@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-09 16:29:16.200314+00', ''),
	('00000000-0000-0000-0000-000000000000', '343dd5b0-57b1-4c8b-98e0-4ae83e1f48a7', '{"action":"user_signedup","actor_id":"685c4887-fc38-4d76-a342-ec29de3e0f85","actor_username":"abhaybs2305@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-09 16:29:26.336007+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e1963e5-6774-45d2-80c9-9f935e24cd23', '{"action":"login","actor_id":"fbd44ebd-1994-4c93-8359-8dbdea32a1e9","actor_username":"parent.alok.gupta@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-09 16:51:48.917607+00', ''),
	('00000000-0000-0000-0000-000000000000', '832b2b80-0c8a-4dc3-a54d-a079e3d93bae', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.33a3375c-5602-4a8f-9509-bb255a17ab71@example.com","user_id":"4770004f-39b3-4983-9004-80d23b1b6029","user_phone":""}}', '2025-10-10 09:03:06.735191+00', ''),
	('00000000-0000-0000-0000-000000000000', '2014757f-6192-4b2c-beff-b8d9ae2e5bcb', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.d07d87f1-de5e-439f-b799-0eeba88e90d2@example.com","user_id":"432c3e91-01ff-4ff4-ba70-d2582fa44ed2","user_phone":""}}', '2025-10-10 09:08:28.922903+00', ''),
	('00000000-0000-0000-0000-000000000000', '582f4674-22bc-4eef-a4f5-5b03fe8e58ab', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"student.b7cb72e0-ae10-4f74-8321-71d35629ec72@example.com","user_id":"558b7c95-a041-4f11-acf8-3ade6aecbba5","user_phone":""}}', '2025-10-10 09:53:45.319194+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e999dcc-b446-43b3-96ce-afc55cc23d68', '{"action":"login","actor_id":"97f8b48a-4302-4f0e-baf8-4a85f8da0cca","actor_username":"teacher.singh@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-11 07:29:38.008319+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da863007-ae2d-4f1a-ac5e-e8e1780fd8df', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skillaccabhay@gmail.com","user_id":"735fb098-7d42-48ca-9456-5d8980ecfc2e"}}', '2025-10-11 10:34:58.464447+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ec4aee3-bce0-4d69-98c3-27224353d7d0', '{"action":"user_signedup","actor_id":"735fb098-7d42-48ca-9456-5d8980ecfc2e","actor_username":"skillaccabhay@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-11 10:35:39.105828+00', ''),
	('00000000-0000-0000-0000-000000000000', '20464944-df01-4d89-b33b-6337898c83d6', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skillaccabhay@gmail.com","user_id":"735fb098-7d42-48ca-9456-5d8980ecfc2e","user_phone":""}}', '2025-10-11 10:37:13.569191+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c54370e7-6412-48f5-b7e7-31fd323f4c0c', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skillaccabhay@gmail.com","user_id":"7a221af0-dce5-40f9-8d64-966900fde79d"}}', '2025-10-11 10:37:30.482655+00', ''),
	('00000000-0000-0000-0000-000000000000', '23709868-9445-4c2d-8b14-af2cae8faa12', '{"action":"user_recovery_requested","actor_id":"7a221af0-dce5-40f9-8d64-966900fde79d","actor_username":"skillaccabhay@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-11 10:37:57.593329+00', ''),
	('00000000-0000-0000-0000-000000000000', '92f7922f-58ad-4be4-96ee-c70973ac12a0', '{"action":"user_recovery_requested","actor_id":"7a221af0-dce5-40f9-8d64-966900fde79d","actor_username":"skillaccabhay@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-11 10:39:44.637381+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c19d3857-ce9c-4781-a3c6-6340d6d2f258', '{"action":"user_signedup","actor_id":"7a221af0-dce5-40f9-8d64-966900fde79d","actor_username":"skillaccabhay@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-11 10:40:07.381708+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd077ea77-0d50-41a1-8649-fec58825c2ed', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"zenwear.in@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-11 10:52:58.455293+00', ''),
	('00000000-0000-0000-0000-000000000000', '14d34272-ba3f-475f-8d47-7ef58b69849d', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"zenwear.in@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-11 10:53:22.528084+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b66ba816-e976-4eb3-a713-41a68d115081', '{"action":"login","actor_id":"ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b","actor_username":"teacher.iyer@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-12 05:22:31.545679+00', ''),
	('00000000-0000-0000-0000-000000000000', '42af6cf1-c878-4ca0-b56d-e96a4f96fec0', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bhuvanbalajiv@gmail.com","user_id":"ca967e27-a291-4796-8159-ecc8854871ae"}}', '2025-10-12 13:50:26.210195+00', ''),
	('00000000-0000-0000-0000-000000000000', '61503055-74e5-485b-b54c-d16202c629be', '{"action":"user_signedup","actor_id":"ca967e27-a291-4796-8159-ecc8854871ae","actor_username":"bhuvanbalajiv@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-12 13:51:02.735126+00', ''),
	('00000000-0000-0000-0000-000000000000', '0dc4bf9b-8ed8-48e0-9326-73f8a27e11d6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"bitpodcast@gmail.com","user_id":"ee0daccb-0f05-4acb-b13e-13491af2ae0d","user_phone":""}}', '2025-10-12 13:52:25.911182+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e1acf64-773b-440e-a483-a89075c8a1de', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 05:27:29.043437+00', ''),
	('00000000-0000-0000-0000-000000000000', '742727d7-9a04-49b0-ba38-8fd4f02c6cbb', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 05:27:30.031297+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fedb399b-2fa3-44a2-8660-bf0b4da3c26f', '{"action":"user_repeated_signup","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-13 11:45:57.801632+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e11a32a3-2153-4d8b-b313-4ca8aec7f3da', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-13 11:48:49.757417+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5be53a1-5cbb-49a3-9d76-e6805cff3a3a', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-13 11:49:08.415754+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a78c2978-472a-4fef-be26-78da2f39f951', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 09:05:43.201754+00', ''),
	('00000000-0000-0000-0000-000000000000', '14b9545e-a5ad-409c-9ec1-4700ef517722', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 09:40:05.522147+00', ''),
	('00000000-0000-0000-0000-000000000000', '7af6f478-daf0-480e-aac3-1ff2360e7bf7', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 12:58:33.564967+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e42a2eec-ca6c-4568-b9ca-d0ac80da1c3f', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 14:56:10.980333+00', ''),
	('00000000-0000-0000-0000-000000000000', '9eeb4b44-d65d-46d7-9a04-c7ddb74f7917', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 17:07:38.985424+00', ''),
	('00000000-0000-0000-0000-000000000000', '7cc0fa33-6ddb-4a64-b6fa-a14db7301a96', '{"action":"login","actor_id":"4808a1be-01b6-44c1-a17a-c9f104b40854","actor_username":"teacher.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-15 06:20:52.734227+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f08c36fe-c70b-4a8d-ad21-9eccc9fea48f', '{"action":"login","actor_id":"da134162-0d5d-4215-b93b-aefb747ffa17","actor_username":"teacher.gupta@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-15 09:09:06.461153+00', ''),
	('00000000-0000-0000-0000-000000000000', '63970ed6-b470-4dba-977d-dbe1a7d1db8b', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-16 08:43:26.774448+00', ''),
	('00000000-0000-0000-0000-000000000000', '5487860b-f88f-4bf6-aad8-77a9fe96fbc0', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-16 08:43:56.639142+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f1143e3-53e7-49cb-84b6-09da228f7896', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-16 10:01:57.923299+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e82199b4-b1e1-49dd-809c-6bc9133c7bd0', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-16 10:02:13.39392+00', ''),
	('00000000-0000-0000-0000-000000000000', '163eba2f-4059-4cc7-9a9f-11eda3ba311e', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-16 11:48:29.222888+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c999b87b-9512-479b-a0f8-90262d99a133', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-16 11:49:08.637439+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2647a64-d027-41c5-b091-f9ebceb23f13', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-16 17:09:10.953234+00', ''),
	('00000000-0000-0000-0000-000000000000', '38b9b680-3410-4ab7-95c1-e9c24023c5c7', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-16 17:09:22.050373+00', ''),
	('00000000-0000-0000-0000-000000000000', '2688e6cb-942e-4de2-8d5f-29fc7fcda4d6', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-16 18:37:52.336627+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c75d164-2673-4cd1-96b5-bcc198f4cffa', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-16 18:38:25.017883+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4676538-55dd-4ff4-9e0e-921488c1c725', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-17 10:45:19.70913+00', ''),
	('00000000-0000-0000-0000-000000000000', '975e1ad2-dd66-43f6-93f4-1fa50b280068', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-17 10:50:01.192794+00', ''),
	('00000000-0000-0000-0000-000000000000', '92c7bca8-0dbd-492a-b636-5583b8c16242', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-17 11:58:31.236138+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc1568f9-725a-4bea-88f9-d4d72e61bb2a', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-17 11:58:46.283935+00', ''),
	('00000000-0000-0000-0000-000000000000', '6253b861-36d3-44ba-a6c9-7ba29bbb1536', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-18 03:13:51.387928+00', ''),
	('00000000-0000-0000-0000-000000000000', '25d0bc74-bfc0-4dfb-8396-ff445c5db1be', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-18 03:14:28.43927+00', ''),
	('00000000-0000-0000-0000-000000000000', '2825ef76-769c-4dd9-8120-c1dc10cb9569', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-18 10:13:30.377015+00', ''),
	('00000000-0000-0000-0000-000000000000', '618f9165-6a30-4491-9c41-4caff314345d', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-18 10:14:22.897246+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1c2c94d-2751-4a28-8bfe-41aff3fb6b10', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-18 12:42:48.393418+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c6c9051-b3d1-4b87-ba80-d2e07a94f2ca', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-18 12:43:06.77911+00', ''),
	('00000000-0000-0000-0000-000000000000', '2192c24a-1564-42d9-8c4f-709a38c66db4', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-18 13:23:56.937425+00', ''),
	('00000000-0000-0000-0000-000000000000', '91da82ef-943a-4118-9db4-3d61b47607b2', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-18 13:24:26.022025+00', ''),
	('00000000-0000-0000-0000-000000000000', '14632783-e5e7-42a9-a1bd-473f90d8bbbd', '{"action":"user_repeated_signup","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-18 13:54:09.503891+00', ''),
	('00000000-0000-0000-0000-000000000000', '507cf38b-7fd6-4212-ab3d-ef521e48e181', '{"action":"user_repeated_signup","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-18 13:54:22.013721+00', ''),
	('00000000-0000-0000-0000-000000000000', '697487c6-57c6-42ef-a813-be840c84f7d2', '{"action":"user_repeated_signup","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-18 13:54:55.727504+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4f53dc0-d795-4a4d-8109-c38b5bce3f30', '{"action":"user_recovery_requested","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-18 13:55:23.377955+00', ''),
	('00000000-0000-0000-0000-000000000000', '83f078a0-4ebf-4501-b409-e657186d75e0', '{"action":"login","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-18 13:55:38.251734+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2a3a9f6-66bc-42f0-829b-e51a15d9211f', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-18 17:23:06.959455+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf2fafa5-6379-4f8c-86ef-4f4ba02ad736', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-18 17:24:23.192774+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b179d42d-39a0-4990-aa6a-4167c3b2902f', '{"action":"user_recovery_requested","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-18 18:29:32.152985+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ed83d5c9-be12-4339-9797-06b6f0ed70bd', '{"action":"login","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-18 18:30:03.765167+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8c7129c-0ff1-47ee-b407-3f3a43e26781', '{"action":"user_repeated_signup","actor_id":"6016ef26-05d5-4d23-b0b1-8b6d6af73cad","actor_username":"abhishekl1792005@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-18 18:34:11.307639+00', ''),
	('00000000-0000-0000-0000-000000000000', '6311b540-438c-47af-8d51-a57a38c60b22', '{"action":"user_repeated_signup","actor_id":"6016ef26-05d5-4d23-b0b1-8b6d6af73cad","actor_username":"abhishekl1792005@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-18 18:34:39.593375+00', ''),
	('00000000-0000-0000-0000-000000000000', '98715ca8-31d3-4ea4-b40d-2059b8d5eef2', '{"action":"user_recovery_requested","actor_id":"6016ef26-05d5-4d23-b0b1-8b6d6af73cad","actor_username":"abhishekl1792005@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-18 18:35:00.097348+00', ''),
	('00000000-0000-0000-0000-000000000000', '558dd5bf-6547-4288-9b45-0e1ca8ab8d3d', '{"action":"login","actor_id":"6016ef26-05d5-4d23-b0b1-8b6d6af73cad","actor_username":"abhishekl1792005@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-18 18:35:10.54333+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a697c9a2-357d-4f18-9ec6-42206eaa186d', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"bitpodcast24@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-18 18:41:47.26861+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ef7b55c-3e29-4449-91ef-943bf11f27b6', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"bitpodcast24@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-18 18:41:58.204103+00', ''),
	('00000000-0000-0000-0000-000000000000', '029fa5f3-67b0-4870-a188-2ca73d633290', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-19 03:06:59.849051+00', ''),
	('00000000-0000-0000-0000-000000000000', '25468ee5-d1a7-417b-aa24-3abca8af58d9', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-19 03:07:39.914131+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a4963c8-2166-41e3-82e6-ec5fb8a9ad51', '{"action":"user_confirmation_requested","actor_id":"94782a1f-7739-4d83-ab9b-d6933f78ec59","actor_username":"bitpodcast24@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-19 05:43:17.909488+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd01b1918-e0c6-4455-a27a-05f1e3dceb68', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-19 05:43:37.216288+00', ''),
	('00000000-0000-0000-0000-000000000000', '880d5d79-8374-43d5-83fc-f227d3d087b4', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-19 05:44:00.146138+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0ff35eb-77f9-4b7e-99d3-bceabe3f0d86', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-19 05:51:39.202138+00', ''),
	('00000000-0000-0000-0000-000000000000', '04073d18-952c-47b8-b332-4b267f7a3706', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-19 05:51:49.124717+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ee7fc73-514e-400a-9366-22f5d496d4aa', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-19 09:27:47.781422+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d8537fd-6b8e-48a7-878f-69df66d9f961', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-19 09:28:14.194288+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dae425b0-bcf8-4032-a3fd-6ba5f4b885de', '{"action":"user_recovery_requested","actor_id":"48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da","actor_username":"abhinavinit@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-20 06:46:06.922475+00', ''),
	('00000000-0000-0000-0000-000000000000', '11ce99fa-a025-4aa3-b33a-6eeb9a337a46', '{"action":"login","actor_id":"48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da","actor_username":"abhinavinit@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-20 06:46:39.500179+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e26dc11-7520-4ca1-afd5-12ccfc4d09c2', '{"action":"user_recovery_requested","actor_id":"2327bda4-89df-401f-9d83-3050ee53b23e","actor_username":"lolamathew850@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-20 07:13:17.922697+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bf510014-c9b0-4a86-a1ac-2f375ce4a859', '{"action":"login","actor_id":"2327bda4-89df-401f-9d83-3050ee53b23e","actor_username":"lolamathew850@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-20 07:13:26.675712+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a587d7d3-5a48-4c80-bc25-c622edf2a1c4', '{"action":"user_recovery_requested","actor_id":"2327bda4-89df-401f-9d83-3050ee53b23e","actor_username":"lolamathew850@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-20 08:28:50.075376+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9a2ed99-2125-464e-ab30-2b06558447d6', '{"action":"login","actor_id":"2327bda4-89df-401f-9d83-3050ee53b23e","actor_username":"lolamathew850@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-20 08:29:00.596684+00', ''),
	('00000000-0000-0000-0000-000000000000', '185f55e4-35ef-4dc1-a000-e86b2d7edc71', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-20 08:39:37.057621+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af19ac3a-8058-4654-9c44-398081e99e02', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-20 08:40:08.531338+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f53b81d6-2f94-4cd0-9e92-ae2f62efb469', '{"action":"user_recovery_requested","actor_id":"685c4887-fc38-4d76-a342-ec29de3e0f85","actor_username":"abhaybs2305@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-20 11:52:28.411362+00', ''),
	('00000000-0000-0000-0000-000000000000', '7cc83dad-c61d-42a5-b17e-bb3b38c84c55', '{"action":"login","actor_id":"685c4887-fc38-4d76-a342-ec29de3e0f85","actor_username":"abhaybs2305@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-20 11:53:00.159055+00', ''),
	('00000000-0000-0000-0000-000000000000', '53228375-4d4c-416c-98a7-c5559213f338', '{"action":"login","actor_id":"8585907d-5de4-4f6d-ae9a-28b26b0e86a0","actor_username":"teacher.nair@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-20 12:19:48.861113+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e9b29468-b6b2-4996-9e57-092717b3369b', '{"action":"user_recovery_requested","actor_id":"48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da","actor_username":"abhinavinit@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-20 12:40:18.442488+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f573b65-d084-4c46-ac72-6b883d7c0480', '{"action":"login","actor_id":"48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da","actor_username":"abhinavinit@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-20 12:40:49.315713+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a55c5b19-48d3-46f8-bd58-c4561b110774', '{"action":"user_recovery_requested","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-20 12:41:41.720369+00', ''),
	('00000000-0000-0000-0000-000000000000', '70ce9c0b-0055-4de2-9188-adf684dd3e6b', '{"action":"login","actor_id":"25d8b8be-ab84-4758-91e0-427db617eeab","actor_username":"1ms23ad004@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-20 12:42:37.520065+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3deac77-aec1-4cbc-bdd1-0afd5d799184', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-20 13:16:44.124703+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f748b6cd-a397-420c-9a8f-7e2e69c277a1', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-20 13:17:03.363366+00', ''),
	('00000000-0000-0000-0000-000000000000', '577de13f-a169-4e4f-95fb-070e7bd6a043', '{"action":"login","actor_id":"dff67664-a554-4629-8e07-f0a6f640ee6d","actor_username":"student.reyansh.shetty@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-20 13:27:07.227275+00', ''),
	('00000000-0000-0000-0000-000000000000', '5049fa89-0d23-4ddb-8718-8d154131627b', '{"action":"login","actor_id":"8585907d-5de4-4f6d-ae9a-28b26b0e86a0","actor_username":"teacher.nair@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-20 13:34:08.944786+00', ''),
	('00000000-0000-0000-0000-000000000000', '674c1188-1e31-4078-a07b-c54338034d35', '{"action":"login","actor_id":"dff67664-a554-4629-8e07-f0a6f640ee6d","actor_username":"student.reyansh.shetty@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-20 13:37:16.535258+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd38aab86-5977-494a-9459-a3589f4b0a2f', '{"action":"login","actor_id":"dff67664-a554-4629-8e07-f0a6f640ee6d","actor_username":"student.reyansh.shetty@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-20 14:11:07.043209+00', ''),
	('00000000-0000-0000-0000-000000000000', '010cd890-74da-4331-bda4-3ed0cb10ae3b', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-20 14:13:34.493491+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5b21960-eead-46ef-b78a-7636aa189624', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-20 14:13:44.556423+00', ''),
	('00000000-0000-0000-0000-000000000000', '82f9b945-6f4f-4455-b5b9-c84d922f0ddf', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-20 18:50:01.543934+00', ''),
	('00000000-0000-0000-0000-000000000000', '6703a8d9-a924-49a2-8721-8e1aabcd5e1b', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-20 18:50:12.150631+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db6f0bbd-e349-426f-bf4f-da0cad012219', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-21 04:18:06.391355+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd538c58-f0b2-4c9e-b45a-73b743768157', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-21 04:18:32.223162+00', ''),
	('00000000-0000-0000-0000-000000000000', '2bc911f2-af0a-4627-96b4-1e8019356fcd', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-21 04:27:28.497426+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b01ec16-f28a-41f2-8345-31a8a200c551', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-21 04:27:44.199449+00', ''),
	('00000000-0000-0000-0000-000000000000', '82c62d36-6dca-44b6-a8a1-b3d1e0d3c34c', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-21 05:19:12.976865+00', ''),
	('00000000-0000-0000-0000-000000000000', '92307609-033e-4237-acfc-f9ba568453cb', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-21 05:19:50.753423+00', ''),
	('00000000-0000-0000-0000-000000000000', '908e5bf8-263c-4c68-b4a6-3e312a9dbf40', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-21 05:54:14.594587+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ad3eeaf-f2d9-4903-8413-f5fed5fc27d0', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-21 05:54:31.929+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee799604-780b-47ee-9f6b-f14f4a127e48', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-21 06:19:30.527737+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bde6c787-5f8f-4ff3-a464-58b6688aaaa0', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-21 06:19:39.895505+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7a47de1-53fc-40d2-a440-e0dfb7c4dbf4', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-21 07:22:38.752545+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db06dec7-3a24-4f86-95aa-0eb1e19feb14', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-21 07:22:53.934109+00', ''),
	('00000000-0000-0000-0000-000000000000', '3ef84c40-79d0-4063-96b4-fe92d55c53c0', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-21 07:26:28.590237+00', ''),
	('00000000-0000-0000-0000-000000000000', '80a8deb7-0903-4239-b017-c48e483c1f12', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"lgowdaabhishek6@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-21 07:26:46.084557+00', ''),
	('00000000-0000-0000-0000-000000000000', '33b56aee-8d70-4e31-87a6-14fd99ed0ff5', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-21 08:56:43.865647+00', ''),
	('00000000-0000-0000-0000-000000000000', '03a454b8-9fcb-4b1c-b7a6-9ad7ce466071', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-21 08:56:57.798113+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6a2025e-9d2e-433d-b0cd-cd0c6b85db9b', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-21 10:02:51.064297+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ef8191d-7f52-47c1-b417-8c3995dfd2be', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-21 10:03:00.970703+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f846a51-9d71-4bb2-8a51-ba0f6d3f9def', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-22 06:24:40.618957+00', ''),
	('00000000-0000-0000-0000-000000000000', '9dfc992f-43f4-47a1-b10d-3c9cbdc9e50a', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-22 06:24:50.18163+00', ''),
	('00000000-0000-0000-0000-000000000000', '3295e580-f287-4f02-a152-5e7e5e54b9eb', '{"action":"user_recovery_requested","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"user"}', '2025-10-22 09:02:30.200226+00', ''),
	('00000000-0000-0000-0000-000000000000', '9eadd0ae-1432-479b-992a-2bdd28ab4846', '{"action":"login","actor_id":"3e163ee6-cd91-4d63-8bc1-189cc0d13860","actor_username":"1ms23ai001@msrit.edu","actor_via_sso":false,"log_type":"account"}', '2025-10-22 09:03:24.965707+00', ''),
	('00000000-0000-0000-0000-000000000000', '362fc8b8-fdd4-49fb-ab5a-b0a25afa70df', '{"action":"login","actor_id":"8585907d-5de4-4f6d-ae9a-28b26b0e86a0","actor_username":"teacher.nair@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-24 11:42:40.703766+00', ''),
	('00000000-0000-0000-0000-000000000000', '328734db-e9e1-46b7-a7a8-2842c49df416', '{"action":"user_confirmation_requested","actor_id":"62d516a1-8947-4768-a45a-1362a3cc43fb","actor_name":"Abhishek L","actor_username":"vrolightvro@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-24 11:49:23.792939+00', ''),
	('00000000-0000-0000-0000-000000000000', '26b5ef49-7449-4d0b-9c16-190bfddddd08', '{"action":"user_signedup","actor_id":"62d516a1-8947-4768-a45a-1362a3cc43fb","actor_name":"Abhishek L","actor_username":"vrolightvro@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-24 11:49:52.040165+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec84b84f-22cc-4c82-bdc2-c025e64c200c', '{"action":"user_signedup","actor_id":"dd17c134-d5f6-4f6d-b116-73831c6f9a37","actor_name":"Abhishek L","actor_username":"abc@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-24 11:50:58.33271+00', ''),
	('00000000-0000-0000-0000-000000000000', '25e55d0e-90c1-4bb7-bb65-0e7db532291e', '{"action":"login","actor_id":"dd17c134-d5f6-4f6d-b116-73831c6f9a37","actor_name":"Abhishek L","actor_username":"abc@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-24 11:50:58.33822+00', ''),
	('00000000-0000-0000-0000-000000000000', '537255e9-3057-4248-aa67-9b3621191cb0', '{"action":"login","actor_id":"dff67664-a554-4629-8e07-f0a6f640ee6d","actor_username":"student.reyansh.shetty@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-24 11:55:36.206537+00', ''),
	('00000000-0000-0000-0000-000000000000', '82124633-1ebb-40ad-a118-34494ca69ca1', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-24 12:15:10.761853+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d320ce3-5642-4a2a-9973-05da74544571', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-24 12:15:38.980414+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b21ca186-1dd2-43bd-aeea-83821987015a', '{"action":"token_refreshed","actor_id":"dd17c134-d5f6-4f6d-b116-73831c6f9a37","actor_name":"Abhishek L","actor_username":"abc@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-10-24 16:42:45.575164+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd9efb58-55b9-4968-b9f8-a1ec34950ffd', '{"action":"token_revoked","actor_id":"dd17c134-d5f6-4f6d-b116-73831c6f9a37","actor_name":"Abhishek L","actor_username":"abc@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-10-24 16:42:45.589976+00', ''),
	('00000000-0000-0000-0000-000000000000', '9967ed9d-20e9-4576-8f4d-f787b92ef919', '{"action":"user_repeated_signup","actor_id":"dd17c134-d5f6-4f6d-b116-73831c6f9a37","actor_name":"Abhishek L","actor_username":"abc@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-24 16:43:15.642683+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0be4754-2d0f-44cc-a7ec-26e094309901', '{"action":"user_signedup","actor_id":"d161a8e4-a80d-4a1c-a9ab-f23f38dc2679","actor_name":"Abhishek L","actor_username":"absdc@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-24 16:43:21.916999+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4733dab-1c26-414f-be59-654b5feb1a2e', '{"action":"login","actor_id":"d161a8e4-a80d-4a1c-a9ab-f23f38dc2679","actor_name":"Abhishek L","actor_username":"absdc@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-24 16:43:21.930976+00', ''),
	('00000000-0000-0000-0000-000000000000', '55eb5ad6-643c-4fc6-8406-2e742d1431d6', '{"action":"user_signedup","actor_id":"9c2d3636-b90c-44cf-b67a-848fc1f076a3","actor_name":"Abhishek L","actor_username":"abhishek@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-24 16:43:56.291861+00', ''),
	('00000000-0000-0000-0000-000000000000', '3182e61c-b6a2-4736-9330-4e486e2e7039', '{"action":"login","actor_id":"9c2d3636-b90c-44cf-b67a-848fc1f076a3","actor_name":"Abhishek L","actor_username":"abhishek@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-24 16:43:56.29791+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d538571-c960-40ca-a75e-ba00213e53f6', '{"action":"logout","actor_id":"9c2d3636-b90c-44cf-b67a-848fc1f076a3","actor_name":"Abhishek L","actor_username":"abhishek@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-10-24 16:44:19.268848+00', ''),
	('00000000-0000-0000-0000-000000000000', '03085fa7-08fb-4552-ba0a-26198d7d242f', '{"action":"user_recovery_requested","actor_id":"62d516a1-8947-4768-a45a-1362a3cc43fb","actor_name":"Abhishek L","actor_username":"vrolightvro@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-10-31 16:13:00.790236+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3f384df-3967-4c88-96e9-523aa4c832d3', '{"action":"user_repeated_signup","actor_id":"ca967e27-a291-4796-8159-ecc8854871ae","actor_username":"bhuvanbalajiv@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-10-31 16:14:05.540602+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd70a05ad-34c2-43aa-a51a-8c82d87a25a0', '{"action":"user_signedup","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-10-31 16:14:25.954472+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3c8cbba-cd9a-4124-9be2-6e73341358a7', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-31 16:14:25.961656+00', ''),
	('00000000-0000-0000-0000-000000000000', '01324cf6-e612-48c9-9d22-cf4f900f19ef', '{"action":"token_refreshed","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-10-31 17:30:36.463823+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ecb4d90-f85d-46b1-a232-5d1fe948b655', '{"action":"token_revoked","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-10-31 17:30:36.494049+00', ''),
	('00000000-0000-0000-0000-000000000000', '1bc7c2b6-7a95-488c-a8a9-7bc4195571b3', '{"action":"user_signedup","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-01 07:32:28.53351+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f164cf8b-4b90-4e28-9511-9f175e158ba8', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:32:28.553846+00', ''),
	('00000000-0000-0000-0000-000000000000', '76a4bbb0-9965-43d2-b21e-f18660adc77b', '{"action":"logout","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-01 07:33:37.500869+00', ''),
	('00000000-0000-0000-0000-000000000000', '798fcbe6-ffda-40cb-b5d3-e8484185efb1', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:33:55.320676+00', ''),
	('00000000-0000-0000-0000-000000000000', '26f28696-4fe3-42e4-9591-312c5f527310', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:39:44.532388+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b18fa641-3283-4ed8-b4e6-cdd7eb846e0b', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:40:00.915675+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a173da0-0c79-4c68-8c22-55434d49af75', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:41:07.036743+00', ''),
	('00000000-0000-0000-0000-000000000000', '052cff80-c6ad-4807-ac7a-16660dca5dc4', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:44:57.478976+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0f6d202-b248-4a44-a795-de81bc41791d', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:46:59.089435+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c2d918d-d98b-4623-9d27-9b362045ce60', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:49:40.520648+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9d7717e-0e8c-47fd-a5dd-7b1a40f9ee2a', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:50:10.687034+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f3fe52be-8597-41cc-a284-4b3306848fe5', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 07:53:15.328667+00', ''),
	('00000000-0000-0000-0000-000000000000', '98fe1cfc-3c67-4da3-8c38-d9274d328aa0', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 12:34:46.237858+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff91634e-1256-4601-878f-6c8e22f39575', '{"action":"user_recovery_requested","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-11-01 12:34:57.566121+00', ''),
	('00000000-0000-0000-0000-000000000000', '57fbb2c0-7cd4-49bd-8f5d-240079dbb95e', '{"action":"user_repeated_signup","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-01 12:35:06.747904+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e488202-50dc-4772-9cf8-2a039b5a5e93', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 12:35:16.268948+00', ''),
	('00000000-0000-0000-0000-000000000000', '5a603ea7-4966-40b7-9a9e-837ecaa49ba1', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 12:40:37.947937+00', ''),
	('00000000-0000-0000-0000-000000000000', '63a13dee-8ee7-4de5-ae63-1a0de89be109', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 12:51:36.376944+00', ''),
	('00000000-0000-0000-0000-000000000000', '94fb0ca1-ec38-41e3-82b9-c1c6290dfa13', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 12:52:03.899562+00', ''),
	('00000000-0000-0000-0000-000000000000', '59e78a0f-1599-49b3-9ead-9dfb45798807', '{"action":"token_refreshed","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 13:02:16.491269+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb032b8f-dfa7-401f-a10e-e712dcb5a15d', '{"action":"token_revoked","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 13:02:16.502019+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e8f3ebc-81b2-4574-bf64-db0dc51240af', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:06:29.617057+00', ''),
	('00000000-0000-0000-0000-000000000000', '89f73657-ca73-47d4-8a4d-090f007129dc', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:07:18.916325+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fa994609-8ba0-4e16-a35b-e658655e0eda', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:09:47.434575+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c4f8d4e9-7114-491e-9ce8-d743c4cbc947', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:10:11.795553+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b99defc2-00b7-43e2-8215-9e9250a64c5a', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:34:14.797032+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fcf4fba7-972c-439d-8d6e-062f5167e501', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:34:22.498742+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b09063e5-a3e7-4599-bc6f-869d2924bb5b', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 13:52:33.308891+00', ''),
	('00000000-0000-0000-0000-000000000000', '070c1096-e7fb-43bf-9fea-624581de33d5', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 14:11:59.024814+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af7d842f-233a-4501-bbc3-3b53a8c6d9e5', '{"action":"user_recovery_requested","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"thecartoonnetworkkids@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-11-01 14:29:42.422344+00', ''),
	('00000000-0000-0000-0000-000000000000', '35c22c27-d91e-48e0-86e4-f7834e11743b', '{"action":"login","actor_id":"0841a053-7266-426e-b681-1d6fab5f9974","actor_username":"thecartoonnetworkkids@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-01 14:30:04.75568+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2569161-412d-45d5-8b2c-f2c6c8b19eec', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 14:31:51.707791+00', ''),
	('00000000-0000-0000-0000-000000000000', '865f1347-9d51-4593-bfca-a16264f4b6cf', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 14:35:52.983187+00', ''),
	('00000000-0000-0000-0000-000000000000', '04203b14-c69f-4702-8eea-d50a9a2de78c', '{"action":"user_recovery_requested","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-11-01 14:45:31.911224+00', ''),
	('00000000-0000-0000-0000-000000000000', '1a86642a-0295-4877-beaf-a6768b2ce605', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-01 14:46:33.633021+00', ''),
	('00000000-0000-0000-0000-000000000000', '3f573119-dfed-4179-bbcb-039f845bd367', '{"action":"login","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 15:02:00.281031+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d6a4186-ab3e-49d5-9ba4-b2486c709d72', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 15:03:03.576677+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e0e3149-7454-4952-a8b7-e032a8f31792', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 15:10:54.176197+00', ''),
	('00000000-0000-0000-0000-000000000000', '60ce65e7-314d-496c-9b11-0af4f242f9fc', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 15:20:04.34893+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b602555-8a01-4d50-9c37-253a37cf3609', '{"action":"logout","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account"}', '2025-11-01 15:59:39.072413+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c3c490c-67fd-46ac-ac50-923c8d1d27d4', '{"action":"login","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 16:01:08.916582+00', ''),
	('00000000-0000-0000-0000-000000000000', '33b42912-9d32-4f60-abc8-68a6e75322ff', '{"action":"token_refreshed","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 16:17:30.516743+00', ''),
	('00000000-0000-0000-0000-000000000000', '12a9015c-ceae-4196-b8d1-f27c4d3cbd92', '{"action":"token_revoked","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 16:17:30.527789+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ff67bd7-8093-4596-9a20-67a71a94e435', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 16:18:05.67848+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f72b75f5-1234-4f04-8c14-dbcca05bee9f', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 16:49:58.257135+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bce5ae2d-f09f-4364-88e5-6805869065df', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 16:51:12.25275+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f363a212-32b4-4cc6-8071-89d9c91cfe70', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 16:51:52.097151+00', ''),
	('00000000-0000-0000-0000-000000000000', '8315b777-0b7d-4208-806b-28bc42044fcd', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 16:58:11.433107+00', ''),
	('00000000-0000-0000-0000-000000000000', '6466c052-205d-490b-8abe-c16eac4215ea', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:04:07.373047+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c191fb6f-6d7f-44f8-b891-f96d7566cd75', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:06:11.631634+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f689795-485a-438c-a221-6dd040401528', '{"action":"token_refreshed","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-01 17:10:36.166502+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e13c5e0-efe3-46d3-955a-f391b490719f', '{"action":"token_revoked","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-01 17:10:36.168525+00', ''),
	('00000000-0000-0000-0000-000000000000', '19d6dc4d-a8e7-42f3-a943-925dc051e9d0', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:10:40.531704+00', ''),
	('00000000-0000-0000-0000-000000000000', '0bda9a69-1828-49b9-886f-b147e07e9be3', '{"action":"logout","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account"}', '2025-11-01 17:11:02.888712+00', ''),
	('00000000-0000-0000-0000-000000000000', '90228804-b009-4d5e-bcbf-e5bb1e47add5', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:11:11.133883+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1039547-644f-4c1a-b0fb-3a6c04de9fe9', '{"action":"login","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:11:57.557603+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0eda03b-5a4f-4807-b7db-aa9181455028', '{"action":"token_refreshed","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 17:17:48.505096+00', ''),
	('00000000-0000-0000-0000-000000000000', '54349db9-3e41-4bfe-8fe1-9d18abcfe1f5', '{"action":"token_revoked","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 17:17:48.511506+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f266f10c-ccc5-4728-aef0-fe6a7bd788d1', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:18:28.245369+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e94e97ab-649f-48df-8498-c2ad64f77c3d', '{"action":"logout","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account"}', '2025-11-01 17:22:32.565082+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eeca6dca-2d09-4c13-adeb-48340217ccaa', '{"action":"login","actor_id":"e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404","actor_username":"parent.pooja.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:22:48.764135+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b79bb8e-81f0-48df-816d-d4589a286a2b', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 17:24:04.986384+00', ''),
	('00000000-0000-0000-0000-000000000000', '05473740-3aaa-45e5-81dc-4765ac9dfb96', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:04:29.075591+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4936e9c-f9d9-4cf4-a4d8-c4c145e9e3bf', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:09:25.368338+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b667c87-99c0-4af8-bf05-e421cce575a6', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:19:38.769151+00', ''),
	('00000000-0000-0000-0000-000000000000', '9e21312b-bc5d-48da-b5bc-04818b3d153e', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:21:16.51678+00', ''),
	('00000000-0000-0000-0000-000000000000', '6de3a600-6211-4755-a531-3bbbeee3c1d0', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:27:07.734816+00', ''),
	('00000000-0000-0000-0000-000000000000', '897eb3f8-37df-4800-92b6-c4e436be3162', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:29:01.728669+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f366dcd-ebb5-4eb6-b864-cd9f21d40047', '{"action":"token_refreshed","actor_id":"e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404","actor_username":"parent.pooja.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-01 18:29:44.961773+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eeb0ef69-e963-4bf1-afa3-b301c9b4190e', '{"action":"token_revoked","actor_id":"e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404","actor_username":"parent.pooja.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-01 18:29:44.963121+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5a3a832-efb6-4e7d-bda7-9c47ea2428e7', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:30:47.176113+00', ''),
	('00000000-0000-0000-0000-000000000000', '618c0020-aad6-487b-b2f3-7b6bd77f0502', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:32:05.244676+00', ''),
	('00000000-0000-0000-0000-000000000000', '74a8828d-8920-4888-936e-da29e9b09355', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:34:10.546323+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3b941a3-63f5-4b09-9ff7-dc32bff304b7', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:36:02.46144+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd7fd78a-95d9-4fac-aa46-16e788aafa6d', '{"action":"logout","actor_id":"e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404","actor_username":"parent.pooja.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account"}', '2025-11-01 18:38:37.412009+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ffb0648d-300a-4199-9a76-f97fac444528', '{"action":"login","actor_id":"bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3","actor_username":"parent.rina.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:39:28.170944+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d2e196b-9de8-4ea9-8e51-ee7c0e26a0db', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:40:56.027605+00', ''),
	('00000000-0000-0000-0000-000000000000', '12bb35d0-8045-4a4b-bd2d-499c71a22d9b', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:51:32.990611+00', ''),
	('00000000-0000-0000-0000-000000000000', '5306af42-76e6-4c3a-8d4d-80fb8140d759', '{"action":"login","actor_id":"89822878-2382-4078-a654-c48870709bb8","actor_name":"Abhishek L","actor_username":"srujannh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:56:22.121093+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e73c80a6-1b52-495d-b99e-92733871b76a', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 18:58:11.040748+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc8f86e9-a98f-49fa-b511-4de8c144c248', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 19:01:01.28134+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ca1ad177-fb9b-4f74-bcf0-7bfaa3dceea0', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 19:01:01.287733+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b53f93d7-1163-4001-a47c-3b9610cf0605', '{"action":"login","actor_id":"9626b997-1939-4697-a57e-10034bf9a276","actor_name":"VIGNESH B S","actor_username":"vignesh.bs06@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 19:01:41.11743+00', ''),
	('00000000-0000-0000-0000-000000000000', '871eb3b5-da36-43a1-a07f-20a758590956', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 19:14:32.707947+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ceaa3343-3152-4d2c-9cfd-8fa63c8046fa', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 19:18:33.137042+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ba592ef0-db59-428c-8080-cd65cf9c4031', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"vignesh.bs0@gmail.com","user_id":"4a39dc4b-5f95-45b0-9b4f-67b253943233"}}', '2025-11-01 19:25:03.504663+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ed0c515a-a07b-4c5d-b973-3c397d474be9', '{"action":"logout","actor_id":"bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3","actor_username":"parent.rina.sharma@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account"}', '2025-11-01 19:27:18.937116+00', ''),
	('00000000-0000-0000-0000-000000000000', '7687cdab-c678-40b3-b607-16db0172ec41', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 19:28:16.433098+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb0ab33b-625e-48ff-b6f0-c813edcd5f0f', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 19:42:48.432289+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7800555-6134-4577-a410-29ba6f3a8e5f', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 19:55:31.606697+00', ''),
	('00000000-0000-0000-0000-000000000000', '430075c4-8c51-47af-8950-0f185dc93045', '{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ashar808@gmail.com","user_id":"cd307408-9c83-475e-a874-be26288d534c"}}', '2025-11-01 19:58:11.921402+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e35d47f-fe10-4309-a806-3609cf091fa0', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 20:23:07.658305+00', ''),
	('00000000-0000-0000-0000-000000000000', '1df7c335-166c-4b38-99a5-d5883f226f53', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 20:23:07.672325+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fba0b515-d61b-474f-a9fa-5e6bad4d230e', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 20:25:16.007846+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a29d8840-2ee6-46e9-95a6-893d12cbff4a', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 20:28:59.076315+00', ''),
	('00000000-0000-0000-0000-000000000000', '3507535c-fdea-41af-89b1-aedd272c3d64', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 20:28:59.079656+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec2325ae-3f90-48ce-a638-a693004af3b0', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-01 20:34:18.795934+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e699f9c7-b8fb-4fb7-8f88-9d3a82478673', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 21:59:37.497355+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e9da8551-4660-4efb-9f31-25e6a12928c4', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-01 21:59:37.517483+00', ''),
	('00000000-0000-0000-0000-000000000000', '32229e62-d6a6-4576-bd41-ec5bab96f336', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 02:18:31.792054+00', ''),
	('00000000-0000-0000-0000-000000000000', '256dd05d-3d3c-4524-b526-e9b6ab6577ca', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 02:18:31.804146+00', ''),
	('00000000-0000-0000-0000-000000000000', '46754273-5464-4308-88c8-b750bc510e7c', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 02:18:53.464335+00', ''),
	('00000000-0000-0000-0000-000000000000', '11ae8eb9-6a62-4572-95b0-0d2598422a6f', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 02:20:07.823448+00', ''),
	('00000000-0000-0000-0000-000000000000', '09fe36c9-34ef-4f7d-8716-33700875502c', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 03:13:53.937562+00', ''),
	('00000000-0000-0000-0000-000000000000', '13e5ee66-b47b-401b-ae33-155c33edec63', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 04:04:07.539854+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e454ab2-9111-4215-be33-5ea82156903c', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 04:11:07.736756+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aceb2fe7-e4ee-4d20-9cd2-9c7d2bb53de9', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 04:20:47.307945+00', ''),
	('00000000-0000-0000-0000-000000000000', '4aee686a-9348-4f41-8f86-b864972beaf1', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 04:26:32.238582+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd04a510f-d4ce-4c89-a7a7-5a2d34ca372f', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 04:47:20.002412+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fdf9bce-4911-43f5-8539-00ac5c0fee09', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 08:07:33.590278+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d6db018-e9bb-44c3-84b9-9dd494ae104c', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 08:07:33.6+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1d0d212-5eca-4fee-92a6-ee1f3fabbb54', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 08:10:13.936965+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8d3eddb-6fc6-4035-81a7-ce1c820c0f48', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 08:10:37.405269+00', ''),
	('00000000-0000-0000-0000-000000000000', '407d9a0e-8ea2-45d9-ada0-d6d2ef2c6b06', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 08:17:53.169758+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af3c0526-963b-44c7-b04d-4fec29b468ff', '{"action":"logout","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-02 08:26:57.714064+00', ''),
	('00000000-0000-0000-0000-000000000000', '20781ce8-ce63-4735-b478-1f752e3ce6a8', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 08:27:10.017304+00', ''),
	('00000000-0000-0000-0000-000000000000', '86a4f83a-ed40-4e7e-8b89-f1f6342261c0', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 08:27:16.487798+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac9e6f36-400f-4da9-9004-4fecfb3091ac', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 13:42:51.015877+00', ''),
	('00000000-0000-0000-0000-000000000000', '40929ae1-c63a-42ce-b29a-0ee4af2c05ea', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 13:42:51.043609+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1635ff9-8c53-4d99-8568-d7efed5f4f65', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-02 13:45:21.294953+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b9fe587-b9ff-4421-a3b3-673fd48eeb56', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 14:57:27.641693+00', ''),
	('00000000-0000-0000-0000-000000000000', '071e06cd-dc77-40b1-a471-1cac198e5d7e', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 14:57:27.65541+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c80b067-3a68-4b46-aef2-60661aac2a6c', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 17:24:52.358491+00', ''),
	('00000000-0000-0000-0000-000000000000', '00c46361-c816-441a-9246-5dcb8b9f0e32', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-02 17:24:52.391442+00', ''),
	('00000000-0000-0000-0000-000000000000', '18d906d4-1c2a-4bb8-a4db-e872cbe1d53a', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-03 18:13:27.451453+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd33e5fc-6c2b-4314-b76c-70b4ab06af7c', '{"action":"login","actor_id":"ce4ef0c4-c548-49ac-a71f-49655c7482d4","actor_username":"teacher.rao@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-03 18:15:44.824209+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d03322c-939c-4842-9626-71469b1b489e', '{"action":"token_refreshed","actor_id":"ce4ef0c4-c548-49ac-a71f-49655c7482d4","actor_username":"teacher.rao@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-03 19:14:40.762729+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c33f22de-9bf9-4186-bf8e-9d73d954cc8a', '{"action":"token_revoked","actor_id":"ce4ef0c4-c548-49ac-a71f-49655c7482d4","actor_username":"teacher.rao@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-03 19:14:40.779812+00', ''),
	('00000000-0000-0000-0000-000000000000', '5fa6a31f-2666-45c6-a3ba-3b71ea86f3aa', '{"action":"user_repeated_signup","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-04 21:17:07.151534+00', ''),
	('00000000-0000-0000-0000-000000000000', '0145c04f-4703-4604-af18-01003191f7eb', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-04 21:23:06.632921+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ec74317-31cd-4973-b37c-8ca489407f2b', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-05 01:06:52.033039+00', ''),
	('00000000-0000-0000-0000-000000000000', '3f7f4ea4-de1d-41e3-a364-bff0fbfd7420', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-05 01:06:52.049405+00', ''),
	('00000000-0000-0000-0000-000000000000', '69056fc9-8444-41d1-b39c-7e290a53200c', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-05 01:07:39.696847+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbe6032c-1f89-46ca-9385-07dd0e4a353d', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-05 01:52:33.356577+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9d083c4-3e4a-4094-b82b-4112dd631b0c', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-05 05:56:36.585377+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3083b08-c289-4d70-a101-c48319c26aa6', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-05 05:56:36.603366+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a3df494-3e7c-429b-bfaf-df9815866234', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-05 05:57:16.334476+00', ''),
	('00000000-0000-0000-0000-000000000000', '3150b765-7a0d-4a43-a2cf-debe2b2a8c07', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-05 14:11:27.178172+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af92c194-a1e3-4899-847e-28f78779e203', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-05 14:11:27.190091+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d4e3022-a8ab-40d9-8618-1d96a59eb887', '{"action":"token_refreshed","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-06 03:11:24.761747+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fec7c08-1ee2-470c-aa9e-482a7df10a44', '{"action":"token_revoked","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-06 03:11:24.79018+00', ''),
	('00000000-0000-0000-0000-000000000000', '5bf0d3e2-b7f5-45ee-aff4-eb4a576c77d6', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 03:11:31.181812+00', ''),
	('00000000-0000-0000-0000-000000000000', '1dcfc47c-37e5-43e0-9bec-94d0263f3ec4', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 03:17:11.879765+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e2062548-ac7e-474d-9451-3c295102c8f6', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 03:21:04.766377+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3e543df-627d-495b-8d89-29bdabcb4bfe', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 03:21:33.424025+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b79c210b-dce3-4ffa-9694-55c3823e34d1', '{"action":"token_refreshed","actor_id":"ce4ef0c4-c548-49ac-a71f-49655c7482d4","actor_username":"teacher.rao@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-06 08:18:44.365615+00', ''),
	('00000000-0000-0000-0000-000000000000', '122dde88-bba7-47b7-becc-5270b774fe28', '{"action":"token_revoked","actor_id":"ce4ef0c4-c548-49ac-a71f-49655c7482d4","actor_username":"teacher.rao@tapasyavp.edu.in","actor_via_sso":false,"log_type":"token"}', '2025-11-06 08:18:44.39078+00', ''),
	('00000000-0000-0000-0000-000000000000', '0cad0efb-677f-45f8-9e9a-7c8defa7bf25', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 08:21:04.967285+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd0e43ba-fa34-4952-b5b9-040f493b142e', '{"action":"login","actor_id":"8585907d-5de4-4f6d-ae9a-28b26b0e86a0","actor_username":"teacher.nair@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 08:23:18.467388+00', ''),
	('00000000-0000-0000-0000-000000000000', '781b44fc-71cb-4664-91ea-ea2260fcc33f', '{"action":"login","actor_id":"dbcff9aa-f28d-47d8-90a6-d7688bb6c41a","actor_username":"teacher.kumar@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 09:12:49.642254+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe3b82c5-2e67-46e2-a9a5-8af91a15cc10', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 09:36:21.135732+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6b25ae9-e01e-401d-824d-b6fe671ddfa5', '{"action":"login","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 10:09:49.62957+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d3fc72a-f1d2-4297-bfb6-2ee3be8f8b9e', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 10:41:17.963896+00', ''),
	('00000000-0000-0000-0000-000000000000', '63cf5f50-8232-4d56-bf45-cc442624dcf2', '{"action":"login","actor_id":"1ef75d00-3349-4274-8bc8-da135015ab5d","actor_username":"parent.hitesh.patel@tapasyavp.edu.in","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 10:43:57.232104+00', ''),
	('00000000-0000-0000-0000-000000000000', '47cbc2be-4e75-4f02-8517-c2673a1ca36e', '{"action":"login","actor_id":"bd431bf6-6e9f-4642-84e9-f2284f92e164","actor_username":"abhisheklgowda05@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-06 10:59:33.827439+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '8e7d4e76-d195-4a53-a1eb-89f7b2cf1420', 'authenticated', 'authenticated', 'test.student.44f5165b-6747-48e7-a00a-86d7d3445535@schoolos.com', '$2a$10$oEfsw2lUo7w7vwyNIOL3h.KV7feMX26ZyINv5kzLGy6a5wy6Hik9C', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-05 19:13:46.818331+00', '2025-10-05 19:13:46.857232+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a6ce33ac-9988-44a2-9905-d2c11066b511', 'authenticated', 'authenticated', 'test.student.65df74bf-1602-46db-b8ee-8209d5abbc29@schoolos.com', '$2a$10$QHQywvsVjAKHChfvbjtMH.81o7QqEicsvAOZDW3iQrN1jlH7qTBpq', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-05 19:13:48.687389+00', '2025-10-05 19:13:48.706543+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '24ec3525-99b3-4269-8fe9-2bdd4698bfda', 'authenticated', 'authenticated', 'student.b55551ba-f5c2-4ce0-a587-020adba598bb@example.com', '$2a$10$G/7iUv2voEKtVIag.JSrCO3cFXuHA.AZzVFDKl49y0gBSbDmqpqRO', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 06:44:57.208423+00', '2025-10-07 06:44:57.235613+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '70b549df-b616-4be5-b2c1-1d51af813207', 'authenticated', 'authenticated', 'student.379a5e2b-2730-474d-9a2f-f76a27aa7d0c@example.com', '$2a$10$8tFsD6kNnRYVG1FMpxVMGeFSa.pd0dMH4JeoOlYKDB/.QEhR/P8PW', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 06:45:50.139864+00', '2025-10-07 06:45:50.153065+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '73dc447f-7fc6-4e19-bac9-b3ba62b86e0a', 'authenticated', 'authenticated', 'student.0a33e359-28bc-46d9-91dc-1f77745e81ef@example.com', '$2a$10$IM6q8vS.ucUAGXGHuT2sGOmWyli24ESh0pqCHF9EP78lNhs/m2U2i', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:03:40.988965+00', '2025-10-07 07:03:41.037444+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '59b9e466-f181-4383-97a4-749e45777a84', 'authenticated', 'authenticated', 'student.ebf03fc5-626e-4dae-959d-69235e5d50ae@example.com', '$2a$10$DjQeByyizGbMlKyu.5tQIOn3RSz7kJbiBIF1CJxe/4pjM/0WG9auW', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:22:33.605723+00', '2025-10-07 07:22:33.667729+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e1fb9cce-230b-48cc-b2de-6e30ccd74139', 'authenticated', 'authenticated', 'student.add386d4-39b0-460b-8650-97f11cfcf357@example.com', '$2a$10$oO2U9yaBgG/1aeACennVa.2Q33N74.l4Q0YIKfrRNU9NNt8dVP1qW', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:39:12.272507+00', '2025-10-07 07:39:12.27854+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'authenticated', 'authenticated', 'student.091b27f4-a062-448a-8d3e-489caf4ba627@example.com', '$2a$10$TfCTI.dZGMDGNfZ/iaeemuhEl5qmc9YlXTJdaiiQy5Hm8GbMXmC3a', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:54:49.701779+00', '2025-10-07 07:54:49.733443+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4770004f-39b3-4983-9004-80d23b1b6029', 'authenticated', 'authenticated', 'student.33a3375c-5602-4a8f-9509-bb255a17ab71@example.com', '$2a$10$I8BD2LBnErPXqBOgX/BJvuaRqL9IwyitXKVWFNGRU6LMF4XC25HbK', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-10 09:03:06.690796+00', '2025-10-10 09:03:06.747553+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2327bda4-89df-401f-9d83-3050ee53b23e', 'authenticated', 'authenticated', 'lolamathew850@gmail.com', '$2a$10$/Ng8VVdHwAdV8Pneguyh9Ot2tMkD8TDQ2oe3YVoWQ1kvIq0YAWepO', '2025-09-22 18:20:45.943125+00', NULL, '', NULL, '', '2025-10-20 08:28:50.103383+00', '', '', NULL, '2025-10-20 08:29:00.609699+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Reddy", "school_id": 1, "first_name": "Lakshmi", "phone_number": "9192724828", "date_of_birth": "1987-10-23", "email_verified": true}', NULL, '2025-09-22 18:20:45.940066+00', '2025-10-20 08:29:00.642026+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '62d516a1-8947-4768-a45a-1362a3cc43fb', 'authenticated', 'authenticated', 'vrolightvro@gmail.com', '$2a$10$/vVcSV3BLjnViN2iw6qdmuKh1jm.tCRmjWQ5xiYRSdefL7oqZ2/iy', '2025-10-24 11:49:52.041222+00', NULL, '', '2025-10-24 11:49:23.799019+00', '5264415d15dee00d6fd778f88416ce91824f3d1c281b01f82068513a', '2025-10-31 16:13:00.806214+00', '', '', NULL, '2025-10-24 11:49:52.049065+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "62d516a1-8947-4768-a45a-1362a3cc43fb", "role": "teacher", "email": "vrolightvro@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": true, "phone_verified": false}', NULL, '2025-10-24 11:49:23.74545+00', '2025-10-31 16:13:03.679847+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '89822878-2382-4078-a654-c48870709bb8', 'authenticated', 'authenticated', 'srujannh@gmail.com', '$2a$10$SWXoTngRP3V71v8vejUJauGr6uHn9bPg1eaJKboeiR5brX0cbkMe.', '2025-10-31 16:14:25.956938+00', NULL, '', NULL, 'd56920e9d2a5731b2486c193b15ef845a6e735abb49bbfdf3f2a98d2', '2025-11-01 12:34:57.56847+00', '', '', NULL, '2025-11-01 18:56:22.125512+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "89822878-2382-4078-a654-c48870709bb8", "role": "parent", "email": "srujannh@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": true, "phone_verified": false}', NULL, '2025-10-31 16:14:25.928856+00', '2025-11-01 18:56:22.136308+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7a221af0-dce5-40f9-8d64-966900fde79d', 'authenticated', 'authenticated', 'skillaccabhay@gmail.com', '', '2025-10-11 10:40:07.382822+00', '2025-10-11 10:37:30.484426+00', '', '2025-10-11 10:37:30.484426+00', '', '2025-10-11 10:39:44.638102+00', '', '', NULL, '2025-10-11 10:40:07.388005+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-10-11 10:37:30.472923+00', '2025-10-11 10:40:07.392629+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7d67227c-8e03-491c-805f-609726eed87d', 'authenticated', 'authenticated', 'student.e9782921-02b1-4281-b2e7-90829f9a2a7c@example.com', '$2a$10$gcY/RU4T64s6u0x3aWwETeMOhApQCGDrXaMPVNME8cdl8QkupVhfq', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 06:49:11.648043+00', '2025-10-07 06:49:11.653112+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5549f19f-68c7-4de1-96c9-3a9626675850', 'authenticated', 'authenticated', 'test.student.00af20b6-a91f-4ee2-9f42-45ae0084aaf7@example.com', '$2a$10$ZroEknN2duGCXhui1Hc4Je1EGxIu9vkGZG3r.7L/O/giccm6H6d3u', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-06 08:49:34.078072+00', '2025-10-06 08:49:34.194618+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '432c3e91-01ff-4ff4-ba70-d2582fa44ed2', 'authenticated', 'authenticated', 'student.d07d87f1-de5e-439f-b799-0eeba88e90d2@example.com', '$2a$10$ozglmj1NM/sEnTodCJDsCeQ8vnMf6UldMigeZDwVt5Th108MYP90K', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-10 09:08:28.910202+00', '2025-10-10 09:08:28.927218+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9626b997-1939-4697-a57e-10034bf9a276', 'authenticated', 'authenticated', 'vignesh.bs06@gmail.com', '$2a$10$lzSUjSsBg5JK45gSaTNjxudAVGV9D6.x8u2hx9h4yzriMJAH2kN4O', '2025-11-01 07:32:28.544169+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-01 19:01:41.118148+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9626b997-1939-4697-a57e-10034bf9a276", "role": "admin", "email": "vignesh.bs06@gmail.com", "full_name": "VIGNESH B S", "last_name": "B S", "first_name": "VIGNESH", "email_verified": true, "phone_verified": false}', NULL, '2025-11-01 07:32:28.462438+00', '2025-11-01 19:01:41.122573+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'dd17c134-d5f6-4f6d-b116-73831c6f9a37', 'authenticated', 'authenticated', 'abc@gmail.com', '$2a$10$A8r5OLCb2.W6ZxaLGo8Kd.avpNkoslRg.XnYfJeRa1MB1n.xFbJwu', '2025-10-24 11:50:58.334777+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-24 11:50:58.339622+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "dd17c134-d5f6-4f6d-b116-73831c6f9a37", "role": "teacher", "email": "abc@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": true, "phone_verified": false}', NULL, '2025-10-24 11:50:58.319848+00', '2025-10-24 16:42:45.615846+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '25d8b8be-ab84-4758-91e0-427db617eeab', 'authenticated', 'authenticated', '1ms23ad004@msrit.edu', '$2a$10$D5dIRbHUI.NQiIIBAlcY2eZrglF7Q8mit5XVxOM/B8C55WRrivTQ2', '2025-09-22 18:20:41.383992+00', NULL, '', NULL, '', '2025-10-20 12:41:41.727066+00', '', '', NULL, '2025-10-20 12:42:37.523948+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Khan", "school_id": 1, "first_name": "Zara", "phone_number": "9392071408", "date_of_birth": "2016-06-21", "email_verified": true}', NULL, '2025-09-22 18:20:41.380006+00', '2025-10-20 12:42:37.525979+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3a834f54-5135-4dab-8fe5-fa4ef16dd792', 'authenticated', 'authenticated', 'student.01eac18b-d003-44a8-8305-51281da82b79@example.com', '$2a$10$sBzHgxE86mBK189.4HSsPu8YHq35lfxp/TAYjNYqSzfi4zaWv.AV6', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:24:46.097967+00', '2025-10-07 07:24:46.105053+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'authenticated', 'authenticated', 'abhisheklgowda05@gmail.com', '$2a$10$428qIVXYtasf883Vjt2IQeZZQskkbM5rqXhQEywgwjAToTl8Bb4DS', '2025-09-22 18:20:34.96108+00', NULL, '', NULL, '', '2025-11-01 14:45:31.928459+00', '', '', NULL, '2025-11-06 10:59:33.837413+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Sharma", "school_id": 1, "first_name": "Priya", "phone_number": "9748940106", "date_of_birth": "1985-05-20", "email_verified": true}', NULL, '2025-09-22 18:20:34.953916+00', '2025-11-06 10:59:33.853365+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bba67f0f-0c9f-4899-9302-63ae117577f7', 'authenticated', 'authenticated', 'student.3fa504f7-eb3e-4ae2-9e47-bc8cc9e58722@example.com', '$2a$10$cO5omBv4zayTdqz.vAyrve9Zj5oCgWi4GCapWLViIwk3aYnqU7aKq', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-06 15:29:21.451947+00', '2025-10-06 15:29:21.475625+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '509ab322-fb8f-4cbb-b778-b881d3ca0e11', 'authenticated', 'authenticated', 'student.ce5d65d4-db9c-4146-a822-388d613e0dc0@example.com', '$2a$10$Yvg2TOS/.wA9pL0MbzqDWeTCk8BHZKSFp6E3/tNklNlesB7UdnkOO', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 06:53:00.508518+00', '2025-10-07 06:53:00.54833+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6ed6b164-9b11-49b3-a9ef-8241681fce37', 'authenticated', 'authenticated', 'student.2eeaef70-8379-408e-9323-fe58c88a2a9c@example.com', '$2a$10$xGV4Z6cTx99GfLljGisKV.Sh8DdnRfE4N42EfjQszjLr9GEQwww6e', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:15:25.006526+00', '2025-10-07 07:15:25.026583+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4c7bdf24-d6b1-42ea-9ced-638773d08527', 'authenticated', 'authenticated', 'student.18f19378-6193-45a2-a709-a18394c66270@example.com', '$2a$10$1AE981K6P5VcuKMdhhqMSuh1iY0VUcxF7Z6mVovReHcCKQyPp.LJq', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:30:41.189849+00', '2025-10-07 07:30:41.201109+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5d9e1c9f-980c-47b1-bd87-2b54c6810c86', 'authenticated', 'authenticated', 'student.dda3781d-abc1-467c-bbb6-2dd82233e03d@example.com', '$2a$10$FtJOstrdhfv64J899A1ym.MEJjo/FTDQ.KTsxRifLx6SAWMVOP4nu', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:50:19.454942+00', '2025-10-07 07:50:19.468727+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6016ef26-05d5-4d23-b0b1-8b6d6af73cad', 'authenticated', 'authenticated', 'abhishekl1792005@gmail.com', '$2a$10$OH.FwixF4TxyMGZV4wCy/uwOGOl4G.WdR86X0mi4g0ChHV7QQK6vS', '2025-09-22 18:20:44.684759+00', NULL, '', NULL, '', '2025-10-18 18:35:00.099898+00', '', '', NULL, '2025-10-18 18:35:10.549579+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Verma", "school_id": 1, "first_name": "Nitin", "phone_number": "9257550707", "date_of_birth": "1984-11-25", "email_verified": true}', NULL, '2025-09-22 18:20:44.680038+00', '2025-10-18 18:35:10.564462+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9c2d3636-b90c-44cf-b67a-848fc1f076a3', 'authenticated', 'authenticated', 'abhishek@gmail.com', '$2a$10$MYe1FTwlwVDt4HVMKBimn.S4TIsZe2DyJWMbAfvpsyDzXq7RyM3HC', '2025-10-24 16:43:56.293737+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-24 16:43:56.298586+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9c2d3636-b90c-44cf-b67a-848fc1f076a3", "role": "student", "email": "abhishek@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": true, "phone_verified": false}', NULL, '2025-10-24 16:43:56.284229+00', '2025-10-24 16:43:56.30042+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd161a8e4-a80d-4a1c-a9ab-f23f38dc2679', 'authenticated', 'authenticated', 'absdc@gmail.com', '$2a$10$lqE2kHmUvJH0wP5epEZ0bu/vPaJ0gP7UwpfoJ/r1atE3vGbphMXaK', '2025-10-24 16:43:21.921708+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-24 16:43:21.931618+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d161a8e4-a80d-4a1c-a9ab-f23f38dc2679", "role": "parent", "email": "absdc@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": true, "phone_verified": false}', NULL, '2025-10-24 16:43:21.874528+00', '2025-10-24 16:43:21.940796+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9be00d6e-f4fd-4095-8a42-339eae5b751d', 'authenticated', 'authenticated', 'test.student.9bbf7366-9f01-4c7c-a03b-9959b80f9bc6@example.com', '$2a$10$nCRx21DpDFnJLyamGznLDe9b4QXXe.elKYD8lno.nO11R8sB7vEpy', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-06 08:58:24.361204+00', '2025-10-06 08:58:24.455095+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 'authenticated', 'authenticated', '1ms23ai001@msrit.edu', '$2a$10$6Rr1hcNRNvZt8z5rFkkHWukWDbHz.T17V9rYjBTX2X9lbieaA5PtS', '2025-10-08 15:10:12.12653+00', NULL, '', NULL, '', '2025-10-22 09:02:30.22434+00', '', '', NULL, '2025-10-22 09:03:24.985575+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-10-08 15:10:12.064712+00', '2025-10-22 09:03:25.171163+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '685c4887-fc38-4d76-a342-ec29de3e0f85', 'authenticated', 'authenticated', 'abhaybs2305@gmail.com', '', '2025-10-09 16:29:26.339624+00', '2025-10-03 13:00:42.537794+00', '', '2025-10-03 13:00:42.537794+00', '', '2025-10-20 11:52:28.432338+00', '', '', NULL, '2025-10-20 11:53:00.169055+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "M", "last_name": "Kumar", "school_id": 1, "first_name": "Suresh", "phone_number": "9876543210", "date_of_birth": "1990-05-10", "email_verified": true}', NULL, '2025-10-03 10:23:23.391999+00', '2025-10-20 11:53:00.205606+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b393e32d-fb28-4de5-9713-eeebad9d2c06', 'authenticated', 'authenticated', 'teacher.verma@tapasyavp.edu.in', '$2a$10$YOqhzorpDt.I00i3FYS60esuk4W9ke9NLKPX82dxsZij6y.r7vULC', '2025-09-22 18:20:36.379654+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Verma", "school_id": 1, "first_name": "Anjali", "phone_number": "9262965695", "date_of_birth": "1992-07-22", "email_verified": true}', NULL, '2025-09-22 18:20:36.375395+00', '2025-09-22 18:20:36.380376+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2c0d82ea-c145-4fa9-82eb-9e5f7556b416', 'authenticated', 'authenticated', 'test.student.7927544e-a625-4d05-ada9-06bd13963c5f@example.com', '$2a$10$5tez9oovzfPKErh5vuR0wuytDwXAOHKB2nVHK4fLW/jMWPGRnpM7q', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-06 09:01:04.217186+00', '2025-10-06 09:01:04.228512+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'da134162-0d5d-4215-b93b-aefb747ffa17', 'authenticated', 'authenticated', 'teacher.gupta@tapasyavp.edu.in', '$2a$10$bbX2YQfP/FKjfBpbt/NPs.k227/bhl78Gl8hWwp7ldojQE4n9MQyS', '2025-09-22 18:20:35.841052+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-15 09:09:06.479257+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Gupta", "school_id": 1, "first_name": "Sunita", "phone_number": "9325369069", "date_of_birth": "1990-02-10", "email_verified": true}', NULL, '2025-09-22 18:20:35.837076+00', '2025-10-15 09:09:06.520859+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '63bed14f-2514-45a2-a718-04c1d0a0b7f0', 'authenticated', 'authenticated', 'student.aarav.sharma@tapasyavp.edu.in', '$2a$10$c7UKa2eCEY4M7kYSWhrZYOiy4ZnV0Ed.ISGapED/xEHi8be5A62t.', '2025-09-22 18:20:37.965142+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Sharma", "school_id": 1, "first_name": "Aarav", "phone_number": "9509754835", "date_of_birth": "2015-06-10", "email_verified": true}', NULL, '2025-09-22 18:20:37.960635+00', '2025-09-22 18:20:37.965788+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9afe1c7f-2102-4d5f-aa96-447fbc1b3392', 'authenticated', 'authenticated', 'student.1310f718-6edd-43c8-99e3-ab2fcf1e862c@example.com', '$2a$10$IkJiNfXGVg001pEvu6TQ4ebOYNXe7u6VchHZMMhbFVG9nIy5xX0Aa', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-06 15:31:48.649015+00', '2025-10-06 15:31:48.65877+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '70cee473-d0a2-4484-8a84-e0a5cd4e584c', 'authenticated', 'authenticated', 'teacher.mishra@tapasyavp.edu.in', '$2a$10$LzN5wX2V5dSMbK6ctWuNmuRYOSf.Le9i89FPl7Kl3hybnu1qx19sa', '2025-09-22 18:20:36.638806+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-08 15:32:26.409227+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Mishra", "school_id": 1, "first_name": "Sanjay", "phone_number": "9690521119", "date_of_birth": "1984-01-05", "email_verified": true}', NULL, '2025-09-22 18:20:36.634431+00', '2025-10-08 15:32:26.456069+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', 'authenticated', 'authenticated', 'teacher.nair@tapasyavp.edu.in', '$2a$10$EBLpIEA/IKiKozJdfopjAeu5aaEgYDlsrtmmfpAqyWGw2ayi4nvZ6', '2025-09-22 18:20:37.422566+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-06 08:23:18.47948+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Nair", "school_id": 1, "first_name": "Kavita", "phone_number": "9313064476", "date_of_birth": "1991-03-25", "email_verified": true}', NULL, '2025-09-22 18:20:37.418647+00', '2025-11-06 08:23:18.495232+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a646d383-77db-42af-936d-f5587be4d961', 'authenticated', 'authenticated', 'student.60e259cc-6d6e-4c64-91ae-8d7b78cbf02a@example.com', '$2a$10$vBgdvK2MnL1T3OGyoz5ycOE4DzBf2gyCZA9nNqBp4hbsrhUoVZ5PW', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 06:35:12.200493+00', '2025-10-07 06:35:12.250375+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '558b7c95-a041-4f11-acf8-3ade6aecbba5', 'authenticated', 'authenticated', 'student.b7cb72e0-ae10-4f74-8321-71d35629ec72@example.com', '$2a$10$vaBu6W3OezaATKvsGGKXJ.JHqNzeGql9YhGnNtbnJP8t2XL277KE6', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-10 09:53:45.290959+00', '2025-10-10 09:53:45.330201+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4a39dc4b-5f95-45b0-9b4f-67b253943233', 'authenticated', 'authenticated', 'vignesh.bs0@gmail.com', '', NULL, '2025-11-01 19:25:03.505435+00', '2bc072442f1ea35a36254d75bdf282a894181325f2b0d57e03dbe9c9', '2025-11-01 19:25:03.505435+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": null, "last_name": "sharma", "school_id": 1, "first_name": "mishra", "phone_number": "1919191919", "date_of_birth": null}', NULL, '2025-11-01 19:25:03.496036+00', '2025-11-01 19:25:06.038752+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', 'authenticated', 'authenticated', 'teacher.iyer@tapasyavp.edu.in', '$2a$10$d/zz6khevns.SZhBIfea0.jmZf1v1tWHg0IDKfG.Q4qiU2bjFJdOW', '2025-09-22 18:20:37.688198+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-12 05:22:31.566497+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Iyer", "school_id": 1, "first_name": "Arun", "phone_number": "9728587981", "date_of_birth": "1982-12-01", "email_verified": true}', NULL, '2025-09-22 18:20:37.685103+00', '2025-10-12 05:22:31.597384+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5f6f441a-ae4c-413c-9539-19e0e2ff9a66', 'authenticated', 'authenticated', 'student.67ca9f6e-cd8b-4595-8b85-89fd8f9ee065@example.com', '$2a$10$xTK97FVG4MMxVwNlnvSih.rPgHp3jlTsSnMx58DbE6SXlJzF5/p8m', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:00:14.04039+00', '2025-10-07 07:00:14.05366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '45c6ac9c-9306-40f1-a23d-fbfea313c794', 'authenticated', 'authenticated', 'student.rohan.kumar@tapasyavp.edu.in', '$2a$10$7jKB9zb5nLDcHwGbO9RbhuNf7v3NQteGzRyxwRHoCn9HmJ3HrKBY2', '2025-09-22 18:20:38.485908+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Kumar", "school_id": 1, "first_name": "Rohan", "phone_number": "9272164076", "date_of_birth": "2016-01-15", "email_verified": true}', NULL, '2025-09-22 18:20:38.481868+00', '2025-09-22 18:20:38.486534+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', 'authenticated', 'authenticated', 'teacher.singh@tapasyavp.edu.in', '$2a$10$66H9OKW12zVI9/RBUrPqf.vDiBAwjNVstmsy7xj02wuZvjJ06SuDu', '2025-09-22 18:20:36.896211+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-11 07:29:38.03222+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Singh", "school_id": 1, "first_name": "Meena", "phone_number": "9580646887", "date_of_birth": "1986-09-18", "email_verified": true}', NULL, '2025-09-22 18:20:36.892398+00', '2025-10-11 07:29:38.070352+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'authenticated', 'authenticated', 'teacher.kumar@tapasyavp.edu.in', '$2a$10$GNzD0wk0R2F3/nj78NHDOOXyZjFQoWji2g1lJy3IYlEl2b.2PCIL2', '2025-09-22 18:20:36.106945+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-06 09:12:49.664701+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Kumar", "school_id": 1, "first_name": "Rajesh", "phone_number": "9353458366", "date_of_birth": "1989-08-30", "email_verified": true}', NULL, '2025-09-22 18:20:36.102627+00', '2025-11-06 09:12:49.70619+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cb0cf1e2-19d0-4ae3-93ed-3073a47a5058', 'authenticated', 'authenticated', 'student.priya.singh@tapasyavp.edu.in', '$2a$10$xZOOOkfb.uaIUzIKa3hdg.eGbShJha8dh/VmVH4ydjuwiNEWw5e9y', '2025-09-22 18:20:38.735409+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Singh", "school_id": 1, "first_name": "Priya", "phone_number": "9927540900", "date_of_birth": "2016-03-30", "email_verified": true}', NULL, '2025-09-22 18:20:38.731454+00', '2025-09-22 18:20:38.736089+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '226cb810-8e16-4a3d-a879-2c1b325edbeb', 'authenticated', 'authenticated', 'student.ishita.nair@tapasyavp.edu.in', '$2a$10$UFSmdvnrWHCe5GiFKn/LTO2ENHwCkwvdUBquwW4Q22/BKruEeG8m6', '2025-09-22 18:20:39.79886+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Nair", "school_id": 1, "first_name": "Ishita", "phone_number": "9707725382", "date_of_birth": "2018-04-18", "email_verified": true}', NULL, '2025-09-22 18:20:39.793347+00', '2025-09-22 18:20:39.799519+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9caad150-de2c-478a-87b6-a712e412947f', 'authenticated', 'authenticated', 'student.aditya.verma@tapasyavp.edu.in', '$2a$10$2QMKMczSjHHI4Qx//ZSPLu83hsidN4yiVRZgKM6kOfEWmKsbSaw26', '2025-09-22 18:20:38.993114+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Verma", "school_id": 1, "first_name": "Aditya", "phone_number": "9593936150", "date_of_birth": "2017-05-05", "email_verified": true}', NULL, '2025-09-22 18:20:38.989072+00', '2025-09-22 18:20:38.993758+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd8fab006-304c-43bc-a8db-597fdf947c9e', 'authenticated', 'authenticated', 'student.kabir.shah@tapasyavp.edu.in', '$2a$10$mIFZXGB9x3vulkU.TfaJnOl8H5gYfL3VVZMmTFOOF.bAYFGzND67y', '2025-09-22 18:20:40.593587+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Shah", "school_id": 1, "first_name": "Kabir", "phone_number": "9621819788", "date_of_birth": "2015-04-01", "email_verified": true}', NULL, '2025-09-22 18:20:40.589058+00', '2025-09-22 18:20:40.5944+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3b3f1289-d861-45e2-b4e4-f18d72ca5036', 'authenticated', 'authenticated', 'student.ananya.gupta@tapasyavp.edu.in', '$2a$10$uW6vfXx5YwTT4ieUbGFUuecj7ziyzApBL3Mcj3dzNM2eyrk.1YWG6', '2025-09-22 18:20:39.282283+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Gupta", "school_id": 1, "first_name": "Ananya", "phone_number": "9424980771", "date_of_birth": "2017-07-12", "email_verified": true}', NULL, '2025-09-22 18:20:39.277246+00', '2025-09-22 18:20:39.282996+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd77de604-114c-4c71-8b8c-5616db827da7', 'authenticated', 'authenticated', 'student.arjun.menon@tapasyavp.edu.in', '$2a$10$57aP4jXJ08GgVoYBMWPiLOuQZAvqkxbGHqtFyC4ezIOOIEO7ZmDFO', '2025-09-22 18:20:40.057925+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Menon", "school_id": 1, "first_name": "Arjun", "phone_number": "9377428607", "date_of_birth": "2019-09-03", "email_verified": true}', NULL, '2025-09-22 18:20:40.053695+00', '2025-09-22 18:20:40.059163+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '604f3f2f-0741-4ec8-9667-d3f0ecdc76be', 'authenticated', 'authenticated', 'student.vihaan.reddy@tapasyavp.edu.in', '$2a$10$a5ShK/429T2Ghy7mDNIQCOsoi9J1njY1p3Rk8i31Hs/0SinxpGdve', '2025-09-22 18:20:39.539524+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Reddy", "school_id": 1, "first_name": "Vihaan", "phone_number": "9675709024", "date_of_birth": "2018-02-25", "email_verified": true}', NULL, '2025-09-22 18:20:39.535626+00', '2025-09-22 18:20:39.540217+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '706c538d-4134-4cc1-be7e-fb11fa771bfb', 'authenticated', 'authenticated', 'student.vivaan.rao@tapasyavp.edu.in', '$2a$10$k2fXLTM6xCRhtLU8IMr.De/7hPxBHDJqRo5ZNZjUcjlk7RysT8nga', '2025-09-22 18:20:41.126942+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Rao", "school_id": 1, "first_name": "Vivaan", "phone_number": "9440494564", "date_of_birth": "2016-02-14", "email_verified": true}', NULL, '2025-09-22 18:20:41.12317+00', '2025-09-22 18:20:41.127693+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '12fcf33f-7c54-4466-a44c-ad7602b2c2bc', 'authenticated', 'authenticated', 'student.saanvi.joshi@tapasyavp.edu.in', '$2a$10$IJO1ZLL.EPx68XRy1KnJMeSqtXxzDmj2NFQtv5.BPzxHa4Cxxoyg6', '2025-09-22 18:20:40.324301+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Joshi", "school_id": 1, "first_name": "Saanvi", "phone_number": "9914569628", "date_of_birth": "2019-11-20", "email_verified": true}', NULL, '2025-09-22 18:20:40.32039+00', '2025-09-22 18:20:40.324977+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4', 'authenticated', 'authenticated', 'student.myra.mishra@tapasyavp.edu.in', '$2a$10$CEttdU.1mOtpGWMTGbCAKufSLY8A9Zv2.2/9km8ppQBdPlV1br0dy', '2025-09-22 18:20:40.862562+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Mishra", "school_id": 1, "first_name": "Myra", "phone_number": "9685937748", "date_of_birth": "2015-10-09", "email_verified": true}', NULL, '2025-09-22 18:20:40.858935+00', '2025-09-22 18:20:40.863275+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '05a88040-b0e2-481c-a9a3-f4b5e169dedd', 'authenticated', 'authenticated', 'test.student.88482d9a-dbe5-4c42-8eca-ec691eda9402@schoolos.com', '$2a$10$mOZvY0DTd.8nqGh8nD2l3un8OzGAPPE0FhyAlYg95CBYmrGFlLDba', '2025-10-05 18:51:51.053526+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Verma", "school_id": 1, "first_name": "Rohan", "phone_number": null, "date_of_birth": "2010-05-20", "email_verified": true}', NULL, '2025-10-05 18:51:50.986912+00', '2025-10-05 18:51:51.05882+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f46c80a9-0e4f-4308-b266-8ddc28ff2228', 'authenticated', 'authenticated', 'student.aryan.iyer@tapasyavp.edu.in', '$2a$10$KOUBFQgDQ8qLpeAOghQ1iOt.MuTr/DNaYs68kCVLYp9HtNbqz94WG', '2025-09-22 18:20:41.646526+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Iyer", "school_id": 1, "first_name": "Aryan", "phone_number": "9350244938", "date_of_birth": "2017-08-19", "email_verified": true}', NULL, '2025-09-22 18:20:41.642093+00', '2025-09-22 18:20:41.647289+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b4e9499b-5580-488e-8163-e4706459dfb8', 'authenticated', 'authenticated', 'student.avni.pillai@tapasyavp.edu.in', '$2a$10$SWgxdXZa8bBMvnc8G5/O1uhvddXbn6y6hZKyj3hfJWPdk.LbV4iTu', '2025-09-22 18:20:41.903729+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Pillai", "school_id": 1, "first_name": "Avni", "phone_number": "9661964771", "date_of_birth": "2017-12-02", "email_verified": true}', NULL, '2025-09-22 18:20:41.899029+00', '2025-09-22 18:20:41.904462+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '18ad651a-fce9-44aa-9d8c-1c4942b752af', 'authenticated', 'authenticated', 'student.0da71fb4-4baf-4701-aae1-1ad30d878930@example.com', '$2a$10$.aIzWOEZuRCfK8XbZb3NfeQ0bPruOqZ52wTwhftjJKKXMdPnzzNTm', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-06 15:23:02.068959+00', '2025-10-06 15:23:02.102881+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cd307408-9c83-475e-a874-be26288d534c', 'authenticated', 'authenticated', 'ashar808@gmail.com', '', NULL, '2025-11-01 19:58:11.92725+00', '5abcc8a78a708f320803b5cd969fd0a9e25b3fce18e2e3e1bc94a70a', '2025-11-01 19:58:11.92725+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": null, "last_name": "W", "school_id": 1, "first_name": "ashhar", "phone_number": "9019191919", "date_of_birth": null}', NULL, '2025-11-01 19:58:11.88188+00', '2025-11-01 19:58:14.678749+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', 'authenticated', 'authenticated', 'parent.pooja.patel@tapasyavp.edu.in', '$2a$10$tCA6F/zC5ZEI8aCEKnlpjuAEcznajApPe/74c0FAQNCS3f5efmtW.', '2025-09-22 18:20:43.849134+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-01 17:22:48.770762+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Patel", "school_id": 1, "first_name": "Pooja", "phone_number": "9221551833", "date_of_birth": "1983-09-11", "email_verified": true}', NULL, '2025-09-22 18:20:43.846062+00', '2025-11-01 18:29:44.970089+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4d68700c-6741-4abf-a51e-718a58b75500', 'authenticated', 'authenticated', 'student.anika.agarwal@tapasyavp.edu.in', '$2a$10$FQ6fZ458OoAdkDm.GrsdvuUEFGuOkFDI9JvCkXNm4o6PzWwT2IVde', '2025-09-22 18:20:42.407842+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Agarwal", "school_id": 1, "first_name": "Anika", "phone_number": "9182827568", "date_of_birth": "2018-09-28", "email_verified": true}', NULL, '2025-09-22 18:20:42.403128+00', '2025-09-22 18:20:42.408529+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 'authenticated', 'authenticated', 'parent.rina.sharma@tapasyavp.edu.in', '$2a$10$A6D6cQ133UKnev5FFgrXEOtSiHqartpp2DfYG.rrutIvsjq13MXyi', '2025-09-22 18:20:43.427078+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-01 18:39:28.175088+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Sharma", "school_id": 1, "first_name": "Rina", "phone_number": "9125368670", "date_of_birth": "1982-03-22", "email_verified": true}', NULL, '2025-09-22 18:20:43.423973+00', '2025-11-01 18:39:28.177438+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6bbe0fc4-7caa-4705-a87d-2114dd189669', 'authenticated', 'authenticated', 'student.krishna.murthy@tapasyavp.edu.in', '$2a$10$auWdc/.JncnrKt1deEE3e.1oQRVmcjOfrJZv/OzY2epiSv4Y3X61a', '2025-09-22 18:20:42.662307+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Murthy", "school_id": 1, "first_name": "Krishna", "phone_number": "9531416041", "date_of_birth": "2019-01-31", "email_verified": true}', NULL, '2025-09-22 18:20:42.658331+00', '2025-09-22 18:20:42.662956+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b195fe70-8761-4c73-a7db-5c95f68ca89b', 'authenticated', 'authenticated', 'student.aadhya.das@tapasyavp.edu.in', '$2a$10$vLll34f95/6MKTaxmzLyB.QWXt9nHkEd8m/ZO6X3DUonwjblVsx4m', '2025-09-22 18:20:42.927447+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Das", "school_id": 1, "first_name": "Aadhya", "phone_number": "9224005476", "date_of_birth": "2019-10-16", "email_verified": true}', NULL, '2025-09-22 18:20:42.923918+00', '2025-09-22 18:20:42.928495+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2a2a83fa-2910-4fb5-8e23-23a3c3b667a3', 'authenticated', 'authenticated', 'parent.geeta.singh@tapasyavp.edu.in', '$2a$10$AqF2fD5ivCWq9azuw7TBAueZ/Gtw7R3hz9y.t.srjhO08mJH8BNve', '2025-09-22 18:20:44.401906+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Singh", "school_id": 1, "first_name": "Geeta", "phone_number": "9566724662", "date_of_birth": "1985-04-19", "email_verified": true}', NULL, '2025-09-22 18:20:44.398211+00', '2025-09-22 18:20:44.402529+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fbd44ebd-1994-4c93-8359-8dbdea32a1e9', 'authenticated', 'authenticated', 'parent.alok.gupta@tapasyavp.edu.in', '$2a$10$EsR0hQ8mJNzH51QbxSIlQOpdhimLTehof2Dk6zaBd5PXynbe97x3m', '2025-09-22 18:20:45.450058+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-09 16:51:48.938696+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Gupta", "school_id": 1, "first_name": "Alok", "phone_number": "9234394750", "date_of_birth": "1986-06-12", "email_verified": true}', NULL, '2025-09-22 18:20:45.446989+00', '2025-10-09 16:51:48.974111+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '437bdd8c-d32c-42f2-911a-cd0b6768fa9d', 'authenticated', 'authenticated', 'parent.manoj.kumar@tapasyavp.edu.in', '$2a$10$MaJGT49A5mfnLTPZxYmgT.Ugf/QeFnChpIydpX.thErtT5YAqpSQC', '2025-09-22 18:20:44.11056+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Kumar", "school_id": 1, "first_name": "Manoj", "phone_number": "9843232774", "date_of_birth": "1983-02-01", "email_verified": true}', NULL, '2025-09-22 18:20:44.107518+00', '2025-09-22 18:20:44.111235+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c238591e-69ed-424f-b633-8fe0f68f81be', 'authenticated', 'authenticated', 'parent.deepika.verma@tapasyavp.edu.in', '$2a$10$6liWfTxWT63uB54jN9T3s.WvLSxoLg.5uQjDlNZxs4gUePBYaKwI6', '2025-09-22 18:20:44.885897+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Verma", "school_id": 1, "first_name": "Deepika", "phone_number": "9811583489", "date_of_birth": "1986-01-30", "email_verified": true}', NULL, '2025-09-22 18:20:44.88258+00', '2025-09-22 18:20:44.886582+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a36b35d2-021c-42a9-b8e7-d13465b82281', 'authenticated', 'authenticated', 'test.student.624d7db5-75ab-4274-afd7-3889b312307d@schoolos.com', '$2a$10$by4U90IeYJ0LuW6xTnhdDeNbrkRJHDiUEUq5uo8/z4XsWOESpcEYm', '2025-10-05 18:51:52.535648+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Verma", "school_id": 1, "first_name": "Rohan", "phone_number": null, "date_of_birth": "2010-05-20", "email_verified": true}', NULL, '2025-10-05 18:51:52.523142+00', '2025-10-05 18:51:52.540529+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'dff67664-a554-4629-8e07-f0a6f640ee6d', 'authenticated', 'authenticated', 'student.reyansh.shetty@tapasyavp.edu.in', '$2a$10$GevJ/C4K0QzINXVMq2vJg.rrY3YWSClWMhx7w9gpG2nR43KoQBfUW', '2025-09-22 18:20:42.156467+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-24 11:55:36.216252+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Shetty", "school_id": 1, "first_name": "Reyansh", "phone_number": "9398724051", "date_of_birth": "2018-07-07", "email_verified": true}', NULL, '2025-09-22 18:20:42.152508+00', '2025-10-24 11:55:36.233211+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4808a1be-01b6-44c1-a17a-c9f104b40854', 'authenticated', 'authenticated', 'teacher.patel@tapasyavp.edu.in', '$2a$10$FTIt9OpUkOCPgKMT4DdQPOyLIUhZqtYq41aGhNr7fJHyU9hWQMCge', '2025-09-22 18:20:35.519723+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-15 06:20:52.76606+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Patel", "school_id": 1, "first_name": "Amit", "phone_number": "9164310166", "date_of_birth": "1988-11-15", "email_verified": true}', NULL, '2025-09-22 18:20:35.51608+00', '2025-10-15 06:20:52.826977+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', 'authenticated', 'authenticated', 'teacher.rao@tapasyavp.edu.in', '$2a$10$03kD5IMurkkObJonGBSNpO8slVD68g44vbsqaEepG58JgUJx4qXgu', '2025-09-22 18:20:37.170296+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-03 18:15:44.8284+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Rao", "school_id": 1, "first_name": "Vikram", "phone_number": "9655312833", "date_of_birth": "1993-04-12", "email_verified": true}', NULL, '2025-09-22 18:20:37.164036+00', '2025-11-06 08:18:44.433414+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4', 'authenticated', 'authenticated', 'parent.vikram.reddy@tapasyavp.edu.in', '$2a$10$8z7FcE7ef1SfKdmIZVdSWe0na7r/MkaUI/CZRltEz/8HRIwMxCWki', '2025-09-22 18:20:45.741302+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Reddy", "school_id": 1, "first_name": "Vikram", "phone_number": "9385527829", "date_of_birth": "1985-08-09", "email_verified": true}', NULL, '2025-09-22 18:20:45.736639+00', '2025-09-22 18:20:45.742054+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac', 'authenticated', 'authenticated', 'parent.anil.joshi@tapasyavp.edu.in', '$2a$10$Jry72negf0ll3MaOXttSke0T9Zv987HFkX/Y/KLdFSDZE7FNa8pcm', '2025-09-22 18:20:46.616992+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Joshi", "school_id": 1, "first_name": "Anil", "phone_number": "9426386794", "date_of_birth": "1988-12-18", "email_verified": true}', NULL, '2025-09-22 18:20:46.61212+00', '2025-09-22 18:20:46.617887+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'eafae832-a41c-426f-a182-f8f6b1f87e97', 'authenticated', 'authenticated', 'student.2ccc8ae5-a102-4164-aa4f-f9aed8909378@example.com', '$2a$10$FJ5UocqcAGU6SIgDeY6tjOVTnbYvFl3sWsTnu31yWNM6k.62G.BN2', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 06:41:33.880949+00', '2025-10-07 06:41:33.889087+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '09351a3e-1149-465e-8e5d-dce65f769985', 'authenticated', 'authenticated', 'test.student.93cc417f-51d4-4aaa-9b39-fdf7dab824c4@schoolos.com', '$2a$10$OhRIg.mgL.A073mO.VYtveFKpTzf4raybfpf/mq0yqpFP0ghglN5q', '2025-10-05 18:55:06.501933+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Verma", "school_id": 1, "first_name": "Rohan", "phone_number": null, "date_of_birth": "2010-05-20", "email_verified": true}', NULL, '2025-10-05 18:55:06.454356+00', '2025-10-05 18:55:06.504841+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3f720771-43ec-4bb3-9ebf-02ac19d8960c', 'authenticated', 'authenticated', 'parent.rajesh.nair@tapasyavp.edu.in', '$2a$10$qLOr9DS4K28k49gInQ8KKufZ60pbz4m86A.tMlqVxgwnJLlfm4aKK', '2025-09-22 18:20:46.207973+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Nair", "school_id": 1, "first_name": "Rajesh", "phone_number": "9350309603", "date_of_birth": "1987-04-07", "email_verified": true}', NULL, '2025-09-22 18:20:46.205043+00', '2025-09-22 18:20:46.208575+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd0aba71f-57b7-46bd-8d6d-a76c66987810', 'authenticated', 'authenticated', 'parent.kavya.joshi@tapasyavp.edu.in', '$2a$10$5xJpf7.XHYjXuctrb6rCQuigkYEHUsG/Q3BraA4/oVgnviJqxvPAq', '2025-09-22 18:20:46.812036+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Joshi", "school_id": 1, "first_name": "Kavya", "phone_number": "9566931094", "date_of_birth": "1990-02-28", "email_verified": true}', NULL, '2025-09-22 18:20:46.809058+00', '2025-09-22 18:20:46.812697+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ca967e27-a291-4796-8159-ecc8854871ae', 'authenticated', 'authenticated', 'bhuvanbalajiv@gmail.com', '$2a$10$UvtL1ZItK5m1foAr/1BJ/eEuTXlsXdqwG5X5fOzJeUh5JJhTVWUUm', '2025-10-12 13:51:02.738427+00', '2025-10-12 13:50:26.230395+00', '', NULL, '', NULL, '', '', NULL, '2025-10-12 13:51:02.747977+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-10-12 13:50:26.143569+00', '2025-10-12 13:51:02.781098+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'eb064229-c344-4350-b01b-3e8d09be68b3', 'authenticated', 'authenticated', 'parent.anjali.menon@tapasyavp.edu.in', '$2a$10$7h4nuzR2LX8ZerO2xMH7ku7Xi.fdnQthdd8ajArap/ryBBltbFw6a', '2025-09-22 18:20:46.410135+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Menon", "school_id": 1, "first_name": "Anjali", "phone_number": "9985993729", "date_of_birth": "1989-05-29", "email_verified": true}', NULL, '2025-09-22 18:20:46.407143+00', '2025-09-22 18:20:46.410809+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ee0daccb-0f05-4acb-b13e-13491af2ae0d', 'authenticated', 'authenticated', 'bitpodcast@gmail.com', '$2a$10$NQMpczqYIvH7JU9u/kXhwOrSYnNrjtkaUV.1TVbyQwZaSrC3qYJbW', '2025-10-12 13:52:25.913523+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-10-12 13:52:25.902296+00', '2025-10-12 13:52:25.915511+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '86ee5391-69dd-48db-9673-edc6aa5a61bd', 'authenticated', 'authenticated', 'student.f5804710-8402-4750-80e3-8302ee54b3a0@example.com', '$2a$10$WBFlduG8YsP7mLdxdD/RAehtUuJOhXEKsiVlbhjOL7ZBA3oSn7WkW', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:19:26.376975+00', '2025-10-07 07:19:26.383441+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8e1c55bf-3a17-4ea9-bf99-77d7a459feb1', 'authenticated', 'authenticated', 'student.3fd11782-d909-4639-8e94-90109f53d6a6@example.com', '$2a$10$RYtmPDqU52KOyqFigzhWMeR2AYNpTF5mdoTZWWQfRbKykJ.wUcPDu', NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-07 07:36:23.287404+00', '2025-10-07 07:36:23.308251+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '94782a1f-7739-4d83-ab9b-d6933f78ec59', 'authenticated', 'authenticated', 'bitpodcast24@gmail.com', '$2a$10$SGDBAJQhY56i/sjp2eC5Q.K7YPTorA/jCaRRI7fBllKz1KxVvDkvK', NULL, NULL, 'd32747d2b551f3938f277426eb18858e03d0812e2af46add39dfe72b', '2025-10-19 05:43:17.923565+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "94782a1f-7739-4d83-ab9b-d6933f78ec59", "email": "bitpodcast24@gmail.com", "email_verified": false, "phone_verified": false}', NULL, '2025-10-19 05:43:17.849758+00', '2025-10-19 05:43:20.704025+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', 'authenticated', 'authenticated', 'abhinavinit@gmail.com', '$2a$10$/akQZhP8aTHcEhHvdkhawuA0DWg2XgmmqLwgA8r1DEdTMndCkEgc6', '2025-09-22 18:20:38.228001+00', NULL, '', NULL, '', '2025-10-20 12:40:18.459979+00', '', '', NULL, '2025-10-20 12:40:49.326254+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Female", "last_name": "Patel", "school_id": 1, "first_name": "Diya", "phone_number": "9807456618", "date_of_birth": "2015-08-22", "email_verified": true}', NULL, '2025-09-22 18:20:38.223749+00', '2025-10-20 12:40:49.35989+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0841a053-7266-426e-b681-1d6fab5f9974', 'authenticated', 'authenticated', 'thecartoonnetworkkids@gmail.com', '$2a$10$MCXm5uU7KtDdZlGN72fdQec96PSz.kyqDufg/Ml24KHUFVaKVLcf6', '2025-09-22 18:20:43.196142+00', NULL, '', NULL, '', '2025-11-01 14:29:42.446539+00', '', '', NULL, '2025-11-01 14:30:04.761736+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Sharma", "school_id": 1, "first_name": "Suresh", "phone_number": "9245686803", "date_of_birth": "1980-05-14", "email_verified": true}', NULL, '2025-09-22 18:20:43.193106+00', '2025-11-01 14:30:04.78045+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1ef75d00-3349-4274-8bc8-da135015ab5d', 'authenticated', 'authenticated', 'parent.hitesh.patel@tapasyavp.edu.in', '$2a$10$xqHumdRnnWNNZDx1/Em4CuJEsBfs4Q3uRKRNz0kTnaFC3W4QQ6p2y', '2025-09-22 18:20:43.644323+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-06 10:43:57.234616+00', '{"provider": "email", "providers": ["email"]}', '{"gender": "Male", "last_name": "Patel", "school_id": 1, "first_name": "Hitesh", "phone_number": "9168443745", "date_of_birth": "1981-07-03", "email_verified": true}', NULL, '2025-09-22 18:20:43.640338+00', '2025-11-06 10:43:57.245442+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('bd431bf6-6e9f-4642-84e9-f2284f92e164', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '{"sub": "bd431bf6-6e9f-4642-84e9-f2284f92e164", "email": "principal.sharma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:34.957518+00', '2025-09-22 18:20:34.957576+00', '2025-09-22 18:20:34.957576+00', '883dedb1-e705-4d25-b229-9183de389606'),
	('4808a1be-01b6-44c1-a17a-c9f104b40854', '4808a1be-01b6-44c1-a17a-c9f104b40854', '{"sub": "4808a1be-01b6-44c1-a17a-c9f104b40854", "email": "teacher.patel@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:35.517568+00', '2025-09-22 18:20:35.517636+00', '2025-09-22 18:20:35.517636+00', '48008945-91d1-41b5-9b48-e2d72a3a846e'),
	('da134162-0d5d-4215-b93b-aefb747ffa17', 'da134162-0d5d-4215-b93b-aefb747ffa17', '{"sub": "da134162-0d5d-4215-b93b-aefb747ffa17", "email": "teacher.gupta@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:35.838451+00', '2025-09-22 18:20:35.838505+00', '2025-09-22 18:20:35.838505+00', 'b3cd550f-82a6-47e2-ad2c-2f005db526e0'),
	('dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', '{"sub": "dbcff9aa-f28d-47d8-90a6-d7688bb6c41a", "email": "teacher.kumar@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:36.104006+00', '2025-09-22 18:20:36.104059+00', '2025-09-22 18:20:36.104059+00', '1e61b500-d998-4bc5-b1de-54c3dfbfba35'),
	('b393e32d-fb28-4de5-9713-eeebad9d2c06', 'b393e32d-fb28-4de5-9713-eeebad9d2c06', '{"sub": "b393e32d-fb28-4de5-9713-eeebad9d2c06", "email": "teacher.verma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:36.376757+00', '2025-09-22 18:20:36.376809+00', '2025-09-22 18:20:36.376809+00', 'df00dc8d-a4aa-4123-91d9-f849547457d4'),
	('70cee473-d0a2-4484-8a84-e0a5cd4e584c', '70cee473-d0a2-4484-8a84-e0a5cd4e584c', '{"sub": "70cee473-d0a2-4484-8a84-e0a5cd4e584c", "email": "teacher.mishra@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:36.635868+00', '2025-09-22 18:20:36.635918+00', '2025-09-22 18:20:36.635918+00', 'f24c736a-251b-4423-8b0f-9f7d0187beb3'),
	('97f8b48a-4302-4f0e-baf8-4a85f8da0cca', '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', '{"sub": "97f8b48a-4302-4f0e-baf8-4a85f8da0cca", "email": "teacher.singh@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:36.893725+00', '2025-09-22 18:20:36.893773+00', '2025-09-22 18:20:36.893773+00', '2e1ea7ef-17bc-45f5-a9b2-071ce80f5014'),
	('ce4ef0c4-c548-49ac-a71f-49655c7482d4', 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', '{"sub": "ce4ef0c4-c548-49ac-a71f-49655c7482d4", "email": "teacher.rao@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:37.165975+00', '2025-09-22 18:20:37.166026+00', '2025-09-22 18:20:37.166026+00', 'f6cba39d-0926-4089-87ae-170df8e58d18'),
	('8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '{"sub": "8585907d-5de4-4f6d-ae9a-28b26b0e86a0", "email": "teacher.nair@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:37.419918+00', '2025-09-22 18:20:37.419971+00', '2025-09-22 18:20:37.419971+00', 'a57a8074-a222-482b-875d-8348a64c379d'),
	('ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', 'ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', '{"sub": "ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b", "email": "teacher.iyer@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:37.686313+00', '2025-09-22 18:20:37.686364+00', '2025-09-22 18:20:37.686364+00', 'f5c92f9b-294b-4da8-b6e8-eea99767347a'),
	('63bed14f-2514-45a2-a718-04c1d0a0b7f0', '63bed14f-2514-45a2-a718-04c1d0a0b7f0', '{"sub": "63bed14f-2514-45a2-a718-04c1d0a0b7f0", "email": "student.aarav.sharma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:37.961853+00', '2025-09-22 18:20:37.961906+00', '2025-09-22 18:20:37.961906+00', 'e9cb4c34-678c-4d9d-b5f3-09fca937a7ba'),
	('48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', '{"sub": "48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da", "email": "student.diya.patel@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:38.225039+00', '2025-09-22 18:20:38.225091+00', '2025-09-22 18:20:38.225091+00', '695c9781-6642-4834-ace2-5edf0834b2a9'),
	('45c6ac9c-9306-40f1-a23d-fbfea313c794', '45c6ac9c-9306-40f1-a23d-fbfea313c794', '{"sub": "45c6ac9c-9306-40f1-a23d-fbfea313c794", "email": "student.rohan.kumar@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:38.483161+00', '2025-09-22 18:20:38.483212+00', '2025-09-22 18:20:38.483212+00', '03d61d29-4a42-4297-8e6e-f597a97975c1'),
	('cb0cf1e2-19d0-4ae3-93ed-3073a47a5058', 'cb0cf1e2-19d0-4ae3-93ed-3073a47a5058', '{"sub": "cb0cf1e2-19d0-4ae3-93ed-3073a47a5058", "email": "student.priya.singh@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:38.7328+00', '2025-09-22 18:20:38.732851+00', '2025-09-22 18:20:38.732851+00', '63851710-dbef-4338-9422-9b111dc7a7d3'),
	('9caad150-de2c-478a-87b6-a712e412947f', '9caad150-de2c-478a-87b6-a712e412947f', '{"sub": "9caad150-de2c-478a-87b6-a712e412947f", "email": "student.aditya.verma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:38.99039+00', '2025-09-22 18:20:38.990442+00', '2025-09-22 18:20:38.990442+00', '5b5e4bb8-6073-44cd-bb32-5291e10d51c1'),
	('3b3f1289-d861-45e2-b4e4-f18d72ca5036', '3b3f1289-d861-45e2-b4e4-f18d72ca5036', '{"sub": "3b3f1289-d861-45e2-b4e4-f18d72ca5036", "email": "student.ananya.gupta@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:39.279195+00', '2025-09-22 18:20:39.279248+00', '2025-09-22 18:20:39.279248+00', 'b4789c3a-9c86-45ca-ac75-79c6a772c686'),
	('604f3f2f-0741-4ec8-9667-d3f0ecdc76be', '604f3f2f-0741-4ec8-9667-d3f0ecdc76be', '{"sub": "604f3f2f-0741-4ec8-9667-d3f0ecdc76be", "email": "student.vihaan.reddy@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:39.536857+00', '2025-09-22 18:20:39.536907+00', '2025-09-22 18:20:39.536907+00', 'a8d9f718-21c8-475f-9969-e2650c97e64c'),
	('226cb810-8e16-4a3d-a879-2c1b325edbeb', '226cb810-8e16-4a3d-a879-2c1b325edbeb', '{"sub": "226cb810-8e16-4a3d-a879-2c1b325edbeb", "email": "student.ishita.nair@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:39.794552+00', '2025-09-22 18:20:39.794618+00', '2025-09-22 18:20:39.794618+00', '39eb8a74-50c6-46a1-ab1a-ea5af253f09c'),
	('d77de604-114c-4c71-8b8c-5616db827da7', 'd77de604-114c-4c71-8b8c-5616db827da7', '{"sub": "d77de604-114c-4c71-8b8c-5616db827da7", "email": "student.arjun.menon@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:40.055018+00', '2025-09-22 18:20:40.055073+00', '2025-09-22 18:20:40.055073+00', '4800faac-4d29-4516-955a-89d93155e46c'),
	('12fcf33f-7c54-4466-a44c-ad7602b2c2bc', '12fcf33f-7c54-4466-a44c-ad7602b2c2bc', '{"sub": "12fcf33f-7c54-4466-a44c-ad7602b2c2bc", "email": "student.saanvi.joshi@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:40.321765+00', '2025-09-22 18:20:40.321818+00', '2025-09-22 18:20:40.321818+00', '4848e3e4-9f3f-4633-85d9-3cf74818aa66'),
	('d8fab006-304c-43bc-a8db-597fdf947c9e', 'd8fab006-304c-43bc-a8db-597fdf947c9e', '{"sub": "d8fab006-304c-43bc-a8db-597fdf947c9e", "email": "student.kabir.shah@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:40.590338+00', '2025-09-22 18:20:40.590397+00', '2025-09-22 18:20:40.590397+00', '410ba434-0b4e-4c59-9188-bf5d204c7733'),
	('6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4', '6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4', '{"sub": "6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4", "email": "student.myra.mishra@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:40.860149+00', '2025-09-22 18:20:40.860198+00', '2025-09-22 18:20:40.860198+00', '7ec0afaa-cebe-4360-852c-f4ba465873aa'),
	('706c538d-4134-4cc1-be7e-fb11fa771bfb', '706c538d-4134-4cc1-be7e-fb11fa771bfb', '{"sub": "706c538d-4134-4cc1-be7e-fb11fa771bfb", "email": "student.vivaan.rao@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:41.124429+00', '2025-09-22 18:20:41.124483+00', '2025-09-22 18:20:41.124483+00', 'a4e14b21-a4fe-4f57-9d52-e86be02bff70'),
	('25d8b8be-ab84-4758-91e0-427db617eeab', '25d8b8be-ab84-4758-91e0-427db617eeab', '{"sub": "25d8b8be-ab84-4758-91e0-427db617eeab", "email": "student.zara.khan@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:41.38134+00', '2025-09-22 18:20:41.381393+00', '2025-09-22 18:20:41.381393+00', '671432ff-8ab7-4fb9-ba3b-3629c1db56c1'),
	('f46c80a9-0e4f-4308-b266-8ddc28ff2228', 'f46c80a9-0e4f-4308-b266-8ddc28ff2228', '{"sub": "f46c80a9-0e4f-4308-b266-8ddc28ff2228", "email": "student.aryan.iyer@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:41.643455+00', '2025-09-22 18:20:41.643508+00', '2025-09-22 18:20:41.643508+00', '5e255da5-d491-41ad-ab66-a0c47a461eaa'),
	('b4e9499b-5580-488e-8163-e4706459dfb8', 'b4e9499b-5580-488e-8163-e4706459dfb8', '{"sub": "b4e9499b-5580-488e-8163-e4706459dfb8", "email": "student.avni.pillai@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:41.900292+00', '2025-09-22 18:20:41.900347+00', '2025-09-22 18:20:41.900347+00', '87df772d-6363-4a76-bbfc-d38dddfbbb7c'),
	('dff67664-a554-4629-8e07-f0a6f640ee6d', 'dff67664-a554-4629-8e07-f0a6f640ee6d', '{"sub": "dff67664-a554-4629-8e07-f0a6f640ee6d", "email": "student.reyansh.shetty@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:42.153916+00', '2025-09-22 18:20:42.153968+00', '2025-09-22 18:20:42.153968+00', '62c446c4-f569-4865-81ab-b607ac22024f'),
	('4d68700c-6741-4abf-a51e-718a58b75500', '4d68700c-6741-4abf-a51e-718a58b75500', '{"sub": "4d68700c-6741-4abf-a51e-718a58b75500", "email": "student.anika.agarwal@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:42.40515+00', '2025-09-22 18:20:42.405204+00', '2025-09-22 18:20:42.405204+00', 'd29c3f02-cd11-4944-b1f8-037b4c7a97e4'),
	('6bbe0fc4-7caa-4705-a87d-2114dd189669', '6bbe0fc4-7caa-4705-a87d-2114dd189669', '{"sub": "6bbe0fc4-7caa-4705-a87d-2114dd189669", "email": "student.krishna.murthy@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:42.659585+00', '2025-09-22 18:20:42.659653+00', '2025-09-22 18:20:42.659653+00', '67cdb71b-b7e3-4ec4-8756-c91c5c6d0f3c'),
	('b195fe70-8761-4c73-a7db-5c95f68ca89b', 'b195fe70-8761-4c73-a7db-5c95f68ca89b', '{"sub": "b195fe70-8761-4c73-a7db-5c95f68ca89b", "email": "student.aadhya.das@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:42.925123+00', '2025-09-22 18:20:42.925173+00', '2025-09-22 18:20:42.925173+00', 'f5ffcbfc-a449-4bbc-afa9-c7b0622d5d70'),
	('0841a053-7266-426e-b681-1d6fab5f9974', '0841a053-7266-426e-b681-1d6fab5f9974', '{"sub": "0841a053-7266-426e-b681-1d6fab5f9974", "email": "parent.suresh.sharma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:43.194303+00', '2025-09-22 18:20:43.194351+00', '2025-09-22 18:20:43.194351+00', '30b32bcd-ce19-4531-98d9-a6836489b27c'),
	('bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', '{"sub": "bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3", "email": "parent.rina.sharma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:43.425298+00', '2025-09-22 18:20:43.425352+00', '2025-09-22 18:20:43.425352+00', '1ae2c54d-636c-42ca-a71f-8e78a6660930'),
	('1ef75d00-3349-4274-8bc8-da135015ab5d', '1ef75d00-3349-4274-8bc8-da135015ab5d', '{"sub": "1ef75d00-3349-4274-8bc8-da135015ab5d", "email": "parent.hitesh.patel@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:43.64157+00', '2025-09-22 18:20:43.641638+00', '2025-09-22 18:20:43.641638+00', 'f1ed9f70-5c69-4f4c-9981-28edbefab3c2'),
	('e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', 'e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', '{"sub": "e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404", "email": "parent.pooja.patel@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:43.847266+00', '2025-09-22 18:20:43.847319+00', '2025-09-22 18:20:43.847319+00', 'affc8698-0832-41b2-bbdb-f547c05aeb49'),
	('437bdd8c-d32c-42f2-911a-cd0b6768fa9d', '437bdd8c-d32c-42f2-911a-cd0b6768fa9d', '{"sub": "437bdd8c-d32c-42f2-911a-cd0b6768fa9d", "email": "parent.manoj.kumar@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:44.108817+00', '2025-09-22 18:20:44.108867+00', '2025-09-22 18:20:44.108867+00', 'c8513051-abb1-49cd-a8b0-973b98a4826d'),
	('2a2a83fa-2910-4fb5-8e23-23a3c3b667a3', '2a2a83fa-2910-4fb5-8e23-23a3c3b667a3', '{"sub": "2a2a83fa-2910-4fb5-8e23-23a3c3b667a3", "email": "parent.geeta.singh@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:44.399451+00', '2025-09-22 18:20:44.399502+00', '2025-09-22 18:20:44.399502+00', '7a195ffc-4d2c-4b8f-881e-f44612c8d5e1'),
	('6016ef26-05d5-4d23-b0b1-8b6d6af73cad', '6016ef26-05d5-4d23-b0b1-8b6d6af73cad', '{"sub": "6016ef26-05d5-4d23-b0b1-8b6d6af73cad", "email": "parent.nitin.verma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:44.682069+00', '2025-09-22 18:20:44.682128+00', '2025-09-22 18:20:44.682128+00', 'ba0b01ca-468c-4b35-8aeb-46d3f4cbf35c'),
	('c238591e-69ed-424f-b633-8fe0f68f81be', 'c238591e-69ed-424f-b633-8fe0f68f81be', '{"sub": "c238591e-69ed-424f-b633-8fe0f68f81be", "email": "parent.deepika.verma@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:44.883795+00', '2025-09-22 18:20:44.883846+00', '2025-09-22 18:20:44.883846+00', 'b7ce6e34-ba15-4001-aac7-469c64cdc3cb'),
	('fbd44ebd-1994-4c93-8359-8dbdea32a1e9', 'fbd44ebd-1994-4c93-8359-8dbdea32a1e9', '{"sub": "fbd44ebd-1994-4c93-8359-8dbdea32a1e9", "email": "parent.alok.gupta@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:45.448245+00', '2025-09-22 18:20:45.448299+00', '2025-09-22 18:20:45.448299+00', '12fd2ba0-4d30-4b6a-bff0-21e3c86c7ace'),
	('99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4', '99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4', '{"sub": "99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4", "email": "parent.vikram.reddy@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:45.73804+00', '2025-09-22 18:20:45.738098+00', '2025-09-22 18:20:45.738098+00', '697eda89-2c2f-4953-919a-6e1bb0161de6'),
	('2327bda4-89df-401f-9d83-3050ee53b23e', '2327bda4-89df-401f-9d83-3050ee53b23e', '{"sub": "2327bda4-89df-401f-9d83-3050ee53b23e", "email": "parent.lakshmi.reddy@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:45.941304+00', '2025-09-22 18:20:45.94136+00', '2025-09-22 18:20:45.94136+00', 'b7b52652-199e-412f-accf-05b5f2424853'),
	('3f720771-43ec-4bb3-9ebf-02ac19d8960c', '3f720771-43ec-4bb3-9ebf-02ac19d8960c', '{"sub": "3f720771-43ec-4bb3-9ebf-02ac19d8960c", "email": "parent.rajesh.nair@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:46.20624+00', '2025-09-22 18:20:46.20629+00', '2025-09-22 18:20:46.20629+00', '20131d17-2344-44e4-a9fd-d62e01562b3e'),
	('eb064229-c344-4350-b01b-3e8d09be68b3', 'eb064229-c344-4350-b01b-3e8d09be68b3', '{"sub": "eb064229-c344-4350-b01b-3e8d09be68b3", "email": "parent.anjali.menon@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:46.408384+00', '2025-09-22 18:20:46.408437+00', '2025-09-22 18:20:46.408437+00', 'fab1c022-2cea-403f-ae13-208acb4257cc'),
	('de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac', 'de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac', '{"sub": "de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac", "email": "parent.anil.joshi@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:46.614112+00', '2025-09-22 18:20:46.614161+00', '2025-09-22 18:20:46.614161+00', '73dfd540-d17f-4918-a03f-d55e881ec55c'),
	('d0aba71f-57b7-46bd-8d6d-a76c66987810', 'd0aba71f-57b7-46bd-8d6d-a76c66987810', '{"sub": "d0aba71f-57b7-46bd-8d6d-a76c66987810", "email": "parent.kavya.joshi@tapasyavp.edu.in", "email_verified": false, "phone_verified": false}', 'email', '2025-09-22 18:20:46.810258+00', '2025-09-22 18:20:46.810311+00', '2025-09-22 18:20:46.810311+00', 'ec418ddf-e0b8-4ef0-8ed3-bfcb2645aa31'),
	('685c4887-fc38-4d76-a342-ec29de3e0f85', '685c4887-fc38-4d76-a342-ec29de3e0f85', '{"sub": "685c4887-fc38-4d76-a342-ec29de3e0f85", "email": "abhaybs2305@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-03 10:23:23.430143+00', '2025-10-03 10:23:23.430208+00', '2025-10-03 10:23:23.430208+00', '99462dab-0546-49f7-b411-e74d68a8b300'),
	('05a88040-b0e2-481c-a9a3-f4b5e169dedd', '05a88040-b0e2-481c-a9a3-f4b5e169dedd', '{"sub": "05a88040-b0e2-481c-a9a3-f4b5e169dedd", "email": "test.student.88482d9a-dbe5-4c42-8eca-ec691eda9402@schoolos.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-05 18:51:51.024806+00', '2025-10-05 18:51:51.026603+00', '2025-10-05 18:51:51.026603+00', '25236e85-faa3-412e-8c72-30a6f5bf4c0a'),
	('a36b35d2-021c-42a9-b8e7-d13465b82281', 'a36b35d2-021c-42a9-b8e7-d13465b82281', '{"sub": "a36b35d2-021c-42a9-b8e7-d13465b82281", "email": "test.student.624d7db5-75ab-4274-afd7-3889b312307d@schoolos.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-05 18:51:52.52959+00', '2025-10-05 18:51:52.530325+00', '2025-10-05 18:51:52.530325+00', '02b42136-db42-44c6-bb21-8a02f62ed4e9'),
	('09351a3e-1149-465e-8e5d-dce65f769985', '09351a3e-1149-465e-8e5d-dce65f769985', '{"sub": "09351a3e-1149-465e-8e5d-dce65f769985", "email": "test.student.93cc417f-51d4-4aaa-9b39-fdf7dab824c4@schoolos.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-05 18:55:06.490893+00', '2025-10-05 18:55:06.491635+00', '2025-10-05 18:55:06.491635+00', '80733861-acf9-4e73-bc2f-e6fec693dcd8'),
	('8e7d4e76-d195-4a53-a1eb-89f7b2cf1420', '8e7d4e76-d195-4a53-a1eb-89f7b2cf1420', '{"sub": "8e7d4e76-d195-4a53-a1eb-89f7b2cf1420", "email": "test.student.44f5165b-6747-48e7-a00a-86d7d3445535@schoolos.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-05 19:13:46.845667+00', '2025-10-05 19:13:46.845742+00', '2025-10-05 19:13:46.845742+00', 'b28c5e5b-452b-4e8e-b99e-c105385aefb6'),
	('a6ce33ac-9988-44a2-9905-d2c11066b511', 'a6ce33ac-9988-44a2-9905-d2c11066b511', '{"sub": "a6ce33ac-9988-44a2-9905-d2c11066b511", "email": "test.student.65df74bf-1602-46db-b8ee-8209d5abbc29@schoolos.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-05 19:13:48.701802+00', '2025-10-05 19:13:48.701875+00', '2025-10-05 19:13:48.701875+00', '4363d194-ef52-4679-ab76-b8de45ce71e3'),
	('5549f19f-68c7-4de1-96c9-3a9626675850', '5549f19f-68c7-4de1-96c9-3a9626675850', '{"sub": "5549f19f-68c7-4de1-96c9-3a9626675850", "email": "test.student.00af20b6-a91f-4ee2-9f42-45ae0084aaf7@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-06 08:49:34.157353+00', '2025-10-06 08:49:34.158093+00', '2025-10-06 08:49:34.158093+00', '9c874091-597f-4ee1-b709-29ade09fafad'),
	('9be00d6e-f4fd-4095-8a42-339eae5b751d', '9be00d6e-f4fd-4095-8a42-339eae5b751d', '{"sub": "9be00d6e-f4fd-4095-8a42-339eae5b751d", "email": "test.student.9bbf7366-9f01-4c7c-a03b-9959b80f9bc6@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-06 08:58:24.43521+00', '2025-10-06 08:58:24.435269+00', '2025-10-06 08:58:24.435269+00', 'b1f3819f-0d26-4619-9ae1-131461e5d85e'),
	('2c0d82ea-c145-4fa9-82eb-9e5f7556b416', '2c0d82ea-c145-4fa9-82eb-9e5f7556b416', '{"sub": "2c0d82ea-c145-4fa9-82eb-9e5f7556b416", "email": "test.student.7927544e-a625-4d05-ada9-06bd13963c5f@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-06 09:01:04.223033+00', '2025-10-06 09:01:04.223091+00', '2025-10-06 09:01:04.223091+00', 'ff903389-cc2a-4405-aece-76b7f0ab9fab'),
	('18ad651a-fce9-44aa-9d8c-1c4942b752af', '18ad651a-fce9-44aa-9d8c-1c4942b752af', '{"sub": "18ad651a-fce9-44aa-9d8c-1c4942b752af", "email": "student.0da71fb4-4baf-4701-aae1-1ad30d878930@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-06 15:23:02.085539+00', '2025-10-06 15:23:02.086696+00', '2025-10-06 15:23:02.086696+00', '4b90463f-b96e-4581-8eb1-49630d1a36c4'),
	('bba67f0f-0c9f-4899-9302-63ae117577f7', 'bba67f0f-0c9f-4899-9302-63ae117577f7', '{"sub": "bba67f0f-0c9f-4899-9302-63ae117577f7", "email": "student.3fa504f7-eb3e-4ae2-9e47-bc8cc9e58722@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-06 15:29:21.465737+00', '2025-10-06 15:29:21.465794+00', '2025-10-06 15:29:21.465794+00', '37f99620-d606-4e6a-8122-b5d253d1528c'),
	('9afe1c7f-2102-4d5f-aa96-447fbc1b3392', '9afe1c7f-2102-4d5f-aa96-447fbc1b3392', '{"sub": "9afe1c7f-2102-4d5f-aa96-447fbc1b3392", "email": "student.1310f718-6edd-43c8-99e3-ab2fcf1e862c@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-06 15:31:48.654536+00', '2025-10-06 15:31:48.654588+00', '2025-10-06 15:31:48.654588+00', 'd8365064-20df-4587-9b82-6009f83f9616'),
	('a646d383-77db-42af-936d-f5587be4d961', 'a646d383-77db-42af-936d-f5587be4d961', '{"sub": "a646d383-77db-42af-936d-f5587be4d961", "email": "student.60e259cc-6d6e-4c64-91ae-8d7b78cbf02a@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 06:35:12.226899+00', '2025-10-07 06:35:12.227564+00', '2025-10-07 06:35:12.227564+00', 'da561692-20ba-46f1-ac19-a2e216a31f56'),
	('eafae832-a41c-426f-a182-f8f6b1f87e97', 'eafae832-a41c-426f-a182-f8f6b1f87e97', '{"sub": "eafae832-a41c-426f-a182-f8f6b1f87e97", "email": "student.2ccc8ae5-a102-4164-aa4f-f9aed8909378@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 06:41:33.884815+00', '2025-10-07 06:41:33.884871+00', '2025-10-07 06:41:33.884871+00', 'e7f011e5-b991-4452-a820-64d7dbe05572'),
	('24ec3525-99b3-4269-8fe9-2bdd4698bfda', '24ec3525-99b3-4269-8fe9-2bdd4698bfda', '{"sub": "24ec3525-99b3-4269-8fe9-2bdd4698bfda", "email": "student.b55551ba-f5c2-4ce0-a587-020adba598bb@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 06:44:57.229685+00', '2025-10-07 06:44:57.229747+00', '2025-10-07 06:44:57.229747+00', '30659fae-ea08-4400-87c0-5c80db9031fb'),
	('70b549df-b616-4be5-b2c1-1d51af813207', '70b549df-b616-4be5-b2c1-1d51af813207', '{"sub": "70b549df-b616-4be5-b2c1-1d51af813207", "email": "student.379a5e2b-2730-474d-9a2f-f76a27aa7d0c@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 06:45:50.147198+00', '2025-10-07 06:45:50.147255+00', '2025-10-07 06:45:50.147255+00', '06322321-0ba2-44fc-b6a5-1815693fc3f6'),
	('7d67227c-8e03-491c-805f-609726eed87d', '7d67227c-8e03-491c-805f-609726eed87d', '{"sub": "7d67227c-8e03-491c-805f-609726eed87d", "email": "student.e9782921-02b1-4281-b2e7-90829f9a2a7c@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 06:49:11.651144+00', '2025-10-07 06:49:11.65121+00', '2025-10-07 06:49:11.65121+00', 'b026ce75-dc2a-490d-94b7-a39a698e3795'),
	('509ab322-fb8f-4cbb-b778-b881d3ca0e11', '509ab322-fb8f-4cbb-b778-b881d3ca0e11', '{"sub": "509ab322-fb8f-4cbb-b778-b881d3ca0e11", "email": "student.ce5d65d4-db9c-4146-a822-388d613e0dc0@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 06:53:00.531647+00', '2025-10-07 06:53:00.532939+00', '2025-10-07 06:53:00.532939+00', '69fe9a74-2c8b-4f49-a449-3ce8182a2af1'),
	('5f6f441a-ae4c-413c-9539-19e0e2ff9a66', '5f6f441a-ae4c-413c-9539-19e0e2ff9a66', '{"sub": "5f6f441a-ae4c-413c-9539-19e0e2ff9a66", "email": "student.67ca9f6e-cd8b-4595-8b85-89fd8f9ee065@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:00:14.045985+00', '2025-10-07 07:00:14.046047+00', '2025-10-07 07:00:14.046047+00', '531962a2-c7db-4e59-9cdf-ec4451e3e381'),
	('73dc447f-7fc6-4e19-bac9-b3ba62b86e0a', '73dc447f-7fc6-4e19-bac9-b3ba62b86e0a', '{"sub": "73dc447f-7fc6-4e19-bac9-b3ba62b86e0a", "email": "student.0a33e359-28bc-46d9-91dc-1f77745e81ef@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:03:41.027945+00', '2025-10-07 07:03:41.028004+00', '2025-10-07 07:03:41.028004+00', '96a37704-17b0-46bd-b0ec-b6dc95dbf118'),
	('6ed6b164-9b11-49b3-a9ef-8241681fce37', '6ed6b164-9b11-49b3-a9ef-8241681fce37', '{"sub": "6ed6b164-9b11-49b3-a9ef-8241681fce37", "email": "student.2eeaef70-8379-408e-9323-fe58c88a2a9c@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:15:25.012208+00', '2025-10-07 07:15:25.012267+00', '2025-10-07 07:15:25.012267+00', '3bf6b096-fcf5-4106-b747-319755ba4809'),
	('86ee5391-69dd-48db-9673-edc6aa5a61bd', '86ee5391-69dd-48db-9673-edc6aa5a61bd', '{"sub": "86ee5391-69dd-48db-9673-edc6aa5a61bd", "email": "student.f5804710-8402-4750-80e3-8302ee54b3a0@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:19:26.380789+00', '2025-10-07 07:19:26.380842+00', '2025-10-07 07:19:26.380842+00', '0885dd9d-e1e9-4b57-adb0-3e532b2aaa6d'),
	('59b9e466-f181-4383-97a4-749e45777a84', '59b9e466-f181-4383-97a4-749e45777a84', '{"sub": "59b9e466-f181-4383-97a4-749e45777a84", "email": "student.ebf03fc5-626e-4dae-959d-69235e5d50ae@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:22:33.653667+00', '2025-10-07 07:22:33.653725+00', '2025-10-07 07:22:33.653725+00', '819d59d5-d169-4257-9ac5-2b5d8af37b23'),
	('3a834f54-5135-4dab-8fe5-fa4ef16dd792', '3a834f54-5135-4dab-8fe5-fa4ef16dd792', '{"sub": "3a834f54-5135-4dab-8fe5-fa4ef16dd792", "email": "student.01eac18b-d003-44a8-8305-51281da82b79@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:24:46.1022+00', '2025-10-07 07:24:46.102261+00', '2025-10-07 07:24:46.102261+00', '7a644a81-8f30-4c5b-8b16-d3d364e7a58e'),
	('4c7bdf24-d6b1-42ea-9ced-638773d08527', '4c7bdf24-d6b1-42ea-9ced-638773d08527', '{"sub": "4c7bdf24-d6b1-42ea-9ced-638773d08527", "email": "student.18f19378-6193-45a2-a709-a18394c66270@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:30:41.195569+00', '2025-10-07 07:30:41.195639+00', '2025-10-07 07:30:41.195639+00', '4cf78ec8-eec2-40eb-8a67-ff58f9041248'),
	('8e1c55bf-3a17-4ea9-bf99-77d7a459feb1', '8e1c55bf-3a17-4ea9-bf99-77d7a459feb1', '{"sub": "8e1c55bf-3a17-4ea9-bf99-77d7a459feb1", "email": "student.3fd11782-d909-4639-8e94-90109f53d6a6@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:36:23.302919+00', '2025-10-07 07:36:23.302978+00', '2025-10-07 07:36:23.302978+00', '12ab90f1-c829-440b-8492-db059aff58c1'),
	('e1fb9cce-230b-48cc-b2de-6e30ccd74139', 'e1fb9cce-230b-48cc-b2de-6e30ccd74139', '{"sub": "e1fb9cce-230b-48cc-b2de-6e30ccd74139", "email": "student.add386d4-39b0-460b-8650-97f11cfcf357@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:39:12.276484+00', '2025-10-07 07:39:12.276542+00', '2025-10-07 07:39:12.276542+00', 'cb91055d-c92e-42b8-ad42-ae5eb11398b6'),
	('5d9e1c9f-980c-47b1-bd87-2b54c6810c86', '5d9e1c9f-980c-47b1-bd87-2b54c6810c86', '{"sub": "5d9e1c9f-980c-47b1-bd87-2b54c6810c86", "email": "student.dda3781d-abc1-467c-bbb6-2dd82233e03d@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:50:19.461226+00', '2025-10-07 07:50:19.461284+00', '2025-10-07 07:50:19.461284+00', '052dade2-b9a1-4b66-8051-31cc8c1f3bb2'),
	('aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', '{"sub": "aebd8219-5fd4-4ede-86c0-344c0e6cd257", "email": "student.091b27f4-a062-448a-8d3e-489caf4ba627@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-07 07:54:49.722565+00', '2025-10-07 07:54:49.723262+00', '2025-10-07 07:54:49.723262+00', 'ade56201-f33c-4e6b-8fb0-bf4c3e5081c8'),
	('3e163ee6-cd91-4d63-8bc1-189cc0d13860', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '{"sub": "3e163ee6-cd91-4d63-8bc1-189cc0d13860", "email": "zenwear.in@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-08 15:10:12.09898+00', '2025-10-08 15:10:12.099645+00', '2025-10-08 15:10:12.099645+00', '330a4f2f-b7d6-4a8c-a171-077084c8e042'),
	('4770004f-39b3-4983-9004-80d23b1b6029', '4770004f-39b3-4983-9004-80d23b1b6029', '{"sub": "4770004f-39b3-4983-9004-80d23b1b6029", "email": "student.33a3375c-5602-4a8f-9509-bb255a17ab71@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-10 09:03:06.722268+00', '2025-10-10 09:03:06.7233+00', '2025-10-10 09:03:06.7233+00', 'bc7185ff-2775-4edd-a204-445bc382c7e7'),
	('432c3e91-01ff-4ff4-ba70-d2582fa44ed2', '432c3e91-01ff-4ff4-ba70-d2582fa44ed2', '{"sub": "432c3e91-01ff-4ff4-ba70-d2582fa44ed2", "email": "student.d07d87f1-de5e-439f-b799-0eeba88e90d2@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-10 09:08:28.917771+00', '2025-10-10 09:08:28.917828+00', '2025-10-10 09:08:28.917828+00', '4e4e6381-a11b-4324-b4e2-e525aa2c0d3b'),
	('558b7c95-a041-4f11-acf8-3ade6aecbba5', '558b7c95-a041-4f11-acf8-3ade6aecbba5', '{"sub": "558b7c95-a041-4f11-acf8-3ade6aecbba5", "email": "student.b7cb72e0-ae10-4f74-8321-71d35629ec72@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-10 09:53:45.309119+00', '2025-10-10 09:53:45.31042+00', '2025-10-10 09:53:45.31042+00', '00388c64-30c2-43e3-8e05-aeaf88596edb'),
	('7a221af0-dce5-40f9-8d64-966900fde79d', '7a221af0-dce5-40f9-8d64-966900fde79d', '{"sub": "7a221af0-dce5-40f9-8d64-966900fde79d", "email": "skillaccabhay@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-11 10:37:30.479791+00', '2025-10-11 10:37:30.47984+00', '2025-10-11 10:37:30.47984+00', '6da24bb6-8c37-45af-bc10-eb9da42cf73b'),
	('ca967e27-a291-4796-8159-ecc8854871ae', 'ca967e27-a291-4796-8159-ecc8854871ae', '{"sub": "ca967e27-a291-4796-8159-ecc8854871ae", "email": "bhuvanbalajiv@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2025-10-12 13:50:26.189665+00', '2025-10-12 13:50:26.19089+00', '2025-10-12 13:50:26.19089+00', '1227b746-179a-468b-973c-948a84880810'),
	('ee0daccb-0f05-4acb-b13e-13491af2ae0d', 'ee0daccb-0f05-4acb-b13e-13491af2ae0d', '{"sub": "ee0daccb-0f05-4acb-b13e-13491af2ae0d", "email": "bitpodcast@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-12 13:52:25.907048+00', '2025-10-12 13:52:25.907689+00', '2025-10-12 13:52:25.907689+00', 'e64f4607-e9ec-4032-9316-45f84a7d1b82'),
	('94782a1f-7739-4d83-ab9b-d6933f78ec59', '94782a1f-7739-4d83-ab9b-d6933f78ec59', '{"sub": "94782a1f-7739-4d83-ab9b-d6933f78ec59", "email": "bitpodcast24@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-19 05:43:17.888707+00', '2025-10-19 05:43:17.888771+00', '2025-10-19 05:43:17.888771+00', '9078d9ab-9e37-4f13-a609-ad3885b1e38c'),
	('62d516a1-8947-4768-a45a-1362a3cc43fb', '62d516a1-8947-4768-a45a-1362a3cc43fb', '{"sub": "62d516a1-8947-4768-a45a-1362a3cc43fb", "role": "teacher", "email": "vrolightvro@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": true, "phone_verified": false}', 'email', '2025-10-24 11:49:23.772063+00', '2025-10-24 11:49:23.772719+00', '2025-10-24 11:49:23.772719+00', '568c05d3-63e2-4817-8f47-db46abe22981'),
	('dd17c134-d5f6-4f6d-b116-73831c6f9a37', 'dd17c134-d5f6-4f6d-b116-73831c6f9a37', '{"sub": "dd17c134-d5f6-4f6d-b116-73831c6f9a37", "role": "teacher", "email": "abc@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": false, "phone_verified": false}', 'email', '2025-10-24 11:50:58.328847+00', '2025-10-24 11:50:58.328911+00', '2025-10-24 11:50:58.328911+00', 'a7d63048-0f34-4c00-bda4-0ee9c180f2e7'),
	('d161a8e4-a80d-4a1c-a9ab-f23f38dc2679', 'd161a8e4-a80d-4a1c-a9ab-f23f38dc2679', '{"sub": "d161a8e4-a80d-4a1c-a9ab-f23f38dc2679", "role": "parent", "email": "absdc@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": false, "phone_verified": false}', 'email', '2025-10-24 16:43:21.910353+00', '2025-10-24 16:43:21.911009+00', '2025-10-24 16:43:21.911009+00', '4364d03f-4253-4fda-87bf-ea9f297ffb57'),
	('9c2d3636-b90c-44cf-b67a-848fc1f076a3', '9c2d3636-b90c-44cf-b67a-848fc1f076a3', '{"sub": "9c2d3636-b90c-44cf-b67a-848fc1f076a3", "role": "student", "email": "abhishek@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": false, "phone_verified": false}', 'email', '2025-10-24 16:43:56.288312+00', '2025-10-24 16:43:56.288359+00', '2025-10-24 16:43:56.288359+00', 'eb554b22-3db2-4514-904c-2b9489081373'),
	('89822878-2382-4078-a654-c48870709bb8', '89822878-2382-4078-a654-c48870709bb8', '{"sub": "89822878-2382-4078-a654-c48870709bb8", "role": "parent", "email": "srujannh@gmail.com", "full_name": "Abhishek L", "last_name": "L", "first_name": "Abhishek", "email_verified": false, "phone_verified": false}', 'email', '2025-10-31 16:14:25.947968+00', '2025-10-31 16:14:25.948024+00', '2025-10-31 16:14:25.948024+00', '8281dfbf-a6fd-4f46-a995-6d2a8bb61b26'),
	('9626b997-1939-4697-a57e-10034bf9a276', '9626b997-1939-4697-a57e-10034bf9a276', '{"sub": "9626b997-1939-4697-a57e-10034bf9a276", "role": "admin", "email": "vignesh.bs06@gmail.com", "full_name": "VIGNESH B S", "last_name": "B S", "first_name": "VIGNESH", "email_verified": false, "phone_verified": false}', 'email', '2025-11-01 07:32:28.517028+00', '2025-11-01 07:32:28.517088+00', '2025-11-01 07:32:28.517088+00', 'f6cc4358-08b0-4c6d-8231-02f7d4a67a02'),
	('4a39dc4b-5f95-45b0-9b4f-67b253943233', '4a39dc4b-5f95-45b0-9b4f-67b253943233', '{"sub": "4a39dc4b-5f95-45b0-9b4f-67b253943233", "email": "vignesh.bs0@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-01 19:25:03.501364+00', '2025-11-01 19:25:03.50142+00', '2025-11-01 19:25:03.50142+00', '629626f1-e401-4eec-9093-1e7c2abf9871'),
	('cd307408-9c83-475e-a874-be26288d534c', 'cd307408-9c83-475e-a874-be26288d534c', '{"sub": "cd307408-9c83-475e-a874-be26288d534c", "email": "ashar808@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-01 19:58:11.91219+00', '2025-11-01 19:58:11.912259+00', '2025-11-01 19:58:11.912259+00', '199f0a7e-ddf8-4395-86ed-dae8b2ae7f2e');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter") VALUES
	('212afbba-8b95-4dbb-84d8-b2c449d69fe4', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:29:48.086522+00', '2025-10-03 12:29:48.086522+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('7d64c543-e618-4f25-ba32-0752d143879c', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:30:08.149523+00', '2025-10-03 12:30:08.149523+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('6acda0f9-8448-4f0f-90ea-fc8abaf12cb2', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:30:55.818322+00', '2025-10-03 12:30:55.818322+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('03fe475c-b30b-4f02-9f09-8a0f692df385', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:44:24.682799+00', '2025-10-03 12:44:24.682799+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('07c71dd1-44b4-4334-88c6-e1b94d37c49d', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:44:40.942702+00', '2025-10-03 12:44:40.942702+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('0118cbf7-6225-42e1-ad77-5af91ff5286a', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:49:39.887949+00', '2025-10-03 12:49:39.887949+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('a834e35e-65b1-48ca-af2d-f230263ba541', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:50:23.639654+00', '2025-10-03 12:50:23.639654+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('523a6bc2-ceef-4727-aaf8-261387c1472d', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:51:28.126504+00', '2025-10-03 12:51:28.126504+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('ce4d91c0-0f6c-4ed2-a5d9-12a21e31cc0d', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:57:59.272267+00', '2025-10-03 12:57:59.272267+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('5350bbd9-6797-46af-ade3-de66d4476cb7', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:58:04.796214+00', '2025-10-03 12:58:04.796214+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('24659304-470b-41c8-b2b8-504d3fe12c23', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-03 12:58:14.072842+00', '2025-10-03 12:58:14.072842+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '205.254.163.125', NULL, NULL, NULL, NULL),
	('bb77eecc-e76e-4f5f-ba70-efe05e0c79a4', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-08 15:11:32.725633+00', '2025-10-08 15:11:32.725633+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '49.37.251.64', NULL, NULL, NULL, NULL),
	('cf9d9185-5a89-4da7-b11a-f61ed5239e7e', '70cee473-d0a2-4484-8a84-e0a5cd4e584c', '2025-10-08 15:32:26.409984+00', '2025-10-08 15:32:26.409984+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '49.37.251.64', NULL, NULL, NULL, NULL),
	('d3e5856f-33e0-4b0d-89ac-a325f31b533f', '685c4887-fc38-4d76-a342-ec29de3e0f85', '2025-10-09 16:29:26.348283+00', '2025-10-09 16:29:26.348283+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.251.188', NULL, NULL, NULL, NULL),
	('0d549a02-8e0a-479a-9e40-4119aae5eb4a', 'fbd44ebd-1994-4c93-8359-8dbdea32a1e9', '2025-10-09 16:51:48.939435+00', '2025-10-09 16:51:48.939435+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '49.37.251.188', NULL, NULL, NULL, NULL),
	('eabf49a1-cd5b-4b2a-8f15-20f6290bac74', '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', '2025-10-11 07:29:38.032333+00', '2025-10-11 07:29:38.032333+00', NULL, 'aal1', NULL, NULL, 'curl/8.10.1', '27.63.247.241', NULL, NULL, NULL, NULL),
	('70e25bdc-59e9-4b78-ac57-864840de7d08', '7a221af0-dce5-40f9-8d64-966900fde79d', '2025-10-11 10:40:07.388079+00', '2025-10-11 10:40:07.388079+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', '49.37.249.154', NULL, NULL, NULL, NULL),
	('cd88393e-0ff3-4ff7-9b46-3e1c22708d51', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-11 10:53:22.537932+00', '2025-10-11 10:53:22.537932+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', '49.37.249.154', NULL, NULL, NULL, NULL),
	('7d45f6f6-9088-4438-ad74-9ecc8abf94f1', 'ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', '2025-10-12 05:22:31.567291+00', '2025-10-12 05:22:31.567291+00', NULL, 'aal1', NULL, NULL, 'curl/8.10.1', '152.57.9.243', NULL, NULL, NULL, NULL),
	('3b281803-910b-4163-af8d-6733625d6e39', 'ca967e27-a291-4796-8159-ecc8854871ae', '2025-10-12 13:51:02.748684+00', '2025-10-12 13:51:02.748684+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '113.193.110.153', NULL, NULL, NULL, NULL),
	('b80b363c-ca0e-4653-aa0a-19f4146772c5', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-13 05:27:29.069356+00', '2025-10-13 05:27:29.069356+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '110.225.55.113', NULL, NULL, NULL, NULL),
	('a3b9c7d9-3b31-41bb-a21a-d39a505fd968', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-13 05:27:30.035504+00', '2025-10-13 05:27:30.035504+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '110.225.55.113', NULL, NULL, NULL, NULL),
	('0ce8b19b-0ca9-4859-a13a-419541a23d4e', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-13 11:49:08.421587+00', '2025-10-13 11:49:08.421587+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '49.204.87.250', NULL, NULL, NULL, NULL),
	('e8ff1169-31d2-4552-87ae-f24605425bc2', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-14 09:05:43.225976+00', '2025-10-14 09:05:43.225976+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '1.23.215.199', NULL, NULL, NULL, NULL),
	('9fd12bf2-45d0-4e2b-86cf-4bb6aa46f5c4', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-14 09:40:05.554278+00', '2025-10-14 09:40:05.554278+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '1.23.215.199', NULL, NULL, NULL, NULL),
	('cf871120-b21c-499d-88de-28cad4519914', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-14 12:58:33.597584+00', '2025-10-14 12:58:33.597584+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '1.23.215.199', NULL, NULL, NULL, NULL),
	('cc295ca6-7c45-44b0-b804-c2470d27b816', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-14 14:56:10.999235+00', '2025-10-14 14:56:10.999235+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '106.217.46.228', NULL, NULL, NULL, NULL),
	('10df7781-9188-46a6-bfa1-8993afc9d4ea', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-14 17:07:39.018953+00', '2025-10-14 17:07:39.018953+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.48.0', '1.22.220.196', NULL, NULL, NULL, NULL),
	('47cb97c7-b1fc-4a16-bd07-114f562563c6', '4808a1be-01b6-44c1-a17a-c9f104b40854', '2025-10-15 06:20:52.766166+00', '2025-10-15 06:20:52.766166+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.33.122', NULL, NULL, NULL, NULL),
	('216273be-38c4-48f0-bad7-e620e1d34daa', 'da134162-0d5d-4215-b93b-aefb747ffa17', '2025-10-15 09:09:06.47937+00', '2025-10-15 09:09:06.47937+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.33.122', NULL, NULL, NULL, NULL),
	('80855734-1070-4e6c-a38e-e1a34d72bf09', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-16 08:43:56.646257+00', '2025-10-16 08:43:56.646257+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '49.204.87.250', NULL, NULL, NULL, NULL),
	('31934895-15a6-479b-bb02-78971ff352a3', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-16 10:02:13.401711+00', '2025-10-16 10:02:13.401711+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '49.204.87.250', NULL, NULL, NULL, NULL),
	('98c02215-e1b1-4c4f-a373-a796c82dc70e', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-16 11:49:08.64611+00', '2025-10-16 11:49:08.64611+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '49.204.87.250', NULL, NULL, NULL, NULL),
	('d72cf2ab-b7d1-4120-ab6d-90dbef213ed3', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-16 17:09:22.058682+00', '2025-10-16 17:09:22.058682+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.214', NULL, NULL, NULL, NULL),
	('53f2e520-2181-4f14-b47a-098f8bf33483', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-16 18:38:25.027694+00', '2025-10-16 18:38:25.027694+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.214', NULL, NULL, NULL, NULL),
	('a7fe09fc-ffe4-4f5f-96f8-7f90f0289559', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-17 10:50:01.200766+00', '2025-10-17 10:50:01.200766+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '49.204.87.250', NULL, NULL, NULL, NULL),
	('7db28fa7-231c-4d1f-bbf4-2349d82d2e02', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-17 11:58:46.292118+00', '2025-10-17 11:58:46.292118+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '49.204.87.250', NULL, NULL, NULL, NULL),
	('fbdbcc38-4529-49ce-9b4b-d522cf0e927c', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-18 03:14:28.444786+00', '2025-10-18 03:14:28.444786+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('41390bd6-0744-4a95-a412-4245498e65ac', '25d8b8be-ab84-4758-91e0-427db617eeab', '2025-10-18 13:55:38.258509+00', '2025-10-18 13:55:38.258509+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '223.186.236.217', NULL, NULL, NULL, NULL),
	('9447e1f6-bb07-4502-88b8-651147b19dec', '25d8b8be-ab84-4758-91e0-427db617eeab', '2025-10-18 18:30:03.771183+00', '2025-10-18 18:30:03.771183+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.221.27', NULL, NULL, NULL, NULL),
	('a2e59cdd-501e-4b7c-a720-3c94051a8880', '6016ef26-05d5-4d23-b0b1-8b6d6af73cad', '2025-10-18 18:35:10.549682+00', '2025-10-18 18:35:10.549682+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.221.27', NULL, NULL, NULL, NULL),
	('a563383a-ef63-412c-bc9c-4ac486a9ef30', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-18 18:41:58.207085+00', '2025-10-18 18:41:58.207085+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '223.237.167.94', NULL, NULL, NULL, NULL),
	('c04b4c80-c38e-4643-89eb-3e91f93883e9', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-19 05:44:00.151369+00', '2025-10-19 05:44:00.151369+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.221.27', NULL, NULL, NULL, NULL),
	('101589de-2bc6-4c0b-98ae-e3de5dd0926d', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-19 05:51:49.12887+00', '2025-10-19 05:51:49.12887+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('35ae559d-47e9-48f2-bb2a-6258eb019c1b', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-19 09:28:14.202522+00', '2025-10-19 09:28:14.202522+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.221.27', NULL, NULL, NULL, NULL),
	('949d1b07-20c9-43d0-8c06-638ae71a1d51', '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', '2025-10-20 06:46:39.508449+00', '2025-10-20 06:46:39.508449+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('3a386ce0-cab3-43c3-892b-433143634d6b', '2327bda4-89df-401f-9d83-3050ee53b23e', '2025-10-20 07:13:26.686473+00', '2025-10-20 07:13:26.686473+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('ff71687c-4081-4f2f-8284-1dabbf5b2d06', '2327bda4-89df-401f-9d83-3050ee53b23e', '2025-10-20 08:29:00.610691+00', '2025-10-20 08:29:00.610691+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('dbb38478-3fad-43e5-8b6b-daa86ce21131', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-20 08:40:08.537146+00', '2025-10-20 08:40:08.537146+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('0e8b8150-323e-4a5e-9edc-c450bc1dfdce', '685c4887-fc38-4d76-a342-ec29de3e0f85', '2025-10-20 11:53:00.170017+00', '2025-10-20 11:53:00.170017+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '152.57.9.191', NULL, NULL, NULL, NULL),
	('7c688fdb-b4f9-416a-b1e9-27746b360101', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '2025-10-20 12:19:48.886023+00', '2025-10-20 12:19:48.886023+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.9.191', NULL, NULL, NULL, NULL),
	('10563898-0833-4880-a687-6fa022db873d', '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', '2025-10-20 12:40:49.327286+00', '2025-10-20 12:40:49.327286+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('5e253679-fd01-4c56-9f91-4686f80b7b51', '25d8b8be-ab84-4758-91e0-427db617eeab', '2025-10-20 12:42:37.524032+00', '2025-10-20 12:42:37.524032+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.122', NULL, NULL, NULL, NULL),
	('2b92a50b-e54b-4133-9618-998472e52c5e', 'dff67664-a554-4629-8e07-f0a6f640ee6d', '2025-10-20 13:27:07.252911+00', '2025-10-20 13:27:07.252911+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.9.191', NULL, NULL, NULL, NULL),
	('cdfa71b1-3a6f-42b5-9149-cd11ce3da4ab', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '2025-10-20 13:34:08.955077+00', '2025-10-20 13:34:08.955077+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.9.191', NULL, NULL, NULL, NULL),
	('867d62a9-d898-4883-acdd-8c3dde2a3425', 'dff67664-a554-4629-8e07-f0a6f640ee6d', '2025-10-20 13:37:16.537745+00', '2025-10-20 13:37:16.537745+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.9.191', NULL, NULL, NULL, NULL),
	('caabed61-5f8c-4e5d-9d38-a409f4852a4a', 'dff67664-a554-4629-8e07-f0a6f640ee6d', '2025-10-20 14:11:07.078545+00', '2025-10-20 14:11:07.078545+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '152.57.9.191', NULL, NULL, NULL, NULL),
	('46be002a-3dba-4ec3-9573-4aa835722bb1', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-20 14:13:44.562342+00', '2025-10-20 14:13:44.562342+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('52449a9a-6700-4450-8332-350c2055d3bd', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-20 18:50:12.163761+00', '2025-10-20 18:50:12.163761+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.63.178', NULL, NULL, NULL, NULL),
	('d84ffa8c-be12-499f-aed2-12443dfb468d', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 04:18:32.241146+00', '2025-10-21 04:18:32.241146+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.89', NULL, NULL, NULL, NULL),
	('6719404f-e71a-41b7-a34e-080bec722e93', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 04:27:44.204063+00', '2025-10-21 04:27:44.204063+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('32641d7a-46c1-477c-8c24-a443ad435cd3', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 05:19:50.758255+00', '2025-10-21 05:19:50.758255+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.89', NULL, NULL, NULL, NULL),
	('5e02f6a1-c101-4e5f-9bde-c612a993e2cc', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 05:54:31.934155+00', '2025-10-21 05:54:31.934155+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.89', NULL, NULL, NULL, NULL),
	('fccc9b3b-228d-40c4-9b4e-a68e899704dd', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 06:19:39.90291+00', '2025-10-21 06:19:39.90291+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('472eec7d-41dc-4836-968f-e4018e447e06', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 07:22:53.943394+00', '2025-10-21 07:22:53.943394+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('90b8097e-9f35-4874-898a-acc962ffd825', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 07:26:46.088834+00', '2025-10-21 07:26:46.088834+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.89', NULL, NULL, NULL, NULL),
	('0ee67cc1-4342-4541-9802-d72df2438550', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 08:56:57.807872+00', '2025-10-21 08:56:57.807872+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('614fedc7-56fa-4d58-80df-918f759c84fd', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 10:03:00.974994+00', '2025-10-21 10:03:00.974994+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('f1c55ad2-a1ee-424f-83ec-603bdb2a34c2', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-22 06:24:50.195109+00', '2025-10-22 06:24:50.195109+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('4e981c41-5099-4136-ae39-6ff950e2411b', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-22 09:03:24.98759+00', '2025-10-22 09:03:24.98759+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '101.0.62.18', NULL, NULL, NULL, NULL),
	('a3c03a18-507a-4e2c-94bb-3fa7f3011e22', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '2025-10-24 11:42:40.723718+00', '2025-10-24 11:42:40.723718+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '49.37.242.55', NULL, NULL, NULL, NULL),
	('1e99d05e-bd69-4558-8bec-d8fa0c083cad', '62d516a1-8947-4768-a45a-1362a3cc43fb', '2025-10-24 11:49:52.04915+00', '2025-10-24 11:49:52.04915+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '27.61.35.48', NULL, NULL, NULL, NULL),
	('322f2367-c6ea-4dd1-8782-641a8d8385ec', 'dff67664-a554-4629-8e07-f0a6f640ee6d', '2025-10-24 11:55:36.217648+00', '2025-10-24 11:55:36.217648+00', NULL, 'aal1', NULL, NULL, 'curl/8.9.0', '49.37.242.55', NULL, NULL, NULL, NULL),
	('66177f9d-5cac-43ad-825d-4f5dd86457f0', 'dd17c134-d5f6-4f6d-b116-73831c6f9a37', '2025-10-24 11:50:58.339759+00', '2025-10-24 16:42:45.624943+00', NULL, 'aal1', NULL, '2025-10-24 16:42:45.624816', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.199', NULL, NULL, NULL, NULL),
	('a5ac17c1-7757-4101-86ba-c540ac65208f', 'd161a8e4-a80d-4a1c-a9ab-f23f38dc2679', '2025-10-24 16:43:21.931697+00', '2025-10-24 16:43:21.931697+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.199', NULL, NULL, NULL, NULL),
	('26c821de-6843-46fd-a620-e26a9ccaeb5f', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:33:55.323565+00', '2025-11-01 07:33:55.323565+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '152.57.6.157', NULL, NULL, NULL, NULL),
	('7a9aebf1-e74b-4949-8142-c0e6849ad7eb', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:39:44.535179+00', '2025-11-01 07:39:44.535179+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('199f7ce0-f495-4fc2-9b0a-af9ba47eecc7', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:40:00.919292+00', '2025-11-01 07:40:00.919292+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('561b4c9c-cdd5-4df5-b5a1-0269aeab2af0', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:41:07.038429+00', '2025-11-01 07:41:07.038429+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('8f4998e9-659a-4246-9267-4a90b7a5d73d', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:44:57.49515+00', '2025-11-01 07:44:57.49515+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('6c148dc2-9ff7-442c-961b-684e7c0bc874', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:46:59.090631+00', '2025-11-01 07:46:59.090631+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('a70179e0-4e5f-44cc-a830-10d06ac7b5ba', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:49:40.521741+00', '2025-11-01 07:49:40.521741+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('36326774-31c0-4bfe-93de-60bbc5838f44', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:50:10.688761+00', '2025-11-01 07:50:10.688761+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('00558f69-0bab-4df9-80e4-c4ab4e5ff74e', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 07:53:15.334217+00', '2025-11-01 07:53:15.334217+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.12.109', NULL, NULL, NULL, NULL),
	('c74a8f99-03cf-485b-a0b7-75e85982907b', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 12:34:46.260097+00', '2025-11-01 12:34:46.260097+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('d448eb68-3e87-4816-b8ac-4bb87651f108', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 12:35:16.27097+00', '2025-11-01 12:35:16.27097+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('5b67fed1-a215-41bd-9a37-1f4b50ed0b11', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 12:40:37.956562+00', '2025-11-01 12:40:37.956562+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('ef35866d-8ea7-46f9-84c7-c9cfbf908528', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 12:51:36.383738+00', '2025-11-01 12:51:36.383738+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('ec098e38-82c2-48f5-ab3e-2716ef34618f', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 12:52:03.902422+00', '2025-11-01 12:52:03.902422+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('d758b64e-7535-4864-b486-01e7b50545c0', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 13:06:29.635483+00', '2025-11-01 13:06:29.635483+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('14c38a67-2bfd-453e-9684-9e29235ad7ac', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 13:07:18.919106+00', '2025-11-01 13:07:18.919106+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('5b64f237-5a3c-434e-87f1-c859b6479bb9', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 13:09:47.436186+00', '2025-11-01 13:09:47.436186+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('961f7c1c-89fa-4825-be2e-655322c8b305', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 13:34:14.819366+00', '2025-11-01 13:34:14.819366+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('e1a8e039-1052-4ed1-bbca-6fa6a2ab6309', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 13:34:22.501829+00', '2025-11-01 13:34:22.501829+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('cfbee2f3-3315-4422-a7fe-01143ce2df69', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 13:52:33.336405+00', '2025-11-01 13:52:33.336405+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('270a5ce6-ad55-4f27-b4e7-69f46e340fa5', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 14:11:59.036457+00', '2025-11-01 14:11:59.036457+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('e4817c4f-2627-47af-a0f0-6308ffed8bf6', '0841a053-7266-426e-b681-1d6fab5f9974', '2025-11-01 14:30:04.761817+00', '2025-11-01 14:30:04.761817+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '157.50.170.200', NULL, NULL, NULL, NULL),
	('b370f6d1-8af2-4272-8770-7a6f75f1fade', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 14:31:51.725078+00', '2025-11-01 14:31:51.725078+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('b77d3a4e-f98f-47ae-92d8-076e216e0088', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 14:35:52.985474+00', '2025-11-01 14:35:52.985474+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('d6026fd4-ddee-4613-8964-548ca38c3a01', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 15:20:04.352331+00', '2025-11-01 15:20:04.352331+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '152.57.45.46', NULL, NULL, NULL, NULL),
	('7b79505c-25e9-4de0-a86e-c297f1d602d2', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 13:10:11.796568+00', '2025-11-01 16:17:30.551845+00', NULL, 'aal1', NULL, '2025-11-01 16:17:30.551117', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('c224231b-692f-4259-9bb5-63bbcfcfc8ea', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 16:18:05.683141+00', '2025-11-01 16:18:05.683141+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('d1947753-7081-4025-a204-60f58976b2c3', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 16:49:58.282048+00', '2025-11-01 16:49:58.282048+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.205.167', NULL, NULL, NULL, NULL),
	('582e899c-10e0-4d3f-adad-b077ad0b65ad', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 16:51:12.255635+00', '2025-11-01 16:51:12.255635+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.205.167', NULL, NULL, NULL, NULL),
	('f87b868a-82d0-443b-9962-d125f8b0314b', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 16:58:11.45843+00', '2025-11-01 16:58:11.45843+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.205.167', NULL, NULL, NULL, NULL),
	('70dadc7e-97ad-4fc8-90f8-12f6000b2c64', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 17:06:11.633564+00', '2025-11-01 17:06:11.633564+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('29819a05-e4ae-412f-836c-17ce7651f980', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 17:10:40.532727+00', '2025-11-01 17:10:40.532727+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('be718026-8c0e-4dff-9afb-7605a401983f', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 17:11:11.137119+00', '2025-11-01 17:11:11.137119+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('f3e19700-7de2-449e-b103-d2eb655f3973', '89822878-2382-4078-a654-c48870709bb8', '2025-10-31 16:14:25.963457+00', '2025-11-01 17:17:48.523109+00', NULL, 'aal1', NULL, '2025-11-01 17:17:48.523024', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '123.136.229.146', NULL, NULL, NULL, NULL),
	('18a73808-18d9-4c8d-b1c4-f417f319fad1', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 17:24:04.989962+00', '2025-11-01 17:24:04.989962+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('5b4621cf-0f96-4b81-8518-f53766e91a81', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 18:21:16.535351+00', '2025-11-01 18:21:16.535351+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.202.226', NULL, NULL, NULL, NULL),
	('8b50e5b2-6fc8-4fc7-8db2-ac86acbab970', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 18:27:07.73715+00', '2025-11-01 18:27:07.73715+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.202.226', NULL, NULL, NULL, NULL),
	('cfc1439f-bed2-4518-b5ae-ed3335f37bec', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 18:30:47.177084+00', '2025-11-01 18:30:47.177084+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('8f3e52f2-cbbf-4bd2-881d-f85c690466ee', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 18:32:05.270474+00', '2025-11-01 18:32:05.270474+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('91d6e126-618e-44cb-8ebb-7ceaea51bfb0', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 18:34:10.549442+00', '2025-11-01 18:34:10.549442+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.202.226', NULL, NULL, NULL, NULL),
	('b99e4914-a771-497f-825b-2e87da73ba18', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 18:36:02.46455+00', '2025-11-01 18:36:02.46455+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '103.214.63.162', NULL, NULL, NULL, NULL),
	('99857fe4-6c66-4830-b2eb-b10b068edd92', '89822878-2382-4078-a654-c48870709bb8', '2025-11-01 18:56:22.125614+00', '2025-11-01 18:56:22.125614+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '103.214.63.162', NULL, NULL, NULL, NULL),
	('82f5c362-db7c-4042-ae77-1bec1e558f84', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 18:58:11.043283+00', '2025-11-01 18:58:11.043283+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.196.160', NULL, NULL, NULL, NULL),
	('6ee3f2ec-7661-4131-8822-ab56294bd9e8', '9626b997-1939-4697-a57e-10034bf9a276', '2025-11-01 19:01:41.118237+00', '2025-11-01 19:01:41.118237+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '157.50.196.160', NULL, NULL, NULL, NULL),
	('e1643ae3-f9cd-4351-bd86-19bfd9aa4aec', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-05 01:52:33.371228+00', '2025-11-05 05:56:36.636737+00', NULL, 'aal1', NULL, '2025-11-05 05:56:36.636648', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '106.221.198.68', NULL, NULL, NULL, NULL),
	('314af7b9-c16f-46e4-9b0b-7a6cfebe9f6d', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-02 08:27:10.020783+00', '2025-11-02 08:27:10.020783+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '223.237.170.164', NULL, NULL, NULL, NULL),
	('10e8f694-c1cf-4df0-aa60-11cd09c33af0', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-05 05:57:16.336883+00', '2025-11-06 03:11:24.840814+00', NULL, 'aal1', NULL, '2025-11-06 03:11:24.840707', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.74', NULL, NULL, NULL, NULL),
	('80db73b4-f2b2-4e54-8b2e-a3d9ced2d8f0', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-02 13:45:21.297622+00', '2025-11-02 13:45:21.297622+00', NULL, 'aal1', NULL, NULL, 'python-httpx/0.28.1', '157.50.168.255', NULL, NULL, NULL, NULL),
	('f518c3b2-1953-40ae-ad65-db0cd047d907', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 03:11:31.182697+00', '2025-11-06 03:11:31.182697+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.74', NULL, NULL, NULL, NULL),
	('60eee84a-b37e-476e-a9a8-e751f3501760', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 03:17:11.899443+00', '2025-11-06 03:17:11.899443+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.74', NULL, NULL, NULL, NULL),
	('2ac10c0e-d5be-4303-b768-85a7277fef35', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-03 18:13:27.476749+00', '2025-11-03 18:13:27.476749+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.248.8', NULL, NULL, NULL, NULL),
	('0b95f55b-a8fd-474b-8be7-8e4d895e7a86', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-04 21:23:06.654887+00', '2025-11-04 21:23:06.654887+00', NULL, 'aal1', NULL, NULL, 'PostmanRuntime/7.49.1', '157.50.169.138', NULL, NULL, NULL, NULL),
	('1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-02 08:27:16.489303+00', '2025-11-05 01:06:52.091826+00', NULL, 'aal1', NULL, '2025-11-05 01:06:52.089235', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.221.85', NULL, NULL, NULL, NULL),
	('76dbff32-5cf2-4020-9d47-af425295bf14', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-05 01:07:39.701429+00', '2025-11-05 01:07:39.701429+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.221.85', NULL, NULL, NULL, NULL),
	('7fa5a34a-6fef-4466-afe6-2ae45e9e074e', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 03:21:04.77029+00', '2025-11-06 03:21:04.77029+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.74', NULL, NULL, NULL, NULL),
	('f10a9e10-7236-4b0a-8688-43e2f685d71f', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 03:21:33.427054+00', '2025-11-06 03:21:33.427054+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '1.22.220.74', NULL, NULL, NULL, NULL),
	('ff71840d-3171-4781-ba28-060b2ef50637', 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', '2025-11-03 18:15:44.828487+00', '2025-11-06 08:18:44.4663+00', NULL, 'aal1', NULL, '2025-11-06 08:18:44.465474', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('625519c8-0cf4-46cf-a3d2-fc48865fd329', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 08:21:04.969233+00', '2025-11-06 08:21:04.969233+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('8c195e56-9f97-4fb9-acf3-7cc7d4ba0222', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '2025-11-06 08:23:18.479624+00', '2025-11-06 08:23:18.479624+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('27e61673-9bd0-4bd6-8948-b485e96c58e3', 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', '2025-11-06 09:12:49.667328+00', '2025-11-06 09:12:49.667328+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('aedbcc9b-7352-4671-ae7f-f139832ebd33', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 09:36:21.17335+00', '2025-11-06 09:36:21.17335+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('4d5f76d2-c4be-4abe-b731-d78e60df71d8', '1ef75d00-3349-4274-8bc8-da135015ab5d', '2025-11-06 10:09:49.650667+00', '2025-11-06 10:09:49.650667+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('9ad01a6a-9480-4ee8-85bf-84e3b5926d3e', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 10:41:17.989202+00', '2025-11-06 10:41:17.989202+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('af04f2fa-7ee3-4beb-be07-1ca929a61750', '1ef75d00-3349-4274-8bc8-da135015ab5d', '2025-11-06 10:43:57.2353+00', '2025-11-06 10:43:57.2353+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL),
	('128b56a1-29fb-4b5f-9adc-0f1055d1adc5', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-06 10:59:33.837525+00', '2025-11-06 10:59:33.837525+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '49.37.250.122', NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('212afbba-8b95-4dbb-84d8-b2c449d69fe4', '2025-10-03 12:29:48.123874+00', '2025-10-03 12:29:48.123874+00', 'password', 'aba7823d-83dc-458f-b7b5-cbc9a7c557dc'),
	('7d64c543-e618-4f25-ba32-0752d143879c', '2025-10-03 12:30:08.151479+00', '2025-10-03 12:30:08.151479+00', 'password', 'ab96263b-9a13-4552-8046-5fbfac7831c4'),
	('6acda0f9-8448-4f0f-90ea-fc8abaf12cb2', '2025-10-03 12:30:55.861801+00', '2025-10-03 12:30:55.861801+00', 'password', 'd1eb14e2-b2fc-4c54-a35d-57bf293207e1'),
	('03fe475c-b30b-4f02-9f09-8a0f692df385', '2025-10-03 12:44:24.706517+00', '2025-10-03 12:44:24.706517+00', 'password', '822aa580-dbf1-4198-9605-cde5b6a38ce0'),
	('07c71dd1-44b4-4334-88c6-e1b94d37c49d', '2025-10-03 12:44:40.944629+00', '2025-10-03 12:44:40.944629+00', 'password', 'adce8927-3671-41c2-87b3-56ea64f2ae7d'),
	('0118cbf7-6225-42e1-ad77-5af91ff5286a', '2025-10-03 12:49:39.891819+00', '2025-10-03 12:49:39.891819+00', 'password', '6afb7e64-47c6-4069-8567-654b7e486936'),
	('a834e35e-65b1-48ca-af2d-f230263ba541', '2025-10-03 12:50:23.642011+00', '2025-10-03 12:50:23.642011+00', 'password', 'f37fb7b4-b4ba-4fea-ad7b-7d60903a9114'),
	('523a6bc2-ceef-4727-aaf8-261387c1472d', '2025-10-03 12:51:28.188622+00', '2025-10-03 12:51:28.188622+00', 'password', 'c79d9adc-a194-43da-96dd-a1e20f6a0ef9'),
	('ce4d91c0-0f6c-4ed2-a5d9-12a21e31cc0d', '2025-10-03 12:57:59.284438+00', '2025-10-03 12:57:59.284438+00', 'password', 'c6206179-8e74-4974-9656-bbccc9e3e2ac'),
	('5350bbd9-6797-46af-ade3-de66d4476cb7', '2025-10-03 12:58:04.803466+00', '2025-10-03 12:58:04.803466+00', 'password', '50d70353-0543-4094-9e24-90785bbc2220'),
	('24659304-470b-41c8-b2b8-504d3fe12c23', '2025-10-03 12:58:14.074875+00', '2025-10-03 12:58:14.074875+00', 'password', '4b62d6da-ee59-44e4-83dd-bb8f44cb7eb7'),
	('bb77eecc-e76e-4f5f-ba70-efe05e0c79a4', '2025-10-08 15:11:32.785202+00', '2025-10-08 15:11:32.785202+00', 'password', 'e38aef1f-8717-48b1-9daf-a393feb31dd2'),
	('cf9d9185-5a89-4da7-b11a-f61ed5239e7e', '2025-10-08 15:32:26.466323+00', '2025-10-08 15:32:26.466323+00', 'password', 'a47065bb-91c3-4f3d-99d5-754b5fbddc75'),
	('d3e5856f-33e0-4b0d-89ac-a325f31b533f', '2025-10-09 16:29:26.381942+00', '2025-10-09 16:29:26.381942+00', 'otp', '8ae83ad7-98be-476f-a8bc-b8559a923ce7'),
	('0d549a02-8e0a-479a-9e40-4119aae5eb4a', '2025-10-09 16:51:48.978245+00', '2025-10-09 16:51:48.978245+00', 'password', '0a1b8979-ed86-40ab-a131-246bc7c1b11b'),
	('eabf49a1-cd5b-4b2a-8f15-20f6290bac74', '2025-10-11 07:29:38.076324+00', '2025-10-11 07:29:38.076324+00', 'password', '19d3ce6b-3094-47ca-bcde-1f5197b334d8'),
	('70e25bdc-59e9-4b78-ac57-864840de7d08', '2025-10-11 10:40:07.39316+00', '2025-10-11 10:40:07.39316+00', 'otp', 'a479645d-1719-40b4-88f6-6ea4b65c3df8'),
	('cd88393e-0ff3-4ff7-9b46-3e1c22708d51', '2025-10-11 10:53:22.556215+00', '2025-10-11 10:53:22.556215+00', 'otp', '8d235ad5-c4b2-45d5-b5ef-720d97e7a23e'),
	('7d45f6f6-9088-4438-ad74-9ecc8abf94f1', '2025-10-12 05:22:31.599406+00', '2025-10-12 05:22:31.599406+00', 'password', '4638bf80-332e-4f29-8be1-766a6e2b0e63'),
	('3b281803-910b-4163-af8d-6733625d6e39', '2025-10-12 13:51:02.781925+00', '2025-10-12 13:51:02.781925+00', 'otp', 'ca83abfb-db22-46f3-aa6c-26fa8806bc5a'),
	('b80b363c-ca0e-4653-aa0a-19f4146772c5', '2025-10-13 05:27:29.115573+00', '2025-10-13 05:27:29.115573+00', 'password', '49f71031-3662-47b5-8bf6-7d109f9615e6'),
	('a3b9c7d9-3b31-41bb-a21a-d39a505fd968', '2025-10-13 05:27:30.042172+00', '2025-10-13 05:27:30.042172+00', 'password', '8a1218ef-fcf3-4758-aecd-dfc76aae0ad7'),
	('0ce8b19b-0ca9-4859-a13a-419541a23d4e', '2025-10-13 11:49:08.436421+00', '2025-10-13 11:49:08.436421+00', 'otp', '3e874d80-3861-412d-9aae-3219f0b508f8'),
	('e8ff1169-31d2-4552-87ae-f24605425bc2', '2025-10-14 09:05:43.299679+00', '2025-10-14 09:05:43.299679+00', 'password', '465c1bc5-ff44-4067-9640-38295ee3e010'),
	('9fd12bf2-45d0-4e2b-86cf-4bb6aa46f5c4', '2025-10-14 09:40:05.62004+00', '2025-10-14 09:40:05.62004+00', 'password', 'd800309a-65b7-4272-93be-a0b6c889410f'),
	('cf871120-b21c-499d-88de-28cad4519914', '2025-10-14 12:58:33.68521+00', '2025-10-14 12:58:33.68521+00', 'password', 'e5c34979-0c8f-4bf8-abec-c39cd464f353'),
	('cc295ca6-7c45-44b0-b804-c2470d27b816', '2025-10-14 14:56:11.065833+00', '2025-10-14 14:56:11.065833+00', 'password', '01d3369a-5156-407b-8a26-ae3f4ba35d49'),
	('10df7781-9188-46a6-bfa1-8993afc9d4ea', '2025-10-14 17:07:39.099723+00', '2025-10-14 17:07:39.099723+00', 'password', '24ae61c5-8e6f-4ba4-93e0-c4b9f3d63aa5'),
	('47cb97c7-b1fc-4a16-bd07-114f562563c6', '2025-10-15 06:20:52.838393+00', '2025-10-15 06:20:52.838393+00', 'password', 'f544ba12-6a49-48de-bf52-6ad19e43ecd9'),
	('216273be-38c4-48f0-bad7-e620e1d34daa', '2025-10-15 09:09:06.524183+00', '2025-10-15 09:09:06.524183+00', 'password', 'b32e0403-e4c5-46ad-a3c0-54bdcc8f0e4f'),
	('80855734-1070-4e6c-a38e-e1a34d72bf09', '2025-10-16 08:43:56.686944+00', '2025-10-16 08:43:56.686944+00', 'otp', 'fc04d7c0-c241-4888-b5f8-e4f41b4c2ce8'),
	('31934895-15a6-479b-bb02-78971ff352a3', '2025-10-16 10:02:13.446651+00', '2025-10-16 10:02:13.446651+00', 'otp', 'a6a40ad0-e667-4058-b5c9-bb931fec0175'),
	('98c02215-e1b1-4c4f-a373-a796c82dc70e', '2025-10-16 11:49:08.675856+00', '2025-10-16 11:49:08.675856+00', 'otp', '1b79fcb3-94ce-4aae-8c15-b343c5cf940f'),
	('d72cf2ab-b7d1-4120-ab6d-90dbef213ed3', '2025-10-16 17:09:22.088085+00', '2025-10-16 17:09:22.088085+00', 'otp', '561ea055-4851-4dad-8d83-3f614b31992d'),
	('53f2e520-2181-4f14-b47a-098f8bf33483', '2025-10-16 18:38:25.050352+00', '2025-10-16 18:38:25.050352+00', 'otp', '68b66a0c-414d-4dfc-9eb6-1ffe8400f576'),
	('a7fe09fc-ffe4-4f5f-96f8-7f90f0289559', '2025-10-17 10:50:01.229392+00', '2025-10-17 10:50:01.229392+00', 'otp', '154fb6ac-525b-4783-9291-b8c03f21585f'),
	('7db28fa7-231c-4d1f-bbf4-2349d82d2e02', '2025-10-17 11:58:46.320556+00', '2025-10-17 11:58:46.320556+00', 'otp', '6446f636-1fde-470a-a214-f15bcc485179'),
	('fbdbcc38-4529-49ce-9b4b-d522cf0e927c', '2025-10-18 03:14:28.474881+00', '2025-10-18 03:14:28.474881+00', 'otp', '42478583-67e2-4e2d-85f4-edd63177053d'),
	('41390bd6-0744-4a95-a412-4245498e65ac', '2025-10-18 13:55:38.288908+00', '2025-10-18 13:55:38.288908+00', 'otp', 'ed35aaa7-1b3e-4c16-9ec6-818e810e90b2'),
	('9447e1f6-bb07-4502-88b8-651147b19dec', '2025-10-18 18:30:03.802887+00', '2025-10-18 18:30:03.802887+00', 'otp', '9f615dce-8a06-48a9-a822-9a2e7da556d2'),
	('a2e59cdd-501e-4b7c-a720-3c94051a8880', '2025-10-18 18:35:10.565779+00', '2025-10-18 18:35:10.565779+00', 'otp', 'f8013010-6589-4dc9-a332-09f5df487630'),
	('a563383a-ef63-412c-bc9c-4ac486a9ef30', '2025-10-18 18:41:58.211635+00', '2025-10-18 18:41:58.211635+00', 'otp', '569c1aad-8887-42f3-a251-e144ddd08ee4'),
	('c04b4c80-c38e-4643-89eb-3e91f93883e9', '2025-10-19 05:44:00.182718+00', '2025-10-19 05:44:00.182718+00', 'otp', '3d70bd70-04eb-44c1-8e53-339aca0e1c9d'),
	('101589de-2bc6-4c0b-98ae-e3de5dd0926d', '2025-10-19 05:51:49.134911+00', '2025-10-19 05:51:49.134911+00', 'otp', '76285f4f-be3a-4af7-8c49-54a9440d7527'),
	('35ae559d-47e9-48f2-bb2a-6258eb019c1b', '2025-10-19 09:28:14.241605+00', '2025-10-19 09:28:14.241605+00', 'otp', '51822895-a684-4624-a773-8dfa6ece2729'),
	('949d1b07-20c9-43d0-8c06-638ae71a1d51', '2025-10-20 06:46:39.546664+00', '2025-10-20 06:46:39.546664+00', 'otp', 'c10f1405-785d-47fe-904c-848f34f1fc8b'),
	('3a386ce0-cab3-43c3-892b-433143634d6b', '2025-10-20 07:13:26.724383+00', '2025-10-20 07:13:26.724383+00', 'otp', '8ab94f5f-c973-467a-8456-d1519b012c1a'),
	('ff71687c-4081-4f2f-8284-1dabbf5b2d06', '2025-10-20 08:29:00.643359+00', '2025-10-20 08:29:00.643359+00', 'otp', 'bc9f9e54-d2c6-4e12-a608-fa7012cf469f'),
	('dbb38478-3fad-43e5-8b6b-daa86ce21131', '2025-10-20 08:40:08.551928+00', '2025-10-20 08:40:08.551928+00', 'otp', 'e5fdc3c3-7b7d-441a-a395-9be1d97e4b3a'),
	('0e8b8150-323e-4a5e-9edc-c450bc1dfdce', '2025-10-20 11:53:00.206288+00', '2025-10-20 11:53:00.206288+00', 'otp', '1e3c7144-c61c-42ed-ae19-9325aed45f49'),
	('7c688fdb-b4f9-416a-b1e9-27746b360101', '2025-10-20 12:19:48.927886+00', '2025-10-20 12:19:48.927886+00', 'password', '332ed486-a897-4226-825e-923191e13ae1'),
	('10563898-0833-4880-a687-6fa022db873d', '2025-10-20 12:40:49.362006+00', '2025-10-20 12:40:49.362006+00', 'otp', '87b5fa8d-716c-4bac-a7a8-70eacca3d0d5'),
	('5e253679-fd01-4c56-9f91-4686f80b7b51', '2025-10-20 12:42:37.526382+00', '2025-10-20 12:42:37.526382+00', 'otp', 'ff8604ff-3168-4d38-ab33-69b121d0eb23'),
	('2b92a50b-e54b-4133-9618-998472e52c5e', '2025-10-20 13:27:07.275209+00', '2025-10-20 13:27:07.275209+00', 'password', '212b8d37-d21c-4f2d-8d03-e2083d2170bb'),
	('cdfa71b1-3a6f-42b5-9149-cd11ce3da4ab', '2025-10-20 13:34:08.979009+00', '2025-10-20 13:34:08.979009+00', 'password', '73774b3a-4496-4a35-a794-ac748a0616ac'),
	('867d62a9-d898-4883-acdd-8c3dde2a3425', '2025-10-20 13:37:16.544236+00', '2025-10-20 13:37:16.544236+00', 'password', '986b4772-fffa-4eef-9978-d0e8d10469aa'),
	('caabed61-5f8c-4e5d-9d38-a409f4852a4a', '2025-10-20 14:11:07.162701+00', '2025-10-20 14:11:07.162701+00', 'password', '37d2fe14-102c-474d-914e-1a61fd2fc887'),
	('46be002a-3dba-4ec3-9573-4aa835722bb1', '2025-10-20 14:13:44.567528+00', '2025-10-20 14:13:44.567528+00', 'otp', 'bfcc23da-42b5-4e89-b2de-e5f58a2cae0c'),
	('52449a9a-6700-4450-8332-350c2055d3bd', '2025-10-20 18:50:12.196101+00', '2025-10-20 18:50:12.196101+00', 'otp', '965d1018-e168-498a-a348-5fb8094cafa3'),
	('d84ffa8c-be12-499f-aed2-12443dfb468d', '2025-10-21 04:18:32.278056+00', '2025-10-21 04:18:32.278056+00', 'otp', 'cf125e41-0924-4703-adfc-7f3627d9b932'),
	('6719404f-e71a-41b7-a34e-080bec722e93', '2025-10-21 04:27:44.218623+00', '2025-10-21 04:27:44.218623+00', 'otp', '4a84b658-dddf-4322-a32a-886ae0c234b6'),
	('32641d7a-46c1-477c-8c24-a443ad435cd3', '2025-10-21 05:19:50.789759+00', '2025-10-21 05:19:50.789759+00', 'otp', '7ec668e5-88a4-4955-9de2-606d5120dc5d'),
	('5e02f6a1-c101-4e5f-9bde-c612a993e2cc', '2025-10-21 05:54:31.957471+00', '2025-10-21 05:54:31.957471+00', 'otp', 'be49acdb-f59a-4762-a828-bec89e5a53c6'),
	('fccc9b3b-228d-40c4-9b4e-a68e899704dd', '2025-10-21 06:19:39.931098+00', '2025-10-21 06:19:39.931098+00', 'otp', '4e00940b-fd3e-42db-844f-847f5009fdc9'),
	('472eec7d-41dc-4836-968f-e4018e447e06', '2025-10-21 07:22:53.97475+00', '2025-10-21 07:22:53.97475+00', 'otp', 'b5f28c75-1fa7-4439-958d-146cba11f212'),
	('90b8097e-9f35-4874-898a-acc962ffd825', '2025-10-21 07:26:46.097138+00', '2025-10-21 07:26:46.097138+00', 'otp', '9da4c784-504b-47c3-a01b-279e0e22cc0f'),
	('0ee67cc1-4342-4541-9802-d72df2438550', '2025-10-21 08:56:57.848776+00', '2025-10-21 08:56:57.848776+00', 'otp', '9c4ed17e-d39e-4df9-adfe-c81d3bd32da0'),
	('614fedc7-56fa-4d58-80df-918f759c84fd', '2025-10-21 10:03:01.005644+00', '2025-10-21 10:03:01.005644+00', 'otp', '1189d7b8-bea7-435a-bda4-9a84bbffaebb'),
	('f1c55ad2-a1ee-424f-83ec-603bdb2a34c2', '2025-10-22 06:24:50.237871+00', '2025-10-22 06:24:50.237871+00', 'otp', '634c9fd3-50b1-4d19-a602-ea5823c7e4d5'),
	('4e981c41-5099-4136-ae39-6ff950e2411b', '2025-10-22 09:03:25.173507+00', '2025-10-22 09:03:25.173507+00', 'otp', '7221f67a-2bf2-4708-b84f-acb2869d49ac'),
	('a3c03a18-507a-4e2c-94bb-3fa7f3011e22', '2025-10-24 11:42:40.764404+00', '2025-10-24 11:42:40.764404+00', 'password', '3fb6f759-898e-43c1-a9a5-8c69afa38dbe'),
	('1e99d05e-bd69-4558-8bec-d8fa0c083cad', '2025-10-24 11:49:52.057197+00', '2025-10-24 11:49:52.057197+00', 'otp', '4ded0dec-c3f8-4fec-9251-53be139a03e7'),
	('66177f9d-5cac-43ad-825d-4f5dd86457f0', '2025-10-24 11:50:58.343432+00', '2025-10-24 11:50:58.343432+00', 'password', '64ceef32-8d8b-4290-b31f-fb8aa07556bf'),
	('322f2367-c6ea-4dd1-8782-641a8d8385ec', '2025-10-24 11:55:36.234898+00', '2025-10-24 11:55:36.234898+00', 'password', 'd08de56c-b033-4a42-900d-d34b2aef3243'),
	('a5ac17c1-7757-4101-86ba-c540ac65208f', '2025-10-24 16:43:21.941153+00', '2025-10-24 16:43:21.941153+00', 'password', 'c8791f02-b411-4b67-b90d-b2ec7d95f37d'),
	('f3e19700-7de2-449e-b103-d2eb655f3973', '2025-10-31 16:14:26.000192+00', '2025-10-31 16:14:26.000192+00', 'password', '9777ccfe-e403-4e69-bf40-f84330c7edab'),
	('26c821de-6843-46fd-a620-e26a9ccaeb5f', '2025-11-01 07:33:55.345517+00', '2025-11-01 07:33:55.345517+00', 'password', '2707c95c-850e-49ed-90b0-3589a589545c'),
	('7a9aebf1-e74b-4949-8142-c0e6849ad7eb', '2025-11-01 07:39:44.543341+00', '2025-11-01 07:39:44.543341+00', 'password', '42558cbc-ed35-41a9-914e-0e8e4c142b5f'),
	('199f7ce0-f495-4fc2-9b0a-af9ba47eecc7', '2025-11-01 07:40:00.923807+00', '2025-11-01 07:40:00.923807+00', 'password', 'a07a9254-0851-43ff-902a-bfb9c0b67dd1'),
	('561b4c9c-cdd5-4df5-b5a1-0269aeab2af0', '2025-11-01 07:41:07.045947+00', '2025-11-01 07:41:07.045947+00', 'password', '7b3018c1-15f8-4493-90cd-3a8588cf15f7'),
	('8f4998e9-659a-4246-9267-4a90b7a5d73d', '2025-11-01 07:44:57.517532+00', '2025-11-01 07:44:57.517532+00', 'password', '0d6eb5d7-d8a5-4090-946e-89bb625b0efd'),
	('6c148dc2-9ff7-442c-961b-684e7c0bc874', '2025-11-01 07:46:59.094985+00', '2025-11-01 07:46:59.094985+00', 'password', '4cd809d8-c3a1-469e-995e-71c2eccbe8e8'),
	('a70179e0-4e5f-44cc-a830-10d06ac7b5ba', '2025-11-01 07:49:40.525852+00', '2025-11-01 07:49:40.525852+00', 'password', 'a8a9bef2-d5b7-4af2-b708-0201fa2c2470'),
	('36326774-31c0-4bfe-93de-60bbc5838f44', '2025-11-01 07:50:10.69107+00', '2025-11-01 07:50:10.69107+00', 'password', 'dcb6142a-f708-4a4d-bb44-7353b58e6b69'),
	('00558f69-0bab-4df9-80e4-c4ab4e5ff74e', '2025-11-01 07:53:15.341355+00', '2025-11-01 07:53:15.341355+00', 'password', '182aeffc-5e40-4745-b0ea-b05b2e9e99f9'),
	('c74a8f99-03cf-485b-a0b7-75e85982907b', '2025-11-01 12:34:46.298575+00', '2025-11-01 12:34:46.298575+00', 'password', 'df398c06-3f6b-4a29-8427-4109216aefb2'),
	('d448eb68-3e87-4816-b8ac-4bb87651f108', '2025-11-01 12:35:16.276467+00', '2025-11-01 12:35:16.276467+00', 'password', 'f82433be-0ee5-4cd6-9799-bdd199ed5d5c'),
	('5b67fed1-a215-41bd-9a37-1f4b50ed0b11', '2025-11-01 12:40:37.977431+00', '2025-11-01 12:40:37.977431+00', 'password', 'e720933f-569a-418c-9965-e467413b3c9f'),
	('ef35866d-8ea7-46f9-84c7-c9cfbf908528', '2025-11-01 12:51:36.401266+00', '2025-11-01 12:51:36.401266+00', 'password', '79155126-1f29-4eb1-927f-36dd6b311c98'),
	('ec098e38-82c2-48f5-ab3e-2716ef34618f', '2025-11-01 12:52:03.904899+00', '2025-11-01 12:52:03.904899+00', 'password', '1c888143-6a2f-4dd5-9b59-f45d68909cad'),
	('d758b64e-7535-4864-b486-01e7b50545c0', '2025-11-01 13:06:29.6558+00', '2025-11-01 13:06:29.6558+00', 'password', '24a5571b-3bc6-479a-ae2b-a68c08c45d36'),
	('14c38a67-2bfd-453e-9684-9e29235ad7ac', '2025-11-01 13:07:18.923505+00', '2025-11-01 13:07:18.923505+00', 'password', 'b8fa5394-7c8f-4a29-a378-7a2816a9dc3f'),
	('5b64f237-5a3c-434e-87f1-c859b6479bb9', '2025-11-01 13:09:47.442044+00', '2025-11-01 13:09:47.442044+00', 'password', 'c53b805c-0442-44ad-a6ee-bc7fc057a279'),
	('7b79505c-25e9-4de0-a86e-c297f1d602d2', '2025-11-01 13:10:11.800806+00', '2025-11-01 13:10:11.800806+00', 'password', '5ebf1f57-8604-4daf-942c-82b6463f4a00'),
	('961f7c1c-89fa-4825-be2e-655322c8b305', '2025-11-01 13:34:14.864352+00', '2025-11-01 13:34:14.864352+00', 'password', 'd4b8ecd5-ecee-4160-91cf-5f84881167e1'),
	('e1a8e039-1052-4ed1-bbca-6fa6a2ab6309', '2025-11-01 13:34:22.504508+00', '2025-11-01 13:34:22.504508+00', 'password', '4778e392-ea8c-4c48-b252-a1773878585f'),
	('cfbee2f3-3315-4422-a7fe-01143ce2df69', '2025-11-01 13:52:33.377317+00', '2025-11-01 13:52:33.377317+00', 'password', '21648635-dd0c-442d-8e77-57d0d0461077'),
	('270a5ce6-ad55-4f27-b4e7-69f46e340fa5', '2025-11-01 14:11:59.071117+00', '2025-11-01 14:11:59.071117+00', 'password', '73ee9488-4cc2-4193-be7b-6e097ca8d648'),
	('e4817c4f-2627-47af-a0f0-6308ffed8bf6', '2025-11-01 14:30:04.781101+00', '2025-11-01 14:30:04.781101+00', 'otp', 'bf35f91c-6c89-4594-a3e2-a46979476b63'),
	('b370f6d1-8af2-4272-8770-7a6f75f1fade', '2025-11-01 14:31:51.741619+00', '2025-11-01 14:31:51.741619+00', 'password', 'f859b4f5-bce4-490e-bbc8-2b8f70bc69df'),
	('b77d3a4e-f98f-47ae-92d8-076e216e0088', '2025-11-01 14:35:52.993249+00', '2025-11-01 14:35:52.993249+00', 'password', 'f64fbf78-9b9d-4792-884f-a3042f05a9db'),
	('d6026fd4-ddee-4613-8964-548ca38c3a01', '2025-11-01 15:20:04.360318+00', '2025-11-01 15:20:04.360318+00', 'password', '8e6ae374-01ab-4a36-be5d-c1a92b641181'),
	('c224231b-692f-4259-9bb5-63bbcfcfc8ea', '2025-11-01 16:18:05.693575+00', '2025-11-01 16:18:05.693575+00', 'password', '054f17dd-deb6-4796-9a0a-d1c462b1827c'),
	('d1947753-7081-4025-a204-60f58976b2c3', '2025-11-01 16:49:58.31127+00', '2025-11-01 16:49:58.31127+00', 'password', 'a27c0714-d61a-47a1-af5a-90715518a10f'),
	('582e899c-10e0-4d3f-adad-b077ad0b65ad', '2025-11-01 16:51:12.262262+00', '2025-11-01 16:51:12.262262+00', 'password', '376fb655-5332-4ca3-95b2-8b7adf42f1f0'),
	('f87b868a-82d0-443b-9962-d125f8b0314b', '2025-11-01 16:58:11.485181+00', '2025-11-01 16:58:11.485181+00', 'password', '3f56b690-10c8-433b-aa47-b5850fb8177a'),
	('70dadc7e-97ad-4fc8-90f8-12f6000b2c64', '2025-11-01 17:06:11.639886+00', '2025-11-01 17:06:11.639886+00', 'password', '0a46305d-25b6-4362-a8e2-a72d834eb43e'),
	('29819a05-e4ae-412f-836c-17ce7651f980', '2025-11-01 17:10:40.535366+00', '2025-11-01 17:10:40.535366+00', 'password', '23c8deb6-78d3-4846-b3c6-dff24acbb634'),
	('be718026-8c0e-4dff-9afb-7605a401983f', '2025-11-01 17:11:11.142987+00', '2025-11-01 17:11:11.142987+00', 'password', 'f14cae8b-9ca5-4eeb-9a8c-3b6aada598b1'),
	('18a73808-18d9-4c8d-b1c4-f417f319fad1', '2025-11-01 17:24:05.001752+00', '2025-11-01 17:24:05.001752+00', 'password', 'a6edf1e3-fcb0-4464-9876-e260dc6dd576'),
	('5b4621cf-0f96-4b81-8518-f53766e91a81', '2025-11-01 18:21:16.565688+00', '2025-11-01 18:21:16.565688+00', 'password', '25bb1a92-00bd-4777-8f40-4371932cdec0'),
	('8b50e5b2-6fc8-4fc7-8db2-ac86acbab970', '2025-11-01 18:27:07.745041+00', '2025-11-01 18:27:07.745041+00', 'password', '93c93382-c8d7-40d0-a8b1-f41c794a9c82'),
	('cfc1439f-bed2-4518-b5ae-ed3335f37bec', '2025-11-01 18:30:47.18002+00', '2025-11-01 18:30:47.18002+00', 'password', '886d49eb-ac01-4b75-82d5-4dc0fd102dcf'),
	('8f3e52f2-cbbf-4bd2-881d-f85c690466ee', '2025-11-01 18:32:05.315424+00', '2025-11-01 18:32:05.315424+00', 'password', 'e8480482-9aae-428b-915f-0c7d44581d38'),
	('91d6e126-618e-44cb-8ebb-7ceaea51bfb0', '2025-11-01 18:34:10.552074+00', '2025-11-01 18:34:10.552074+00', 'password', '228fd161-c6b8-40d5-855c-9ec65c39805f'),
	('b99e4914-a771-497f-825b-2e87da73ba18', '2025-11-01 18:36:02.477186+00', '2025-11-01 18:36:02.477186+00', 'password', '686f0c76-92d9-415e-a7c5-2991122b16f9'),
	('99857fe4-6c66-4830-b2eb-b10b068edd92', '2025-11-01 18:56:22.137143+00', '2025-11-01 18:56:22.137143+00', 'password', '74a4aa59-85cf-4ca3-bb09-3ca9b873c3c7'),
	('82f5c362-db7c-4042-ae77-1bec1e558f84', '2025-11-01 18:58:11.047555+00', '2025-11-01 18:58:11.047555+00', 'password', 'dcbbc212-7543-406d-b361-79fd3e1b2456'),
	('6ee3f2ec-7661-4131-8822-ab56294bd9e8', '2025-11-01 19:01:41.12294+00', '2025-11-01 19:01:41.12294+00', 'password', 'd7a5687f-3cc9-45cb-8d4a-b5d196047fb7'),
	('314af7b9-c16f-46e4-9b0b-7a6cfebe9f6d', '2025-11-02 08:27:10.035262+00', '2025-11-02 08:27:10.035262+00', 'password', '2bb9d9ac-3aa3-4ac5-adf7-c1cb75c93266'),
	('1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa', '2025-11-02 08:27:16.491531+00', '2025-11-02 08:27:16.491531+00', 'password', '96c7c3d7-0744-4e8f-a583-a39e3baeba7f'),
	('80db73b4-f2b2-4e54-8b2e-a3d9ced2d8f0', '2025-11-02 13:45:21.312235+00', '2025-11-02 13:45:21.312235+00', 'password', '8bd220b5-14c5-4ad0-9496-058a16fb7f75'),
	('2ac10c0e-d5be-4303-b768-85a7277fef35', '2025-11-03 18:13:27.526193+00', '2025-11-03 18:13:27.526193+00', 'password', '8d0989e4-5ac6-4e16-b4c9-4d30dfb6b225'),
	('ff71840d-3171-4781-ba28-060b2ef50637', '2025-11-03 18:15:44.837476+00', '2025-11-03 18:15:44.837476+00', 'password', '3f3951ce-ab54-49d8-87cd-a70f4a607431'),
	('0b95f55b-a8fd-474b-8be7-8e4d895e7a86', '2025-11-04 21:23:06.749845+00', '2025-11-04 21:23:06.749845+00', 'password', '6deb0f6a-ff77-4270-b54e-9f7fc3c367a2'),
	('76dbff32-5cf2-4020-9d47-af425295bf14', '2025-11-05 01:07:39.720959+00', '2025-11-05 01:07:39.720959+00', 'password', 'faa6d05a-dfb6-4f87-ac3c-75c84fe79a64'),
	('e1643ae3-f9cd-4351-bd86-19bfd9aa4aec', '2025-11-05 01:52:33.417488+00', '2025-11-05 01:52:33.417488+00', 'password', 'ac332d9c-aed1-4d2f-b8bd-0fe732536bd5'),
	('10e8f694-c1cf-4df0-aa60-11cd09c33af0', '2025-11-05 05:57:16.345839+00', '2025-11-05 05:57:16.345839+00', 'password', '4e88b844-26dd-4879-ab32-3b42c4ce92be'),
	('f518c3b2-1953-40ae-ad65-db0cd047d907', '2025-11-06 03:11:31.199032+00', '2025-11-06 03:11:31.199032+00', 'password', '2da8a795-4e92-4536-b442-78bb4749f388'),
	('60eee84a-b37e-476e-a9a8-e751f3501760', '2025-11-06 03:17:11.936133+00', '2025-11-06 03:17:11.936133+00', 'password', 'be387319-832d-4155-9aa5-7a208b87ae25'),
	('7fa5a34a-6fef-4466-afe6-2ae45e9e074e', '2025-11-06 03:21:04.778809+00', '2025-11-06 03:21:04.778809+00', 'password', '392a666d-c3b9-4d57-9587-585fb32d4eb3'),
	('f10a9e10-7236-4b0a-8688-43e2f685d71f', '2025-11-06 03:21:33.430055+00', '2025-11-06 03:21:33.430055+00', 'password', 'bd541eb6-226b-4c75-885a-31e94772b2e1'),
	('625519c8-0cf4-46cf-a3d2-fc48865fd329', '2025-11-06 08:21:04.9794+00', '2025-11-06 08:21:04.9794+00', 'password', '9b2aac73-c192-4ee8-8d68-bab922c53891'),
	('8c195e56-9f97-4fb9-acf3-7cc7d4ba0222', '2025-11-06 08:23:18.496172+00', '2025-11-06 08:23:18.496172+00', 'password', '00fd98ae-6791-45b8-91d1-9fe951ab47f7'),
	('27e61673-9bd0-4bd6-8948-b485e96c58e3', '2025-11-06 09:12:49.709039+00', '2025-11-06 09:12:49.709039+00', 'password', 'dbde6c86-5d79-45ab-8310-52b0db9ab8a7'),
	('aedbcc9b-7352-4671-ae7f-f139832ebd33', '2025-11-06 09:36:21.242798+00', '2025-11-06 09:36:21.242798+00', 'password', 'ab945917-fb1b-4ac2-8f9a-32b5b42135eb'),
	('4d5f76d2-c4be-4abe-b731-d78e60df71d8', '2025-11-06 10:09:49.697943+00', '2025-11-06 10:09:49.697943+00', 'password', '9d5ed3db-765d-4c6f-b651-c168df80ca7e'),
	('9ad01a6a-9480-4ee8-85bf-84e3b5926d3e', '2025-11-06 10:41:18.084553+00', '2025-11-06 10:41:18.084553+00', 'password', 'b9a62159-98a4-4067-bde5-67a6c010ada0'),
	('af04f2fa-7ee3-4beb-be07-1ca929a61750', '2025-11-06 10:43:57.246241+00', '2025-11-06 10:43:57.246241+00', 'password', 'e8239707-4dae-47d2-8eb5-62784bd73498'),
	('128b56a1-29fb-4b5f-9adc-0f1055d1adc5', '2025-11-06 10:59:33.854884+00', '2025-11-06 10:59:33.854884+00', 'password', '3b43786c-9cfe-463e-8617-03e14dbbaf71');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('70a11d47-b91b-4d11-ac66-b5633eb32a95', '94782a1f-7739-4d83-ab9b-d6933f78ec59', 'confirmation_token', 'd32747d2b551f3938f277426eb18858e03d0812e2af46add39dfe72b', 'bitpodcast24@gmail.com', '2025-10-19 05:43:20.711261', '2025-10-19 05:43:20.711261'),
	('31e853d8-0caa-4b12-a692-031f8f2b3f52', '62d516a1-8947-4768-a45a-1362a3cc43fb', 'recovery_token', '5264415d15dee00d6fd778f88416ce91824f3d1c281b01f82068513a', 'vrolightvro@gmail.com', '2025-10-31 16:13:03.69363', '2025-10-31 16:13:03.69363'),
	('74a30341-83a0-4344-ad45-b05a99825694', '89822878-2382-4078-a654-c48870709bb8', 'recovery_token', 'd56920e9d2a5731b2486c193b15ef845a6e735abb49bbfdf3f2a98d2', 'srujannh@gmail.com', '2025-11-01 12:35:00.453454', '2025-11-01 12:35:00.453454'),
	('99310f1d-e4e0-4c71-9717-ca36d5d9393c', '4a39dc4b-5f95-45b0-9b4f-67b253943233', 'confirmation_token', '2bc072442f1ea35a36254d75bdf282a894181325f2b0d57e03dbe9c9', 'vignesh.bs0@gmail.com', '2025-11-01 19:25:06.046102', '2025-11-01 19:25:06.046102'),
	('d8630f1e-e1cd-4c30-a86b-a49000f994b9', 'cd307408-9c83-475e-a874-be26288d534c', 'confirmation_token', '5abcc8a78a708f320803b5cd969fd0a9e25b3fce18e2e3e1bc94a70a', 'ashar808@gmail.com', '2025-11-01 19:58:14.685752', '2025-11-01 19:58:14.685752');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'f357hzuaxjg2', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:29:48.098943+00', '2025-10-03 12:29:48.098943+00', NULL, '212afbba-8b95-4dbb-84d8-b2c449d69fe4'),
	('00000000-0000-0000-0000-000000000000', 2, 'u6gmoffb2so7', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:30:08.150267+00', '2025-10-03 12:30:08.150267+00', NULL, '7d64c543-e618-4f25-ba32-0752d143879c'),
	('00000000-0000-0000-0000-000000000000', 3, 'fmiadcutwhz6', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:30:55.838035+00', '2025-10-03 12:30:55.838035+00', NULL, '6acda0f9-8448-4f0f-90ea-fc8abaf12cb2'),
	('00000000-0000-0000-0000-000000000000', 4, 'ztlx4w5qzg27', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:44:24.689434+00', '2025-10-03 12:44:24.689434+00', NULL, '03fe475c-b30b-4f02-9f09-8a0f692df385'),
	('00000000-0000-0000-0000-000000000000', 5, 'f25cklloxu3w', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:44:40.943382+00', '2025-10-03 12:44:40.943382+00', NULL, '07c71dd1-44b4-4334-88c6-e1b94d37c49d'),
	('00000000-0000-0000-0000-000000000000', 6, 'sn75ubx2uzyl', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:49:39.889327+00', '2025-10-03 12:49:39.889327+00', NULL, '0118cbf7-6225-42e1-ad77-5af91ff5286a'),
	('00000000-0000-0000-0000-000000000000', 7, 'nfbvj7s74wqk', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:50:23.640658+00', '2025-10-03 12:50:23.640658+00', NULL, 'a834e35e-65b1-48ca-af2d-f230263ba541'),
	('00000000-0000-0000-0000-000000000000', 8, '7rvgfndluhdz', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:51:28.153555+00', '2025-10-03 12:51:28.153555+00', NULL, '523a6bc2-ceef-4727-aaf8-261387c1472d'),
	('00000000-0000-0000-0000-000000000000', 9, 'xgjsim6345xp', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:57:59.27684+00', '2025-10-03 12:57:59.27684+00', NULL, 'ce4d91c0-0f6c-4ed2-a5d9-12a21e31cc0d'),
	('00000000-0000-0000-0000-000000000000', 10, 'od7tzgse5ldc', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:58:04.797676+00', '2025-10-03 12:58:04.797676+00', NULL, '5350bbd9-6797-46af-ade3-de66d4476cb7'),
	('00000000-0000-0000-0000-000000000000', 11, '3tmvfcpe7fhg', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-03 12:58:14.073638+00', '2025-10-03 12:58:14.073638+00', NULL, '24659304-470b-41c8-b2b8-504d3fe12c23'),
	('00000000-0000-0000-0000-000000000000', 193, '7lwzu6hyrs2o', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-04 21:23:06.697997+00', '2025-11-04 21:23:06.697997+00', NULL, '0b95f55b-a8fd-474b-8be7-8e4d895e7a86'),
	('00000000-0000-0000-0000-000000000000', 199, '65fintgc2zha', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-05 14:11:27.203997+00', '2025-11-06 03:11:24.792246+00', '7w4kobxacwnp', '10e8f694-c1cf-4df0-aa60-11cd09c33af0'),
	('00000000-0000-0000-0000-000000000000', 203, 'sdpckz36mggs', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 03:21:04.774239+00', '2025-11-06 03:21:04.774239+00', NULL, '7fa5a34a-6fef-4466-afe6-2ae45e9e074e'),
	('00000000-0000-0000-0000-000000000000', 204, 'c4forp6opnos', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 03:21:33.428629+00', '2025-11-06 03:21:33.428629+00', NULL, 'f10a9e10-7236-4b0a-8688-43e2f685d71f'),
	('00000000-0000-0000-0000-000000000000', 17, 'bcpywrzgnoic', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-08 15:11:32.748542+00', '2025-10-08 15:11:32.748542+00', NULL, 'bb77eecc-e76e-4f5f-ba70-efe05e0c79a4'),
	('00000000-0000-0000-0000-000000000000', 18, 'lzgrxio2fryr', '70cee473-d0a2-4484-8a84-e0a5cd4e584c', false, '2025-10-08 15:32:26.429058+00', '2025-10-08 15:32:26.429058+00', NULL, 'cf9d9185-5a89-4da7-b11a-f61ed5239e7e'),
	('00000000-0000-0000-0000-000000000000', 207, 'pscdiervph25', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-11-06 08:23:18.487018+00', '2025-11-06 08:23:18.487018+00', NULL, '8c195e56-9f97-4fb9-acf3-7cc7d4ba0222'),
	('00000000-0000-0000-0000-000000000000', 20, '4m6myxk554ga', '685c4887-fc38-4d76-a342-ec29de3e0f85', false, '2025-10-09 16:29:26.362161+00', '2025-10-09 16:29:26.362161+00', NULL, 'd3e5856f-33e0-4b0d-89ac-a325f31b533f'),
	('00000000-0000-0000-0000-000000000000', 21, 'ybw7ho6w5qud', 'fbd44ebd-1994-4c93-8359-8dbdea32a1e9', false, '2025-10-09 16:51:48.95737+00', '2025-10-09 16:51:48.95737+00', NULL, '0d549a02-8e0a-479a-9e40-4119aae5eb4a'),
	('00000000-0000-0000-0000-000000000000', 22, 'ppckuuwamfaj', '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', false, '2025-10-11 07:29:38.048785+00', '2025-10-11 07:29:38.048785+00', NULL, 'eabf49a1-cd5b-4b2a-8f15-20f6290bac74'),
	('00000000-0000-0000-0000-000000000000', 210, '7s2eohlrwooh', '1ef75d00-3349-4274-8bc8-da135015ab5d', false, '2025-11-06 10:09:49.660384+00', '2025-11-06 10:09:49.660384+00', NULL, '4d5f76d2-c4be-4abe-b731-d78e60df71d8'),
	('00000000-0000-0000-0000-000000000000', 24, 'fooicwjlpwep', '7a221af0-dce5-40f9-8d64-966900fde79d', false, '2025-10-11 10:40:07.390749+00', '2025-10-11 10:40:07.390749+00', NULL, '70e25bdc-59e9-4b78-ac57-864840de7d08'),
	('00000000-0000-0000-0000-000000000000', 25, 'xnu6jqhhvvhc', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-11 10:53:22.544461+00', '2025-10-11 10:53:22.544461+00', NULL, 'cd88393e-0ff3-4ff7-9b46-3e1c22708d51'),
	('00000000-0000-0000-0000-000000000000', 26, 'bbshucpsjly4', 'ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', false, '2025-10-12 05:22:31.58492+00', '2025-10-12 05:22:31.58492+00', NULL, '7d45f6f6-9088-4438-ad74-9ecc8abf94f1'),
	('00000000-0000-0000-0000-000000000000', 27, 'u25sawcqffsb', 'ca967e27-a291-4796-8159-ecc8854871ae', false, '2025-10-12 13:51:02.755546+00', '2025-10-12 13:51:02.755546+00', NULL, '3b281803-910b-4163-af8d-6733625d6e39'),
	('00000000-0000-0000-0000-000000000000', 28, 'vgsy4yoqw23s', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-13 05:27:29.086953+00', '2025-10-13 05:27:29.086953+00', NULL, 'b80b363c-ca0e-4653-aa0a-19f4146772c5'),
	('00000000-0000-0000-0000-000000000000', 29, 'mjngji6iwx6c', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-13 05:27:30.037642+00', '2025-10-13 05:27:30.037642+00', NULL, 'a3b9c7d9-3b31-41bb-a21a-d39a505fd968'),
	('00000000-0000-0000-0000-000000000000', 30, 'q3mivzuvoeqb', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-13 11:49:08.428001+00', '2025-10-13 11:49:08.428001+00', NULL, '0ce8b19b-0ca9-4859-a13a-419541a23d4e'),
	('00000000-0000-0000-0000-000000000000', 31, 'smrjjy7tysuo', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-14 09:05:43.24747+00', '2025-10-14 09:05:43.24747+00', NULL, 'e8ff1169-31d2-4552-87ae-f24605425bc2'),
	('00000000-0000-0000-0000-000000000000', 32, 'tinayjmbdskr', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-14 09:40:05.576755+00', '2025-10-14 09:40:05.576755+00', NULL, '9fd12bf2-45d0-4e2b-86cf-4bb6aa46f5c4'),
	('00000000-0000-0000-0000-000000000000', 33, '466owy2ym5e3', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-14 12:58:33.64455+00', '2025-10-14 12:58:33.64455+00', NULL, 'cf871120-b21c-499d-88de-28cad4519914'),
	('00000000-0000-0000-0000-000000000000', 34, 'evjvkhigln5w', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-14 14:56:11.033587+00', '2025-10-14 14:56:11.033587+00', NULL, 'cc295ca6-7c45-44b0-b804-c2470d27b816'),
	('00000000-0000-0000-0000-000000000000', 35, 'mlq4ztgx56mo', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-14 17:07:39.06046+00', '2025-10-14 17:07:39.06046+00', NULL, '10df7781-9188-46a6-bfa1-8993afc9d4ea'),
	('00000000-0000-0000-0000-000000000000', 36, 'ycwkijkp6nzi', '4808a1be-01b6-44c1-a17a-c9f104b40854', false, '2025-10-15 06:20:52.800027+00', '2025-10-15 06:20:52.800027+00', NULL, '47cb97c7-b1fc-4a16-bd07-114f562563c6'),
	('00000000-0000-0000-0000-000000000000', 37, 'p6mhi7hmjxa4', 'da134162-0d5d-4215-b93b-aefb747ffa17', false, '2025-10-15 09:09:06.499574+00', '2025-10-15 09:09:06.499574+00', NULL, '216273be-38c4-48f0-bad7-e620e1d34daa'),
	('00000000-0000-0000-0000-000000000000', 38, 'tswzp7htsbm2', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-16 08:43:56.66158+00', '2025-10-16 08:43:56.66158+00', NULL, '80855734-1070-4e6c-a38e-e1a34d72bf09'),
	('00000000-0000-0000-0000-000000000000', 39, 'govrrqkowxnw', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-16 10:02:13.421782+00', '2025-10-16 10:02:13.421782+00', NULL, '31934895-15a6-479b-bb02-78971ff352a3'),
	('00000000-0000-0000-0000-000000000000', 40, '3lnwpqacby6r', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-16 11:49:08.658467+00', '2025-10-16 11:49:08.658467+00', NULL, '98c02215-e1b1-4c4f-a373-a796c82dc70e'),
	('00000000-0000-0000-0000-000000000000', 41, 'zydn6u3qy6lt', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-16 17:09:22.073546+00', '2025-10-16 17:09:22.073546+00', NULL, 'd72cf2ab-b7d1-4120-ab6d-90dbef213ed3'),
	('00000000-0000-0000-0000-000000000000', 42, 'y6lv5ronngg3', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-16 18:38:25.037663+00', '2025-10-16 18:38:25.037663+00', NULL, '53f2e520-2181-4f14-b47a-098f8bf33483'),
	('00000000-0000-0000-0000-000000000000', 43, 'nres22bq6hfi', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-17 10:50:01.210567+00', '2025-10-17 10:50:01.210567+00', NULL, 'a7fe09fc-ffe4-4f5f-96f8-7f90f0289559'),
	('00000000-0000-0000-0000-000000000000', 44, 'ppjpsgobwqms', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-17 11:58:46.301373+00', '2025-10-17 11:58:46.301373+00', NULL, '7db28fa7-231c-4d1f-bbf4-2349d82d2e02'),
	('00000000-0000-0000-0000-000000000000', 45, 'klx2vk5o4xzc', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-18 03:14:28.457554+00', '2025-10-18 03:14:28.457554+00', NULL, 'fbdbcc38-4529-49ce-9b4b-d522cf0e927c'),
	('00000000-0000-0000-0000-000000000000', 213, 'sc75csivu27n', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 10:59:33.843419+00', '2025-11-06 10:59:33.843419+00', NULL, '128b56a1-29fb-4b5f-9adc-0f1055d1adc5'),
	('00000000-0000-0000-0000-000000000000', 49, 'qfdhzh3dikbq', '25d8b8be-ab84-4758-91e0-427db617eeab', false, '2025-10-18 13:55:38.272205+00', '2025-10-18 13:55:38.272205+00', NULL, '41390bd6-0744-4a95-a412-4245498e65ac'),
	('00000000-0000-0000-0000-000000000000', 51, 'cgs5bawi6yiz', '25d8b8be-ab84-4758-91e0-427db617eeab', false, '2025-10-18 18:30:03.791729+00', '2025-10-18 18:30:03.791729+00', NULL, '9447e1f6-bb07-4502-88b8-651147b19dec'),
	('00000000-0000-0000-0000-000000000000', 52, 'uykj4yxqy5yu', '6016ef26-05d5-4d23-b0b1-8b6d6af73cad', false, '2025-10-18 18:35:10.555165+00', '2025-10-18 18:35:10.555165+00', NULL, 'a2e59cdd-501e-4b7c-a720-3c94051a8880'),
	('00000000-0000-0000-0000-000000000000', 53, 'amwkpzw7q5cg', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-18 18:41:58.20853+00', '2025-10-18 18:41:58.20853+00', NULL, 'a563383a-ef63-412c-bc9c-4ac486a9ef30'),
	('00000000-0000-0000-0000-000000000000', 55, 'hhdlzj6ghc6c', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-19 05:44:00.165762+00', '2025-10-19 05:44:00.165762+00', NULL, 'c04b4c80-c38e-4643-89eb-3e91f93883e9'),
	('00000000-0000-0000-0000-000000000000', 56, 'rnsyzfnpfrtz', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-19 05:51:49.130928+00', '2025-10-19 05:51:49.130928+00', NULL, '101589de-2bc6-4c0b-98ae-e3de5dd0926d'),
	('00000000-0000-0000-0000-000000000000', 57, '3lenisikmns3', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-19 09:28:14.217983+00', '2025-10-19 09:28:14.217983+00', NULL, '35ae559d-47e9-48f2-bb2a-6258eb019c1b'),
	('00000000-0000-0000-0000-000000000000', 58, 'w3ibn35u6st5', '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', false, '2025-10-20 06:46:39.523821+00', '2025-10-20 06:46:39.523821+00', NULL, '949d1b07-20c9-43d0-8c06-638ae71a1d51'),
	('00000000-0000-0000-0000-000000000000', 59, 'rzkcfkbe7gqw', '2327bda4-89df-401f-9d83-3050ee53b23e', false, '2025-10-20 07:13:26.703356+00', '2025-10-20 07:13:26.703356+00', NULL, '3a386ce0-cab3-43c3-892b-433143634d6b'),
	('00000000-0000-0000-0000-000000000000', 60, '7bcqr6yfeeqz', '2327bda4-89df-401f-9d83-3050ee53b23e', false, '2025-10-20 08:29:00.629523+00', '2025-10-20 08:29:00.629523+00', NULL, 'ff71687c-4081-4f2f-8284-1dabbf5b2d06'),
	('00000000-0000-0000-0000-000000000000', 61, 'bvi6wftsfsnm', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-20 08:40:08.545155+00', '2025-10-20 08:40:08.545155+00', NULL, 'dbb38478-3fad-43e5-8b6b-daa86ce21131'),
	('00000000-0000-0000-0000-000000000000', 62, 'vzykk6mrnab7', '685c4887-fc38-4d76-a342-ec29de3e0f85', false, '2025-10-20 11:53:00.183107+00', '2025-10-20 11:53:00.183107+00', NULL, '0e8b8150-323e-4a5e-9edc-c450bc1dfdce'),
	('00000000-0000-0000-0000-000000000000', 63, 'uxsgtyotxs6z', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 12:19:48.905514+00', '2025-10-20 12:19:48.905514+00', NULL, '7c688fdb-b4f9-416a-b1e9-27746b360101'),
	('00000000-0000-0000-0000-000000000000', 64, 'cded2btsjssp', '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', false, '2025-10-20 12:40:49.334889+00', '2025-10-20 12:40:49.334889+00', NULL, '10563898-0833-4880-a687-6fa022db873d'),
	('00000000-0000-0000-0000-000000000000', 65, '7qwe3maruvoo', '25d8b8be-ab84-4758-91e0-427db617eeab', false, '2025-10-20 12:42:37.524899+00', '2025-10-20 12:42:37.524899+00', NULL, '5e253679-fd01-4c56-9f91-4686f80b7b51'),
	('00000000-0000-0000-0000-000000000000', 194, 'l4hsqheon3ro', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-05 01:06:52.066747+00', '2025-11-05 01:06:52.066747+00', '4amk6xrbqjqs', '1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa'),
	('00000000-0000-0000-0000-000000000000', 67, 'abx3ixd327vl', 'dff67664-a554-4629-8e07-f0a6f640ee6d', false, '2025-10-20 13:27:07.25937+00', '2025-10-20 13:27:07.25937+00', NULL, '2b92a50b-e54b-4133-9618-998472e52c5e'),
	('00000000-0000-0000-0000-000000000000', 68, 'qmn66n7r5ihp', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 13:34:08.970903+00', '2025-10-20 13:34:08.970903+00', NULL, 'cdfa71b1-3a6f-42b5-9149-cd11ce3da4ab'),
	('00000000-0000-0000-0000-000000000000', 69, 'szr7e4d6y7p4', 'dff67664-a554-4629-8e07-f0a6f640ee6d', false, '2025-10-20 13:37:16.540001+00', '2025-10-20 13:37:16.540001+00', NULL, '867d62a9-d898-4883-acdd-8c3dde2a3425'),
	('00000000-0000-0000-0000-000000000000', 70, '3yis4omjhlss', 'dff67664-a554-4629-8e07-f0a6f640ee6d', false, '2025-10-20 14:11:07.112999+00', '2025-10-20 14:11:07.112999+00', NULL, 'caabed61-5f8c-4e5d-9d38-a409f4852a4a'),
	('00000000-0000-0000-0000-000000000000', 71, 'jiwvk3fbw6xc', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-20 14:13:44.564666+00', '2025-10-20 14:13:44.564666+00', NULL, '46be002a-3dba-4ec3-9573-4aa835722bb1'),
	('00000000-0000-0000-0000-000000000000', 72, 'f3zatwwpfcrd', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-20 18:50:12.176888+00', '2025-10-20 18:50:12.176888+00', NULL, '52449a9a-6700-4450-8332-350c2055d3bd'),
	('00000000-0000-0000-0000-000000000000', 73, 'qi3hhxza5dk3', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-21 04:18:32.257793+00', '2025-10-21 04:18:32.257793+00', NULL, 'd84ffa8c-be12-499f-aed2-12443dfb468d'),
	('00000000-0000-0000-0000-000000000000', 74, 'h3orlqbmrcre', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-21 04:27:44.208703+00', '2025-10-21 04:27:44.208703+00', NULL, '6719404f-e71a-41b7-a34e-080bec722e93'),
	('00000000-0000-0000-0000-000000000000', 75, 'rw5j5lk3oo4z', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-21 05:19:50.770422+00', '2025-10-21 05:19:50.770422+00', NULL, '32641d7a-46c1-477c-8c24-a443ad435cd3'),
	('00000000-0000-0000-0000-000000000000', 76, 'jxwl6ggvmbjp', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-21 05:54:31.942183+00', '2025-10-21 05:54:31.942183+00', NULL, '5e02f6a1-c101-4e5f-9bde-c612a993e2cc'),
	('00000000-0000-0000-0000-000000000000', 77, 'vvgim6lurg4a', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-21 06:19:39.913037+00', '2025-10-21 06:19:39.913037+00', NULL, 'fccc9b3b-228d-40c4-9b4e-a68e899704dd'),
	('00000000-0000-0000-0000-000000000000', 78, 'wke6whltscso', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-21 07:22:53.957948+00', '2025-10-21 07:22:53.957948+00', NULL, '472eec7d-41dc-4836-968f-e4018e447e06'),
	('00000000-0000-0000-0000-000000000000', 79, 'rebcets4hswl', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-10-21 07:26:46.092208+00', '2025-10-21 07:26:46.092208+00', NULL, '90b8097e-9f35-4874-898a-acc962ffd825'),
	('00000000-0000-0000-0000-000000000000', 80, 'tvzizv53y346', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-21 08:56:57.826011+00', '2025-10-21 08:56:57.826011+00', NULL, '0ee67cc1-4342-4541-9802-d72df2438550'),
	('00000000-0000-0000-0000-000000000000', 81, 'syb6nb56pkko', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-21 10:03:00.985944+00', '2025-10-21 10:03:00.985944+00', NULL, '614fedc7-56fa-4d58-80df-918f759c84fd'),
	('00000000-0000-0000-0000-000000000000', 82, 'tx2lpe2yx66j', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-22 06:24:50.216004+00', '2025-10-22 06:24:50.216004+00', NULL, 'f1c55ad2-a1ee-424f-83ec-603bdb2a34c2'),
	('00000000-0000-0000-0000-000000000000', 83, 'ijuxx43l272i', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', false, '2025-10-22 09:03:25.110113+00', '2025-10-22 09:03:25.110113+00', NULL, '4e981c41-5099-4136-ae39-6ff950e2411b'),
	('00000000-0000-0000-0000-000000000000', 84, 'bys733smrhxy', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-24 11:42:40.736154+00', '2025-10-24 11:42:40.736154+00', NULL, 'a3c03a18-507a-4e2c-94bb-3fa7f3011e22'),
	('00000000-0000-0000-0000-000000000000', 85, 'agefuu7k4oiw', '62d516a1-8947-4768-a45a-1362a3cc43fb', false, '2025-10-24 11:49:52.053045+00', '2025-10-24 11:49:52.053045+00', NULL, '1e99d05e-bd69-4558-8bec-d8fa0c083cad'),
	('00000000-0000-0000-0000-000000000000', 195, 'vgk6nzbjwmbd', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-05 01:07:39.715265+00', '2025-11-05 01:07:39.715265+00', NULL, '76dbff32-5cf2-4020-9d47-af425295bf14'),
	('00000000-0000-0000-0000-000000000000', 87, 'mlsifrl7jywd', 'dff67664-a554-4629-8e07-f0a6f640ee6d', false, '2025-10-24 11:55:36.228185+00', '2025-10-24 11:55:36.228185+00', NULL, '322f2367-c6ea-4dd1-8782-641a8d8385ec'),
	('00000000-0000-0000-0000-000000000000', 200, 'kwmrlohh5dhq', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 03:11:24.815787+00', '2025-11-06 03:11:24.815787+00', '65fintgc2zha', '10e8f694-c1cf-4df0-aa60-11cd09c33af0'),
	('00000000-0000-0000-0000-000000000000', 86, '6skiqk2ikr32', 'dd17c134-d5f6-4f6d-b116-73831c6f9a37', true, '2025-10-24 11:50:58.341257+00', '2025-10-24 16:42:45.593811+00', NULL, '66177f9d-5cac-43ad-825d-4f5dd86457f0'),
	('00000000-0000-0000-0000-000000000000', 89, 'c3hinxkqppul', 'dd17c134-d5f6-4f6d-b116-73831c6f9a37', false, '2025-10-24 16:42:45.609185+00', '2025-10-24 16:42:45.609185+00', '6skiqk2ikr32', '66177f9d-5cac-43ad-825d-4f5dd86457f0'),
	('00000000-0000-0000-0000-000000000000', 90, 'buun37zfq75o', 'd161a8e4-a80d-4a1c-a9ab-f23f38dc2679', false, '2025-10-24 16:43:21.9397+00', '2025-10-24 16:43:21.9397+00', NULL, 'a5ac17c1-7757-4101-86ba-c540ac65208f'),
	('00000000-0000-0000-0000-000000000000', 92, 'kq7oom5hzmda', '89822878-2382-4078-a654-c48870709bb8', true, '2025-10-31 16:14:25.980079+00', '2025-10-31 17:30:36.496689+00', NULL, 'f3e19700-7de2-449e-b103-d2eb655f3973'),
	('00000000-0000-0000-0000-000000000000', 95, 'oqbu23czutlk', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:33:55.327843+00', '2025-11-01 07:33:55.327843+00', NULL, '26c821de-6843-46fd-a620-e26a9ccaeb5f'),
	('00000000-0000-0000-0000-000000000000', 96, 'nwpq42rez3zx', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:39:44.538448+00', '2025-11-01 07:39:44.538448+00', NULL, '7a9aebf1-e74b-4949-8142-c0e6849ad7eb'),
	('00000000-0000-0000-0000-000000000000', 97, 'ujxlrvid7uls', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:40:00.920269+00', '2025-11-01 07:40:00.920269+00', NULL, '199f7ce0-f495-4fc2-9b0a-af9ba47eecc7'),
	('00000000-0000-0000-0000-000000000000', 98, 'mfothbtzqqh2', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:41:07.041219+00', '2025-11-01 07:41:07.041219+00', NULL, '561b4c9c-cdd5-4df5-b5a1-0269aeab2af0'),
	('00000000-0000-0000-0000-000000000000', 99, 'iumu7gyjfh3z', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:44:57.505148+00', '2025-11-01 07:44:57.505148+00', NULL, '8f4998e9-659a-4246-9267-4a90b7a5d73d'),
	('00000000-0000-0000-0000-000000000000', 100, 'ca6phbfisdin', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:46:59.092087+00', '2025-11-01 07:46:59.092087+00', NULL, '6c148dc2-9ff7-442c-961b-684e7c0bc874'),
	('00000000-0000-0000-0000-000000000000', 101, 'w2gpbnwrf7hg', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:49:40.523173+00', '2025-11-01 07:49:40.523173+00', NULL, 'a70179e0-4e5f-44cc-a830-10d06ac7b5ba'),
	('00000000-0000-0000-0000-000000000000', 102, 'fp7oq2j2cdpn', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:50:10.689569+00', '2025-11-01 07:50:10.689569+00', NULL, '36326774-31c0-4bfe-93de-60bbc5838f44'),
	('00000000-0000-0000-0000-000000000000', 103, 'bx7fpjg5dslq', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 07:53:15.336844+00', '2025-11-01 07:53:15.336844+00', NULL, '00558f69-0bab-4df9-80e4-c4ab4e5ff74e'),
	('00000000-0000-0000-0000-000000000000', 104, 'ou3csrhta5lh', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 12:34:46.277633+00', '2025-11-01 12:34:46.277633+00', NULL, 'c74a8f99-03cf-485b-a0b7-75e85982907b'),
	('00000000-0000-0000-0000-000000000000', 105, 'o3w7ymptm2ch', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 12:35:16.273113+00', '2025-11-01 12:35:16.273113+00', NULL, 'd448eb68-3e87-4816-b8ac-4bb87651f108'),
	('00000000-0000-0000-0000-000000000000', 106, 'ztzj2tthknms', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 12:40:37.968845+00', '2025-11-01 12:40:37.968845+00', NULL, '5b67fed1-a215-41bd-9a37-1f4b50ed0b11'),
	('00000000-0000-0000-0000-000000000000', 107, '5pg32chlkrex', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 12:51:36.390671+00', '2025-11-01 12:51:36.390671+00', NULL, 'ef35866d-8ea7-46f9-84c7-c9cfbf908528'),
	('00000000-0000-0000-0000-000000000000', 108, 'br7qzipuetsk', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 12:52:03.903377+00', '2025-11-01 12:52:03.903377+00', NULL, 'ec098e38-82c2-48f5-ab3e-2716ef34618f'),
	('00000000-0000-0000-0000-000000000000', 93, '5fuycc2jtcht', '89822878-2382-4078-a654-c48870709bb8', true, '2025-10-31 17:30:36.52478+00', '2025-11-01 13:02:16.504438+00', 'kq7oom5hzmda', 'f3e19700-7de2-449e-b103-d2eb655f3973'),
	('00000000-0000-0000-0000-000000000000', 110, 'ippghe4i2yzg', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 13:06:29.645502+00', '2025-11-01 13:06:29.645502+00', NULL, 'd758b64e-7535-4864-b486-01e7b50545c0'),
	('00000000-0000-0000-0000-000000000000', 111, '22ecp53pdlhn', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 13:07:18.920033+00', '2025-11-01 13:07:18.920033+00', NULL, '14c38a67-2bfd-453e-9684-9e29235ad7ac'),
	('00000000-0000-0000-0000-000000000000', 109, 'e6prsmhysgve', '89822878-2382-4078-a654-c48870709bb8', true, '2025-11-01 13:02:16.514526+00', '2025-11-01 17:17:48.512982+00', '5fuycc2jtcht', 'f3e19700-7de2-449e-b103-d2eb655f3973'),
	('00000000-0000-0000-0000-000000000000', 112, 'rmqxot6f747n', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 13:09:47.437608+00', '2025-11-01 13:09:47.437608+00', NULL, '5b64f237-5a3c-434e-87f1-c859b6479bb9'),
	('00000000-0000-0000-0000-000000000000', 114, 'ghffv7t27tia', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 13:34:14.837387+00', '2025-11-01 13:34:14.837387+00', NULL, '961f7c1c-89fa-4825-be2e-655322c8b305'),
	('00000000-0000-0000-0000-000000000000', 115, 'vv6w3lgulkzd', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 13:34:22.50262+00', '2025-11-01 13:34:22.50262+00', NULL, 'e1a8e039-1052-4ed1-bbca-6fa6a2ab6309'),
	('00000000-0000-0000-0000-000000000000', 116, '24elosn5eljz', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 13:52:33.351527+00', '2025-11-01 13:52:33.351527+00', NULL, 'cfbee2f3-3315-4422-a7fe-01143ce2df69'),
	('00000000-0000-0000-0000-000000000000', 117, 'a672tt4b2rfg', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 14:11:59.047661+00', '2025-11-01 14:11:59.047661+00', NULL, '270a5ce6-ad55-4f27-b4e7-69f46e340fa5'),
	('00000000-0000-0000-0000-000000000000', 118, '52aurk3iod2v', '0841a053-7266-426e-b681-1d6fab5f9974', false, '2025-11-01 14:30:04.774167+00', '2025-11-01 14:30:04.774167+00', NULL, 'e4817c4f-2627-47af-a0f0-6308ffed8bf6'),
	('00000000-0000-0000-0000-000000000000', 119, 'so2hmetnv77v', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 14:31:51.730856+00', '2025-11-01 14:31:51.730856+00', NULL, 'b370f6d1-8af2-4272-8770-7a6f75f1fade'),
	('00000000-0000-0000-0000-000000000000', 120, 'itl6tnw5zcb7', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 14:35:52.989055+00', '2025-11-01 14:35:52.989055+00', NULL, 'b77d3a4e-f98f-47ae-92d8-076e216e0088'),
	('00000000-0000-0000-0000-000000000000', 196, 'b5lzdjcu74gs', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-05 01:52:33.390211+00', '2025-11-05 05:56:36.607491+00', NULL, 'e1643ae3-f9cd-4351-bd86-19bfd9aa4aec'),
	('00000000-0000-0000-0000-000000000000', 201, 'wnhssvpi4s64', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 03:11:31.19538+00', '2025-11-06 03:11:31.19538+00', NULL, 'f518c3b2-1953-40ae-ad65-db0cd047d907'),
	('00000000-0000-0000-0000-000000000000', 205, 'knw24s4kmaf7', 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', false, '2025-11-06 08:18:44.419369+00', '2025-11-06 08:18:44.419369+00', 'vou7dckzlyyw', 'ff71840d-3171-4781-ba28-060b2ef50637'),
	('00000000-0000-0000-0000-000000000000', 208, 'h4sstfpxsok2', 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', false, '2025-11-06 09:12:49.684544+00', '2025-11-06 09:12:49.684544+00', NULL, '27e61673-9bd0-4bd6-8948-b485e96c58e3'),
	('00000000-0000-0000-0000-000000000000', 125, '6aftszmoyvyg', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 15:20:04.354934+00', '2025-11-01 15:20:04.354934+00', NULL, 'd6026fd4-ddee-4613-8964-548ca38c3a01'),
	('00000000-0000-0000-0000-000000000000', 211, '625qdv2grfzt', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 10:41:18.034314+00', '2025-11-06 10:41:18.034314+00', NULL, '9ad01a6a-9480-4ee8-85bf-84e3b5926d3e'),
	('00000000-0000-0000-0000-000000000000', 113, 'iyrxrdc2hjte', '89822878-2382-4078-a654-c48870709bb8', true, '2025-11-01 13:10:11.798096+00', '2025-11-01 16:17:30.528579+00', NULL, '7b79505c-25e9-4de0-a86e-c297f1d602d2'),
	('00000000-0000-0000-0000-000000000000', 127, 'atteoj6q4ssz', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 16:17:30.538462+00', '2025-11-01 16:17:30.538462+00', 'iyrxrdc2hjte', '7b79505c-25e9-4de0-a86e-c297f1d602d2'),
	('00000000-0000-0000-0000-000000000000', 128, 'ecjrzgglz7o7', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 16:18:05.691312+00', '2025-11-01 16:18:05.691312+00', NULL, 'c224231b-692f-4259-9bb5-63bbcfcfc8ea'),
	('00000000-0000-0000-0000-000000000000', 129, 'kgw3lw5lk67z', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 16:49:58.292217+00', '2025-11-01 16:49:58.292217+00', NULL, 'd1947753-7081-4025-a204-60f58976b2c3'),
	('00000000-0000-0000-0000-000000000000', 130, 'cllyk4k3egla', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 16:51:12.25836+00', '2025-11-01 16:51:12.25836+00', NULL, '582e899c-10e0-4d3f-adad-b077ad0b65ad'),
	('00000000-0000-0000-0000-000000000000', 132, '6nfgwy5v55sz', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 16:58:11.474084+00', '2025-11-01 16:58:11.474084+00', NULL, 'f87b868a-82d0-443b-9962-d125f8b0314b'),
	('00000000-0000-0000-0000-000000000000', 134, 'z2vvsbhxy3rb', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 17:06:11.636253+00', '2025-11-01 17:06:11.636253+00', NULL, '70dadc7e-97ad-4fc8-90f8-12f6000b2c64'),
	('00000000-0000-0000-0000-000000000000', 136, 'jml2ipnwl6op', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 17:10:40.533969+00', '2025-11-01 17:10:40.533969+00', NULL, '29819a05-e4ae-412f-836c-17ce7651f980'),
	('00000000-0000-0000-0000-000000000000', 137, 'irzn6r3gzhh6', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 17:11:11.140025+00', '2025-11-01 17:11:11.140025+00', NULL, 'be718026-8c0e-4dff-9afb-7605a401983f'),
	('00000000-0000-0000-0000-000000000000', 139, 'epiil5cf3aqq', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 17:17:48.517325+00', '2025-11-01 17:17:48.517325+00', 'e6prsmhysgve', 'f3e19700-7de2-449e-b103-d2eb655f3973'),
	('00000000-0000-0000-0000-000000000000', 142, 'j27pamcx6lcu', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 17:24:04.992064+00', '2025-11-01 17:24:04.992064+00', NULL, '18a73808-18d9-4c8d-b1c4-f417f319fad1'),
	('00000000-0000-0000-0000-000000000000', 146, 'remkzceu5nmz', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 18:21:16.547277+00', '2025-11-01 18:21:16.547277+00', NULL, '5b4621cf-0f96-4b81-8518-f53766e91a81'),
	('00000000-0000-0000-0000-000000000000', 147, 'jpql45zjzxs2', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 18:27:07.740347+00', '2025-11-01 18:27:07.740347+00', NULL, '8b50e5b2-6fc8-4fc7-8db2-ac86acbab970'),
	('00000000-0000-0000-0000-000000000000', 150, 'n2ychlet7abk', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 18:30:47.178722+00', '2025-11-01 18:30:47.178722+00', NULL, 'cfc1439f-bed2-4518-b5ae-ed3335f37bec'),
	('00000000-0000-0000-0000-000000000000', 151, 'muspmb2qspuv', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 18:32:05.287889+00', '2025-11-01 18:32:05.287889+00', NULL, '8f3e52f2-cbbf-4bd2-881d-f85c690466ee'),
	('00000000-0000-0000-0000-000000000000', 152, 'ulsd243dlwow', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 18:34:10.550451+00', '2025-11-01 18:34:10.550451+00', NULL, '91d6e126-618e-44cb-8ebb-7ceaea51bfb0'),
	('00000000-0000-0000-0000-000000000000', 153, 'lnuuux3bjzdk', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 18:36:02.471492+00', '2025-11-01 18:36:02.471492+00', NULL, 'b99e4914-a771-497f-825b-2e87da73ba18'),
	('00000000-0000-0000-0000-000000000000', 157, 'ljjfkf7md7hr', '89822878-2382-4078-a654-c48870709bb8', false, '2025-11-01 18:56:22.128697+00', '2025-11-01 18:56:22.128697+00', NULL, '99857fe4-6c66-4830-b2eb-b10b068edd92'),
	('00000000-0000-0000-0000-000000000000', 158, 'jdw5zco5gljv', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 18:58:11.045248+00', '2025-11-01 18:58:11.045248+00', NULL, '82f5c362-db7c-4042-ae77-1bec1e558f84'),
	('00000000-0000-0000-0000-000000000000', 160, 'cllqj5xuz33v', '9626b997-1939-4697-a57e-10034bf9a276', false, '2025-11-01 19:01:41.121525+00', '2025-11-01 19:01:41.121525+00', NULL, '6ee3f2ec-7661-4131-8822-ab56294bd9e8'),
	('00000000-0000-0000-0000-000000000000', 189, '4amk6xrbqjqs', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-02 17:24:52.42024+00', '2025-11-05 01:06:52.05445+00', 'cekcfn4agd6a', '1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa'),
	('00000000-0000-0000-0000-000000000000', 197, 'sji7sugyj42q', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-05 05:56:36.618266+00', '2025-11-05 05:56:36.618266+00', 'b5lzdjcu74gs', 'e1643ae3-f9cd-4351-bd86-19bfd9aa4aec'),
	('00000000-0000-0000-0000-000000000000', 198, '7w4kobxacwnp', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-05 05:57:16.343272+00', '2025-11-05 14:11:27.19268+00', NULL, '10e8f694-c1cf-4df0-aa60-11cd09c33af0'),
	('00000000-0000-0000-0000-000000000000', 202, 'brvr43orfmth', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 03:17:11.91857+00', '2025-11-06 03:17:11.91857+00', NULL, '60eee84a-b37e-476e-a9a8-e751f3501760'),
	('00000000-0000-0000-0000-000000000000', 192, 'vou7dckzlyyw', 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', true, '2025-11-03 19:14:40.79808+00', '2025-11-06 08:18:44.392806+00', 'xhk2sxyedxcw', 'ff71840d-3171-4781-ba28-060b2ef50637'),
	('00000000-0000-0000-0000-000000000000', 206, 'dfglgf7xtfku', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 08:21:04.976343+00', '2025-11-06 08:21:04.976343+00', NULL, '625519c8-0cf4-46cf-a3d2-fc48865fd329'),
	('00000000-0000-0000-0000-000000000000', 209, '7op6ds5z6who', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-06 09:36:21.202008+00', '2025-11-06 09:36:21.202008+00', NULL, 'aedbcc9b-7352-4671-ae7f-f139832ebd33'),
	('00000000-0000-0000-0000-000000000000', 212, 'oyxz46a6rg66', '1ef75d00-3349-4274-8bc8-da135015ab5d', false, '2025-11-06 10:43:57.240009+00', '2025-11-06 10:43:57.240009+00', NULL, 'af04f2fa-7ee3-4beb-be07-1ca929a61750'),
	('00000000-0000-0000-0000-000000000000', 184, 'k37q76gnzqkb', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-02 08:27:10.025816+00', '2025-11-02 08:27:10.025816+00', NULL, '314af7b9-c16f-46e4-9b0b-7a6cfebe9f6d'),
	('00000000-0000-0000-0000-000000000000', 185, 'bjjd7knwop3b', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-02 08:27:16.490181+00', '2025-11-02 13:42:51.046983+00', NULL, '1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa'),
	('00000000-0000-0000-0000-000000000000', 187, 'mzjvbnjbhvta', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-02 13:45:21.307364+00', '2025-11-02 13:45:21.307364+00', NULL, '80db73b4-f2b2-4e54-8b2e-a3d9ced2d8f0'),
	('00000000-0000-0000-0000-000000000000', 186, 'yb7hec67abws', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-02 13:42:51.07222+00', '2025-11-02 14:57:27.658825+00', 'bjjd7knwop3b', '1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa'),
	('00000000-0000-0000-0000-000000000000', 188, 'cekcfn4agd6a', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-02 14:57:27.670486+00', '2025-11-02 17:24:52.395407+00', 'yb7hec67abws', '1efd5899-b70d-4e37-a1e6-33d6a7f7ffaa'),
	('00000000-0000-0000-0000-000000000000', 190, 'wbubevyjtyqi', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-11-03 18:13:27.491948+00', '2025-11-03 18:13:27.491948+00', NULL, '2ac10c0e-d5be-4303-b768-85a7277fef35'),
	('00000000-0000-0000-0000-000000000000', 191, 'xhk2sxyedxcw', 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', true, '2025-11-03 18:15:44.830709+00', '2025-11-03 19:14:40.783908+00', NULL, 'ff71840d-3171-4781-ba28-060b2ef50637');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."schools" ("school_id", "name", "logo_url", "address", "city", "state", "postal_code", "country", "phone_number", "email", "website", "configuration", "is_active", "created_at", "updated_at", "razorpay_key_secret_encrypted", "razorpay_webhook_secret_encrypted", "razorpay_key_id_encrypted") VALUES
	(2, 'Springfield International School', 'https://example.com/logos/springfield.png', '123 Education Boulevard', 'Springfield', 'Maharashtra', '400001', 'India', '+91-22-12345678', 'info@springfield.edu.in', 'https://springfield.edu.in', NULL, true, '2025-10-11 06:43:33.330115+00', '2025-10-11 06:43:33.330115+00', '\x674141414141426f397a556164553257524645436a5f78596b7335356569317976465a6970415471376d42623868474273495f68743662524d364369444e374d494d794263653739454e4650575436767a6b416846625466765f3137326e714e3975324b6342613966515434755968304c71477a545f383d', '\x674141414141426f397a556170753578684b63455657554b2d6e5533366965724d36677a50325156574a464e7739747251376931592d545f2d68357a754e514265476f456e6833696f35555168734763745f546a76337044555f72504d4d3557346d2d73323231777032555567704f5941325637526c383d', '\x674141414141426f397a5561484c494739694452676f39414b4866386844684966425253623742674a3679774b556b74576f385f43585654557655746567775078654b35426c43584d39593866727532345f45374258335f73474869366a3879773478566c733473476a433551734e51767475593161383d'),
	(0, 'Unassigned School', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-03 08:34:28.685671+00', '2025-10-03 08:34:28.685671+00', NULL, NULL, NULL),
	(1, 'Tapasya Vidya Peetha', 'https://example.com/logos/tapasyavp.png', '123, 4th Main Road, Jayanagar', 'Bangalore', 'Karnataka', '560041', 'India', '+91 9999988888', 'contact@tapasyavp.edu.in', 'https://www.new-tapasyavp.edu.in/', '{"about": "Tapasya Vidya Peetha, established in 1995, is a premier educational institution in Bangalore, committed to fostering academic excellence and holistic development.", "principal_name": "Priya Sharma", "mission_statement": "To empower students with knowledge, skills, and values to thrive in a dynamic world."}', true, '2025-09-22 18:14:15.367346+00', '2025-09-22 18:14:15.367346+00', NULL, NULL, NULL);


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."academic_years" ("id", "school_id", "name", "start_date", "end_date", "is_active", "meta_data", "created_at") VALUES
	(1437, 0, 'Hacked by School 1', '2025-01-01', '2025-12-31', false, NULL, '2025-10-08 05:56:22+00'),
	(3, 1, '2026-2027', '2026-06-01', '2027-03-31', false, NULL, '2025-09-22 18:22:35.270349+00'),
	(2, 1, '2025-2026', '2025-06-01', '2026-03-31', false, NULL, '2025-09-22 18:22:35.270349+00'),
	(1, 1, '2024-2025', '2024-06-01', '2025-03-31', false, NULL, '2025-09-22 18:22:35.270349+00'),
	(1327, 1, 'Academic Year 2025-2026 E2E Test', '2025-06-01', '2026-03-31', true, NULL, '2025-10-07 09:27:50.433975+00'),
	(1873, 2, '2024-2025', '2024-04-01', '2025-03-31', true, NULL, '2025-10-11 07:13:43.952011+00'),
	(1874, 2, '2025-2026', '2025-04-01', '2026-03-31', false, NULL, '2025-10-11 07:13:43.952011+00'),
	(1875, 2, '2023-2024', '2023-04-01', '2024-03-31', false, NULL, '2025-10-11 07:13:43.952011+00');


--
-- Data for Name: achievement_point_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."achievement_point_rules" ("id", "school_id", "achievement_type", "category_name", "base_points", "level_multiplier", "is_active", "created_at") VALUES
	(1, 1, 'academic', 'Subject Topper', 50, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(2, 1, 'academic', 'Perfect Attendance', 30, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(3, 1, 'academic', 'Academic Excellence', 100, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(4, 1, 'academic', 'Olympiad Winner', 75, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(5, 1, 'sports', 'Athletics Gold Medal', 60, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(6, 1, 'sports', 'Athletics Silver Medal', 40, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(7, 1, 'sports', 'Athletics Bronze Medal', 25, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(8, 1, 'sports', 'Team Sports Winner', 50, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(9, 1, 'cultural', 'Dance Competition', 50, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(10, 1, 'cultural', 'Music Competition', 50, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(11, 1, 'cultural', 'Drama/Theatre', 60, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(12, 1, 'cultural', 'Art Exhibition', 40, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(13, 1, 'leadership', 'Student Council Member', 80, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(14, 1, 'leadership', 'Class Monitor', 40, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(15, 1, 'leadership', 'Debate Champion', 55, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(16, 1, 'community_service', 'Environmental Initiative', 45, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(17, 1, 'community_service', 'Social Welfare Project', 50, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00'),
	(18, 1, 'community_service', 'Volunteer Hours (100+)', 60, '{"state": 2.0, "school": 1.0, "district": 1.5, "national": 3.0, "international": 5.0}', true, '2025-11-03 12:03:49.245478+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("user_id", "school_id", "first_name", "last_name", "phone_number", "gender", "date_of_birth", "profile_picture_url", "is_active", "created_at", "updated_at", "aadhaar_last4", "aadhaar_encrypted") VALUES
	('bd431bf6-6e9f-4642-84e9-f2284f92e164', 1, 'Priya', 'Sharma', '9748940106', 'Female', '1985-05-20', NULL, true, '2025-09-22 18:20:34.953557+00', '2025-09-22 18:20:34.953557+00', NULL, NULL),
	('4808a1be-01b6-44c1-a17a-c9f104b40854', 1, 'Amit', 'Patel', '9164310166', 'Male', '1988-11-15', NULL, true, '2025-09-22 18:20:35.515774+00', '2025-09-22 18:20:35.515774+00', NULL, NULL),
	('da134162-0d5d-4215-b93b-aefb747ffa17', 1, 'Sunita', 'Gupta', '9325369069', 'Female', '1990-02-10', NULL, true, '2025-09-22 18:20:35.836745+00', '2025-09-22 18:20:35.836745+00', NULL, NULL),
	('dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 1, 'Rajesh', 'Kumar', '9353458366', 'Male', '1989-08-30', NULL, true, '2025-09-22 18:20:36.102312+00', '2025-09-22 18:20:36.102312+00', NULL, NULL),
	('b393e32d-fb28-4de5-9713-eeebad9d2c06', 1, 'Anjali', 'Verma', '9262965695', 'Female', '1992-07-22', NULL, true, '2025-09-22 18:20:36.375016+00', '2025-09-22 18:20:36.375016+00', NULL, NULL),
	('70cee473-d0a2-4484-8a84-e0a5cd4e584c', 1, 'Sanjay', 'Mishra', '9690521119', 'Male', '1984-01-05', NULL, true, '2025-09-22 18:20:36.634117+00', '2025-09-22 18:20:36.634117+00', NULL, NULL),
	('97f8b48a-4302-4f0e-baf8-4a85f8da0cca', 1, 'Meena', 'Singh', '9580646887', 'Female', '1986-09-18', NULL, true, '2025-09-22 18:20:36.89206+00', '2025-09-22 18:20:36.89206+00', NULL, NULL),
	('ce4ef0c4-c548-49ac-a71f-49655c7482d4', 1, 'Vikram', 'Rao', '9655312833', 'Male', '1993-04-12', NULL, true, '2025-09-22 18:20:37.1637+00', '2025-09-22 18:20:37.1637+00', NULL, NULL),
	('8585907d-5de4-4f6d-ae9a-28b26b0e86a0', 1, 'Kavita', 'Nair', '9313064476', 'Female', '1991-03-25', NULL, true, '2025-09-22 18:20:37.418305+00', '2025-09-22 18:20:37.418305+00', NULL, NULL),
	('ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', 1, 'Arun', 'Iyer', '9728587981', 'Male', '1982-12-01', NULL, true, '2025-09-22 18:20:37.684809+00', '2025-09-22 18:20:37.684809+00', NULL, NULL),
	('48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', 1, 'Diya', 'Patel', '9807456618', 'Female', '2015-08-22', NULL, true, '2025-09-22 18:20:38.223403+00', '2025-09-22 18:20:38.223403+00', NULL, NULL),
	('45c6ac9c-9306-40f1-a23d-fbfea313c794', 1, 'Rohan', 'Kumar', '9272164076', 'Male', '2016-01-15', NULL, true, '2025-09-22 18:20:38.481525+00', '2025-09-22 18:20:38.481525+00', NULL, NULL),
	('cb0cf1e2-19d0-4ae3-93ed-3073a47a5058', 1, 'Priya', 'Singh', '9927540900', 'Female', '2016-03-30', NULL, true, '2025-09-22 18:20:38.731113+00', '2025-09-22 18:20:38.731113+00', NULL, NULL),
	('9caad150-de2c-478a-87b6-a712e412947f', 1, 'Aditya', 'Verma', '9593936150', 'Male', '2017-05-05', NULL, true, '2025-09-22 18:20:38.988751+00', '2025-09-22 18:20:38.988751+00', NULL, NULL),
	('3b3f1289-d861-45e2-b4e4-f18d72ca5036', 1, 'Ananya', 'Gupta', '9424980771', 'Female', '2017-07-12', NULL, true, '2025-09-22 18:20:39.276917+00', '2025-09-22 18:20:39.276917+00', NULL, NULL),
	('604f3f2f-0741-4ec8-9667-d3f0ecdc76be', 1, 'Vihaan', 'Reddy', '9675709024', 'Male', '2018-02-25', NULL, true, '2025-09-22 18:20:39.5353+00', '2025-09-22 18:20:39.5353+00', NULL, NULL),
	('226cb810-8e16-4a3d-a879-2c1b325edbeb', 1, 'Ishita', 'Nair', '9707725382', 'Female', '2018-04-18', NULL, true, '2025-09-22 18:20:39.793014+00', '2025-09-22 18:20:39.793014+00', NULL, NULL),
	('d77de604-114c-4c71-8b8c-5616db827da7', 1, 'Arjun', 'Menon', '9377428607', 'Male', '2019-09-03', NULL, true, '2025-09-22 18:20:40.053374+00', '2025-09-22 18:20:40.053374+00', NULL, NULL),
	('12fcf33f-7c54-4466-a44c-ad7602b2c2bc', 1, 'Saanvi', 'Joshi', '9914569628', 'Female', '2019-11-20', NULL, true, '2025-09-22 18:20:40.320005+00', '2025-09-22 18:20:40.320005+00', NULL, NULL),
	('d8fab006-304c-43bc-a8db-597fdf947c9e', 1, 'Kabir', 'Shah', '9621819788', 'Male', '2015-04-01', NULL, true, '2025-09-22 18:20:40.588676+00', '2025-09-22 18:20:40.588676+00', NULL, NULL),
	('6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4', 1, 'Myra', 'Mishra', '9685937748', 'Female', '2015-10-09', NULL, true, '2025-09-22 18:20:40.858581+00', '2025-09-22 18:20:40.858581+00', NULL, NULL),
	('706c538d-4134-4cc1-be7e-fb11fa771bfb', 1, 'Vivaan', 'Rao', '9440494564', 'Male', '2016-02-14', NULL, true, '2025-09-22 18:20:41.122818+00', '2025-09-22 18:20:41.122818+00', NULL, NULL),
	('25d8b8be-ab84-4758-91e0-427db617eeab', 1, 'Zara', 'Khan', '9392071408', 'Female', '2016-06-21', NULL, true, '2025-09-22 18:20:41.379571+00', '2025-09-22 18:20:41.379571+00', NULL, NULL),
	('f46c80a9-0e4f-4308-b266-8ddc28ff2228', 1, 'Aryan', 'Iyer', '9350244938', 'Male', '2017-08-19', NULL, true, '2025-09-22 18:20:41.641786+00', '2025-09-22 18:20:41.641786+00', NULL, NULL),
	('b4e9499b-5580-488e-8163-e4706459dfb8', 1, 'Avni', 'Pillai', '9661964771', 'Female', '2017-12-02', NULL, true, '2025-09-22 18:20:41.89872+00', '2025-09-22 18:20:41.89872+00', NULL, NULL),
	('dff67664-a554-4629-8e07-f0a6f640ee6d', 1, 'Reyansh', 'Shetty', '9398724051', 'Male', '2018-07-07', NULL, true, '2025-09-22 18:20:42.152185+00', '2025-09-22 18:20:42.152185+00', NULL, NULL),
	('4d68700c-6741-4abf-a51e-718a58b75500', 1, 'Anika', 'Agarwal', '9182827568', 'Female', '2018-09-28', NULL, true, '2025-09-22 18:20:42.402777+00', '2025-09-22 18:20:42.402777+00', NULL, NULL),
	('6bbe0fc4-7caa-4705-a87d-2114dd189669', 1, 'Krishna', 'Murthy', '9531416041', 'Male', '2019-01-31', NULL, true, '2025-09-22 18:20:42.657981+00', '2025-09-22 18:20:42.657981+00', NULL, NULL),
	('b195fe70-8761-4c73-a7db-5c95f68ca89b', 1, 'Aadhya', 'Das', '9224005476', 'Female', '2019-10-16', NULL, true, '2025-09-22 18:20:42.92356+00', '2025-09-22 18:20:42.92356+00', NULL, NULL),
	('bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 1, 'Rina', 'Sharma', '9125368670', 'Female', '1982-03-22', NULL, true, '2025-09-22 18:20:43.423524+00', '2025-09-22 18:20:43.423524+00', NULL, NULL),
	('e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', 1, 'Pooja', 'Patel', '9221551833', 'Female', '1983-09-11', NULL, true, '2025-09-22 18:20:43.845748+00', '2025-09-22 18:20:43.845748+00', NULL, NULL),
	('437bdd8c-d32c-42f2-911a-cd0b6768fa9d', 1, 'Manoj', 'Kumar', '9843232774', 'Male', '1983-02-01', NULL, true, '2025-09-22 18:20:44.107206+00', '2025-09-22 18:20:44.107206+00', NULL, NULL),
	('2a2a83fa-2910-4fb5-8e23-23a3c3b667a3', 1, 'Geeta', 'Singh', '9566724662', 'Female', '1985-04-19', NULL, true, '2025-09-22 18:20:44.397851+00', '2025-09-22 18:20:44.397851+00', NULL, NULL),
	('6016ef26-05d5-4d23-b0b1-8b6d6af73cad', 1, 'Nitin', 'Verma', '9257550707', 'Male', '1984-11-25', NULL, true, '2025-09-22 18:20:44.678867+00', '2025-09-22 18:20:44.678867+00', NULL, NULL),
	('c238591e-69ed-424f-b633-8fe0f68f81be', 1, 'Deepika', 'Verma', '9811583489', 'Female', '1986-01-30', NULL, true, '2025-09-22 18:20:44.882234+00', '2025-09-22 18:20:44.882234+00', NULL, NULL),
	('fbd44ebd-1994-4c93-8359-8dbdea32a1e9', 1, 'Alok', 'Gupta', '9234394750', 'Male', '1986-06-12', NULL, true, '2025-09-22 18:20:45.446678+00', '2025-09-22 18:20:45.446678+00', NULL, NULL),
	('99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4', 1, 'Vikram', 'Reddy', '9385527829', 'Male', '1985-08-09', NULL, true, '2025-09-22 18:20:45.736282+00', '2025-09-22 18:20:45.736282+00', NULL, NULL),
	('2327bda4-89df-401f-9d83-3050ee53b23e', 1, 'Lakshmi', 'Reddy', '9192724828', 'Female', '1987-10-23', NULL, true, '2025-09-22 18:20:45.939758+00', '2025-09-22 18:20:45.939758+00', NULL, NULL),
	('3f720771-43ec-4bb3-9ebf-02ac19d8960c', 1, 'Rajesh', 'Nair', '9350309603', 'Male', '1987-04-07', NULL, true, '2025-09-22 18:20:46.204699+00', '2025-09-22 18:20:46.204699+00', NULL, NULL),
	('eb064229-c344-4350-b01b-3e8d09be68b3', 1, 'Anjali', 'Menon', '9985993729', 'Female', '1989-05-29', NULL, true, '2025-09-22 18:20:46.40679+00', '2025-09-22 18:20:46.40679+00', NULL, NULL),
	('de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac', 1, 'Anil', 'Joshi', '9426386794', 'Male', '1988-12-18', NULL, true, '2025-09-22 18:20:46.611783+00', '2025-09-22 18:20:46.611783+00', NULL, NULL),
	('d0aba71f-57b7-46bd-8d6d-a76c66987810', 1, 'Kavya', 'Joshi', '9566931094', 'Female', '1990-02-28', NULL, true, '2025-09-22 18:20:46.808705+00', '2025-09-22 18:20:46.808705+00', NULL, NULL),
	('24ec3525-99b3-4269-8fe9-2bdd4698bfda', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 06:44:57.207407+00', '2025-10-07 06:44:57.207407+00', NULL, NULL),
	('70b549df-b616-4be5-b2c1-1d51af813207', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 06:45:50.138909+00', '2025-10-07 06:45:50.138909+00', NULL, NULL),
	('18ad651a-fce9-44aa-9d8c-1c4942b752af', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-06 15:23:02.067338+00', '2025-10-06 15:23:02.067338+00', NULL, NULL),
	('509ab322-fb8f-4cbb-b778-b881d3ca0e11', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 06:53:00.508159+00', '2025-10-07 06:53:00.508159+00', NULL, NULL),
	('4770004f-39b3-4983-9004-80d23b1b6029', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-10 09:03:06.689816+00', '2025-10-10 09:03:06.689816+00', NULL, NULL),
	('05a88040-b0e2-481c-a9a3-f4b5e169dedd', 1, 'Rohan', 'Verma', NULL, 'Male', '2010-05-20', NULL, true, '2025-10-05 18:51:50.984654+00', '2025-10-05 18:51:50.984654+00', NULL, NULL),
	('a36b35d2-021c-42a9-b8e7-d13465b82281', 1, 'Rohan', 'Verma', NULL, 'Male', '2010-05-20', NULL, true, '2025-10-05 18:51:52.521008+00', '2025-10-05 18:51:52.521008+00', NULL, NULL),
	('89822878-2382-4078-a654-c48870709bb8', 0, 'Abhishek', 'L', NULL, NULL, NULL, NULL, true, '2025-10-31 16:14:25.928512+00', '2025-10-31 16:14:25.928512+00', NULL, NULL),
	('8e7d4e76-d195-4a53-a1eb-89f7b2cf1420', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-05 19:13:46.817966+00', '2025-10-05 19:13:46.817966+00', NULL, NULL),
	('a6ce33ac-9988-44a2-9905-d2c11066b511', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-05 19:13:48.684559+00', '2025-10-05 19:13:48.684559+00', NULL, NULL),
	('9be00d6e-f4fd-4095-8a42-339eae5b751d', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-06 08:58:24.35949+00', '2025-10-06 08:58:24.35949+00', NULL, NULL),
	('9afe1c7f-2102-4d5f-aa96-447fbc1b3392', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-06 15:31:48.647091+00', '2025-10-06 15:31:48.647091+00', NULL, NULL),
	('0841a053-7266-426e-b681-1d6fab5f9974', 2, 'Suresh', 'Sharma', '9245686803', 'Male', '1980-05-14', NULL, true, '2025-09-22 18:20:43.192796+00', '2025-09-22 18:20:43.192796+00', NULL, NULL),
	('1ef75d00-3349-4274-8bc8-da135015ab5d', 2, 'Hitesh', 'Patel', '9168443745', 'Male', '1981-07-03', NULL, true, '2025-09-22 18:20:43.63998+00', '2025-09-22 18:20:43.63998+00', NULL, NULL),
	('63bed14f-2514-45a2-a718-04c1d0a0b7f0', 1, 'Aarav', 'Sharma', '9509754835', 'Male', '2015-06-10', NULL, true, '2025-09-22 18:20:37.96027+00', '2025-09-22 18:20:37.96027+00', NULL, NULL),
	('4a39dc4b-5f95-45b0-9b4f-67b253943233', 1, 'mishra', 'sharma', '1919191919', NULL, NULL, NULL, true, '2025-11-01 19:25:03.495733+00', '2025-11-01 19:25:03.495733+00', NULL, NULL),
	('dd17c134-d5f6-4f6d-b116-73831c6f9a37', 0, 'Abhishek', 'L', NULL, NULL, NULL, NULL, true, '2025-10-24 11:50:58.31814+00', '2025-10-24 11:50:58.31814+00', NULL, NULL),
	('86ee5391-69dd-48db-9673-edc6aa5a61bd', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:19:26.376651+00', '2025-10-07 07:19:26.376651+00', NULL, NULL),
	('3a834f54-5135-4dab-8fe5-fa4ef16dd792', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:24:46.097609+00', '2025-10-07 07:24:46.097609+00', NULL, NULL),
	('8e1c55bf-3a17-4ea9-bf99-77d7a459feb1', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:36:23.287068+00', '2025-10-07 07:36:23.287068+00', NULL, NULL),
	('7a221af0-dce5-40f9-8d64-966900fde79d', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-11 10:37:30.47125+00', '2025-10-11 10:37:30.47125+00', NULL, NULL),
	('3e163ee6-cd91-4d63-8bc1-189cc0d13860', 2, 'Admin', 'Springfield', '+91-9876543210', NULL, NULL, NULL, true, '2025-10-08 15:10:12.064348+00', '2025-10-08 15:10:12.064348+00', NULL, NULL),
	('7d67227c-8e03-491c-805f-609726eed87d', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 06:49:11.647717+00', '2025-10-07 06:49:11.647717+00', NULL, NULL),
	('09351a3e-1149-465e-8e5d-dce65f769985', 1, 'Rohan', 'Verma', NULL, 'Male', '2010-05-20', NULL, true, '2025-10-05 18:55:06.45339+00', '2025-10-05 18:55:06.45339+00', NULL, NULL),
	('5549f19f-68c7-4de1-96c9-3a9626675850', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-06 08:49:34.077714+00', '2025-10-06 08:49:34.077714+00', NULL, NULL),
	('2c0d82ea-c145-4fa9-82eb-9e5f7556b416', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-06 09:01:04.216213+00', '2025-10-06 09:01:04.216213+00', NULL, NULL),
	('5f6f441a-ae4c-413c-9539-19e0e2ff9a66', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:00:14.040011+00', '2025-10-07 07:00:14.040011+00', NULL, NULL),
	('73dc447f-7fc6-4e19-bac9-b3ba62b86e0a', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:03:40.98862+00', '2025-10-07 07:03:40.98862+00', NULL, NULL),
	('6ed6b164-9b11-49b3-a9ef-8241681fce37', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:15:25.006191+00', '2025-10-07 07:15:25.006191+00', NULL, NULL),
	('bba67f0f-0c9f-4899-9302-63ae117577f7', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-06 15:29:21.450971+00', '2025-10-06 15:29:21.450971+00', NULL, NULL),
	('59b9e466-f181-4383-97a4-749e45777a84', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:22:33.605389+00', '2025-10-07 07:22:33.605389+00', NULL, NULL),
	('4c7bdf24-d6b1-42ea-9ced-638773d08527', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:30:41.189496+00', '2025-10-07 07:30:41.189496+00', NULL, NULL),
	('e1fb9cce-230b-48cc-b2de-6e30ccd74139', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:39:12.272154+00', '2025-10-07 07:39:12.272154+00', NULL, NULL),
	('5d9e1c9f-980c-47b1-bd87-2b54c6810c86', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:50:19.454605+00', '2025-10-07 07:50:19.454605+00', NULL, NULL),
	('aebd8219-5fd4-4ede-86c0-344c0e6cd257', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 07:54:49.700093+00', '2025-10-07 07:54:49.700093+00', NULL, NULL),
	('685c4887-fc38-4d76-a342-ec29de3e0f85', 0, 'Suresh', 'Kumar', '9876543210', 'M', '1990-05-10', NULL, true, '2025-10-03 10:23:23.391117+00', '2025-10-03 10:23:23.391117+00', NULL, NULL),
	('432c3e91-01ff-4ff4-ba70-d2582fa44ed2', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-10 09:08:28.908719+00', '2025-10-10 09:08:28.908719+00', NULL, NULL),
	('558b7c95-a041-4f11-acf8-3ade6aecbba5', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-10 09:53:45.29002+00', '2025-10-10 09:53:45.29002+00', NULL, NULL),
	('a646d383-77db-42af-936d-f5587be4d961', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 06:35:12.200111+00', '2025-10-07 06:35:12.200111+00', NULL, NULL),
	('eafae832-a41c-426f-a182-f8f6b1f87e97', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-07 06:41:33.880585+00', '2025-10-07 06:41:33.880585+00', NULL, NULL),
	('00000000-0000-0000-0000-000000000010', 101, 'Admin', NULL, NULL, NULL, NULL, NULL, true, '2025-09-27 04:32:23.267435+00', '2025-09-27 04:32:23.267435+00', NULL, NULL),
	('00000000-0000-0000-0000-000000000011', 101, 'Mr. Anderson', NULL, NULL, NULL, NULL, NULL, true, '2025-09-27 04:32:23.267435+00', '2025-09-27 04:32:23.267435+00', NULL, NULL),
	('00000000-0000-0000-0000-000000000012', 101, 'Mrs. Davis', NULL, NULL, NULL, NULL, NULL, true, '2025-09-27 04:32:23.267435+00', '2025-09-27 04:32:23.267435+00', NULL, NULL),
	('00000000-0000-0000-0000-000000000013', 101, 'Emily Davis', NULL, NULL, NULL, NULL, NULL, true, '2025-09-27 04:32:23.267435+00', '2025-09-27 04:32:23.267435+00', NULL, NULL),
	('00000000-0000-0000-0000-000000000014', 101, 'John Smith', NULL, NULL, NULL, NULL, NULL, true, '2025-09-27 04:32:23.267435+00', '2025-09-27 04:32:23.267435+00', NULL, NULL),
	('9626b997-1939-4697-a57e-10034bf9a276', 0, 'VIGNESH', 'B S', NULL, NULL, NULL, NULL, true, '2025-11-01 07:32:28.461469+00', '2025-11-01 07:32:28.461469+00', NULL, NULL),
	('ca967e27-a291-4796-8159-ecc8854871ae', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-12 13:50:26.142017+00', '2025-10-12 13:50:26.142017+00', NULL, NULL),
	('ee0daccb-0f05-4acb-b13e-13491af2ae0d', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-12 13:52:25.901953+00', '2025-10-12 13:52:25.901953+00', NULL, NULL),
	('94782a1f-7739-4d83-ab9b-d6933f78ec59', 0, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-19 05:43:17.847981+00', '2025-10-19 05:43:17.847981+00', NULL, NULL),
	('cd307408-9c83-475e-a874-be26288d534c', 1, 'ashhar', 'W', '9019191919', NULL, NULL, NULL, true, '2025-11-01 19:58:11.879197+00', '2025-11-01 19:58:11.879197+00', NULL, NULL),
	('62d516a1-8947-4768-a45a-1362a3cc43fb', 0, 'Abhishek', 'L', NULL, NULL, NULL, NULL, true, '2025-10-24 11:49:23.745119+00', '2025-10-24 11:49:23.745119+00', NULL, NULL),
	('d161a8e4-a80d-4a1c-a9ab-f23f38dc2679', 0, 'Abhishek', 'L', NULL, NULL, NULL, NULL, true, '2025-10-24 16:43:21.874192+00', '2025-10-24 16:43:21.874192+00', NULL, NULL),
	('9c2d3636-b90c-44cf-b67a-848fc1f076a3', 0, 'Abhishek', 'L', NULL, NULL, NULL, NULL, true, '2025-10-24 16:43:56.283878+00', '2025-10-24 16:43:56.283878+00', NULL, NULL);


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."albums" ("id", "title", "school_id", "published_by_id", "is_public", "created_at", "updated_at", "metadata", "album_type", "access_scope") VALUES
	(1, 'Annual Sports Day 2024', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-09-22 19:24:12.899782+00', '2025-09-22 19:24:12.899782+00', NULL, NULL, NULL),
	(2, 'Independence Day Celebration 2025', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-09-22 19:24:12.899782+00', '2025-09-22 19:24:12.899782+00', NULL, NULL, NULL),
	(3, 'Science Exhibition 2025', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-09-22 19:24:12.899782+00', '2025-09-22 19:24:12.899782+00', NULL, NULL, NULL),
	(278, 'Sample', 1, '63bed14f-2514-45a2-a718-04c1d0a0b7f0', false, '2025-10-19 07:30:35.227733+00', NULL, '{}', 'cultural', 'targeted'),
	(279, 'Public', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-10-19 07:30:55.869259+00', NULL, '{}', 'cultural', 'public'),
	(280, 'Grade', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:30:55.869259+00', NULL, '{}', 'cultural', 'targeted'),
	(281, 'Class', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:30:55.869259+00', NULL, '{}', 'cultural', 'targeted'),
	(282, 'Student', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:30:55.869259+00', NULL, '{}', 'cultural', 'targeted'),
	(283, 'Public', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-10-19 07:31:23.326183+00', NULL, '{}', 'cultural', 'public'),
	(284, 'Grade', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:31:23.326183+00', NULL, '{}', 'cultural', 'targeted'),
	(285, 'Class', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:31:23.326183+00', NULL, '{}', 'cultural', 'targeted'),
	(286, 'Student', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:31:23.326183+00', NULL, '{}', 'cultural', 'targeted'),
	(287, 'Class', 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, '2025-10-19 07:31:50.145531+00', NULL, '{}', 'cultural', 'targeted'),
	(801, 'Grade 8 Science Fair Photos', 1, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 12:22:48.813038+00', NULL, NULL, 'cultural', 'targeted'),
	(802, 'Grade 8 Science Fair Photos', 1, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 12:25:26.908494+00', NULL, NULL, 'cultural', 'targeted'),
	(803, 'Grade 8 Science Fair Photos', 1, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 13:04:34.613407+00', NULL, NULL, 'cultural', 'targeted'),
	(804, 'Grade 8 Science  Photos', 1, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 13:05:58.513649+00', NULL, NULL, 'cultural', 'targeted'),
	(805, 'Grade 8 dance Photos', 1, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 13:10:31.413431+00', NULL, NULL, 'cultural', 'targeted'),
	(806, 'Grade 8 Science Fair Photos', 1, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', false, '2025-10-20 13:35:10.197818+00', NULL, NULL, 'cultural', 'targeted');


--
-- Data for Name: album_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."album_targets" ("id", "album_id", "target_type", "target_id", "created_at") VALUES
	(200, 278, 'grade', 1, '2025-10-19 07:30:35.227733+00'),
	(201, 280, 'grade', 5, '2025-10-19 07:30:55.869259+00'),
	(202, 281, 'class', 101, '2025-10-19 07:30:55.869259+00'),
	(203, 282, 'individual_student', 21, '2025-10-19 07:30:55.869259+00'),
	(204, 284, 'grade', 5, '2025-10-19 07:31:23.326183+00'),
	(205, 285, 'class', 101, '2025-10-19 07:31:23.326183+00'),
	(206, 286, 'individual_student', 21, '2025-10-19 07:31:23.326183+00'),
	(207, 287, 'class', 101, '2025-10-19 07:31:50.145531+00'),
	(557, 801, 'grade', 8, '2025-10-20 12:22:48.813038+00'),
	(558, 802, 'grade', 8, '2025-10-20 12:25:26.908494+00'),
	(559, 803, 'class', 102, '2025-10-20 13:04:34.613407+00'),
	(560, 804, 'individual_student', 55, '2025-10-20 13:05:58.513649+00'),
	(561, 805, 'individual_student', 34, '2025-10-20 13:10:31.413431+00'),
	(562, 806, 'individual_student', 37, '2025-10-20 13:35:10.197818+00');


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."announcements" ("id", "title", "school_id", "content", "published_by_id", "published_at", "is_active", "created_at", "updated_at", "language") VALUES
	(1, 'Welcome Back to School!', 1, '{"message": "We are thrilled to welcome all students and staff back for the 2025-2026 academic year. Let''s make it a great one!"}', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:02:20.849424+00', true, '2025-09-22 19:02:20.849424+00', '2025-09-22 19:02:20.849424+00', 'en'),
	(2, 'Annual Sports Day - Date Annoucement', 1, '{"message": "The Annual Sports Day will be held on December 15th, 2025. All are invited to attend and cheer for our students."}', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:02:20.849424+00', true, '2025-09-22 19:02:20.849424+00', '2025-09-22 19:02:20.849424+00', 'en'),
	(624, 'parent-meeting-7', 1, '"everyone in class has to assemble in seminal hall"', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-11-01 19:56:32.502764+00', true, '2025-11-01 19:56:32.502764+00', '2025-11-01 19:56:32.502764+00', NULL),
	(153, 'Important Exam Schedule Update', 1, '{"message": "Surprise will begin from MARCH 28th.", "attachments": [{"url": "https://school-portal.com/files/exam_schedules.pdf", "type": "pdf"}]}', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-10-08 16:04:22.5199+00', true, '2025-10-08 16:04:22.5199+00', '2025-10-08 16:04:22.5199+00', NULL),
	(154, 'Important Exam Schedule Update', 1, '{"message": "Surprise 2 will begin from MARCH 28th.", "attachments": [{"url": "https://school-portal.com/files/exam_schedules.pdf", "type": "pdf"}]}', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-10-08 16:11:34.446922+00', true, '2025-10-08 16:11:34.446922+00', '2025-10-08 16:11:34.446922+00', NULL),
	(127, 'Important Exam Schedule Update', 1, '{"message": "Midterm exams will begin from October 15th.", "attachments": [{"url": "https://school-portal.com/files/exam_schedule.pdf", "type": "pdf"}]}', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-10-07 17:30:27.800376+00', true, '2025-10-07 17:30:27.800376+00', '2025-10-07 17:30:27.800376+00', NULL),
	(128, 'Important Exam Schedule Update', 1, '{"message": "Final exams will begin from MARCH 28th.", "attachments": [{"url": "https://school-portal.com/files/exam_schedule.pdf", "type": "pdf"}]}', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-10-07 17:37:22.009535+00', true, '2025-10-07 17:37:22.009535+00', '2025-10-07 17:37:22.009535+00', NULL);


--
-- Data for Name: announcement_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."announcement_targets" ("id", "announcement_id", "target_type", "target_id") VALUES
	(6, 1, 'SCHOOL', 1),
	(7, 2, 'GRADE', 5),
	(132, 127, 'CLASS', 11),
	(133, 127, 'GRADE', 12),
	(134, 128, 'CLASS', 11),
	(135, 128, 'GRADE', 12),
	(633, 624, 'SCHOOL', 1),
	(160, 153, 'CLASS', 11),
	(161, 153, 'GRADE', 12),
	(162, 154, 'CLASS', 11),
	(163, 154, 'GRADE', 12);


--
-- Data for Name: employment_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."employment_statuses" ("status_id", "school_id", "status_name") VALUES
	(1, 1, 'Full-Time'),
	(2, 1, 'Part-Time'),
	(3, 1, 'Contract'),
	(56, 1, 'Probationary-c13639'),
	(121, 1, 'Probationary-6a2804'),
	(181, 1, 'Probationary-4d4d25'),
	(246, 1, 'Probationary-6659e4'),
	(321, 1, 'Probationary-45cfbe'),
	(396, 1, 'Probationary-72585d'),
	(6, 1, 'Probationary-90a6ab'),
	(61, 1, 'Probationary-b7367d'),
	(481, 1, 'Probationary-b0fa6e'),
	(126, 1, 'Probationary-3bc0d1'),
	(306, 1, 'Probationary-a5e113'),
	(11, 1, 'Probationary-4b1b59'),
	(186, 1, 'Probationary-740693'),
	(571, 1, 'Probationary-9e8bab'),
	(66, 1, 'Probationary-28402a'),
	(251, 1, 'Probationary-b959ff'),
	(651, 1, 'Probationary-4ba3f5'),
	(16, 1, 'Probationary-841e92'),
	(131, 1, 'Probationary-306c30'),
	(731, 1, 'Probationary-e4fe7d'),
	(326, 1, 'Probationary-332d9c'),
	(71, 1, 'Probationary-345777'),
	(191, 1, 'Probationary-ad9c45'),
	(21, 1, 'Probationary-7a6f5d'),
	(401, 1, 'Probationary-fd79b9'),
	(136, 1, 'Probationary-f895c3'),
	(256, 1, 'Probationary-9e9ee0'),
	(76, 2, 'Full-Time'),
	(26, 1, 'Probationary-8085ae'),
	(77, 2, 'Part-Time'),
	(78, 2, 'Contract'),
	(79, 2, 'Probation'),
	(80, 2, 'Retired'),
	(81, 2, 'Full-Time'),
	(31, 1, 'Probationary-47c799'),
	(82, 2, 'Part-Time'),
	(83, 2, 'Contract'),
	(84, 2, 'Probation'),
	(85, 2, 'Retired'),
	(86, 1, 'Probationary-fb2cca'),
	(36, 1, 'Probationary-5a677c'),
	(486, 1, 'Probationary-be9a28'),
	(196, 1, 'Probationary-fb14a0'),
	(141, 1, 'Probationary-4c63b0'),
	(41, 1, 'Probationary-fc51f3'),
	(91, 1, 'Probationary-df0eea'),
	(331, 1, 'Probationary-de7a1d'),
	(576, 1, 'Probationary-df49dc'),
	(261, 1, 'Probationary-464f01'),
	(46, 1, 'Probationary-112eb0'),
	(201, 1, 'Probationary-482391'),
	(96, 1, 'Probationary-444b70'),
	(146, 1, 'Probationary-668822'),
	(406, 1, 'Probationary-d59d5f'),
	(496, 1, 'Probationary-f31999'),
	(51, 1, 'Probationary-2e1cf8'),
	(336, 1, 'Probationary-398630'),
	(101, 1, 'Probationary-492de7'),
	(266, 1, 'Probationary-a51171'),
	(151, 1, 'Probationary-5ccb66'),
	(206, 1, 'Probationary-acc59e'),
	(491, 1, 'Probationary-0f5e40'),
	(106, 1, 'Probationary-8ee3ab'),
	(411, 1, 'Probationary-9a2549'),
	(156, 1, 'Probationary-aca78b'),
	(581, 1, 'Probationary-691d30'),
	(211, 1, 'Probationary-b49d0b'),
	(111, 1, 'Probationary-66325a'),
	(271, 1, 'Probationary-a1ded7'),
	(341, 1, 'Probationary-15b4f0'),
	(161, 1, 'Probationary-1d34df'),
	(116, 1, 'Probationary-1ee5dd'),
	(216, 1, 'Probationary-1bcfc0'),
	(371, 1, 'Probationary-7a7ee9'),
	(276, 1, 'Probationary-ab1d7a'),
	(166, 1, 'Probationary-91fd7b'),
	(346, 1, 'Probationary-013a04'),
	(416, 1, 'Probationary-bf8ab9'),
	(221, 1, 'Probationary-c85683'),
	(311, 1, 'Probationary-6c8f0c'),
	(171, 1, 'Probationary-fdfb6d'),
	(506, 1, 'Probationary-d748bd'),
	(281, 1, 'Probationary-e81b2a'),
	(586, 1, 'Probationary-7d4fae'),
	(501, 1, 'Probationary-285fd2'),
	(226, 1, 'Probationary-ba345a'),
	(176, 1, 'Probationary-cebc0c'),
	(431, 1, 'Probationary-a12f04'),
	(351, 1, 'Probationary-dd53e8'),
	(286, 1, 'Probationary-76a9d7'),
	(421, 1, 'Probationary-c767ad'),
	(231, 1, 'Probationary-c6adea'),
	(356, 1, 'Probationary-fc0436'),
	(291, 1, 'Probationary-3508bb'),
	(236, 1, 'Probationary-c54afc'),
	(591, 1, 'Probationary-0fd6d3'),
	(426, 1, 'Probationary-b63b46'),
	(241, 1, 'Probationary-c8f34a'),
	(296, 1, 'Probationary-91fbd1'),
	(361, 1, 'Probationary-ebf4f6'),
	(511, 1, 'Probationary-b580f5'),
	(436, 1, 'Probationary-01c13f'),
	(301, 1, 'Probationary-deb0e7'),
	(366, 1, 'Probationary-261389'),
	(516, 1, 'Probationary-0763fe'),
	(376, 1, 'Probationary-c20f3c'),
	(316, 1, 'Probationary-d9cf90'),
	(441, 1, 'Probationary-659852'),
	(381, 1, 'Probationary-32583f'),
	(521, 1, 'Probationary-a69322'),
	(471, 1, 'Probationary-812cb1'),
	(446, 1, 'Probationary-b577b9'),
	(386, 1, 'Probationary-49fb1d'),
	(526, 1, 'Probationary-b0e16f'),
	(451, 1, 'Probationary-4b9922'),
	(391, 1, 'Probationary-59d332'),
	(456, 1, 'Probationary-369574'),
	(531, 1, 'Probationary-04ffa6'),
	(461, 1, 'Probationary-3ce149'),
	(536, 1, 'Probationary-b5be06'),
	(466, 1, 'Probationary-577ec2'),
	(541, 1, 'Probationary-ad16db'),
	(546, 1, 'Probationary-b97022'),
	(476, 1, 'Probationary-cfc247'),
	(551, 1, 'Probationary-c9e5c4'),
	(556, 1, 'Probationary-1e0dc9'),
	(561, 1, 'Probationary-e43702'),
	(566, 1, 'Probationary-9e455d'),
	(596, 1, 'Probationary-66b171'),
	(656, 1, 'Probationary-2a8331'),
	(736, 1, 'Probationary-04da56'),
	(601, 1, 'Probationary-279c34'),
	(661, 1, 'Probationary-3bf1cf'),
	(606, 1, 'Probationary-2d60c3'),
	(741, 1, 'Probationary-0351c1'),
	(666, 1, 'Probationary-f5202d'),
	(611, 1, 'Probationary-3e4738'),
	(746, 1, 'Probationary-fc1da7'),
	(671, 1, 'Probationary-c9e74e'),
	(616, 1, 'Probationary-fd980e'),
	(751, 1, 'Probationary-8ebfb1'),
	(621, 1, 'Probationary-ec39f2'),
	(676, 1, 'Probationary-e04ee7'),
	(626, 1, 'Probationary-6e41c2'),
	(681, 1, 'Probationary-149095'),
	(756, 1, 'Probationary-d83eee'),
	(631, 1, 'Probationary-e85d16'),
	(686, 1, 'Probationary-ec7bcd'),
	(761, 1, 'Probationary-c0acce'),
	(636, 1, 'Probationary-4c97e0'),
	(691, 1, 'Probationary-1f054c'),
	(641, 1, 'Probationary-ac9d3e'),
	(765, 1, 'Probationary-2f9c02'),
	(696, 1, 'Probationary-94c08a'),
	(646, 1, 'Probationary-4fcf98'),
	(701, 1, 'Probationary-f105bd'),
	(706, 1, 'Probationary-263f89'),
	(711, 1, 'Probationary-55d1b5'),
	(716, 1, 'Probationary-0ec142'),
	(721, 1, 'Probationary-aa8c6d'),
	(726, 1, 'Probationary-616e38');


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teachers" ("teacher_id", "user_id", "department", "subject_specialization", "hire_date", "employment_status_id", "years_of_experience", "is_certified", "bio", "is_active", "created_at", "updated_at", "school_id", "qualifications") VALUES
	(11, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'Administration', 'School Management', '2010-06-01', 3, 15, false, NULL, true, '2025-09-22 18:20:35.374471+00', '2025-09-22 18:20:35.374471+00', 1, NULL),
	(12, '4808a1be-01b6-44c1-a17a-c9f104b40854', 'Science', 'Physics', '2018-07-20', 2, 7, false, NULL, true, '2025-09-22 18:20:35.693366+00', '2025-09-22 18:20:35.693366+00', 1, NULL),
	(13, 'da134162-0d5d-4215-b93b-aefb747ffa17', 'Mathematics', 'Algebra', '2020-08-15', 2, 5, false, NULL, true, '2025-09-22 18:20:35.960754+00', '2025-09-22 18:20:35.960754+00', 1, NULL),
	(14, 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'Languages', 'English', '2019-02-10', 3, 6, false, NULL, true, '2025-09-22 18:20:36.230365+00', '2025-09-22 18:20:36.230365+00', 1, NULL),
	(15, 'b393e32d-fb28-4de5-9713-eeebad9d2c06', 'Social Studies', 'History', '2021-09-01', 2, 4, false, NULL, true, '2025-09-22 18:20:36.494967+00', '2025-09-22 18:20:36.494967+00', 1, NULL),
	(16, '70cee473-d0a2-4484-8a84-e0a5cd4e584c', 'Languages', 'Hindi', '2017-05-25', 3, 8, false, NULL, true, '2025-09-22 18:20:36.756127+00', '2025-09-22 18:20:36.756127+00', 1, NULL),
	(17, '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', 'Languages', 'Kannada', '2016-01-12', 3, 9, false, NULL, true, '2025-09-22 18:20:37.011529+00', '2025-09-22 18:20:37.011529+00', 1, NULL),
	(18, 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', 'Computer Science', 'Programming', '2022-07-30', 2, 3, false, NULL, true, '2025-09-22 18:20:37.278378+00', '2025-09-22 18:20:37.278378+00', 1, NULL),
	(19, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', 'Arts', 'Painting', '2018-03-18', 2, 7, false, NULL, true, '2025-09-22 18:20:37.53671+00', '2025-09-22 18:20:37.53671+00', 1, NULL),
	(20, 'ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', 'Science', 'Chemistry', '2015-11-05', 1, 10, false, NULL, true, '2025-09-22 18:20:37.802151+00', '2025-09-22 18:20:37.802151+00', 1, NULL),
	(1259, 'cd307408-9c83-475e-a874-be26288d534c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-01 19:58:15.157636+00', '2025-11-01 19:58:15.157636+00', 1, NULL);


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."classes" ("class_id", "school_id", "grade_level", "section", "class_teacher_id", "is_active", "created_at", "updated_at", "academic_year_id") VALUES
	(101, 1, 5, 'A', 17, true, '2025-10-11 18:57:31.194309+00', '2025-10-11 18:57:31.194309+00', NULL),
	(11, 2, 1, 'A', 11, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 1),
	(13, 1, 2, 'A', 13, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(14, 1, 2, 'B', 14, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(15, 1, 3, 'A', 15, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(16, 1, 3, 'B', 16, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(17, 1, 4, 'A', 17, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(18, 1, 4, 'B', 18, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(19, 1, 5, 'A', 19, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(20, 1, 5, 'B', 20, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2),
	(3810, 1, 6, 'C', NULL, true, '2025-11-05 20:28:00.020952+00', '2025-11-05 20:28:00.020952+00', 1),
	(1023, 2, 1, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1024, 2, 1, 'B', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1025, 2, 2, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1026, 2, 2, 'B', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1027, 2, 3, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1028, 2, 4, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1029, 2, 5, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1030, 2, 6, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1031, 2, 7, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1032, 2, 8, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1033, 2, 9, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1034, 2, 10, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1035, 2, 11, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(1036, 2, 12, 'A', NULL, true, '2025-10-11 09:11:48.233866+00', '2025-10-11 09:11:48.233866+00', 1873),
	(673, 1, 7, 'A', 13, true, '2025-10-07 09:49:48.806805+00', '2025-10-07 09:49:48.806805+00', 1327),
	(1037, 2, 1, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(674, 1, 8, 'B', 17, true, '2025-10-07 10:03:10.170554+00', '2025-10-07 10:03:10.170554+00', 1327),
	(1038, 2, 1, 'B', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1039, 2, 2, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1040, 2, 2, 'B', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1041, 2, 3, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1042, 2, 4, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1043, 2, 5, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1044, 2, 6, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1045, 2, 7, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1046, 2, 8, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1047, 2, 9, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(735, 0, 10, 'Z', 19, true, '2025-10-08 06:59:14.843429+00', '2025-10-08 06:59:14.843429+00', 1437),
	(1048, 2, 10, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1049, 2, 11, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(1050, 2, 12, 'A', NULL, true, '2025-10-11 09:39:21.90038+00', '2025-10-11 09:39:21.90038+00', 1873),
	(12, 1, 1, 'B', 12, true, '2025-09-22 18:26:15.769569+00', '2025-09-22 18:26:15.769569+00', 2);


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."discounts" ("id", "school_id", "name", "description", "type", "value", "rules", "is_active", "created_at", "updated_at") VALUES
	(32, 2, '10% Sibling Discount', NULL, 'percentage', 10.00, '{"applicable_to_component_ids": [138]}', true, '2025-10-16 10:51:03.044746+00', '2025-10-16 10:51:03.044746+00');


--
-- Data for Name: fee_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."fee_templates" ("id", "name", "total_amount", "school_id", "status", "created_at", "updated_at", "description", "start_date", "end_date", "academic_year_id") VALUES
	(44, 'Grade 5 Annual', NULL, 2, 'Active', '2025-10-16 10:51:03.044746+00', '2025-10-16 10:51:03.044746+00', NULL, NULL, NULL, 1),
	(101, 'Class 11 Monthly', NULL, 2, 'Active', '2025-10-17 11:00:29.244677+00', '2025-10-17 11:00:29.244677+00', NULL, NULL, NULL, 1);


--
-- Data for Name: fee_terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."fee_terms" ("id", "fee_template_id", "name", "due_date", "amount", "created_at") VALUES
	(1, 44, 'Term 1', '2025-10-31', 35500.00, '2025-10-16 20:14:01.239693+00'),
	(69, 101, 'Term 3', '2025-10-25', 10000.00, '2025-10-17 11:17:12.466848+00'),
	(39, 44, 'Term 1', '2025-08-01', 17750.00, '2025-10-16 10:51:03.044746+00'),
	(40, 44, 'Term 2', '2026-01-15', 17750.00, '2025-10-16 10:51:03.044746+00');


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."students" ("student_id", "user_id", "current_class_id", "proctor_teacher_id", "roll_number", "enrollment_date", "academic_status", "notes", "is_active", "created_at", "updated_at") VALUES
	(31, 'd8fab006-304c-43bc-a8db-597fdf947c9e', 16, NULL, 'STU7078', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:40.707756+00', '2025-09-22 18:20:40.707756+00'),
	(32, '6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4', 16, NULL, 'STU9749', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:40.983209+00', '2025-09-22 18:20:40.983209+00'),
	(33, '706c538d-4134-4cc1-be7e-fb11fa771bfb', 17, NULL, 'STU5172', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:41.234502+00', '2025-09-22 18:20:41.234502+00'),
	(34, '25d8b8be-ab84-4758-91e0-427db617eeab', 17, NULL, 'STU4584', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:41.498957+00', '2025-09-22 18:20:41.498957+00'),
	(35, 'f46c80a9-0e4f-4308-b266-8ddc28ff2228', 18, NULL, 'STU1047', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:41.753808+00', '2025-09-22 18:20:41.753808+00'),
	(36, 'b4e9499b-5580-488e-8163-e4706459dfb8', 18, NULL, 'STU5015', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:42.013641+00', '2025-09-22 18:20:42.013641+00'),
	(37, 'dff67664-a554-4629-8e07-f0a6f640ee6d', 19, NULL, 'STU3016', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:42.266352+00', '2025-09-22 18:20:42.266352+00'),
	(38, '4d68700c-6741-4abf-a51e-718a58b75500', 19, NULL, 'STU9521', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:42.520843+00', '2025-09-22 18:20:42.520843+00'),
	(21, '63bed14f-2514-45a2-a718-04c1d0a0b7f0', 11, NULL, 'STU2002', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:38.082039+00', '2025-09-22 18:20:38.082039+00'),
	(22, '48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', 11, NULL, 'STU7168', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:38.344764+00', '2025-09-22 18:20:38.344764+00'),
	(23, '45c6ac9c-9306-40f1-a23d-fbfea313c794', 12, NULL, 'STU4647', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:38.594386+00', '2025-09-22 18:20:38.594386+00'),
	(24, 'cb0cf1e2-19d0-4ae3-93ed-3073a47a5058', 12, NULL, 'STU2576', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:38.847348+00', '2025-09-22 18:20:38.847348+00'),
	(25, '9caad150-de2c-478a-87b6-a712e412947f', 13, NULL, 'STU4793', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:39.137622+00', '2025-09-22 18:20:39.137622+00'),
	(26, '3b3f1289-d861-45e2-b4e4-f18d72ca5036', 13, NULL, 'STU5605', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:39.398816+00', '2025-09-22 18:20:39.398816+00'),
	(27, '604f3f2f-0741-4ec8-9667-d3f0ecdc76be', 14, NULL, 'STU9258', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:39.6485+00', '2025-09-22 18:20:39.6485+00'),
	(28, '226cb810-8e16-4a3d-a879-2c1b325edbeb', 14, NULL, 'STU7923', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:39.913794+00', '2025-09-22 18:20:39.913794+00'),
	(29, 'd77de604-114c-4c71-8b8c-5616db827da7', 15, NULL, 'STU2418', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:40.171629+00', '2025-09-22 18:20:40.171629+00'),
	(30, '12fcf33f-7c54-4466-a44c-ad7602b2c2bc', 15, NULL, 'STU9262', '2025-09-22', 'Active', NULL, true, '2025-09-22 18:20:40.44037+00', '2025-09-22 18:20:40.44037+00'),
	(39, '6bbe0fc4-7caa-4705-a87d-2114dd189669', 20, NULL, 'STU2183', '2025-09-22', 'Withdrawn', NULL, false, '2025-09-22 18:20:42.786508+00', '2025-09-22 18:20:42.786508+00'),
	(40, 'b195fe70-8761-4c73-a7db-5c95f68ca89b', 20, NULL, 'STU2392', '2025-09-22', 'Withdrawn', NULL, false, '2025-09-22 18:20:43.04716+00', '2025-09-22 18:20:43.04716+00');


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."invoices" ("id", "student_id", "fee_structure_id", "status", "invoice_number", "due_date", "amount_due", "created_at", "updated_at", "payment_date", "payment_method", "fine_amount", "fee_term_id", "late_fee_applied", "scholarship_ref", "amount_paid", "payment_status", "is_active") VALUES
	(166, 22, 101, 'due', 'INV-2025-22-69', '2025-10-25', 45500.00, '2025-10-17 11:17:30.781056+00', '2025-10-18 03:36:23.663667+00', NULL, NULL, NULL, 69, 0.00, NULL, 45500.00, 'paid', true),
	(104, 21, 44, 'due', 'INV-2025-21-39', '2025-08-01', 32500.0000, '2025-10-16 11:43:42.64625+00', '2025-10-21 06:37:19.914415+00', NULL, NULL, NULL, 39, 0.00, NULL, 65000.00, 'paid', true),
	(165, 21, 101, 'due', 'INV-2025-21-69', '2025-10-25', 42500.0000, '2025-10-17 11:17:30.781056+00', '2025-10-21 07:28:03.866869+00', NULL, NULL, NULL, 69, 0.00, NULL, 42500.00, 'paid', true),
	(105, 22, 44, 'due', 'INV-2025-22-39', '2025-08-01', 35500.00, '2025-10-16 11:43:42.64625+00', '2025-10-22 07:15:37.654986+00', NULL, NULL, NULL, 39, 0.00, NULL, 71000.00, 'paid', true);


--
-- Data for Name: applied_discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."applied_discounts" ("id", "invoice_id", "discount_id", "amount_discounted", "created_at") VALUES
	(60, 165, 32, 3000.00, '2025-10-17 11:17:30.781056+00'),
	(37, 104, 32, 3000.00, '2025-10-16 11:43:42.64625+00');


--
-- Data for Name: periods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."periods" ("id", "school_id", "period_number", "start_time", "end_time", "duration_minutes", "is_recess", "period_name", "day_of_week", "created_at", "updated_at", "is_active") VALUES
	(1, 1, 1, '08:30:00', '09:15:00', 45, false, 'Period 1', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(2, 1, 2, '09:15:00', '10:00:00', 45, false, 'Period 2', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(3, 1, 3, '10:00:00', '10:45:00', 45, false, 'Period 3', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(4, 1, 4, '10:45:00', '11:30:00', 45, false, 'Period 4', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(5, 1, 5, '11:30:00', '12:30:00', 60, true, 'Lunch Break', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(6, 1, 6, '12:30:00', '13:15:00', 45, false, 'Period 5', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(7, 1, 7, '13:15:00', '14:00:00', 45, false, 'Period 6', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(8, 1, 8, '14:00:00', '14:45:00', 45, false, 'Period 7', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', true),
	(275, 0, NULL, NULL, NULL, NULL, false, NULL, NULL, '2025-10-08 09:00:21.966691+00', '2025-10-08 09:00:21.966691+00', true),
	(9, 1, 9, '14:45:00', '15:30:00', 45, false, 'Period 8', NULL, '2025-09-22 18:36:24.854823+00', '2025-09-22 18:36:24.854823+00', false),
	(429, 2, 1, '08:00:00', '08:45:00', 45, false, 'Period 1', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(430, 2, 2, '08:45:00', '09:30:00', 45, false, 'Period 2', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(431, 2, 3, '09:30:00', '10:15:00', 45, false, 'Period 3', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(432, 2, 0, '10:15:00', '10:35:00', 20, true, 'Recess', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(433, 2, 4, '10:35:00', '11:20:00', 45, false, 'Period 4', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(434, 2, 5, '11:20:00', '12:05:00', 45, false, 'Period 5', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(435, 2, 0, '12:05:00', '12:35:00', 30, true, 'Lunch Break', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(436, 2, 6, '12:35:00', '13:20:00', 45, false, 'Period 6', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(437, 2, 7, '13:20:00', '14:05:00', 45, false, 'Period 7', 'Monday', '2025-10-11 07:53:50.577429+00', '2025-10-11 07:53:50.577429+00', true),
	(438, 2, 1, '08:00:00', '08:45:00', 45, false, 'Period 1', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(439, 2, 2, '08:45:00', '09:30:00', 45, false, 'Period 2', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(440, 2, 3, '09:30:00', '10:15:00', 45, false, 'Period 3', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(441, 2, 0, '10:15:00', '10:35:00', 20, true, 'Recess', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(442, 2, 4, '10:35:00', '11:20:00', 45, false, 'Period 4', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(443, 2, 5, '11:20:00', '12:05:00', 45, false, 'Period 5', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(444, 2, 0, '12:05:00', '12:35:00', 30, true, 'Lunch Break', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(445, 2, 6, '12:35:00', '13:20:00', 45, false, 'Period 6', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true),
	(446, 2, 7, '13:20:00', '14:05:00', 45, false, 'Period 7', 'Monday', '2025-10-11 09:39:07.085538+00', '2025-10-11 09:39:07.085538+00', true);


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."attendance_records" ("id", "student_id", "class_id", "date", "status", "period_id", "teacher_id", "notes", "recorded_at", "absence_type", "late_minutes") VALUES
	(1, 21, 11, '2025-09-19', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, NULL),
	(2, 21, 11, '2025-09-22', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, NULL),
	(4, 22, 11, '2025-09-19', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, NULL),
	(5, 22, 11, '2025-09-22', 'Absent', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', 'Sick', NULL),
	(6, 22, 11, '2025-09-23', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, NULL),
	(7, 23, 11, '2025-09-19', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, NULL),
	(8, 23, 11, '2025-09-22', 'Absent', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, NULL),
	(9, 23, 11, '2025-09-23', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', 'Sick', NULL),
	(12, 21, 11, '2025-09-27', 'Present', 1, 14, NULL, '2025-09-27 06:17:10.516004+00', NULL, NULL),
	(3, 21, 11, '2025-09-23', 'Present', NULL, 11, NULL, '2025-09-22 19:32:58.134367+00', NULL, 10),
	(436, 31, 16, '2025-10-09', 'Present', 1, NULL, 'Arrived on time', '2025-10-09 13:54:02.724024+00', NULL, NULL),
	(437, 32, 16, '2025-10-09', 'Late', 1, NULL, 'Arrived late due to traffic', '2025-10-09 13:54:02.724024+00', NULL, NULL);


--
-- Data for Name: audits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."audits" ("audit_id", "user_id", "action_type", "table_name", "record_id", "old_data", "new_data", "action_timestamp", "ip_address") VALUES
	(1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'INSERT', 'public.subjects', '8', '{}', '{"name": "Art & Craft", "category": "Arts"}', '2025-09-22 04:00:00+00', '192.168.1.10'),
	(2, 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'UPDATE', 'public.student_contacts', '3', '{"phone": "9876543212"}', '{"phone": "9988776655"}', '2025-09-22 06:15:10+00', '203.0.113.55'),
	(3, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'UPDATE', 'public.schools', '1', '{"principal_name": "Priya Sharma"}', '{"principal_name": "Dr. Priya Sharma"}', '2025-09-22 19:35:00+00', '192.168.1.10'),
	(7, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 'CREATE', 'student_fee_discounts', '29', NULL, '{"student_id": 22, "discount_id": 30}', '2025-10-16 09:21:20.900187+00', '127.0.0.1'),
	(8, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 'CREATE', 'student_fee_discounts', '30', NULL, '{"student_id": 21, "discount_id": 30}', '2025-10-16 10:02:48.672753+00', '127.0.0.1');


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."carts" ("cart_id", "user_id", "created_at", "updated_at") VALUES
	(2, 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', '2025-09-22 18:59:59.062432+00', '2025-09-22 18:59:59.062432+00'),
	(9, 'da134162-0d5d-4215-b93b-aefb747ffa17', '2025-10-12 17:15:32.395234+00', '2025-10-12 17:15:32.395234+00'),
	(10, 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', '2025-10-12 17:15:32.395234+00', '2025-10-12 17:15:32.395234+00'),
	(1, '0841a053-7266-426e-b681-1d6fab5f9974', '2025-09-22 18:59:59.062432+00', '2025-10-19 09:30:23.992337+00'),
	(338, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-10-18 18:02:35.416775+00', '2025-10-18 18:14:35.104151+00'),
	(3721, '1ef75d00-3349-4274-8bc8-da135015ab5d', '2025-11-06 13:17:17.885202+00', '2025-11-06 13:24:11.792456+00'),
	(3722, 'e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', '2025-11-06 13:17:17.885202+00', '2025-11-06 13:24:11.792456+00');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("product_id", "name", "price", "stock_quantity", "category_id", "school_id", "sku", "is_active", "created_at", "updated_at", "description", "manufacturer", "reorder_level", "reorder_quantity", "image_url") VALUES
	(3, 'School Blazer - Medium', 1800, 50, 2, 1, 'UNIF-BLZ-M', true, '2025-09-22 18:56:26.939907+00', '2025-09-22 18:56:26.939907+00', NULL, NULL, NULL, NULL, NULL),
	(6, 'Geometry Box', 150, 100, 3, 1, 'STAT-GEO-BX', true, '2025-09-22 18:56:26.939907+00', '2025-09-22 18:56:26.939907+00', NULL, NULL, NULL, NULL, NULL),
	(9, 'Summer Uniform - Small', 1200, 60, 2, 1, 'UNIF-SUM-S', true, '2025-09-22 18:56:26.939907+00', '2025-09-22 18:56:26.939907+00', NULL, NULL, NULL, NULL, NULL),
	(10, 'Winter Uniform - Small', 1600, 60, 2, 1, 'UNIF-WIN-S', true, '2025-09-22 18:56:26.939907+00', '2025-09-22 18:56:26.939907+00', NULL, NULL, NULL, NULL, NULL),
	(11, 'House T-Shirt (Blue)', 750.00, 100, 1, 1, 'TVP-UNI-HTB-01', true, '2025-10-12 17:12:48.336434+00', '2025-10-12 17:12:48.336434+00', 'Blue house t-shirt for sports events.', NULL, NULL, NULL, NULL),
	(12, 'School Tie', 250.00, 150, 1, 1, 'TVP-UNI-TIE-01', true, '2025-10-12 17:12:48.336434+00', '2025-10-12 17:12:48.336434+00', 'Standard school tie for daily wear.', NULL, NULL, NULL, NULL),
	(13, 'Grade 5 English Textbook', 450.00, 80, 2, 1, 'TVP-BOOK-G5-ENG', true, '2025-10-12 17:12:48.336434+00', '2025-10-12 17:12:48.336434+00', 'Latest edition English textbook for Grade 5.', NULL, NULL, NULL, NULL),
	(14, 'Grade 5 Maths Textbook', 500.00, 80, 2, 1, 'TVP-BOOK-G5-MTH', true, '2025-10-12 17:12:48.336434+00', '2025-10-12 17:12:48.336434+00', 'Latest edition Maths textbook for Grade 5.', NULL, NULL, NULL, NULL),
	(15, 'Notebook Set (Pack of 5)', 300.00, 200, 3, 1, 'TVP-STA-NB5-01', true, '2025-10-12 17:12:48.336434+00', '2025-10-12 17:12:48.336434+00', 'Set of 5 single-line notebooks.', NULL, NULL, NULL, NULL),
	(4, 'School Tie', 250, 43, 2, 1, 'UNIF-TIE-STD', true, '2025-09-22 18:56:26.939907+00', '2025-10-21 06:00:22.963705+00', NULL, NULL, NULL, NULL, NULL),
	(1031, 'kothiBlue)', 750.0, 100, 1, 1, 'SCH1-TS-BL-M', true, '2025-10-18 14:04:31.693676+00', '2025-10-18 14:04:31.693676+00', 'Medium size', NULL, NULL, NULL, NULL),
	(16, 'House T-Shirt (Blue)', 750.00, 0, 1, 1, 'HTS-BLU-001', true, '2025-10-13 15:05:51.13235+00', '2025-11-06 13:24:11.792456+00', 'Blue house t-shirt, cotton, sizes S-XL', 'School Apparel Co.', 10, 20, 'https://example.com/images/hts-blue.png'),
	(1032, 'balls(Blue)', 800.0, 50, 1, 1, NULL, false, '2025-10-18 14:12:16.796802+00', '2025-10-18 14:12:45.723041+00', NULL, NULL, NULL, NULL, NULL),
	(1, 'Grade 1 Textbook Set', 775.0, 115, 1, 1, 'TXBK-G1-SET', false, '2025-09-22 18:56:26.939907+00', '2025-10-18 14:15:34.057973+00', 'Medium size - Updated Desc', NULL, NULL, NULL, NULL),
	(1039, 'Notebook Set (Set of 5)', 350.00, 200, 124, 2, 'SCH101-NB-S5', true, '2025-10-19 05:19:31.559114+00', '2025-10-19 05:19:31.559114+00', 'A set of 5 single-line notebooks, 200 pages.', NULL, 25, NULL, NULL),
	(1040, 'Pen Pack (10 Blue)', 120.00, 300, 124, 2, 'SCH101-PEN-BL-10', true, '2025-10-19 05:19:31.559114+00', '2025-10-19 05:19:31.559114+00', 'Pack of 10 blue ballpoint pens.', NULL, 50, NULL, NULL),
	(7, 'School Backpack', 950, 75, 4, 1, 'ACC-BP-STD', true, '2025-09-22 18:56:26.939907+00', '2025-10-19 05:58:02.395622+00', NULL, NULL, NULL, NULL, NULL),
	(8, 'Water Bottle', 300, 120, 4, 1, 'ACC-WB-500ML', true, '2025-09-22 18:56:26.939907+00', '2025-10-19 05:58:02.395622+00', NULL, NULL, NULL, NULL, NULL),
	(2, 'Grade 5 Textbook Set', 3200, 102, 1, 1, 'TXBK-G5-SET', true, '2025-09-22 18:56:26.939907+00', '2025-10-19 06:22:51.278945+00', NULL, NULL, NULL, NULL, NULL),
	(5, 'Notebook Set (Pack of 10)', 400, 156, 3, 1, 'STAT-NB-10PK', true, '2025-09-22 18:56:26.939907+00', '2025-10-19 06:22:51.278945+00', NULL, NULL, NULL, NULL, NULL),
	(1037, 'House T-Shirt (Blue)', 750.00, 98, 123, 2, 'SCH101-TS-BL-M', true, '2025-10-19 05:19:31.559114+00', '2025-10-19 09:37:36.11883+00', 'Medium size, cotton sports T-shirt for the Blue house.', NULL, 10, NULL, NULL),
	(1038, 'School Trousers (Grey)', 1100.00, 79, 123, 2, 'SCH101-TR-GR-28', true, '2025-10-19 05:19:31.559114+00', '2025-10-19 09:37:36.11883+00', 'Standard grey school trousers, size 28.', NULL, 15, NULL, NULL);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cart_items" ("cart_item_id", "cart_id", "product_id", "quantity") VALUES
	(3, 2, 3, 1),
	(4, 2, 4, 1),
	(4384, 3722, 16, 1);


--
-- Data for Name: fee_components; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."fee_components" ("id", "school_id", "component_name", "component_type", "base_amount", "is_mandatory", "payment_frequency", "created_at") VALUES
	(138, 2, 'Tuition', 'Academic', 30000.00, true, 'Annual', '2025-10-16 10:51:03.044746+00'),
	(139, 2, 'Transport', 'Service', 5000.00, false, 'Annual', '2025-10-16 10:51:03.044746+00'),
	(140, 2, 'Library', 'Service', 500.00, true, 'Annual', '2025-10-16 10:51:03.044746+00'),
	(141, 2, 'Authorized Admin Fee 5e7bd76b-9586-435e-ba2a-737e893379d7', 'Service', 500.00, true, 'Annual', '2025-10-16 12:23:46.608118+00'),
	(197, 1, 'Authorized Admin Fee e798c6cc-aee3-4093-8e3a-926e6fe15b20', 'Service', 500.00, true, 'Annual', '2025-10-16 20:18:04.701879+00'),
	(265, 1, 'Authorized Admin Fee 1be3acdc-064e-42a2-be0e-1d775aa05e9e', 'Service', 500.00, true, 'Annual', '2025-10-19 05:27:28.847698+00'),
	(333, 1, 'Authorized Admin Fee 4f6d3435-0120-49ee-9101-463ff57f2433', 'Service', 500.00, true, 'Annual', '2025-10-20 10:16:15.381666+00'),
	(339, 1, 'Authorized Admin Fee 3ad25626-6061-4e64-af9a-85f110ee8a9f', 'Service', 500.00, true, 'Annual', '2025-10-20 11:49:47.930361+00'),
	(402, 1, 'Authorized Admin Fee 4d40af93-01ba-45be-8c4d-16d388740edb', 'Service', 500.00, true, 'Annual', '2025-10-21 20:22:41.799681+00'),
	(479, 1, 'Authorized Admin Fee 91e95165-cfe5-4756-aad2-dd7842680e58', 'Service', 500.00, true, 'Annual', '2025-10-22 15:53:00.294851+00'),
	(148, 2, 'Authorized Admin Fee 9c45f0a4-80f6-4d9f-9c72-f5f8e13ae742', 'Service', 500.00, true, 'Annual', '2025-10-16 12:28:10.253136+00'),
	(607, 1, 'Authorized Admin Fee 07d1917a-d7b5-437e-8d4b-888223337be2', 'Service', 500.00, true, 'Annual', '2025-11-04 17:45:42.098502+00'),
	(206, 2, 'Transport Fee', 'service', 30000.00, true, 'Annual', '2025-10-16 20:23:30.141227+00'),
	(207, 1, 'Authorized Admin Fee 527bed9c-f019-473f-8b75-b5492e00eaa2', 'Service', 500.00, true, 'Annual', '2025-10-16 20:23:54.113996+00'),
	(692, 1, 'Authorized Admin Fee b1926d54-3d69-435c-8055-9315085a5c29', 'Service', 500.00, true, 'Annual', '2025-11-05 17:24:49.525851+00'),
	(864, 1, 'Authorized Admin Fee 330c6a02-9555-43e9-bbf0-086d32c27386', 'Service', 500.00, true, 'Annual', '2025-11-06 19:19:50.460956+00'),
	(155, 2, 'Authorized Admin Fee c1095bc6-d34f-4eb1-ac24-beeda5280ef2', 'Service', 500.00, true, 'Annual', '2025-10-16 12:29:28.336081+00'),
	(360, 1, 'Authorized Admin Fee eee28668-cf9c-46d8-a71d-a31c247ef423', 'Service', 500.00, true, 'Annual', '2025-10-20 13:17:37.582837+00'),
	(423, 1, 'Authorized Admin Fee dbb2c707-bb41-447f-92c0-b2bfdd42dfd2', 'Service', 500.00, true, 'Annual', '2025-10-22 05:00:58.374865+00'),
	(214, 1, 'Authorized Admin Fee b21db30c-74ca-4999-a22c-8bb03d1af653', 'Service', 500.00, true, 'Annual', '2025-10-16 20:25:21.268247+00'),
	(277, 1, 'Authorized Admin Fee f49f205c-edba-42a6-b5a2-22124397decd', 'Service', 500.00, true, 'Annual', '2025-10-20 08:55:35.804519+00'),
	(571, 1, 'Authorized Admin Fee 7483f5be-de16-4a12-8260-249224f8f72a', 'Service', 500.00, true, 'Annual', '2025-11-03 13:49:11.34224+00'),
	(162, 2, 'Authorized Admin Fee e43e1c53-52b5-46a3-bc96-d3b2b4e9280c', 'Service', 500.00, true, 'Annual', '2025-10-16 14:11:21.767994+00'),
	(785, 1, 'Authorized Admin Fee 8743a6a6-cbfe-40d8-a3a9-3f78ed4e4d5e', 'Service', 500.00, true, 'Annual', '2025-11-05 20:53:42.315689+00'),
	(621, 1, 'Authorized Admin Fee 54142c3f-5fae-490d-9134-12ca4c6b0e15', 'Service', 500.00, true, 'Annual', '2025-11-05 00:41:35.553359+00'),
	(381, 1, 'Authorized Admin Fee 98811a21-8eb8-4f50-acf4-2f91defb68e2', 'Service', 500.00, true, 'Annual', '2025-10-21 08:14:31.129648+00'),
	(221, 1, 'Authorized Admin Fee b6d9abd3-b472-4d53-a76e-7da1b8339b4f', 'Service', 500.00, true, 'Annual', '2025-10-17 09:16:49.172422+00'),
	(283, 1, 'Authorized Admin Fee 4aff44ab-a75e-445d-9179-4ccb8c5c5061', 'Service', 500.00, true, 'Annual', '2025-10-20 09:05:15.599251+00'),
	(169, 1, 'Authorized Admin Fee 6cbf828a-2c52-4fe8-ae36-3f13066d1a4a', 'Service', 500.00, true, 'Annual', '2025-10-16 14:20:17.94639+00'),
	(507, 1, 'Authorized Admin Fee 470662e4-e6a3-4f59-8d5d-829095975243', 'Service', 500.00, true, 'Annual', '2025-10-23 06:34:04.783018+00'),
	(583, 1, 'Authorized Admin Fee 4d7e42df-2f1d-42d6-b3bb-0cd740ec06b3', 'Service', 500.00, true, 'Annual', '2025-11-04 12:20:16.652087+00'),
	(714, 1, 'Authorized Admin Fee 1daed687-0bd1-4036-b0cd-826cbe8c9c82', 'Service', 500.00, true, 'Annual', '2025-11-05 17:54:09.448822+00'),
	(228, 1, 'Authorized Admin Fee 432d3a59-65b7-42f5-8380-d8910ef53d35', 'Service', 500.00, true, 'Annual', '2025-10-17 09:35:28.260242+00'),
	(176, 1, 'Authorized Admin Fee c9facb1a-224a-4946-8d13-d3feca2463ff', 'Service', 500.00, true, 'Annual', '2025-10-16 14:30:04.739183+00'),
	(451, 1, 'Authorized Admin Fee 912fdadf-f66f-47f5-bf66-0b0cc0f1c544', 'Service', 500.00, true, 'Annual', '2025-10-22 08:40:57.535927+00'),
	(632, 1, 'Authorized Admin Fee 85c49bbf-c130-4ec6-a936-0cff1b6dc34f', 'Service', 500.00, true, 'Annual', '2025-11-05 05:45:20.257674+00'),
	(594, 1, 'Authorized Admin Fee 338ed75e-784c-498c-94bb-ea40868afcca', 'Service', 500.00, true, 'Annual', '2025-11-04 13:50:52.829374+00'),
	(292, 1, 'Authorized Admin Fee 37a4bfce-a3ad-4886-9152-d1fedfa81d5c', 'Service', 500.00, true, 'Annual', '2025-10-20 09:19:25.681367+00'),
	(528, 1, 'Authorized Admin Fee b461abc1-e7a1-4d3a-9317-15ce9ff9a218', 'Service', 500.00, true, 'Annual', '2025-10-24 11:26:04.068309+00'),
	(598, 1, 'Authorized Admin Fee 39868497-df95-4397-b52b-b2b113cd7249', 'Service', 500.00, true, 'Annual', '2025-11-04 15:50:37.007315+00'),
	(183, 1, 'Authorized Admin Fee e41367d6-94e4-4047-972f-25a5a3f8113c', 'Service', 500.00, true, 'Annual', '2025-10-16 19:56:59.658203+00'),
	(235, 1, 'Authorized Admin Fee 44227dc8-e0d0-43d3-8d45-a92cbb0ba8e0', 'Service', 500.00, true, 'Annual', '2025-10-17 10:02:02.329906+00'),
	(637, 1, 'Authorized Admin Fee 4faae727-e99b-4eae-b058-530b73079673', 'Service', 500.00, true, 'Annual', '2025-11-05 12:46:28.084823+00'),
	(472, 1, 'Authorized Admin Fee 6b86b1d3-829f-41fe-9fe8-dcf906a690d3', 'Service', 500.00, true, 'Annual', '2025-10-22 15:14:20.062262+00'),
	(299, 1, 'Authorized Admin Fee d1cd7879-1d8a-4880-8079-5ffa81f7f5c6', 'Service', 500.00, true, 'Annual', '2025-10-20 09:25:00.225952+00'),
	(190, 1, 'Authorized Admin Fee 8ca0ee50-4dca-42a8-bbc3-1ad8dba1b36d', 'Service', 500.00, true, 'Annual', '2025-10-16 20:14:25.869431+00'),
	(242, 2, 'Tuitioning', 'Academic', 8000.00, true, 'Annual', '2025-10-17 10:55:50.817842+00'),
	(243, 2, 'Transporting', 'Service', 2000.00, true, 'Annual', '2025-10-17 10:57:02.515213+00'),
	(244, 1, 'Authorized Admin Fee 3315826d-d851-4f3c-8623-31ed8d3c6600', 'Service', 500.00, true, 'Annual', '2025-10-17 18:21:09.015423+00'),
	(549, 1, 'Authorized Admin Fee a5e4ed5e-6eaf-4d5d-a4ba-ff3ec717d806', 'Service', 500.00, true, 'Annual', '2025-10-26 06:50:27.389708+00'),
	(652, 1, 'Authorized Admin Fee 3e2ca35f-8851-4354-812c-137ca722d43b', 'Service', 500.00, true, 'Annual', '2025-11-05 14:11:57.316712+00'),
	(735, 1, 'Authorized Admin Fee 4744c605-728d-46ea-ac7f-693f6b99a06a', 'Service', 500.00, true, 'Annual', '2025-11-05 18:08:13.615347+00'),
	(306, 1, 'Authorized Admin Fee 51ffba06-aaed-45de-a1ac-e808e20cd826', 'Service', 500.00, true, 'Annual', '2025-10-20 09:35:40.231153+00'),
	(251, 1, 'Authorized Admin Fee 4c469841-d5df-41eb-bb1c-701c83d6ff64', 'Service', 500.00, true, 'Annual', '2025-10-18 10:38:11.772225+00'),
	(667, 1, 'Authorized Admin Fee f2c80b56-ebcb-4b11-8abe-6adcb0f86220', 'Service', 500.00, true, 'Annual', '2025-11-05 16:19:55.949864+00'),
	(258, 1, 'Authorized Admin Fee 52653f97-dd28-46f2-900b-656e73d0de63', 'Service', 500.00, true, 'Annual', '2025-10-18 10:41:21.120381+00'),
	(313, 1, 'Authorized Admin Fee e2cb5d50-baee-4b53-928f-fc7e46fb6a3b', 'Service', 500.00, true, 'Annual', '2025-10-20 09:44:55.919938+00'),
	(314, 1, 'Authorized Admin Fee e40448ec-de0c-49cd-9a04-3b441cc5475a', 'Service', 500.00, true, 'Annual', '2025-10-20 09:47:54.987842+00'),
	(321, 1, 'Authorized Admin Fee 2a03cfaa-f109-471e-bc41-7b77b5c3bd2a', 'Service', 500.00, true, 'Annual', '2025-10-20 09:52:13.342824+00'),
	(334, 1, 'Authorized Admin Fee 3472b533-1027-4c0b-a8f8-a4cb00de8e7b', 'Service', 500.00, true, 'Annual', '2025-10-20 11:17:32.614718+00'),
	(614, 1, 'Authorized Admin Fee e7b07a69-9c05-4379-a9c0-05265ce4e2af', 'Service', 500.00, true, 'Annual', '2025-11-04 18:47:51.653492+00'),
	(693, 1, 'Authorized Admin Fee 64d0ad91-3269-446d-903b-4520a9b493aa', 'Service', 500.00, true, 'Annual', '2025-11-05 17:30:22.382143+00'),
	(416, 1, 'Authorized Admin Fee 11af2e83-7f12-4ecb-a694-f6237ff91b0f', 'Service', 500.00, true, 'Annual', '2025-10-22 04:12:35.730679+00'),
	(353, 1, 'Authorized Admin Fee a0fc263f-7022-454b-aff0-830d13ba6497', 'Service', 500.00, true, 'Annual', '2025-10-20 12:54:39.342324+00'),
	(702, 1, 'Authorized Admin Fee 99e39364-24ed-4cf1-bad4-7e21924dc649', 'Service', 500.00, true, 'Annual', '2025-11-05 17:41:20.272035+00'),
	(709, 1, 'Authorized Admin Fee 5ec61234-2f9f-487c-8307-0671ecc92870', 'Service', 500.00, true, 'Annual', '2025-11-05 17:49:21.082418+00'),
	(424, 1, 'Authorized Admin Fee 58c4e73a-037d-44b7-87f9-1a605d135919', 'Service', 500.00, true, 'Annual', '2025-10-22 05:01:54.496316+00'),
	(500, 1, 'Authorized Admin Fee bdc64444-6e37-450a-9ac4-b0c06197dc41', 'Service', 500.00, true, 'Annual', '2025-10-23 06:15:53.515087+00'),
	(374, 1, 'Authorized Admin Fee 04ca4c3b-d197-4632-9a5a-d3972c17d5ce', 'Service', 500.00, true, 'Annual', '2025-10-20 18:47:47.738961+00'),
	(786, 1, 'Authorized Admin Fee b180574b-5106-49e2-b62d-8efea44b1d02', 'Service', 500.00, true, 'Annual', '2025-11-05 21:20:43.726137+00'),
	(437, 1, 'Authorized Admin Fee ac0999c8-892f-4879-ad1b-48c123970af5', 'Service', 500.00, true, 'Annual', '2025-10-22 06:47:56.99319+00'),
	(444, 1, 'Authorized Admin Fee a6cd1d35-1a03-475b-85db-292259594c57', 'Service', 500.00, true, 'Annual', '2025-10-22 07:53:57.165753+00'),
	(793, 1, 'Authorized Admin Fee 1c8a5e7a-199a-452b-a22b-ddc6b68a974b', 'Service', 500.00, true, 'Annual', '2025-11-06 07:12:00.984012+00'),
	(801, 1, 'Authorized Admin Fee e67efe35-7108-471a-a04d-e8960a072a56', 'Service', 500.00, true, 'Annual', '2025-11-06 07:29:59.864528+00'),
	(395, 1, 'Authorized Admin Fee d2b6a5d1-21ea-4a64-a5f5-4145bbafb783', 'Service', 500.00, true, 'Annual', '2025-10-21 14:19:02.988018+00'),
	(728, 1, 'Authorized Admin Fee 41f91273-2587-4a1c-953e-6da4c8495ef4', 'Service', 500.00, true, 'Annual', '2025-11-05 18:05:23.327971+00'),
	(521, 1, 'Authorized Admin Fee 0a81be05-9fd0-403e-b0c8-b034a6fd1fbc', 'Service', 500.00, true, 'Annual', '2025-10-23 12:31:48.966334+00'),
	(638, 1, 'Authorized Admin Fee 6d5c8fd0-03d0-4284-8ce0-12793a4b2e82', 'Service', 500.00, true, 'Annual', '2025-11-05 12:50:43.220448+00'),
	(465, 1, 'Authorized Admin Fee 34603bdf-99d3-48f6-ad34-157fa07c0e5a', 'Service', 500.00, true, 'Annual', '2025-10-22 09:48:40.639314+00'),
	(647, 1, 'Authorized Admin Fee 26afffdc-e869-496f-9fe5-d2f06bd40cd4', 'Service', 500.00, true, 'Annual', '2025-11-05 13:37:00.024326+00'),
	(529, 1, 'Authorized Admin Fee 9208a140-16a7-4d35-bd2b-9cf645e2e474', 'Service', 500.00, true, 'Annual', '2025-10-24 11:26:39.015685+00'),
	(748, 1, 'Authorized Admin Fee 6adfdd9f-3b77-4665-ab52-729d628618ae', 'Service', 500.00, true, 'Annual', '2025-11-05 18:15:47.429139+00'),
	(662, 1, 'Authorized Admin Fee 8a98066b-b502-441e-bf12-609ddd118b83', 'Service', 500.00, true, 'Annual', '2025-11-05 14:43:02.909978+00'),
	(556, 1, 'Authorized Admin Fee eedc8f93-cadd-4972-9d6c-5b17de71ea70', 'Service', 500.00, true, 'Annual', '2025-11-01 13:13:21.61908+00'),
	(564, 1, 'Authorized Admin Fee 38606625-5448-47d8-a2b1-3f97a6fd2ca5', 'Service', 500.00, true, 'Annual', '2025-11-01 16:36:22.98148+00'),
	(761, 1, 'Authorized Admin Fee 89635918-eefc-4588-8f47-b16350f961c8', 'Service', 500.00, true, 'Annual', '2025-11-05 19:35:02.450557+00'),
	(588, 1, 'Authorized Admin Fee eedc4310-dcfc-416c-bef1-dd9d3c49ad4a', 'Service', 500.00, true, 'Annual', '2025-11-04 13:35:15.558432+00'),
	(836, 1, 'Authorized Admin Fee 10156997-5800-4a44-90ad-eacb4ee8a35b', 'Service', 500.00, true, 'Annual', '2025-11-06 12:54:01.557417+00'),
	(843, 1, 'Authorized Admin Fee f8af0302-c15d-44ed-a996-beb80cdce1d1', 'Service', 500.00, true, 'Annual', '2025-11-06 13:04:23.368989+00'),
	(850, 1, 'Authorized Admin Fee bf5dc4a4-cd36-474b-8fd3-e9dc2dd4ee98', 'Service', 500.00, true, 'Annual', '2025-11-06 13:31:23.340766+00'),
	(857, 1, 'Authorized Admin Fee 471454fd-5372-4459-b388-b3539c23050d', 'Service', 500.00, true, 'Annual', '2025-11-06 13:56:46.41145+00'),
	(409, 1, 'Authorized Admin Fee c1436a5f-e469-4036-935f-227b8d3cb471', 'Service', 500.00, true, 'Annual', '2025-10-21 21:44:10.458453+00'),
	(486, 1, 'Authorized Admin Fee 509525b0-9536-4766-b0dd-c62c0c3e354a', 'Service', 500.00, true, 'Annual', '2025-10-23 05:36:26.042425+00'),
	(328, 1, 'Authorized Admin Fee de836c2f-78a9-4be6-acc9-592244593ebc', 'Service', 500.00, true, 'Annual', '2025-10-20 10:07:49.885784+00'),
	(493, 1, 'Authorized Admin Fee 15f1d98f-a7c1-47e2-b373-3f40e668b287', 'Service', 500.00, true, 'Annual', '2025-10-23 06:05:04.462285+00'),
	(346, 1, 'Authorized Admin Fee 4e95bf47-f96f-4cc1-859c-e823fa79b908', 'Service', 500.00, true, 'Annual', '2025-10-20 12:13:58.93735+00'),
	(557, 1, 'Authorized Admin Fee bcb62c62-c96f-46fb-bdfe-8ebc8a032490', 'Service', 500.00, true, 'Annual', '2025-11-01 13:21:07.278027+00'),
	(626, 1, 'Authorized Admin Fee 5f926056-56dc-49ff-913b-d874585eb02a', 'Service', 500.00, true, 'Annual', '2025-11-05 01:52:32.530838+00'),
	(631, 1, 'Authorized Admin Fee 71553ebd-ffec-40fb-a307-fca62ba89bf7', 'Service', 500.00, true, 'Annual', '2025-11-05 04:33:05.794153+00'),
	(367, 1, 'Authorized Admin Fee 867d49f0-8416-4a11-a2e7-4e92bd513573', 'Service', 500.00, true, 'Annual', '2025-10-20 18:26:35.751373+00'),
	(514, 1, 'Authorized Admin Fee f14f93c8-8db0-41ab-a5be-7554feb7abf4', 'Service', 500.00, true, 'Annual', '2025-10-23 06:59:37.767278+00'),
	(578, 1, 'Authorized Admin Fee 61351818-59f5-4a48-9d74-6253640fe2bf', 'Service', 500.00, true, 'Annual', '2025-11-04 09:25:30.998984+00'),
	(388, 1, 'Authorized Admin Fee b716b457-984a-4cfb-ba6a-b80225b5aade', 'Service', 500.00, true, 'Annual', '2025-10-21 10:31:00.06836+00'),
	(794, 1, 'Authorized Admin Fee 306eee22-1a99-462d-8a4e-6a2211cc52f5', 'Service', 500.00, true, 'Annual', '2025-11-06 07:22:11.444686+00'),
	(458, 1, 'Authorized Admin Fee 9d09ebbf-06bb-4270-ba38-5c5a1683bc0d', 'Service', 500.00, true, 'Annual', '2025-10-22 09:29:20.584052+00'),
	(530, 1, 'Authorized Admin Fee 5dd80832-224c-4398-ada6-8f06182af96c', 'Service', 500.00, true, 'Annual', '2025-10-24 11:26:45.566343+00'),
	(589, 1, 'Authorized Admin Fee 13307c65-6c31-45d0-8fe0-3f96199da649', 'Service', 500.00, true, 'Annual', '2025-11-04 13:42:09.456531+00'),
	(721, 1, 'Authorized Admin Fee 13891251-ed6f-4704-a56b-ad22aff68eba', 'Service', 500.00, true, 'Annual', '2025-11-05 17:55:30.117798+00'),
	(597, 1, 'Authorized Admin Fee 307c3a45-b856-4146-b46d-5961ee6b4396', 'Service', 500.00, true, 'Annual', '2025-11-04 15:13:03.123817+00'),
	(657, 1, 'Authorized Admin Fee 973b9eae-3a87-4740-96aa-f14e4fcd95ba', 'Service', 500.00, true, 'Annual', '2025-11-05 14:25:09.579574+00'),
	(808, 1, 'Authorized Admin Fee 73d06874-5538-487b-b50a-9408c59c0682', 'Service', 500.00, true, 'Annual', '2025-11-06 07:37:12.97816+00'),
	(672, 1, 'Authorized Admin Fee 6742ef06-b452-45e3-8ecf-44554e56fb4b', 'Service', 500.00, true, 'Annual', '2025-11-05 16:33:10.495538+00'),
	(677, 1, 'Authorized Admin Fee e64ce3a8-690a-494b-96d5-b81dcc92d34b', 'Service', 500.00, true, 'Annual', '2025-11-05 16:46:30.24927+00'),
	(682, 1, 'Authorized Admin Fee 154033cd-1ecd-4171-b0c4-e2a83bdb0401', 'Service', 500.00, true, 'Annual', '2025-11-05 17:15:46.389126+00'),
	(687, 1, 'Authorized Admin Fee cbc916ad-ae71-44e7-ac66-7f8e6dbde71a', 'Service', 500.00, true, 'Annual', '2025-11-05 17:23:15.644451+00'),
	(815, 1, 'Authorized Admin Fee 7f2b0e9b-373f-463d-90a8-1447d30e83e3', 'Service', 500.00, true, 'Annual', '2025-11-06 11:15:09.969957+00'),
	(822, 1, 'Authorized Admin Fee c97d3335-c03d-4892-bfe3-7b2505601179', 'Service', 500.00, true, 'Annual', '2025-11-06 11:53:08.501193+00'),
	(829, 1, 'Authorized Admin Fee 4339386f-1893-43d1-af53-d59925217328', 'Service', 500.00, true, 'Annual', '2025-11-06 12:19:34.729126+00'),
	(749, 1, 'Authorized Admin Fee e1009257-f3d9-4ab0-ac10-b52a8a29c13e', 'Service', 500.00, true, 'Annual', '2025-11-05 18:22:50.034705+00'),
	(756, 1, 'Authorized Admin Fee bcd035e2-3a08-4f95-98d4-c3db43b90847', 'Service', 500.00, true, 'Annual', '2025-11-05 19:23:44.243198+00'),
	(770, 1, 'Authorized Admin Fee 60b0173e-8f42-436c-b0c7-2d2c372e4749', 'Service', 500.00, true, 'Annual', '2025-11-05 20:06:02.769159+00');


--
-- Data for Name: class_fee_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."class_fee_structure" ("id", "class_id", "component_id", "academic_year_id", "amount") VALUES
	(108, 11, 138, 1, 30000.00),
	(109, 11, 139, 1, 5000.00),
	(110, 11, 140, 1, 500.00),
	(139, 11, 242, 1, 8000.00),
	(140, 11, 243, 1, 2000.00);


--
-- Data for Name: streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."streams" ("id", "school_id", "code", "name", "description", "is_active") VALUES
	(1, 1, 'SCI', 'Science', NULL, NULL),
	(2, 1, 'COM', 'Commerce', NULL, NULL),
	(3, 1, 'ART', 'Arts', NULL, NULL),
	(4, 2, 'SCI', 'Science Stream', 'Physics, Chemistry, Biology/Math', true),
	(5, 2, 'COM', 'Commerce Stream', 'Accountancy, Business Studies, Economics', true),
	(6, 2, 'ART', 'Arts Stream', 'History, Political Science, Economics', true);


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subjects" ("subject_id", "school_id", "name", "short_code", "description", "category", "is_active", "created_at", "updated_at") VALUES
	(2, 1, 'Mathematics', 'MATH', NULL, 'Core', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(3, 1, 'Science', 'SCI', NULL, 'Core', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(4, 1, 'Social Studies', 'SST', NULL, 'Core', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(5, 1, 'Kannada', 'KAN', NULL, 'Language', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(6, 1, 'Hindi', 'HIN', NULL, 'Language', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(7, 1, 'Computer Science', 'COMP', NULL, 'Skill-Based', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(8, 1, 'Art & Craft', 'ART', NULL, 'Arts', true, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(1508, 1, 'test', 'tst', 'test', 'test', true, '2025-10-24 12:25:39.192445+00', '2025-10-24 12:25:39.192445+00'),
	(487, 2, 'Mathematics', 'MATH', 'Core Mathematics', 'Core', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(1, 1, 'test', 'tst', 'test beka ', 'test', false, '2025-09-22 18:27:34.720369+00', '2025-09-22 18:27:34.720369+00'),
	(488, 2, 'English Language', 'ENG', 'English Language & Literature', 'Core', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(489, 2, 'Science', 'SCI', 'General Science', 'Core', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(490, 2, 'Social Studies', 'SS', 'History, Geography, Civics', 'Core', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(491, 2, 'Hindi', 'HIN', 'Hindi Language', 'Language', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(372, 0, 'Forbidden Subject', NULL, NULL, NULL, true, '2025-10-08 07:29:00.48824+00', '2025-10-08 07:29:00.48824+00'),
	(492, 2, 'Physics', 'PHY', 'Physics for Higher Classes', 'Science', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(493, 2, 'Chemistry', 'CHEM', 'Chemistry for Higher Classes', 'Science', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(494, 2, 'Biology', 'BIO', 'Biology for Higher Classes', 'Science', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(495, 2, 'Computer Science', 'CS', 'Programming and IT', 'Elective', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(496, 2, 'Physical Education', 'PE', 'Sports and Fitness', 'Co-curricular', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(497, 2, 'Art & Craft', 'ART', 'Visual Arts', 'Co-curricular', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(498, 2, 'Music', 'MUS', 'Vocal and Instrumental Music', 'Co-curricular', true, '2025-10-11 07:14:00.516289+00', '2025-10-11 07:14:00.516289+00'),
	(499, 2, 'Mathematics', 'MATH', 'Core Mathematics', 'Core', true, '2025-10-11 09:32:06.760311+00', '2025-10-11 09:32:06.760311+00');


--
-- Data for Name: class_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."class_subjects" ("id", "class_id", "subject_id", "is_elective", "stream_id") VALUES
	(69, 11, 1, false, NULL),
	(70, 11, 2, false, NULL),
	(71, 11, 3, false, NULL),
	(72, 11, 5, false, NULL),
	(73, 11, 8, false, NULL),
	(74, 12, 1, false, NULL),
	(75, 12, 2, false, NULL),
	(76, 12, 3, false, NULL),
	(77, 12, 5, false, NULL),
	(78, 12, 8, false, NULL),
	(79, 13, 1, false, NULL),
	(80, 13, 2, false, NULL),
	(81, 13, 3, false, NULL),
	(82, 13, 5, false, NULL),
	(83, 13, 8, false, NULL),
	(84, 14, 1, false, NULL),
	(85, 14, 2, false, NULL),
	(86, 14, 3, false, NULL),
	(87, 14, 5, false, NULL),
	(88, 14, 8, false, NULL),
	(89, 15, 1, false, NULL),
	(90, 15, 2, false, NULL),
	(91, 15, 3, false, NULL),
	(92, 15, 4, false, NULL),
	(93, 15, 5, false, NULL),
	(94, 15, 6, false, NULL),
	(95, 15, 7, false, NULL),
	(96, 15, 8, false, NULL),
	(97, 16, 1, false, NULL),
	(98, 16, 2, false, NULL),
	(99, 16, 3, false, NULL),
	(100, 16, 4, false, NULL),
	(101, 16, 5, false, NULL),
	(102, 16, 6, false, NULL),
	(103, 16, 7, false, NULL),
	(104, 16, 8, false, NULL),
	(105, 17, 1, false, NULL),
	(106, 17, 2, false, NULL),
	(107, 17, 3, false, NULL),
	(108, 17, 4, false, NULL),
	(109, 17, 5, false, NULL),
	(110, 17, 6, false, NULL),
	(111, 17, 7, false, NULL),
	(112, 17, 8, false, NULL),
	(113, 18, 1, false, NULL),
	(114, 18, 2, false, NULL),
	(115, 18, 3, false, NULL),
	(116, 18, 4, false, NULL),
	(117, 18, 5, false, NULL),
	(118, 18, 6, false, NULL),
	(119, 18, 7, false, NULL),
	(120, 18, 8, false, NULL),
	(121, 19, 1, false, NULL),
	(122, 19, 2, false, NULL),
	(123, 19, 3, false, NULL),
	(124, 19, 4, false, NULL),
	(125, 19, 5, false, NULL),
	(126, 19, 6, false, NULL),
	(127, 19, 7, false, NULL),
	(128, 19, 8, false, NULL),
	(129, 20, 1, false, NULL),
	(130, 20, 2, false, NULL),
	(131, 20, 3, false, NULL),
	(132, 20, 4, false, NULL),
	(133, 20, 5, false, NULL),
	(134, 20, 6, false, NULL),
	(135, 20, 7, false, NULL),
	(136, 20, 8, false, NULL),
	(263, 673, 1, false, NULL),
	(264, 673, 2, false, NULL),
	(265, 673, 3, false, NULL);


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."clubs" ("id", "school_id", "teacher_in_charge_id", "assistant_teacher_id", "academic_year_id", "name", "description", "club_type", "logo_url", "meeting_schedule", "meeting_frequency", "max_members", "current_member_count", "registration_open", "registration_start_date", "registration_end_date", "club_rules", "objectives", "is_active", "created_at", "updated_at") VALUES
	(169, 1, 11, NULL, 1327, 'Science-ea02de', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 19:19:05.381913+00', '2025-11-06 19:19:05.381913+00'),
	(7, 1, 16, 17, 1327, 'Drama & Theatre Club', 'Acting, stage performance, and theatrical productions', 'arts', NULL, '{"day": "Monday", "room": "Auditorium", "time": "15:00"}', 'weekly', 30, 0, true, '2025-06-01', '2025-06-30', 'Memorize scripts. Attend all rehearsals. Perform in annual day.', '["Stage 2-3 plays annually", "Develop public speaking", "Build confidence"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:04:39.793825+00'),
	(8, 1, 17, NULL, 1327, 'Music Club', 'Vocal and instrumental music training', 'arts', NULL, '{"day": "Friday", "room": "Music Room", "time": "15:00"}', 'weekly', 25, 0, true, '2025-06-01', '2025-06-30', 'Practice daily. Participate in competitions. Respect instruments.', '["Learn various musical instruments", "Participate in music competitions", "Perform at school events"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:04:39.793825+00'),
	(9, 1, 14, NULL, 1327, 'Debate Society', 'Develop critical thinking and public speaking skills', 'academic', NULL, '{"day": "Tuesday", "room": "Conference Hall", "time": "15:30"}', 'biweekly', 20, 0, true, '2025-06-01', '2025-06-30', 'Research topics thoroughly. Respect opposing viewpoints.', '["Master debate techniques", "Win inter-school competitions", "Build communication skills"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:04:39.793825+00'),
	(10, 1, 15, NULL, 1327, 'Eco Warriors Club', 'Environmental awareness and sustainability initiatives', 'social', NULL, '{"day": "Saturday", "room": "School Garden", "time": "10:00"}', 'biweekly', 35, 0, true, '2025-06-01', '2025-07-31', 'Participate in all environmental activities. Lead by example.', '["Promote environmental awareness", "Conduct cleanliness drives", "Plant trees and maintain garden"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:04:39.793825+00'),
	(11, 1, 11, NULL, 1327, 'Student Leadership Council', 'School governance and leadership development', 'social', NULL, '{"day": "Friday", "room": "Principal Office", "time": "14:00"}', 'monthly', 15, 0, false, '2025-06-01', '2025-06-15', 'Selection based on leadership qualities. Represent student voice.', '["Bridge students and administration", "Organize school events", "Resolve student issues"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:04:39.793825+00'),
	(12, 1, 18, NULL, 1327, 'Robotics Club', 'Build and program robots for competitions', 'technical', NULL, '{"day": "Thursday", "room": "STEM Lab", "time": "15:30"}', 'weekly', 20, 0, true, '2025-06-01', '2025-06-30', 'Handle equipment carefully. Work in teams. Complete projects on time.', '["Learn robotics fundamentals", "Participate in competitions", "Build innovative robots"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:04:39.793825+00'),
	(65, 1, 11, NULL, 1327, 'Music-85392d', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:34:40.066966+00', '2025-11-05 19:34:40.066966+00'),
	(66, 1, 11, NULL, 1327, 'Science-2266d5', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:34:45.727629+00', '2025-11-05 19:34:45.727629+00'),
	(67, 1, 11, NULL, 1327, 'Eco-7d3882', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:34:57.631077+00', '2025-11-05 19:34:57.631077+00'),
	(1, 1, 13, 12, 1327, 'Math Wizards Club', 'For students passionate about mathematics and problem-solving', 'academic', NULL, '{"day": "Monday", "room": "Math Lab", "time": "15:30"}', 'weekly', 25, 4, true, '2025-06-01', '2025-06-30', 'Regular attendance required. Participate in math competitions.', '["Foster mathematical thinking", "Prepare for Olympiads", "Conduct peer learning sessions"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:08:40.206028+00'),
	(142, 1, 11, NULL, 1327, 'Arts-4ec6da', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:58:56.608459+00', '2025-11-06 12:58:58.969734+00'),
	(2, 1, 20, 12, 1327, 'Science Explorers', 'Hands-on science experiments and innovation projects', 'academic', NULL, '{"day": "Wednesday", "room": "Science Lab", "time": "15:30"}', 'weekly', 30, 4, true, '2025-06-01', '2025-06-30', 'Safety rules must be followed in lab. Attendance minimum 80%.', '["Encourage scientific inquiry", "Build innovative projects", "Participate in science fairs"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:08:40.206028+00'),
	(143, 1, 11, NULL, 1327, 'Music-5bd7bf', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:59:00.267199+00', '2025-11-06 12:59:00.267199+00'),
	(144, 1, 11, NULL, 1327, 'Science-730491', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:59:00.841697+00', '2025-11-06 12:59:01.515388+00'),
	(145, 1, 11, NULL, 1327, 'Eco-db62c2', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:59:02.033234+00', '2025-11-06 12:59:02.033234+00'),
	(146, 1, 11, NULL, 1327, 'Science-e4c12f', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:59:03.736352+00', '2025-11-06 12:59:03.736352+00'),
	(148, 1, 11, NULL, 1327, 'Arts-a41267', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:02:53.996456+00', '2025-11-06 13:03:05.850974+00'),
	(149, 1, 11, NULL, 1327, 'Science-c1243f', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:03:14.258049+00', '2025-11-06 13:03:17.875515+00'),
	(152, 1, 11, NULL, 1327, 'Eco-1b629e', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:03:53.108505+00', '2025-11-06 13:03:53.108505+00'),
	(23, 1, 11, NULL, 1327, 'Arts-a05119', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 1, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:23:16.688218+00', '2025-11-04 18:23:17.587412+00'),
	(3, 1, 18, NULL, 1327, 'Coding Club', 'Learn programming and build amazing applications', 'technical', NULL, '{"day": "Friday", "room": "Computer Lab", "time": "15:30"}', 'weekly', 20, 4, true, '2025-06-01', '2025-06-30', 'Bring your own laptop if possible. Complete weekly coding challenges.', '["Learn multiple programming languages", "Build real-world projects", "Participate in hackathons"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:08:40.206028+00'),
	(24, 1, 11, NULL, 1327, 'Music-f5ebc0', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:23:42.724849+00', '2025-11-04 18:23:42.724849+00'),
	(25, 1, 11, NULL, 1327, 'Science-369dca', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:23:51.112965+00', '2025-11-04 18:23:51.112965+00'),
	(4, 1, 12, NULL, 1327, 'Cricket Academy', 'Professional cricket training and tournaments', 'sports', NULL, '{"day": "Tuesday", "room": "Sports Ground", "time": "16:00"}', 'biweekly', 35, 4, true, '2025-06-01', '2025-07-15', 'Physical fitness mandatory. Regular practice attendance required.', '["Develop cricket skills", "Participate in inter-school matches", "Build teamwork"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:08:40.206028+00'),
	(26, 1, 11, NULL, 1327, 'Eco-741c56', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:24:09.321287+00', '2025-11-04 18:24:09.321287+00'),
	(5, 1, 15, NULL, 1327, 'Athletics Club', 'Track and field events training', 'sports', NULL, '{"day": "Thursday", "room": "Running Track", "time": "16:00"}', 'weekly', 40, 3, true, '2025-06-01', '2025-07-15', 'Regular stamina building exercises. Represent school in competitions.', '["Improve athletic performance", "Participate in district meets", "Promote healthy lifestyle"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:08:40.206028+00'),
	(6, 1, 19, NULL, 1327, 'Art & Craft Club', 'Explore various art forms and creative expression', 'arts', NULL, '{"day": "Wednesday", "room": "Art Room", "time": "15:00"}', 'weekly', 25, 1, true, '2025-06-01', '2025-06-30', 'Bring basic art supplies. Respect others creative work.', '["Develop artistic skills", "Organize art exhibitions", "Learn different art techniques"]', true, '2025-11-03 12:04:39.793825+00', '2025-11-03 12:08:40.206028+00'),
	(14, 1, 11, NULL, 1327, 'Arts-99965b', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 1, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:16:53.151625+00', '2025-11-04 18:16:54.171125+00'),
	(15, 1, 11, NULL, 1327, 'Science-cd49ba', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:17:24.957886+00', '2025-11-04 18:17:24.957886+00'),
	(16, 1, 11, NULL, 1327, 'Eco-ae8b56', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:17:45.807763+00', '2025-11-04 18:17:45.807763+00'),
	(19, 1, 11, NULL, 1327, 'Music-926f74', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:20:08.739824+00', '2025-11-04 18:20:08.739824+00'),
	(20, 1, 11, NULL, 1327, 'Science-366f4c', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:20:17.50113+00', '2025-11-04 18:20:17.50113+00'),
	(21, 1, 11, NULL, 1327, 'Eco-c34dbc', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:20:36.026575+00', '2025-11-04 18:20:36.026575+00'),
	(28, 1, 11, NULL, 1327, 'Arts-a753a9', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 1, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:25:34.925721+00', '2025-11-04 18:25:35.860452+00'),
	(29, 1, 11, NULL, 1327, 'Music-c15929', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:26:01.64537+00', '2025-11-04 18:26:01.64537+00'),
	(30, 1, 11, NULL, 1327, 'Science-5eab42', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:26:09.881343+00', '2025-11-04 18:26:09.881343+00'),
	(31, 1, 11, NULL, 1327, 'Eco-ad469b', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:26:28.446963+00', '2025-11-04 18:26:28.446963+00'),
	(33, 1, 11, NULL, 1327, 'Arts-15c5e3', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 1, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:28:01.693251+00', '2025-11-04 18:28:02.724294+00'),
	(34, 1, 11, NULL, 1327, 'Music-ea3ff6', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:28:31.595467+00', '2025-11-04 18:28:31.595467+00'),
	(35, 1, 11, NULL, 1327, 'Science-49a573', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:28:39.997106+00', '2025-11-04 18:28:39.997106+00'),
	(36, 1, 11, NULL, 1327, 'Eco-99f05c', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:28:58.993051+00', '2025-11-04 18:28:58.993051+00'),
	(37, 1, 11, NULL, 1327, 'Arts-c4f351', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 1, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:29:55.344051+00', '2025-11-04 18:29:56.422189+00'),
	(38, 1, 11, NULL, 1327, 'Arts-0ec5ae', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:31:26.487258+00', '2025-11-04 18:31:37.97793+00'),
	(40, 1, 11, NULL, 1327, 'Arts-ce371c', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:32:35.852812+00', '2025-11-04 18:32:47.368265+00'),
	(41, 1, 11, NULL, 1327, 'Music-c06944', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:33:09.978502+00', '2025-11-04 18:33:09.978502+00'),
	(42, 1, 11, NULL, 1327, 'Science-015457', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:33:18.20491+00', '2025-11-04 18:33:18.20491+00'),
	(43, 1, 11, NULL, 1327, 'Eco-d7d06f', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:33:35.976563+00', '2025-11-04 18:33:35.976563+00'),
	(45, 1, 11, NULL, 1327, 'Music-ed532b', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:07:46.273989+00', '2025-11-05 19:07:46.273989+00'),
	(51, 1, 11, NULL, 1327, 'Science-23917f', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:13:09.432711+00', '2025-11-05 19:13:09.432711+00'),
	(46, 1, 11, NULL, 1327, 'Science-bc4136', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:07:49.481817+00', '2025-11-05 19:07:49.481817+00'),
	(44, 1, 11, NULL, 1327, 'Arts-1361d7', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:07:46.248806+00', '2025-11-05 19:07:56.34295+00'),
	(47, 1, 11, NULL, 1327, 'Eco-b09e91', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:08:04.417893+00', '2025-11-05 19:08:04.417893+00'),
	(50, 1, 11, NULL, 1327, 'Music-e38b9a', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:13:02.28822+00', '2025-11-05 19:13:02.28822+00'),
	(49, 1, 11, NULL, 1327, 'Arts-d9814e', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:13:01.988983+00', '2025-11-05 19:13:11.937389+00'),
	(52, 1, 11, NULL, 1327, 'Eco-0a8f54', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:13:19.928452+00', '2025-11-05 19:13:19.928452+00'),
	(55, 1, 11, NULL, 1327, 'Music-e3a012', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:16:03.421318+00', '2025-11-05 19:16:03.421318+00'),
	(56, 1, 11, NULL, 1327, 'Science-2d328d', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:16:10.87242+00', '2025-11-05 19:16:10.87242+00'),
	(54, 1, 11, NULL, 1327, 'Arts-a78fa3', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:16:03.391107+00', '2025-11-05 19:16:13.124671+00'),
	(57, 1, 11, NULL, 1327, 'Eco-3071eb', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:16:21.131177+00', '2025-11-05 19:16:21.131177+00'),
	(59, 1, 11, NULL, 1327, 'Arts-0b3164', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:22:55.707669+00', '2025-11-05 19:23:05.519916+00'),
	(60, 1, 11, NULL, 1327, 'Music-a24ae5', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:23:21.573841+00', '2025-11-05 19:23:21.573841+00'),
	(61, 1, 11, NULL, 1327, 'Science-792898', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:23:27.052392+00', '2025-11-05 19:23:27.052392+00'),
	(62, 1, 11, NULL, 1327, 'Eco-950c62', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:23:39.137491+00', '2025-11-05 19:23:39.137491+00'),
	(64, 1, 11, NULL, 1327, 'Arts-f6b8f0', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 19:34:14.541236+00', '2025-11-05 19:34:24.212611+00'),
	(72, 1, 11, NULL, 1327, 'Eco-94c2c5', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:05:58.193768+00', '2025-11-05 20:05:58.193768+00'),
	(69, 1, 11, NULL, 1327, 'Arts-8d8999', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:05:15.806458+00', '2025-11-05 20:05:25.622102+00'),
	(70, 1, 11, NULL, 1327, 'Music-728dd8', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:05:41.207577+00', '2025-11-05 20:05:41.207577+00'),
	(71, 1, 11, NULL, 1327, 'Science-912b87', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:05:46.552913+00', '2025-11-05 20:05:46.552913+00'),
	(18, 1, 11, NULL, 1327, 'Arts-51e890', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-04 18:19:40.737986+00', '2025-11-06 09:02:33.411294+00'),
	(166, 1, 11, NULL, 1327, 'Arts-b4f3b4', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 19:18:23.942654+00', '2025-11-06 19:18:35.590008+00'),
	(101, 1, 11, NULL, 1327, 'Music-315534', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:37:05.596617+00', '2025-11-06 07:37:05.596617+00'),
	(74, 1, 11, NULL, 1327, 'Arts-45c923', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:52:52.135523+00', '2025-11-05 20:53:02.148843+00'),
	(75, 1, 11, NULL, 1327, 'Music-1bd77e', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:53:18.235743+00', '2025-11-05 20:53:18.235743+00'),
	(76, 1, 11, NULL, 1327, 'Science-7cc160', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:53:24.465437+00', '2025-11-05 20:53:24.465437+00'),
	(77, 1, 11, NULL, 1327, 'Eco-0ec5e5', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 20:53:37.094046+00', '2025-11-05 20:53:37.094046+00'),
	(78, 1, 11, NULL, 1327, 'STEM-518a66', 'Robotics competitions and STEM outreach', 'technical', NULL, '{"time": "15:30", "weekday": "Friday"}', 'weekly', 30, 0, true, NULL, NULL, NULL, '["Compete in robotics challenges", "Mentor junior students"]', true, '2025-11-05 21:08:44.460427+00', '2025-11-05 21:08:44.460427+00'),
	(168, 1, 11, NULL, 1327, 'Music-249625', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 19:18:59.582815+00', '2025-11-06 19:18:59.582815+00'),
	(102, 1, 11, NULL, 1327, 'Science-9b3dfb', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:37:06.381706+00', '2025-11-06 07:37:06.381706+00'),
	(80, 1, 11, NULL, 1327, 'Arts-8626c0', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 21:20:33.085012+00', '2025-11-05 21:20:34.81797+00'),
	(81, 1, 11, NULL, 1327, 'Music-c162b8', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 21:20:36.594136+00', '2025-11-05 21:20:36.594136+00'),
	(82, 1, 11, NULL, 1327, 'Science-55808f', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 21:20:37.39389+00', '2025-11-05 21:20:37.39389+00'),
	(83, 1, 11, NULL, 1327, 'Eco-5b50a6', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-05 21:20:39.722225+00', '2025-11-05 21:20:39.722225+00'),
	(103, 1, 11, NULL, 1327, 'Eco-304d00', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:37:08.611494+00', '2025-11-06 07:37:08.611494+00'),
	(85, 1, 11, NULL, 1327, 'Arts-f5ace0', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:11:48.753673+00', '2025-11-06 07:11:50.493919+00'),
	(86, 1, 11, NULL, 1327, 'Music-f7b556', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:11:52.993451+00', '2025-11-06 07:11:52.993451+00'),
	(87, 1, 11, NULL, 1327, 'Science-259f42', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:11:53.829051+00', '2025-11-06 07:11:53.829051+00'),
	(88, 1, 11, NULL, 1327, 'Eco-a71181', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:11:56.334851+00', '2025-11-06 07:11:56.334851+00'),
	(90, 1, 11, NULL, 1327, 'Arts-e2e595', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:22:00.343683+00', '2025-11-06 07:22:01.984488+00'),
	(91, 1, 11, NULL, 1327, 'Music-61cb78', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:22:03.900528+00', '2025-11-06 07:22:03.900528+00'),
	(92, 1, 11, NULL, 1327, 'Science-f75482', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:22:04.691509+00', '2025-11-06 07:22:04.691509+00'),
	(93, 1, 11, NULL, 1327, 'Eco-01ea0e', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:22:07.031325+00', '2025-11-06 07:22:07.031325+00'),
	(115, 1, 11, NULL, 1327, 'Eco-1e6f23', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 10:56:40.573854+00', '2025-11-06 10:56:40.573854+00'),
	(95, 1, 11, NULL, 1327, 'Arts-ae1511', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:29:49.520157+00', '2025-11-06 07:29:51.064685+00'),
	(96, 1, 11, NULL, 1327, 'Music-fead1f', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:29:53.002023+00', '2025-11-06 07:29:53.002023+00'),
	(97, 1, 11, NULL, 1327, 'Science-6c6b7f', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:29:53.782976+00', '2025-11-06 07:29:53.782976+00'),
	(98, 1, 11, NULL, 1327, 'Eco-7b8091', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:29:55.922448+00', '2025-11-06 07:29:55.922448+00'),
	(100, 1, 11, NULL, 1327, 'Arts-b27bbc', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 07:37:02.113565+00', '2025-11-06 07:37:03.693274+00'),
	(107, 1, 11, NULL, 1327, 'Science-4291a0', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 09:29:56.081291+00', '2025-11-06 09:29:56.622757+00'),
	(108, 1, 11, NULL, 1327, 'Music-03cc22', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 09:29:57.645705+00', '2025-11-06 09:29:57.645705+00'),
	(106, 1, 11, NULL, 1327, 'Arts-4c063b', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 09:29:56.065938+00', '2025-11-06 09:29:57.785632+00'),
	(109, 1, 11, NULL, 1327, 'Eco-d1e7d1', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 09:29:57.910453+00', '2025-11-06 09:29:57.910453+00'),
	(110, 1, 11, NULL, 1327, 'Science-dcd29c', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 09:29:58.860792+00', '2025-11-06 09:29:58.860792+00'),
	(116, 1, 11, NULL, 1327, 'Science-d1fb2f', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 10:56:44.343409+00', '2025-11-06 10:56:44.89399+00'),
	(112, 1, 11, NULL, 1327, 'Arts-695ce8', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 10:56:32.172406+00', '2025-11-06 10:56:34.252079+00'),
	(113, 1, 11, NULL, 1327, 'Music-9d14ed', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 10:56:35.527136+00', '2025-11-06 10:56:35.527136+00'),
	(114, 1, 11, NULL, 1327, 'Science-c224eb', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 10:56:37.248435+00', '2025-11-06 10:56:37.248435+00'),
	(124, 1, 11, NULL, 1327, 'Arts-40a7d5', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:51:37.428145+00', '2025-11-06 11:51:49.380754+00'),
	(118, 1, 11, NULL, 1327, 'Arts-b3ae6e', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:14:55.584496+00', '2025-11-06 11:14:57.313131+00'),
	(119, 1, 11, NULL, 1327, 'Science-bef3f9', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:14:58.875685+00', '2025-11-06 11:14:59.396562+00'),
	(120, 1, 11, NULL, 1327, 'Music-4e4132', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:15:01.265754+00', '2025-11-06 11:15:01.265754+00'),
	(121, 1, 11, NULL, 1327, 'Science-4361ef', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:15:02.17005+00', '2025-11-06 11:15:02.17005+00'),
	(122, 1, 11, NULL, 1327, 'Eco-a7cac4', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:15:04.664847+00', '2025-11-06 11:15:04.664847+00'),
	(125, 1, 11, NULL, 1327, 'Science-308b42', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:51:57.536671+00', '2025-11-06 11:52:01.135903+00'),
	(126, 1, 11, NULL, 1327, 'Music-fef8c1', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:52:12.95731+00', '2025-11-06 11:52:12.95731+00'),
	(127, 1, 11, NULL, 1327, 'Science-6114da', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:52:19.050134+00', '2025-11-06 11:52:19.050134+00'),
	(128, 1, 11, NULL, 1327, 'Eco-762745', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 11:52:36.034716+00', '2025-11-06 11:52:36.034716+00'),
	(130, 1, 11, NULL, 1327, 'Arts-ff7570', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:19:38.897456+00', '2025-11-06 12:19:40.414737+00'),
	(131, 1, 11, NULL, 1327, 'Science-5e1cd5', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:19:41.453969+00', '2025-11-06 12:19:41.907959+00'),
	(132, 1, 11, NULL, 1327, 'Music-3834fe', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:19:44.036581+00', '2025-11-06 12:19:44.036581+00'),
	(133, 1, 11, NULL, 1327, 'Science-4ab60f', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:19:45.143228+00', '2025-11-06 12:19:45.143228+00'),
	(134, 1, 11, NULL, 1327, 'Eco-457a6c', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:19:47.887889+00', '2025-11-06 12:19:47.887889+00'),
	(138, 1, 11, NULL, 1327, 'Music-9c18db', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:53:10.27644+00', '2025-11-06 12:53:10.27644+00'),
	(136, 1, 11, NULL, 1327, 'Arts-cc81fc', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:52:35.085294+00', '2025-11-06 12:52:46.765991+00'),
	(139, 1, 11, NULL, 1327, 'Science-630bd1', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:53:16.384444+00', '2025-11-06 12:53:16.384444+00'),
	(137, 1, 11, NULL, 1327, 'Science-f7900f', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:52:54.915313+00', '2025-11-06 12:52:58.450323+00'),
	(140, 1, 11, NULL, 1327, 'Eco-b6ead4', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 12:53:33.306347+00', '2025-11-06 12:53:33.306347+00'),
	(150, 1, 11, NULL, 1327, 'Music-ad2d0a', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:03:30.16731+00', '2025-11-06 13:03:30.16731+00'),
	(151, 1, 11, NULL, 1327, 'Science-06619f', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:03:36.083978+00', '2025-11-06 13:03:36.083978+00'),
	(154, 1, 11, NULL, 1327, 'Arts-5734d3', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:29:43.083946+00', '2025-11-06 13:29:56.527661+00'),
	(167, 1, 11, NULL, 1327, 'Science-73920d', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 19:18:43.797262+00', '2025-11-06 19:18:47.385042+00'),
	(155, 1, 11, NULL, 1327, 'Science-06051d', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:30:05.900544+00', '2025-11-06 13:30:10.072743+00'),
	(156, 1, 11, NULL, 1327, 'Music-b78a65', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:30:24.240468+00', '2025-11-06 13:30:24.240468+00'),
	(157, 1, 11, NULL, 1327, 'Science-de50d5', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:30:30.858191+00', '2025-11-06 13:30:30.858191+00'),
	(158, 1, 11, NULL, 1327, 'Eco-e08880', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:30:50.706045+00', '2025-11-06 13:30:50.706045+00'),
	(170, 1, 11, NULL, 1327, 'Eco-fa2598', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 19:19:22.373456+00', '2025-11-06 19:19:22.373456+00'),
	(160, 1, 11, NULL, 1327, 'Arts-f964c2', 'Creative arts and performances', 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:55:17.603311+00', '2025-11-06 13:55:29.407478+00'),
	(161, 1, 11, NULL, 1327, 'Science-d643bc', 'Hands-on experiments', 'technical', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:55:37.735349+00', '2025-11-06 13:55:41.331635+00'),
	(162, 1, 11, NULL, 1327, 'Music-b05643', NULL, 'arts', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:55:53.340405+00', '2025-11-06 13:55:53.340405+00'),
	(163, 1, 11, NULL, 1327, 'Science-3020c1', 'Hands-on science experiments', 'academic', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:55:59.224202+00', '2025-11-06 13:55:59.224202+00'),
	(164, 1, 11, NULL, 1327, 'Eco-576a98', NULL, 'social', NULL, 'null', 'weekly', NULL, 0, true, NULL, NULL, NULL, '[]', true, '2025-11-06 13:56:16.202509+00', '2025-11-06 13:56:16.202509+00');


--
-- Data for Name: club_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."club_activities" ("id", "club_id", "student_id", "activity_name", "activity_type", "description", "scheduled_date", "start_time", "end_time", "venue", "attendance_mandatory", "max_participants", "budget_allocated", "status", "outcome_notes", "media_urls", "created_at", "updated_at") VALUES
	(1, 1, 26, 'Welcome Meeting', 'meeting', 'First meeting introductions', '2025-06-15', '15:30:00', '16:30:00', 'Math Lab', true, 25, 500.00, 'completed', 'All 15 members attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(2, 1, 33, 'Math Olympiad Workshop', 'workshop', 'Problem solving techniques', '2025-07-10', '14:00:00', '17:00:00', 'Math Lab', true, 25, 1500.00, 'completed', '18 students attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(3, 1, 26, 'Mental Math Competition', 'competition', 'Speed math challenge', '2025-08-05', '15:30:00', '17:00:00', 'Math Lab', true, 25, 800.00, 'completed', 'Aarav won first place', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(4, 1, 26, 'Problem Solving Session', 'meeting', 'Weekly practice', '2025-09-02', '15:30:00', '16:30:00', 'Math Lab', false, 25, 200.00, 'completed', '12 members present', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(5, 1, 33, 'Guest Lecture Math', 'event', 'Real world applications', '2025-09-20', '15:00:00', '16:30:00', 'Auditorium', false, 50, 2000.00, 'completed', '35 students attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(6, 1, 26, 'Puzzle Challenge', 'competition', 'Team puzzle solving', '2025-10-15', '15:30:00', '17:30:00', 'Math Lab', true, 25, 1000.00, 'completed', '5 teams participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(7, 1, 26, 'Math Fest Prep', 'project', 'Interschool preparation', '2025-11-10', '14:00:00', '17:00:00', 'Math Lab', true, 10, 3000.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(8, 1, 33, 'Math Magazine', 'project', 'Quarterly publication', '2025-11-25', '15:30:00', '17:00:00', 'Math Lab', false, 15, 2500.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(9, 1, 26, 'Math Exhibition', 'event', 'Year end showcase', '2026-03-15', '10:00:00', '14:00:00', 'School Hall', false, 100, 5000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(10, 2, 29, 'Science Orientation', 'meeting', 'Lab safety introduction', '2025-06-18', '15:30:00', '16:45:00', 'Science Lab', true, 30, 500.00, 'completed', '22 members enrolled', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(11, 2, 31, 'Volcano Experiment', 'workshop', 'Chemistry demonstration', '2025-07-22', '15:00:00', '17:00:00', 'Science Lab', true, 30, 1200.00, 'completed', '25 students participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(12, 2, 29, 'Solar System Models', 'workshop', 'Scale model building', '2025-08-12', '14:00:00', '17:00:00', 'Science Lab', false, 30, 2000.00, 'completed', '18 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(13, 2, 31, 'Science Fair Planning', 'meeting', 'Project brainstorming', '2025-08-28', '15:30:00', '16:30:00', 'Science Lab', true, 30, 300.00, 'completed', '20 members present', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(14, 2, 29, 'School Science Fair', 'competition', 'Annual exhibition', '2025-09-05', '09:00:00', '15:00:00', 'School Ground', false, 100, 8000.00, 'completed', '15 projects exhibited', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(15, 2, 31, 'Planetarium Trip', 'event', 'Educational visit', '2025-09-28', '09:00:00', '15:00:00', 'Nehru Planetarium', false, 30, 4500.00, 'completed', '28 students visited', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(16, 2, 29, 'Electronics Workshop', 'workshop', 'Circuit building basics', '2025-10-20', '14:00:00', '17:00:00', 'Science Lab', true, 25, 3000.00, 'completed', '22 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(17, 2, 31, 'Water Quality Project', 'project', 'Testing water samples', '2025-11-08', '15:30:00', '17:00:00', 'Science Lab', false, 20, 1500.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(18, 2, 29, 'Science Olympiad Prep', 'workshop', 'Competition preparation', '2025-11-22', '14:00:00', '17:30:00', 'Science Lab', true, 15, 2000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(19, 2, 31, 'Science Show', 'event', 'Interactive demonstrations', '2026-03-20', '11:00:00', '13:00:00', 'Auditorium', false, 200, 6000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(20, 3, 34, 'Coding Kickoff', 'meeting', 'Programming introduction', '2025-06-20', '15:30:00', '16:45:00', 'Computer Lab', true, 20, 500.00, 'completed', '16 members joined', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(21, 3, 38, 'Scratch Programming', 'workshop', 'Visual programming', '2025-07-05', '14:00:00', '16:00:00', 'Computer Lab', false, 20, 800.00, 'completed', '12 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(22, 3, 34, 'Python Bootcamp', 'workshop', 'Intensive course', '2025-07-28', '14:00:00', '17:00:00', 'Computer Lab', true, 20, 1500.00, 'completed', '14 students completed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(23, 3, 34, 'Calculator App', 'project', 'Team project', '2025-08-18', '15:30:00', '17:30:00', 'Computer Lab', true, 20, 1000.00, 'completed', '4 teams created apps', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(24, 3, 38, 'Web Development', 'workshop', 'HTML CSS basics', '2025-09-10', '14:00:00', '17:00:00', 'Computer Lab', true, 20, 1200.00, 'completed', '15 websites created', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(25, 3, 34, 'Website Redesign', 'project', 'School website project', '2025-09-25', '15:30:00', '17:00:00', 'Computer Lab', false, 15, 2500.00, 'completed', 'Prototype created', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(26, 3, 34, 'Debugging Challenge', 'competition', 'Bug fixing contest', '2025-10-12', '15:30:00', '17:00:00', 'Computer Lab', false, 20, 800.00, 'completed', '16 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(27, 3, 38, 'Career in Tech', 'event', 'Guest speaker session', '2025-10-30', '15:00:00', '16:30:00', 'Auditorium', false, 50, 2000.00, 'completed', '45 students attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(28, 3, 34, 'Hackathon Prep', 'meeting', 'Team formation', '2025-11-15', '15:30:00', '17:00:00', 'Computer Lab', true, 20, 500.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(29, 3, 34, 'Mobile App Workshop', 'workshop', 'Flutter introduction', '2025-12-05', '14:00:00', '17:00:00', 'Computer Lab', false, 15, 3000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(30, 3, 38, 'Coding Competition', 'competition', 'Annual championship', '2026-02-20', '14:00:00', '17:00:00', 'Computer Lab', true, 20, 5000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(31, 4, 31, 'Skills Assessment', 'meeting', 'Player evaluation', '2025-06-22', '16:00:00', '18:00:00', 'Sports Ground', true, 35, 500.00, 'completed', '28 players assessed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(32, 4, 35, 'Batting Workshop', 'workshop', 'Batting fundamentals', '2025-07-15', '15:00:00', '18:00:00', 'Sports Ground', true, 35, 3000.00, 'completed', '25 students attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(33, 4, 31, 'Bowling Masterclass', 'workshop', 'Bowling techniques', '2025-08-03', '15:00:00', '18:00:00', 'Sports Ground', true, 35, 2500.00, 'completed', '22 students participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(34, 4, 31, 'Inter House Cricket', 'competition', 'House tournament', '2025-08-25', '08:00:00', '17:00:00', 'Sports Ground', false, 60, 5000.00, 'completed', 'Red House won', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(35, 4, 35, 'Fitness Training', 'meeting', 'Stamina building', '2025-09-15', '16:00:00', '17:30:00', 'Sports Ground', true, 35, 800.00, 'completed', '30 players attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(36, 4, 31, 'District Tournament', 'competition', 'District level', '2025-10-08', '08:00:00', '17:00:00', 'District Stadium', false, 15, 8000.00, 'completed', 'Reached semi finals', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(37, 4, 31, 'Weekly Practice', 'meeting', 'Regular practice', '2025-10-29', '16:00:00', '18:00:00', 'Sports Ground', true, 35, 300.00, 'completed', '26 players present', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(38, 4, 35, 'Equipment Maintenance', 'meeting', 'Gear cleaning', '2025-11-12', '16:00:00', '17:00:00', 'Sports Store', true, 35, 200.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(39, 4, 31, 'State Championship', 'competition', 'State level', '2025-12-15', '08:00:00', '17:00:00', 'State Ground', false, 15, 15000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(40, 4, 31, 'Awards Ceremony', 'event', 'Season recognition', '2026-03-10', '17:00:00', '19:00:00', 'Auditorium', false, 100, 4000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(41, 5, 28, 'Athletics Inauguration', 'meeting', 'Fitness assessment', '2025-06-25', '16:00:00', '17:30:00', 'Running Track', true, 40, 600.00, 'completed', '32 students enrolled', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(42, 5, 28, 'Sprint Training', 'workshop', 'Sprint technique', '2025-07-20', '15:30:00', '18:00:00', 'Running Track', true, 40, 2000.00, 'completed', '28 athletes trained', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(43, 5, 28, 'Long Jump Competition', 'competition', 'Internal contest', '2025-08-10', '16:00:00', '18:00:00', 'Running Track', true, 40, 1500.00, 'completed', '24 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(44, 5, 28, 'Sports Day', 'competition', 'Annual athletics meet', '2025-09-05', '08:00:00', '16:00:00', 'Sports Ground', false, 200, 12000.00, 'completed', '150 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(45, 5, 28, 'Relay Training', 'workshop', 'Team coordination', '2025-09-25', '16:00:00', '17:30:00', 'Running Track', true, 40, 800.00, 'completed', '20 students participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(46, 5, 37, 'Swimming Prep', 'workshop', 'Swimming training', '2025-10-05', '14:00:00', '16:00:00', 'School Pool', false, 15, 2500.00, 'completed', '12 swimmers trained', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(47, 5, 28, 'District Meet', 'competition', 'District level', '2025-10-22', '07:00:00', '17:00:00', 'District Complex', false, 20, 10000.00, 'completed', '15 medals won', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(48, 5, 28, 'Yoga Workshop', 'workshop', 'Flexibility training', '2025-11-08', '16:00:00', '17:30:00', 'Yoga Hall', false, 40, 1200.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(49, 5, 28, 'State Championship', 'competition', 'State level', '2025-12-10', '07:00:00', '18:00:00', 'State Stadium', false, 10, 20000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(50, 5, 28, 'Marathon Training', 'project', 'Mini marathon prep', '2026-01-15', '06:00:00', '07:30:00', 'Running Track', false, 30, 3000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(51, 6, NULL, 'Art Welcome', 'meeting', 'Art forms introduction', '2025-06-28', '15:00:00', '16:30:00', 'Art Room', true, 25, 500.00, 'completed', '20 students enrolled', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(52, 6, 30, 'Watercolor Workshop', 'workshop', 'Landscape painting', '2025-07-25', '14:00:00', '17:00:00', 'Art Room', true, 25, 2000.00, 'completed', '18 students participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(53, 6, 30, 'State Art Competition', 'competition', 'State level', '2025-07-18', '09:00:00', '15:00:00', 'State Gallery', false, 5, 5000.00, 'completed', 'Saanvi won second prize', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(54, 6, 30, 'Clay Modeling', 'workshop', 'Sculpture making', '2025-08-15', '15:00:00', '17:30:00', 'Art Room', false, 25, 1800.00, 'completed', '15 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(55, 6, 30, 'Wall Mural', 'project', 'School mural painting', '2025-09-15', '14:00:00', '17:00:00', 'School Corridor', false, 15, 4000.00, 'completed', 'Mural completed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(56, 6, 30, 'Paper Craft', 'workshop', 'Origami session', '2025-10-05', '15:00:00', '16:30:00', 'Art Room', false, 25, 800.00, 'completed', '16 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(57, 6, 30, 'Rangoli Competition', 'competition', 'Diwali celebration', '2025-10-20', '14:00:00', '17:00:00', 'School Courtyard', false, 40, 2500.00, 'completed', 'Myra team won', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(58, 6, 30, 'Recycled Art', 'project', 'Waste material art', '2025-11-10', '15:00:00', '17:00:00', 'Art Room', false, 25, 1000.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(59, 6, 30, 'Christmas Cards', 'workshop', 'Card making', '2025-12-18', '14:00:00', '16:00:00', 'Art Room', false, 25, 1500.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(60, 6, 30, 'Art Exhibition', 'event', 'Annual showcase', '2026-03-25', '10:00:00', '16:00:00', 'School Hall', false, 200, 8000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(61, 7, 23, 'Drama Introduction', 'meeting', 'Ice breaking activities', '2025-06-30', '15:00:00', '16:30:00', 'Auditorium', true, 30, 500.00, 'completed', '24 students joined', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(62, 7, 23, 'Acting Workshop', 'workshop', 'Dialogue delivery', '2025-07-18', '14:00:00', '17:00:00', 'Auditorium', true, 30, 2000.00, 'completed', '22 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(63, 7, 23, 'Role Assignment', 'meeting', 'Play auditions', '2025-08-08', '15:00:00', '17:30:00', 'Auditorium', true, 30, 300.00, 'completed', 'Cast finalized', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(64, 7, 23, 'Stage Movement', 'workshop', 'Movement coordination', '2025-08-22', '15:00:00', '17:00:00', 'Auditorium', true, 30, 1500.00, 'completed', '20 cast members', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(65, 7, 23, 'Costume Prep', 'meeting', 'Props creation', '2025-09-12', '15:00:00', '17:00:00', 'Art Room', false, 30, 5000.00, 'completed', 'Costumes ready', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(66, 7, 23, 'Dress Rehearsal', 'meeting', 'Full run through', '2025-10-15', '14:00:00', '17:00:00', 'Auditorium', true, 30, 1000.00, 'completed', 'Rehearsal successful', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(67, 7, 23, 'Jungle Book Play', 'event', 'Annual day performance', '2025-10-25', '17:00:00', '19:00:00', 'Auditorium', false, 300, 10000.00, 'completed', 'Outstanding performance', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(68, 7, 23, 'Theatre Visit', 'event', 'Professional play', '2025-11-20', '14:00:00', '18:00:00', 'NCPA Theatre', false, 25, 6000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(69, 7, 23, 'Street Play', 'workshop', 'Social messaging', '2025-12-08', '15:00:00', '17:00:00', 'Auditorium', false, 30, 1500.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(70, 7, 23, 'Shakespeare Session', 'meeting', 'Classical theatre', '2026-01-15', '15:00:00', '16:30:00', 'Auditorium', false, 30, 500.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(71, 8, 36, 'Music Orientation', 'meeting', 'Music theory intro', '2025-07-02', '15:00:00', '16:30:00', 'Music Room', true, 25, 500.00, 'completed', '20 students enrolled', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(72, 8, 36, 'Vocal Training', 'workshop', 'Voice techniques', '2025-07-20', '14:00:00', '17:00:00', 'Music Room', true, 25, 2000.00, 'completed', '18 students trained', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(73, 8, 36, 'Instrument Basics', 'workshop', 'Guitar keyboard intro', '2025-08-10', '15:00:00', '17:00:00', 'Music Room', false, 25, 3000.00, 'completed', '15 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(74, 8, 36, 'Choir Practice', 'meeting', 'Group singing', '2025-08-28', '15:00:00', '16:30:00', 'Music Room', true, 25, 300.00, 'completed', '20 members present', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(75, 8, 36, 'Music Competition', 'competition', 'Internal contest', '2025-09-15', '15:00:00', '18:00:00', 'Auditorium', false, 40, 2500.00, 'completed', '16 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(76, 8, 36, 'Classical Training', 'workshop', 'Indian classical', '2025-10-05', '14:00:00', '17:00:00', 'Music Room', true, 25, 2000.00, 'completed', '12 students attended', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(77, 8, 36, 'Annual Day Performance', 'event', 'School function', '2025-10-25', '17:00:00', '19:00:00', 'Auditorium', false, 300, 1000.00, 'completed', 'Choir performed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(78, 8, 36, 'District Competition', 'competition', 'Music contest', '2025-11-12', '09:00:00', '15:00:00', 'District Hall', false, 10, 5000.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(79, 8, 36, 'Band Formation', 'project', 'School band', '2025-12-01', '15:00:00', '17:00:00', 'Music Room', false, 15, 4000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(80, 8, 36, 'Music Concert', 'event', 'Year end show', '2026-03-18', '17:00:00', '19:00:00', 'Auditorium', false, 200, 8000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(81, 9, 38, 'Debate Orientation', 'meeting', 'Speaking skills intro', '2025-07-05', '15:30:00', '16:30:00', 'Conference Hall', true, 20, 500.00, 'completed', '18 students joined', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(82, 9, 38, 'Argument Techniques', 'workshop', 'Logic building', '2025-07-25', '15:30:00', '17:30:00', 'Conference Hall', true, 20, 1500.00, 'completed', '16 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(83, 9, 38, 'Practice Debate', 'meeting', 'Mock debates', '2025-08-15', '15:30:00', '17:00:00', 'Conference Hall', true, 20, 300.00, 'completed', '14 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(84, 9, 38, 'School Competition', 'competition', 'Internal contest', '2025-09-10', '15:30:00', '18:00:00', 'Auditorium', false, 40, 2000.00, 'completed', '12 teams participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(85, 9, 38, 'District Debate', 'competition', 'Inter school', '2025-10-18', '09:00:00', '16:00:00', 'District School', false, 10, 4000.00, 'completed', 'Won first place', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(86, 9, 38, 'Guest Speaker', 'event', 'Professional debater', '2025-11-08', '15:30:00', '17:00:00', 'Auditorium', false, 30, 2500.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(87, 9, 38, 'State Preparation', 'meeting', 'Competition prep', '2025-11-28', '15:30:00', '17:00:00', 'Conference Hall', true, 10, 1000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(88, 9, 38, 'State Competition', 'competition', 'State level', '2025-12-20', '09:00:00', '17:00:00', 'State Hall', false, 8, 8000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(89, 10, 27, 'Eco Orientation', 'meeting', 'Environmental awareness', '2025-07-08', '10:00:00', '11:30:00', 'School Garden', true, 35, 500.00, 'completed', '30 students enrolled', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(90, 10, 27, 'Tree Plantation', 'project', 'Planting trees', '2025-07-22', '10:00:00', '12:00:00', 'School Garden', false, 35, 3000.00, 'completed', '50 trees planted', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(91, 10, 27, 'Cleanliness Drive', 'project', 'Campus cleaning', '2025-08-12', '10:00:00', '12:00:00', 'School Campus', true, 35, 1000.00, 'completed', '28 students participated', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(92, 10, 27, 'Recycling Workshop', 'workshop', 'Waste management', '2025-09-05', '10:00:00', '12:00:00', 'School Garden', false, 35, 1500.00, 'completed', '25 students learned', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(93, 10, 27, 'Water Conservation', 'project', 'Rainwater harvesting', '2025-09-28', '10:00:00', '13:00:00', 'School Ground', false, 20, 5000.00, 'completed', 'System installed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(94, 10, 27, 'Environment Day', 'event', 'Annual celebration', '2025-10-15', '10:00:00', '14:00:00', 'School Hall', false, 100, 4000.00, 'completed', '80 participants', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(95, 10, 27, 'Composting Project', 'project', 'Organic waste', '2025-11-10', '10:00:00', '12:00:00', 'School Garden', false, 25, 2000.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(96, 10, 27, 'Plastic Free Campaign', 'project', 'Awareness drive', '2025-12-05', '10:00:00', '12:00:00', 'School Campus', false, 35, 1500.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(97, 10, 27, 'Green School Award', 'event', 'Certification prep', '2026-02-15', '10:00:00', '12:00:00', 'School Garden', false, 30, 3000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(98, 11, 34, 'Council Formation', 'meeting', 'Member election', '2025-06-08', '14:00:00', '16:00:00', 'Principal Office', true, 15, 500.00, 'completed', '12 members elected', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(99, 11, 34, 'Orientation Session', 'meeting', 'Roles responsibilities', '2025-06-20', '14:00:00', '15:30:00', 'Principal Office', true, 15, 300.00, 'completed', 'All members present', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(100, 11, 34, 'Annual Day Planning', 'meeting', 'Event organization', '2025-09-15', '14:00:00', '16:00:00', 'Principal Office', true, 15, 1000.00, 'completed', 'Committee formed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(101, 11, 34, 'Student Feedback', 'meeting', 'Grievance handling', '2025-10-05', '14:00:00', '15:30:00', 'Principal Office', true, 15, 200.00, 'completed', 'Issues discussed', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(102, 11, 34, 'Sports Day Planning', 'meeting', 'Event coordination', '2025-11-10', '14:00:00', '16:00:00', 'Principal Office', true, 15, 500.00, 'ongoing', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(103, 11, 34, 'Council Review', 'meeting', 'Performance evaluation', '2026-01-20', '14:00:00', '15:30:00', 'Principal Office', true, 15, 300.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(104, 11, 34, 'Farewell Planning', 'meeting', 'Grade 5 farewell', '2026-02-10', '14:00:00', '16:00:00', 'Principal Office', true, 15, 2000.00, 'planned', NULL, '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(105, 12, 34, 'Robotics Introduction', 'meeting', 'Basic concepts', '2025-07-10', '15:30:00', '16:45:00', 'STEM Lab', true, 20, 500.00, 'completed', '16 students joined', '[]', '2025-11-03 12:36:50.671096+00', '2025-11-03 12:36:50.671096+00'),
	(106, 12, 34, 'Robotics Introduction', 'meeting', 'Basic concepts', '2025-07-10', '15:30:00', '16:45:00', 'STEM Lab', true, 20, 500.00, 'completed', '16 students joined', '[]', '2025-11-03 12:43:07.982765+00', '2025-11-03 12:43:07.982765+00');


--
-- Data for Name: club_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."club_memberships" ("id", "club_id", "student_id", "approved_by_user_id", "role", "joined_date", "status", "attendance_count", "contribution_score", "exit_date", "exit_reason", "notes", "approved_at", "created_at", "updated_at") VALUES
	(1, 1, 21, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-10', 'active', 12, 85, NULL, NULL, 'Excellent problem solver', '2025-06-10 10:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(2, 1, 26, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-06-10', 'active', 15, 120, NULL, NULL, 'Outstanding leadership in math activities', '2025-06-10 10:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(3, 1, 30, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-12', 'active', 14, 90, NULL, NULL, NULL, '2025-06-12 11:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(4, 1, 33, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'secretary', '2025-06-10', 'active', 15, 110, NULL, NULL, 'Maintains club records efficiently', '2025-06-10 10:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(5, 2, 22, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-11', 'active', 13, 80, NULL, NULL, NULL, '2025-06-11 09:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(6, 2, 29, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-06-11', 'active', 16, 140, NULL, NULL, 'Led science fair project team', '2025-06-11 09:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(7, 2, 31, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'vice_president', '2025-06-11', 'active', 15, 115, NULL, NULL, NULL, '2025-06-11 09:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(8, 2, 37, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-15', 'active', 12, 95, NULL, NULL, 'Great at chemistry experiments', '2025-06-15 14:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(9, 3, 25, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-12', 'active', 14, 100, NULL, NULL, 'Quick learner in Python', '2025-06-12 10:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(10, 3, 29, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-12', 'active', 14, 105, NULL, NULL, NULL, '2025-06-12 10:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(11, 3, 34, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-06-12', 'active', 16, 150, NULL, NULL, 'Built school website prototype', '2025-06-12 10:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(12, 3, 38, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'secretary', '2025-06-12', 'active', 15, 125, NULL, NULL, NULL, '2025-06-12 10:30:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(13, 4, 23, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-13', 'active', 10, 70, NULL, NULL, NULL, '2025-06-13 15:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(14, 4, 27, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-13', 'active', 9, 65, NULL, NULL, NULL, '2025-06-13 15:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(15, 4, 31, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-06-13', 'active', 11, 95, NULL, NULL, 'Team captain', '2025-06-13 15:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(16, 4, 35, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'vice_president', '2025-06-13', 'active', 10, 85, NULL, NULL, 'Vice captain', '2025-06-13 15:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(17, 5, 22, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-14', 'active', 15, 90, NULL, NULL, 'Sprint specialist', '2025-06-14 16:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(18, 5, 28, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-06-14', 'active', 16, 110, NULL, NULL, 'Multiple gold medals', '2025-06-14 16:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(19, 5, 37, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-14', 'active', 16, 120, NULL, NULL, 'Swimming champion', '2025-06-14 16:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(20, 6, 24, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-06-15', 'active', 13, 120, NULL, NULL, 'Swimming champion', '2025-06-14 16:00:00+00', '2025-11-03 12:08:40.206028+00', '2025-11-03 12:08:40.206028+00'),
	(21, 14, 21, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-11-04', 'active', 0, 0, NULL, NULL, NULL, NULL, '2025-11-04 18:16:54.171125+00', '2025-11-04 18:16:54.171125+00'),
	(23, 23, 21, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-11-04', 'active', 0, 0, NULL, NULL, NULL, NULL, '2025-11-04 18:23:17.587412+00', '2025-11-04 18:23:17.587412+00'),
	(24, 28, 21, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'member', '2025-11-04', 'active', 0, 0, NULL, NULL, NULL, NULL, '2025-11-04 18:25:35.860452+00', '2025-11-04 18:25:35.860452+00'),
	(25, 33, 21, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-11-04', 'active', 0, 12, NULL, NULL, NULL, NULL, '2025-11-04 18:28:02.724294+00', '2025-11-04 18:28:08.294878+00'),
	(26, 37, 21, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'president', '2025-11-04', 'active', 0, 12, NULL, NULL, NULL, NULL, '2025-11-04 18:29:56.422189+00', '2025-11-04 18:30:02.107245+00');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversations" ("conversation_id", "school_id", "title", "status", "created_at", "updated_at") VALUES
	(1, 1, 'Query regarding Rohan Kumar (Grade 2)', 'Open', '2025-09-22 19:10:02.814052+00', '2025-09-22 19:10:02.814052+00'),
	(2, 1, 'Grade 5 Teachers Coordination', 'Open', '2025-09-22 19:10:02.814052+00', '2025-09-22 19:10:02.814052+00'),
	(3, 1, 'Regarding upcoming annual inspection', 'Open', '2025-09-22 19:10:02.814052+00', '2025-09-22 19:10:02.814052+00'),
	(47, 1, 'Regarding Student 22''s English Mid-Term Result', 'Open', '2025-10-09 04:56:08.430739+00', '2025-10-09 04:56:08.430739+00');


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversation_participants" ("conversation_id", "user_id", "role", "joined_at") VALUES
	(47, '1ef75d00-3349-4274-8bc8-da135015ab5d', 'Recipient', '2025-10-09 04:56:08.430739+00'),
	(47, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'Initiator', '2025-10-09 04:56:08.430739+00'),
	(1, '0841a053-7266-426e-b681-1d6fab5f9974', NULL, '2025-09-22 19:18:06.50996+00'),
	(1, 'da134162-0d5d-4215-b93b-aefb747ffa17', NULL, '2025-09-22 19:18:06.50996+00'),
	(2, 'b393e32d-fb28-4de5-9713-eeebad9d2c06', NULL, '2025-09-22 19:18:06.50996+00'),
	(2, '70cee473-d0a2-4484-8a84-e0a5cd4e584c', NULL, '2025-09-22 19:18:06.50996+00'),
	(2, '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', NULL, '2025-09-22 19:18:06.50996+00'),
	(2, 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', NULL, '2025-09-22 19:18:06.50996+00'),
	(3, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', NULL, '2025-09-22 19:18:06.50996+00'),
	(3, '4808a1be-01b6-44c1-a17a-c9f104b40854', NULL, '2025-09-22 19:18:06.50996+00');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("id", "school_id", "title", "description", "start_at", "end_at", "created_by", "rsvp_required", "rsvp_close_at") VALUES
	(1, 1, 'Annual Sports Day 2024', 'The annual sports meet for the academic year 2024-2025.', '2024-12-15 03:30:00+00', '2024-12-15 10:30:00+00', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, NULL),
	(2, 1, 'Parent-Teacher Meeting (Mid-Term)', 'A meeting to discuss the mid-term progress of students in Grades 1-5.', '2025-10-04 04:30:00+00', '2025-10-04 07:30:00+00', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-10-02 11:30:00+00'),
	(3, 1, 'Science Exhibition 2026', 'Annual science exhibition showcasing projects from all grades.', '2026-01-28 04:00:00+00', '2026-01-28 09:30:00+00', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', false, NULL),
	(4, 2, 'Annual Day 2025', 'Annual cultural program and prize distribution', '2025-02-15 16:00:00+00', '2025-02-15 20:00:00+00', NULL, true, '2025-02-10 23:59:59+00'),
	(5, 2, 'Sports Day 2024', 'Inter-house sports competition', '2024-12-10 08:00:00+00', '2024-12-10 17:00:00+00', NULL, false, NULL),
	(6, 2, 'Parent-Teacher Meeting', 'First term PTM for all classes', '2024-10-20 09:00:00+00', '2024-10-20 14:00:00+00', NULL, true, '2024-10-18 23:59:59+00');


--
-- Data for Name: event_rsvps; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_rsvps" ("id", "event_id", "user_id", "status", "responded_at") VALUES
	(1, 2, '0841a053-7266-426e-b681-1d6fab5f9974', 'Attending', '2025-09-22 19:56:29.261341+00'),
	(2, 2, 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 'Not Attending', '2025-09-22 19:56:29.261341+00'),
	(3, 2, '1ef75d00-3349-4274-8bc8-da135015ab5d', 'Maybe', '2025-09-22 19:56:29.261341+00');


--
-- Data for Name: exam_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."exam_types" ("exam_type_id", "school_id", "type_name") VALUES
	(1, 1, 'Unit Test'),
	(2, 1, 'Class Test'),
	(3, 1, 'Quiz'),
	(4, 1, 'Mid-Term Exam'),
	(5, 1, 'Final Exam'),
	(6, 1, 'Practical / Lab Exam'),
	(7, 1, 'Oral Assessment'),
	(8, 1, 'Formative Assessment'),
	(656, 1, 'Midterm Assessment'),
	(657, 1, 'Midterm Assessment'),
	(658, 1, 'Midterm Assessment'),
	(659, 1, 'Midterm Assessment'),
	(660, 1, 'Midterm Assessment'),
	(661, 1, 'Midterm Assessment'),
	(662, 1, 'Final Assessment'),
	(741, 1, 'Surprise exam'),
	(742, 1, 'Surprise exam 2'),
	(869, 2, 'Unit Test'),
	(870, 2, 'Mid-Term'),
	(871, 2, 'Final Term'),
	(872, 2, 'Annual Examination'),
	(873, 2, 'Practical Exam'),
	(874, 2, 'Project Assessment'),
	(875, 2, 'Unit Test'),
	(876, 2, 'Mid-Term'),
	(877, 2, 'Final Term'),
	(878, 2, 'Annual Examination'),
	(879, 2, 'Practical Exam'),
	(880, 2, 'Project Assessment'),
	(2200, 1, 'Midterm');


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."exams" ("id", "school_id", "exam_name", "exam_type_id", "start_date", "end_date", "created_at", "updated_at", "marks", "academic_year_id", "is_active") VALUES
	(1, 1, 'First Unit Test 2025', 1, '2025-07-21', '2025-07-25', '2025-09-22 18:46:16.098233+00', '2025-09-22 18:46:16.098233+00', 25, 2, true),
	(2, 1, 'Mid-Term Examination 2025', 4, '2025-09-29', '2025-10-10', '2025-09-22 18:46:16.098233+00', '2025-09-22 18:46:16.098233+00', 100, 2, true),
	(3, 1, 'Second Unit Test 2025', 1, '2025-12-08', '2025-12-12', '2025-09-22 18:46:16.098233+00', '2025-09-22 18:46:16.098233+00', 25, 2, true),
	(4, 1, 'Final Practical Exams 2026', 6, '2026-02-16', '2026-02-20', '2025-09-22 18:46:16.098233+00', '2025-09-22 18:46:16.098233+00', 50, 2, true),
	(5, 1, 'Final Examination 2026', 5, '2026-03-09', '2026-03-20', '2025-09-22 18:46:16.098233+00', '2025-09-22 18:46:16.098233+00', 100, 2, true),
	(535, 1, 'Surprise exams', 741, '2026-03-28', '2026-04-25', '2025-10-08 16:03:56.908073+00', '2025-10-08 16:03:56.908073+00', 600, 1, true),
	(536, 1, 'Surprise exams', 742, '2026-03-28', '2026-04-25', '2025-10-08 16:11:16.018644+00', '2025-10-08 16:11:16.018644+00', 600, 1, true),
	(1965, 1, '1B | Science | Midterm', 2200, '2025-11-15', '2025-11-15', '2025-11-01 21:08:07.267163+00', '2025-11-01 21:08:07.267163+00', 100, 2, true),
	(614, 2, 'Mid-Term Examination 2024', 870, '2024-09-15', '2024-09-25', '2025-10-11 09:58:32.001+00', '2025-10-11 09:58:32.001+00', 100.00, 1873, true),
	(470, 1, 'October Mid-Terms', 657, '2025-10-20', '2025-10-25', '2025-10-07 16:11:38.099429+00', '2025-10-07 16:11:38.099429+00', 600, 1, true),
	(471, 1, 'October Mid-Terms', 660, '2025-10-20', '2025-10-25', '2025-10-07 17:07:03.176705+00', '2025-10-07 17:07:03.176705+00', 600, 1, true),
	(472, 1, 'March Final exams', 662, '2026-03-28', '2026-04-25', '2025-10-07 17:36:32.097219+00', '2025-10-07 17:36:32.097219+00', 600, 1, true),
	(615, 2, 'Annual Examination 2025', 872, '2025-02-15', '2025-03-05', '2025-10-11 09:58:32.001+00', '2025-10-11 09:58:32.001+00', 100.00, 1873, true);


--
-- Data for Name: fee_template_components; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."fee_template_components" ("id", "fee_template_id", "fee_component_id", "created_at") VALUES
	(68, 44, 138, '2025-10-16 10:51:03.044746+00'),
	(69, 44, 139, '2025-10-16 10:51:03.044746+00'),
	(70, 44, 140, '2025-10-16 10:51:03.044746+00'),
	(127, 101, 242, '2025-10-17 11:00:29.244677+00'),
	(128, 101, 243, '2025-10-17 11:00:29.244677+00');


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."forms" ("id", "title", "structure", "school_id", "form_type", "status", "created_by_id", "created_at", "updated_at", "description") VALUES
	(1, 'Student Admission Form 2026-27', '{"fields": [{"name": "student_first_name", "type": "text", "label": "Student''s First Name", "required": true}, {"name": "student_last_name", "type": "text", "label": "Student''s Last Name", "required": true}, {"name": "date_of_birth", "type": "date", "label": "Date of Birth", "required": true}, {"name": "applying_for_grade", "type": "select", "label": "Applying for Grade", "options": ["1", "2", "3", "4", "5"], "required": true}, {"name": "previous_school", "type": "text", "label": "Previous School Name (if any)", "required": false}]}', 1, 'Admission', 'Published', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:26:41.588585+00', '2025-09-22 19:26:41.588585+00', 'Standard application form for new student admissions for the 2026-2027 academic year.'),
	(2, 'Annual Parent Feedback Survey 2025', '{"fields": [{"name": "satisfaction_rating", "type": "radio", "label": "Overall, how satisfied are you with the school this year?", "options": ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very Unsatisfied"], "required": true}, {"name": "improvement_suggestions", "type": "textarea", "label": "What is one thing we could do to improve?", "required": false}, {"name": "contact_for_followup", "type": "checkbox", "label": "May we contact you for a follow-up discussion?", "required": false}]}', 1, 'Survey', 'Published', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:26:41.588585+00', '2025-09-22 19:26:41.588585+00', 'A survey to collect feedback from parents about the current academic year.');


--
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_submissions" ("id", "form_id", "submitted_by_user_id", "responses", "submitted_at", "submission_status", "ip_address") VALUES
	(1, 1, '0841a053-7266-426e-b681-1d6fab5f9974', '{"date_of_birth": "2020-05-10", "previous_school": "Little Sprouts Preschool", "student_last_name": "Chandra", "applying_for_grade": "1", "student_first_name": "Ishan"}', '2025-09-22 19:29:54.207481+00', 'Received', NULL),
	(2, 1, 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', '{"date_of_birth": "2020-07-22", "previous_school": null, "student_last_name": "Mehta", "applying_for_grade": "1", "student_first_name": "Riya"}', '2025-09-22 19:29:54.207481+00', 'In Review', NULL),
	(3, 2, '0841a053-7266-426e-b681-1d6fab5f9974', '{"satisfaction_rating": "Very Satisfied", "contact_for_followup": true, "improvement_suggestions": "More frequent updates on the school app would be appreciated."}', '2025-09-22 19:29:54.207481+00', 'Received', NULL),
	(4, 2, 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', '{"satisfaction_rating": "Satisfied", "contact_for_followup": false, "improvement_suggestions": "The annual sports day was very well organized!"}', '2025-09-22 19:29:54.207481+00', 'Received', NULL),
	(5, 2, '1ef75d00-3349-4274-8bc8-da135015ab5d', '{"satisfaction_rating": "Neutral", "contact_for_followup": false, "improvement_suggestions": ""}', '2025-09-22 19:29:54.207481+00', 'Received', NULL);


--
-- Data for Name: gateway_webhook_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."gateway_webhook_events" ("id", "gateway_name", "event_id", "payload", "status", "processing_error", "received_at") VALUES
	(57, 'razorpay', 'payment.captured_pay_RW16jE0Qw3o99K_1761026533', '{"event": "payment.captured", "entity": "event", "payload": {"payment": {"entity": {"id": "pay_RW16jE0Qw3o99K", "fee": 2000, "tax": 0, "vpa": null, "bank": null, "card": {"id": "card_RW16jfAL9PDCOG", "emi": true, "name": "", "type": "credit", "last4": "0153", "entity": "card", "issuer": "UTIB", "network": "Visa", "sub_type": "consumer", "token_iin": null, "international": false}, "email": "test@school.os", "notes": {"target_order_id": 588, "target_invoice_id": null}, "amount": 100000, "entity": "payment", "method": "card", "reward": null, "status": "captured", "wallet": null, "card_id": "card_RW16jfAL9PDCOG", "contact": "+917406963709", "captured": true, "currency": "INR", "order_id": "order_RW16BaKLI8sLBM", "created_at": 1761026525, "error_code": null, "error_step": null, "invoice_id": null, "base_amount": 100000, "description": "Payment for Order #ORD-2-20251021-21", "error_reason": null, "error_source": null, "acquirer_data": {"auth_code": "295773"}, "international": false, "refund_status": null, "amount_refunded": 0, "error_description": null}}}, "contains": ["payment"], "account_id": "acc_RSkxwYCgkydfxf", "created_at": 1761026533}', 'failed', 'Razorpay Signature Verification Failed', '2025-10-21 06:02:14.040794+00'),
	(58, 'razorpay', 'payment.captured_pay_RW1eW8q6721pgR_1761028449', '{"event": "payment.captured", "entity": "event", "payload": {"payment": {"entity": {"id": "pay_RW1eW8q6721pgR", "fee": 115050, "tax": 17550, "vpa": null, "bank": null, "card": {"id": "card_RW1eWJdfZOtSmU", "emi": true, "name": "", "type": "credit", "last4": "8228", "entity": "card", "issuer": "HDFC", "network": "MasterCard", "sub_type": "business", "token_iin": null, "international": false}, "email": "test@school.os", "notes": {"target_order_id": null, "target_invoice_id": 104}, "amount": 3250000, "entity": "payment", "method": "card", "reward": null, "status": "captured", "wallet": null, "card_id": "card_RW1eWJdfZOtSmU", "contact": "+919876543210", "captured": true, "currency": "INR", "order_id": "order_RW1d8xR9l5D6lB", "created_at": 1761028444, "error_code": null, "error_step": null, "invoice_id": null, "base_amount": 3250000, "description": "Payment for Invoice INV-2025-21-39", "error_reason": null, "error_source": null, "acquirer_data": {"auth_code": "693629"}, "international": false, "refund_status": null, "amount_refunded": 0, "error_description": null}}}, "contains": ["payment"], "account_id": "acc_RSkxwYCgkydfxf", "created_at": 1761028449}', 'failed', 'Razorpay Signature Verification Failed', '2025-10-21 06:34:10.829702+00'),
	(59, 'razorpay', 'payment.captured_pay_RVzgRnTEoUxoZ8_1761021523', '{"event": "payment.captured", "entity": "event", "payload": {"payment": {"entity": {"id": "pay_RVzgRnTEoUxoZ8", "fee": 76700, "tax": 11700, "vpa": null, "bank": null, "card": {"id": "card_RVzgS0O9RCXPxd", "emi": true, "name": "", "type": "credit", "last4": "0153", "entity": "card", "issuer": "UTIB", "network": "Visa", "sub_type": "consumer", "token_iin": null, "international": false}, "email": "test@school.os", "notes": {"target_order_id": null, "target_invoice_id": 104}, "amount": 3250000, "entity": "payment", "method": "card", "reward": null, "status": "captured", "wallet": null, "card_id": "card_RVzgS0O9RCXPxd", "contact": "+919876543210", "captured": true, "currency": "INR", "order_id": "order_RVzfQUwiPKPLfq", "created_at": 1761021510, "error_code": null, "error_step": null, "invoice_id": null, "base_amount": 3250000, "description": "Payment for Invoice INV-2025-21-39", "error_reason": null, "error_source": null, "acquirer_data": {"auth_code": "573030"}, "international": false, "refund_status": null, "amount_refunded": 0, "error_description": null}}}, "contains": ["payment"], "account_id": "acc_RSkxwYCgkydfxf", "created_at": 1761021523}', 'failed', 'Razorpay Signature Verification Failed', '2025-10-21 07:02:03.517389+00'),
	(60, 'razorpay', 'payment.captured_pay_RW2ZQfnIlHC7kv_1761031682', '{"event": "payment.captured", "entity": "event", "payload": {"payment": {"entity": {"id": "pay_RW2ZQfnIlHC7kv", "fee": 100300, "tax": 15300, "vpa": null, "bank": null, "card": {"id": "card_RW2ZQrywjfn3vO", "emi": true, "name": "", "type": "credit", "last4": "0153", "entity": "card", "issuer": "UTIB", "network": "Visa", "sub_type": "consumer", "token_iin": null, "international": false}, "email": "test@school.os", "notes": {"target_order_id": null, "target_invoice_id": 165}, "amount": 4250000, "entity": "payment", "method": "card", "reward": null, "status": "captured", "wallet": null, "card_id": "card_RW2ZQrywjfn3vO", "contact": "+917406963709", "captured": true, "currency": "INR", "order_id": "order_RW2Yxq3fAfC5iN", "created_at": 1761031676, "error_code": null, "error_step": null, "invoice_id": null, "base_amount": 4250000, "description": "Payment for Invoice INV-2025-21-69", "error_reason": null, "error_source": null, "acquirer_data": {"auth_code": "814752"}, "international": false, "refund_status": null, "amount_refunded": 0, "error_description": null}}}, "contains": ["payment"], "account_id": "acc_RSkxwYCgkydfxf", "created_at": 1761031682}', 'processed', NULL, '2025-10-21 07:28:02.961412+00');


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."invoice_items" ("id", "school_id", "invoice_id", "fee_component_id", "original_amount", "discount_amount", "final_amount", "amount_paid", "payment_status", "created_at", "updated_at", "component_name") VALUES
	(499, 2, 104, 138, 30000.00, 3000.00, 27000.00, 0.00, 'unpaid', '2025-10-16 11:43:42.64625+00', '2025-10-16 11:43:42.64625+00', 'Tuition'),
	(500, 2, 104, 139, 5000.00, 0.00, 5000.00, 0.00, 'unpaid', '2025-10-16 11:43:42.64625+00', '2025-10-16 11:43:42.64625+00', 'Transport'),
	(501, 2, 104, 140, 500.00, 0.00, 500.00, 0.00, 'unpaid', '2025-10-16 11:43:42.64625+00', '2025-10-16 11:43:42.64625+00', 'Library'),
	(502, 2, 105, 138, 30000.00, 0.00, 30000.00, 0.00, 'unpaid', '2025-10-16 11:43:42.64625+00', '2025-10-16 11:43:42.64625+00', 'Tuition'),
	(503, 2, 105, 139, 5000.00, 0.00, 5000.00, 0.00, 'unpaid', '2025-10-16 11:43:42.64625+00', '2025-10-16 11:43:42.64625+00', 'Transport'),
	(504, 2, 105, 140, 500.00, 0.00, 500.00, 0.00, 'unpaid', '2025-10-16 11:43:42.64625+00', '2025-10-16 11:43:42.64625+00', 'Library'),
	(652, 2, 165, 138, 30000.00, 3000.00, 27000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Tuition'),
	(653, 2, 165, 139, 5000.00, 0.00, 5000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Transport'),
	(654, 2, 165, 140, 500.00, 0.00, 500.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Library'),
	(655, 2, 165, 242, 8000.00, 0.00, 8000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Tuitioning'),
	(656, 2, 165, 243, 2000.00, 0.00, 2000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Transporting'),
	(657, 2, 166, 138, 30000.00, 0.00, 30000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Tuition'),
	(658, 2, 166, 139, 5000.00, 0.00, 5000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Transport'),
	(659, 2, 166, 140, 500.00, 0.00, 500.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Library'),
	(660, 2, 166, 242, 8000.00, 0.00, 8000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Tuitioning'),
	(661, 2, 166, 243, 2000.00, 0.00, 2000.00, 0.00, 'unpaid', '2025-10-17 11:17:30.781056+00', '2025-10-17 11:17:30.781056+00', 'Transporting');


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."logs" ("log_id", "timestamp", "log_level", "message", "details") VALUES
	(1, '2025-09-22 04:35:12+00', 'INFO', 'User successfully logged in.', '{"user_id": "bd431bf6-6e9f-4642-84e9-f2284f92e164", "ip_address": "103.22.182.12"}'),
	(2, '2025-09-22 06:00:45+00', 'WARNING', 'Payment gateway timeout for invoice.', '{"gateway": "Stripe", "invoice_id": 8, "response_time_ms": 5000}'),
	(3, '2025-09-22 08:45:02+00', 'ERROR', 'Failed to connect to external email service.', '{"attempt": 3, "service": "SendGrid", "error_code": "503"}'),
	(4, '2025-10-15 17:52:25.142891+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "Can''t operate on closed transaction inside context manager.  Please complete the context manager before emitting further commands.", "total_students_affected": 2}'),
	(5, '2025-10-15 17:52:25.555901+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error", "total_students_affected": 2}'),
	(6, '2025-10-15 17:57:47.557587+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "Can''t operate on closed transaction inside context manager.  Please complete the context manager before emitting further commands.", "total_students_affected": 2}'),
	(7, '2025-10-15 17:57:48.286861+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error", "total_students_affected": 2}'),
	(8, '2025-10-15 18:01:12.793517+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "Can''t operate on closed transaction inside context manager.  Please complete the context manager before emitting further commands.", "total_students_affected": 2}'),
	(9, '2025-10-15 18:01:13.276477+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error", "total_students_affected": 2}'),
	(10, '2025-10-15 18:03:46.499712+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "Can''t operate on closed transaction inside context manager.  Please complete the context manager before emitting further commands.", "total_students_affected": 2}'),
	(11, '2025-10-15 18:03:46.913128+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error", "total_students_affected": 2}'),
	(12, '2025-10-15 18:05:15.136952+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "Can''t operate on closed transaction inside context manager.  Please complete the context manager before emitting further commands.", "total_students_affected": 2}'),
	(13, '2025-10-15 18:05:15.712482+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error", "total_students_affected": 2}'),
	(14, '2025-10-15 18:35:00.610928+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error", "total_students_affected": 2}'),
	(15, '2025-10-15 19:04:16.835424+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(16, '2025-10-15 19:06:03.571425+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "A transaction is already begun on this Session.", "total_students_affected": 2}'),
	(17, '2025-10-15 19:18:20.546049+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "A transaction is already begun on this Session.", "total_students_affected": 2}'),
	(18, '2025-10-15 19:18:21.051957+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 1, "error_message": "A transaction is already begun on this Session.", "total_students_affected": 2}'),
	(19, '2025-10-15 19:22:57.327723+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(20, '2025-10-16 10:54:26.419409+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(21, '2025-10-16 11:16:47.419679+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "AttributeError", "fee_term_id": 39, "error_message": "''Class'' object has no attribute ''class_name''", "total_students_affected": 2}'),
	(22, '2025-10-16 11:34:25.682668+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "InvalidRequestError", "fee_term_id": 39, "error_message": "A transaction is already begun on this Session.", "total_students_affected": 2}'),
	(23, '2025-10-16 12:23:49.148378+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(24, '2025-10-16 12:23:49.901858+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(25, '2025-10-16 12:28:12.867993+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(26, '2025-10-16 12:28:13.693926+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(27, '2025-10-16 12:29:31.157711+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(28, '2025-10-16 12:29:31.931566+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(29, '2025-10-16 14:11:25.443816+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(30, '2025-10-16 14:11:26.908036+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(31, '2025-10-16 14:20:22.373785+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(32, '2025-10-16 14:20:24.549904+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(33, '2025-10-16 14:28:01.487917+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(34, '2025-10-16 14:28:03.044086+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(35, '2025-10-16 14:30:10.821365+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(36, '2025-10-16 14:30:12.270113+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(37, '2025-10-16 19:57:02.487005+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(38, '2025-10-16 19:57:03.188689+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "ValueError", "fee_term_id": 1, "error_message": "Fee term not found.", "total_students_affected": 2}'),
	(39, '2025-10-16 20:14:29.956643+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(40, '2025-10-16 20:18:08.707091+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(41, '2025-10-16 20:23:58.216591+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(42, '2025-10-16 20:25:25.348621+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(43, '2025-10-17 09:17:00.113737+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(44, '2025-10-17 09:35:41.708636+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(45, '2025-10-17 09:58:33.203563+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(46, '2025-10-17 09:59:23.795174+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(47, '2025-10-17 10:00:34.440571+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(48, '2025-10-17 10:02:15.47801+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(49, '2025-10-17 18:21:13.092742+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(50, '2025-10-18 10:38:15.844682+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(51, '2025-10-18 10:41:25.869922+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(52, '2025-10-19 05:27:33.333929+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(53, '2025-10-20 08:50:58.600635+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(54, '2025-10-20 08:55:40.779715+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(55, '2025-10-20 09:02:55.06864+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(56, '2025-10-20 09:05:19.723514+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(57, '2025-10-20 09:19:29.721997+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(58, '2025-10-20 09:25:04.488756+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(59, '2025-10-20 09:35:45.766522+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(60, '2025-10-20 09:45:01.998085+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(61, '2025-10-20 09:47:59.280272+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(62, '2025-10-20 09:52:17.719528+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(63, '2025-10-20 10:07:54.298087+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(64, '2025-10-20 10:16:20.344442+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(65, '2025-10-20 11:17:37.172738+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(66, '2025-10-20 11:49:54.312282+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(67, '2025-10-20 12:14:06.066197+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(68, '2025-10-20 12:54:45.560281+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(69, '2025-10-20 13:17:43.045428+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(70, '2025-10-20 18:26:40.331255+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(71, '2025-10-20 18:47:55.464624+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(72, '2025-10-21 08:14:36.307286+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(73, '2025-10-21 10:31:06.911349+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(74, '2025-10-21 14:19:14.901504+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(75, '2025-10-21 20:23:12.215143+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(76, '2025-10-21 21:44:42.213647+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(77, '2025-10-22 04:13:07.719708+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(78, '2025-10-22 05:01:25.197366+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(79, '2025-10-22 05:02:24.244727+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(80, '2025-10-22 06:48:30.901762+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(81, '2025-10-22 07:54:25.974241+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(82, '2025-10-22 08:41:29.78096+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(83, '2025-10-22 09:29:25.329522+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(84, '2025-10-22 09:49:13.234436+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(85, '2025-10-22 15:14:28.587027+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(86, '2025-10-22 15:53:31.749854+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(87, '2025-10-23 05:36:30.882812+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(88, '2025-10-23 06:05:09.001203+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(89, '2025-10-23 06:15:58.06779+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(90, '2025-10-23 06:34:09.456468+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(91, '2025-10-23 07:00:03.836809+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(92, '2025-10-23 12:31:53.029155+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(93, '2025-10-24 11:26:13.394065+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(94, '2025-10-24 11:26:43.009316+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(95, '2025-10-24 11:26:49.467095+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(96, '2025-10-26 06:50:54.129915+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(97, '2025-11-01 13:13:29.82521+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(98, '2025-11-01 13:21:38.888795+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(99, '2025-11-01 16:36:51.991786+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(100, '2025-11-03 13:49:43.899542+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(101, '2025-11-04 13:52:32.570992+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(102, '2025-11-04 15:13:54.046279+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(103, '2025-11-04 15:52:38.926356+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(104, '2025-11-04 18:48:52.957476+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(105, '2025-11-05 00:42:20.570312+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(106, '2025-11-05 01:53:11.036878+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(107, '2025-11-05 05:46:30.670365+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(108, '2025-11-05 12:38:11.804822+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(109, '2025-11-05 12:43:25.01437+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(110, '2025-11-05 13:37:33.355996+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(111, '2025-11-05 14:12:01.297385+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(112, '2025-11-05 14:25:14.993775+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(113, '2025-11-05 14:43:08.145683+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(114, '2025-11-05 16:19:59.631642+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(115, '2025-11-05 16:33:14.427077+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(116, '2025-11-05 16:46:33.792344+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(117, '2025-11-05 17:15:50.045797+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(118, '2025-11-05 17:23:19.049024+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(119, '2025-11-05 17:23:50.394285+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(120, '2025-11-05 17:30:29.014631+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(121, '2025-11-05 17:41:23.909504+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(122, '2025-11-05 17:49:24.573975+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(123, '2025-11-05 17:54:12.952973+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(124, '2025-11-05 17:55:33.408323+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(125, '2025-11-05 18:05:27.432033+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(126, '2025-11-05 18:09:27.510643+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(127, '2025-11-05 18:22:53.506993+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(128, '2025-11-05 19:22:27.265423+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(129, '2025-11-05 19:33:45.940554+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(130, '2025-11-05 20:04:48.080151+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(131, '2025-11-05 20:46:37.274978+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(132, '2025-11-05 20:52:19.616173+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(133, '2025-11-05 21:08:26.083787+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(134, '2025-11-05 21:20:47.621273+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(135, '2025-11-06 07:12:06.765367+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(136, '2025-11-06 07:22:19.023048+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(137, '2025-11-06 07:30:05.736711+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(138, '2025-11-06 07:37:17.500815+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(139, '2025-11-06 11:15:15.820065+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(140, '2025-11-06 11:53:38.85269+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(141, '2025-11-06 12:19:40.464428+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(142, '2025-11-06 12:54:31.470287+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(143, '2025-11-06 13:04:53.465419+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(144, '2025-11-06 13:31:58.362557+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(145, '2025-11-06 13:57:16.740783+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}'),
	(146, '2025-11-06 19:20:20.632117+00', 'CRITICAL', 'Critical failure during bulk invoice generation. Operation rolled back.', '{"class_id": 11, "error_type": "Exception", "fee_term_id": 1, "error_message": "Simulated database error on second student", "total_students_affected": 2}');


--
-- Data for Name: marks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."marks" ("id", "school_id", "student_id", "exam_id", "subject_id", "marks_obtained", "max_marks", "remarks", "created_at", "updated_at") VALUES
	(386, 1, 31, 472, 1, 85.00, 100.00, NULL, '2025-10-08 15:52:36.564906+00', '2025-10-08 15:52:36.564906+00'),
	(387, 1, 32, 472, 1, 92.00, 100.00, NULL, '2025-10-08 15:52:36.564906+00', '2025-10-08 15:52:36.564906+00'),
	(388, 1, 33, 472, 1, 58.00, 100.00, NULL, '2025-10-08 15:52:36.564906+00', '2025-10-08 15:52:36.564906+00'),
	(391, 1, 31, 535, 1, 85.00, 100.00, NULL, '2025-10-08 16:05:18.319446+00', '2025-10-08 16:05:18.319446+00'),
	(392, 1, 32, 535, 1, 92.00, 100.00, NULL, '2025-10-08 16:05:18.319446+00', '2025-10-08 16:05:18.319446+00'),
	(393, 1, 33, 535, 1, 58.00, 100.00, NULL, '2025-10-08 16:05:18.319446+00', '2025-10-08 16:05:18.319446+00'),
	(394, 1, 21, 536, 1, 85.00, 100.00, NULL, '2025-10-08 16:14:22.247123+00', '2025-10-08 16:14:22.247123+00'),
	(395, 1, 22, 536, 1, 92.00, 100.00, NULL, '2025-10-08 16:14:22.247123+00', '2025-10-08 16:14:22.247123+00'),
	(396, 1, 23, 536, 1, 58.00, 100.00, NULL, '2025-10-08 16:14:22.247123+00', '2025-10-08 16:14:22.247123+00');


--
-- Data for Name: media_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."media_items" ("id", "album_id", "storage_path", "uploaded_by_id", "uploaded_at", "metadata", "mime_type", "file_size_bytes") VALUES
	(1, 1, 'https://placehold.co/600x400/F0F0F0/000000?text=Race+Start', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "Students at the starting line for the 100m dash.", "students_featured": []}', NULL, NULL),
	(2, 1, 'https://placehold.co/600x400/F0F0F0/000000?text=Winners', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "Winners of the Grade 5 relay race with their medals.", "students_featured": ["Aditya Verma", "Vihaan Reddy"]}', NULL, NULL),
	(3, 1, 'https://placehold.co/600x400/F0F0F0/000000?text=Tug+of+War', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "Teachers and parents participating in the tug-of-war.", "students_featured": []}', NULL, NULL),
	(4, 2, 'https://placehold.co/600x400/F0F0F0/000000?text=Flag+Hoisting', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "The principal hoisting the national flag during the ceremony.", "students_featured": []}', NULL, NULL),
	(5, 2, 'https://placehold.co/600x400/F0F0F0/000000?text=Cultural+Dance', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "Students performing a traditional dance.", "students_featured": ["Ananya Gupta", "Saanvi Joshi"]}', NULL, NULL),
	(6, 3, 'https://placehold.co/600x400/F0F0F0/000000?text=Volcano+Model', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "A working model of a volcano, which won first prize.", "students_featured": ["Rohan Kumar"]}', NULL, NULL),
	(7, 3, 'https://placehold.co/600x400/F0F0F0/000000?text=Solar+System', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-09-22 19:25:38.785344+00', '{"description": "A detailed model of the solar system created by Grade 4 students.", "students_featured": []}', NULL, NULL),
	(193, 801, '801/b9ff9243-c796-46d9-ac70-63d72a600209.jpeg', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '2025-10-20 12:46:15.80755+00', '{}', 'image/jpeg', 139376),
	(200, 806, '806/3382e2af-9201-4ce0-98aa-39581c692793.jpeg', '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', '2025-10-20 14:11:56.927575+00', '{}', 'image/jpeg', 134430);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."messages" ("message_id", "conversation_id", "sender_id", "payload", "is_read", "sent_at", "language") VALUES
	(1, 1, '0841a053-7266-426e-b681-1d6fab5f9974', '{"text": "Hello, I had a question about Rohan''s recent performance in mathematics."}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(2, 1, 'da134162-0d5d-4215-b93b-aefb747ffa17', '{"text": "Hello! Of course. Rohan is doing well overall, but we can schedule a time to discuss it in more detail if you like."}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(3, 1, '0841a053-7266-426e-b681-1d6fab5f9974', '{"text": "That would be great, thank you!"}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(4, 2, 'b393e32d-fb28-4de5-9713-eeebad9d2c06', '{"text": "Hi team, has everyone submitted their lesson plans for the upcoming unit?"}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(5, 2, '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', '{"text": "I just submitted mine a few minutes ago."}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(6, 2, '70cee473-d0a2-4484-8a84-e0a5cd4e584c', '{"text": "Same here. I''ll be covering the chapter on fractions."}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(7, 3, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '{"text": "Could you please send me the annual performance report for Grade 1 Section A by tomorrow EOD?"}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(8, 3, '4808a1be-01b6-44c1-a17a-c9f104b40854', '{"text": "Yes, absolutely. I am working on it and will send it over."}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(9, 3, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '{"text": "Thank you, I appreciate it."}', false, '2025-09-22 19:19:51.339858+00', 'en'),
	(88, 47, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '{"content": "Hello, I would like to schedule a brief call to discuss the recent English Mid-Term results. Please let me know what time works best for you."}', false, '2025-10-09 05:06:04.119639+00', 'en');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."orders" ("order_id", "student_id", "parent_user_id", "order_number", "total_amount", "created_at", "updated_at", "school_id", "status") VALUES
	(162, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 'ORD-1-20251019-21', 1550.00, '2025-10-18 18:42:45.749824+00', '2025-10-19 05:58:02.395622+00', 1, 'pending_payment'),
	(187, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 'ORD-2-20251019-21', 2600.00, '2025-10-19 09:37:36.11883+00', '2025-10-19 09:37:36.11883+00', 2, 'pending_payment'),
	(1, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 'ORD-2025-001', 2900.00, '2025-09-22 19:00:54.281869+00', '2025-09-22 19:00:54.281869+00', 1, 'pending_payment'),
	(2, 23, 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 'ORD-2025-002', 2050.00, '2025-09-22 19:00:54.281869+00', '2025-09-22 19:00:54.281869+00', 1, 'pending_payment'),
	(7, 26, 'da134162-0d5d-4215-b93b-aefb747ffa17', 'ORD-2025-003', 750.00, '2025-10-12 17:15:32.395234+00', '2025-10-12 17:15:32.395234+00', 1, 'pending_payment'),
	(8, 23, 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'ORD-2025-004', 1150.00, '2025-10-12 17:15:32.395234+00', '2025-10-19 06:22:51.278945+00', 1, 'pending_payment'),
	(588, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 'ORD-2-20251021-21', 1000.00, '2025-10-21 06:00:22.963705+00', '2025-10-21 06:02:28.588252+00', 2, 'processing'),
	(1954, 22, '1ef75d00-3349-4274-8bc8-da135015ab5d', 'ORD-2-20251106-22', 750.00, '2025-11-06 13:17:17.885202+00', '2025-11-06 13:17:17.885202+00', 2, 'pending_payment'),
	(1957, 22, '1ef75d00-3349-4274-8bc8-da135015ab5d', 'ORD-2-20251106-22-56A36F', 750.00, '2025-11-06 13:24:11.792456+00', '2025-11-06 13:24:11.792456+00', 2, 'pending_payment');


--
-- Data for Name: product_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_packages" ("id", "name", "school_id", "price", "academic_year", "is_active", "created_at", "updated_at", "description", "image_url", "category") VALUES
	(1, 'Grade 1 New Admission Kit', 1, 5500, '2025-2026', true, '2025-09-22 18:56:36.494953+00', '2025-09-22 18:56:36.494953+00', 'Complete set of textbooks, notebooks, and uniform for new Grade 1 admissions.', NULL, NULL),
	(2, 'Standard Stationery Pack', 1, 500, '2025-2026', true, '2025-09-22 18:56:36.494953+00', '2025-09-22 18:56:36.494953+00', 'Essential stationery including notebooks and a geometry box.', NULL, NULL),
	(3, 'Grade 5 Textbook Bundle', 1, 900.00, NULL, true, '2025-10-12 17:12:48.336434+00', '2025-10-12 17:12:48.336434+00', 'Complete textbook set for Grade 5 (English & Maths). A 50 Rupee discount!', NULL, NULL),
	(19, 'Complete Grade 5 Uniform Kit', 1, 3500.0, '2024-2025', true, '2025-10-19 03:26:35.997708+00', '2025-10-19 03:26:35.997708+00', 'Everything needed for Grade 5: 2 shirts, 1 pant, 1 tie, 1 belt', 'https://cdn.schoolos.io/packages/grade5-kit.jpg', 'Uniform Kits'),
	(20, 'Complete Grade 5 Uniform Kit', 1, 3500.0, '2024-2025', true, '2025-10-19 03:29:39.311896+00', '2025-10-19 03:29:39.311896+00', 'Everything needed for Grade 5: 2 shirts, 1 pant, 1 tie, 1 belt', 'https://cdn.schoolos.io/packages/grade5-kit.jpg', 'Uniform Kits'),
	(18, 'Updated Grade 5 Uniform Kit', 1, 3200.0, '2024-2025', false, '2025-10-19 03:22:33.893425+00', '2025-10-19 03:50:53.010892+00', 'Everything needed for Grade 5: 2 shirts, 1 pant, 1 tie, 1 belt', 'https://cdn.schoolos.io/packages/grade5-kit.jpg', 'Uniform Kits'),
	(22, 'Grade 5 Uniform Kit', 2, 1750.00, '2025-2026', true, '2025-10-19 05:19:31.559114+00', '2025-10-19 05:19:31.559114+00', 'A complete uniform set for Grade 5 students.', NULL, NULL);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order_items" ("id", "order_id", "product_id", "quantity", "price_at_time_of_order", "status", "package_id") VALUES
	(1, 1, 1, 1, 2500, NULL, NULL),
	(2, 1, 8, 1, 300, NULL, NULL),
	(3, 2, 3, 1, 1800, NULL, NULL),
	(4, 2, 4, 1, 250, NULL, NULL),
	(61, 187, 1037, 2, 750.00, 'pending', NULL),
	(62, 187, 1038, 1, 1100.00, 'pending', NULL),
	(8, 7, 1, 1, 750.00, NULL, NULL),
	(9, 8, 2, 1, 250.00, NULL, NULL),
	(10, 8, 5, 3, 300.00, NULL, NULL),
	(445, 1954, 16, 1, 750.00, 'pending', NULL),
	(446, 1957, 16, 1, 750.00, 'pending', NULL),
	(139, 588, 4, 4, 250, 'pending', NULL),
	(54, 162, 7, 1, 950.00, 'pending', NULL),
	(55, 162, 8, 2, 300.00, 'pending', NULL);


--
-- Data for Name: package_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."package_items" ("package_id", "product_id", "quantity") VALUES
	(1, 1, 1),
	(1, 5, 1),
	(1, 9, 1),
	(2, 5, 1),
	(2, 6, 1),
	(1, 3, 1),
	(1, 4, 1),
	(18, 2, 2),
	(18, 3, 1),
	(18, 4, 1),
	(18, 5, 1),
	(19, 2, 2),
	(19, 3, 1),
	(19, 4, 1),
	(19, 5, 1),
	(20, 2, 2),
	(20, 3, 1),
	(20, 4, 1),
	(20, 5, 1),
	(22, 1037, 1),
	(22, 1038, 1);


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payments" ("id", "school_id", "student_id", "user_id", "invoice_id", "order_id", "currency", "gateway_name", "gateway_payment_id", "gateway_order_id", "gateway_signature", "status", "reconciliation_status", "method", "error_code", "error_description", "metadata", "created_at", "updated_at", "amount_paid") VALUES
	(6, 1, 21, '0841a053-7266-426e-b681-1d6fab5f9974', NULL, 1, 'INR', 'razorpay', 'pay_QRS567TUV8901234', 'order_WXY890ZAB1234567', 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9', 'captured', 'reconciled', 'upi', NULL, NULL, '{"items": ["School Uniform", "Mathematics Textbook"], "order_number": "ORD-2025-001", "internal_payment_id": 6}', '2025-09-22 19:05:30+00', '2025-09-22 19:06:15+00', NULL),
	(7, 1, 23, '437bdd8c-d32c-42f2-911a-cd0b6768fa9d', NULL, 2, 'INR', 'razorpay', NULL, 'order_CDE123FGH4567890', NULL, 'pending', 'pending', NULL, NULL, NULL, '{"items": ["Sports Kit"], "order_number": "ORD-2025-002", "internal_payment_id": 7}', '2025-09-22 19:10:20+00', '2025-09-22 19:10:20+00', NULL),
	(9, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', NULL, 'order_RU8qQGb8d99rRa', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-16 12:18:09.981271+00', '2025-10-16 12:18:09.981271+00', 35500.00),
	(10, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', 'pay_RUEbJD4oRMjVF0', 'order_RUDoisnlCXjF1U', NULL, 'captured', 'pending', NULL, NULL, NULL, NULL, '2025-10-16 17:09:59.559161+00', '2025-10-16 18:51:32.68153+00', 35500.00),
	(171, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', NULL, 'order_RVkzCxj3S4wgAu', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-20 14:15:49.815651+00', '2025-10-20 14:15:49.815651+00', 35500.00),
	(172, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', NULL, 'order_RVl4gsfi2BCFbr', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-20 14:20:31.89563+00', '2025-10-20 14:20:31.89563+00', 35500.00),
	(173, 2, 22, '0841a053-7266-426e-b681-1d6fab5f9974', 105, NULL, 'INR', 'razorpay', NULL, 'order_RVzQpGOu9NDa3F', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 04:23:40.290433+00', '2025-10-21 04:23:40.290433+00', 35500.00),
	(174, 2, 22, '0841a053-7266-426e-b681-1d6fab5f9974', 105, NULL, 'INR', 'razorpay', NULL, 'order_RVzRgk1KG6tNES', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 04:24:30.849223+00', '2025-10-21 04:24:30.849223+00', 35500.00),
	(175, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', NULL, 'order_RVzcQGIP0fkK3A', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 04:34:40.378567+00', '2025-10-21 04:34:40.378567+00', 35500.00),
	(176, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', NULL, 'order_RVzchH7lA6Xv7W', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 04:34:56.074285+00', '2025-10-21 04:34:56.074285+00', 35500.00),
	(177, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 104, NULL, 'INR', 'razorpay', NULL, 'order_RVzf3aUes7NRZI', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 04:37:09.76295+00', '2025-10-21 04:37:09.76295+00', 32500.00),
	(15, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 166, NULL, 'INR', 'razorpay', 'pay_RUXNP3Ru0V5j55', 'order_RUXMxo253Twm1P', '0f88bfe9858b7e5700ec2fcde6e7ae29ad31e95f547b0ccb957765686df557f1', 'captured', 'pending', 'card', NULL, NULL, NULL, '2025-10-17 12:17:37.110397+00', '2025-10-18 03:36:22.278342+00', 45500.00),
	(178, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 104, NULL, 'INR', 'razorpay', NULL, 'order_RVzfQUwiPKPLfq', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 04:37:31.173467+00', '2025-10-21 04:37:31.173467+00', 32500.00),
	(182, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', NULL, 588, 'INR', 'razorpay', NULL, 'order_RW15093tJsn0mf', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 06:00:24.552748+00', '2025-10-21 06:00:24.552748+00', 1000.00),
	(183, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', NULL, 588, 'INR', 'razorpay', 'pay_RW16jE0Qw3o99K', 'order_RW16BaKLI8sLBM', '68bb22295deb5d17bb16d9b836552d67caf2dbb02c2a989b7a62921f1cfaf5f6', 'captured', 'pending', 'card', NULL, NULL, NULL, '2025-10-21 06:01:32.214197+00', '2025-10-21 06:02:28.588252+00', 1000.00),
	(184, 2, 21, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 104, NULL, 'INR', 'razorpay', NULL, 'order_RW1bx7lncx5nm3', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 06:31:36.173914+00', '2025-10-21 06:31:36.173914+00', 32500.00),
	(185, 2, 21, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 104, NULL, 'INR', 'razorpay', 'pay_RW1eW8q6721pgR', 'order_RW1d8xR9l5D6lB', '0a10f5e5dd4559d8abdb733e33855c14360346a235c17d4563f23faed876296e', 'captured', 'pending', 'card', NULL, NULL, NULL, '2025-10-21 06:32:44.728529+00', '2025-10-21 06:37:18.590337+00', 32500.00),
	(186, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 165, NULL, 'INR', 'razorpay', 'pay_RW2ZQfnIlHC7kv', 'order_RW2Yxq3fAfC5iN', NULL, 'captured', 'pending', NULL, NULL, NULL, NULL, '2025-10-21 07:27:28.055903+00', '2025-10-21 07:28:03.291827+00', 42500.00),
	(37, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', NULL, 187, 'INR', 'razorpay', NULL, 'order_RVHiEd2dleDx83', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-19 09:37:38.285971+00', '2025-10-19 09:37:38.285971+00', 2600.00),
	(38, 2, 21, '0841a053-7266-426e-b681-1d6fab5f9974', NULL, 187, 'INR', 'razorpay', NULL, 'order_RVHwmPHc0CuDY8', NULL, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-19 09:51:25.249127+00', '2025-10-19 09:51:25.249127+00', 2600.00),
	(350, 2, 22, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', 105, NULL, 'INR', 'razorpay', NULL, 'order_RWQDEWn03gxOfO', NULL, 'captured', 'pending', NULL, NULL, 'Allocation retried and succeeded at 2025-10-22 07:15:37.750925', NULL, '2025-10-22 06:35:32.537239+00', '2025-10-22 07:15:37.654986+00', 35500.00);


--
-- Data for Name: payment_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payment_allocations" ("id", "payment_id", "amount_allocated", "notes", "allocated_by_user_id", "created_at", "updated_at", "invoice_item_id") VALUES
	(6, 15, 30000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-18 03:36:22.278342+00', '2025-10-18 03:36:22.278342+00', 657),
	(7, 15, 5000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-18 03:36:22.278342+00', '2025-10-18 03:36:22.278342+00', 658),
	(8, 15, 500.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-18 03:36:22.278342+00', '2025-10-18 03:36:22.278342+00', 659),
	(9, 15, 8000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-18 03:36:22.278342+00', '2025-10-18 03:36:22.278342+00', 660),
	(10, 15, 2000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-18 03:36:22.278342+00', '2025-10-18 03:36:22.278342+00', 661),
	(12, 185, 27000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 06:37:18.590337+00', '2025-10-21 06:37:18.590337+00', 499),
	(13, 185, 5000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 06:37:18.590337+00', '2025-10-21 06:37:18.590337+00', 500),
	(14, 185, 500.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-21 06:37:18.590337+00', '2025-10-21 06:37:18.590337+00', 501),
	(15, 186, 27000.00, NULL, '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 07:28:03.291827+00', '2025-10-21 07:28:03.291827+00', 652),
	(16, 186, 5000.00, NULL, '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 07:28:03.291827+00', '2025-10-21 07:28:03.291827+00', 653),
	(17, 186, 500.00, NULL, '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 07:28:03.291827+00', '2025-10-21 07:28:03.291827+00', 654),
	(18, 186, 8000.00, NULL, '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 07:28:03.291827+00', '2025-10-21 07:28:03.291827+00', 655),
	(19, 186, 2000.00, NULL, '0841a053-7266-426e-b681-1d6fab5f9974', '2025-10-21 07:28:03.291827+00', '2025-10-21 07:28:03.291827+00', 656),
	(20, 350, 30000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-22 07:15:36.972712+00', '2025-10-22 07:15:36.972712+00', 502),
	(21, 350, 5000.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-22 07:15:36.972712+00', '2025-10-22 07:15:36.972712+00', 503),
	(22, 350, 500.00, NULL, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-22 07:15:36.972712+00', '2025-10-22 07:15:36.972712+00', 504);


--
-- Data for Name: product_album_links; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_categories" ("category_id", "school_id", "category_name", "description", "display_order", "icon_url", "created_at", "updated_at", "is_active") VALUES
	(2, 1, 'Uniforms', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(3, 1, 'Stationery', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(4, 1, 'Accessories', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(119, 1, 'Toys', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(13, 1, 'Uniforms', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(14, 1, 'Books', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(15, 1, 'Stationery', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 13:17:43.483441+00', true),
	(120, 1, 'School Ge Uniforms', NULL, NULL, NULL, '2025-10-18 13:21:06.374732+00', '2025-10-18 13:40:02.847767+00', false),
	(1, 1, 'School Uniforms', NULL, NULL, NULL, '2025-10-18 13:17:43.483441+00', '2025-10-18 14:06:44.754192+00', true),
	(123, 2, 'Uniforms', NULL, NULL, NULL, '2025-10-19 05:19:31.559114+00', '2025-10-19 05:19:31.559114+00', true),
	(124, 2, 'Stationery', NULL, NULL, NULL, '2025-10-19 05:19:31.559114+00', '2025-10-19 05:19:31.559114+00', true);


--
-- Data for Name: product_package_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_package_rules" ("id", "product_package_id", "school_id", "grade_level", "academic_year_id", "is_mandatory") VALUES
	(1, 1, 1, 1, 2, true),
	(2, 1, 1, 5, 2, true);


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."refunds" ("id", "payment_id", "gateway_refund_id", "amount", "currency", "reason", "status", "notes", "processed_by_user_id", "created_at", "updated_at") VALUES
	(1, 6, NULL, 500.00, 'INR', 'Partial refund for overcharge on computer lab fee.', 'pending', 'Refund processed via admin portal.', '3e163ee6-cd91-4d63-8bc1-189cc0d13860', '2025-10-12 06:18:15.931809+00', '2025-10-12 06:18:15.931809+00');


--
-- Data for Name: roles_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles_definition" ("role_id", "role_name") VALUES
	(1, 'Admin'),
	(2, 'Teacher'),
	(3, 'Student'),
	(4, 'Parent');


--
-- Data for Name: rte_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."rte_reservations" ("id", "student_id", "school_id", "academic_year_id", "admitted_under_rte", "documents") VALUES
	(1, 25, 1, 2, true, '{"address_proof_status": "Verified", "income_certificate_status": "Verified"}'),
	(2, 28, 1, 2, true, '{"address_proof_status": "Pending", "income_certificate_status": "Verified"}');


--
-- Data for Name: stream_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: student_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."student_achievements" ("id", "student_id", "school_id", "academic_year_id", "awarded_by_user_id", "verified_by_user_id", "achievement_type", "title", "description", "achievement_category", "points_awarded", "date_awarded", "certificate_url", "evidence_urls", "is_verified", "verified_at", "visibility", "created_at", "updated_at") VALUES
	(1, 21, 1, 1327, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'academic', 'Mathematics Excellence Award', 'Scored 100% in all monthly tests', 'Subject Topper', 50, '2025-09-15', NULL, '[]', true, '2025-09-16 10:30:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(2, 22, 1, 1327, '4808a1be-01b6-44c1-a17a-c9f104b40854', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'sports', 'Inter-School Athletics Meet - Bronze', 'Won bronze medal in 50m sprint', 'Athletics Bronze Medal', 25, '2025-08-20', NULL, '[]', true, '2025-08-21 14:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(3, 24, 1, 1327, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', NULL, 'cultural', 'Annual Day Dance Performance', 'Outstanding performance in classical dance', 'Dance Competition', 50, '2025-10-05', NULL, '[]', false, NULL, 'school_only', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(4, 26, 1, 1327, 'da134162-0d5d-4215-b93b-aefb747ffa17', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'academic', 'Math Olympiad District Level', 'Qualified for state-level Math Olympiad', 'Olympiad Winner', 112, '2025-07-28', NULL, '[]', true, '2025-07-30 09:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(5, 25, 1, 1327, 'b393e32d-fb28-4de5-9713-eeebad9d2c06', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'leadership', 'Class Monitor 2025-26', 'Elected as class monitor for exceptional leadership', 'Class Monitor', 40, '2025-06-10', NULL, '[]', true, '2025-06-11 11:00:00+00', 'school_only', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(6, 28, 1, 1327, '4808a1be-01b6-44c1-a17a-c9f104b40854', NULL, 'sports', 'School Sports Day - Gold', 'Won gold medal in relay race', 'Athletics Gold Medal', 60, '2025-09-05', NULL, '[]', false, NULL, 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(7, 27, 1, 1327, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'community_service', 'Cleanliness Drive Volunteer', 'Led school campus cleaning initiative', 'Environmental Initiative', 45, '2025-08-15', NULL, '[]', true, '2025-08-16 10:00:00+00', 'school_only', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(8, 30, 1, 1327, 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'cultural', 'State Level Drawing Competition', 'Won 2nd prize in state-level art competition', 'Art Exhibition', 80, '2025-07-15', NULL, '[]', true, '2025-07-18 15:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(9, 29, 1, 1327, 'ce4ef0c4-c548-49ac-a71f-49655c7482d4', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'academic', 'Computer Science Quiz Winner', 'First place in inter-school coding quiz', 'Academic Excellence', 100, '2025-09-25', NULL, '[]', true, '2025-09-26 12:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(10, 32, 1, 1327, '97f8b48a-4302-4f0e-baf8-4a85f8da0cca', NULL, 'academic', 'Perfect Attendance Semester 1', 'Attended all classes without absence', 'Perfect Attendance', 30, '2025-10-30', NULL, '[]', false, NULL, 'school_only', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(11, 31, 1, 1327, '4808a1be-01b6-44c1-a17a-c9f104b40854', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'sports', 'District Cricket Tournament', 'Best bowler award in district tournament', 'Team Sports Winner', 75, '2025-08-10', NULL, '[]', true, '2025-08-12 16:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(12, 34, 1, 1327, 'b393e32d-fb28-4de5-9713-eeebad9d2c06', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'leadership', 'Student Council Vice President', 'Elected as student council vice president', 'Student Council Member', 80, '2025-06-15', NULL, '[]', true, '2025-06-16 10:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(13, 33, 1, 1327, 'da134162-0d5d-4215-b93b-aefb747ffa17', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'academic', 'Science Fair Winner', 'Best project in school science exhibition', 'Academic Excellence', 100, '2025-09-01', NULL, '[]', true, '2025-09-02 11:30:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(14, 36, 1, 1327, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', NULL, 'cultural', 'Music Competition Bronze', 'Third place in vocal music competition', 'Music Competition', 50, '2025-10-10', NULL, '[]', false, NULL, 'school_only', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(15, 35, 1, 1327, 'ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'community_service', 'Blood Donation Camp Organizer', 'Organized school blood donation drive', 'Social Welfare Project', 50, '2025-07-20', NULL, '[]', true, '2025-07-22 09:00:00+00', 'school_only', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(16, 38, 1, 1327, 'dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'leadership', 'Inter-School Debate Champion', 'Won first place in district debate competition', 'Debate Champion', 82, '2025-08-25', NULL, '[]', true, '2025-08-26 14:30:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(17, 37, 1, 1327, '4808a1be-01b6-44c1-a17a-c9f104b40854', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'sports', 'State Swimming Championship', 'Silver medal in 100m freestyle', 'Athletics Silver Medal', 80, '2025-07-05', NULL, '[]', true, '2025-07-07 10:00:00+00', 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(18, 23, 1, 1327, '8585907d-5de4-4f6d-ae9a-28b26b0e86a0', NULL, 'cultural', 'Drama Competition School Level', 'Lead role in annual school play', 'Drama/Theatre', 60, '2025-10-20', NULL, '[]', false, NULL, 'public', '2025-11-03 12:04:14.646636+00', '2025-11-03 12:04:14.646636+00'),
	(172, 22, 1, 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'bd431bf6-6e9f-4642-84e9-f2284f92e164', 'academic', 'Science Olympiad Winner', 'Achieved first place in the district-level Science Olympiad.', 'Competition', 0, '2025-11-01', NULL, '[]', true, '2025-11-06 10:41:33.87911+00', 'school_only', '2025-11-06 10:04:29.829055+00', '2025-11-06 10:41:33.497585+00');


--
-- Data for Name: student_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."student_contacts" ("id", "student_id", "profile_user_id", "name", "phone", "email", "relationship_type", "is_emergency_contact", "is_active", "custody_notes") VALUES
	(1, 21, '0841a053-7266-426e-b681-1d6fab5f9974', 'Suresh Sharma', '9876543210', 'parent.suresh.sharma@tapasyavp.edu.in', 'Father', true, true, NULL),
	(2, 21, 'bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 'Rina Sharma', '9876543211', 'parent.rina.sharma@tapasyavp.edu.in', 'Mother', false, true, NULL),
	(4, 23, NULL, 'Geeta Singh', '9876543213', 'parent.geeta.singh@tapasyavp.edu.in', 'Mother', true, true, NULL),
	(61, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 072ada', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(126, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian d2c8fa', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(197, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian d10dd4', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(277, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 9c826e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(91, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 83e07a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(10, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian d28e20', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(11, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian eb7d37', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(342, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 9bfab5', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(416, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian e85255', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(66, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 14091f', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(496, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 96f1ec', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(131, 23, 'e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', 'Pooja Patel', '9221551833', 'pooja.patel@example.com', 'Mother', true, true, NULL),
	(3, 22, '1ef75d00-3349-4274-8bc8-da135015ab5d', 'Hitesh Patel', '9876543212', 'parent.hitesh.patel@tapasyavp.edu.in', 'Father', true, true, NULL),
	(16, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian d77188', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(132, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 11aee2', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(202, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 176f57', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(71, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 5b1a1f', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(46, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 24dd45', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(21, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 752698', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(137, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 99c3b2', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(76, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 16eb9a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(26, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 6eb072', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(207, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 2801a4', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(116, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 07bcdb', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(217, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 4a78d1', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(96, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b7f996', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(31, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 503f67', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(81, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 10a274', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(212, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 8c354c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(142, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian fb6341', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(36, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b0dee6', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(152, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian ce6f32', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(86, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 452934', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(51, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian ebdd26', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(147, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 79b575', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(41, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 422e70', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(167, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 20f2d8', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(157, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian bc04f7', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(101, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 8e0627', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(56, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b0835f', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(222, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 70d62d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(227, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian bb3fcc', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(106, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian dff3d5', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(162, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 2a9a58', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(121, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian ea7e38', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(111, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 13e84a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(232, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian f9f3eb', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(172, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 15ecd6', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(237, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 3583ce', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(182, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 02367e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(242, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian afbc6f', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(177, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 734996', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(192, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 00c30a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(187, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian d8fe1c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(247, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b282dc', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(252, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b89822', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(257, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 276e4d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(262, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 9bd893', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(267, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian f8d7d8', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(272, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian fbbee5', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(586, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b681a6', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(676, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 46f79c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(282, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 646f3e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(377, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 573c7b', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(347, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 4fbee5', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(441, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 0dee64', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(421, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b28657', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(322, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 44c650', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(287, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 68263c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(501, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian a01836', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(352, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 5b338d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(686, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 4f660f', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(292, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 8e0e50', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(426, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian c9f6bd', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(357, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 209a6e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(511, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 5c4bf0', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(297, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 3dae66', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(506, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian af56e4', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(431, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian ec6155', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(406, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 1d8cd6', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(362, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian e76992', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(302, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 0f03d9', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(327, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b4f5e3', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(382, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 8d2d0e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(307, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 951907', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(521, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian c1942d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(367, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 731d29', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(461, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 79ea0a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(436, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 1611b8', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(312, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 3aaa7e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(516, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 1ab54d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(446, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 927f08', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(372, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian afa4e8', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(317, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 719893', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(536, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian a8626d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(387, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 5e55c9', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(332, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian c884e6', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(451, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 2a2109', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(526, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 94e07a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(337, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian c1d5f5', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(392, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 4e7e0c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(476, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 51b7e3', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(456, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 87f23d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(531, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 10721a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(466, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian f09e1a', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(401, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 1f85a3', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(411, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 6e6a3d', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(541, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 64dfc9', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(471, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 71bc56', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(546, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 4fde36', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(491, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 821fb9', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(481, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 550459', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(551, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 624abf', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(486, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 9d92ad', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(556, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian dc0a97', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(561, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 95ceaf', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(566, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 7a81e0', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(571, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 8a4c1c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(576, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 8fdc28', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(583, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 35cdcb', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(591, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian b36410', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(681, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian cb3b08', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(631, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 11c9fb', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(596, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 657884', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(691, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 2d1a8e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(603, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 16eca5', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(696, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 912b00', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(606, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian ab8800', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(716, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian bc4542', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(636, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian de6445', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(611, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 1c361e', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(701, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian f5af22', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(616, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 76c972', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(706, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 7fae6c', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(621, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 89acc8', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(711, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 6658bf', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(666, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 882b88', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(626, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian bd1e51', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(643, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 9e60e8', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(646, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 42c5bb', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(651, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 0db5e2', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(671, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian 119d09', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(656, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian e0d9c3', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL),
	(661, 21, 'aebd8219-5fd4-4ede-86c0-344c0e6cd257', 'Guardian f2c445', '1234567890', 'guardian@example.com', 'Guardian', true, true, NULL);


--
-- Data for Name: student_fee_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: student_fee_discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."student_fee_discounts" ("id", "student_id", "discount_id", "fee_term_id", "amount", "valid_from", "valid_until", "is_active", "applied_by_user_id", "reason", "notes", "created_at", "updated_at") VALUES
	(33, 21, 32, NULL, NULL, '2025-10-16', NULL, true, '3e163ee6-cd91-4d63-8bc1-189cc0d13860', NULL, NULL, '2025-10-16 10:51:03.044746+00', '2025-10-16 10:51:03.044746+00');


--
-- Data for Name: transport_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transport_vehicles" ("id", "school_id", "registration_number", "vehicle_model", "capacity", "driver_profile_id", "is_active", "created_at") VALUES
	(1, 1, 'KA-05-MN-1234', 'Tata Marcopolo', 40, NULL, true, '2025-09-22 19:38:44.869785+00'),
	(2, 1, 'KA-01-XY-5678', 'Eicher Starline', 40, NULL, true, '2025-09-22 19:38:44.869785+00'),
	(3, 1, 'KA-03-P-9101', 'SML Isuzu', 30, NULL, true, '2025-09-22 19:38:44.869785+00');


--
-- Data for Name: transport_routes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transport_routes" ("id", "school_id", "name", "vehicle_id", "description", "is_active", "created_at") VALUES
	(1, 1, 'Route A - Jayanagar', 1, 'Covers Jayanagar 4th Block, 9th Block, and surrounding areas.', true, '2025-09-22 19:38:53.85754+00'),
	(2, 1, 'Route B - Koramangala', 2, 'Covers Koramangala 1st Block, 5th Block, and BDA Complex.', true, '2025-09-22 19:38:53.85754+00');


--
-- Data for Name: transport_stops; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transport_stops" ("id", "route_id", "name", "stop_order", "pickup_time", "drop_time", "lat", "lon", "created_at") VALUES
	(1, 1, 'Jayanagar 4th Block Bus Stop', 1, '07:30:00', '16:30:00', 12.927900, 77.582300, '2025-09-22 19:39:34.315797+00'),
	(2, 1, 'Ragigudda Temple', 2, '07:40:00', '16:20:00', 12.916600, 77.582700, '2025-09-22 19:39:34.315797+00'),
	(3, 1, 'Jayanagar 9th Block', 3, '07:50:00', '16:10:00', 12.912300, 77.592500, '2025-09-22 19:39:34.315797+00'),
	(4, 2, 'Koramangala 1st Block', 1, '07:35:00', '16:25:00', 12.935200, 77.624500, '2025-09-22 19:39:34.315797+00'),
	(5, 2, 'BDA Complex Koramangala', 2, '07:45:00', '16:15:00', 12.934500, 77.619100, '2025-09-22 19:39:34.315797+00'),
	(6, 2, 'St. John''s Hospital', 3, '07:55:00', '16:05:00', 12.928400, 77.616300, '2025-09-22 19:39:34.315797+00');


--
-- Data for Name: student_transport_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."student_transport_assignments" ("id", "student_id", "route_id", "stop_id", "academic_year_id", "active_from", "active_to") VALUES
	(1, 21, 1, 1, 2, '2025-09-22', NULL),
	(2, 22, 1, 3, 2, '2025-09-22', NULL),
	(3, 23, 2, 4, 2, '2025-09-22', NULL),
	(4, 24, 2, 6, 2, '2025-09-22', NULL);


--
-- Data for Name: teacher_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teacher_subjects" ("id", "teacher_id", "subject_id", "is_primary", "proficiency_level", "years_teaching_subject", "certification_number", "created_at", "updated_at") VALUES
	(1, 12, 3, true, 'expert', 12, 'CERT-SCI-2013-AP001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(2, 12, 2, false, 'intermediate', 5, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(3, 13, 2, true, 'expert', 15, 'CERT-MATH-2010-SG001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(4, 13, 3, false, 'basic', 2, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(5, 14, 6, true, 'expert', 10, 'CERT-HIN-2015-RK001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(6, 14, 5, false, 'intermediate', 6, 'CERT-KAN-2019-RK002', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(7, 15, 4, true, 'expert', 8, 'CERT-SST-2017-AV001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(8, 15, 6, false, 'basic', 3, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(9, 16, 5, true, 'expert', 14, 'CERT-KAN-2011-SM001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(10, 16, 6, false, 'intermediate', 7, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(11, 17, 6, true, 'intermediate', 6, 'CERT-HIN-2019-MS001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(12, 17, 5, false, 'basic', 2, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(13, 18, 7, true, 'expert', 10, 'CERT-COMP-2015-VR001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(14, 18, 2, false, 'intermediate', 4, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(15, 19, 8, true, 'expert', 12, 'CERT-ART-2013-KN001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(16, 20, 3, true, 'intermediate', 5, 'CERT-SCI-2020-AI001', '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(17, 20, 2, false, 'basic', 2, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(18, 11, 2, false, 'intermediate', 8, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00'),
	(19, 11, 4, false, 'intermediate', 8, NULL, '2025-11-03 12:03:25.679484+00', '2025-11-03 12:03:25.679484+00');


--
-- Data for Name: timetable; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."timetable" ("id", "class_id", "subject_id", "teacher_id", "period_id", "day_of_week", "is_active", "created_at", "updated_at", "academic_year_id", "school_id", "last_modified_by", "is_editable", "last_modified_at") VALUES
	(1, 11, 1, 14, 1, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(18, 19, 3, 12, 2, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(2, 11, 2, 13, 2, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1326, 19, 8, 11, 1, 3, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(19, 19, 1, 14, 3, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(3, 11, 5, 11, 3, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(20, 19, 4, 19, 4, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(21, 19, 6, 19, 6, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(22, 19, 7, 20, 7, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(23, 19, 2, 13, 8, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(1327, 19, 8, 11, 2, 3, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(4, 11, 8, 11, 4, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(5, 11, 3, 12, 6, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(24, 19, 4, 19, 9, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(1328, 19, 8, 11, 1, 4, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(25, 19, 4, 19, 1, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(26, 19, 1, 14, 2, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(6, 11, 1, 14, 7, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(7, 11, 2, 13, 8, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1329, 19, 8, 11, 2, 4, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(8, 11, 5, 11, 9, 1, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(27, 19, 2, 13, 3, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(9, 11, 2, 13, 1, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1330, 19, 3, 12, 2, 1, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(10, 11, 1, 14, 2, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(17, 19, 2, 13, 1, 1, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(11, 11, 3, 12, 3, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1331, 19, 3, 12, 1, 2, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(12, 11, 5, 11, 4, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(28, 19, 3, 12, 4, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(13, 11, 8, 11, 6, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1332, 19, 3, 12, 4, 6, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(29, 19, 7, 20, 6, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(1333, 19, 3, 12, 3, 3, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(30, 19, 5, 19, 7, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(15, 11, 1, 14, 8, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(31, 19, 1, 14, 8, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(14, 11, 2, 13, 7, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(32, 19, 3, 12, 9, 2, false, '2025-09-22 18:44:32.681575+00', '2025-11-05 01:53:10.20405+00', 2, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(1334, 19, 3, 12, 4, 4, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(222, 19, 6, 18, 8, 4, false, '2025-10-08 09:45:14.292194+00', '2025-11-05 01:53:10.20405+00', 1327, 1, NULL, true, '2025-11-05 01:53:10.20405+00'),
	(16, 11, 3, 12, 9, 2, true, '2025-09-22 18:44:32.681575+00', '2025-09-22 18:44:32.681575+00', 2, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1335, 19, 5, 14, 1, 6, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(1336, 19, 5, 14, 7, 5, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(1337, 19, 5, 14, 8, 3, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(1338, 19, 5, 14, 8, 4, false, '2025-11-05 01:54:24.259168+00', '2025-11-05 02:15:16.185787+00', 2, 1, NULL, true, '2025-11-05 02:15:16.185787+00'),
	(194, 673, 1, 11, 1, 1, true, '2025-10-07 09:53:51.024673+00', '2025-10-07 09:53:51.024673+00', 1327, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(195, 674, 2, 11, 2, 2, true, '2025-10-07 10:04:40.590578+00', '2025-10-07 10:07:47.863416+00', 1327, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1507, 19, 8, 11, 2, 1, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1508, 19, 8, 11, 1, 6, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1509, 19, 8, 11, 2, 6, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1510, 19, 3, 12, 4, 1, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1511, 19, 3, 12, 4, 4, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1512, 19, 3, 12, 1, 5, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1513, 19, 3, 12, 3, 6, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1514, 19, 3, 12, 1, 3, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1515, 19, 5, 14, 3, 3, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1516, 19, 5, 14, 7, 6, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(220, 735, 372, NULL, 275, 3, true, '2025-10-08 09:04:24.254106+00', '2025-10-08 09:04:24.254106+00', 1437, 0, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(221, 735, 372, 18, 275, 4, true, '2025-10-08 09:35:17.137226+00', '2025-10-08 09:35:17.137226+00', 1437, 1, NULL, true, '2025-11-04 15:44:23.315958+00'),
	(1517, 19, 5, 14, 8, 1, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1518, 19, 5, 14, 7, 4, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1506, 19, 8, 14, 1, 1, false, '2025-11-05 02:15:44.469233+00', '2025-11-05 05:59:54.922896+00', 2, 1, NULL, true, '2025-11-05 05:59:54.922896+00'),
	(1759, 19, 8, 11, 2, 4, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1760, 19, 8, 11, 1, 6, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1761, 19, 8, 11, 2, 6, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1762, 19, 3, 12, 4, 4, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1763, 19, 3, 12, 3, 3, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1764, 19, 3, 12, 1, 2, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1765, 19, 3, 12, 3, 6, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1766, 19, 3, 12, 2, 5, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1767, 19, 5, 14, 2, 1, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1768, 19, 5, 14, 4, 2, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1769, 19, 5, 14, 7, 6, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:03:40.096153+00', 2, 1, NULL, true, NULL),
	(1758, 19, 8, 14, 1, 4, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:06:56.486617+00', 2, 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-05 06:07:13.163659+00'),
	(1770, 19, 5, 11, 4, 5, true, '2025-11-05 06:03:40.096153+00', '2025-11-05 06:08:25.331214+00', 2, 1, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', true, '2025-11-05 06:08:43.516773+00');


--
-- Data for Name: transfer_certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transfer_certificates" ("id", "student_id", "issued_by", "issue_date", "reason", "tc_document_url", "metadata") VALUES
	(1, 39, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-04-10', 'Parental Transfer to another city.', 'https://storage.supabase.com/schoolos/tcs/tc-2025-0039.pdf', NULL),
	(2, 40, 'bd431bf6-6e9f-4642-84e9-f2284f92e164', '2025-04-12', 'Relocation of family.', 'https://storage.supabase.com/schoolos/tcs/tc-2025-0040.pdf', NULL);


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_preferences" ("user_id", "preferences") VALUES
	('bd431bf6-6e9f-4642-84e9-f2284f92e164', '{"language": "en-US", "notifications": {"email_summary": "daily", "new_message_push": true}}'),
	('0841a053-7266-426e-b681-1d6fab5f9974', '{"theme": "dark", "language": "en-IN", "notifications": {"announcements": true, "attendance_alerts": false}}');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_roles" ("user_id", "role_id") VALUES
	('685c4887-fc38-4d76-a342-ec29de3e0f85', 1),
	('4a39dc4b-5f95-45b0-9b4f-67b253943233', 2),
	('cd307408-9c83-475e-a874-be26288d534c', 2),
	('3e163ee6-cd91-4d63-8bc1-189cc0d13860', 1),
	('bd431bf6-6e9f-4642-84e9-f2284f92e164', 1),
	('bd431bf6-6e9f-4642-84e9-f2284f92e164', 2),
	('4808a1be-01b6-44c1-a17a-c9f104b40854', 2),
	('da134162-0d5d-4215-b93b-aefb747ffa17', 2),
	('dbcff9aa-f28d-47d8-90a6-d7688bb6c41a', 2),
	('b393e32d-fb28-4de5-9713-eeebad9d2c06', 2),
	('70cee473-d0a2-4484-8a84-e0a5cd4e584c', 2),
	('97f8b48a-4302-4f0e-baf8-4a85f8da0cca', 2),
	('ce4ef0c4-c548-49ac-a71f-49655c7482d4', 2),
	('8585907d-5de4-4f6d-ae9a-28b26b0e86a0', 2),
	('ae239cb6-b4f8-49ca-adf2-9e6c3f897f0b', 2),
	('63bed14f-2514-45a2-a718-04c1d0a0b7f0', 3),
	('48ee9d1f-91b2-4d42-aeb3-3e3a03b8f6da', 3),
	('45c6ac9c-9306-40f1-a23d-fbfea313c794', 3),
	('cb0cf1e2-19d0-4ae3-93ed-3073a47a5058', 3),
	('9caad150-de2c-478a-87b6-a712e412947f', 3),
	('3b3f1289-d861-45e2-b4e4-f18d72ca5036', 3),
	('604f3f2f-0741-4ec8-9667-d3f0ecdc76be', 3),
	('226cb810-8e16-4a3d-a879-2c1b325edbeb', 3),
	('d77de604-114c-4c71-8b8c-5616db827da7', 3),
	('12fcf33f-7c54-4466-a44c-ad7602b2c2bc', 3),
	('d8fab006-304c-43bc-a8db-597fdf947c9e', 3),
	('6ca19ec3-9f43-41a2-bef4-fc46f8a9b7b4', 3),
	('706c538d-4134-4cc1-be7e-fb11fa771bfb', 3),
	('25d8b8be-ab84-4758-91e0-427db617eeab', 3),
	('f46c80a9-0e4f-4308-b266-8ddc28ff2228', 3),
	('b4e9499b-5580-488e-8163-e4706459dfb8', 3),
	('dff67664-a554-4629-8e07-f0a6f640ee6d', 3),
	('4d68700c-6741-4abf-a51e-718a58b75500', 3),
	('6bbe0fc4-7caa-4705-a87d-2114dd189669', 3),
	('b195fe70-8761-4c73-a7db-5c95f68ca89b', 3),
	('0841a053-7266-426e-b681-1d6fab5f9974', 4),
	('bd1e6a12-ae7f-4dc0-b8e4-9dd8383f43d3', 4),
	('1ef75d00-3349-4274-8bc8-da135015ab5d', 4),
	('e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404', 4),
	('437bdd8c-d32c-42f2-911a-cd0b6768fa9d', 4),
	('2a2a83fa-2910-4fb5-8e23-23a3c3b667a3', 4),
	('6016ef26-05d5-4d23-b0b1-8b6d6af73cad', 4),
	('c238591e-69ed-424f-b633-8fe0f68f81be', 4),
	('fbd44ebd-1994-4c93-8359-8dbdea32a1e9', 4),
	('99bcb790-2f1c-4e6b-b4ac-24d00d5dbaa4', 4),
	('2327bda4-89df-401f-9d83-3050ee53b23e', 4),
	('3f720771-43ec-4bb3-9ebf-02ac19d8960c', 4),
	('eb064229-c344-4350-b01b-3e8d09be68b3', 4),
	('de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac', 4),
	('d0aba71f-57b7-46bd-8d6d-a76c66987810', 4);


--
-- Data for Name: vehicle_positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."vehicle_positions" ("id", "vehicle_id", "recorded_at", "lat", "lon", "speed", "raw_payload") VALUES
	(1, 1, '2025-09-22 10:40:00+00', 12.912300, 77.592500, 25.00, NULL),
	(2, 1, '2025-09-22 10:50:00+00', 12.916600, 77.582700, 30.00, NULL),
	(3, 1, '2025-09-22 11:00:00+00', 12.927900, 77.582300, 0.00, NULL),
	(4, 2, '2025-09-22 10:35:00+00', 12.928400, 77.616300, 28.00, NULL),
	(5, 2, '2025-09-22 10:45:00+00', 12.934500, 77.619100, 22.00, NULL),
	(6, 2, '2025-09-22 10:55:00+00', 12.935200, 77.624500, 0.00, NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('profile-pictures', 'profile-pictures', NULL, '2025-10-18 08:05:13.339094+00', '2025-10-18 08:05:13.339094+00', false, false, 512000, '{image/jpeg,image/png,image/webp}', NULL, 'STANDARD'),
	('school-media-cultural', 'school-media-cultural', NULL, '2025-10-18 08:07:22.607251+00', '2025-10-18 08:07:22.607251+00', false, false, 2097152, '{image/jpeg,image/png,image/webp,video/mp4}', NULL, 'STANDARD'),
	('school-media-ecommerce', 'school-media-ecommerce', NULL, '2025-10-18 08:08:12.175679+00', '2025-10-18 08:08:12.175679+00', false, false, 512000, '{image/jpeg,image/png,image/webp}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('cba79cf7-fba7-463c-b7eb-31bbdad25207', 'school-media-cultural', '158/7b9de36d-c7cb-44c5-9bbe-43f1416a0aa4.jpg', NULL, '2025-10-18 16:44:22.105862+00', '2025-10-18 16:44:22.105862+00', '2025-10-18 16:44:22.105862+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:44:23.000Z", "contentLength": 30, "httpStatusCode": 200}', 'cea5f942-28c3-491d-a67b-58491c03a607', NULL, '{}', 2),
	('89aa8a45-99b0-493c-a755-9d135cae45b1', 'school-media-cultural', '159/8c9db01f-f84c-427a-ac3a-1cee1f603e26.jpg', NULL, '2025-10-18 16:45:01.851299+00', '2025-10-18 16:45:01.851299+00', '2025-10-18 16:45:01.851299+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:45:02.000Z", "contentLength": 30, "httpStatusCode": 200}', 'e2ac599e-2e8e-4282-9cc2-fd1823466a8f', NULL, '{}', 2),
	('a7628b09-8aba-4ed9-99c1-47fa732b5ada', 'school-media-cultural', '160/d5431377-4a63-46ae-a678-7c54552c821b.jpg', NULL, '2025-10-18 16:47:03.661806+00', '2025-10-18 16:47:03.661806+00', '2025-10-18 16:47:03.661806+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:47:04.000Z", "contentLength": 30, "httpStatusCode": 200}', 'd2f6517a-fd98-4158-925c-0f840e724a60', NULL, '{}', 2),
	('43048644-ced0-443a-88a5-bab1eff02610', 'school-media-cultural', '161/16018d9e-c291-4eef-bd92-db090f1d35ff.jpg', NULL, '2025-10-18 16:49:26.43928+00', '2025-10-18 16:49:26.43928+00', '2025-10-18 16:49:26.43928+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:49:27.000Z", "contentLength": 30, "httpStatusCode": 200}', 'c087f6d9-af69-44a4-afd4-6f27038bac1e', NULL, '{}', 2),
	('185c766e-ed10-4cce-8697-742badf25ec0', 'school-media-cultural', '163/7a3728ab-507b-40c8-b7b4-c394558c592a.jpg', NULL, '2025-10-18 16:50:56.133271+00', '2025-10-18 16:50:56.133271+00', '2025-10-18 16:50:56.133271+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:50:57.000Z", "contentLength": 30, "httpStatusCode": 200}', 'c15b03be-d71e-4a9e-bc46-a5b8d53885e8', NULL, '{}', 2),
	('5714f375-55c0-4fd7-9fae-404e5ce80889', 'school-media-cultural', '165/8cce3c64-2d91-46b4-bd20-98d44f91c070.jpg', NULL, '2025-10-18 16:52:12.607534+00', '2025-10-18 16:52:12.607534+00', '2025-10-18 16:52:12.607534+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:52:13.000Z", "contentLength": 30, "httpStatusCode": 200}', '5ce5abd9-57ba-40c3-b971-dbc9dc266774', NULL, '{}', 2),
	('a6aa0750-29a0-4dda-ae03-5067d4fb32fe', 'school-media-cultural', '167/b953611c-5edb-4497-bb7d-d1b9e3a374bd.jpg', NULL, '2025-10-18 16:54:56.596945+00', '2025-10-18 16:54:56.596945+00', '2025-10-18 16:54:56.596945+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:54:57.000Z", "contentLength": 30, "httpStatusCode": 200}', '87d01da9-e098-47f8-99ea-0c84553b2c69', NULL, '{}', 2),
	('0a561835-97b6-48fd-b0c1-af2cb15d433d', 'school-media-cultural', '169/8d76f94c-abdc-4dbd-91bd-ddec65498396.jpg', NULL, '2025-10-18 16:54:58.715947+00', '2025-10-18 16:54:58.715947+00', '2025-10-18 16:54:58.715947+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:54:59.000Z", "contentLength": 28, "httpStatusCode": 200}', '07e2a43f-498a-40a5-91f1-172c59f440ca', NULL, '{}', 2),
	('b09604d1-27e2-4dd5-b8bc-d74831bd1480', 'school-media-cultural', '170/a4e8d0a6-5bc2-4884-8110-39f1628d2eac.jpg', NULL, '2025-10-18 16:55:33.006971+00', '2025-10-18 16:55:33.006971+00', '2025-10-18 16:55:33.006971+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:55:33.000Z", "contentLength": 30, "httpStatusCode": 200}', 'f13fda08-08d7-474e-81c3-feb96daed9a2', NULL, '{}', 2),
	('8f318fb8-b0b0-471c-9607-6cc8281ed522', 'school-media-cultural', '172/62434030-814c-454f-92e1-af37b85a5774.jpg', NULL, '2025-10-18 16:55:35.244177+00', '2025-10-18 16:55:35.244177+00', '2025-10-18 16:55:35.244177+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:55:36.000Z", "contentLength": 28, "httpStatusCode": 200}', 'ab882dec-f442-4a70-b780-9558c6e49950', NULL, '{}', 2),
	('ff664b3c-6aab-47d6-a368-bd10635b50c4', 'school-media-cultural', '173/057e6832-09f0-4417-826e-7d8526aeb5c8.jpg', NULL, '2025-10-18 16:56:05.212847+00', '2025-10-18 16:56:05.212847+00', '2025-10-18 16:56:05.212847+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:56:06.000Z", "contentLength": 30, "httpStatusCode": 200}', '38f95f0c-77fe-4319-9fb6-aadd6134b329', NULL, '{}', 2),
	('6f7deceb-9a5d-47c3-8afe-756862f3e8e7', 'school-media-cultural', '175/0deffb9c-798a-4915-9b66-7e47e818b9e5.jpg', NULL, '2025-10-18 16:56:07.486653+00', '2025-10-18 16:56:07.486653+00', '2025-10-18 16:56:07.486653+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:56:08.000Z", "contentLength": 28, "httpStatusCode": 200}', '75dd2c09-166e-4ff2-b2dd-7c6e739feed2', NULL, '{}', 2),
	('1e48369b-dbd3-4360-b758-7f405b8cfb98', 'school-media-cultural', '176/b1f4675b-fc5e-4be7-a7f4-596e71e98d02.jpg', NULL, '2025-10-18 16:56:25.999587+00', '2025-10-18 16:56:25.999587+00', '2025-10-18 16:56:25.999587+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:56:26.000Z", "contentLength": 28, "httpStatusCode": 200}', '80512fd9-b460-41b3-bb8e-fe263d77b9a5', NULL, '{}', 2),
	('265cda41-ca1a-4ce5-9654-9512ef802073', 'school-media-cultural', '177/b1aa6274-df5e-465b-be25-ab5475e49bea.jpg', NULL, '2025-10-18 16:56:52.926116+00', '2025-10-18 16:56:52.926116+00', '2025-10-18 16:56:52.926116+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:56:53.000Z", "contentLength": 28, "httpStatusCode": 200}', '7cb7230b-9987-4ab7-924d-10dad7db395f', NULL, '{}', 2),
	('fb9ffc65-1e82-4c92-9208-eeb126f8c95d', 'school-media-cultural', '178/111be0dc-46b4-4c39-919f-4dcf657019ef.jpg', NULL, '2025-10-18 16:57:54.41009+00', '2025-10-18 16:57:54.41009+00', '2025-10-18 16:57:54.41009+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:57:55.000Z", "contentLength": 30, "httpStatusCode": 200}', 'fa045664-1e14-4f99-a596-877f7fc8b1c6', NULL, '{}', 2),
	('7b7eb6fb-c552-4fb5-826b-616e69dc1bc2', 'school-media-cultural', '180/fc48cecf-c153-4ab1-a476-02944e9ac12e.jpg', NULL, '2025-10-18 16:57:56.546099+00', '2025-10-18 16:57:56.546099+00', '2025-10-18 16:57:56.546099+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:57:57.000Z", "contentLength": 28, "httpStatusCode": 200}', 'c9af8128-8804-40a9-9aab-408b11d8275c', NULL, '{}', 2),
	('17b44d75-adf0-4490-8152-04cfd654a694', 'school-media-cultural', '181/7a403b15-3bf3-44ff-9c7b-c17d62e5285d.jpg', NULL, '2025-10-18 16:59:02.816805+00', '2025-10-18 16:59:02.816805+00', '2025-10-18 16:59:02.816805+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T16:59:03.000Z", "contentLength": 28, "httpStatusCode": 200}', '36d7083c-5e0d-4bb6-af41-a76dfee5dc82', NULL, '{}', 2),
	('d02cecd1-9be6-4240-ba25-bf84ed4b1e22', 'school-media-cultural', '182/f8d64166-e2f6-47d8-93a8-9a86cb8c7cfb.jpg', NULL, '2025-10-18 17:00:15.530538+00', '2025-10-18 17:00:15.530538+00', '2025-10-18 17:00:15.530538+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:00:16.000Z", "contentLength": 28, "httpStatusCode": 200}', '1d4bf2fb-8fbf-477a-9c91-728442974b44', NULL, '{}', 2),
	('85f345a2-343a-4a2d-83e2-3b7cada424e6', 'school-media-cultural', '183/c6b4e67a-10d6-445e-be64-c902b0b26055.jpg', NULL, '2025-10-18 17:00:43.268389+00', '2025-10-18 17:00:43.268389+00', '2025-10-18 17:00:43.268389+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:00:44.000Z", "contentLength": 30, "httpStatusCode": 200}', '02a39662-5152-409b-bd63-5ca8e984e912', NULL, '{}', 2),
	('eaa2ae3e-4eac-4d85-be9c-e58b3ab5c0d4', 'school-media-cultural', '185/8d2f0d1a-a68d-46a4-a25c-6bfda57fdeab.jpg', NULL, '2025-10-18 17:00:45.526469+00', '2025-10-18 17:00:45.526469+00', '2025-10-18 17:00:45.526469+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:00:46.000Z", "contentLength": 28, "httpStatusCode": 200}', '79c291a6-02b4-4a95-a185-1a995ceb7f9d', NULL, '{}', 2),
	('bd8da0d7-57d8-4c4c-91f7-ae6a49978647', 'school-media-cultural', '197/2dda4af5-5d2e-4cbd-8384-361efa515a48.jpg', NULL, '2025-10-18 17:07:13.734501+00', '2025-10-18 17:07:13.734501+00', '2025-10-18 17:07:13.734501+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:07:14.000Z", "contentLength": 30, "httpStatusCode": 200}', 'dee32134-7d91-4648-b7f5-f3cc71ff8a1e', NULL, '{}', 2),
	('d4317a7c-a3a9-419c-8894-82602c692937', 'school-media-cultural', '199/459a7ec7-5c67-4832-b7ed-01eb34f74538.jpg', NULL, '2025-10-18 17:07:15.820264+00', '2025-10-18 17:07:15.820264+00', '2025-10-18 17:07:15.820264+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:07:16.000Z", "contentLength": 28, "httpStatusCode": 200}', '6cbbd890-a037-4ec5-b7fb-f57dc5f300cd', NULL, '{}', 2),
	('ad681ba7-34d4-4eef-bfad-0884085c5d13', 'school-media-cultural', '211/397f1ab7-991c-44e1-997e-300221691294.jpg', NULL, '2025-10-18 17:18:52.421622+00', '2025-10-18 17:18:52.421622+00', '2025-10-18 17:18:52.421622+00', '{"eTag": "\"1fd3a71ca5ab8ebb9d9b687cf52dc18c\"", "size": 30, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:18:53.000Z", "contentLength": 30, "httpStatusCode": 200}', 'd24e11b8-b5b9-4ba8-9584-bfddb94221d9', NULL, '{}', 2),
	('346f165b-ac34-4666-ac41-60fe3f42cd31', 'school-media-cultural', '213/3701d08c-103e-47e4-ab62-9f1f5b782b55.jpg', NULL, '2025-10-18 17:18:54.440549+00', '2025-10-18 17:18:54.440549+00', '2025-10-18 17:18:54.440549+00', '{"eTag": "\"628789a98f04008673f0fea5d9a11fbc\"", "size": 28, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-18T17:18:55.000Z", "contentLength": 28, "httpStatusCode": 200}', 'eecdcb3c-3205-414a-85f5-31e9d16b02b6', NULL, '{}', 2),
	('8a81cad4-ea3e-4365-aa17-a06f1609925f', 'school-media-cultural', '801/b9ff9243-c796-46d9-ac70-63d72a600209.jpeg', NULL, '2025-10-20 12:46:17.82262+00', '2025-10-20 12:46:17.82262+00', '2025-10-20 12:46:17.82262+00', '{"eTag": "\"54d9a95dafcef644a92923cab7e5f942\"", "size": 139376, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-20T12:46:18.000Z", "contentLength": 139376, "httpStatusCode": 200}', 'dd5169dd-c014-4456-ab02-826f25900f86', NULL, '{}', 2),
	('b70c51bc-8382-417f-8c8f-3b6e78dcb1eb', 'school-media-cultural', '806/3382e2af-9201-4ce0-98aa-39581c692793.jpeg', NULL, '2025-10-20 14:11:58.489397+00', '2025-10-20 14:11:58.489397+00', '2025-10-20 14:11:58.489397+00', '{"eTag": "\"ace1da61827ab92aec387044e473862d\"", "size": 134430, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2025-10-20T14:11:59.000Z", "contentLength": 134430, "httpStatusCode": 200}', '63af90f3-84bd-4a34-9514-404d1fb2b199', NULL, '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('school-media-cultural', '158', '2025-10-18 16:44:22.105862+00', '2025-10-18 16:44:22.105862+00'),
	('school-media-cultural', '159', '2025-10-18 16:45:01.851299+00', '2025-10-18 16:45:01.851299+00'),
	('school-media-cultural', '160', '2025-10-18 16:47:03.661806+00', '2025-10-18 16:47:03.661806+00'),
	('school-media-cultural', '161', '2025-10-18 16:49:26.43928+00', '2025-10-18 16:49:26.43928+00'),
	('school-media-cultural', '163', '2025-10-18 16:50:56.133271+00', '2025-10-18 16:50:56.133271+00'),
	('school-media-cultural', '165', '2025-10-18 16:52:12.607534+00', '2025-10-18 16:52:12.607534+00'),
	('school-media-cultural', '167', '2025-10-18 16:54:56.596945+00', '2025-10-18 16:54:56.596945+00'),
	('school-media-cultural', '169', '2025-10-18 16:54:58.715947+00', '2025-10-18 16:54:58.715947+00'),
	('school-media-cultural', '170', '2025-10-18 16:55:33.006971+00', '2025-10-18 16:55:33.006971+00'),
	('school-media-cultural', '172', '2025-10-18 16:55:35.244177+00', '2025-10-18 16:55:35.244177+00'),
	('school-media-cultural', '173', '2025-10-18 16:56:05.212847+00', '2025-10-18 16:56:05.212847+00'),
	('school-media-cultural', '175', '2025-10-18 16:56:07.486653+00', '2025-10-18 16:56:07.486653+00'),
	('school-media-cultural', '176', '2025-10-18 16:56:25.999587+00', '2025-10-18 16:56:25.999587+00'),
	('school-media-cultural', '177', '2025-10-18 16:56:52.926116+00', '2025-10-18 16:56:52.926116+00'),
	('school-media-cultural', '178', '2025-10-18 16:57:54.41009+00', '2025-10-18 16:57:54.41009+00'),
	('school-media-cultural', '180', '2025-10-18 16:57:56.546099+00', '2025-10-18 16:57:56.546099+00'),
	('school-media-cultural', '181', '2025-10-18 16:59:02.816805+00', '2025-10-18 16:59:02.816805+00'),
	('school-media-cultural', '182', '2025-10-18 17:00:15.530538+00', '2025-10-18 17:00:15.530538+00'),
	('school-media-cultural', '183', '2025-10-18 17:00:43.268389+00', '2025-10-18 17:00:43.268389+00'),
	('school-media-cultural', '185', '2025-10-18 17:00:45.526469+00', '2025-10-18 17:00:45.526469+00'),
	('school-media-cultural', '197', '2025-10-18 17:07:13.734501+00', '2025-10-18 17:07:13.734501+00'),
	('school-media-cultural', '199', '2025-10-18 17:07:15.820264+00', '2025-10-18 17:07:15.820264+00'),
	('school-media-cultural', '211', '2025-10-18 17:18:52.421622+00', '2025-10-18 17:18:52.421622+00'),
	('school-media-cultural', '213', '2025-10-18 17:18:54.440549+00', '2025-10-18 17:18:54.440549+00'),
	('school-media-cultural', '801', '2025-10-20 12:46:17.82262+00', '2025-10-20 12:46:17.82262+00'),
	('school-media-cultural', '806', '2025-10-20 14:11:58.489397+00', '2025-10-20 14:11:58.489397+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 213, true);


--
-- Name: academic_years_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."academic_years_id_seq"', 7694, true);


--
-- Name: achievement_point_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."achievement_point_rules_id_seq"', 119, true);


--
-- Name: album_targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."album_targets_id_seq"', 1436, true);


--
-- Name: albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."albums_id_seq"', 2090, true);


--
-- Name: announcement_targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."announcement_targets_id_seq"', 785, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."announcements_id_seq"', 776, true);


--
-- Name: applied_discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."applied_discounts_id_seq"', 160, true);


--
-- Name: attendance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."attendance_records_id_seq"', 1915, true);


--
-- Name: audits_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."audits_audit_id_seq"', 108, true);


--
-- Name: cart_items_cart_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."cart_items_cart_item_id_seq"', 4548, true);


--
-- Name: carts_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."carts_cart_id_seq"', 3722, true);


--
-- Name: class_fee_structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."class_fee_structure_id_seq"', 268, true);


--
-- Name: class_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."class_subjects_id_seq"', 847, true);


--
-- Name: classes_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."classes_class_id_seq"', 4316, true);


--
-- Name: club_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."club_activities_id_seq"', 139, true);


--
-- Name: club_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."club_memberships_id_seq"', 64, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."clubs_id_seq"', 170, true);


--
-- Name: conversations_conversation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."conversations_conversation_id_seq"', 255, true);


--
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."discounts_id_seq"', 359, true);


--
-- Name: employment_statuses_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."employment_statuses_status_id_seq"', 769, true);


--
-- Name: event_rsvps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_rsvps_id_seq"', 3, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_id_seq"', 6, true);


--
-- Name: exam_types_exam_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."exam_types_exam_type_id_seq"', 2696, true);


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."exams_id_seq"', 2648, true);


--
-- Name: fee_components_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."fee_components_id_seq"', 870, true);


--
-- Name: fee_structure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."fee_structure_id_seq"', 513, true);


--
-- Name: fee_template_components_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."fee_template_components_id_seq"', 400, true);


--
-- Name: fee_terms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."fee_terms_id_seq"', 253, true);


--
-- Name: form_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."form_submissions_id_seq"', 5, true);


--
-- Name: forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."forms_id_seq"', 2, true);


--
-- Name: gateway_webhook_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."gateway_webhook_events_id_seq"', 93, true);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invoice_items_id_seq"', 3141, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invoices_id_seq"', 909, true);


--
-- Name: logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."logs_log_id_seq"', 146, true);


--
-- Name: marks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."marks_id_seq"', 1729, true);


--
-- Name: media_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."media_items_id_seq"', 550, true);


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."messages_message_id_seq"', 504, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."order_items_id_seq"', 467, true);


--
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."orders_order_id_seq"', 2031, true);


--
-- Name: payment_allocations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."payment_allocations_id_seq"', 22, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."payments_id_seq"', 1479, true);


--
-- Name: periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."periods_id_seq"', 4358, true);


--
-- Name: product_album_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_album_links_id_seq"', 1, false);


--
-- Name: product_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_categories_category_id_seq"', 1005, true);


--
-- Name: product_package_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_package_rules_id_seq"', 2, true);


--
-- Name: product_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."product_packages_id_seq"', 218, true);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."products_product_id_seq"', 10777, true);


--
-- Name: refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."refunds_id_seq"', 1, true);


--
-- Name: roles_definition_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."roles_definition_role_id_seq"', 7, true);


--
-- Name: rte_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."rte_reservations_id_seq"', 2, true);


--
-- Name: schools_school_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."schools_school_id_seq"', 597, true);


--
-- Name: streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."streams_id_seq"', 6, true);


--
-- Name: student_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."student_achievements_id_seq"', 212, true);


--
-- Name: student_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."student_contacts_id_seq"', 720, true);


--
-- Name: student_fee_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."student_fee_assignments_id_seq"', 108, true);


--
-- Name: student_fee_discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."student_fee_discounts_id_seq"', 243, true);


--
-- Name: student_transport_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."student_transport_assignments_id_seq"', 4, true);


--
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."students_student_id_seq"', 3068, true);


--
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."subjects_subject_id_seq"', 3207, true);


--
-- Name: teacher_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."teacher_subjects_id_seq"', 19, true);


--
-- Name: teachers_teacher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."teachers_teacher_id_seq"', 1437, true);


--
-- Name: timetable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."timetable_id_seq"', 4027, true);


--
-- Name: transfer_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."transfer_certificates_id_seq"', 2, true);


--
-- Name: transport_routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."transport_routes_id_seq"', 2, true);


--
-- Name: transport_stops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."transport_stops_id_seq"', 6, true);


--
-- Name: transport_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."transport_vehicles_id_seq"', 3, true);


--
-- Name: vehicle_positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."vehicle_positions_id_seq"', 6, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict XuUYrzNkLwAT3PwhFteT4gVeyZJrDUXeCMjKOC7L04vFWbppdJmCsWzgR9LTtOL

RESET ALL;
