# Supabase — ikaskuntzaren aurrerapena (oraindik konektatu gabe)

Backend hau prest dago baina **ez dago UIra lotuta**. Ezer ez da grabatzen eta `/aurrerapena` orriak 404 ematen du
behean azaltzen diren aldagaiak ezarri arte.

## Konektatzeko urratsak

1. Sortu Supabase proiektu bat eta exekutatu `migrations/0001_progress.sql` (SQL Editor-ean edo `supabase db push`).
   `study_sessions` eta `answers` taulek RLS gaituta dute: erabiltzaile bakoitzak bere errenkadak bakarrik irakurri/idatzi
   ditzake (`auth.uid() = user_id`). `topic_progress` ikuspegiak (`security_invoker`) gai bakoitzeko laburpena ematen du.
2. Ezarri ingurune-aldagaiak (`.env.local` edo hostingean):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<proiektua>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   NEXT_PUBLIC_PROGRESS_ENABLED=1
   ```

   Hirurak behar dira; bestela `lib/progress` bezeroa no-op da (ez du ezer egiten eta ez du errorerik jaurtitzen).
3. Saioa hasteko sistema bat gehitu (Supabase Auth) eta erabiltzailearen access token-a eman
   `setProgressAccessToken(token)` bidez. Tokenik gabe, RLSak idazketak/irakurketak blokeatzen ditu.
4. Grabaketa-deiak simulagailuan lotu: `recordStudyTime(topic, stageId, seconds)` eta
   `recordAnswer(topic, questionId, correct)`. Panela: `/aurrerapena` (ez dago estekarik oraindik).

Oharra: bezeroak Supabase REST APIa (PostgREST) `fetch` hutsarekin erabiltzen du; ez du `@supabase/supabase-js` behar.
