"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Film, 
  Tv, 
  Search, 
  Database, 
  Activity, 
  Users, 
  BarChart3,
  Cog,
  Scan,
  PlayCircle,
  HardDrive,
  Shield,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";
import { SignInButton } from "@clerk/nextjs";

interface AdminFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  status: "active" | "beta" | "coming-soon";
  category: "media" | "system" | "users";
}

const adminFeatures: AdminFeature[] = [
  {
    id: "transcoder",
    title: "Transcoder Manager",
    description: "Manage video transcoding status for movies and TV episodes. Monitor encoding progress and update transcode statuses.",
    icon: PlayCircle,
    href: "/admin/transcoder",
    status: "active",
    category: "media"
  },
  {
    id: "scanner",
    title: "Media Scanner",
    description: "Scan media folders, resolve conflicts, and manage media library indexing. Add new folders and handle duplicate detection.",
    icon: Scan,
    href: "/admin/scanner",
    status: "active",
    category: "media"
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "View detailed analytics about media consumption, user activity, and system performance metrics.",
    icon: BarChart3,
    href: "/admin/analytics",
    status: "coming-soon",
    category: "system"
  },
  {
    id: "users",
    title: "User Management",
    description: "Manage user accounts, permissions, and access controls. View user activity and manage subscriptions.",
    icon: Users,
    href: "/admin/users",
    status: "coming-soon",
    category: "users"
  },
  {
    id: "storage",
    title: "Storage Manager",
    description: "Monitor disk usage, manage storage locations, and optimize media file organization across drives.",
    icon: HardDrive,
    href: "/admin/storage",
    status: "beta",
    category: "system"
  },
  {
    id: "security",
    title: "Security Center",
    description: "Configure security settings, manage API keys, and monitor system access logs and authentication.",
    icon: Shield,
    href: "/admin/security",
    status: "coming-soon",
    category: "system"
  }
];

function StatusBadge({ status }: { status: AdminFeature["status"] }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Active
        </Badge>
      );
    case "beta":
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
          Beta
        </Badge>
      );
    case "coming-soon":
      return (
        <Badge variant="outline" className="border-gray-600 text-gray-400">
          Coming Soon
        </Badge>
      );
  }
}

function CategoryIcon({ category }: { category: AdminFeature["category"] }) {
  switch (category) {
    case "media":
      return <Film className="w-4 h-4 text-red-400" />;
    case "system":
      return <Cog className="w-4 h-4 text-blue-400" />;
    case "users":
      return <Users className="w-4 h-4 text-green-400" />;
  }
}

function AdminFeatureCard({ feature }: { feature: AdminFeature }) {
  const Icon = feature.icon;
  const isDisabled = feature.status === "coming-soon";

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isDisabled) {
      return (
        <Card className="bg-gray-900/50 border-gray-800 opacity-60 cursor-not-allowed">
          {children}
        </Card>
      );
    }

    return (
      <Link href={feature.href}>
        <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/50 cursor-pointer group">
          {children}
        </Card>
      </Link>
    );
  };

  return (
    <CardWrapper>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Icon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <CategoryIcon category={feature.category} />
                <span className="text-sm text-gray-400 capitalize">{feature.category}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={feature.status} />
            {!isDisabled && (
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 text-sm leading-relaxed">
          {feature.description}
        </p>
      </CardContent>
    </CardWrapper>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-white">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">
              You need to be signed in to access the admin dashboard.
            </p>
            <SignInButton mode="modal">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Sign In
              </Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">
              You don't have admin privileges to access this dashboard.
            </p>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mediaFeatures = adminFeatures.filter(f => f.category === "media");
  const systemFeatures = adminFeatures.filter(f => f.category === "system");
  const userFeatures = adminFeatures.filter(f => f.category === "users");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-600/20 rounded-lg">
              <Settings className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Manage your Samflix instance</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
            <CardContent className="p-6 text-center">
              <Film className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Media</div>
              <div className="text-sm text-gray-400">Management</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Cog className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">System</div>
              <div className="text-sm text-gray-400">Configuration</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Users</div>
              <div className="text-sm text-gray-400">& Access</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Active</div>
              <div className="text-sm text-gray-400">Services</div>
            </CardContent>
          </Card>
        </div>

        {/* Media Management */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Film className="w-6 h-6 text-red-400" />
            Media Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaFeatures.map((feature) => (
              <AdminFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </section>

        {/* System Management */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Cog className="w-6 h-6 text-blue-400" />
            System Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemFeatures.map((feature) => (
              <AdminFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </section>

        {/* User Management */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            User Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userFeatures.map((feature) => (
              <AdminFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
