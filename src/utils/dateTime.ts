const LIMA_TZ = 'America/Lima';

function capFirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/\.$/, '');
}

function limaDateParts(d: Date) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: LIMA_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
    return {
        year:   get('year'),
        month:  get('month'),
        day:    get('day'),
        hour:   get('hour') === '24' ? '00' : get('hour'),
        minute: get('minute'),
        second: get('second'),
    };
}

/** ISO (UTC) from DB → "HH:MM a.m./p.m." in Lima time */
export function fmtTimeLima(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: LIMA_TZ });
}

/** ISO (UTC) from DB → "Jue 28 May" in Lima time */
export function fmtDateShortLima(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const wd  = d.toLocaleDateString('es-PE', { weekday: 'short', timeZone: LIMA_TZ });
    const day = parseInt(d.toLocaleDateString('en-CA', { day: 'numeric', timeZone: LIMA_TZ }), 10);
    const mo  = d.toLocaleDateString('es-PE', { month: 'short', timeZone: LIMA_TZ });
    return `${capFirst(wd)} ${day} ${capFirst(mo)}`;
}

/** YYYY-MM-DD date string (from API) → "Jue 28 May" in Lima time */
export function fmtDayShortLima(isoDate: string): string {
    const d = new Date(`${isoDate}T12:00:00-05:00`); // noon Lima → safe from day boundary
    if (isNaN(d.getTime())) return isoDate;
    const wd  = d.toLocaleDateString('es-PE', { weekday: 'short', timeZone: LIMA_TZ });
    const day = parseInt(d.toLocaleDateString('en-CA', { day: 'numeric', timeZone: LIMA_TZ }), 10);
    const mo  = d.toLocaleDateString('es-PE', { month: 'short', timeZone: LIMA_TZ });
    return `${capFirst(wd)} ${day} ${capFirst(mo)}`;
}

/** ISO (UTC) from DB → locale string (date + time) in Lima time, or '—' */
export function fmtDateTimeLima(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: LIMA_TZ,
    });
}

/** ISO (UTC) from DB → "YYYY-MM-DDTHH:MM" in Lima time (for datetime-local inputs) */
export function isoToInputLima(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const { year, month, day, hour, minute } = limaDateParts(d);
    return `${year}-${month}-${day}T${hour}:${minute}`;
}

/** "YYYY-MM-DDTHH:MM" Lima local input → Lima ISO string with offset (for API calls) */
export function inputLimaToISO(local: string): string {
    if (!local) return '';
    // Return with Lima offset so the API receives the exact time selected, not UTC.
    return `${local}:00-05:00`;
}

/** current Date → clock string in Lima time */
export function fmtClockLima(d: Date): string {
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: LIMA_TZ });
}

/** current Date → full date string in Lima time */
export function fmtDateFullLima(d: Date): string {
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: LIMA_TZ });
}
