'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import {
  LogOut,
  Settings,
  User,
  UserPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserMenu() {
  const { user, isLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsOpen(false);
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم تسجيل خروجك بنجاح',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسجيل الخروج',
        variant: 'destructive',
      });
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="w-9 px-0" disabled>
        <span className="h-5 w-5 animate-pulse rounded-full bg-muted"></span>
      </Button>
    );
  }

  // User is logged in
  if (user) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="relative h-9 rounded-full border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-3 shadow-sm transition-all hover:shadow-md hover:from-primary/15 hover:to-primary/10 hover:border-primary/40"
          >
            <span className="font-medium text-primary">{user.name || user.username}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name || user.username}</p>
              {user.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user.role === 'admin' && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <Settings className="ml-2 h-4 w-4" />
                <span>لوحة التحكم</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="ml-2 h-4 w-4" />
              <span>ملفي الشخصي</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="ml-2 h-4 w-4" />
            <span>{logoutMutation.isPending ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // User is not logged in
  return (
    <Button 
      variant="outline" 
      className="items-center gap-2 rounded-full border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm hover:shadow-md hover:from-primary/15 hover:to-primary/10 hover:border-primary/40 transition-all duration-300"
      onClick={() => router.push('/auth')}
    >
      <UserPlus className="h-4 w-4" />
      <span>تسجيل الدخول</span>
    </Button>
  );
}
