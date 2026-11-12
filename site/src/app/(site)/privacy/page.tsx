import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { business, fullAddress } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

// The privacy policy, written from what the site actually does (Nov 2026): forms that save to the database,
// no analytics or ad trackers, staff-only cookies, and hand-offs to BookingCenter, OpenTable and Toast.
// It covers what California's CalOPPA asks for (what we collect, who gets it, how to review or change it, how
// changes are announced, an effective date, Do Not Track). Update EFFECTIVE and the matching section whenever
// the site starts collecting something new (analytics, a newsletter sign-up, payments).
const EFFECTIVE = 'November 11, 2026';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What River Ranch Lodge & Restaurant collects through riverranchlodge.com, who sees it, how long we keep it, and how to ask us to change or delete it.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const mail = business.email.restaurant;
  return (
    <>
      <JsonLd data={breadcrumbSchema('Privacy Policy', '/privacy')} />
      <SiteHeader />
      <section className="section section--snow">
        <div className="container prose" style={{ display: 'grid', gap: 28 }}>
          <div className="stack">
            <p className="label label--accent">The fine print</p>
            <h1 className="display-l" style={{ margin: 0 }}>Privacy <em>policy.</em></h1>
            <p className="muted" style={{ margin: 0 }}>Effective {EFFECTIVE}</p>
          </div>

          <p className="lede">
            Short version: we only collect what you send us, we use it to answer you, and we don’t sell it, rent it or use it for advertising. This
            policy covers riverranchlodge.com, run by {business.name}, {fullAddress}.
          </p>

          <div>
            <h2 className="display-s">What we collect</h2>
            <p><strong>What you type into a form.</strong> When you fill one in, we get what you enter:</p>
            <ul>
              <li><strong>Job applications:</strong> your name, email, phone, where you live, the job and hours you want, your availability, certifications, past jobs, your three references’ names and contact details, what you tell us about yourself, and your resume if you attach one.</li>
              <li><strong>Band and performer requests:</strong> your act’s name, a contact name, email or phone, links to your music and the dates you’re open.</li>
              <li><strong>The Wall:</strong> what you tell us about a photo, plus a name and a way to reach you if you leave them.</li>
              <li><strong>Event inquiries and email:</strong> whatever you write to us, including your name, contact details, dates and guest count.</li>
            </ul>
            <p>Please don’t put payment card numbers, Social Security numbers or health details in our forms. We never ask for them there.</p>
            <p>
              <strong>What your browser sends on its own.</strong> Like any website, our hosting provider receives your IP address, browser type and the
              pages you request, and keeps them in short-lived server logs for security and to keep the site running. We don’t use them to build a profile of you.
            </p>
            <p>
              <strong>Cookies.</strong> The public site sets no advertising or analytics cookies. The only cookie we set is a sign-in cookie for staff using our
              internal tools. The Wall keeps a copy of what you sent in your own browser, so you can see it again on that device.
            </p>
          </div>

          <div>
            <h2 className="display-s">How we use it</h2>
            <p>
              To answer you, plan your event, consider your application, book a band, and add stories to The Wall. If you send us a story for The Wall, we may use
              it, without your contact details, in captions on the site or in the restaurant. We use your contact details to reply to you, not to put you on a
              marketing list. You join our email list only if you sign up for it.
            </p>
          </div>

          <div>
            <h2 className="display-s">Who else sees it</h2>
            <p>We don’t sell or rent personal information, and we don’t share it for cross-site advertising. It goes to these places only:</p>
            <ul>
              <li><strong>Our staff,</strong> who need it to answer you. Resumes and applications are visible only to managers signed in to our internal tools.</li>
              <li><strong>Our service providers,</strong> who host and run the site for us under their own security terms: Vercel (hosting), Supabase (the database where form answers are stored) and Google Workspace (our email).</li>
              <li><strong>When the law requires it,</strong> or to protect our guests, staff or property.</li>
            </ul>
            <p>
              Some things happen on other companies’ sites, under their own privacy policies: booking a room (BookingCenter), reserving a table (OpenTable), rewards
              and gift cards (Toast), and the links to Instagram and Facebook. The river cam is streamed by HDOnTap, whose player may set its own cookies.
            </p>
          </div>

          <div>
            <h2 className="display-s">How long we keep it</h2>
            <p>
              Job applications and resumes: four years, because California law requires employers to keep them that long. Band requests and event inquiries:
              until they’re no longer useful, usually within two years. Stories for The Wall: as long as they’re part of the history, unless you ask us to remove them.
            </p>
          </div>

          <div>
            <h2 className="display-s">Your choices</h2>
            <p>
              You can ask to see what we have about you, to correct it, or to delete it (unless the law says we have to keep it, like job applications). Email{' '}
              <a className="text-link" href={`mailto:${mail}`}>{mail}</a> or call <a className="text-link" href={`tel:${business.phoneE164}`}>{business.phone}</a>.
              We’ll answer within 45 days.
            </p>
            <p>
              <strong>California residents.</strong> We don’t share personal information with other businesses for their own marketing, so there’s nothing to opt out
              of under California’s “Shine the Light” law. Since we don’t sell or share personal information, Global Privacy Control signals don’t change anything here.
            </p>
            <p>
              <strong>Do Not Track.</strong> We don’t track visitors across other websites, so a browser’s Do Not Track setting doesn’t change what this site does.
            </p>
          </div>

          <div>
            <h2 className="display-s">Children</h2>
            <p>This site isn’t meant for children under 13, and we don’t knowingly collect their information. If you think a child has sent us something, tell us and we’ll delete it.</p>
          </div>

          <div>
            <h2 className="display-s">Keeping it safe</h2>
            <p>
              Everything travels over encrypted connections, form answers sit in a database that only our website and signed-in managers can reach, and resumes
              download only for staff. No system is perfect, but we take reasonable care.
            </p>
          </div>

          <div>
            <h2 className="display-s">Changes</h2>
            <p>If this policy changes, we’ll post the new version here with a new effective date at the top. If a change matters, we’ll say so on the site first.</p>
          </div>

          <div>
            <h2 className="display-s">Questions</h2>
            <p>
              {business.name}, {fullAddress}. <a className="text-link" href={`mailto:${mail}`}>{mail}</a>, {business.phone}. Or come by and ask at the{' '}
              <Link className="text-link" href="/visit">front desk</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
