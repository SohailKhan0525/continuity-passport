export type EvidenceState = "found" | "missing" | "needs_confirmation";

export type Evidence = {
  key: string;
  label: string;
  state: EvidenceState;
  detail: string;
  files: string[];
};

export type Passport = {
  repo: {
    owner: string;
    name: string;
    branch: string;
    commitSha: string;
    url: string;
    lastPushedAt: string | null;
  };
  scannedAt: string;
  score: number;
  status: "documented" | "partial" | "fragile";
  evidence: Evidence[];
  dependencies: string[];
  inspected: string[];
  warnings: string[];
  manifest: string;
};

type TreeItem = { path: string; type: string; size?: number };

const rules = [
  ["readme","README or operator docs",/(^|\/)(readme|docs|runbook|operations?)(\.|\/|$)/i,"A README or operational documentation path is present."],
  ["environment","Environment variables",/(^|\/)(\.env\.example|\.env\.sample|env\.example|configuration|config)(\.|\/|$)/i,"Environment configuration documentation is present."],
  ["deployment","Deployment configuration",/(^|\/)(vercel\.json|netlify\.toml|fly\.toml|render\.yaml|render\.yml|railway\.json|railway\.toml|dockerfile|docker-compose[^/]*\.ya?ml)$/i,"A deployment or container configuration file is present."],
  ["ci","Release automation",/^\.github\/workflows\/.+\.ya?ml$/i,"A GitHub Actions workflow is present."],
  ["tests","Tests",/(^|\/)(__tests__|tests?|specs?)(\/|\.|$)|\.(test|spec)\.[cm]?[jt]sx?$/i,"Test files or a test directory is present."],
  ["monitoring","Health or monitoring",/(health|status|monitor|sentry|datadog|observability|uptime)/i,"Health or monitoring language appears in repository paths or selected documentation."],
  ["backup","Backup and restore",/(backup|restore|disaster|recovery)/i,"Backup or recovery documentation is present."],
  ["database","Database migrations or schema",/(migration|migrations|schema|prisma|drizzle|supabase|database|db)/i,"Database schema or migration artifacts are present."],
  ["runtime","Runtime and dependency lock",/(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|requirements\.txt|go\.mod|Cargo\.lock|\.nvmrc|\.node-version|runtime\.txt)$/i,"A runtime declaration or dependency lock is present."],
  ["ownership","Ownership and handover",/(codeowners|contributors|maintainers|ownership|handover|onboarding)/i,"Ownership or handover documentation is present."],
  ["architecture","Architecture notes",/(architecture|adr|diagram|system-design|design-doc)/i,"Architecture documentation is present."],
  ["rollback","Rollback or release notes",/(rollback|release|deploy|runbook)/i,"Release or rollback guidance appears in repository paths or selected documentation."],
] as const;

const deps = [
  "supabase","firebase","stripe","clerk","auth0","resend","sendgrid","twilio","sentry",
  "datadog","postgres","mysql","mongodb","redis","aws","gcp","azure","vercel",
  "netlify","cloudflare","docker"
];

async function api<T>(url: string) {
  const r = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (r.status === 403) throw Error("GitHub rate limit reached. Wait a little and try again.");
  if (r.status === 404) throw Error("Repository not found or it is not public.");
  if (!r.ok) throw Error(`GitHub returned HTTP ${r.status} while reading the repository.`);
  return {
    data: await r.json() as T,
    remaining: r.headers.get("x-ratelimit-remaining"),
    limit: r.headers.get("x-ratelimit-limit"),
  };
}

