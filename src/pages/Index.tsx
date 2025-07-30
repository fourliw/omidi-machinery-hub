import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdminUserSetup } from '@/components/admin/AdminUserSetup';

const Index = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();

  return (
    <>
      {/* Show admin setup component - it handles its own visibility logic */}
      <AdminUserSetup />
      
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
          
          {user ? (
            <div className="space-y-4">
              <p className="text-xl text-muted-foreground">
                Hello, {user.email}! You're successfully authenticated.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Authentication Status: ✅ Secure
                </p>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button asChild>
                      <Link to="/admin">Go to Admin Panel</Link>
                    </Button>
                  )}
                  <Button onClick={signOut} variant="outline">
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl text-muted-foreground">
                Start building your amazing project here!
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Authentication Status: ⚠️ Not authenticated
                </p>
                <Button asChild>
                  <Link to="/auth">Sign In / Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
