import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  Laptop,
  MousePointerClick,
  Smartphone,
} from "lucide-react";
import { DateTime, Duration } from "luxon";
import { memo, useState } from "react";
import { GetSessionsResponse } from "../../api/analytics/userSessions";
import { Browser } from "../../app/[site]/components/shared/icons/Browser";
import { CountryFlag } from "../../app/[site]/components/shared/icons/CountryFlag";
import { OperatingSystem } from "../../app/[site]/components/shared/icons/OperatingSystem";
import { cn, formatter, getCountryName } from "../../lib/utils";
import { formatDuration } from "../../lib/dateTimeUtils";
import { Badge } from "../ui/badge";
import { SessionDetails } from "./SessionDetails";
import { userLocale, hour12 } from "../../lib/dateTimeUtils";
import { useGetRegionName } from "../../lib/geo";

interface SessionCardProps {
  session: GetSessionsResponse[number];
  userId?: string;
  onClick?: () => void;
}

// DeviceIcon component for displaying mobile/desktop icons
function DeviceIcon({ deviceType }: { deviceType: string }) {
  const type = deviceType.toLowerCase();

  if (type.includes("mobile") || type.includes("tablet")) {
    return <Smartphone className="w-4 h-4" />;
  }

  return <Laptop className="w-4 h-4" />;
}

// Function to truncate path for display
function truncatePath(path: string, maxLength: number = 32) {
  if (!path) return "-";
  if (path.length <= maxLength) return path;

  // Keep the beginning of the path with ellipsis
  return `${path.substring(0, maxLength)}...`;
}

export function SessionCard({ session, onClick, userId }: SessionCardProps) {
  const { getRegionName } = useGetRegionName();

  const [expanded, setExpanded] = useState(false);

  // Calculate session duration in minutes
  const start = DateTime.fromSQL(session.session_start);
  const end = DateTime.fromSQL(session.session_end);
  const totalSeconds = Math.floor(end.diff(start).milliseconds / 1000);
  const duration = formatDuration(totalSeconds);

  // Truncate user ID to first 8 characters
  const truncatedUserId = session.user_id.substring(0, 8);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setExpanded(!expanded);
    }
  };

  const getFullLocation = (session: GetSessionsResponse[number]) => {
    let location = "";
    if (session.city) {
      location += `${session.city}, `;
    }
    if (getRegionName(session.region)) {
      location += `${getRegionName(session.region)}, `;
    }
    if (session.country) {
      location += getCountryName(session.country);
    }
    return location;
  };

  return (
    <div className="mb-3 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
      <div className="p-3 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">
              {truncatedUserId}
            </span>
          </div>

          {/* Icons section */}
          <div className="flex space-x-2 items-center md:ml-3">
            {/* Country */}
            {session.country && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <CountryFlag country={session.country} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getFullLocation(session)}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Browser */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0">
                  <Browser browser={session.browser || "Unknown"} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {session.browser || "Unknown browser"}
                  {session.browser_version && ` ${session.browser_version}`}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* OS */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0">
                  <OperatingSystem os={session.operating_system || ""} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {session.operating_system || "Unknown OS"}
                  {session.operating_system_version &&
                    ` ${session.operating_system_version}`}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Device Type */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DeviceIcon deviceType={session.device_type || ""} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {session.device_type || "Unknown device"}
                  {session.screen_width &&
                    session.screen_height &&
                    ` ${session.screen_width}x${session.screen_height}`}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-neutral-800 text-gray-300"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>{formatter(session.pageviews)}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Pageviews</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-neutral-800 text-gray-300"
                >
                  <MousePointerClick className="w-4 h-4 text-amber-500" />
                  <span>{formatter(session.events)}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Events</TooltipContent>
            </Tooltip>
          </div>

          {/* Pages section with tooltips for long paths */}
          <div className="items-center ml-3 flex-1 min-w-0 hidden md:flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-400 truncate max-w-[200px] inline-block">
                  {truncatePath(session.entry_page)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{session.entry_page || "-"}</p>
              </TooltipContent>
            </Tooltip>

            <ArrowRight className="mx-2 w-3 h-3 flex-shrink-0 text-gray-400" />

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-400 truncate max-w-[200px] inline-block">
                  {truncatePath(session.exit_page)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{session.exit_page || "-"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Time information */}

          <div className="flex items-center gap-4 text-xs text-gray-300">
            <span className="text-gray-400">
              {DateTime.fromSQL(session.session_start, {
                zone: "utc",
              })
                .setLocale(userLocale)
                .toLocal()
                .toFormat(hour12 ? "MMM d, h:mm a" : "dd MMM, HH:mm")}
            </span>
            <span className="hidden md:block">{duration}</span>
          </div>

          {/* Expand/Collapse icon */}
          <div className="ml-2 flex-shrink-0 hidden md:flex">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={3} />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={3} />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content using SessionDetails component */}
      {expanded && <SessionDetails session={session} userId={userId} />}
    </div>
  );
}

export const SessionCardSkeleton = memo(() => {
  // Function to get a random width class for skeletons
  const getRandomWidth = () => {
    const widths = [
      "w-16",
      "w-20",
      "w-24",
      "w-28",
      "w-32",
      "w-36",
      "w-40",
      "w-44",
      "w-48",
    ];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  // Get random width for time displays
  const getRandomTimeWidth = () => {
    const widths = ["w-20", "w-24", "w-28", "w-32"];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  // Get random width for duration displays
  const getRandomDurationWidth = () => {
    const widths = ["w-10", "w-12", "w-14"];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  // Create multiple skeletons for a realistic loading state
  const skeletons = Array.from({ length: 10 }).map((_, index) => (
    <div
      className="mb-3 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden"
      key={index}
    >
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* Avatar and User ID */}
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-3 w-14" />
          </div>

          {/* Icons */}
          <div className="flex space-x-2 items-center md:ml-3">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
            <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
            <Skeleton className="h-4 w-4 rounded-sm" />
            {/* Badge skeleton for pageviews */}
            <Skeleton className="h-[21px] w-8 rounded-sm" />
            {/* Badge skeleton for events */}
            <Skeleton className="h-[21px] w-8 rounded-sm" />
          </div>

          {/* Entry/Exit paths with randomized widths */}
          <div className="items-center ml-3 flex-1 min-w-0 hidden md:flex">
            <Skeleton className={cn("h-3 max-w-[200px]", getRandomWidth())} />
            <div className="mx-2 flex-shrink-0">
              <Skeleton className="h-3 w-3" />
            </div>
            <Skeleton className={cn("h-3 max-w-[200px]", getRandomWidth())} />
          </div>

          {/* Time */}
          <div className="flex items-center gap-4">
            {/* Date/time skeleton */}
            <Skeleton className={cn("h-3", getRandomTimeWidth())} />

            {/* Duration skeleton */}
            <Skeleton
              className={cn("h-3", getRandomDurationWidth(), "hidden md:block")}
            />
          </div>

          {/* Expand icon */}
          <div className="ml-2 flex-shrink-0 hidden md:flex">
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  ));

  return <>{skeletons}</>;
});
