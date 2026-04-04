"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
    value: string; // yyyy-mm-dd
    onChange: (value: string) => void; // emits yyyy-mm-dd
    className?: string; // applied to the outer wrapper (carries bg, rounded, padding, etc.)
    placeholder?: string;
    min?: string; // yyyy-mm-dd
    max?: string; // yyyy-mm-dd
    disabled?: boolean;
    lang?: string; // unused, kept for compat
}

// Convert yyyy-mm-dd → dd/mm/yyyy for display
function toDisplay(iso: string): string {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Convert dd/mm/yyyy → yyyy-mm-dd for storage
function toISO(display: string): string {
    const cleaned = display.replace(/\D/g, "");
    if (cleaned.length !== 8) return "";
    const dd = cleaned.slice(0, 2);
    const mm = cleaned.slice(2, 4);
    const yyyy = cleaned.slice(4, 8);
    const day = parseInt(dd), month = parseInt(mm), year = parseInt(yyyy);
    if (month < 1 || month > 12) return "";
    if (day < 1 || day > 31) return "";
    if (year < 1900 || year > 2100) return "";
    return `${yyyy}-${mm}-${dd}`;
}

// Auto-insert slashes as user types
function autoFormat(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function DateInput({
    value,
    onChange,
    className = "",
    placeholder = "dd/mm/yyyy",
    min,
    max,
    disabled,
}: DateInputProps) {
    const [display, setDisplay] = useState(toDisplay(value));
    const hiddenRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDisplay(toDisplay(value));
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = autoFormat(e.target.value);
        setDisplay(formatted);
        const iso = toISO(formatted);
        if (iso) onChange(iso);
        else if (!formatted) onChange("");
    };

    const handleTextBlur = () => {
        const iso = toISO(display);
        if (!iso && display) {
            setDisplay("");
            onChange("");
        }
    };

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const iso = e.target.value;
        if (iso) {
            setDisplay(toDisplay(iso));
            onChange(iso);
        }
    };

    const openPicker = (e: React.MouseEvent) => {
        e.preventDefault();
        if (disabled) return;
        try {
            hiddenRef.current?.showPicker();
        } catch {
            hiddenRef.current?.click();
        }
    };

    return (
        <div className={`relative flex items-center w-full ${className}`}>
            {/* Visible text input — transparent, full width, no extra padding */}
            <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-transparent outline-none border-none min-w-0 w-full placeholder:text-slate-300 text-inherit font-inherit text-inherit"
            />

            {/* Calendar icon button */}
            <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                tabIndex={-1}
                className="shrink-0 ml-1 text-slate-400 hover:text-forest transition-colors"
            >
                <Calendar size={14} />
            </button>

            {/* Hidden native date input for calendar popup */}
            <input
                ref={hiddenRef}
                type="date"
                value={value}
                min={min}
                max={max}
                onChange={handleNativeChange}
                tabIndex={-1}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                aria-hidden="true"
            />
        </div>
    );
}
