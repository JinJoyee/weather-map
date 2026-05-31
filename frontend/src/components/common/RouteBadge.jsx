const BADGE_MAP = {
  normal: {
    label: '최단 경로',
    icon: 'directions_run',
    className: 'bg-blue-100 text-blue-700',
  },
  context: {
    label: '상황 인식 경로',
    icon: 'self_improvement',
    className: 'bg-amber-100 text-amber-700',
  },
  custom: {
    label: '커스텀 경로',
    icon: 'edit_road',
    className: 'bg-purple-100 text-purple-700',
  },
};

const DEFAULT_BADGE = {
  label: '경로',
  icon: 'route',
  className: 'bg-gray-100 text-gray-600',
};

/**
 * @param {{ type: 'normal' | 'context' | 'custom' }} props
 */
export default function RouteBadge({ type }) {
  const { label, icon, className } = BADGE_MAP[type] ?? DEFAULT_BADGE;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      <span className="material-symbols-outlined text-sm leading-none">{icon}</span>
      {label}
    </span>
  );
}
