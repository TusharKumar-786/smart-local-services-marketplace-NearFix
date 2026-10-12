import { Droplets, Hammer, Paintbrush, Plug, Snowflake, Sparkles, Wrench, Zap } from 'lucide-react'

const MAP = {
  plumbing: { icon: Droplets, tone: 'blue' },
  electrical: { icon: Zap, tone: 'amber' },
  'ac-repair': { icon: Snowflake, tone: 'cyan' },
  carpentry: { icon: Hammer, tone: 'orange' },
  'home-cleaning': { icon: Sparkles, tone: 'green' },
  cleaning: { icon: Sparkles, tone: 'green' },
  painting: { icon: Paintbrush, tone: 'pink' },
  'appliance-repair': { icon: Plug, tone: 'violet' },
}

export default function CategoryIcon({ slug, size = 22 }) {
  const { icon: Icon, tone } = MAP[slug] || { icon: Wrench, tone: 'indigo' }
  return (
    <span className={`icon-tile tone-${tone}`} aria-hidden="true">
      <Icon size={size} strokeWidth={2} />
    </span>
  )
}
