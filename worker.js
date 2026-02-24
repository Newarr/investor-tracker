/**
 * Cloudflare Worker for password-protected investor intro tracker
 */

const USERNAME = 'ramp';
const PASSWORD = 'ramp2026';

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ramp — Help Us Find Warm Paths In</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #f5f6f8;
    color: #1a1a1a;
    padding: 48px 20px 100px;
    line-height: 1.6;
  }
  .container { max-width: 680px; margin: 0 auto; }

  /* Intro section */
  .intro { margin-bottom: 36px; }
  .intro h1 {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #111;
    margin-bottom: 16px;
  }
  .intro p {
    font-size: 15px;
    color: #444;
    margin-bottom: 12px;
  }
  .intro p strong { color: #222; }

  /* How-it-works */
  .how-box {
    background: #fff;
    border: 1px solid #e0e3e8;
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 40px;
  }
  .how-box h2 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #888;
    margin-bottom: 12px;
  }
  .steps { list-style: none; counter-reset: s; }
  .steps li {
    counter-increment: s;
    padding: 6px 0;
    padding-left: 32px;
    position: relative;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
  }
  .steps li::before {
    content: counter(s);
    position: absolute;
    left: 0;
    top: 6px;
    width: 22px; height: 22px;
    background: #0a66c2;
    color: #fff;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Section labels */
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 10px;
    margin-top: 32px;
  }
  .section-label.high { color: #b45309; }
  .section-label.medium { color: #6b7280; }
  .section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
  }
  .section-label.high .section-count { background: #fef3c7; color: #92400e; }
  .section-label.medium .section-count { background: #f3f4f6; color: #4b5563; }

  /* Accordion cards */
  .card-list { display: flex; flex-direction: column; gap: 6px; }
  .card {
    background: #fff;
    border: 1px solid #e0e3e8;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .card:hover { border-color: #cdd1d7; }
  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    cursor: pointer;
    user-select: none;
  }
  .card-header:hover { background: #fafbfc; }
  .chevron {
    flex-shrink: 0;
    width: 18px; height: 18px;
    color: #bbb;
    transition: transform 0.2s;
  }
  .card.open .chevron { transform: rotate(90deg); color: #666; }
  .card-info { flex: 1; min-width: 0; }
  .card-company {
    font-size: 15px;
    font-weight: 600;
    color: #111;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-company img {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .card-role { font-size: 12px; color: #888; margin-top: 1px; }
  a.search-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #0a66c2;
    color: #fff;
    text-decoration: none;
    border-radius: 24px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.15s;
  }
  a.search-btn:hover { background: #004182; }
  a.search-btn svg { flex-shrink: 0; }

  /* Expandable body */
  .card-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s ease;
  }
  .card.open .card-body { max-height: 800px; }
  .card-body-inner {
    padding: 0 18px 16px 50px;
    font-size: 13px;
    color: #555;
    line-height: 1.55;
  }
  .card-body-inner strong { color: #333; font-weight: 600; }
  .card-body-inner p { margin-bottom: 8px; }
  .card-body-inner ul { margin-left: 16px; margin-bottom: 8px; }

  /* Checked state for buttons */
  a.search-btn.checked {
    background: #e2e8f0;
    color: #64748b;
  }
  a.search-btn.checked:hover { background: #cbd5e1; }
  a.search-btn.checked svg { opacity: 0.6; }

  /* Sticky CTA bar */
  .sticky-cta {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(30, 41, 59, 0.97);
    backdrop-filter: blur(8px);
    color: #fff;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 10;
    font-size: 14px;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.1);
  }
  .sticky-cta-text { font-weight: 500; }
  .sticky-cta-text strong { color: #93c5fd; }
  .sticky-cta-counter {
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
  }

  /* Footer */
  .footer {
    margin-top: 48px;
    padding-top: 24px;
    padding-bottom: 72px;
    border-top: 1px solid #e0e3e8;
    font-size: 13px;
    color: #999;
    line-height: 1.7;
  }
  .footer strong { color: #666; font-weight: 600; }

  @media (max-width: 540px) {
    .card-header { flex-wrap: wrap; gap: 10px; }
    a.search-btn { width: 100%; justify-content: center; margin-top: 4px; }
    .card-body-inner { padding-left: 18px; }
  }
</style>
</head>
<body>
<div class="container">

  <div class="intro">
    <h1>Help Us Find Warm Paths In</h1>
    <p>We're running a focused strategic process for Ramp and are looking for warm introductions to senior people at the companies below. Cold outreach from our bankers has stalled at several of these, and <strong>a single warm intro from the right person could unlock conversations that have been stuck for months.</strong></p>
    <p>I would genuinely value your help here. Even one connection at one company makes a real difference.</p>
  </div>

  <div class="how-box">
    <h2>What I'm asking you to do</h2>
    <ol class="steps">
      <li>Click on a company below to expand it and see who we're looking for and why.</li>
      <li>Hit <strong>"Search your network"</strong> — LinkedIn will show your 1st-degree connections at that company.</li>
      <li>If you see someone relevant, <strong>reply to my email with their name</strong>. I'll send you a forwardable blurb so you don't have to draft anything.</li>
    </ol>
  </div>

  <div class="section-label high">High Priority <span class="section-count">10</span></div>
  <div class="card-list">

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=consensys.io&sz=32" alt="">ConsenSys</div>
          <div class="card-role">CorpDev Lead (contact via existing MetaMask integration channels)</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%229373737%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> CorpDev Lead (contact via existing MetaMask integration channels)</p>
        <p><strong>Business Case:</strong> ConsenSys MUST consolidate fiat-crypto infrastructure NOW with MetaMask serving 100M+ users. Ramp already embedded as on/off-ramp provider since 2020. Acquisition eliminates third-party dependency, captures full value chain margin, and secures strategic control over fiat flows for Infura/Linea ecosystem. MetaMask integration generating material transaction volume.</p>
        <p><strong>Blocker:</strong> No active M&A dialogue identified. Surmountable via warm intro through existing MetaMask BD relationship (operational since 2020, last technical sync Aug 2023).</p>
        <p><strong>Intro:</strong> Leverage Łukasz Anwajler's MetaMask partnership channel. Position as vertical integration play: "eliminate margin leak, own the rails."</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[02/12/26] Initial Project Rocket meeting - marked Pass, Rocket to schedule follow-up</li>
          <li>[08/29/23] Technical sync re: MetaMask operationalization (Szymon/Łukasz)</li>
          <li>[01/27/21] Intro to MetaMask product lead via Ethworks connection</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=block.xyz&sz=32" alt="">Block (Square)</div>
          <div class="card-role">CorpDev or M&A Lead reporting to CFO or Corporate Strategy</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%22675562%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> CorpDev or M&A Lead reporting to CFO or Corporate Strategy</p>
        <p><strong>Business Case:</strong> Block MUST own fiat-crypto infrastructure NOW with \$2B bitcoin revenue (33% of total) and 57M Cash App users trading crypto. TBD division building decentralized bitcoin exchange needs licensed fiat gateway. Ramp's 150+ country infrastructure and white-label embedding delivers 2-3 year acceleration vs. in-house build.</p>
        <p><strong>Blocker:</strong> Passed 01/27/26 citing "not a strategic fit" — likely preference for in-house build given TBD's existing infrastructure roadmap.</p>
        <p><strong>Intro:</strong> Clear Street sent teaser 12/01/25 via standard banker channel. No warm intro path identified in Ramp network.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[01/27/26] Passed - "not a strategic fit"</li>
          <li>[12/01/25] Clear Street sent initial teaser</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=nubank.com.br&sz=32" alt="">Nubank</div>
          <div class="card-role">Corp dev or close to CEO / product leadership</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%223767529%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> 127M-customer neobank expanding stablecoin payments infrastructure for NuPay across Brazil/Mexico/Colombia/US markets.</p>
        <p><strong>Business Case:</strong> Nubank MUST build stablecoin-to-fiat conversion at point of payment to hit \$30 ARPAC target (currently \$13). Roberto Campos Neto's Meridian stablecoin payments announcement created regulatory clarity for Brazil. Revolut proved crypto conversion drives 2-3x ARPAC growth. US OCC charter requires crypto custody live by mid-2027. Current stack (Paxos custody, Talos routing, Fireblocks infrastructure) leaves gap: no one converts USDC-to-reais at point of payment, where margin lives. Build-from-scratch takes 18-30 months. We compress to weeks with licensed white-label on/off-ramp (UK/EU/US/Brazil), proven at scale (MetaMask, Ledger), solving the conversion gap NOW.</p>
        <p><strong>Blocker:</strong> New Head of Crypto (Michael Rihani, hired from Coinbase Sep 2025) may be building own strategy; went silent after 01/11 deadline despite warm Jakub intro.</p>
        <p><strong>Intro:</strong> Jakub → Cadu (NuPay decision maker), positioned around Campos Neto's Meridian announcement and ARPAC expansion urgency.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Sep 2025] Hired Michael Rihani from Coinbase as Head of Crypto—signals serious crypto expansion</li>
          <li>[Jan 2026] Jakub intro to Cadu referencing Campos Neto Meridian stablecoin announcement</li>
          <li>[01/11/26] Cadu confirmed follow-up deadline, then went silent</li>
          <li>[01/14/26] Passed via Clear Street banker channel—no meeting, no further engagement</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=shopify.com&sz=32" alt="">Shopify</div>
          <div class="card-role">Payments strategy, corp dev, or fintech partnerships</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%2210462386%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Native crypto payment infrastructure for Shopify's 5M+ merchant base.</p>
        <p><strong>Business Case:</strong> Shopify's crypto payments run through third-party bolt-ons (Strike, BitPay)—crypto is the only payment method not native to Shopify Payments. Ramp's white-label on/off-ramp powers MetaMask and Ledger (10M users) and offers 2-3 year acceleration vs. in-house build. MUST/NOW: Carlos launched USDC checkout but lacks merchant payout side. Ramp provides stablecoin-to-local-currency off-ramp in 150+ countries with UK/EU/US licensing, unlocking Shopify Balance internationally where Shopify Payments doesn't operate.</p>
        <p><strong>Blocker:</strong> Rana Yared intro prepared Feb 2023 and renewed Dec 2025, never delivered to Shopify payments team despite 3-year runway.</p>
        <p><strong>Intro:</strong> Rana Yared (Balderton, Ramp board) to Carlos (USDC checkout lead) or payments/strategy contact.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Jan 2026] Clear Street teaser sent 01/08, 3x follow-ups, no response</li>
          <li>[Dec 2025] Rana intro promised, not completed</li>
          <li>[Feb 2023] Paulina coordinated pitch via Rana/Michael: on-ramp, NFT purchase, crypto checkout</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=klarna.com&sz=32" alt="">Klarna</div>
          <div class="card-role">Strategy or corp dev lead</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%22748731%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Ludo Lombaard (crypto infrastructure lead) or Andreas Ferraz (Head of Corp Dev)</p>
        <p><strong>Business Case:</strong> Klarna building crypto payment capabilities as part of broader fintech expansion. Despite IPO preparations, exploring crypto to stay competitive. Positioning as "Google for shopping" with crypto payment rails. Need highest regulatory standards for crypto infrastructure.</p>
        <p><strong>Blocker:</strong> IPO Focus: Corporate development initially declined intro due to IPO preparation (April 2025), later reversed. Timing: "Teams heads down right now and time isn't right for a connection."</p>
        <p><strong>Intro:</strong> Rana Yared (Balderton Capital, Klarna investor) → Filippa Bolz (Global Comms Lead) → Ludo Lombaard (Crypto Infrastructure Lead). Parallel path: Fred Lardieg (Mubadala Capital, Klarna investor) → Andreas Ferraz (Head of Corp Dev).</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Mar 2025] Rana Yared intro to Filippa Bolz → Ludo Lombaard connection established</li>
          <li>[Apr 2025] Initial rejection due to IPO focus, later reversed: "they do want an intro after all"</li>
          <li>[Feb 2025] Klarna announced readiness to embrace crypto (Finextra)</li>
          <li>[Jan 2026] Clear Street sent teaser 01/07, followed up 01/13, 01/21</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=wise.com&sz=32" alt="">Wise</div>
          <div class="card-role">Product or strategy lead</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%221769571%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Digital Assets Product Lead (hiring Oct 2025) or Emmanuel Thomassin (CFO)</p>
        <p><strong>Business Case:</strong> Wise MUST enable stablecoin settlement for cross-border merchants NOW to differentiate and counter Revolut competitive threat (\$10B stablecoin volume). Cross-border SMBs lose 3-5% to FX fees and wait T+2/T+3 for payouts; USDC settlement delivers instant settlement, cuts costs. Wise hiring Product Lead for Digital Assets (first crypto hire in 14 years) signals urgency. CEO quote: regulated crypto on/off-ramps "hardest thing to achieve reliably" — Ramp solves this with FCA registration, MiCA-ready EU, US MSB coverage.</p>
        <p><strong>Blocker:</strong> Taavet Follow-Up: Oct 2025 outreach needs more substance ("not enough to get a meeting"). Platform Discussions: 2022 conversations with Steve/Erik went silent. Timing: Digital Assets hire may indicate build-first approach initially.</p>
        <p><strong>Intro:</strong> Rana Yared → Morgan Stanley contact → Emmanuel Thomassin (CFO). Alternative: Taavet Hinrikus (co-founder, board member) asked for more detail Oct 2025.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Oct 2025] Szymon reached out to Taavet re: Digital Assets Product Lead hire</li>
          <li>[Oct 2025] Taavet response: "need more detail to share, Wise is sophisticated company"</li>
          <li>[Jun 2022] Connected with Erik Kaju (Director of Engineering, Wise Platform) via Nilan</li>
          <li>[Jan 2026] Clear Street teaser sent 01/08, followed up 01/14, 01/21</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=visa.com&sz=32" alt="">Visa</div>
          <div class="card-role">Crypto / digital asset strategy team (senior)</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%222190%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Visa seeks owned crypto infrastructure for issuer toolkit to complement network position. Stripe owns Bridge (\$1.1B), Mastercard bidding \$1.5-2B for Zero Hash—Visa has no major crypto acquisition.</p>
        <p><strong>Business Case:</strong> Visa crypto card spending grew 525% in 2025, with \$3.5B annualized stablecoin settlement volume and \$140B total crypto flows since 2020. CEO McInerney identified \$200T "new flows" TAM at Feb 2025 Investor Day. MUST own infrastructure: currently partnering with Stripe's Bridge subsidiary for LATAM stablecoin cards, strategically uncomfortable. NOW: Ramp embedded in MetaMask, Trust Wallet, Ledger—the "merchant terminals" of crypto. Visa operates network, lacks owned stack.</p>
        <p><strong>Blocker:</strong> Product/partnerships contact met (Cuy Sheffield, Nov 3, 2025), but no path to M&A decision makers. Need corp dev or strategy leadership.</p>
        <p><strong>Intro:</strong> Rana Yared offered connection to Steven King (Visa strategy) in Feb 2026. Clear Street driving current teaser process.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Aug 2021] Cuy Sheffield reaches out: "keep hearing great things about Ramp"</li>
          <li>[Nov 3, 2025] In-person meeting with Cuy at Visa offices—good engagement, wrong decision maker</li>
          <li>[Jan 8, 2026] Clear Street sends teaser, follows up 3x</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=paypal.com&sz=32" alt="">PayPal</div>
          <div class="card-role">Very senior only: crypto product or corp strategy leadership</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%22150981%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> M&A/CorpDev decision maker (current contacts David Weber/Brendan O'Toole are product team, not deal-makers)</p>
        <p><strong>Business Case:</strong> PayPal MUST acquire licensed on/off-ramp infrastructure NOW to scale PYUSD beyond US-only presence. Currently subsidizing free PYUSD on-ramps for distribution partners before 400M consumer rollout. Ramp owns 150+ country coverage including LatAm rails (PIX/SPEI) PayPal lacks, plus 300+ wallet integrations. PayPal explicitly wants to "become the MoonPay of crypto" — rare window where they're seeking external partners rather than building in-house.</p>
        <p><strong>Blocker:</strong> Need C-suite/founder intro to convert partnership discussions into M&A dialogue. Surmountable via Anil Hansjee (Fabric VC) who introduced Jose Fernandez da Ponte (senior exec), very receptive in Oct 2024.</p>
        <p><strong>Intro:</strong> Leverage Jose Fernandez da Ponte relationship + Steve Everett (leads approval/business justification) for M&A angle.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Feb 9, 2026] Deep dive with David Weber on branded stablecoin partnership model (MoonPay + M Zero), 2-3 month integration timeline</li>
          <li>[Dec 18, 2025] PayPal "doubling/tripling down" on PYUSD, focus on payments vs. exchange model</li>
          <li>[Oct 17, 2024] Jose Fernandez da Ponte + Steve Everett meeting, very receptive, will subsidize PYUSD on-ramps</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=stripe.com&sz=32" alt="">Stripe</div>
          <div class="card-role">Corp dev, M&A, or path to founders</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%222135371%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Enable Stripe to scale stablecoin checkout and supplier payouts globally post-Bridge acquisition using Ramp's licenses, corridor coverage, and D2C product capabilities.</p>
        <p><strong>Business Case:</strong> Stripe's \$1.1B Bridge acquisition (Oct 2024) signals massive commitment to stablecoins but Bridge lacks geographic licensing and live corridor scale. Ramp brings FCA/IE VASP/US MSB coverage, 150+ country live rails, and battle-tested D2C UX (10M users). PSP competitors (Adyen, Checkout.com, Rapyd) evaluating stablecoin strategies post-Bridge; Stripe needs acceleration partner to maintain first-mover advantage before integration window closes.</p>
        <p><strong>Blocker:</strong> No Corp Dev access established; Will (Corp Dev) non-responsive to Oct 2025 outreach; commercial relationship strong but hasn't elevated to strategic M&A discussion.</p>
        <p><strong>Intro:</strong> Spencer Crawley attempted Corp Dev intro Oct 2025 (failed); Balderton (Jen Andre, Rana Yared) offered 2022 comms/partnership intro; Patrick Collison invited Szymon to May 2025 Executive Summit; Conor (EMEA CRO) personally engaged post-Warsaw roundtable Mar 2025.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Oct 2024] Stripe acquired Bridge for \$1.1B (~90x revenue); "largest-ever crypto acquisition"</li>
          <li>[Mar 2025] Szymon panelist at Stripe CEE Executive Roundtable (Warsaw); Conor committed to "stay close personally"</li>
          <li>[May 2025] Patrick Collison invited Szymon to Executive Summit SF (stablecoins & agentic commerce focus)</li>
          <li>[Oct 2025] Strategic outreach to Will (Corp Dev) via Spencer Crawley intro - no response</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=mastercard.com&sz=32" alt="">Mastercard</div>
          <div class="card-role">SVP+ in Crypto & Digital Currencies team, or Corp Dev / M&A leadership</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%223015%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> VP Business Development, crypto/fintech partnerships (Dorothea Ysenburg active contact).</p>
        <p><strong>Business Case:</strong> Mastercard MUST own crypto on/off-ramp infrastructure to enable native card-to-crypto flows for 3.4B cardholders—current third-party model (Wirex, BitPay) keeps crypto off Mastercard rails, creating inefficiencies. Ramp provides turnkey infrastructure to compete with Visa's USDC settlement. NOW matters: Stripe's \$1.1B Bridge acquisition and accelerating crypto adoption create urgency to own the infrastructure layer.</p>
        <p><strong>Blocker:</strong> Ramp's significant cash burn through 2027 triggered Clear Street pass on 01/14/26.</p>
        <p><strong>Intro:</strong> Historical relationship exists—Szymon connected with Michał Turski (Poland) in February 2021 exploring crypto card integration. December 2024 active partnership discussions with Dorothea Ysenburg (VP Business Development, Frankfurt) on LatAm expansion (\$6M monthly PTC volume projected via Mastercard), crypto credentials alignment, and Send/XB product feedback.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Feb 2021] Szymon reached out to Michał Turski exploring crypto-to-card integration—crypto transfers on Mastercard rails "coming in 2021" but never materialized</li>
          <li>[Dec 2024] Active partnership track with Dorothea Ysenburg. Ramp proposed \$6M monthly PTC volume in LatAm with 1-2 month ramp-up</li>
          <li>[Jan 2026] Clear Street sent teaser 01/08/26, deal passed 01/14/26 citing cash burn concerns</li>
        </ul>
      </div></div>
    </div>

  </div>

  <div class="section-label medium">Medium Priority <span class="section-count">11</span></div>
  <div class="card-list">

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=adyen.com&sz=32" alt="">Adyen</div>
          <div class="card-role">President's office, CSO, or corp dev</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%22279565%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Global payment processor (\$20B+ valuation) competing with Stripe's stablecoin expansion; strong in Far East Asia and North America merchant acquiring.</p>
        <p><strong>Business Case:</strong> Adyen MUST add stablecoin infrastructure NOW to defend market position against Stripe (shipped stablecoin checkout May 2024) and capitalize on \$1T+ payment volume shift. Industry intel confirms Adyen/Klarna "signalling interest" in stablecoins (BVNK Feb 2025). Ramp accelerates 2-3 years with white-label infrastructure covering 150+ countries, matching Adyen's compliance-first culture and geographic footprint. Merchant demand real: PayPal, Visa, Mastercard already deployed.</p>
        <p><strong>Blocker:</strong> Cold outreach failing (Clear Street 3+ follow-ups, no response). Oct 2025 Szymon email via Brent to "Pieter" unanswered. MoonPay may have existing partnership. No identified decision makers beyond generic contacts.</p>
        <p><strong>Intro:</strong> Piotr Debek (Ramp Legal) reviewed Adyen MSA in Oct 2022 as "potential acquirer" — commercial relationship history exists. Warm intro path through Piotr's contacts or Money20/20 events where Adyen attends.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Feb 2025] BVNK newsletter explicitly cites "Adyen signalling interest" in stablecoin payments</li>
          <li>[Jan 2026] Clear Street sent teaser (Jan 8), followed up 3x — no response</li>
          <li>[Oct 2025] Szymon cold email via Brent to Pieter re: stablecoin strategy — no response</li>
          <li>[Oct 2022] Piotr Debek requested Adyen MSA review for "potential acquirer" partnership</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=sumup.com&sz=32" alt="">SumUp</div>
          <div class="card-role">CFO or Head of Strategy / M&A</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%229176559%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> London-based merchant acquirer (4M SMB merchants, 36 countries) preparing \$15B IPO in 2026; acquiring banking infrastructure via Paysolut to become full merchant financial OS.</p>
        <p><strong>Business Case:</strong> SumUp MUST enable stablecoin settlement for cross-border merchants NOW to differentiate pre-IPO and counter Stripe/Bridge competitive threat. Cross-border SMBs lose 3-5% to FX fees and wait T+2/T+3 for payouts; USDC settlement via Ramp delivers instant settlement, cuts costs, and unlocks float yield on merchant balances held in SumUp Business Accounts. Recent Paysolut acquisition signals banking expansion ambition; stablecoin rails are natural next layer for merchant financial OS strategy. IPO timing creates urgency: "banking future of global SMB commerce with stablecoin settlement" is differentiated public markets narrative vs. commodity card acquirer story.</p>
        <p><strong>Blocker:</strong> No direct contact established; warm intros available but not yet activated.</p>
        <p><strong>Intro:</strong> Max Moldenhauer (Sunfish Partners) offered CEO/CTO intro January 2022: "I know the CTO and CEO very well." Marcus Erken added October 2025: co-founder Petter Made backchannel available for strategic escalation.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Jan 2022] Max Moldenhauer offers high-level intro to Daniel Klein (CEO) and Johannes Schaback</li>
          <li>[Oct 2025] Marcus Erken adds Petter Made (co-founder) to tracker, offers backchannel for M&A-level discussions</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=plaid.com&sz=32" alt="">Plaid</div>
          <div class="card-role">Corp dev or partnerships lead</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%222684737%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Zach Perret (CEO, reviewing stablecoin strategy Oct 2025) or Chi Le (Crypto Lead at Plaid)</p>
        <p><strong>Business Case:</strong> Plaid actively pursuing crypto companies (Coinbase, Kraken, Strike already customers). Zach Perret/Mischief VC reviewing stablecoin opportunities (Oct 2025). Revenue diversification: Moving beyond bank account linking to payments, lending, identity verification. Mutual value: Plaid sells tools (bank linking, KYC, fraud detection) that crypto onramps need; Ramp has crypto expertise Plaid lacks. Plaid's 800M+ connected bank accounts = distribution for Ramp's fiat-to-crypto flows.</p>
        <p><strong>Blocker:</strong> No response to stablecoin intro: Oct 2025 Lauren Farleigh intro to Zach Perret went unanswered. Sales outreach fatigue: Multiple cold emails from Ben Schiller (Aug-Nov 2024) suggest lack of exec engagement.</p>
        <p><strong>Intro:</strong> Spencer Crawley (First Minute Capital) → Lauren Farleigh (Mischief VC) → Zach Perret (CEO/Co-Founder). Oct 2025 intro attempt, Lauren co-founded Mischief VC with Zach. Alternative: Ben Schiller (Plaid GTM) - already engaged.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Oct 2025] Intro attempt via Spencer Crawley → Lauren Farleigh → Zach Perret (stablecoin strategy)</li>
          <li>[Sep 2024] Multiple outreach attempts from Ben Schiller re: ACH/KYC partnership</li>
          <li>[Jan 2026] Clear Street teaser sent 01/08, followed up 01/14, 01/21</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=tether.to&sz=32" alt="">Tether</div>
          <div class="card-role">Any senior contact</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%224842724%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Tether - \$140B USDT issuer expanding into owned infrastructure to reduce third-party dependency.</p>
        <p><strong>Business Case:</strong> Tether MUST own fiat gateway infrastructure to control USDT liquidity and compete against Circle's aggressive subsidization in emerging markets. Ramp brings 150+ country licensed coverage, proven USDT partnership success (TON exclusive launch April 2024, featured in Coindesk as only on/off-ramp provider), and 8M+ users processing \$1B+ annually. Circle is NOW subsidizing zero-fee USDC with no-KYC up to \$500/week across key markets. Tether needs acquisition speed to maintain market dominance.</p>
        <p><strong>Blocker:</strong> Partnership relationship exists (TON campaign, Dec 2024 proposal to Caine), but zero M&A engagement - notoriously difficult to reach strategic/corp dev level.</p>
        <p><strong>Intro:</strong> Max Engelen (Ramp) has direct line to Phillip Gradwell (Head of Economics, Tether) - highest-value escalation path to strategic discussions.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[April 2024] Ramp exclusive launch partner for USDT on TON (90-day zero-fee campaign, Coindesk featured as only on/off-ramp out of 29 services)</li>
          <li>[Dec 2024] Henry sent partnership proposal to Caine (\$750K-\$3M subsidy options) highlighting Circle's competitive threat in LatAm</li>
          <li>[Oct 2025] Failed intro attempt via Jakub Zakrzewski to Marco Dal Lago (VP Global Expansion) - no movement by Nov</li>
          <li>[Feb 2026] Arnoud Star Busmann (Quantoz) discussions about joint approach</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=moneygram.com&sz=32" alt="">MoneyGram</div>
          <div class="card-role">Corp dev or partnerships lead (crypto side)</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%228362%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Global remittance provider (\$1.1B revenue) with 300k+ cash locations, pivoting from transaction-based to stablecoin wallet business via Stellar partnership.</p>
        <p><strong>Business Case:</strong> MoneyGram MUST transform from declining wire transfer model to wallet-based stablecoin accounts. Their MoneyGram Access™ enables USDC-to-cash conversions at 300k+ locations globally, but they lack technology to build quasi-bank stablecoin wallets with yield/spend features. NOW is critical as fintech competitors erode traditional remittance margins—they need wallet infrastructure to shift from one-time transactions to recurring customer relationships in developing markets where they have distribution dominance.</p>
        <p><strong>Blocker:</strong> No active pipeline momentum since Token2049 meeting (Sept 2024); Clear Street handling outreach but repeated follow-ups (Dec-Jan) suggest stalled engagement.</p>
        <p><strong>Intro:</strong> Warm relationship through Token2049 Singapore meeting (Sept 2024) with partnerships lead Jonathan Lira; initial discussions coordinated summer 2024 with Sebastien Gilquin and Jose Atalaya.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Jul 2024] Initial partnership calls scheduled with Jonathan Lira, Sebastien Gilquin, Jose Atalaya</li>
          <li>[Sept 19, 2024] Token2049 Singapore meeting at L3 Cafe with MoneyGram partnerships team</li>
          <li>[Nov 5, 2025] Teaser shared by Clear Street</li>
          <li>[Dec 2024-Jan 2026] Clear Street follow-ups (12/02, 01/05, 01/13, 01/21) with no documented response</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=bitgo.com&sz=32" alt="">BitGo</div>
          <div class="card-role">Founder or senior strategy</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%223597797%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> C-level at BitGo (largest independent digital asset custodian, \$100B+ custody, OCC charter, post-IPO).</p>
        <p><strong>Business Case:</strong> BitGo's custody/trading infrastructure + Ramp's fiat rails = full-stack crypto platform. BitGo clients (Coinbase, Robinhood, Fireblocks) all need compliant on/off-ramps that Ramp provides. NOW: post-IPO companies seek accretive M&A to expand offerings. Ramp's MICA passport and US licenses complement BitGo's federal charter for global reach.</p>
        <p><strong>Blocker:</strong> Unresponsive to teaser. Post-IPO price decline left team overwhelmed with limited bandwidth for strategic opportunities.</p>
        <p><strong>Intro:</strong> Clear Street sent teaser 01/28/26. No response. Passed 01/30/26.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[01/30] Pass - Unresponsive</li>
          <li>[01/28] Clear Street sent teaser</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=traderepublic.com&sz=32" alt="">Trade Republic</div>
          <div class="card-role">Founder/CEO office or corp dev</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%2213014668%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Trade Republic - Europe's leading mobile brokerage (4M+ users, €6B+ AUM, \$5B+ valuation) with banking license and crypto offering in Germany.</p>
        <p><strong>Business Case:</strong> Trade Republic MUST match Revolut/N26 crypto capabilities to defend market position. Revolut launched retail crypto December 2025, N26 deployed crypto wallet October 2022 - Trade Republic risks falling behind. Ramp's MiCAR-compliant SDK offers 6-12 month speed advantage vs in-house build while competitors capture market share. Banking license + existing crypto trading = perfect stablecoin infrastructure partner. NOW because competitive window closing as German neobroker market consolidates.</p>
        <p><strong>Blocker:</strong> No direct warm intro to Trade Republic leadership; must reactivate dormant TCV relationship (2.5 years since last contact June 2022).</p>
        <p><strong>Intro:</strong> Warm path via Serhat Kizilboga at TCV (Trade Republic investor) - had 8-month active dialogue Oct 2021-Jun 2022 on on-ramp infrastructure, explicitly offered portfolio company intros.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[Nov 2024] Company sourced introduction</li>
          <li>[Oct 2021-Jun 2022] Active dialogue with TCV (investor) - TCV called themselves "big fans of your vision"</li>
          <li>[Dec 2025] Competitive threat intensified - Revolut entered retail crypto trading</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=sofi.com&sz=32" alt="">SoFi</div>
          <div class="card-role">CFO, corp dev, or crypto product leadership</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%222301992%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> US digital bank with OCC charter, NASDAQ-listed, multi-million member base. Launched crypto trading Nov 2025.</p>
        <p><strong>Business Case:</strong> MUST enable international transfers and stablecoin yield accounts NOW to compete with neobanks (Revolut crypto = top revenue driver). Ramp's white-label on/off-ramp infrastructure provides 2-3 quarter speed-to-market vs. 18-24 month build, covering 150+ countries with US MSB + MTLs aligned to SoFi's regulatory posture. Cross-border expansion gap = strongest wedge for US-focused bank lacking international capabilities.</p>
        <p><strong>Blocker:</strong> Cold outreach via Clear Street lost momentum after Dec 2 reschedule request; needs warm intro to crypto/product leadership.</p>
        <p><strong>Intro:</strong> Clear Street sent teaser 11/05/25, SoFi requested reschedule 12/02/25, then silent through 4 follow-ups.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[11/05/25] Teaser sent by Clear Street</li>
          <li>[11/25] SoFi launched crypto trading with "bank-level confidence" positioning</li>
          <li>[12/02] SoFi requested to reschedule call (interest signal)</li>
          <li>[12/08, 01/05, 01/12] Clear Street follow-ups, no response (cooling)</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=payoneer.com&sz=32" alt="">Payoneer</div>
          <div class="card-role">CEO/CFO or Strategy / M&A</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%2256101%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Global B2B payout network serving marketplace sellers and contractors across 100+ countries with deep Amazon, eBay, Airbnb, Upwork, Shopify integrations.</p>
        <p><strong>Business Case:</strong> Payoneer runs massive long-tail payouts across difficult corridors, locking working capital in transit while absorbing high FX costs. USDC instant payouts with local cash-out would release trapped float, cut DSO, reduce costs, and lift NPS. Payoneer MUST act NOW as competitors (Wise Platform, Airwallex, Tipalti) race to productize stablecoin settlement—first movers capture new margin pools.</p>
        <p><strong>Blocker:</strong> Multiple Clear Street follow-ups with no response suggests lack of champion or wrong stakeholder (needs VP Finance/Treasury/Payments).</p>
        <p><strong>Intro:</strong> Clear Street sent teaser 11/05/25, followed up four times through 01/05/26.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[01/05] CS fourth follow-up, no response</li>
          <li>[12/02] CS third follow-up</li>
          <li>[11/18] CS second follow-up</li>
          <li>[11/11] CS first follow-up</li>
          <li>[11/05] CS sent teaser</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=worldline.com&sz=32" alt="">Worldline</div>
          <div class="card-role">Deputy CEO/Strategy or M&A</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%2295402%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> European payment processor CEO/Head of Strategic Partnerships with authority over MiCA crypto strategy and merchant acquiring product roadmap.</p>
        <p><strong>Business Case:</strong> APMs now volume contender vs cards globally — partners mandate conversion rate thresholds, users choose cheapest option with highest success rates. Ramp's Southeast Asia and LATAM expansion requires 10+ local payment methods NOW. Worldline's orchestration layer delivers 2-3 year acceleration via single integration vs piecemeal APM deals, plus vendor discovery, contingency connections, and faster go-to-market. EU Payment Institution licenses plus MiCA pathway unlock B2B crypto acceptance use case across merchant network continent-wide.</p>
        <p><strong>Blocker:</strong> Stage 2 contacted since 01/21/26. Clear Street leading cold outreach, no warm intro identified. Historical 2023 discussion (Ker Farn Lee) showed interest but no VASP licensing or whitelabel on-ramp capability.</p>
        <p><strong>Intro:</strong> Clear Street sent teaser 01/08/26, followed up 01/14/26 and 01/21/26. No response yet.</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[01/21/26] Clear Street followed up</li>
          <li>[01/14/26] Clear Street followed up</li>
          <li>[01/08/26] Clear Street sent teaser</li>
          <li>[Mar 2023] Ker Farn Lee explored APAC payment gateway aggregation and APM orchestration</li>
        </ul>
      </div></div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="card-info">
          <div class="card-company"><img src="https://www.google.com/s2/favicons?domain=phantom.app&sz=32" alt="">Phantom</div>
          <div class="card-role">Only if super warm to co-founders (Brandon Millman, Chris Kalani, Francesco Agosti)</div>
        </div>
        <a class="search-btn" href="https://www.linkedin.com/search/results/people/?currentCompany=%5B%2272352899%22%5D&network=%5B%22F%22%5D" target="_blank" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Search your network
        </a>
      </div>
      <div class="card-body"><div class="card-body-inner">
        <p><strong>Target:</strong> Phantom (15M users, multi-chain wallet, backed by Sequoia/Paradigm at \$150M Series C).</p>
        <p><strong>Business Case:</strong> Phantom MUST own KYC to prevent user churn to MoonPay/Coinbase. Their white-label on-ramp strategy requires proprietary fiat infrastructure to control customer relationships and avoid lock-in. Ramp's B2B network (MetaMask, Trust Wallet) becomes an acquisition funnel, not a liability, if kept separate post-close. This is NOW critical as they compete with licensed players like Robinhood/Revolut while scaling their cash product.</p>
        <p><strong>Blocker:</strong> Not strategic focus at time of evaluation (10/27); they were debating licensed vs. self-custodial route and questioned fit with B2B operations.</p>
        <p><strong>Intro:</strong> Joe Wadcan (Phantom) connected through Dave (former Phantom support, introduced Ramp in 2021).</p>
        <p><strong>Interaction History:</strong></p>
        <ul>
          <li>[10/10/25] Deep strategy meeting with Joe; reframed B2B as acquisition funnel, proposed keeping companies separate</li>
          <li>[10/13/25] Discussed 9-digit valuation range with Clear Street</li>
          <li>[10/27/25] Deal passed as "not strategic focus"</li>
        </ul>
      </div></div>
    </div>

  </div>

  <div class="footer">
    <strong>If you spot a relevant connection</strong>, just <a href="mailto:szymon@ramp.network?subject=Ramp%20Intro%20Connection" style="color: #0a66c2; text-decoration: underline;">reply to my email</a> with their name and the company. I'll send you a short forwardable blurb so you don't have to draft anything yourself.
    <br><br>
    Thank you — this genuinely helps.
  </div>


