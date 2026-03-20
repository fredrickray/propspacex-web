"use client";

import { useRouter } from "next/navigation";
import { usePropertyCreation } from "../context/PropertyCreationContext";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Circle,
  FileBadge,
  FileCheck2,
  FileText,
  Landmark,
  Upload,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";

const progressTiers = ["Bronze", "Silver", "Gold", "Platinum"];

const essentialDocuments = [
  {
    title: "Title Deed / C of O",
    helper: "Primary proof of ownership for the property.",
    fileName: "title_deed_scan_v2.pdf",
    status: "Verified",
    tone: "text-emerald-600",
    border: "border-primary",
    icon: FileText,
  },
  {
    title: "Government-Issued ID",
    helper: "Valid passport or national ID card.",
    fileName: "passport_front.jpg",
    status: "Under Review",
    tone: "text-amber-600",
    border: "border-emerald-500",
    icon: FileBadge,
  },
];

const optionalDocuments = [
  {
    title: "Utility Bill",
    helper: "Proof of address not older than 3 months.",
    icon: FileText,
  },
  {
    title: "Property Tax Receipt",
    helper: "Most recent annual tax payment receipt.",
    icon: Landmark,
  },
  {
    title: "Survey Plan",
    helper: "Official land survey outlining boundaries.",
    icon: FileCheck2,
  },
  {
    title: "Gov. Registry Verification",
    helper: "Automatic registry validation in progress.",
    icon: BadgeCheck,
    auto: true,
  },
];

const trustItems = [
  { label: "Title Deed", score: "+20", done: true },
  { label: "Government ID", score: "+15", done: false },
  { label: "Utility Bill", score: "+10", done: false },
  { label: "Property Tax", score: "+15", done: false },
  { label: "Survey Plan", score: "+10", done: false },
  { label: "Gov. Registry", score: "+15", done: false },
  { label: "Blockchain", score: "+15", done: true },
];

const walletOptions = [
  { label: "MetaMask", active: false },
  { label: "WalletConnect", active: true },
  { label: "Coinbase", active: false },
];

const AddPropertyVerificationPage = () => {
  const router = useRouter();
  const { property, setProperty } = usePropertyCreation();

  // Example: manage deedDocument and ID upload (expand as needed)
  const [deedDocument, setDeedDocument] = useState<File | undefined>(
    property.deedDocument,
  );
  const [idDocument, setIdDocument] = useState<File | undefined>(
    property.inspectionReport,
  );

  // Example: handle file upload (expand for all docs as needed)
  const handleDeedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDeedDocument(file);
      setProperty({ deedDocument: file });
    }
  };
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
      setProperty({ inspectionReport: file });
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <AddPropertyStepHeader
        title="Property Verification Page"
        description="Increase your property's trust score to unlock higher visibility and premium badges. Verified properties receive more inquiries."
        step={6}
        totalSteps={6}
        stepLabel="Verification"
        completionLabel="Final Step"
      />

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Progress</span>
            <span className="text-primary normal-case tracking-normal">
              2/7 verifications complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[35%] rounded-full bg-primary" />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            {progressTiers.map((tier, index) => (
              <div key={tier} className="space-y-2">
                <div
                  className={`mx-auto size-9 rounded-full border flex items-center justify-center ${
                    index === 0
                      ? "border-orange-400 text-orange-500 bg-orange-50"
                      : "border-border text-muted-foreground bg-muted/40"
                  }`}
                >
                  <BadgeCheck className="size-4" />
                </div>
                <p
                  className={`text-xs ${
                    index === 0
                      ? "text-orange-500 font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {tier}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-5">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Essential Documents</h2>
              <Badge variant="outline" className="text-[10px] uppercase">
                Required
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Title Deed Upload */}
              <Card className="border-primary">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-md bg-muted flex items-center justify-center text-primary">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          Title Deed / C of O
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Primary proof of ownership for the property.
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-emerald-600">
                      {deedDocument ? "Uploaded" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary underline underline-offset-2">
                      {deedDocument ? deedDocument.name : "No file uploaded"}
                    </span>
                    <label className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={handleDeedUpload}
                      />
                      {deedDocument ? "Replace" : "Upload"}
                    </label>
                  </div>
                </CardContent>
              </Card>
              {/* Government ID Upload */}
              <Card className="border-emerald-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-md bg-muted flex items-center justify-center text-primary">
                        <FileBadge className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          Government-Issued ID
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Valid passport or national ID card.
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-amber-600">
                      {idDocument ? "Uploaded" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary underline underline-offset-2">
                      {idDocument ? idDocument.name : "No file uploaded"}
                    </span>
                    <label className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={handleIdUpload}
                      />
                      {idDocument ? "Replace" : "Upload"}
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                Additional Verification Documents
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase">
                Optional
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optionalDocuments.map((doc) => (
                <Card key={doc.title}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <doc.icon className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{doc.title}</p>
                          {doc.auto ? (
                            <Badge variant="secondary" className="text-[10px]">
                              AUTO
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {doc.helper}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2"
                      disabled={Boolean(doc.auto)}
                    >
                      <Upload className="size-4" />
                      {doc.auto
                        ? "Verification in progress..."
                        : "Upload Document"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-0 bg-slate-950 text-white shadow-lg">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    Blockchain Verification
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Mint your property deed as an NFT on the blockchain to
                    create an immutable record of ownership.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Circle className="size-2 fill-emerald-400 text-emerald-400" />
                    Permanent Record
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="size-2 fill-emerald-400 text-emerald-400" />
                    Instantly Verifiable
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="size-2 fill-emerald-400 text-emerald-400" />
                    Fraud Prevention
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="size-2 fill-emerald-400 text-emerald-400" />
                    Global Trust
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Connect Wallet
                </p>
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.label}
                    type="button"
                    className={`w-full rounded-lg border px-3 py-3 text-left flex items-center justify-between ${
                      wallet.active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 bg-slate-900 text-white"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <Wallet className="size-4" />
                      {wallet.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide">
                      {wallet.active ? "Connected" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">Trust Score</p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    35
                    <span className="text-base text-muted-foreground">
                      /100
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete items to reach 100 points.
                  </p>
                </div>
                <div className="size-10 rounded-full border border-border flex items-center justify-center text-xs font-semibold">
                  x5
                </div>
              </div>

              <div className="space-y-3">
                {trustItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`size-2 ${
                          item.done
                            ? "fill-emerald-500 text-emerald-500"
                            : "fill-muted text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          item.done
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={
                        item.done
                          ? "text-emerald-600 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground px-1">
            <p className="font-semibold text-foreground mb-1">Need Help?</p>
            <p>Our support team can help verify your documents manually.</p>
            <button type="button" className="text-primary font-medium mt-2">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/agent/add-property/media")}
        >
          <ArrowLeft className="size-4" /> Back to Media
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline">Save as Draft</Button>
          <Button
            onClick={() => {
              setProperty({ deedDocument, inspectionReport: idDocument });
              router.push("/agent/add-property/review");
            }}
          >
            Continue to Review & Publish
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 flex items-center gap-2">
        <AlertCircle className="size-4" />
        Verification proof helps establish the existence, authenticity, and
        legal validity of the property before publication.
      </div>
    </div>
  );
};

export default AddPropertyVerificationPage;
