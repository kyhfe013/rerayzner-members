const clubStatus = document.getElementById('club-directory-status');
const clubUpcoming = document.getElementById('club-upcoming');
const clubLinks = document.getElementById('club-links');
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
  clubLinks.replaceChildren();
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
    const link = clubElement('a', club.name);
    link.href = '#' + card.id;
    clubLinks.append(link);
    card.append(clubElement('h3', club.name));
    if (club.intro) card.append(clubElement('p', club.intro));
    const next = upcoming.find(event => event.clubId === club.id);
    card.append(clubElement('h4', '次回の日程'), clubElement('p', next ? clubEventLabel(next) : '掲載中の日程はありません。'));
    if (next?.note) card.append(clubElement('p', next.note));
    if (club.participation) card.append(clubElement('h4', '参加方法'), clubElement('p', club.participation));
    clubCards.append(card);
  });
  if (!data.clubs.length) clubCards.append(clubElement('p', '掲載中の部活動はありません。'));
  if (firstRender && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}, () => {
  lastDirectory = undefined;
  clubStatus.textContent = '部活動の予定を確認できませんでした。';
  clubUpcoming.replaceChildren();
  clubLinks.replaceChildren();
  clubCards.replaceChildren();
});