</div>

<div class="sticky-cta">
  <span class="sticky-cta-text">Found a connection? <strong><a href="mailto:szymon@ramp.network?subject=Ramp%20Intro%20Connection" style="color: #93c5fd; text-decoration: underline;">Reply to my email</a> with their name.</strong></span>
  <span class="sticky-cta-counter" id="counter"></span>
</div>

<script>
function toggle(header) {
  header.closest('.card').classList.toggle('open');
}

(function() {
  var STORAGE_KEY = 'ramp_checked_companies';
  var checked = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  var buttons = document.querySelectorAll('a.search-btn');
  var total = buttons.length;

  function updateCounter() {
    var count = Object.keys(checked).length;
    var el = document.getElementById('counter');
    if (count > 0) {
      el.textContent = count + ' of ' + total + ' checked';
    } else {
      el.textContent = '';
    }
  }

  buttons.forEach(function(btn) {
    var href = btn.getAttribute('href');
    if (checked[href]) {
      btn.classList.add('checked');
    }
    btn.addEventListener('click', function() {
      checked[href] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
      btn.classList.add('checked');
      updateCounter();
    });
  });

  updateCounter();

  // Auto-expand first 3 high priority cards
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < 3 && i < cards.length; i++) {
    cards[i].classList.add('open');
  }
})();
</script>
</body>
</html>
`;

export default {
  async fetch(request) {
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      return new Response('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Ramp Investor Intros"' },
      });
    }

    const [scheme, encoded] = authorization.split(' ');
    if (!encoded || scheme !== 'Basic') {
      return new Response('Invalid authentication', { status: 401 });
    }

    const decoded = atob(encoded);
    const [username, password] = decoded.split(':');

    if (username !== USERNAME || password !== PASSWORD) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Ramp Investor Intros"' },
      });
    }

    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
