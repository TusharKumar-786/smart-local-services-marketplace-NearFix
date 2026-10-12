const TONES = ['indigo', 'violet', 'pink', 'orange', 'green', 'cyan', 'blue', 'amber']

export default function Avatar({ name = '?', size = 48, id = 0 }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const tone = TONES[(Number(id) || name.length) % TONES.length]
  return (
    <span className={`avatar grad-${tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials}
    </span>
  )
}
