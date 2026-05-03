import { useState, useEffect, useRef } from 'react';
import './SearchableSelect.css';

export interface SelectOption {
    value: string;
    label: string;
    sublabel?: string;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    loading?: boolean;
    disabled?: boolean;
    emptyText?: string;
    emptyAction?: {
        label: string | ((search: string) => string);
        onClick: (search: string) => void;
    };
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    loading = false,
    disabled = false,
    emptyText = 'Sin opciones disponibles',
    emptyAction,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => o.value === value);

    const filtered = search.trim()
        ? options.filter((o) =>
              o.label.toLowerCase().includes(search.toLowerCase()) ||
              (o.sublabel?.toLowerCase().includes(search.toLowerCase()) ?? false)
          )
        : options;

    useEffect(() => {
        if (!open) return;
        const handle = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    useEffect(() => {
        if (open && searchRef.current) {
            searchRef.current.focus();
        }
    }, [open]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false);
            setSearch('');
        }
    };

    const handleSelect = (opt: SelectOption) => {
        onChange(opt.value);
        setOpen(false);
        setSearch('');
    };

    const toggle = () => {
        if (!disabled) setOpen((v) => !v);
    };

    return (
        <div
            className={`ss-container${disabled ? ' ss-disabled' : ''}`}
            ref={containerRef}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button"
                className={`ss-trigger${open ? ' ss-open' : ''}${!selected ? ' ss-placeholder' : ''}`}
                onClick={toggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="ss-value">
                    {selected ? (
                        <>
                            <span className="ss-value-label">{selected.label}</span>
                            {selected.sublabel && (
                                <span className="ss-value-sublabel">{selected.sublabel}</span>
                            )}
                        </>
                    ) : (
                        placeholder
                    )}
                </span>
                {loading ? (
                    <span className="ss-spinner" />
                ) : (
                    <svg
                        className={`ss-chevron${open ? ' ss-chevron--open' : ''}`}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                )}
            </button>

            {open && (
                <div className="ss-dropdown" role="listbox">
                    <div className="ss-search-wrap">
                        <svg
                            className="ss-search-icon"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            ref={searchRef}
                            className="ss-search"
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Buscar opción"
                        />
                    </div>

                    <div className="ss-list">
                        {loading ? (
                            <div className="ss-empty">
                                <span className="ss-list-spinner" />
                                Cargando...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="ss-empty-wrap">
                                <div className="ss-empty">{emptyText}</div>
                                {emptyAction && search.trim() && (
                                    <button
                                        type="button"
                                        className="ss-empty-action"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            emptyAction.onClick(search.trim());
                                        }}
                                    >
                                        {typeof emptyAction.label === 'function'
                                            ? emptyAction.label(search.trim())
                                            : emptyAction.label}
                                    </button>
                                )}
                            </div>
                        ) : (
                            filtered.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={opt.value === value}
                                    className={`ss-option${opt.value === value ? ' ss-option--active' : ''}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    <span className="ss-option-label">{opt.label}</span>
                                    {opt.sublabel && (
                                        <span className="ss-option-sublabel">{opt.sublabel}</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
