import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthRedirect } from '@/components/shared/auth-redirect';

export default function Home() {
  return (
    <AuthRedirect>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to Foresight
          </h1>
          <p className="text-center text-lg text-muted-foreground mb-8">
            Your comprehensive financial planning application
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </main>
    </AuthRedirect>
  );
}