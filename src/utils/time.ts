/**
 * Vogue — Indian Standard Time (IST) Formatting Utilities
 *
 * Timezone: Asia/Kolkata (UTC +05:30)
 */

export function formatISTTime(dateOrTimestamp?: Date | string | number | bigint): string {
  if (!dateOrTimestamp) return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
  
  let d: Date;
  if (typeof dateOrTimestamp === 'bigint') {
    d = new Date(Number(dateOrTimestamp) * 1000);
  } else if (typeof dateOrTimestamp === 'number') {
    d = dateOrTimestamp < 10000000000 ? new Date(dateOrTimestamp * 1000) : new Date(dateOrTimestamp);
  } else if (typeof dateOrTimestamp === 'string') {
    d = new Date(dateOrTimestamp);
  } else {
    d = dateOrTimestamp;
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';
}

export function formatISTDateTime(dateOrTimestamp?: Date | string | number | bigint): string {
  if (!dateOrTimestamp) {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
  }

  let d: Date;
  if (typeof dateOrTimestamp === 'bigint') {
    d = new Date(Number(dateOrTimestamp) * 1000);
  } else if (typeof dateOrTimestamp === 'number') {
    d = dateOrTimestamp < 10000000000 ? new Date(dateOrTimestamp * 1000) : new Date(dateOrTimestamp);
  } else if (typeof dateOrTimestamp === 'string') {
    d = new Date(dateOrTimestamp);
  } else {
    d = dateOrTimestamp;
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' IST';
}

export function formatISTDate(dateOrTimestamp?: Date | string | number | bigint): string {
  let d = dateOrTimestamp ? new Date(dateOrTimestamp as any) : new Date();
  if (isNaN(d.getTime())) d = new Date();

  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) + ' (IST)';
}
