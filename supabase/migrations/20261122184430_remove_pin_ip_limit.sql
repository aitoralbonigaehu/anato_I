-- Keep p_ip_key in the RPC signature for compatibility with deployed callers.
create or replace function public.pin_reserve_attempt(p_ip_key text, p_name_key text, p_signin boolean, p_token uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_name public.pin_attempts%rowtype;
begin
  if not p_signin then return jsonb_build_object('allowed', true); end if;

  insert into public.pin_attempts(name_key, fails, updated_at) values (p_name_key, 0, v_now)
    on conflict (name_key) do nothing;
  select * into v_name from public.pin_attempts where name_key = p_name_key for update;
  if v_name.locked_until is not null and v_name.locked_until > v_now then
    return jsonb_build_object('allowed', false, 'retry_after', greatest(1, ceil(extract(epoch from (v_name.locked_until - v_now)))::integer));
  end if;
  if v_name.locked_until is not null or v_name.updated_at <= v_now - interval '15 minutes' then
    v_name.fails := 0;
  end if;
  update public.pin_attempts set fails = v_name.fails + 1,
    locked_until = case when v_name.fails + 1 >= 5 then v_now + interval '15 minutes' else null end,
    updated_at = v_now, reservation = p_token where name_key = p_name_key;
  return jsonb_build_object('allowed', true);
end $$;
