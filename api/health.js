/**
 * GET /api/health -> { ok: true }
 *
 * Deliberately trivial. When /api/extract fails, this answers the first
 * question — are serverless functions running at all, or is this one broken —
 * without which you are guessing between a routing problem and a code problem.
 */
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    runtime: process.version,
  })
}
