'use client';

import { fromZonedTime } from 'date-fns-tz';
import { Timestamp } from 'firebase/firestore';
import {
  formatDateUrl,
  formatDateRange,
  getISODateFromDate,
  LONG_FORMATTER,
} from '@/dates/dates';

export function getDateFromTimestamp(value: Timestamp): Date;
export function getDateFromTimestamp(
  value: Timestamp | undefined,
): Date | undefined;
export function getDateFromTimestamp(value: Timestamp | undefined) {
  return value ? value.toDate() : undefined;
}

export function getTimestampFromDate(value: Date): Timestamp;
export function getTimestampFromDate(
  value: Date | undefined,
): Timestamp | undefined;
export function getTimestampFromDate(value: Date | undefined) {
  return value ? Timestamp.fromDate(value) : undefined;
}

export function getTimestampFromISODate(value: string): Timestamp;
export function getTimestampFromISODate(
  value: string | undefined,
): Timestamp | undefined;
export function getTimestampFromISODate(value: string | undefined) {
  return value ? Timestamp.fromDate(new Date(value)) : undefined;
}

export function getTimestampFromISOLocalDate(
  value: string,
  timezone: string,
): Timestamp;
export function getTimestampFromISOLocalDate(
  value: string | undefined,
  timezone: string,
): Timestamp | undefined;
export function getTimestampFromISOLocalDate(
  value: string | undefined,
  timezone: string,
) {
  return value ? Timestamp.fromDate(fromZonedTime(value, timezone)) : undefined;
}

export function getTimestampFromTimestampJson({
  _seconds,
  _nanoseconds,
}: {
  _seconds: number;
  _nanoseconds: number;
}) {
  return new Timestamp(_seconds, _nanoseconds);
}

export function getDayTimestamp(year: number, month: number, day: number) {
  return Timestamp.fromDate(new Date(year, month, day));
}

export function formatTimestampAsDate(value: Timestamp): string;
export function formatTimestampAsDate(
  value: Timestamp | undefined,
): string | undefined;
export function formatTimestampAsDate(value: Timestamp | undefined) {
  return formatDateUrl(getDateFromTimestamp(value));
}

export { formatDateRange, getISODateFromDate, LONG_FORMATTER };
