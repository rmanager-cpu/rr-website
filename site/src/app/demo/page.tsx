import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { configured, enabled, hasDemoAccess } from '@/lib/demo/access';
import { settingsReport } from '@/lib/bookingcenter-api';
import { addDays, todayInTahoe } from '@/lib/demo/package';
import { GroupPackage } from './package-widget';
import './demo.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Ski together · Private booking demo',
  description: 'Private River Ranch group ski package review. No reservations or payments.',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: { title: 'River Ranch · Private booking demo', description: 'A group ski package concept for review.', url: undefined },
};

export default function DemoPage({ searchParams }: { searchParams: { error?: string } }) {
  if (!enabled()) notFound();
  const access = hasDemoAccess();
  const settings = settingsReport();
  const today = todayInTahoe();
  return (
    <main id="main" className="rd-demo">
      <div className="rd-review-banner"><span>PRIVATE CONCEPT REVIEW</span><span>BookingCenter sandbox · No bookings or payments</span></div>
      <header className="rd-header">
        <a href="/demo" aria-label="River Ranch demo home"><span className="brand__logo" aria-hidden="true" /></a>
        <nav aria-label="Demo navigation">{access && <><a href="#package">The ski escape</a><a href="#review-notes">Review notes</a></>}</nav>
        {access ? <form method="post" action="/api/demo/session"><input type="hidden" name="action" value="logout" /><button className="rd-text-button">Lock preview</button></form> : <span className="rd-micro">A LITTLE PREVIEW, JUST FOR YOU.</span>}
      </header>
      {!access ? (
        <section className="rd-login">
          <div><p className="rd-eyebrow">RIVER RANCH · GROUP SKI ESCAPES</p><h1>A good trip<br />starts <em>together.</em></h1><p>Rooms by the river. Days on the mountain.<br />A first look at bringing it all together.</p></div>
          <form method="post" action="/api/demo/session" className="rd-login-card">
            <span className="rd-eyebrow">PRIVATE REVIEW</span><h2>Come on in.</h2><p>Enter the review password to explore the group booking demo.</p>
            {configured() ? <><label htmlFor="demo-password">Review password</label><input id="demo-password" name="password" type="password" required autoComplete="current-password" maxLength={256} />{searchParams.error && <p role="alert" className="rd-error">That password didn’t match. Please try again.</p>}<button className="rd-button">Open the demo <span className="rd-arrow" aria-hidden="true">→</span></button></> : <p role="status" className="rd-error">The preview is locked. Review access has not been configured yet.</p>}
            <small>Private demo. Nothing here creates a reservation.</small>
          </form>
        </section>
      ) : (
        <>
          <section className="rd-hero">
            <div className="rd-hero-copy"><p className="rd-eyebrow">TAHOE CITY, CALIFORNIA · 19 ROOMS BY THE RIVER</p><h1>Your crew.<br />Our lodge.<br /><em>One great escape.</em></h1><p>Bring the ski group. Find rooms for everyone, add lift tickets, and put the whole trip together in one place.</p><a className="rd-button" href="#package">Build your group escape <span className="rd-arrow" aria-hidden="true">↓</span></a><span className="rd-hero-foot">MOUNTAIN DAYS. RIVERSIDE NIGHTS.</span></div>
            <div className="rd-hero-image"><img src="/photos/home/lodge-snow-blue-hour.jpg" alt="River Ranch glowing beneath snow at blue hour" /><div className="rd-image-caption"><span>THE LODGE, IN ITS ELEMENT.</span><b>Come for the snow.<br /><em>Stay for the company.</em></b></div></div>
          </section>
          <div className="rd-perks"><span>01 <b>Find rooms for the whole crew</b></span><span>02 <b>Add your mountain days</b></span><span>03 <b>See one package price</b></span></div>
          <section id="package" className="rd-package-section">
            <div className="rd-section-heading"><div><p className="rd-eyebrow">THE GROUP SKI ESCAPE</p><h2>More friends.<br /><em>Less figuring it out.</em></h2></div><p>Five rooms or more. One shared plan.<br />Choose your stay, build your room mix, and decide who needs lift tickets.</p></div>
            <GroupPackage today={today} initialCheckIn={addDays(today, 14)} initialCheckOut={addDays(today, 17)} sandboxConfigured={settings.preview && settings.test && settings.site === 'RIVERR'} />
          </section>
          <section id="review-notes" className="rd-notes"><div><p className="rd-eyebrow">FOR THE REVIEW</p><h2>A working idea.<br /><em>A few honest boundaries.</em></h2><p>The guest experience is the concept. The connection status and pricing labels tell you exactly what is real.</p></div><div className="rd-note-list">
            <details open><summary>What is working here?</summary><p>Date search, visible room availability, a complete group room mix, optional lift tickets, and one itemized package total. Sandbox mode reads BookingCenter; the sample walkthrough uses explicitly fictional inventory.</p></details>
            <details><summary>Are these real deals?</summary><p>No. The 10% discount at five rooms, the $125 ticket day, and tax treatment are made-up demo pricing. Call it bullshit pricing if you like—the point is to review the experience before approving the rules. No resort partnership or ticket entitlement is implied.</p></details>
            <details><summary>How does it avoid offering too many rooms?</summary><p>Sandbox mode checks the entire stay and every night, then uses the smallest room-type count. A missing night, price, capacity, or rate plan blocks the offer. Review checks again. These are availability snapshots, not inventory holds; concurrent-booking protection still needs BookingCenter’s confirmed reservation or hold workflow.</p></details>
            <details><summary>What needs confirmation before production?</summary><p>Production-key authorization; exact availability and rate semantics; group reservation or hold behavior; final rates, taxes and discount rules; payment processing; and a real source for lift-ticket prices, inventory and fulfillment. This demo does not create bookings, charge cards, issue tickets, or save guest details.</p></details>
          </div></section>
        </>
      )}
      <footer className="rd-footer"><span>RIVER RANCH <i>·</i> LODGE & RESTAURANT</span><span>Private booking concept · Separate from the public website</span></footer>
    </main>
  );
}
