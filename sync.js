// 公開用の3項目だけを返す既存GASへ接続。認証情報はブラウザへ渡さない。
const MEMBER_CALENDAR_ENDPOINT = 'https://script.google.com/macros/s/AKfycbydPN7D-_6ejeo20NOd9P6gtiMTyZKAEcXBAQZuTmyafP9zUbfNggn8xVGynz5ssxSJ/exec';
const MEMBER_CALENDAR_INTERVAL = 60000;
let calendarRequestSequence = 0;
let calendarRequestRunning = false;
let calendarLastAttempt = 0;

function requestMemberCalendar() {
  return new Promise((resolve, reject) => {
    const callback = `__rrCalendar${++calendarRequestSequence}`;
    const script = document.createElement('script');
    const cleanup = () => {
      clearTimeout(timeout);
      script.remove();
      delete window[callback];
    };
    const timeout = setTimeout(() => { cleanup(); reject(new Error('Calendar request timed out')); }, 30000);
    window[callback] = payload => { cleanup(); resolve(payload); };
    script.onerror = () => { cleanup(); reject(new Error('Calendar request failed')); };
    script.referrerPolicy = 'no-referrer';
    const url = new URL(MEMBER_CALENDAR_ENDPOINT);
    url.searchParams.set('action', 'calendar');
    url.searchParams.set('callback', callback);
    url.searchParams.set('_', String(Date.now()));
    script.src = url.toString();
    document.head.append(script);
  });
}

async function syncMemberCalendar() {
  if (calendarRequestRunning) return;
  calendarRequestRunning = true;
  calendarLastAttempt = Date.now();
  const status = document.getElementById('sync-status');
  try {
    const payload = await requestMemberCalendar();
    if (!payload || payload.ok !== true || !Array.isArray(payload.events) || !Number.isFinite(Date.parse(payload.fetchedAt))) {
      throw new Error('Calendar response is invalid');
    }
    // 全件を検証してから差し替える。不正な応答で最後の正常な予定を消さない。
    const updated = normalizeCalendarEvents(payload.events);
    const changed = JSON.stringify(updated) !== JSON.stringify(schedule);
    schedule = updated;
    if (changed) render();
    const fetchedAt = new Date(payload.fetchedAt);
    status.textContent = '自動更新：' + new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(fetchedAt) + '（1分ごとに確認）';
    status.dataset.state = 'live';
    status.dataset.fetchedAt = payload.fetchedAt;
  } catch (error) {
    status.textContent = '更新を確認できませんでした。前回の予定を表示しています。次の自動更新をお待ちください。';
    status.dataset.state = 'stale';
  } finally {
    calendarRequestRunning = false;
  }
}

syncMemberCalendar();
setInterval(() => { if (!document.hidden) syncMemberCalendar(); }, MEMBER_CALENDAR_INTERVAL);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && Date.now() - calendarLastAttempt >= MEMBER_CALENDAR_INTERVAL) syncMemberCalendar();
});
