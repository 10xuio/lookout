"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/auth/client";
import { useState } from "react";
import { GoogleIcon } from "@/components/ui/icons";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-lg">
        <CardHeader className="text-center flex flex-col items-center">
          <a
            href="https://lookout.so"
            rel="noopener noreferrer"
            className="flex items-center gap-2 self-center font-medium mb-2"
          >
            <Image
              src="/logo-sq.png"
              alt="Lookout"
              width={100}
              height={100}
              className="rounded-lg size-15"
            />
          </a>
          <CardTitle className="text-xl">Welcome to Lookout!</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleSignIn}
            >
              <GoogleIcon />
              {isLoading ? "Authenticating" : "Login with Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
