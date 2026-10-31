"use client";

import { Card, PageHeader } from "@/components/ui";
import { msg, useT } from "@/lib/i18n";

const FAQ = [
  [msg("How many students will I look after?"), msg("Usually 2–4 per semester. You can tell the MoveIn team if you want more or fewer.")],
  [msg("Do I get paid?"), msg("MoveIn will confirm buddy rewards before each semester. (Placeholder: the MoveIn team should fill this in.)")],
  [msg("A student asks about a contract clause. What do I do?"), msg("Don't advise on it. Ask them to tap “Request help” on their booking page; the MoveIn contract team will handle it.")],
  [msg("What if I can't make it on arrival day?"), msg("Tell the MoveIn team on WhatsApp as early as possible so we can arrange another buddy.")],
  [msg("Can I keep in touch after they settle in?"), msg("Yes, please! Join MoveIn events and keep the friendship going.")],
];

export default function FaqPage() {
  const t = useT();
  return (
    <div className="max-w-3xl">
      <PageHeader title={t("FAQ")} />
      <div className="space-y-3">
        {FAQ.map(([q, a]) => (
          <Card key={q} className="p-0">
            <details className="group p-5">
              <summary className="cursor-pointer list-none font-semibold">{t(q)}</summary>
              <p className="mt-2 text-sm text-muted">{t(a)}</p>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}
