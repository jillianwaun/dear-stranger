// ───────────────────────────────────────────────────────────────
//  YOUR MODERATION CRITERIA — edit this file in plain English.
//  Claude reads these exactly as written for every submission.
//  Letters and reader notes follow the same rules.
// ───────────────────────────────────────────────────────────────

const SHARED_RULES = `
PUBLISH when ALL of these are true:
- It is happy, hopeful, kind, grateful, encouraging, or shares a small joy.
  Sweet, funny, tender, and quietly proud are all welcome.
- It is written in good faith to a stranger.
- It keeps private people anonymous. First names only: a first name alone, a nickname,
  or "my mom" / "my neighbor" is fine. No last names, addresses, workplaces, schools,
  towns small enough to identify someone, or social handles.
- It contains no hate, harassment, sexual content, graphic violence, or anything cruel.
- It is not an ad, a promotion, fundraising, or a pitch for a product, account, or service.

Mild swearing is fine when it isn't aimed at anyone ("best damn day ever", "holy crap, I did it").
Do not decline or hold a submission for mild swearing alone.
Slurs, sexual language, and swearing directed at a person are never fine.

DECLINE when ANY of these are true:
- It is hateful, sexual, cruel, threatening, or mocks someone.
- It is spam, an ad, gibberish, or a test.
- It is clearly not happy or kind at all (a rant, a complaint, a political argument, sarcasm at someone's expense).
- It exposes a private person's identity (a full name, or details that would let someone find them).

HOLD for human review when it is genuinely unclear, for example:
- Bittersweet content (grief, illness, a breakup) whose overall tone may or may not land as hopeful.
- Any mention of self-harm, suicide, abuse, or a crisis, even in a recovery story. Always hold these.
- A detail that might identify someone, but you are not sure.
- Celebrities, brands, or politics mentioned in passing.
`;

export const STORY_CRITERIA = `
These are anonymous letters to strangers, each sharing a happy story.
${SHARED_RULES}`;

export const COMMENT_CRITERIA = `
These are short notes readers leave under someone's letter. Judge them by the same rules as letters.
A note does not need to tell its own story: a kind, encouraging, relatable, or warmly funny reply to the letter counts as publishable.
${SHARED_RULES}`;
