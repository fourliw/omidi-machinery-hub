import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
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
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
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
  );
};

export default Index;
