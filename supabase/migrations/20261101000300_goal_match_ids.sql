-- The site's football data moved from TheStatsAPI (match ids mt_123…) to Goal API (ids such as
-- cmvgff319ojujnv07n48jhibs). Notes and match reports follow the matches to their new ids; the old
-- format stays accepted so nothing written before is rejected.

alter table public.match_notes drop constraint match_notes_external_match_id_check;
alter table public.match_notes add constraint match_notes_external_match_id_check
  check (external_match_id ~ '^(mt_[0-9]+|[a-z0-9]{20,32})$');

with ids (old_id, new_id) as (values
  ('mt_982767800', 'cmtwihhyf5ec6qs07aa74zwqo'),
  ('mt_735424375', 'cmu9exfop16wikm08sjxacs94'),
  ('mt_982177608', 'cmuuzned3tv2vti07yy6v9d7j'),
  ('mt_371866534', 'cmuuzodrtu4noti07roj377su'),
  ('mt_468151508', 'cmvgff319ojujnv07n48jhibs')
),
notes as (
  update public.match_notes n set external_match_id = ids.new_id from ids where n.external_match_id = ids.old_id returning 1
)
update public.news_articles a set match_id = ids.new_id from ids where a.match_id = ids.old_id;

-- The basketball game against FUS Rabat was played on 26 October: 61-51
update public.matches set match_status = 'finished', score_home = 61, score_away = 51
where slug = 'bb-wac-fus-2026-10-26' and match_status = 'scheduled';
