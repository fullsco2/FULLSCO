'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, LogOut, Settings, User, LogIn } from 'lucide-react';

export function UserMenu() {
  const { user, isLoading, logoutMutation } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutMutation.mutateAsync();
  };

  // إذا كان يتم تحميل حالة المستخدم
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-9 w-9 rounded-full p-0">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  // إذا لم يكن المستخدم مسجل الدخول
  if (!user) {
    return (
      <Button variant="default" size="sm" onClick={() => router.push('/auth')}>
        <LogIn className="ml-2 h-4 w-4" />
        تسجيل الدخول
      </Button>
    );
  }

  // إذا كان المستخدم مسجل الدخول
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={5} className="w-56">
        <div className="flex items-center p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div className="mr-2 flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{user.name || user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              لوحة التحكم
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            الملف الشخصي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="ml-2 h-4 w-4" />
            الإعدادات
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="cursor-pointer"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="ml-2 h-4 w-4" />
          )}
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
