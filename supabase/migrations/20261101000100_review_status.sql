-- Editorial workflow: an editor without publishing rights submits an article for review.
-- On its own migration: a new enum value can't be used in the transaction that adds it.

alter type public.content_status add value if not exists 'review' before 'published';
