"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabList, TabTrigger, TabContent } from "@/components/ui/tabs";
import { Sparkles, User, Settings, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [matchThreshold, setMatchThreshold] = React.useState(85);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings updated successfully (UI Mock).");
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Settings"]}>
      <PageHeader
        title="Platform Settings"
        description="Manage system configuration, recruiter profile, and AI screening parameters."
      />

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabList className="mb-6">
          <TabTrigger value="profile">
            <User className="h-3.5 w-3.5 mr-1.5" /> Profile Settings
          </TabTrigger>
          <TabTrigger value="ai-config">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#39D9FF]" /> AI Configuration
          </TabTrigger>
          <TabTrigger value="organization">
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Organization
          </TabTrigger>
          <TabTrigger value="security">
            <Shield className="h-3.5 w-3.5 mr-1.5" /> Security
          </TabTrigger>
        </TabList>

        {/* Tab 1: Profile Settings */}
        <TabContent value="profile">
          <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                Recruiter Profile
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Full Name
                    </label>
                    <Input defaultValue="Ameer Hamza" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Role / Title
                    </label>
                    <Input defaultValue="AI Engineer & Lead Recruiter" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Email Address
                  </label>
                  <Input defaultValue="hxmzadev@gmail.com" type="email" />
                </div>
              </div>
            </Card>

            <Button type="submit" variant="primary" size="md">
              <Save className="h-4 w-4 mr-1.5" /> Save Changes
            </Button>
          </form>
        </TabContent>

        {/* Tab 2: AI Configuration */}
        <TabContent value="ai-config">
          <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-5">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    AI Screening Parameters
                  </h3>
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A7AFBC]">
                  <span>Default AI Match Threshold</span>
                  <span className="font-bold text-[#39D9FF] font-mono">{matchThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={95}
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(Number(e.target.value))}
                  className="w-full accent-[#39D9FF] bg-[#12151A] rounded-md cursor-pointer"
                />
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3 pt-3 border-t border-[#242932]">
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#12151A] border border-[#242932] cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-[#F5F7FA] block">Automated AI Resume Screening</span>
                    <span className="text-[11px] text-[#A7AFBC]">Automatically extract skills and rank incoming applications</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#39D9FF] h-4 w-4" />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#12151A] border border-[#242932] cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-[#F5F7FA] block">Candidate analysis</span>
                    <span className="text-[11px] text-[#A7AFBC]">Analyze resumes and extract insights</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#39D9FF] h-4 w-4" />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#12151A] border border-[#242932] cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-[#F5F7FA] block">AI Interview</span>
                    <span className="text-[11px] text-[#A7AFBC]">Generate real-time follow-up technical questions during interviews</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#39D9FF] h-4 w-4" />
                </label>
              </div>
            </Card>

            <Button type="submit" variant="ai" size="md">
              <Save className="h-4 w-4 mr-1.5" /> Save AI Configuration
            </Button>
          </form>
        </TabContent>

        {/* Tab 3: Organization Settings */}
        <TabContent value="organization">
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Organization Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">Organization Name</label>
                <Input defaultValue="AI-Recruit360 Enterprise" />
              </div>
            </div>
          </Card>
        </TabContent>

        {/* Tab 4: Security */}
        <TabContent value="security">
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Security &amp; API Credentials
            </h3>
            <p className="text-xs text-[#A7AFBC]">
              API keys and authentication credentials are provided via environment environment configurations.
            </p>
          </Card>
        </TabContent>
      </Tabs>
    </ApplicationShell>
  );
}
