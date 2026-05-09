"use client";

import { Check, ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DRAFT_KEY,
  INITIAL_DRAFT,
  STEPS,
  validateStep,
  type PostPropertyDraft,
} from "@/lib/post-property";
import { Step1Type } from "@/components/post-property/steps/step-1-type";
import { Step2Location } from "@/components/post-property/steps/step-2-location";
import { Step3Details } from "@/components/post-property/steps/step-3-details";
import { Step4Pricing } from "@/components/post-property/steps/step-4-pricing";
import { Step5Amenities } from "@/components/post-property/steps/step-5-amenities";
import { Step6Photos } from "@/components/post-property/steps/step-6-photos";
import { Step7Description } from "@/components/post-property/steps/step-7-description";
import { Step8Review } from "@/components/post-property/steps/step-8-review";

function loadDraft(): PostPropertyDraft {
  if (typeof window === "undefined") return INITIAL_DRAFT;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...INITIAL_DRAFT, ...JSON.parse(raw) } : INITIAL_DRAFT;
  } catch {
    return INITIAL_DRAFT;
  }
}

export function PostPropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<PostPropertyDraft>(INITIAL_DRAFT);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  // Debounced auto-save
  const save = useCallback((d: PostPropertyDraft) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      setSavedAt(new Date());
    }, 800);
  }, []);

  function onChange(patch: Partial<PostPropertyDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
    setError(null);
  }

  function next() {
    const err = validateStep(step, draft);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, 8));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prev() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const err = validateStep(7, draft);
    if (err) { setError(err); return; }
    if (!agreed) { setError("Please agree to the terms before submitting"); return; }

    setSubmitting(true);
    setError(null);

    const videoMedia = draft.videoUrl
      ? [{ url: draft.videoUrl, type: "VIDEO" as const, order: draft.media.length }]
      : [];

    const payload = {
      priceType: draft.priceType,
      propertyType: draft.propertyType,
      address: draft.address,
      city: draft.city,
      state: draft.state,
      locality: draft.locality,
      pincode: draft.pincode || "000000",
      lat: draft.lat,
      lng: draft.lng,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      area: parseFloat(draft.area) || 0,
      areaUnit: draft.areaUnit,
      floorNo: draft.floorNo ? parseInt(draft.floorNo) : null,
      totalFloors: draft.totalFloors ? parseInt(draft.totalFloors) : null,
      age: draft.age ? parseInt(draft.age) : null,
      facing: draft.facing || null,
      parking: draft.parking,
      furnishing: draft.furnishing,
      price: parseFloat(draft.price) || 0,
      negotiable: draft.negotiable,
      maintenance: draft.maintenance ? parseFloat(draft.maintenance) : null,
      availableFrom: draft.availableFrom || null,
      amenities: draft.amenities,
      media: [
        ...draft.media.map((m, i) => ({ url: m.url, type: m.type, order: i })),
        ...videoMedia,
      ],
      title: draft.title,
      description: draft.description,
    };

    try {
      const res = await fetch("/api/post-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }

      const { id } = await res.json() as { id: string };
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/post-property/success?id=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const currentStep = STEPS[step - 1];
  const isLast = step === 8;

  return (
    <div className="mx-auto max-w-2xl px-4">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s) => (
            <button
              key={s.number}
              type="button"
              onClick={() => {
                const err = validateStep(step, draft);
                if (s.number < step || (!err && s.number === step + 1)) {
                  setStep(s.number);
                } else if (s.number < step) {
                  setStep(s.number);
                }
              }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  s.number < step
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : s.number === step
                      ? "border-emerald-600 bg-background text-emerald-600"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {s.number < step ? <Check className="size-3.5" /> : s.number}
              </div>
              <span className={cn(
                "hidden text-[10px] sm:block transition-colors",
                s.number === step ? "font-semibold text-foreground" : "text-muted-foreground",
              )}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
        {/* Connector line */}
        <div className="relative -mt-5 h-0.5 -z-10">
          <div className="h-full bg-border" />
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-300"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground">{currentStep.desc}</p>
          </div>
          {savedAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="size-3" />
              Saved {savedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 1 && <Step1Type draft={draft} onChange={onChange} />}
        {step === 2 && <Step2Location draft={draft} onChange={onChange} />}
        {step === 3 && <Step3Details draft={draft} onChange={onChange} />}
        {step === 4 && <Step4Pricing draft={draft} onChange={onChange} />}
        {step === 5 && <Step5Amenities draft={draft} onChange={onChange} />}
        {step === 6 && <Step6Photos draft={draft} onChange={onChange} />}
        {step === 7 && <Step7Description draft={draft} onChange={onChange} />}
        {step === 8 && <Step8Review draft={draft} agreed={agreed} onAgreeChange={setAgreed} />}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={prev}
          disabled={step === 1}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        {isLast ? (
          <Button
            type="button"
            onClick={submit}
            disabled={submitting || !agreed}
            className="gap-1.5 bg-emerald-600 px-8 hover:bg-emerald-700"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Publishing…" : "Publish Listing"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={next}
            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Continue
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
