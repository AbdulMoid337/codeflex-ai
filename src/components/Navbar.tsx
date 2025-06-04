"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { DumbbellIcon, HomeIcon, MenuIcon, UserIcon, X, ZapIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Brain } from "lucide-react";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border py-3">
      <div ref={navbarRef} className="container mx-auto flex items-center justify-between flex-col">
        <div className="w-full flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center relative pl-2 gap-1">
            <div className="p-1 bg-primary/15 rounded">
              <ZapIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-extrabold font-mono tracking-tight drop-shadow-lg">
              code<span className="text-primary">flex</span>.ai
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-5">
            {isSignedIn ? (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                >
                  <HomeIcon size={16} />
                  <span>Home</span>
                </Link>

                <Link
                  href="/generate-program"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                >
                  <DumbbellIcon size={16} />
                  <span>Generate</span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                >
                  <UserIcon size={16} />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/scan-food"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Brain size={16} />
                  <span className="font-mono">AI Meal Scanner</span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </Link>
                
                <Button
                  asChild
                  variant="outline"
                  className=" border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                >
                  <Link href="/generate-program ">Get Started</Link>
                </Button>

                <UserButton />
              </>
            ) : (
              <>
                <SignInButton>
                  <Button
                    variant={"outline"}
                    className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                  >
                    Sign In
                  </Button>
                </SignInButton>

                <SignUpButton>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </nav>

          {/* MOBILE CONTROLS */}
          <div className="md:hidden flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                >
                  <Link href="/generate-program">Get Started</Link>
                </Button>
                <UserButton />
                {/* MOBILE HAMBURGER BUTTON */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-foreground hover:text-primary transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </>
            ) : (
              <>
                <div className="relative pr-2 flex gap-2">
                  <SignInButton>
                    <Button
                      variant={"outline"}
                      size="sm"
                      className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                    >
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MOBILE MENU - Only shown when signed in and menu is open */}
        {isSignedIn && mobileMenuOpen && (
          <div className="md:hidden animate-fadeIn w-full">
            <div className="container mx-auto py-4 px-4 bg-background/90 rounded-2xl shadow-xl border border-border">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon size={16} />
                  <span className="font-mono">Home</span>
                </Link>
                <Link
                  href="/generate-program"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DumbbellIcon size={16} />
                  <span className="font-mono">Generate</span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon size={16} />
                  <span className="font-mono">Profile</span>
                </Link>
                <Link
                  href="/scan-food"
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Brain size={16} />
                  <span className="font-mono">AI Meal Scanner</span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;