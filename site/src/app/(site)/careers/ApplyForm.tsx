'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { DEPARTMENTS } from '@/lib/events/types';
import { apply, type ApplyState } from './actions';
import { CERTS, DAYS, SEASONS, SHIFTS } from './options';

// The Careers application: who you are, the job, when you can work, what you're certified in, your last
// two jobs (or a resume), three references and a bit about you. Built from common restaurant applications
// and kept inside California's rules (see actions.ts): nothing about convictions, past pay or age beyond
// what the job needs.

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending}>
      {pending ? 'Sending…' : 'Send my application'}
    </button>
  );
}

function Checks({ name, legend, options, required }: { name: string; legend: string; options: readonly string[]; required?: boolean }) {
  return (
    <fieldset className="room-choice">
      <legend>{legend}{required ? '' : ' (optional)'}</legend>
      <div className="ca-chips">
        {options.map((o) => (
          <label key={o} className="dept-choice ca-chip">
            <input type="checkbox" name={name} value={o} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function YesNo({ name, legend, note }: { name: string; legend: string; note?: string }) {
  return (
    <fieldset className="room-choice">
      <legend>{legend}</legend>
      <div className="ca-chips">
        {['yes', 'no'].map((v) => (
          <label key={v} className="dept-choice ca-chip">
            <input type="radio" name={name} value={v} />
            <span>{v === 'yes' ? 'Yes' : 'No'}</span>
          </label>
        ))}
      </div>
      {note && <p className="planner__note">{note}</p>}
    </fieldset>
  );
}

export function ApplyForm() {
  const [state, action] = useFormState<ApplyState, FormData>(apply, null);
  if (state?.ok) {
    return (
      <div className="planner ca-form" role="status">
        <h3 className="panel__title">Thank <em>you.</em></h3>
        <p className="planner__note ca-form__done">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="planner ca-form" aria-label="Apply to work at River Ranch">
      <h3 className="panel__title">Apply <em>now.</em></h3>
      <p className="planner__note">About ten minutes. Got a resume? Attach it and skip the job history.</p>

      <div className="ca-block">
        <p className="ca-sec">You</p>
        <div className="ca-block__body">
          <label className="field" htmlFor="ap-name">
            Your name
            <input id="ap-name" name="name" type="text" autoComplete="name" required maxLength={120} />
          </label>
          <div className="planner__grid">
            <label className="field" htmlFor="ap-email">
              Email
              <input id="ap-email" name="email" type="email" autoComplete="email" maxLength={160} />
            </label>
            <label className="field" htmlFor="ap-phone">
              Phone
              <input id="ap-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
            </label>
          </div>
          <label className="field" htmlFor="ap-town">
            Where do you live now? (optional)
            <input id="ap-town" name="town" type="text" autoComplete="address-level2" maxLength={80} placeholder="Tahoe City, Truckee, moving here…" />
          </label>
        </div>
      </div>

      <div className="ca-block">
        <p className="ca-sec">The job</p>
        <div className="ca-block__body">
          <fieldset className="room-choice">
            <legend>Which department?</legend>
            <div className="ca-depts">
              {DEPARTMENTS.map((d) => (
                <label key={d} className="dept-choice">
                  <input type="radio" name="department" value={d} required />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field" htmlFor="ap-role">
            Which job? (optional)
            <input id="ap-role" name="role" type="text" maxLength={140} placeholder="Line cook, server, bartender, housekeeping…" />
          </label>
          <Checks name="seasons" legend="Which seasons?" options={SEASONS} required />
          <fieldset className="room-choice">
            <legend>Full or part time?</legend>
            <div className="ca-chips">
              {['Full time', 'Part time', 'Either'].map((h) => (
                <label key={h} className="dept-choice ca-chip">
                  <input type="radio" name="hours" value={h} />
                  <span>{h}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field" htmlFor="ap-start">
            Earliest start date (optional)
            <input id="ap-start" name="start" type="date" />
          </label>
        </div>
      </div>

      <div className="ca-block">
        <p className="ca-sec">When you can work</p>
        <div className="ca-block__body">
          <Checks name="days" legend="Days" options={DAYS} required />
          <Checks name="shifts" legend="Shifts" options={SHIFTS} />
          <YesNo name="holidays" legend="Can you work holidays and weekends?" note="They’re our busiest days." />
        </div>
      </div>

      <div className="ca-block">
        <p className="ca-sec">The basics</p>
        <div className="ca-block__body">
          <YesNo name="over18" legend="Are you 18 or older?" />
          <YesNo name="over21" legend="Are you 21 or older?" note="Only matters for bartending." />
          <YesNo name="authorized" legend="Can you legally work in the U.S.?" />
          <Checks name="certs" legend="Certifications you have now" options={CERTS} />
          <p className="planner__note">None yet? That’s fine. New hires get the food handler card within 30 days and alcohol servers get RBS certified within 60.</p>
        </div>
      </div>

      <div className="ca-block">
        <p className="ca-sec">Your last two jobs</p>
        <div className="ca-block__body">
          <p className="planner__note">Skip this if you attach a resume.</p>
          {[0, 1].map((i) => (
            <div key={i} className="ca-group">
              <div className="planner__grid">
                <label className="field" htmlFor={`ap-job${i}-e`}>
                  Where
                  <input id={`ap-job${i}-e`} name={`job${i}_employer`} type="text" maxLength={120} />
                </label>
                <label className="field" htmlFor={`ap-job${i}-r`}>
                  Your job
                  <input id={`ap-job${i}-r`} name={`job${i}_role`} type="text" maxLength={120} />
                </label>
              </div>
              <label className="field" htmlFor={`ap-job${i}-w`}>
                When
                <input id={`ap-job${i}-w`} name={`job${i}_when`} type="text" maxLength={60} placeholder="2023 to now" />
              </label>
            </div>
          ))}
          <label className="field" htmlFor="ap-resume">
            Resume (optional)
            <input id="ap-resume" name="resume" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,application/pdf,image/*" />
          </label>
          <p className="planner__note">PDF, Word, or a photo of it, up to 4 MB.</p>
        </div>
      </div>

      <div className="ca-block">
        <p className="ca-sec">Three references</p>
        <div className="ca-block__body">
          <p className="planner__note">Recent bosses or coworkers are best. We’ll only call once we’re talking to you.</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="ca-group">
              <label className="field" htmlFor={`ap-ref${i}-n`}>
                Reference {i + 1}: name
                <input id={`ap-ref${i}-n`} name={`ref${i}_name`} type="text" required maxLength={120} />
              </label>
              <div className="planner__grid">
                <label className="field" htmlFor={`ap-ref${i}-r`}>
                  How you know them
                  <input id={`ap-ref${i}-r`} name={`ref${i}_relation`} type="text" maxLength={160} placeholder="My chef at…" />
                </label>
                <label className="field" htmlFor={`ap-ref${i}-c`}>
                  Phone or email
                  <input id={`ap-ref${i}-c`} name={`ref${i}_contact`} type="text" required maxLength={160} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ca-block">
        <p className="ca-sec">A bit about you</p>
        <div className="ca-block__body">
          <label className="field" htmlFor="ap-about">
            Tell us about yourself
            <textarea id="ap-about" name="about" required minLength={20} maxLength={2000} placeholder="What you’re good at, what you like about this work, and what keeps you in the mountains." />
          </label>
          <div className="planner__grid">
            <label className="field" htmlFor="ap-pay">
              Pay you’re hoping for (optional)
              <input id="ap-pay" name="pay" type="text" maxLength={80} />
            </label>
            <label className="field" htmlFor="ap-heard">
              How did you hear about us? (optional)
              <input id="ap-heard" name="heard" type="text" maxLength={120} />
            </label>
          </div>
        </div>
      </div>

      <label className="dept-choice ca-attest">
        <input type="checkbox" name="attest" value="yes" required />
        <span>Everything here is true, and River Ranch may contact my references.</span>
      </label>
      <p className="planner__note">River Ranch is an equal opportunity employer.</p>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      {state && !state.ok && <p className="planner__note ca-form__error" role="alert">{state.message}</p>}
      <Submit />
    </form>
  );
}
