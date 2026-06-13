"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Building, Shield, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "Dr. Priya Sharma",
    email: "priya.sharma@dps.edu.in",
    role: "teacher",
  });
  const [institution, setInstitution] = useState({
    name: "Delhi Public School",
    branch: "Dwarka, New Delhi",
    board: "cbse",
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  const handleInstitutionSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Institution settings saved!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, school details, and platform preferences."
      />

      <Tabs defaultValue="profile" className="w-full">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-px">
          <TabsList className="bg-transparent flex gap-6 p-0 h-auto">
            <TabsTrigger
              value="profile"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary-600 rounded-none px-1 pb-4 pt-1 font-semibold text-neutral-500 hover:text-neutral-900 data-[state=active]:text-primary-600 dark:text-neutral-400 dark:hover:text-white dark:data-[state=active]:text-primary-400"
            >
              <User className="h-4 w-4 mr-2 inline" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="institution"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary-600 rounded-none px-1 pb-4 pt-1 font-semibold text-neutral-500 hover:text-neutral-900 data-[state=active]:text-primary-600 dark:text-neutral-400 dark:hover:text-white dark:data-[state=active]:text-primary-400"
            >
              <Building className="h-4 w-4 mr-2 inline" />
              Institution
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary-600 rounded-none px-1 pb-4 pt-1 font-semibold text-neutral-500 hover:text-neutral-900 data-[state=active]:text-primary-600 dark:text-neutral-400 dark:hover:text-white dark:data-[state=active]:text-primary-400"
            >
              <Shield className="h-4 w-4 mr-2 inline" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="profile">
            <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={profile.role}
                    onValueChange={(val) => setProfile({ ...profile, role: val })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher / Evaluator</SelectItem>
                      <SelectItem value="admin">Institution Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="btn-primary h-10">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="institution">
            <form onSubmit={handleInstitutionSave} className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schoolName">Institution Name</Label>
                  <Input
                    id="schoolName"
                    value={institution.name}
                    onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="branch">Branch / Campus</Label>
                  <Input
                    id="branch"
                    value={institution.branch}
                    onChange={(e) => setInstitution({ ...institution, branch: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="board">Affiliation Board</Label>
                  <Select
                    value={institution.board}
                    onValueChange={(val) => setInstitution({ ...institution, board: val })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cbse">CBSE (Central Board of Secondary Education)</SelectItem>
                      <SelectItem value="icse">ICSE (Indian Certificate of Secondary Education)</SelectItem>
                      <SelectItem value="state">State Board</SelectItem>
                      <SelectItem value="university">University Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="btn-primary h-10">
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Update your account password.
                </p>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="currPass">Current Password</Label>
                    <Input id="currPass" type="password" placeholder="••••••••" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type="password" placeholder="••••••••" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="confPass">Confirm New Password</Label>
                    <Input id="confPass" type="password" placeholder="••••••••" className="mt-1" />
                  </div>
                </div>
                <div className="mt-4 pt-2">
                  <Button
                    onClick={() => toast.success("Password changed successfully!")}
                    className="btn-primary h-10"
                  >
                    Update Password
                  </Button>
                </div>
              </div>

              <Separator className="my-6 border-neutral-200 dark:border-neutral-800" />

              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Once you delete your account or organization, there is no going back.
                </p>
                <div className="mt-4">
                  <Button
                    variant="destructive"
                    onClick={() => toast.error("Account deletion requires confirmation in live environment.")}
                    className="h-10 font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/20 dark:text-red-400"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
