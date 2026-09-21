import {
  format,
  isTomorrow as dateFnsIsTomorrow,
  isYesterday as dateFnsIsYesterday,
  isBefore,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  subMinutes,
  differenceInMinutes,
} from 'date-fns';

/**
 * Returns today's local date string in YYYY-MM-DD format
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current local time string in HH:MM format
 */
export function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parses date string (YYYY-MM-DD) safely into local Date
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Combines date string (YYYY-MM-DD) and optional time (HH:MM) into a local Date object
 */
export function parseLocalDateTime(dateStr, timeStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    hours = h || 0;
    minutes = m || 0;
  }

  return new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateKey(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Checks if a given date string is today
 */
export function isToday(dateStr) {
  return dateStr === getTodayDateString();
}

/**
 * Checks if a date string is tomorrow
 */
export function isTomorrow(dateStr) {
  return dateFnsIsTomorrow(parseLocalDate(dateStr));
}

/**
 * Checks if a date string is yesterday
 */
export function isYesterday(dateStr) {
  return dateFnsIsYesterday(parseLocalDate(dateStr));
}

/**
 * Checks if a task is overdue based on date and time
 */
export function isOverdue(dateStr, timeStr) {
  const taskDateTime = parseLocalDateTime(dateStr, timeStr);
  return isBefore(taskDateTime, new Date());
}

/**
 * Friendly relative date label (e.g. "Today", "Tomorrow", "Yesterday", or "Mon, 14 Aug")
 */
export function formatRelativeDate(dateStr, locale = 'en') {
  if (isToday(dateStr)) return locale === 'id' ? 'Hari Ini' : 'Today';
  if (isTomorrow(dateStr)) return locale === 'id' ? 'Besok' : 'Tomorrow';
  if (isYesterday(dateStr)) return locale === 'id' ? 'Kemarin' : 'Yesterday';

  const date = parseLocalDate(dateStr);
  return format(date, 'EEE, d MMM');
}

/**
 * Formats time string (HH:MM) into 12-hour or 24-hour display
 */
export function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Gets 7 days for the week containing the given date (Monday to Sunday)
 */
export function getDaysOfWeek(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

/**
 * Gets all days in a given month view grid (including leading/trailing days)
 */
export function getMonthDaysGrid(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * Calculates reminder trigger Date from task date, time, and minutes before
 */
export function calculateReminderTriggerTime(taskDate, startTime, minutesBefore) {
  const scheduledTime = parseLocalDateTime(taskDate, startTime || '09:00');
  return subMinutes(scheduledTime, minutesBefore);
}

/**
 * Calculate minutes remaining until a given date/time
 */
export function getMinutesUntil(targetDate) {
  return differenceInMinutes(targetDate, new Date());
}
