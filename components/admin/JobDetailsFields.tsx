"use client";

import type { JobDetails } from "@/lib/jobs";
import { Field, Input } from "@/components/admin/ui";

export const emptyDetails: JobDetails = {
  name: "",
  phone: "",
  email: "",
  mailingAddress: "",
  jobAddress: "",
  sqft: "",
};

export default function JobDetailsFields({
  value,
  onChange,
  disabled,
}: {
  value: JobDetails;
  onChange: (next: JobDetails) => void;
  disabled?: boolean;
}) {
  const set = (key: keyof JobDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" required>
        <Input value={value.name} onChange={set("name")} disabled={disabled} autoComplete="off" required />
      </Field>
      <Field label="Phone">
        <Input type="tel" value={value.phone} onChange={set("phone")} disabled={disabled} autoComplete="off" />
      </Field>
      <Field label="Email">
        <Input type="email" value={value.email} onChange={set("email")} disabled={disabled} autoComplete="off" />
      </Field>
      <Field label="Sq Ft">
        <Input inputMode="decimal" value={value.sqft} onChange={set("sqft")} disabled={disabled} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Job Address" required>
          <Input value={value.jobAddress} onChange={set("jobAddress")} disabled={disabled} autoComplete="off" required />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Mailing Address" hint="Leave blank if it's the same as the job address.">
          <Input value={value.mailingAddress} onChange={set("mailingAddress")} disabled={disabled} autoComplete="off" />
        </Field>
      </div>
    </div>
  );
}
