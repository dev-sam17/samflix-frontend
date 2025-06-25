"use client";

import React, { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Film, Tv, Grid3X3, Search, Home } from "lucide-react";
import { IconLogin } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "TV Series", icon: Tv },
    { href: "/genres", label: "Genres", icon: Grid3X3 },
  ];

  const adminNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "TV Series", icon: Tv },
    { href: "/genres", label: "Genres", icon: Grid3X3 },
    { href: "/scanner", label: "Scanner", icon: Search },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-10 h-10" />
              ) : (
                <Menu className="w-10 h-10" />
              )}
            </Button>
            {/* Logo */}
            <Link
              href="/"
              className={`text-3xl font-bold text-red-600 flex-shrink-0 ${bebasNeue.className}`}
            >
              SAMFLIX
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 transition-colors ${
                    isActive(item.href) ? "text-red-600" : "hover:text-red-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <SignedOut>
              <SignInButton mode="modal">
                <Button>
                  <IconLogin className="w-4 h-4" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button>
                  <IconLogin className="w-4 h-4" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>
                    <IconLogin className="w-4 h-4" />
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "text-red-600 bg-red-600/10"
                        : "hover:text-red-600 hover:bg-red-600/5"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
