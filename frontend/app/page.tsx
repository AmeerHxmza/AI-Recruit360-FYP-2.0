"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { Tabs, TabList, TabTrigger, TabContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownHeader,
} from "@/components/ui/dropdown";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus,
  Search,
  Filter,
} from "lucide-react";

export default function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = React.useState("components");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [progressVal, setProgressVal] = React.useState(75);
  const [activeNav, setActiveNav] = React.useState("dashboard");

  return (
    <ApplicationShell activeNavId={activeNav} onNavigate={setActiveNav}>
      {/* Page Header */}
      <PageHeader
        title="Visual Design System & Foundation"
        description="Core design tokens, layout primitives, and component foundations for AI-Recruit360."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Foundation v0.1
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setProgressVal((prev) => (prev >= 100 ? 10 : prev + 15))}
            >
              <Sliders className="h-3.5 w-3.5 mr-1.5" /> Toggle Progress ({progressVal}%)
            </Button>
            <Button variant="ai" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Test Dialog Primitive
            </Button>
          </>
        }
      />

      {/* Main Showcase Tabs */}
      <Tabs defaultValue="components" value={activeTab} onValueChange={setActiveTab}>
        <TabList>
          <TabTrigger value="components">Component Primitives</TabTrigger>
          <TabTrigger value="layouts">Layout Foundations</TabTrigger>
          <TabTrigger value="tokens">Design Tokens</TabTrigger>
        </TabList>

        {/* Tab 1: Component Primitives */}
        <TabContent value="components" className="space-y-8 pt-4">
          {/* Buttons & Badges */}
          <Section title="Buttons & Badges">
            <Card elevated className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider mb-3">
                    Button Variants
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary">Primary Accent</Button>
                    <Button variant="ai">
                      <Sparkles className="h-4 w-4" /> AI Action
                    </Button>
                    <Button variant="secondary">Secondary Surface</Button>
                    <Button variant="outline">Outline Border</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="danger">Danger Action</Button>
                    <Button variant="link">Text Link</Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C212A]">
                  <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider mb-3">
                    Badge Variants
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="default">Default Badge</Badge>
                    <Badge variant="ai">
                      <Sparkles className="h-3 w-3" /> AI Evaluated
                    </Badge>
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" /> Verified Match
                    </Badge>
                    <Badge variant="warning">
                      <AlertCircle className="h-3 w-3" /> Pending Review
                    </Badge>
                    <Badge variant="danger">High Risk</Badge>
                    <Badge variant="outline">Standard Tag</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Form Inputs & Controls */}
          <Section title="Form Inputs & Select Controls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">
                  Text Inputs & Select
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#A7AFBC] mb-1 block">
                      Standard Input
                    </label>
                    <Input placeholder="Enter placeholder text..." />
                  </div>
                  <div>
                    <label className="text-xs text-[#A7AFBC] mb-1 block">
                      Input with Icon
                    </label>
                    <Input
                      placeholder="Search query..."
                      icon={<Search className="h-4 w-4" />}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A7AFBC] mb-1 block">
                      Select Control
                    </label>
                    <Select
                      options={[
                        { value: "opt1", label: "Option 1: High Precision" },
                        { value: "opt2", label: "Option 2: Standard Evaluation" },
                        { value: "opt3", label: "Option 3: Extended Analysis" },
                      ]}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">
                  Textarea & Micro Controls
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#A7AFBC] mb-1 block">
                      Textarea Input
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Enter detailed description or context..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A7AFBC] mb-1 block">
                      Progress Bar ({progressVal}%)
                    </label>
                    <Progress value={progressVal} variant="ai" size="md" />
                  </div>
                </div>
              </Card>
            </div>
          </Section>

          {/* Avatar, Tooltip & Dropdown */}
          <Section title="Avatars, Tooltips & Dropdowns">
            <Card elevated className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">
                    Avatars & Status Indicators
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar fallback="AI" size="lg" status="ai" />
                    <Avatar fallback="US" size="md" status="online" />
                    <Avatar fallback="KB" size="sm" status="busy" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">
                    Tooltips
                  </h4>
                  <div className="flex items-center gap-3">
                    <Tooltip content="AI Confidence Score: 98.4%">
                      <Badge variant="ai" className="cursor-help">
                        Hover Tooltip
                      </Badge>
                    </Tooltip>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">
                    Dropdown Menu
                  </h4>
                  <Dropdown
                    trigger={
                      <Button variant="secondary" size="sm">
                        <MoreVertical className="h-4 w-4 mr-1" /> Menu Actions
                      </Button>
                    }
                  >
                    <DropdownHeader>Action Menu</DropdownHeader>
                    <DropdownItem icon={<Sparkles className="h-3.5 w-3.5 text-[#39D9FF]" />}>
                      Run AI Analysis
                    </DropdownItem>
                    <DropdownItem icon={<Filter className="h-3.5 w-3.5" />}>
                      Apply Filters
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem danger icon={<AlertCircle className="h-3.5 w-3.5" />}>
                      Clear Selection
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            </Card>
          </Section>

          {/* Table Primitive Foundation */}
          <Section title="Table Foundation Primitive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component Primitive</TableHead>
                  <TableHead>Design Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-[#F5F7FA]">
                    ApplicationShell
                  </TableCell>
                  <TableCell>Main platform wrapper with sidebar and topbar</TableCell>
                  <TableCell>
                    <Badge variant="success">Ready</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-[#F5F7FA]">
                    Button & Form Primitives
                  </TableCell>
                  <TableCell>Accessible inputs, select, textarea, buttons</TableCell>
                  <TableCell>
                    <Badge variant="ai">Verified</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-[#F5F7FA]">
                    Dark Token Palette
                  </TableCell>
                  <TableCell>Strict dark mode tokens from #08090B to #39D9FF</TableCell>
                  <TableCell>
                    <Badge variant="default">Complete</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Section>
        </TabContent>

        {/* Tab 2: Layout Foundations */}
        <TabContent value="layouts" className="space-y-8 pt-4">
          <Section title="Empty, Loading & Error State Primitives">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card elevated className="p-4">
                <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider mb-3">
                  Empty State Primitive
                </h4>
                <EmptyState
                  title="No Data Available"
                  description="This empty state primitive can be rendered whenever a list or collection is clean."
                  action={
                    <Button variant="outline" size="sm">
                      Create Item
                    </Button>
                  }
                />
              </Card>

              <Card elevated className="p-4">
                <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider mb-3">
                  Loading State Primitive
                </h4>
                <LoadingState variant="ai" label="AI Agent Evaluating..." />
              </Card>

              <Card elevated className="p-4">
                <h4 className="text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider mb-3">
                  Error State Primitive
                </h4>
                <ErrorState
                  title="Failed to Connect"
                  message="API endpoint unreachable. Retry the connection."
                  onRetry={() => alert("Retrying connection...")}
                />
              </Card>
            </div>
          </Section>

          <Section title="Skeleton Loader Primitive">
            <Card className="p-6">
              <LoadingState variant="skeleton" />
            </Card>
          </Section>
        </TabContent>

        {/* Tab 3: Design Tokens */}
        <TabContent value="tokens" className="space-y-8 pt-4">
          <Section title="Color Tokens Palette">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[#242932] p-4 bg-[#08090B]">
                <div className="h-8 rounded bg-[#08090B] border border-[#242932] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Background</span>
                <span className="text-[11px] text-[#A7AFBC]">#08090B</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#0D0F12]">
                <div className="h-8 rounded bg-[#0D0F12] border border-[#242932] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Secondary BG</span>
                <span className="text-[11px] text-[#A7AFBC]">#0D0F12</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#12151A]">
                <div className="h-8 rounded bg-[#12151A] border border-[#242932] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Surface</span>
                <span className="text-[11px] text-[#A7AFBC]">#12151A</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#171B21]">
                <div className="h-8 rounded bg-[#171B21] border border-[#242932] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Elevated</span>
                <span className="text-[11px] text-[#A7AFBC]">#171B21</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#12151A]">
                <div className="h-8 rounded bg-[#39D9FF] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">AI Accent</span>
                <span className="text-[11px] text-[#A7AFBC]">#39D9FF</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#12151A]">
                <div className="h-8 rounded bg-[#63E3FF] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Bright Accent</span>
                <span className="text-[11px] text-[#A7AFBC]">#63E3FF</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#12151A]">
                <div className="h-8 rounded bg-[#35D07F] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Success</span>
                <span className="text-[11px] text-[#A7AFBC]">#35D07F</span>
              </div>
              <div className="rounded-lg border border-[#242932] p-4 bg-[#12151A]">
                <div className="h-8 rounded bg-[#FF5C67] mb-2" />
                <span className="text-xs font-bold text-[#F5F7FA] block">Danger</span>
                <span className="text-[11px] text-[#A7AFBC]">#FF5C67</span>
              </div>
            </div>
          </Section>
        </TabContent>
      </Tabs>

      {/* Dialog Primitive Test */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Primitive Dialog Overlay"
        description="Accessible modal dialog primitive matching AI-Recruit360 dark styling."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="ai" size="sm" onClick={() => setIsDialogOpen(false)}>
              Confirm Action
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#A7AFBC]">
            This dialog handles keybindings (Escape key close), backdrop backdrop blur,
            focus trap containment, and accessible contrast.
          </p>
          <Input placeholder="Sample modal text field..." />
        </div>
      </Dialog>
    </ApplicationShell>
  );
}
