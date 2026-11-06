// 出欠は公開予定フィードへ混ぜず、POSTで本人の回答だけを読み書きする。
const ATTENDANCE_STORAGE_KEY = 'rr-attendance-key-v1';
let attendanceToken = '';
let attendanceData = null;
let attendanceBusy = false;
let attendancePending = null;
let attendanceStarted = false;
const attendanceForm = document.getElementById('attendance-form');
const attendanceStatus = document.getElementById('attendance-status');
const attendanceSave = document.getElementById('attendance-save');
const attendanceFeedback = document.getElementById('attendance-save-feedback');

function setAttendanceSaving(saving) {
  attendanceSave.disabled = saving;
  attendanceSave.textContent = saving ? '保存中…' : 'まとめて保存';
  attendanceSave.setAttribute('aria-busy', String(saving));
  attendanceForm.setAttribute('aria-busy', String(saving));
}

function showAttendanceReceipt(data) {
  const saved = data.events.filter(event => ['参加', '未定', '不参加'].includes(data.answers[event.id]));
  const list = document.getElementById('attendance-saved-events');
  list.replaceChildren();
  saved.forEach(event => {
    const row = element('article', 'attendance-saved-row');
    const detail = element('div', 'attendance-saved-detail');
    const [year, month, day] = event.date.split('-').map(Number);
    detail.append(element('p', 'attendance-saved-date', `${year}/${month}/${day}（${weekdays[new Date(year, month - 1, day).getDay()]}）`),
      element('p', 'attendance-saved-name', event.name), element('p', 'attendance-saved-time', event.time));
    row.append(detail, element('span', 'attendance-saved-answer', data.answers[event.id]));
    list.append(row);
  });
  document.getElementById('attendance-receipt-count').textContent = `${saved.length}件の出欠を保存しました。`;
  document.querySelector('.attendance-scroll').hidden = true;
  document.getElementById('attendance-complete').hidden = false;
  document.getElementById('attendance-receipt').hidden = false;
  document.getElementById('attendance-saved-review').hidden = true;
  document.getElementById('attendance-receipt-title').focus();
}

function newAttendanceToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
}

function getAttendanceToken() {
  const fragment = location.hash.match(/^#attendance-key=([a-f0-9]{64})$/);
  let stored = '';
  try { stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY) || ''; } catch (error) { /* 保存不可でも回答できる */ }
  return fragment ? fragment[1] : /^[a-f0-9]{64}$/.test(stored) ? stored : newAttendanceToken();
}

async function attendanceRequest(input) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const url = new URL(MEMBER_CALENDAR_ENDPOINT);
    url.searchParams.set('action', 'attendance');
    const response = await fetch(url, {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('通信を確認できませんでした。入力を残したまま、もう一度操作してください。');
    const data = await response.json();
    if (!data || data.ok !== true) {
      const error = new Error(data?.error || '回答を確認できませんでした。もう一度操作してください。');
      error.code = data?.code;
      throw error;
    }
    if (!Array.isArray(data.events) || data.events.length > 200 || typeof data.name !== 'string' ||
        !Number.isInteger(data.revision) || typeof data.answers !== 'object' || !data.answers || !/^[a-f0-9]{64}$/.test(data.stamp)) {
      throw new Error('回答の取得内容を確認できませんでした。もう一度操作してください。');
    }
    normalizeCalendarEvents(data.events);
    const ids = new Set();
    data.events.forEach(event => {
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(event.id) || ids.has(event.id)) throw new Error('予定を確認できませんでした。再読み込みしてください。');
      ids.add(event.id);
    });
    return data;
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) {
      throw new Error('通信結果を確認できませんでした。入力を残したまま、もう一度操作してください。');
    }
    throw error;
  } finally { clearTimeout(timeout); }
}

