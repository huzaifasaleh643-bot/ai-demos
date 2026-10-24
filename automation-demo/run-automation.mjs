/**
 * AUTOMATION DEMO — "Lead follow-up bot"
 * ---------------------------------------------------------------
 * Ye ek REAL automation hai jo abhi tumhare laptop pe chalegi.
 * Trigger : CSV file (leads.csv)
 * Logic   : segment decide karna (rules)
 * Action  : personalised message banana + outbox file + report
 *
 * Chalane ka tareeqa:
 *   cd C:\Users\DELL\ai-demos\automation-demo
 *   node run-automation.mjs
 *
 * Production mein bas 2 cheezein badalti hain:
 *   1) message template ki jagah OpenAI/Claude API call
 *   2) outbox file ki jagah WhatsApp Cloud API / SMTP / CRM API
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

/* ------------------------------------------------------------------
   1. RULES  (yahi "automation ka dimaag" hai — yahan tum apna logic likho)
   ------------------------------------------------------------------ */
const RULES = [
  {
    segment: 'HOT',                       // turant follow-up
    test: l => ['active', 'trial'].includes(l.status) && l.last_contact_days >= 7,
    priority: 1,
    action: 'send_followup',
  },
  {
    segment: 'WINBACK',                   // churned ya bahut purana
    test: l => l.status === 'churned' || l.last_contact_days >= 30,
    priority: 2,
    action: 'send_winback',
  },
  {
    segment: 'NURTURE',                   // abhi chhedo mat
    test: () => true,
    priority: 3,
    action: 'skip',
  },
];

/* ------------------------------------------------------------------
   2. MESSAGE TEMPLATES  (yahan LLM lagana hai production mein)
   ------------------------------------------------------------------ */
const TEMPLATES = {
  HOT: l => `Hi ${l.name.split(' ')[0]}, ${l.plan.toUpperCase()} plan par aapka account active hai. ` +
    `Aapne pichle ${l.last_contact_days} din se login nahi kiya — main aapko 10 minute ka quick walkthrough ` +
    `de sakta hoon jismein naye features dikha doon. Kal shaam free hain?`,

  WINBACK: l => `Hi ${l.name.split(' ')[0]}, kaafi time ho gaya! Aapka ${l.plan} plan ${l.status} hai. ` +
    `Humne tab se pricing aur speed dono improve kiye hain — 20% win-back discount available hai. ` +
    `2 minute baat karein?`,

  NURTURE: () => null,
};

/* ------------------------------------------------------------------
   3. CSV PARSER (dependencies ke bina)
   ------------------------------------------------------------------ */
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).filter(Boolean).map(line => {
    const cells = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      const v = (cells[i] ?? '').trim();
      row[h] = h === 'last_contact_days' ? Number(v) : v;
    });
    return row;
  });
}

const csvEscape = v => `"${String(v).replace(/"/g, '""')}"`;

/* ------------------------------------------------------------------
   4. WORKFLOW ENGINE
   ------------------------------------------------------------------ */
async function run() {
  const t0 = Date.now();
  const log = [];
  const step = (icon, label, detail = '') => {
    const line = `${icon}  ${label}${detail ? '  ·  ' + detail : ''}`;
    console.log(line);
    log.push({ step: label, detail, at: new Date().toISOString() });
  };

  console.log('\n\x1b[36m╭──────────────────────────────────────────────╮');
  console.log('│  LEAD FOLLOW-UP AUTOMATION — run started     │');
  console.log('╰──────────────────────────────────────────────╯\x1b[0m\n');

  // STEP 1 — trigger
  const raw = await readFile(path.join(DIR, 'leads.csv'), 'utf8');
  const leads = parseCsv(raw);
  step('📥', 'trigger: file_read', `leads.csv → ${leads.length} rows`);

  // STEP 2 — validate
  const valid = leads.filter(l => /^\+?\d{10,15}$/.test(l.phone.replace(/[\s-]/g, '')));
  const invalid = leads.length - valid.length;
  step('✅', 'validate: phone_numbers', `${valid.length} valid, ${invalid} rejected`);

  // STEP 3 — segment
  const buckets = { HOT: [], WINBACK: [], NURTURE: [] };
  for (const l of valid) {
    const rule = RULES.find(r => r.test(l));
    buckets[rule.segment].push({ ...l, segment: rule.segment, action: rule.action, priority: rule.priority });
  }
  step('🧠', 'segment: apply_rules',
    `HOT ${buckets.HOT.length} · WINBACK ${buckets.WINBACK.length} · NURTURE ${buckets.NURTURE.length}`);

  // STEP 4 — generate messages (yahan LLM call hoti hai)
  const outbox = [];
  for (const l of [...buckets.HOT, ...buckets.WINBACK]) {
    const body = TEMPLATES[l.segment](l);
    if (!body) continue;
    outbox.push({ ...l, message: body });
  }
  step('✍️', 'generate: personalised_messages', `${outbox.length} messages drafted`);

  // STEP 5 — sort by priority (hot pehle)
  outbox.sort((a, b) => a.priority - b.priority);
  step('🔀', 'order: by_priority', 'HOT before WINBACK');

  // STEP 6 — deliver (simulated)
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  await mkdir(path.join(DIR, 'outbox'), { recursive: true });
  const outPath = path.join(DIR, 'outbox', `messages_${stamp}.csv`);
  const header = 'priority,segment,name,phone,plan,message';
  const rows = outbox.map(o => [o.priority, o.segment, o.name, o.phone, o.plan, o.message].map(csvEscape).join(','));
  await writeFile(outPath, [header, ...rows].join('\n'), 'utf8');
  step('📤', 'action: send_messages', `→ outbox/messages_${stamp}.csv`);

  // STEP 7 — report
  const ms = Date.now() - t0;
  const manualMinutes = outbox.length * 4;             // insaan ~4 min per message
  const report = {
    run_at: new Date().toISOString(),
    duration_ms: ms,
    input_rows: leads.length,
    valid_leads: valid.length,
    segments: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    messages_generated: outbox.length,
    skipped: buckets.NURTURE.length,
    manual_effort_saved_minutes: manualMinutes,
    output_file: outPath,
  };
  await writeFile(path.join(DIR, 'outbox', 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  step('📊', 'report: write_json', 'outbox/report.json', );
  await writeFile(path.join(DIR, 'outbox', 'run-log.json'), JSON.stringify(log, null, 2), 'utf8');

  // SUMMARY
  console.log('\n\x1b[33m──────── RESULT ────────\x1b[0m');
  console.log(`Messages ready : ${outbox.length}`);
  console.log(`Skipped        : ${buckets.NURTURE.length}`);
  console.log(`Manual time    : ~${manualMinutes} min  →  actual: ${ms} ms`);
  console.log(`Saved          : ~${(manualMinutes / 60).toFixed(1)} hours of human work\n`);

  console.log('\x1b[90mSample message:\x1b[0m');
  if (outbox[0]) {
    console.log(`\x1b[36m→ ${outbox[0].name} (${outbox[0].segment})\x1b[0m`);
    console.log(`  ${outbox[0].message}\n`);
  }
}

run().catch(err => { console.error('Run failed:', err); process.exit(1); });
