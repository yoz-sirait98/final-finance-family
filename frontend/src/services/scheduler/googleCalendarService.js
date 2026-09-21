import { schedulerDb } from '../../db/schedulerDatabase';
import { taskRepository } from '../../db/taskRepository';

const STORAGE_KEY_ACCOUNT = 'yjs_google_account';
const STORAGE_KEY_CLIENT_ID = 'yjs_google_client_id';
const STORAGE_KEY_SELECTED_CALENDAR = 'yjs_google_selected_cal';
const STORAGE_KEY_AUTO_SYNC = 'yjs_google_auto_sync';
const STORAGE_KEY_LAST_STATS = 'yjs_google_last_stats';

const DEFAULT_TIMEZONE = 'Asia/Jakarta';
const DEFAULT_TIMEZONE_OFFSET = '+07:00';

export class GoogleCalendarService {
  constructor() {
    this.gisLoaded = false;
    this.tokenClient = null;
    this.memoryStorage = {};
  }

  getItem(key) {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryStorage[key] || null;
      }
    }
    return this.memoryStorage[key] || null;
  }

  setItem(key, value) {
    this.memoryStorage[key] = value;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignored
      }
    }
  }

  removeItem(key) {
    delete this.memoryStorage[key];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignored
      }
    }
  }

  getClientId() {
    const stored = this.getItem(STORAGE_KEY_CLIENT_ID);
    if (stored && stored.trim() !== '') return stored.trim();
    return import.meta.env?.VITE_GOOGLE_CLIENT_ID || '';
  }

  setClientId(clientId) {
    if (clientId?.trim()) {
      this.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
    } else {
      this.removeItem(STORAGE_KEY_CLIENT_ID);
    }
  }

  getSelectedCalendarId() {
    return this.getItem(STORAGE_KEY_SELECTED_CALENDAR) || 'primary';
  }

  setSelectedCalendarId(calendarId) {
    this.setItem(STORAGE_KEY_SELECTED_CALENDAR, calendarId);
  }

  isAutoSyncEnabled() {
    return this.getItem(STORAGE_KEY_AUTO_SYNC) !== 'false';
  }

  setAutoSync(enabled) {
    this.setItem(STORAGE_KEY_AUTO_SYNC, enabled ? 'true' : 'false');
  }

  getSavedAccount() {
    try {
      const raw = this.getItem(STORAGE_KEY_ACCOUNT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveAccount(account) {
    if (account) {
      this.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(account));
    } else {
      this.removeItem(STORAGE_KEY_ACCOUNT);
    }
  }

  getLastSyncStats() {
    try {
      const raw = this.getItem(STORAGE_KEY_LAST_STATS);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveLastSyncStats(stats) {
    this.setItem(STORAGE_KEY_LAST_STATS, JSON.stringify(stats));
  }

  isTokenValid(account) {
    if (!account || !account.accessToken) return false;
    if (account.isMock) return true;
    return account.tokenExpiresAt > Date.now() + 2 * 60 * 1000;
  }

  // --------------------------------------------------------------------------
  // Google Identity Services (GIS) OAuth2 Flow
  // --------------------------------------------------------------------------

  async loadGisScript() {
    if (typeof window === 'undefined') return false;
    if (this.gisLoaded && window.google?.accounts?.oauth2) return true;

    return new Promise((resolve) => {
      if (document.getElementById('google-gis-script')) {
        this.gisLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.gisLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.warn('Failed to load Google Identity Services script.');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  async promptOAuthLogin() {
    const clientId = this.getClientId();
    if (!clientId) {
      throw new Error(
        'Google Client ID is missing. Please configure a Google Client ID in Settings or provide VITE_GOOGLE_CLIENT_ID.'
      );
    }

    const loaded = await this.loadGisScript();
    const google = window.google;
    if (!loaded || !google?.accounts?.oauth2) {
      throw new Error('Google Identity Services library could not be loaded.');
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
          ].join(' '),
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              reject(new Error(`Google OAuth error: ${tokenResponse.error}`));
              return;
            }
            if (!tokenResponse.access_token) {
              reject(new Error('No access token received from Google.'));
              return;
            }

            try {
              const expiresInMs = (tokenResponse.expires_in || 3600) * 1000;
              const tokenExpiresAt = Date.now() + expiresInMs;
              const userInfo = await this.fetchUserInfo(tokenResponse.access_token);

              const account = {
                email: userInfo.email || 'user@gmail.com',
                name: userInfo.name || 'Google User',
                picture: userInfo.picture,
                accessToken: tokenResponse.access_token,
                tokenExpiresAt,
                isConnected: true,
                isMock: false,
              };

              this.saveAccount(account);
              resolve(account);
            } catch (err) {
              reject(err);
            }
          },
          error_callback: (err) => {
            reject(new Error(err?.message || 'Google OAuth prompt was cancelled or closed.'));
          },
        });

        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  async fetchUserInfo(accessToken) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch Google profile info');
      return await res.json();
    } catch (e) {
      console.warn('UserInfo fetch error:', e);
      return { email: 'user@gmail.com', name: 'Google User' };
    }
  }

  enableMockAccount() {
    const mockAccount = {
      email: 'demo.family@gmail.com',
      name: 'Demo Google Calendar',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      accessToken: 'mock-google-token-' + Date.now(),
      tokenExpiresAt: Date.now() + 86400 * 1000,
      isConnected: true,
      isMock: true,
    };
    this.saveAccount(mockAccount);
    return mockAccount;
  }

  disconnect() {
    this.saveAccount(null);
    this.removeItem(STORAGE_KEY_LAST_STATS);
  }

  // --------------------------------------------------------------------------
  // Google Calendar API Calls
  // --------------------------------------------------------------------------

  async fetchCalendars(accessToken) {
    const account = this.getSavedAccount();
    if (account?.isMock) {
      return [
        { id: 'primary', summary: 'Personal (Primary)', primary: true, backgroundColor: '#4285F4' },
        { id: 'family_cal_demo', summary: 'Family & Chores Calendar', primary: false, backgroundColor: '#0B8043' },
      ];
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Google Calendar list error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return (data.items || []).map((item) => ({
      id: item.id,
      summary: item.summary,
      description: item.description,
      primary: item.primary || false,
      backgroundColor: item.backgroundColor,
      foregroundColor: item.foregroundColor,
      accessRole: item.accessRole,
    }));
  }

  async fetchEvents(accessToken, calendarId = 'primary', timeMin, timeMax) {
    const account = this.getSavedAccount();
    if (account?.isMock) {
      return this.getMockEvents();
    }

    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });

    if (timeMin) params.set('timeMin', timeMin);
    if (timeMax) params.set('timeMax', timeMax);

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      throw new Error(`Google Calendar events error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return data.items || [];
  }

  async createEvent(accessToken, calendarId = 'primary', eventInput) {
    const account = this.getSavedAccount();
    if (account?.isMock) {
      return {
        id: 'mock-gcal-' + Date.now(),
        summary: eventInput.summary,
        description: eventInput.description,
        start: eventInput.start,
        end: eventInput.end,
        htmlLink: 'https://calendar.google.com/calendar',
        updated: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventInput),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to create Google event (${res.status}): ${await res.text()}`);
    }

    return await res.json();
  }

  async updateEvent(accessToken, calendarId = 'primary', eventId, eventInput) {
    const account = this.getSavedAccount();
    if (account?.isMock) {
      return {
        id: eventId,
        summary: eventInput.summary,
        description: eventInput.description,
        start: eventInput.start,
        end: eventInput.end,
        htmlLink: 'https://calendar.google.com/calendar',
        updated: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventInput),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to update Google event (${res.status}): ${await res.text()}`);
    }

    return await res.json();
  }

  async deleteEvent(accessToken, calendarId = 'primary', eventId) {
    const account = this.getSavedAccount();
    if (account?.isMock) return;

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete Google event (${res.status}): ${await res.text()}`);
    }
  }

  // --------------------------------------------------------------------------
  // Two-Way Synchronization Engine
  // --------------------------------------------------------------------------

  async syncTwoWay(options = {}, familyId, userId) {
    const account = this.getSavedAccount();
    if (!account || !this.isTokenValid(account)) {
      throw new Error('Google Calendar is not connected or session has expired.');
    }

    const calendarId = options.calendarId || this.getSelectedCalendarId();
    const daysInPast = options.daysInPast ?? 14;
    const daysInFuture = options.daysInFuture ?? 60;

    const timeMin = new Date(Date.now() - daysInPast * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(Date.now() + daysInFuture * 24 * 60 * 60 * 1000).toISOString();

    const stats = {
      lastSyncedAt: new Date().toISOString(),
      eventsImported: 0,
      eventsUpdated: 0,
      tasksExported: 0,
      tasksUpdated: 0,
      tasksDeleted: 0,
    };

    // 1. Fetch remote Google Calendar events
    const googleEvents = await this.fetchEvents(account.accessToken, calendarId, timeMin, timeMax);

    // 2. Fetch local tasks
    const localTasks = await taskRepository.getAll(familyId);

    // Build index by external_event_id
    const taskByExternalId = new Map();
    localTasks.forEach((t) => {
      if (t.external_event_id) {
        taskByExternalId.set(t.external_event_id, t);
      }
    });

    // 3. Process Remote Google Events -> Local Tasks (Import / Update)
    for (const gEvent of googleEvents) {
      if (gEvent.status === 'cancelled') {
        const existing = taskByExternalId.get(gEvent.id);
        if (existing && !existing.is_deleted) {
          await taskRepository.softDelete(existing.id);
          stats.tasksDeleted++;
        }
        continue;
      }

      const existingTask = taskByExternalId.get(gEvent.id);
      const taskDate = this.extractEventDate(gEvent);
      const isAllDay = !gEvent.start?.dateTime;
      const startTime = isAllDay ? null : this.extractEventTime(gEvent.start?.dateTime);
      const endTime = isAllDay ? null : this.extractEventTime(gEvent.end?.dateTime);

      if (!existingTask) {
        // Create new local task from Google event
        await taskRepository.create(
          {
            title: gEvent.summary || 'Untitled Event',
            description: gEvent.description || null,
            task_date: taskDate,
            start_time: startTime,
            end_time: endTime,
            is_all_day: isAllDay,
            priority: 'medium',
            external_provider: 'google',
            external_calendar_id: calendarId,
            external_event_id: gEvent.id,
            external_event_link: gEvent.htmlLink || null,
            external_synced_at: new Date().toISOString(),
          },
          familyId,
          userId
        );
        stats.eventsImported++;
      } else {
        // Compare updated timestamps
        const gUpdated = gEvent.updated ? new Date(gEvent.updated).getTime() : 0;
        const lUpdated = new Date(existingTask.updated_at).getTime();

        if (gUpdated > lUpdated) {
          await taskRepository.update(existingTask.id, {
            title: gEvent.summary || existingTask.title,
            description: gEvent.description !== undefined ? gEvent.description : existingTask.description,
            task_date: taskDate,
            start_time: startTime,
            end_time: endTime,
            is_all_day: isAllDay,
            external_event_link: gEvent.htmlLink || existingTask.external_event_link,
            external_synced_at: new Date().toISOString(),
          });
          stats.eventsUpdated++;
        }
      }
    }

    // 4. Process Local Tasks -> Remote Google Events (Export)
    for (const task of localTasks) {
      if (task.external_provider !== 'google' || task.is_deleted) continue;

      if (!task.external_event_id) {
        // Export to Google
        const gInput = this.convertTaskToGoogleEvent(task);
        try {
          const createdGEvent = await this.createEvent(account.accessToken, calendarId, gInput);
          await taskRepository.update(task.id, {
            external_event_id: createdGEvent.id,
            external_event_link: createdGEvent.htmlLink || null,
            external_synced_at: new Date().toISOString(),
          });
          stats.tasksExported++;
        } catch (e) {
          console.warn('Failed to export task to Google Calendar:', task.title, e);
        }
      }
    }

    this.saveLastSyncStats(stats);
    return stats;
  }

  // --------------------------------------------------------------------------
  // Converters & Helpers
  // --------------------------------------------------------------------------

  convertTaskToGoogleEvent(task) {
    if (task.is_all_day || !task.start_time) {
      return {
        summary: task.title,
        description: task.description || undefined,
        start: { date: task.task_date },
        end: { date: task.task_date },
      };
    }

    const startIso = `${task.task_date}T${task.start_time}:00${DEFAULT_TIMEZONE_OFFSET}`;
    const endTime = task.end_time || task.start_time;
    const endIso = `${task.task_date}T${endTime}:00${DEFAULT_TIMEZONE_OFFSET}`;

    return {
      summary: task.title,
      description: task.description || undefined,
      start: { dateTime: startIso, timeZone: DEFAULT_TIMEZONE },
      end: { dateTime: endIso, timeZone: DEFAULT_TIMEZONE },
    };
  }

  extractEventDate(gEvent) {
    if (gEvent.start?.date) return gEvent.start.date;
    if (gEvent.start?.dateTime) return gEvent.start.dateTime.split('T')[0];
    return new Date().toISOString().split('T')[0];
  }

  extractEventTime(dateTimeStr) {
    if (!dateTimeStr || !dateTimeStr.includes('T')) return null;
    const timePart = dateTimeStr.split('T')[1];
    return timePart.substring(0, 5); // HH:MM
  }

  getMockEvents() {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'mock-gcal-1',
        summary: '🗓️ Google Calendar: Team Standup',
        description: 'Synchronized from Google Calendar demo',
        start: { dateTime: `${today}T10:00:00+07:00` },
        end: { dateTime: `${today}T11:00:00+07:00` },
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com',
        updated: new Date().toISOString(),
      },
      {
        id: 'mock-gcal-2',
        summary: '🏥 Google Calendar: Kids Dentist Appointment',
        description: 'Family checkup scheduled in Google',
        start: { dateTime: `${today}T15:30:00+07:00` },
        end: { dateTime: `${today}T16:30:00+07:00` },
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com',
        updated: new Date().toISOString(),
      },
    ];
  }
  // --------------------------------------------------------------------------
  // Direct Web Export & iCal (.ics) Download
  // --------------------------------------------------------------------------

  generateWebExportUrl(task) {
    const title = encodeURIComponent(task.title || 'Task');
    const details = encodeURIComponent(
      (task.description ? `${task.description}\n\n` : '') +
        `Created via Finance Family Scheduler (Priority: ${(task.priority || 'medium').toUpperCase()})`
    );

    let datesParam = '';
    const cleanDate = (task.task_date || '').replace(/-/g, '');

    if (task.is_all_day || !task.start_time) {
      // For all-day events in Google Calendar render URL: YYYYMMDD/YYYYMMDD (end date + 1 day)
      const startDate = new Date(task.task_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const endCleanDate = endDate.toISOString().split('T')[0].replace(/-/g, '');
      datesParam = `${cleanDate}/${endCleanDate}`;
    } else {
      // Timed event: YYYYMMDDTHHMMSS / YYYYMMDDTHHMMSS
      const startParts = task.start_time.split(':');
      const startH = (startParts[0] || '00').padStart(2, '0');
      const startM = (startParts[1] || '00').padStart(2, '0');
      const startStr = `${cleanDate}T${startH}${startM}00`;

      let endStr = '';
      if (task.end_time) {
        const endParts = task.end_time.split(':');
        const endH = (endParts[0] || '00').padStart(2, '0');
        const endM = (endParts[1] || '00').padStart(2, '0');
        endStr = `${cleanDate}T${endH}${endM}00`;
      } else {
        const endHourNum = (parseInt(startH, 10) + 1) % 24;
        const endH = String(endHourNum).padStart(2, '0');
        endStr = `${cleanDate}T${endH}${startM}00`;
      }
      datesParam = `${startStr}/${endStr}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${datesParam}&ctz=${encodeURIComponent(
      DEFAULT_TIMEZONE
    )}`;
  }

  generateIcsContent(task) {
    const cleanDate = (task.task_date || '').replace(/-/g, '');
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `${task.id || Date.now()}@finance-family.local`;

    let dtStart = '';
    let dtEnd = '';

    if (task.is_all_day || !task.start_time) {
      dtStart = `;VALUE=DATE:${cleanDate}`;
      const startDate = new Date(task.task_date);
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0].replace(/-/g, '');
      dtEnd = `;VALUE=DATE:${nextDateStr}`;
    } else {
      const startParts = task.start_time.split(':');
      const startH = (startParts[0] || '00').padStart(2, '0');
      const startM = (startParts[1] || '00').padStart(2, '0');
      dtStart = `:${cleanDate}T${startH}${startM}00`;

      if (task.end_time) {
        const endParts = task.end_time.split(':');
        const endH = (endParts[0] || '00').padStart(2, '0');
        const endM = (endParts[1] || '00').padStart(2, '0');
        dtEnd = `:${cleanDate}T${endH}${endM}00`;
      } else {
        const endHourNum = (parseInt(startH, 10) + 1) % 24;
        const endH = String(endHourNum).padStart(2, '0');
        dtEnd = `:${cleanDate}T${endH}${startM}00`;
      }
    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Finance Family Scheduler//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART${dtStart}`,
      `DTEND${dtEnd}`,
      `SUMMARY:${(task.title || '').replace(/\n/g, ' ')}`,
      `DESCRIPTION:${(task.description || '').replace(/\n/g, '\\n')}`,
      `STATUS:${task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    return lines.join('\r\n');
  }

  downloadIcsFile(task) {
    if (typeof window === 'undefined') return;
    const ics = this.generateIcsContent(task);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(task.title || 'task').replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const googleCalendarService = new GoogleCalendarService();
