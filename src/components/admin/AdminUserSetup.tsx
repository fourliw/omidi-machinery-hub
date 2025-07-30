import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminUserSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAdminUser, setHasAdminUser] = useState<boolean | null>(null);
  const [makingAdmin, setMakingAdmin] = useState(false);

  useEffect(() => {
    checkForAdminUser();
  }, []);

  const checkForAdminUser = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        console.error('Error checking for admin user:', error);
        return;
      }

      setHasAdminUser(data && data.length > 0);
    } catch (error) {
      console.error('Error checking for admin user:', error);
    }
  };

  const makeCurrentUserAdmin = async () => {
    if (!user) return;

    setMakingAdmin(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) {
        console.error('Error making user admin:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create admin user. Please try again.',
        });
      } else {
        toast({
          title: 'Success',
          description: 'You are now an admin user. Please refresh the page.',
        });
        setHasAdminUser(true);
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create admin user. Please try again.',
      });
    } finally {
      setMakingAdmin(false);
    }
  };

  if (hasAdminUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (hasAdminUser) {
    return null; // Admin user already exists
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Setup Admin User</CardTitle>
          <CardDescription>
            No admin user exists. You can make yourself the first admin user to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={makeCurrentUserAdmin}
            disabled={makingAdmin}
            className="w-full"
          >
            {makingAdmin ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin User...
              </>
            ) : (
              'Make Me Admin'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}