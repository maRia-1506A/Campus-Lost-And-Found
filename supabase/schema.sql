-- ============================================================
-- UniFind – Campus Lost & Found
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. POSTS ────────────────────────────────────────────────
create table if not exists posts (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('lost', 'found')),
  title           text not null,
  description     text not null,
  category        text not null default 'Other',
  location        text not null default '',
  date_lost       date,
  contact_name    text not null default '',
  contact_method  text not null default '',
  image           text not null default '',
  status          text not null default 'open' check (status in ('open', 'resolved')),
  author_id       uuid,
  author_name     text not null default '',
  author_avatar   text not null default '',
  created_at      timestamptz not null default now()
);

-- Ensure columns exist if table was already created earlier
alter table posts add column if not exists author_id uuid;
alter table posts add column if not exists author_name text default '';
alter table posts add column if not exists author_avatar text default '';

-- ── 2. LIKES ────────────────────────────────────────────────
create table if not exists likes (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references posts(id) on delete cascade,
  user_id     text not null,
  created_at  timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ── 3. COMMENTS ─────────────────────────────────────────────
create table if not exists comments (
  id               uuid primary key default gen_random_uuid(),
  post_id          uuid not null references posts(id) on delete cascade,
  user_id          text not null,
  text             text not null,
  author_name      text not null default 'Anonymous',
  author_initials  text not null default 'AN',
  author_avatar    text not null default '',
  created_at       timestamptz not null default now()
);

alter table comments add column if not exists author_avatar text default '';

-- ── 4. INDEXES ──────────────────────────────────────────────
create index if not exists idx_posts_type        on posts(type);
create index if not exists idx_posts_status      on posts(status);
create index if not exists idx_posts_created_at  on posts(created_at desc);
create index if not exists idx_likes_post_id     on likes(post_id);
create index if not exists idx_comments_post_id  on comments(post_id);

-- ── 5. ROW LEVEL SECURITY ───────────────────────────────────
alter table posts    enable row level security;
alter table likes    enable row level security;
alter table comments enable row level security;

-- Posts
drop policy if exists "Public read posts" on posts;
drop policy if exists "Public insert posts" on posts;
drop policy if exists "Public update posts" on posts;
drop policy if exists "Public delete posts" on posts;
create policy "Public read posts"   on posts for select using (true);
create policy "Public insert posts" on posts for insert with check (true);
create policy "Public update posts" on posts for update using (true);
create policy "Public delete posts" on posts for delete using (true);

-- Likes
drop policy if exists "Public read likes" on likes;
drop policy if exists "Public insert likes" on likes;
drop policy if exists "Public delete likes" on likes;
create policy "Public read likes"   on likes for select using (true);
create policy "Public insert likes" on likes for insert with check (true);
create policy "Public delete likes" on likes for delete using (true);

-- Comments
drop policy if exists "Public read comments" on comments;
drop policy if exists "Public insert comments" on comments;
drop policy if exists "Public delete comments" on comments;
create policy "Public read comments"   on comments for select using (true);
create policy "Public insert comments" on comments for insert with check (true);
create policy "Public delete comments" on comments for delete using (true);

-- ── 6. HELPER VIEW: posts with like/comment counts ──────────
-- Drop first to avoid column conflict errors on re-run
drop view if exists posts_with_counts;

create view posts_with_counts as
  select
    p.*,
    coalesce(l.like_count, 0)    as like_count,
    coalesce(c.comment_count, 0) as comment_count
  from posts p
  left join (
    select post_id, count(*) as like_count
    from likes
    group by post_id
  ) l on l.post_id = p.id
  left join (
    select post_id, count(*) as comment_count
    from comments
    group by post_id
  ) c on c.post_id = p.id;

-- ── 7. CONVERSATIONS ─────────────────�-- ── 8. MESSAGES ──────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null,
  sender_name     text not null default '',
  sender_avatar   text not null default '',
  text            text not null,
  read_by_a       boolean not null default false,
  read_by_b       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_conversations_participant_a on conversations(participant_a);
create index if not exists idx_conversations_participant_b on conversations(participant_b);
create index if not exists idx_conversations_post_id       on conversations(post_id);
create index if not exists idx_messages_conversation_id    on messages(conversation_id);
create index if not exists idx_messages_created_at         on messages(created_at desc);

-- ── 9. RLS FOR CONVERSATIONS & MESSAGES ──────────────────────
alter table conversations enable row level security;
alter table messages       enable row level security;

drop policy if exists "Participants read conversations"   on conversations;
drop policy if exists "Participants insert conversations" on conversations;

create policy "Participants read conversations" on conversations
  for select using (
    auth.uid() = participant_a OR auth.uid() = participant_b
  );

create policy "Participants insert conversations" on conversations
  for insert with check (
    auth.uid() = participant_a
  );

drop policy if exists "Participants read messages"   on messages;
drop policy if exists "Participants insert messages" on messages;
drop policy if exists "Participants update messages" on messages;

create policy "Participants read messages" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

create policy "Participants insert messages" on messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

create policy "Participants update messages" on messages
  for update using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

-- ── 10. NOTIFICATIONS ────────────────────────────────────────
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  actor_id     uuid,
  actor_name   text not null default 'Someone',
  actor_avatar text not null default '',
  type         text not null check (type in ('like', 'comment', 'message')),
  post_id      uuid references posts(id) on delete cascade,
  title        text not null default '',
  message      text not null default '',
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_is_read on notifications(user_id, is_read);

alter table notifications enable row level security;

drop policy if exists "Users can read own notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;
drop policy if exists "Anyone can insert notifications" on notifications;

create policy "Users can read own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

create policy "Anyone can insert notifications" on notifications
  for insert with check (true);
icy "Public read likes"   on likes for select using (true);
create policy "Public insert likes" on likes for insert with check (true);
create policy "Public delete likes" on likes for delete using (true);

-- Comments
drop policy if exists "Public read comments" on comments;
drop policy if exists "Public insert comments" on comments;
drop policy if exists "Public delete comments" on comments;
create policy "Public read comments"   on comments for select using (true);
create policy "Public insert comments" on comments for insert with check (true);
create policy "Public delete comments" on comments for delete using (true);

-- ── 6. HELPER VIEW: posts with like/comment counts ──────────
drop view if exists posts_with_counts;

create view posts_with_counts as
  select
    p.*,
    coalesce(l.like_count, 0)    as like_count,
    coalesce(c.comment_count, 0) as comment_count
  from posts p
  left join (
    select post_id, count(*) as like_count
    from likes
    group by post_id
  ) l on l.post_id = p.id
  left join (
    select post_id, count(*) as comment_count
    from comments
    group by post_id
  ) c on c.post_id = p.id;

-- ── 7. CONVERSATIONS ─────────────────────────────────────────
create table if not exists conversations (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references posts(id) on delete cascade,
  participant_a uuid not null,
  participant_b uuid not null,
  created_at    timestamptz not null default now(),
  unique (post_id, participant_a, participant_b)
);

-- ── 8. MESSAGES ──────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null,
  sender_name     text not null default '',
  sender_avatar   text not null default '',
  text            text not null,
  read_by_a       boolean not null default false,
  read_by_b       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_conversations_participant_a on conversations(participant_a);
create index if not exists idx_conversations_participant_b on conversations(participant_b);
create index if not exists idx_conversations_post_id       on conversations(post_id);
create index if not exists idx_messages_conversation_id    on messages(conversation_id);
create index if not exists idx_messages_created_at         on messages(created_at desc);

-- ── 9. RLS FOR CONVERSATIONS & MESSAGES ──────────────────────
alter table conversations enable row level security;
alter table messages       enable row level security;

drop policy if exists "Participants read conversations"   on conversations;
drop policy if exists "Participants insert conversations" on conversations;

create policy "Participants read conversations" on conversations
  for select using (
    auth.uid() = participant_a OR auth.uid() = participant_b
  );

create policy "Participants insert conversations" on conversations
  for insert with check (
    auth.uid() = participant_a
  );

drop policy if exists "Participants read messages"   on messages;
drop policy if exists "Participants insert messages" on messages;
drop policy if exists "Participants update messages" on messages;

create policy "Participants read messages" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

create policy "Participants insert messages" on messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

create policy "Participants update messages" on messages
  for update using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
    )
  );

-- ── 10. NOTIFICATIONS ────────────────────────────────────────
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  actor_id     uuid,
  actor_name   text not null default 'Someone',
  actor_avatar text not null default '',
  type         text not null check (type in ('like', 'comment', 'message')),
  post_id      uuid references posts(id) on delete cascade,
  title        text not null default '',
  message      text not null default '',
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_is_read on notifications(user_id, is_read);

alter table notifications enable row level security;

drop policy if exists "Users can read own notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;
drop policy if exists "Anyone can insert notifications" on notifications;

create policy "Users can read own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

create policy "Anyone can insert notifications" on notifications
  for insert with check (true);

