const clubStatus = document.getElementById('club-directory-status');
const clubUpcoming = document.getElementById('club-upcoming');
const clubCards = document.getElementById('club-cards');
let lastDirectory;
const clubToday = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' });
const clubDateFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', weekday: 'short'
});

function clubElement(tag, value) {
  const node = document.createElement(tag);
  node.textContent = value;
  return node;
}

function clubEventLabel(event) {
  return clubDateFormat.format(new Date(event.date + 'T00:00:00+09:00')) + '　' + event.time;
}

watchClubDirectory(data => {
  const today = clubToday.format(new Date());
  const snapshot = JSON.stringify([today, data]);
  if (snapshot === lastDirectory) return;
  const firstRender = lastDirectory === undefined;
  lastDirectory = snapshot;
  clubUpcoming.replaceChildren();
  clubCards.replaceChildren();
  const upcoming = data.events.filter(event => !event.cancelled && event.date >= today);
  const names = new Map(data.clubs.map(club => [club.id, club.name]));
  clubStatus.textContent = upcoming.length ? '' : '掲載中の部活動の日程はありません。';
  upcoming.slice(0, 6).forEach(event => {
    const item = document.createElement('li');
    const link = clubElement('a', clubEventLabel(event) + '　' + names.get(event.clubId));
    link.href = '#club-' + event.clubId;
    item.append(link);
    if (event.note) item.append(clubElement('p', event.note));
    clubUpcoming.append(item);
  });
  data.clubs.forEach(club => {
    const card = document.createElement('article');
    card.id = 'club-' + club.id;
    card.append(clubElement('h3', club.name));
    const officers = document.createElement('dl');
    officers.className = 'club-officers';
    for (const [label, name] of [['部長', club.leader], ['副部長', club.deputy]]) {
      const officer = document.createElement('div');
      officer.append(clubElement('dt', label), clubElement('dd', name || '準備中'));
      officers.append(officer);
    }
    card.append(officers);
    card.append(
      clubElement('h4', '紹介文'),
      clubElement('p', club.intro || '準備中です。'),
      clubElement('h4', '開催日程'),
      clubElement('p', club.regularSchedule || '準備中です。')
    );
    const nextDates = upcoming.filter(event => event.clubId === club.id).slice(0, 3);
    card.append(clubElement('h4', '今後の日程'));
    if (!nextDates.length) {
      const empty = clubElement('p', '掲載中の日程はありません。');
      empty.className = 'club-card-next';
      card.append(empty);
    }
    for (const event of nextDates) {
      const date = clubElement('p', clubEventLabel(event));
      date.className = 'club-card-next';
      card.append(date);
      if (event.note) card.append(clubElement('p', event.note));
    }
    clubCards.append(card);
  });
  if (!data.clubs.length) clubCards.append(clubElement('p', '掲載中の部活動はありません。'));
  if (firstRender && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}, () => {
  lastDirectory = undefined;
  clubStatus.textContent = '部活動の予定を確認できませんでした。';
  clubUpcoming.replaceChildren();
  clubCards.replaceChildren();
});
