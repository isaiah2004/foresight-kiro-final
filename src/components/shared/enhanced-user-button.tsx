'use client';

import { UserButton } from '@clerk/nextjs';
import { useUserProfileClient } from '@/hooks/use-user-profile-client';

interface EnhancedUserButtonProps {
  afterSignOutUrl?: string;
  showName?: boolean;
}

export function EnhancedUserButton({ 
  afterSignOutUrl = "/", 
  showName = false 
}: EnhancedUserButtonProps) {
  const { profile } = useUserProfileClient();

  return (
    <div className="flex items-center space-x-3">
      {showName && profile && (
        <div className="text-sm">
          <div className="font-medium">Welcome back!</div>
          <div className="text-muted-foreground">
            Primary: {profile.primaryCurrency}
          </div>
        </div>
      )}
      <UserButton 
        afterSignOutUrl={afterSignOutUrl}
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
            userButtonPopoverCard: "shadow-lg border",
            userButtonPopoverActionButton: "hover:bg-accent",
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Link
            label="Settings"
            labelIcon={<SettingsIcon />}
            href="/settings"
          />
          <UserButton.Action label="manageAccount" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6" />
      <path d="m15.5 3.5-3 3-3-3" />
      <path d="m15.5 20.5-3-3-3 3" />
    </svg>
  );
}