const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3.5 9.5C2.9 10.3 2.5 12 2.5 12S6 18.5 12 18.5c1.7 0 3.2-.6 4.5-1.4M10.2 6.1c.6-.2 1.2-.3 1.8-.3 6 0 9.5 6.5 9.5 6.5s-.8 1.4-2.2 2.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 9a8 8 0 1 1-1 4" />
      <path d="M4 4v5h5" />
    </svg>
  );
}

export function RefreshIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 11a8 8 0 0 0-14-5L4 8" />
      <path d="M4 3v5h5M4 13a8 8 0 0 0 14 5l2-2" />
      <path d="M20 21v-5h-5" />
    </svg>
  );
}

export function ChevronUpIcon() {
  return (
    <svg {...iconProps}>
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg {...iconProps}>
      <path d="m6 10 6 6 6-6" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function FullscreenIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}
