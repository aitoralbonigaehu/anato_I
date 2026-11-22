-- Allow 200 PIN requests per IP in each 10-minute window.
create or replace function public.pin_reserve_attempt(p_ip_key text, p_name_key text, p_signin boolean, p_token uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_ip public.pin_ip_limits%rowtype;
  v_name public.pin_attempts%rowtype;
begin
  insert into public.pin_ip_limits(ip_key, hits, window_started) values (p_ip_key, 0, v_now)
    on conflict (ip_key) do nothing;
  select * into v_ip from public.pin_ip_limits where ip_key = p_ip_key for update;
  if v_ip.window_started <= v_now - interval '10 minutes' then
    update public.pin_ip_limits set hits = 0, window_started = v_now where ip_key = p_ip_key;
    v_ip.hits := 0;
    v_ip.window_started := v_now;
  end if;
  if v_ip.hits >= 200 then
    return jsonb_build_object('allowed', false, 'retry_after', greatest(1, ceil(extract(epoch from (v_ip.window_started + interval '10 minutes' - v_now)))::integer));
  end if;
  update public.pin_ip_limits set hits = hits + 1 where ip_key = p_ip_key;
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