async function rawText(owner: string, repo: string, branch: string, path: string) {
  const url = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${path.split("/").map(encodeURIComponent).join("/")}`;
  const r = await fetch(url, { cache: "no-store" });
  if (r.status === 404) throw Error(`File disappeared while scanning: ${path}`);
  if (!r.ok) throw Error(`Could not read ${path} (HTTP ${r.status}).`);
  return r.text();
}

export function parseGitHubUrl(value: string) {
  const m = value.trim().match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/?#].*)?$/i);
  if (!m) throw Error("Enter a public GitHub repository URL such as https://github.com/owner/repo.");
  return { owner: m[1], name: m[2] };
}

function priority(path: string) {
  const p = path.toLowerCase();
  if (/^(readme|license|security|code_of_conduct|contributing|support)/.test(p)) return 1;
  if (/^\.github\/workflows\//.test(p)) return 2;
  if (/(^|\/)(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|bun\.lockb|requirements\.txt|go\.mod|cargo\.toml|cargo\.lock|pyproject\.toml|poetry\.lock|composer\.json|gemfile|pom\.xml|build\.gradle)/.test(p)) return 3;
  if (/(dockerfile|docker-compose|vercel\.json|netlify\.toml|fly\.toml|render\.|railway\.|\.env\.example|\.env\.sample)/.test(p)) return 4;
  if (/(docs\/|runbook|operations|architecture|adr|deploy|release|rollback|backup|restore|recovery|codeowners|onboarding)/.test(p)) return 5;
  return 9;
}

export async function scanRepository(input: string): Promise<Passport> {
  const { owner, name } = parseGitHubUrl(input);

  const repoResponse = await api<{
    default_branch: string;
    html_url: string;
    pushed_at: string | null;
    private: boolean;
  }>(`https://api.github.com/repos/${owner}/${name}`);
  const repo = repoResponse.data;

  if (repo.private) throw Error("This scanner only accepts public GitHub repositories.");

  const branch = repo.default_branch;
  const refResponse = await api<{ object: { sha: string } }>(
    `https://api.github.com/repos/${owner}/${name}/git/ref/heads/${encodeURIComponent(branch)}`
  );
  const commitSha = refResponse.data.object.sha;

  const treeResponse = await api<{ tree: TreeItem[]; truncated?: boolean }>(
    `https://api.github.com/repos/${owner}/${name}/git/trees/${commitSha}?recursive=1`
  );

  if (treeResponse.data.truncated) {
    throw Error("GitHub returned a truncated repository tree. The scanner stopped rather than pretending it inspected everything.");
  }

  const paths = treeResponse.data.tree.filter((x) => x.type === "blob").map((x) => x.path);
  const selected = paths
    .filter((p) => rules.some((r) => r[2].test(p)) || priority(p) < 9)
    .sort((a, b) => priority(a) - priority(b) || a.length - b.length)
    .slice(0, 80);

  const texts = new Map<string, string>();
  const warnings: string[] = [];
  const batches: string[][] = [];
  for (let i = 0; i < selected.length; i += 12) batches.push(selected.slice(i, i + 12));

  for (const batch of batches) {
    const results = await Promise.all(batch.map(async (path) => {
      try {
        return [path, await rawText(owner, name, branch, path)] as const;
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : `Could not read ${path}.`);
        return null;
      }
    }));
    for (const result of results) if (result) texts.set(result[0], result[1]);
  }

  const selectedText = [...texts.entries()].map(([path, text]) => `FILE: ${path}\n${text}`).join("\n\n").toLowerCase();

  const evidence = rules.map(([key, label, rx, detail]) => {
    const matches = paths.filter((p) => rx.test(p)).slice(0, 8);
    const contentSignal =
      (key === "environment" && /(process\.env|import\.meta\.env|environment variable|env var)/i.test(selectedText)) ||
      (key === "monitoring" && /(healthcheck|health check|sentry|datadog|uptime|observability|monitoring)/i.test(selectedText)) ||
      (key === "backup" && /(backup|restore|disaster recovery|recovery plan)/i.test(selectedText)) ||
      (key === "rollback" && /(rollback|roll back|revert|release procedure|deployment procedure)/i.test(selectedText));

    return {
      key,
      label,
      state: matches.length || contentSignal ? "found" : "missing",
      detail: matches.length || contentSignal ? detail : "No matching repository evidence was found.",
      files: matches,
    };
  }) as Evidence[];

  const dependencies = deps.filter((d) =>
    selectedText.includes(d) ||
    paths.some((p) => p.toLowerCase().includes(d))
  ).sort();

  const found = evidence.filter((e) => e.state === "found").length;
  const critical = ["deployment", "environment", "ownership", "backup"];
  const criticalFound = evidence.filter((e) => critical.includes(e.key) && e.state === "found").length;
  const score = Math.round((found / evidence.length) * 100);
  const status = criticalFound >= 3 && score >= 65 ? "documented" : criticalFound >= 2 ? "partial" : "fragile";

  const remaining = repoResponse.remaining;
  if (remaining && Number(remaining) < 20) warnings.push(`GitHub API rate limit is low: ${remaining} requests remaining in this scan context.`);
  if (texts.size < selected.length) warnings.push(`${selected.length - texts.size} selected files could not be read.`);

  const manifest = `version: 1
repository: ${owner}/${name}
commit: ${commitSha}

ownership:
  primary: confirm
  backup: confirm

production:
  deploy: confirm
  url: confirm

recovery:
  backup: confirm
  restore_tested: confirm
  rollback: confirm

critical_dependencies:
${dependencies.length ? dependencies.map((d) => `  ${d}: confirm`).join("\n") : "  []"}
`;

  return {
    repo: { owner, name, branch, commitSha, url: repo.html_url, lastPushedAt: repo.pushed_at },
    scannedAt: new Date().toISOString(),
    score,
    status,
    evidence,
    dependencies,
    inspected: [...texts.keys()],
    warnings,
    manifest,
  };
}

export function passportMarkdown(p: Passport) {
  return [
    "# Production Continuity Passport",
    "",
    `Repository: ${p.repo.owner}/${p.repo.name}`,
    `Branch: ${p.repo.branch}`,
    `Commit: ${p.repo.commitSha}`,
    `Last pushed: ${p.repo.lastPushedAt ?? "Unknown"}`,
    `Scanned: ${p.scannedAt}`,
    `Continuity score: ${p.score}/100`,
    `Status: ${p.status}`,
    "",
    "## Evidence",
    "",
    ...p.evidence.map((e) => `### ${e.label}\n\nState: ${e.state}\n\n${e.detail}\n\nFiles: ${e.files.join(", ") || "None listed"}\n`),
    "## Critical dependencies",
    "",
    ...(p.dependencies.length ? p.dependencies.map((x) => `- ${x}`) : ["None detected"]),
    "",
    "## Scan warnings",
    "",
    ...(p.warnings.length ? p.warnings.map((x) => `- ${x}`) : ["None"]),
    "",
    "A repository scan is evidence about the codebase, not proof that production is configured correctly.",
  ].join("\n");
}
