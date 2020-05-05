create extension "uuid-ossp";

select uuid_generate_v4()

insert into public.transactions (

SELECT uuid_generate_v4() as transaction_id,
	'6d9b65c5-3f51-65d8-948d-81519f207bb0' as account_id,
	imported_date,
	category_id,
	user_comment,
	override_posting_date,
	override_description,
	service_type,
	override_category_id,
	transaction_status,
	processing_status,
	details,
	posting_date,
	description,
	amount,
	transaction_type,
	balance,
	check_no,
	business_id,
	credit_card_transaction_type,
	bank_defined_transaction
FROM public.transactions
where account_id = '90f150c3-1bb7-f896-62a7-af8b3793834f'
)


select *
from public.transactions
where account_id = '90f150c3-1bb7-f896-62a7-af8b3793834f' 