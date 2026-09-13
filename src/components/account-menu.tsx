"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/client";

export function AccountMenu() {
  const { t } = useLanguage();
  const auth = t("auth");
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (email === undefined) {
    return <div className="h-8 w-20" />;
  }

  if (email) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
          <User className="h-3.5 w-3.5" />
          {email}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogOut}>
          <LogOut className="h-3.5 w-3.5" />
          {auth.logOut}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Button variant="ghost" size="sm" render={<Link href="/login" />}>
        {auth.logIn}
      </Button>
      <Button variant="outline" size="sm" render={<Link href="/signup" />}>
        {auth.signUp}
      </Button>
    </div>
  );
}