function renderAttendance(data) {
  const container = document.getElementById('attendance-events');
  container.replaceChildren();
  document.getElementById('attendance-name').value = data.name;
  let month = '';
  data.events.forEach(event => {
    if (month !== event.date.slice(0, 7)) {
      month = event.date.slice(0, 7);
      container.append(element('h3', 'attendance-month', `${Number(month.slice(0, 4))}年${Number(month.slice(5))}月`));
    }
    const row = element('fieldset', 'attendance-row');
    row.id = `attendance-${event.id}`;
    row.dataset.eventId = event.id;
    row.dataset.eventDate = event.date;
    row.dataset.eventName = event.name;
    row.dataset.eventTime = event.time;
    const legend = element('legend', 'attendance-event');
    const [year, monthNumber, day] = event.date.split('-').map(Number);
    legend.append(element('span', 'attendance-date', `${monthNumber}/${day}（${weekdays[new Date(year, monthNumber - 1, day).getDay()]}）`),
      element('span', 'attendance-event-name', event.name), element('span', 'attendance-time', event.time));
    row.append(legend);
    const choices = element('div', 'attendance-choices');
    ['参加', '未定', '不参加'].forEach((status, index) => {
      const label = element('label', 'attendance-choice');
      const radio = document.createElement('input');
      radio.type = 'radio'; radio.name = `attendance-${event.id}`; radio.value = status;
      radio.id = `attendance-${event.id}-${index}`;
      radio.checked = data.answers[event.id] === status;
      label.append(radio, document.createTextNode(status)); choices.append(label);
    });
    row.append(choices); container.append(row);
  });
  if (!data.events.length) container.append(element('p', '', '現在、回答できる予定はありません。'));
  attendanceForm.hidden = false;
  attendanceSave.disabled = !data.events.length;
  document.getElementById('attendance-tools').hidden = data.revision === 0;
}

async function loadAttendance() {
  if (attendanceBusy) return;
  attendanceBusy = true;
  attendanceSave.disabled = true;
  attendanceForm.inert = true;
  attendanceStatus.textContent = '出欠の一覧を確認しています…';
  document.getElementById('attendance-reload').disabled = true;
  try {
    if (!attendanceToken) attendanceToken = getAttendanceToken();
    const data = await attendanceRequest({ operation: 'load', token: attendanceToken });
    if (data.revision > 0) {
      // 旧URLの変更用リンクから移った場合も、確認できた本人の鍵を新しい端末記録へ保持。
      try { localStorage.setItem(ATTENDANCE_STORAGE_KEY, attendanceToken); } catch (error) { /* 変更用リンクを継続利用 */ }
    }
    attendanceData = data;
    attendancePending = null;
    renderAttendance(data);
    attendanceStatus.textContent = data.revision ? '保存済みの回答を表示しています。変更後は「まとめて保存」を押してください。' : '分かる予定だけ回答し、「まとめて保存」を押してください。';
  } catch (error) { attendanceStatus.textContent = error.message; }
  finally {
    attendanceBusy = false;
    attendanceForm.inert = false;
    document.getElementById('attendance-reload').disabled = false;
    attendanceSave.disabled = !attendanceData?.events.length;
  }
}

attendanceForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (attendanceBusy || !attendanceData) return;
  const name = document.getElementById('attendance-name').value.trim();
  const answers = attendanceData.events.flatMap(item => {
    const selected = document.querySelector(`input[name="attendance-${item.id}"]:checked`);
    return selected ? [{ id: item.id, status: selected.value }] : [];
  });
  if (!name || !answers.length) {
    attendanceStatus.textContent = !name ? 'お名前を入力してください。' : '出欠を1件以上選択してください。';
    attendanceFeedback.textContent = attendanceStatus.textContent;
    attendanceFeedback.hidden = false;
    if (!name) document.getElementById('attendance-name').focus();
    return;
  }
  const input = { operation: 'save', token: attendanceToken, name, revision: attendanceData.revision, stamp: attendanceData.stamp, answers };
  const fingerprint = JSON.stringify(input);
  if (!attendancePending || attendancePending.fingerprint !== fingerprint) attendancePending = { fingerprint, requestId: crypto.randomUUID() };
  // 応答が失われても、次回は同じ本人の回答を取得できるよう先に端末へ保持。
  try { localStorage.setItem(ATTENDANCE_STORAGE_KEY, attendanceToken); } catch (error) { /* 変更用リンクでも再編集できる */ }
  attendanceBusy = true; attendanceForm.inert = true; attendanceSave.disabled = true;
  setAttendanceSaving(true);
  attendanceFeedback.hidden = true;
  document.getElementById('attendance-reload').disabled = true;
  attendanceStatus.textContent = '回答を保存しています…';
  try {
    const result = await attendanceRequest({ ...input, requestId: attendancePending.requestId });
    if (result.revision <= input.revision || result.name !== name || answers.some(answer => result.answers[answer.id] !== answer.status)) {
      throw new Error('保存結果を確認できませんでした。入力を残したまま、もう一度保存してください。');
    }
    attendanceData = result; attendancePending = null;
    renderAttendance(result);
    attendanceStatus.textContent = '回答を保存しました。変更する場合は、出欠を選び直して再度保存してください。';
    showAttendanceReceipt(result);
  } catch (error) {
    attendanceStatus.textContent = error.message;
    attendanceFeedback.textContent = error.message;
    attendanceFeedback.hidden = false;
  }
  finally {
    attendanceBusy = false; attendanceForm.inert = false; attendanceSave.disabled = false;
    setAttendanceSaving(false);
    document.getElementById('attendance-reload').disabled = false;
  }
});

document.getElementById('attendance-reload').addEventListener('click', () => {
  if (!attendanceData || confirm('入力中の変更を破棄し、保存済みの回答を再読み込みします。よろしいですか？')) loadAttendance();
});
document.getElementById('attendance-copy-link').addEventListener('click', async () => {
  const link = new URL(location.href);
  link.hash = `attendance-key=${attendanceToken}`;
  try {
    await navigator.clipboard.writeText(link.href);
    attendanceStatus.textContent = '回答変更用リンクをコピーしました。このリンクでご自身の回答を変更できます。ご本人用として保管してください。';
  } catch (error) {
    const field = document.getElementById('attendance-edit-link'); field.value = link.href; field.hidden = false; field.select();
    attendanceStatus.textContent = '表示された回答変更用リンクをコピーして保管してください。';
  }
});

function startAttendance() {
  if (!attendanceStarted) { attendanceStarted = true; loadAttendance(); }
}
const attendanceDialog = document.getElementById('attendance');
function openAttendance() {
  const details = document.getElementById('details');
  if (details.open) details.close();
  if (!attendanceDialog.open) {
    document.getElementById('attendance-complete').hidden = true;
    document.querySelector('.attendance-scroll').hidden = false;
    attendanceDialog.showModal();
  }
  startAttendance();
}
document.querySelectorAll('a[href="#attendance"]').forEach(link => {
  link.addEventListener('click', event => { event.preventDefault(); openAttendance(); });
});
document.querySelector('.attendance-close').addEventListener('click', () => attendanceDialog.close());
document.getElementById('attendance-done').addEventListener('click', () => attendanceDialog.close());
document.getElementById('attendance-review-close').addEventListener('click', () => attendanceDialog.close());
document.getElementById('attendance-review').addEventListener('click', () => {
  document.getElementById('attendance-receipt').hidden = true;
  document.getElementById('attendance-saved-review').hidden = false;
  document.getElementById('attendance-review-title').focus();
});
document.getElementById('attendance-review-back').addEventListener('click', () => {
  document.getElementById('attendance-saved-review').hidden = true;
  document.getElementById('attendance-receipt').hidden = false;
  document.getElementById('attendance-receipt-title').focus();
});
attendanceDialog.addEventListener('click', event => {
  const bounds = attendanceDialog.getBoundingClientRect();
  if (event.target === attendanceDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) attendanceDialog.close();
});
if (/^#attendance(?:-key=|$)/.test(location.hash)) {
  openAttendance();
}
