const rosterDialog = document.getElementById('attendance-roster');
const rosterStatus = document.getElementById('roster-status');
const rosterFilter = document.getElementById('roster-filter');
let rosterData = null;
let rosterLoading = false;
let rosterSelectedEvent = null;

function editRosterAnswer() {
  rosterDialog.close();
  openAttendance();
  loadAttendance();
}

function renderRoster() {
  const events = rosterData.events.filter(event => (rosterSelectedEvent && rosterFilter.value === 'selected-event' && event.date === rosterSelectedEvent.date && event.name === rosterSelectedEvent.name && event.time === rosterSelectedEvent.time) || !rosterFilter.value || event.date.slice(0, 7) === rosterFilter.value || event.name === rosterFilter.value);
  const table = document.getElementById('roster-table');
  table.replaceChildren();
  const head = document.createElement('thead');
  const header = document.createElement('tr');
  header.append(element('th', '', 'お名前'));
  events.forEach(event => header.append(element('th', '', event.date.slice(5).replace('-', '/') + '\n' + event.name + '\n' + event.time)));
  head.append(header);
  table.append(head);
  const body = document.createElement('tbody');
  const counts = document.createElement('tr');
  counts.append(element('th', '', '参加人数'));
  events.forEach(event => counts.append(element('td', '', String(rosterData.roster.filter(person => person.answers[event.id] === '参加').length))));
  body.append(counts);
  rosterData.roster.forEach(person => {
    const row = document.createElement('tr');
    if (person.self) row.className = 'roster-self';
    const name = element('th', '', '');
    name.scope = 'row';
    if (person.self) {
      const link = element('a', 'roster-name-link', person.name + '（自分）');
      link.href = '#attendance';
      link.setAttribute('aria-label', person.name + 'の出欠を編集');
      link.addEventListener('click', event => {
        event.preventDefault();
        editRosterAnswer();
      });
      name.append(link);
    } else {
      name.textContent = person.name;
    }
    row.append(name);
    events.forEach(event => {
      const status = person.answers[event.id] || '未回答';
      const symbols = { '参加': '○', '不参加': '×', '未定': '△', '未回答': '―' };
      const cell = element('td', '', symbols[status] || '―');
      cell.setAttribute('aria-label', status);
      cell.title = status;
      cell.dataset.status = status;
      row.append(cell);
    });
    body.append(row);
  });
  table.append(body);
}

async function loadRoster() {
  if (rosterLoading) return;
  rosterLoading = true;
  document.getElementById('roster-reload').disabled = true;
  rosterStatus.textContent = '出欠一覧を確認しています…';
  try {
    if (!attendanceToken) attendanceToken = getAttendanceToken();
    const data = await attendanceRequest({ operation: 'list', token: attendanceToken });
    if (!Array.isArray(data.roster) || data.roster.some(person => typeof person.name !== 'string' || typeof person.self !== 'boolean' || !person.answers)) {
      throw new Error('一覧を確認できませんでした。もう一度更新してください。');
    }
    rosterData = data;
    rosterFilter.replaceChildren(element('option', '', 'すべて'));
    rosterFilter.firstChild.value = '';
    const options = [...new Set(data.events.map(event => event.date.slice(0, 7))), ...new Set(data.events.map(event => event.name))];
    options.forEach(value => {
      const option = element('option', '', value);
      option.value = value;
      rosterFilter.append(option);
    });
    if (rosterSelectedEvent) {
      const option = element('option', '', rosterSelectedEvent.date.slice(5).replace('-', '/') + ' ' + rosterSelectedEvent.name);
      option.value = 'selected-event';
      rosterFilter.append(option);
      rosterFilter.value = 'selected-event';
    }
    renderRoster();
    rosterStatus.textContent = data.roster.length ? 'ご自身の名前を押すと回答を変更できます。' : 'まだ回答がありません。「自分の出欠を回答・編集」から入力できます。';
  } catch (error) {
    document.getElementById('roster-table').replaceChildren();
    rosterStatus.textContent = error.message;
  } finally {
    rosterLoading = false;
    document.getElementById('roster-reload').disabled = false;
  }
}
function openRoster(event = null) {
  rosterSelectedEvent = event;
  rosterDialog.showModal();
  loadRoster();
}
document.getElementById('attendance-roster-open').addEventListener('click', () => openRoster());
document.getElementById('roster-close').addEventListener('click', () => rosterDialog.close());
document.getElementById('roster-answer').addEventListener('click', editRosterAnswer);
document.getElementById('roster-reload').addEventListener('click', loadRoster);
rosterFilter.addEventListener('change', () => { if (rosterData) renderRoster(); });
attendanceDialog.addEventListener('close', () => { rosterData = null; });
