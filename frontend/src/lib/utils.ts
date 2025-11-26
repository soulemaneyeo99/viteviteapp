import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number | string): string {
    const mins = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;

    if (isNaN(mins)) return '--';
    if (mins === 0) return '0 min';

    if (mins < 60) {
        return `${mins} min`;
    }

    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (remainingMins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMins < 10 ? '0' : ''}${remainingMins}`;
}
