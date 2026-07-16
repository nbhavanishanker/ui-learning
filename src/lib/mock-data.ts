// In-memory mock data for the SRE Agent (no backend required).

export type Incident = {
  number: string;
  short_description: string;
  service: string;
  priority: "P1" | "P2" | "P3" | "P4";
  status: "New" | "In Progress" | "On Hold" | "Resolved";
  assignee: string;
  opened_at: string;
  context: string;
  logs: string;
};

export const INCIDENTS: Incident[] = [
  {
    number: "IN0012045",
    short_description: "Checkout API 5xx spike in EU region",
    service: "checkout-api",
    priority: "P1",
    status: "In Progress",
    assignee: "A. Rahman",
    opened_at: "2026-07-15T08:14:00Z",
    context:
      "Sustained 5xx error rate above 8% on checkout-api pods in eu-west-1 since 08:04 UTC. Customer impact reported via support channel.",
    logs: `2026-07-15T08:05:12Z ERROR checkout-api pod=chk-7f4 upstream=payments-gw msg="connection reset by peer"
2026-07-15T08:05:41Z WARN  checkout-api circuit=payments-gw state=OPEN failures=27
2026-07-15T08:06:03Z ERROR checkout-api trace=abc123 status=502 latency_ms=6112`,
  },
  {
    number: "IN0012046",
    short_description: "Auth service latency degradation",
    service: "auth-service",
    priority: "P2",
    status: "New",
    assignee: "Unassigned",
    opened_at: "2026-07-15T07:42:00Z",
    context: "p99 latency on /login climbed from 180ms to 1.4s over 20 minutes.",
    logs: `2026-07-15T07:40:00Z WARN auth-service slow_query="SELECT ... FROM sessions" duration_ms=980
2026-07-15T07:41:22Z WARN auth-service pool=primary waiters=42`,
  },
  {
    number: "IN0012047",
    short_description: "Payments gateway timeouts against Visa network",
    service: "payments-gw",
    priority: "P1",
    status: "In Progress",
    assignee: "M. Chen",
    opened_at: "2026-07-15T06:58:00Z",
    context: "Visa authorisations timing out at 30s. Mastercard unaffected.",
    logs: `2026-07-15T06:59:11Z ERROR payments-gw upstream=visa-net timeout=30000 msg="io timeout"`,
  },
  {
    number: "IN0012048",
    short_description: "Search results empty for logged-in users",
    service: "search-api",
    priority: "P3",
    status: "On Hold",
    assignee: "K. Patel",
    opened_at: "2026-07-14T22:11:00Z",
    context: "Search returns 0 hits for authenticated users after last deploy.",
    logs: `2026-07-14T22:10:44Z INFO search-api index=products docs=0 filter=user_segment`,
  },
  {
    number: "IN0012049",
    short_description: "Notification worker DLQ growing",
    service: "notifications",
    priority: "P4",
    status: "Resolved",
    assignee: "S. Novak",
    opened_at: "2026-07-14T14:02:00Z",
    context: "SQS DLQ increased by 2k messages overnight.",
    logs: `2026-07-14T14:01:33Z ERROR notifications msg="cannot parse template" template_id=welcome_v3`,
  },
];

// Knowledge base: which services have runbook coverage.
export const KB_SERVICES: Record<string, { summary: string; runbook: string }> = {
  "checkout-api": {
    summary: "Handles cart submission, order creation, and payment orchestration.",
    runbook:
      "1. Check payments-gw circuit breaker state\n2. Verify Redis session store health\n3. Roll back last deploy if 5xx > 5% for 10min",
  },
  "auth-service": {
    summary: "OIDC login, session issuance, MFA.",
    runbook:
      "1. Inspect DB connection pool\n2. Check for slow queries on sessions table\n3. Failover to replica if primary saturated",
  },
  "payments-gw": {
    summary: "Routes authorisations to card networks.",
    runbook:
      "1. Confirm outbound VPN to Visa is healthy\n2. Fail over to secondary tunnel\n3. Notify treasury ops if degraded > 15min",
  },
  notifications: {
    summary: "Delivers transactional email, SMS, push notifications.",
    runbook:
      "1. Drain DLQ manually after fixing template\n2. Re-publish failed jobs\n3. Alert if DLQ > 5k",
  },
};

// Change requests in the last 7 days per service.
export const CHANGE_REQUESTS: Record<
  string,
  { number: string; title: string; deployed_at: string; owner: string; risk: "Low" | "Medium" | "High" }[]
> = {
  "checkout-api": [
    {
      number: "CHG0045123",
      title: "Upgrade payments-gw client SDK to 4.2.0",
      deployed_at: "2026-07-14T18:20:00Z",
      owner: "checkout-team",
      risk: "High",
    },
    {
      number: "CHG0045118",
      title: "Enable circuit breaker for payments-gw calls",
      deployed_at: "2026-07-12T10:00:00Z",
      owner: "checkout-team",
      risk: "Medium",
    },
    {
      number: "CHG0045101",
      title: "Rotate Redis credentials in eu-west-1",
      deployed_at: "2026-07-10T09:15:00Z",
      owner: "platform-sec",
      risk: "Low",
    },
  ],
  "auth-service": [
    {
      number: "CHG0045130",
      title: "Add composite index on sessions(user_id, expires_at)",
      deployed_at: "2026-07-14T21:00:00Z",
      owner: "iam-team",
      risk: "Medium",
    },
  ],
  "payments-gw": [
    {
      number: "CHG0045140",
      title: "Update Visa network TLS bundle",
      deployed_at: "2026-07-15T04:30:00Z",
      owner: "payments-team",
      risk: "High",
    },
  ],
  notifications: [
    {
      number: "CHG0045099",
      title: "Introduce welcome_v3 email template",
      deployed_at: "2026-07-13T12:00:00Z",
      owner: "growth-team",
      risk: "Low",
    },
  ],
};

// The seed knowledge base entries returned by the "Read API" as JSON.
export const KB_ENTRIES = [
  {
    service: "checkout-api",
    git_repo: "https://git.internal/checkout/checkout-api",
    config_repo: "https://git.internal/config/checkout-api",
    updated_at: "2026-07-10T09:00:00Z",
    sections: {
      Overview:
        "Checkout API owns cart submission and order creation. Written in Go, deployed to EKS.",
      Dependencies: "payments-gw, inventory-svc, redis-sessions, kafka.orders",
      "Common Failures":
        "Elevated 5xx typically correlates with payments-gw degradation or Redis saturation.",
      Runbook:
        "1. Inspect circuit breaker\n2. Check Redis latency\n3. Roll back latest deploy",
      Contacts: "checkout-team@company · pager: sre-checkout",
    },
  },
  {
    service: "auth-service",
    git_repo: "https://git.internal/iam/auth-service",
    config_repo: "https://git.internal/config/auth-service",
    updated_at: "2026-07-08T11:20:00Z",
    sections: {
      Overview: "OIDC authorisation server. Node.js + PostgreSQL.",
      Dependencies: "postgres-iam, redis-sessions, smtp-relay",
      "Common Failures":
        "Latency regressions from slow queries on sessions or MFA provider outages.",
      Runbook: "1. Check DB pool waiters\n2. Failover to replica\n3. Disable MFA for staff bypass",
      Contacts: "iam-team@company",
    },
  },
];
