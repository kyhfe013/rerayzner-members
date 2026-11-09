const CLUB_ENDPOINT = 'https://script.google.com/macros/s/AKfycbydPN7D-_6ejeo20NOd9P6gtiMTyZKAEcXBAQZuTmyafP9zUbfNggn8xVGynz5ssxSJ/exec';
let clubRequestNumber = 0;

function requestClubDirectory() {
  return new Promise((resolve, reject) => {
    const callback = '__rrClub' + (++clubRequestNumber);
    const script = document.createElement('script');
    const complete = (result, error) => {
      clearTimeout(timer);
      script.remove();
      delete window[callback];
      if (error) reject(error);
      else resolve(result);
    };
    const timer = setTimeout(() => complete(null, new Error('部活動の取得時間を超過しました。')), 30000);
    window[callback] = data => complete(data);
    script.onerror = () => complete(null, new Error('部活動に接続できませんでした。'));
    const url = new URL(CLUB_ENDPOINT);
    url.searchParams.set('action', 'clubs');
    url.searchParams.set('callback', callback);
    url.searchParams.set('_', String(Date.now()));
    script.src = url;
    script.referrerPolicy = 'no-referrer';
    document.head.append(script);
  });
}

function watchClubDirectory(onData, onError) {
  let running = false;
  let stopped = false;
  const refresh = async () => {
    if (running || stopped || document.hidden) return;
    running = true;
    try {
      const data = await requestClubDirectory();
      if (!data || data.ok !== true || !Array.isArray(data.clubs) || !Array.isArray(data.events)) {
        throw new Error('部活動の予定を取得できませんでした。');
      }
      if (!stopped) onData(data);
    } catch (_) {
      if (!stopped) onError();
    } finally {
      running = false;
    }
  };
  refresh();
  const timer = setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', refresh);
  return () => {
    stopped = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', refresh);
  };
}
