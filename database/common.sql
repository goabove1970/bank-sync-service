SELECT  * FROM public.account;

update public.account set bank_routing_number = NULL;

SELECT  * FROM public.account where account_id = '90f150c3-1bb7-f896-62a7-af8b3793834f'
update public.account set account_alias = 'FREEDOM' where account_id = '766bc1ab-8b57-7f11-2e7c-eed123cd3cb7'
SELECT  * FROM public.users

-- 098be70d-f5c1-0799-e0b2-9226eb0c4f1d -- Don
-- 26a89c19-f32b-de23-85ca-4a8929c61e36 -- Ievgen

SELECT  * FROM public.user_account where user_id = '098be70d-f5c1-0799-e0b2-9226eb0c4f1d'

-- Ievgen
--  6d9b65c5-3f51-65d8-948d-81519f207bb0 -- Sapphire
--  766bc1ab-8b57-7f11-2e7c-eed123cd3cb7 -- Freedom
--  b4b260cb-d258-16e2-d732-5d9136234c89 -- Debit / Checking

-- Don
--  fcce471c-0daf-010d-1f32-14068bb7fc70 -- Debit
--  3b50216e-779c-f170-6604-a126320eef88  -- Freedom
--  90f150c3-1bb7-f896-62a7-af8b3793834f -- Sapphire


SELECT  * FROM public.bank_connections
SELECT  * FROM public.transactions where account_id = 'b4b260cb-d258-16e2-d732-5d9136234c89'
SELECT  * FROM public.transactions where description like '%Payment to Chase%'

--delete from public.transactions where account_id = '766bc1ab-8b57-7f11-2e7c-eed123cd3cb7'

--delete from public.bank_connections where login = 'goabove1970';
--delete from public.bank_connections where user_id = '26a89c19-f32b-de23-85ca-4a8929c61e36';
--delete from public.user_account where user_id = '26a89c19-f32b-de23-85ca-4a8929c61e36';
--delete from public.account where create_date = '2020-05-05';