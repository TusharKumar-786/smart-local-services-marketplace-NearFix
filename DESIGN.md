# NearFix Design Guide (DESIGN.md)

## 1. Brand Identity
- **Name**: NearFix
- **Tagline**: "Skilled help, nearby, fast."
- **Voice & Tone**: Plain, warm, confident, and reliable—like a helpful neighbour who knows every trusted local technician in town. Short sentences, honest phrasing, zero corporate hype.

## 2. Brand Colors
| Role | Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `--color-primary` | `#0F5C63` | Deep Teal. Headers, primary brand buttons, active states, key icons. |
| **Accent** | `--color-accent` | `#F2A32C` | Marigold. Callouts, star ratings, best-match highlights, badges. |
| **Emergency** | `--color-emergency` | `#D8402F` | Signal Red. Emergency request triggers and urgent status tags only. |
| **Success** | `--color-success` | `#2E8B57` | Leaf Green. Verified provider badges, confirmed & completed tags. |
| **Background** | `--color-bg` | `#FAF7F2` | Warm White. Soft, natural page background. |
| **Surface** | `--color-surface` | `#FFFFFF` | Pure White. Card containers, modals, form inputs. |
| **Soft Tint** | `--color-tint` | `#E3F0F0` | Mist Teal. Category pills, active navigation backgrounds, subtle bands. |
| **Text** | `--color-text` | `#1E2A2E` | Ink. High-contrast typography for headings and body copy. |
| **Muted Text** | `--color-muted` | `#5B6B70` | Slate. Secondary text, metadata, hints, and timestamps. |
| **Border** | `--color-border` | `#E4DED3` | Sand. Subtle borders, input strokes, and dividers. |

## 3. Typography
- **Headings**: Plus Jakarta Sans / Manrope (600, 700, 800 weight) with tight tracking (`-0.02em`).
- **Body**: Inter / DM Sans (400, 500, 600 weight) with comfortable line height (`1.6`).
- **Hierarchy**:
  - H1: 2.5rem – 3.25rem (Bold / Extrabold)
  - H2: 1.875rem – 2.25rem (Bold)
  - H3: 1.25rem – 1.5rem (Semibold)
  - Body: 1rem (16px base minimum)
  - Small / Caption: 0.875rem (14px)

## 4. Logo & Iconography
- **Logo Mark**: A clean geographical location pin holding an inner contour shaped like a wrench head, symbolizing local trades and craft.
- **Iconography**: Inline SVG icons exclusively from the Lucide collection with consistent 1.5px – 2px stroke weight.

## 5. Animation Principles
- Purposeful, measured, and quiet. Never distracting or playful.
- Uses Framer Motion and hardware-accelerated CSS transforms (`translate3d`, `opacity`).
- Respects `prefers-reduced-motion` at all times.
- Emergency action button features a calm, gentle Signal Red pulse ring rather than an aggressive strobe.
