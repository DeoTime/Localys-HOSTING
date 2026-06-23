import Link from "next/link";
import "./landing-v3.css";

export default function LandingScreen() {
  return (
    <div className="lv3">
      <header className="topbar">
        <div className="bar container">
          <Link className="logo" href="/">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--tang)">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
            </svg>
            <span>Localy</span>
          </Link>
          <nav className="links">
            <a href="#near">Explore</a>
            <a href="#how">How it works</a>
            <a href="#owners">For businesses</a>
          </nav>
          <div className="bar-cta">
            <Link className="textlink" href="/login">Sign in</Link>
            <Link className="sticker sticker-tang" href="/feed">Browse local</Link>
          </div>
        </div>
      </header>

      <section className="hero container reveal">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="star">★</span> 4.8 · 2,300+ locals exploring nearby
          </span>
          <h1 className="display hero-title">
            The small shops near you,{" "}
            <span className="mark"><span>on video.</span></span>
          </h1>
          <p className="lead">
            Scroll real clips from the businesses around the corner — find hidden gems, today&apos;s deals, and the spots your neighbours swear by.
          </p>
          <div className="cta-row">
            <Link className="sticker sticker-tang big" href="/feed">Browse local</Link>
            <Link className="sticker sticker-ghost big" href="#owners">List your business</Link>
          </div>
          <p className="microtrust">
            <b>Free.</b> No download needed to browse · 25 neighbourhoods · 1,000+ businesses
          </p>
        </div>

        <div className="stage">
          <div className="phone">
            <div className="notch"></div>
            <div className="screen">
              <div className="feed">
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-deal">20% off</span>
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Pho Shop</b><span>Willowdale · 0.3km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Dream Rose Florist</b><span>Richmond Hill · 0.6km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-deal">BOGO</span>
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Ana Pastry</b><span>Downtown · 1.1km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Align Wellness</b><span>Midtown · 0.9km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1521123845560-14093637aa24?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-deal">New</span>
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Corner Books</b><span>Old Town · 0.4km</span></div>
                </article>
                {/* duplicated for seamless loop */}
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-deal">20% off</span>
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Pho Shop</b><span>Willowdale · 0.3km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Dream Rose Florist</b><span>Richmond Hill · 0.6km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-deal">BOGO</span>
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Ana Pastry</b><span>Downtown · 1.1km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Align Wellness</b><span>Midtown · 0.9km</span></div>
                </article>
                <article className="vid">
                  <img src="https://images.unsplash.com/photo-1521123845560-14093637aa24?q=80&w=600&auto=format&fit=crop" alt="" />
                  <span className="vid-deal">New</span>
                  <span className="vid-play">▶</span>
                  <div className="vid-meta"><b>Corner Books</b><span>Old Town · 0.4km</span></div>
                </article>
              </div>
            </div>
          </div>
          <span className="badge b1">🍜 Pho Shop · 0.3km</span>
          <span className="badge b2">20% off today</span>
          <span className="badge b3">💐 New near you</span>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="track">
          <span className="mpill t">🍜 Food &amp; Drink</span>
          <span className="mpill">☕ Cafés</span>
          <span className="mpill a">🛍️ Retail</span>
          <span className="mpill">💐 Florists</span>
          <span className="mpill g">💇 Barbers</span>
          <span className="mpill">🧘 Wellness</span>
          <span className="mpill a">📚 Bookshops</span>
          <span className="mpill">🎨 Makers</span>
          <span className="mpill t">🍜 Food &amp; Drink</span>
          <span className="mpill">☕ Cafés</span>
          <span className="mpill a">🛍️ Retail</span>
          <span className="mpill">💐 Florists</span>
          <span className="mpill g">💇 Barbers</span>
          <span className="mpill">🧘 Wellness</span>
          <span className="mpill a">📚 Bookshops</span>
          <span className="mpill">🎨 Makers</span>
        </div>
      </div>
      <div className="marquee tight" aria-hidden="true">
        <div className="track rev">
          <span className="mpill">🔧 Services</span>
          <span className="mpill g">🐾 Pet shops</span>
          <span className="mpill">🍰 Bakeries</span>
          <span className="mpill t">💅 Beauty</span>
          <span className="mpill">🍷 Wine &amp; spirits</span>
          <span className="mpill a">🏋️ Fitness</span>
          <span className="mpill">🌿 Garden</span>
          <span className="mpill t">🎸 Music</span>
          <span className="mpill">🔧 Services</span>
          <span className="mpill g">🐾 Pet shops</span>
          <span className="mpill">🍰 Bakeries</span>
          <span className="mpill t">💅 Beauty</span>
          <span className="mpill">🍷 Wine &amp; spirits</span>
          <span className="mpill a">🏋️ Fitness</span>
          <span className="mpill">🌿 Garden</span>
          <span className="mpill t">🎸 Music</span>
        </div>
      </div>

      <section id="near" className="container section reveal">
        <div className="sec-head">
          <h2 className="display">
            What&apos;s <span className="mark mark-teal"><span>near you</span></span>
          </h2>
          <p>Tap a clip to watch. Tap a deal to claim. No account needed to start.</p>
        </div>
        <div className="bento">
          <article className="tile t-lg">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900&auto=format&fit=crop" alt="" />
            <span className="deal">Chef&apos;s special</span>
            <span className="play">▶</span>
            <div className="ov"><b>The Corner Kitchen</b><span>Willowdale · Food &amp; Drink</span></div>
          </article>
          <article className="tile">
            <img src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600&auto=format&fit=crop" alt="" />
            <span className="play">▶</span>
            <div className="ov"><b>Dream Rose Florist</b><span>Richmond Hill</span></div>
          </article>
          <article className="tile t-tall">
            <img src="https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=600&auto=format&fit=crop" alt="" />
            <span className="deal">New-customer</span>
            <span className="play">▶</span>
            <div className="ov"><b>Fade &amp; Co. Barbers</b><span>Downtown · Beauty</span></div>
          </article>
          <article className="tile">
            <img src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=600&auto=format&fit=crop" alt="" />
            <span className="deal">BOGO</span>
            <span className="play">▶</span>
            <div className="ov"><b>Ana Pastry</b><span>Old Town</span></div>
          </article>
          <article className="tile t-wide">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop" alt="" />
            <span className="play">▶</span>
            <div className="ov"><b>Maple &amp; Thread</b><span>Midtown · Retail</span></div>
          </article>
          <article className="tile">
            <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=600&auto=format&fit=crop" alt="" />
            <span className="play">▶</span>
            <div className="ov"><b>Align Wellness</b><span>Midtown</span></div>
          </article>
          <article className="tile">
            <img src="https://images.unsplash.com/photo-1521123845560-14093637aa24?q=80&w=600&auto=format&fit=crop" alt="" />
            <span className="deal">20% off</span>
            <span className="play">▶</span>
            <div className="ov"><b>Corner Books</b><span>Old Town</span></div>
          </article>
        </div>
        <div className="center-cta">
          <Link className="sticker sticker-tang big" href="/feed">See all near you →</Link>
        </div>
      </section>

      <section id="how" className="container section reveal">
        <h2 className="display center" style={{ marginBottom: "36px" }}>
          Three taps to <span className="mark"><span>shop local</span></span>
        </h2>
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h3>Browse</h3>
            <p>Scroll short videos from the small businesses right around you — no app download required.</p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h3>Find</h3>
            <p>Catch today&apos;s deals, hours, and the story behind each spot, all in one swipe.</p>
          </div>
          <div className="step">
            <div className="num">3</div>
            <h3>Support</h3>
            <p>Walk in, shop, and keep your neighbourhood thriving — one local visit at a time.</p>
          </div>
        </div>
      </section>

      <section className="container section reveal">
        <div className="mapwrap">
          <div className="map-copy">
            <h2 className="display">
              A living map of <span className="mark mark-teal"><span>your area</span></span>
            </h2>
            <p>Pick a neighbourhood or let us use your location — then watch the block come to life, business by business.</p>
            <div className="nbhd-chips">
              <a className="chip" href="#">Willowdale</a>
              <a className="chip" href="#">Richmond Hill</a>
              <a className="chip" href="#">Downtown</a>
              <a className="chip" href="#">Old Town</a>
              <a className="chip" href="#">Midtown</a>
            </div>
            <Link className="sticker sticker-ink big" href="/feed">📍 Use my location</Link>
          </div>
          <div className="map-grid" aria-hidden="true">
            <div className="blk"></div><div className="blk road"></div><div className="blk"></div><div className="blk park"></div><div className="blk"></div><div className="blk"></div>
            <div className="blk road"></div><div className="blk road"></div><div className="blk road"></div><div className="blk road"></div><div className="blk road"></div><div className="blk road"></div>
            <div className="blk"></div><div className="blk"></div><div className="blk tang"></div><div className="blk"></div><div className="blk road"></div><div className="blk"></div>
            <div className="blk park"></div><div className="blk"></div><div className="blk road"></div><div className="blk"></div><div className="blk"></div><div className="blk tang"></div>
            <div className="blk"></div><div className="blk road"></div><div className="blk"></div><div className="blk"></div><div className="blk road"></div><div className="blk"></div>
            <span className="pin p1">📍</span><span className="pin p2">📍</span><span className="pin p3">📍</span>
          </div>
        </div>
      </section>

      <section id="owners" className="owners-band reveal">
        <div className="container owners-inner">
          <div>
            <span className="kicker">For business owners</span>
            <h2 className="display">Get found by the locals next door.</h2>
            <p>List free, post short videos, and run deals that bring people through your door. No commission, no catch.</p>
            <ul className="owner-points">
              <li>✓ Free listing</li>
              <li>✓ Reach nearby customers</li>
              <li>✓ Videos &amp; deals built in</li>
            </ul>
          </div>
          <div className="owners-cta">
            <Link className="sticker sticker-tang big" href="/onboarding">List your business</Link>
            <span className="muted">Takes about 5 minutes</span>
          </div>
        </div>
      </section>

      <section className="container section proof reveal">
        <div className="stats">
          <div className="stat"><div className="n">1,000+</div><div className="l">local businesses</div></div>
          <div className="stat"><div className="n">25</div><div className="l">neighbourhoods</div></div>
          <div className="stat"><div className="n">4.8★</div><div className="l">average rating</div></div>
        </div>
        <div className="notes">
          <blockquote className="note">
            &ldquo;I found three new spots on my own street I never knew existed.&rdquo;
            <cite>— Priya, Willowdale</cite>
          </blockquote>
          <blockquote className="note">
            &ldquo;Listed my bakery in five minutes and had walk-ins from it the same week.&rdquo;
            <cite>— Marco, Ana Pastry</cite>
          </blockquote>
          <blockquote className="note">
            &ldquo;It&apos;s like TikTok, but everything is within walking distance. Obsessed.&rdquo;
            <cite>— Dee, Old Town</cite>
          </blockquote>
        </div>
      </section>

      <footer className="footer">
        <div className="container foot-inner">
          <div className="foot-brand">
            <Link className="logo" href="/">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--tang)">
                <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
              <span>Localy</span>
            </Link>
            <p className="foot-tag">Discover and support the small businesses around you — one short video at a time.</p>
          </div>
          <div className="foot-cols">
            <div>
              <h4>Discover</h4>
              <a href="#near">Browse local</a>
              <a href="#">Deals near you</a>
              <a href="#">Neighbourhoods</a>
              <a href="#how">How it works</a>
            </div>
            <div>
              <h4>Business</h4>
              <a href="#owners">List your business</a>
              <a href="#">Pricing</a>
              <a href="#">Success stories</a>
              <a href="#">Help centre</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Privacy</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="container foot-bottom">
          <div className="socials">
            <a href="#" aria-label="X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2H21l-6.56 7.5L22 22h-6.4l-4.7-6.1L5.4 22H2.6l7.02-8.02L2 2h6.56l4.24 5.6L18.244 2Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12ZM10 15V9l5 3-5 3Z" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 3c.3 2.1 1.5 3.6 3.6 3.9v2.6c-1.3 0-2.5-.4-3.6-1v6.1A5.6 5.6 0 1 1 10.4 9v2.7a2.9 2.9 0 1 0 2 2.8V3H16Z" />
              </svg>
            </a>
          </div>
          <span className="copy">© 2026 Localy. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
