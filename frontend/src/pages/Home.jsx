import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarCheck, ChevronRight, GitBranch, Layers, ListOrdered, MapPin, Network, Search as SearchIcon, ShieldCheck, Siren, Sparkles, Wrench } from 'lucide-react'
import useCatalog from '../hooks/useCatalog'
import { useAuth } from '../auth/AuthContext'
import CategoryIcon from '../components/CategoryIcon'
import Avatar from '../components/Avatar'
import ScoreRing from '../components/ScoreRing'
import Stars from '../components/Stars'
import { SkeletonCards } from '../components/Spinner'
import { ErrorBox } from '../components/States'

const WEIGHTS = [['Skill match', 30], ['Distance', 20], ['Availability', 20], ['Rating', 15], ['Price fit', 10], ['Urgency', 5]]
const SAMPLE = [30, 16, 19.7, 13.5, 10, 5]

const STEPS = [
  [SearchIcon, 'indigo', 'Tell us the job', 'Pick a service, your area, budget and how urgent it is.'],
  [ListOrdered, 'violet', 'Get ranked matches', 'Every provider gets a score out of 100 with the reasons shown.'],
  [CalendarCheck, 'green', 'Book a free slot', 'Choose an open hour. The database blocks double-booking.'],
]

const ALGOS = [
  [Layers, 'HashMap', 'Category → providers lookup', 'O(1) average'],
  [ListOrdered, 'Max-Heap', 'Pops the top-k best scores', 'O(n + k log n)'],
  [Network, 'Dijkstra', 'Shortest path on the area graph', 'O((V+E) log V)'],
  [GitBranch, 'Merge Sort', 'Stable re-sort by price, rating…', 'O(n log n)'],
]

export default function Home() {
  const { categories, areas, loading, error } = useCatalog()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [category, setCategory] = useState('')
  const [area, setArea] = useState('')
  const totalProviders = categories.reduce((n, c) => n + (c.provider_count || 0), 0)

  const search = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('category', category || categories[0]?.slug || '')
    const chosenArea = area || user?.area
    if (chosenArea) params.set('area', chosenArea)
    navigate(`/search?${params}`)
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="fade-in">
            <span className="eyebrow"><Sparkles size={14} />Smart local services marketplace</span>
            <h1>Trusted local pros, <span className="grad-text">ranked for you.</span></h1>
            <p className="lead">
              NearFix scores every provider on skill, distance, availability, rating, price and urgency,
              then shows the best match first, with the reasons.
            </p>
            <form className="search-bar" onSubmit={search}>
              <div className="search-field">
                <Wrench size={18} />
                <label className="sr-only" htmlFor="home-category">Service</label>
                <select id="home-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">What do you need?</option>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="search-field">
                <MapPin size={18} />
                <label className="sr-only" htmlFor="home-area">Area</label>
                <select id="home-area" value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">{user?.area_name ? `My area (${user.area_name})` : 'Your area'}</option>
                  {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" disabled={!categories.length}><SearchIcon size={18} />Search</button>
            </form>
            <div className="hero-links">
              <Link to="/emergency" className="emergency-link"><Siren size={16} />Emergency? Get the fastest available pro</Link>
            </div>
            <div className="hero-trust">
              <div><strong>{totalProviders || '15'}+</strong><span>Verified providers</span></div>
              <div><strong>{categories.length || 7}</strong><span>Service categories</span></div>
              <div><strong>{areas.length || 9}</strong><span>Areas covered</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <div className="hero-card-head">
                <Avatar name="Ravi Kumar" id={1} size={48} />
                <div>
                  <h3>Ravi Kumar <BadgeCheck size={15} color="#4f46e5" style={{ verticalAlign: '-2px' }} /></h3>
                  <Stars value={4.5} count={12} size={13} />
                </div>
                <ScoreRing score={94} size={64} />
              </div>
              <p className="small muted" style={{ margin: '0 0 .4rem' }}>Why this score (out of 100)</p>
              {WEIGHTS.map(([label, w], i) => (
                <div key={label} className="weight-row">
                  <span>{label}</span>
                  <span className="bar"><span style={{ width: `${(SAMPLE[i] / w) * 100}%` }} /></span>
                  <b>{w}</b>
                </div>
              ))}
            </div>
            <span className="float-badge one"><span className="dot" />Free within the next hour</span>
            <span className="float-badge two"><ShieldCheck size={16} color="#059669" />No double-booking</span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Services</span>
            <h2>Browse categories</h2>
          </div>
          <Link to="/search" className="row tight" style={{ fontWeight: 650 }}>See all providers <ArrowRight size={16} /></Link>
        </div>
        <ErrorBox message={error} />
        {loading ? <SkeletonCards count={2} /> : (
          <div className="category-grid">
            {categories.map((c) => (
              <Link key={c.slug} className="category-card card" to={`/search?category=${c.slug}${user?.area ? `&area=${user.area}` : ''}`}>
                <CategoryIcon slug={c.slug} />
                <strong>{c.name}</strong>
                <span className="muted small">{c.provider_count} providers <ChevronRight size={14} /></span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="section-head"><div><span className="eyebrow">How it works</span><h2>Booked in three steps</h2></div></div>
        <div className="steps">
          {STEPS.map(([Icon, tone, title, text], i) => (
            <div key={title} className="card step">
              <span className="step-num">0{i + 1}</span>
              <span className={`icon-tile tone-${tone}`}><Icon size={22} /></span>
              <h3>{title}</h3>
              <p className="muted" style={{ margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="algo-band section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Under the hood</span><h2>Data structures powering every search</h2></div>
            <Link to="/dsa" className="btn btn-ghost">Open the DSA lab <ArrowRight size={16} /></Link>
          </div>
          <div className="algo-grid">
            {ALGOS.map(([Icon, name, what, cost]) => (
              <div key={name} className="algo">
                <span className="icon-tile tone-indigo" style={{ width: 40, height: 40, marginBottom: '.75rem' }}><Icon size={20} /></span>
                <h3>{name}</h3>
                <p className="muted small" style={{ margin: 0 }}>{what}</p>
                <code>{cost}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="cta">
          <div>
            <h2>Something broke right now?</h2>
            <p>Emergency mode weights distance and response speed higher and only shows emergency-ready pros.</p>
          </div>
          <Link to="/emergency" className="btn btn-white btn-large"><Siren size={18} />Get emergency help</Link>
        </div>
      </section>
    </>
  )
}
