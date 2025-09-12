import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { Shield, Users, Warehouse, Hospital, Stethoscope } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('hospital');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, requestAccess } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to SihaCare",
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await requestAccess(email, password, name, role);
    if (success) {
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    }
    setIsLoading(false);
  };

  const roleIcons = {
    admin: Shield,
    warehouse: Warehouse,
    hospital: Hospital,
    clinician: Stethoscope
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Logo className="justify-center mb-6" />
          <p className="text-muted-foreground">Secure Medical Supply Chain Management</p>
        </div>

        <Card className="card-medical">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="request">Request Access</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Login to SihaCare</CardTitle>
                <CardDescription>
                  Enter your credentials to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus-medical"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="focus-medical"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-primary hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                {/* Registration Info */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Need Access?</h4>
                  <p className="text-xs text-muted-foreground">
                    Use the "Request Access" tab to register for a new account. Admin approval is required.
                  </p>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="request">
              <CardHeader>
                <CardTitle>Request Access</CardTitle>
                <CardDescription>
                  Submit a request to join the SihaCare system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestAccess} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="req-name">Full Name</Label>
                    <Input 
                      id="req-name"
                      type="text" 
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="focus-medical"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="req-email">Email</Label>
                    <Input 
                      id="req-email"
                      type="email" 
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus-medical"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="req-password">Password</Label>
                    <Input 
                      id="req-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="focus-medical"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                      <SelectTrigger className="focus-medical">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warehouse">
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-4 h-4" />
                            Warehouse Staff
                          </div>
                        </SelectItem>
                        <SelectItem value="hospital">
                          <div className="flex items-center gap-2">
                            <Hospital className="w-4 h-4" />
                            Hospital Staff
                          </div>
                        </SelectItem>
                        <SelectItem value="clinician">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Clinician
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-secondary hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Request Access'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}