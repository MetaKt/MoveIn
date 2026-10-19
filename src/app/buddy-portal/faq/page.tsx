import { Card, PageHeader } from "@/components/ui";

const FAQ = [
  ["How many students will I look after?", "Usually 2–4 per semester. You can tell the MoveIn team if you want more or fewer."],
  ["Do I get paid?", "MoveIn will confirm buddy rewards before each semester. (Placeholder: the MoveIn team should fill this in.)"],
  ["A student asks about a contract clause. What do I do?", "Don't advise on it. Ask them to tap “Request help” on their booking page; the MoveIn contract team will handle it."],
  ["What if I can't make it on arrival day?", "Tell the MoveIn team on WhatsApp as early as possible so we can arrange another buddy."],
  ["Can I keep in touch after they settle in?", "Yes, please! Join MoveIn events and keep the friendship going."],
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="FAQ" />
      <div className="space-y-3">
        {FAQ.map(([q, a]) => (
          <Card key={q} className="p-0">
            <details className="group p-5">
              <summary className="cursor-pointer list-none font-semibold">{q}</summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}
