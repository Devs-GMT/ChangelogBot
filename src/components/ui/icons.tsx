import { cn } from "@/lib/utils/cn";
import type { Group } from "@/lib/changelog/types";

type IconProps = { className?: string };

/** One consistent set: 24px grid, 1.75 stroke, round caps. Decorative — callers label the control. */
function Svg({ className, children, fill }: IconProps & { children: React.ReactNode; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="M19 16v4M17 18h4" />
  </Svg>
);

export const TrendIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Svg>
);

export const BugIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 9a4 4 0 018 0v6a4 4 0 01-8 0V9Z" />
    <path d="M12 5V3M8 12H4M16 12h4M8.5 17.5L5 19.5M15.5 17.5l3.5 2M9.5 4.5L11 6M14.5 4.5L13 6" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5l9.5 16.5h-19L12 3.5Z" />
    <path d="M12 10v4.5M12 17.5h.01" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17L17 7M8.5 7H17v8.5" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const PlayIcon = (p: IconProps) => (
  <Svg {...p} fill>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </Svg>
);

export const FilterIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5h18l-7 8.5V20l-4-2v-4.5L3 5Z" />
  </Svg>
);

export const ShieldCheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" />
    <path d="M8.5 12l2.5 2.5L15.5 10" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </Svg>
);

export const TagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 12.2V5a1.5 1.5 0 011.5-1.5h7.2a1.5 1.5 0 011.06.44l7.3 7.3a1.5 1.5 0 010 2.12l-6.7 6.7a1.5 1.5 0 01-2.12 0l-7.3-7.3a1.5 1.5 0 01-.44-1.06Z" />
    <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
);

export const LinkChainIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1" />
  </Svg>
);

export const GitHubIcon = (p: IconProps) => (
  <Svg {...p} fill>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </Svg>
);

export const XLogoIcon = (p: IconProps) => (
  <Svg {...p} fill>
    <path d="M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.2 22H2l7.7-8.8L1.5 2h6.7l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.3 3.9H5.4L17.7 20Z" />
  </Svg>
);

export const UsersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
    <path d="M15.5 5.2a3.5 3.5 0 010 6.6M17.5 14.8c2.1.6 3.6 2.4 4 5.2" />
  </Svg>
);

export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
  </Svg>
);

export const CubeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5Z" />
    <path d="M3.8 7.6L12 12.4l8.2-4.8M12 12.4v9" />
  </Svg>
);

const GROUP_ICONS: Record<Group, (p: IconProps) => React.ReactElement> = {
  new: SparkleIcon,
  improved: TrendIcon,
  fixed: BugIcon,
  breaking: AlertIcon,
};

export function GroupIcon({ group, className }: { group: Group } & IconProps) {
  const Icon = GROUP_ICONS[group];
  return <Icon className={className} />;
}
