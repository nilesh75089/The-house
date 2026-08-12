/**
 * THE HOUSE — Room 5: Did I Study?
 */

import { store } from '../store.js';

export function initStudyRoom() {
  const btnYes = document.getElementById('btn-study-yes');
  const btnNo = document.getElementById('btn-study-no');
  const yesDrawer = document.getElementById('study-yes-details');
  const inputSubject = document.getElementById('study-subject-input');
  const inputDuration = document.getElementById('study-duration-input');
  const btnRecord = document.getElementById('btn-record-study');
  const statusBanner = document.getElementById('study-status-banner');
  const dateBadge = document.getElementById('study-current-date-badge');

  const calGrid = document.getElementById('study-calendar-grid');
  const calTitle = document.getElementById('calendar-month-title');
  const btnPrevMonth = document.getElementById('btn-prev-month');
  const btnNextMonth = document.getElementById('btn-next-month');

  let viewDate = new Date(); // Month currently viewing in calendar
  const today = new Date();

  const pad = (n) => String(n).padStart(2, '0');
  const formatDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = formatDateKey(today);

  // Set today badge text
  dateBadge.textContent = today.toLocaleDateString([], { month: 'short', day: 'numeric' });

  function checkTodayStatus() {
    const records = store.data.study?.records || {};
    const todayRecord = records[todayKey];

    btnYes.classList.remove('selected');
    btnNo.classList.remove('selected');

    if (!todayRecord) {
      statusBanner.classList.add('hidden');
      yesDrawer.classList.add('hidden');
      return;
    }

    if (todayRecord.studied) {
      btnYes.classList.add('selected');
      statusBanner.classList.remove('hidden');
      statusBanner.textContent = `Today recorded: Studied ${todayRecord.subject || 'Focus'}${todayRecord.duration ? ` for ${todayRecord.duration}` : ''}.`;
    } else {
      btnNo.classList.add('selected');
      statusBanner.classList.remove('hidden');
      statusBanner.textContent = 'Today recorded: Rested / Did not study.';
      yesDrawer.classList.add('hidden');
    }
  }

  btnYes.addEventListener('click', () => {
    btnYes.classList.add('selected');
    btnNo.classList.remove('selected');
    yesDrawer.classList.remove('hidden');
    inputSubject.focus();
  });

  btnNo.addEventListener('click', () => {
    btnNo.classList.add('selected');
    btnYes.classList.remove('selected');
    yesDrawer.classList.add('hidden');
    store.recordStudyDay(todayKey, false);
  });

  btnRecord.addEventListener('click', () => {
    const subject = inputSubject.value.trim();
    const duration = inputDuration.value.trim();
    store.recordStudyDay(todayKey, true, subject, duration);
    yesDrawer.classList.add('hidden');
  });

  // Calendar rendering
  function renderCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calTitle.textContent = `${monthNames[month]} ${year}`;

    // First day of month & days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Day of week for 1st (0 = Sun, 1 = Mon ... adjust for Monday start)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes index 6

    const records = store.data.study?.records || {};

    let html = '';

    // Blank cells before month start
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      html += `<div class="cal-day-cell other-month"><span class="cal-day-num">${dayNum}</span></div>`;
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateKey = formatDateKey(cellDate);
      const record = records[dateKey];
      const isToday = dateKey === todayKey;

      let stateClass = '';
      let tooltip = '';

      if (record) {
        if (record.studied) {
          stateClass = 'studied';
          tooltip = record.subject ? `${record.subject}${record.duration ? ` (${record.duration})` : ''}` : 'Studied';
        } else {
          stateClass = 'not-studied';
          tooltip = 'Did not study';
        }
      }

      html += `
        <div class="cal-day-cell ${stateClass} ${isToday ? 'today' : ''}" ${tooltip ? `data-tooltip="${escapeHtml(tooltip)}"` : ''}>
          <span class="cal-day-num">${day}</span>
          <span class="cal-indicator-dot"></span>
        </div>
      `;
    }

    // Trailing cells
    const totalCells = startDayOfWeek + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      html += `<div class="cal-day-cell other-month"><span class="cal-day-num">${i}</span></div>`;
    }

    calGrid.innerHTML = html;
  }

  btnPrevMonth.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });

  btnNextMonth.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  store.subscribe(() => {
    checkTodayStatus();
    renderCalendar();
  });

  checkTodayStatus();
  renderCalendar();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
