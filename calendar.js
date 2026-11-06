const types = {
  share: { name: 'シェア会', color: 'var(--share)', background: 'var(--share-bg)', ink: 'var(--share-ink)' },
  practice: { name: '実践会', color: 'var(--practice)', background: 'var(--practice-bg)', ink: 'var(--practice-ink)' },
  advance: { name: 'アドバンスコース', color: 'var(--advance)', background: 'var(--advance-bg)', ink: 'var(--advance-ink)' },
  special: { name: '特別講座', color: 'var(--special)', background: 'var(--special-bg)', ink: 'var(--special-ink)' },
  pilgrimage: { name: '霊格アップお詣り', color: 'var(--pilgrimage)', background: 'var(--pilgrimage-bg)', ink: 'var(--pilgrimage-ink)' }
};
const typeByName = Object.fromEntries(Object.entries(types).map(([key, value]) => [value.name, key]));
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
const nowParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric'
}).formatToParts(new Date());
const part = key => Number(nowParts.find(p => p.type === key).value);
const base = new Date(part('year'), part('month') - 1, 1);
const today = { year: part('year'), month: part('month') - 1, day: part('day') };
function normalizeCalendarEvents(records) {
  if (!Array.isArray(records) || records.length > 10000) throw new Error('予定の件数を確認してください。');
  return records.map(record => {
    if (!record || typeof record.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.date) || typeof record.time !== 'string') {
      throw new Error('予定の日付・時間を確認してください。');
    }
    const [year, month, day] = record.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const type = typeByName[record.name];
    const time = record.time.match(/^(\d{1,2}):(\d{2})(?:\s*[〜～~\-–—]\s*(\d{1,2}):(\d{2}))?$/);
    const timeValid = ['', '-', '別途確認'].includes(record.time) || (time && Number(time[1]) < 24 && Number(time[2]) < 60 && (time[3] === undefined || (Number(time[3]) < 24 && Number(time[4]) < 60)));
    if (!type || !timeValid || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      throw new Error('取り込んだ予定の日付・種別・時間を確認してください。');
    }
    return { date: record.date, name: record.name, time: record.time, year, month: month - 1, day, type, ...types[type] };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}
let schedule = normalizeCalendarEvents(scheduleSnapshot.events);
let offset = 0;
let filter = 'all';

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setEventColors(node, event) {
  node.style.setProperty('--event-color', event.color);
  node.style.setProperty('--event-bg', event.background);
  node.style.setProperty('--event-ink', event.ink);
}

function openDetails(event) {
  document.getElementById('detail-title').textContent = event.name;
  document.getElementById('detail-date').textContent = `${event.year}年${event.month + 1}月${event.day}日（${weekdays[new Date(event.year, event.month, event.day).getDay()]}）`;
  document.getElementById('detail-time').textContent = event.time;
  document.getElementById('detail-participation').hidden = !['share', 'practice', 'advance'].includes(event.type);
  const applicationForms = {
    special: 'https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform',
    pilgrimage: 'https://docs.google.com/forms/d/e/1FAIpQLSfYTDHHjZH56yWnauPkdWSTT-20OXrLs4ONQE8Z1mwtbvjHhg/viewform'
  };
  const formUrl = applicationForms[event.type];
  const dialog = document.getElementById('details');
  dialog.classList.toggle('with-application', Boolean(formUrl));
  document.getElementById('detail-application').hidden = !formUrl;
  const frame = document.getElementById('application-frame');
  if (formUrl) {
    frame.title = event.name + ' 参加申し込みフォーム';
    frame.src = formUrl + '?embedded=true';
    document.getElementById('application-link').href = formUrl;
  } else frame.removeAttribute('src');
  const attendanceButton = document.querySelector('#details .primary');
  const monthDistance = (event.year - today.year) * 12 + event.month - today.month;
  attendanceButton.hidden = Boolean(formUrl) || monthDistance < 0 || monthDistance > 2 || event.date < `${today.year}-${String(today.month + 1).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  document.getElementById('details').showModal();
}

function dayCell(year, month, day, weekday, events) {
  const cell = element('div', 'day');
  if (weekday === 0) cell.classList.add('sun');
  if (weekday === 6) cell.classList.add('sat');
  cell.setAttribute('role', 'group');
  cell.setAttribute('aria-label', `${month + 1}月${day}日`);
  const number = element('span', 'date', day);
  if (year === today.year && month === today.month && day === today.day) {
    cell.classList.add('today');
    number.setAttribute('aria-current', 'date');
  }
  cell.append(number);
  if (events.length) {
    cell.classList.add('event');
    setEventColors(cell, events[0]);
  }
  for (const event of events) {
    const label = element('button', 'day-event');
    label.type = 'button';
    setEventColors(label, event);
    label.setAttribute('aria-label', `${month + 1}月${day}日 ${event.name} ${event.time}`);
    const start = event.time.match(/^\d{1,2}:\d{2}/)?.[0] || event.time;
    label.append(element('span', 'day-event-time', start), element('span', 'day-event-name', event.name));
    label.addEventListener('click', () => openDetails(event));
    cell.append(label);
  }
  return cell;
}

function agendaRow(event) {
  const row = element('button', 'event-row');
  row.type = 'button';
  setEventColors(row, event);
  const date = element('span', 'event-date', `${event.month + 1}/${event.day}`);
  date.append(element('small', '', `（${weekdays[new Date(event.year, event.month, event.day).getDay()]}）`));
  const copy = element('span', 'event-copy');
  copy.append(element('span', 'event-name', event.name), element('span', 'event-time', event.time));
  const arrow = element('span', 'chevron', '›');
  arrow.setAttribute('aria-hidden', 'true');
  row.append(date, copy, arrow);
  row.addEventListener('click', () => openDetails(event));
  return row;
}

function render() {
  const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const last = new Date(base.getFullYear(), base.getMonth() + offset + 2, 1);
  document.getElementById('period').textContent = first.getFullYear() === last.getFullYear()
    ? `${first.getFullYear()}年 ${first.getMonth() + 1}月 — ${last.getMonth() + 1}月`
    : `${first.getFullYear()}年${first.getMonth() + 1}月 — ${last.getFullYear()}年${last.getMonth() + 1}月`;
  const container = document.getElementById('calendars');
  container.replaceChildren();
  for (let i = 0; i < 3; i++) {
    const date = new Date(base.getFullYear(), base.getMonth() + offset + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const events = schedule.filter(event => event.year === year && event.month === month && (filter === 'all' || event.type === filter));
    const card = element('article', 'month');
    card.setAttribute('aria-label', `${year}年${month + 1}月`);
    card.innerHTML = `<div class="month-title"><span class="month-number">${String(month + 1).padStart(2, '0')}</span><span class="month-unit">月</span><span class="month-year">${year}</span></div><div class="month-layout"><div class="grid" role="group" aria-label="${month + 1}月の日付と予定"></div><div class="agenda" role="group" aria-label="${month + 1}月の日程一覧"></div></div>`;
    const grid = card.querySelector('.grid');
    weekdays.forEach((name, index) => grid.append(element('span', `weekday ${index === 0 ? 'sun' : index === 6 ? 'sat' : ''}`, name)));
    const count = new Date(year, month + 1, 0).getDate();
    for (let index = 0; index < 42; index++) {
      const day = index - date.getDay() + 1;
      if (day < 1 || day > count) {
        const blank = element('span', '');
        blank.setAttribute('aria-hidden', 'true');
        grid.append(blank);
      } else {
        grid.append(dayCell(year, month, day, index % 7, events.filter(event => event.day === day)));
      }
    }
    const agenda = card.querySelector('.agenda');
    events.forEach(event => agenda.append(agendaRow(event)));
    container.append(card);
  }
}

document.getElementById('prev').addEventListener('click', () => { offset -= 3; render(); });
document.getElementById('next').addEventListener('click', () => { offset += 3; render(); });
document.getElementById('reset').addEventListener('click', () => { offset = 0; render(); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  render();
}));
document.querySelector('#details .close').addEventListener('click', () => document.getElementById('details').close());
render();
