import { Link } from 'react-router-dom'
import './LegalPage.css'

/**
 * Terms and Privacy, as plain routed pages rather than modals so they can be
 * linked to, bookmarked, and read by anything that needs to check them.
 *
 * Same operating entity and governing law as the other apps under this
 * account, adapted for what Recipe Box actually does: no children's data, but
 * it does store accounts, saved recipes, and cook progress.
 */

const LAST_UPDATED = 'August 2026'
const ENTITY = 'AI Product Leverage LLC'
const CONTACT = 'aiproductleverage@gmail.com'

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="legal__meta">Last updated: {LAST_UPDATED}.</p>

      <p>
        Recipe Box (&ldquo;the Service&rdquo;) is operated by {ENTITY} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;). By creating an account or using the Service, you agree
        to these Terms of Service. If you do not agree, do not use the Service.
      </p>

      <h2>1. Who may use Recipe Box</h2>
      <p>
        You must be at least 13 years old, and old enough to form a binding contract where you live.
        The Service is not directed at children and we do not knowingly collect information from
        them.
      </p>

      <h2>2. Your account</h2>
      <p>
        You may sign in with an email address and password or with Google. You are responsible for
        keeping your credentials confidential and for activity under your account, and for telling
        us promptly of any unauthorised use.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        Recipe Box is for personal, non-commercial use. You agree not to misuse the Service, attempt
        to access other people&rsquo;s data, disrupt it, scrape it at volume, or use it unlawfully.
      </p>

      <h2>4. Recipes you add</h2>
      <p>
        When you save a recipe from a link, we fetch that page and store the extracted details
        against your account. You are responsible for having the right to save that content, and for
        using it personally rather than republishing it. Recipes remain the work of whoever wrote
        them; we store a copy for your own use and keep a link back to the original.
      </p>

      <h2>5. Your content</h2>
      <p>
        You keep ownership of what you enter. You grant us a limited licence to store and process it
        solely to operate the Service for you. We do not sell your data or use it for advertising.
      </p>

      <h2>6. The recipe catalogue</h2>
      <p>
        The twenty recipes included with Recipe Box are written for this app. The photographs
        accompanying them are third-party works under their own Creative Commons licences and are
        credited in the repository. They are not covered by these Terms and remain subject to their
        own.
      </p>

      <h2>7. Provided &ldquo;as is&rdquo;</h2>
      <p>
        Recipe Box is provided free and &ldquo;as is&rdquo;, without warranties of any kind. We do
        not guarantee it will be uninterrupted, error-free, accurate, or that data will never be
        lost. Cooking times, quantities, and allergen information are not verified by us — use your
        own judgement in the kitchen.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {ENTITY} will not be liable for any indirect,
        incidental, or consequential damages, or loss of data, arising from your use of the Service.
        Our total liability will not exceed the amount you paid us (which, for a free service, is
        zero).
      </p>

      <h2>9. Termination</h2>
      <p>
        You may stop using Recipe Box and delete your account at any time. We may suspend or end
        access if these Terms are breached or if we discontinue the Service.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms. Material changes are shown by the &ldquo;last updated&rdquo; date;
        continued use after a change means you accept it.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Texas, USA, without regard to its
        conflict-of-law rules.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions? Contact {ENTITY} at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalLayout>
  )
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="legal__meta">Last updated: {LAST_UPDATED}.</p>

      <p>
        This Privacy Policy explains how {ENTITY} (&ldquo;we&rdquo;) handles information in Recipe
        Box. No ads, no third-party trackers, and we never sell your data.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Account:</strong> your email address for sign-in and, if you use Google, the basic
        profile Google shares with us (name and profile picture).{' '}
        <strong>Your recipes:</strong> the links you save and the details extracted from them.{' '}
        <strong>Cook progress:</strong> which ingredients you have ticked off, which steps you have
        finished, and the serving size you chose. We ask only for what the Service needs.
      </p>

      <h2>What we do not collect</h2>
      <p>
        No analytics, no advertising identifiers, no third-party trackers, and no payment
        information — the Service is free and has no payment processor.
      </p>

      <h2>How we use information</h2>
      <p>
        Only to provide the Service: signing you in, showing your saved recipes, and keeping your
        cook progress in sync across devices. We do not build advertising profiles.
      </p>

      <h2>When you save a link</h2>
      <p>
        Saving a recipe sends the URL you pasted to our own server function, which fetches that page
        and reads the recipe details from it. The page owner sees a request from our server, not
        from you. We store what was extracted, plus the original link.
      </p>

      <h2>Where it is stored</h2>
      <p>
        With our hosting providers: Supabase for the database and authentication, Vercel for the web
        app, and Google if you choose Google sign-in. Each account&rsquo;s data is isolated by
        row-level security in the database, so no other user can read your recipes or your progress.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your account data until you delete it. Deleting your account removes your profile,
        your saved recipes, and your cook progress.
      </p>

      <h2>Your choices</h2>
      <p>
        You can access, correct, or delete your data at any time from within the app. To request
        deletion of your account, or a copy of your data, contact us at{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will action it.
      </p>

      <h2>Children</h2>
      <p>
        Recipe Box is not intended for children under 13 and we do not knowingly collect their
        information. If you believe a child has given us information, contact us and we will delete
        it.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Policy. Material changes are shown by the &ldquo;last updated&rdquo; date
        above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Contact {ENTITY} at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalLayout>
  )
}

function LegalLayout({ title, children }) {
  return (
    <main className="layout legal">
      <article className="legal__article">
        <h1 className="legal__title">{title}</h1>
        {children}
      </article>
      <p className="legal__back">
        <Link to="/">Back to recipes</Link>
      </p>
    </main>
  )
}
