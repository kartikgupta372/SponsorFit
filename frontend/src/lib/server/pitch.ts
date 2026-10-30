import "server-only";
import { groqJson, onlyAllowedNumbers } from "./groq";
import { compact, rateFor, type AnalysisRow, type FollowUp, type MatchRow, type ShowRow, type Tone } from "@/lib/model";

/**
 * Pitch writer. Groq drafts the email in the chosen tone using only facts we
 * hand it. If it slips in a number we did not provide, we throw the draft
 * away and use the template, so a pitch never carries a made-up statistic.
 */

export interface PitchDraft {
  subject: string;
  body: string;
  follow_ups: FollowUp[];
  ad_read: string;
}

const pct = (n: number) => Math.round(n * 100);

function facts(show: ShowRow, match: MatchRow, analysis: AnalysisRow) {
  const rate = rateFor(show.audience_size, match.fit);
  const shared = match.demographics?.shared ?? [];
  const themes = "themes" in analysis.profile ? analysis.profile.themes.slice(0, 5) : [];
  return {
    rate,
    shared,
    themes,
    allowed: [
      match.fit, pct(match.parts.affinity), pct(match.parts.demographic), pct(match.parts.taste),
      show.audience_size, compact(show.audience_size).replace(/[KM]/, ""), rate.low, rate.high, 3, 7, 14, 20, 30, 60, 100,
    ],
  };
}

export function templatePitch(show: ShowRow, rawMatch: MatchRow, analysis: AnalysisRow, tone: Tone): PitchDraft {
  // "Supply Co." at the end of a sentence would print "Co.." so drop a trailing dot.
  const match = { ...rawMatch, name: rawMatch.name.replace(/\.$/, "") };
  const { rate, shared, themes } = facts(show, match, analysis);
  const unit = show.platform === "podcast" ? "listeners per episode" : "viewers per video";
  const kind = show.platform === "podcast" ? "podcast" : "YouTube channel";
  const why = shared.length ? shared.slice(0, 2).join(" and ") : themes.slice(0, 2).join(" and ") || "the same things your customers love";
  const reach = `${compact(show.audience_size)} ${unit}`;
  const greet = tone === "Casual" ? "Hi there," : tone === "Bold" ? "Hi," : "Hello,";
  const open =
    tone === "Bold"
      ? `${show.name}'s audience already behaves like ${match.name}'s customers, and I can prove it.`
      : tone === "Casual"
        ? `I run ${show.name}, a ${kind} with ${reach}, and I think our audiences are a natural fit.`
        : `I host ${show.name}, a ${kind} with ${reach}, and I would like to propose a partnership with ${match.name}.`;
  const body = `${greet}

${open}

I ran my audience through Qloo's taste data. ${match.name} scored ${match.fit} out of 100 for fit with my listeners. The short version: they over-index on ${why}, which is exactly where ${match.name} lives.

What I have in mind:
- A host-read mid-roll across 3 episodes
- A dedicated segment where I try ${match.name} on air
- A listener code so you can measure results

Based on my audience size, I'd suggest $${rate.low.toLocaleString("en-US")} to $${rate.high.toLocaleString("en-US")} per episode. I've attached a one-page media kit with the data behind the match.

${tone === "Casual" ? "Up for a quick chat this week?" : tone === "Bold" ? "Can we get 15 minutes on the calendar this week?" : "Would you be open to a short call next week?"}

Best,
${show.name}`;
  return {
    subject:
      tone === "Bold"
        ? `${match.name} x ${show.name}: a ${match.fit}/100 audience match`
        : tone === "Casual"
          ? `${show.name} listeners love what ${match.name} makes`
          : `Partnership proposal: ${show.name} x ${match.name}`,
    body,
    follow_ups: [
      {
        when: "After 3 days",
        subject: `Re: ${show.name} x ${match.name}`,
        body: `Hi again,\n\nJust floating this back up. The media kit shows why ${show.name}'s audience is a strong match for ${match.name}. Happy to adjust the format to suit your plans.\n\nBest,\n${show.name}`,
      },
      {
        when: "After 7 days",
        subject: `Last note: ${show.name} x ${match.name}`,
        body: `Hi,\n\nI'll close the loop here. If the timing isn't right, I'd love to know who handles creator partnerships so I can reach out next quarter.\n\nThanks either way,\n${show.name}`,
      },
    ],
    ad_read: `This episode is brought to you by ${match.name}. If you're into ${why}, you'll get why I like them. Check them out with my code ${show.name.replace(/[^A-Za-z]/g, "").slice(0, 8).toUpperCase() || "SHOW"} and tell them ${show.name} sent you.`,
  };
}

export async function writePitch(show: ShowRow, match: MatchRow, analysis: AnalysisRow, tone: Tone): Promise<PitchDraft & { source: "ai" | "template" }> {
  const fallback = templatePitch(show, match, analysis, tone);
  const { rate, shared, themes, allowed } = facts(show, match, analysis);
  const out = await groqJson<PitchDraft>(
    `You write sponsorship pitch emails for creators. Return JSON {"subject":string,"body":string,"follow_ups":[{"when":"After 3 days","subject":string,"body":string},{"when":"After 7 days","subject":string,"body":string}],"ad_read":string}.
Rules: tone is ${tone}. Body under 190 words, plain text, no markdown, sign off with the show name. Use ONLY the numbers given in the facts, written exactly as given. Never invent statistics, past results or names of people. The ad_read is a 20-second host-read script.`,
    `Facts:
- Show: ${show.name} (${show.platform === "podcast" ? "podcast" : "YouTube channel"})
- Audience: ${show.audience_size} ${show.platform === "podcast" ? "listeners per episode" : "viewers per video"}
- Brand: ${match.name} (${match.category})
- Fit Score from Qloo taste data: ${match.fit} out of 100
- Demographic match: ${pct(match.parts.demographic)}%
- Shared tastes: ${shared.join(", ") || "none listed"}
- Audience themes: ${themes.join(", ")}
- Why it fits: ${match.reasons.join("; ")}
- Suggested rate: $${rate.low} to $${rate.high} per episode
- Proposed package: host-read mid-roll in 3 episodes, an on-air segment, a listener code`,
    { temperature: 0.6, maxTokens: 1400 },
  );
  if (!out?.subject || !out?.body) return { ...fallback, source: "template" };
  const text = [out.subject, out.body, out.ad_read ?? "", ...(out.follow_ups ?? []).map((f) => `${f.subject} ${f.body}`)].join("\n");
  if (!onlyAllowedNumbers(text, allowed)) return { ...fallback, source: "template" };
  return {
    subject: out.subject.slice(0, 200),
    body: out.body.slice(0, 4000),
    follow_ups: (out.follow_ups ?? []).slice(0, 2).map((f, i) => ({ when: f.when || (i ? "After 7 days" : "After 3 days"), subject: f.subject ?? "", body: f.body ?? "" })),
    ad_read: out.ad_read || fallback.ad_read,
    source: "ai",
  };
}
