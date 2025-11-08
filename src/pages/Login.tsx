import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { Hospital, Warehouse, UserCheck, Stethoscope, Mail, AlertCircle } from "lucide-react";

const Login = () => {
  const { user, login, requestAccess, resendVerificationEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Request access form state
  const [name, setName] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [role, setRole] = useState("");

  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Verification states
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setNeedsVerification(false);
    
    const { error } = await login(email, password);
    
    if (error) {
      if (error === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setVerificationEmail(email);
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address before logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      navigate("/dashboard");
    }
    
    setIsLoggingIn(false);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        title: "Role Required",
        description: "Please select a role to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsRequestingAccess(true);
    
    const { error } = await requestAccess(name, accessEmail, accessPassword, role);
    
    if (error) {
      toast({
        title: "Request Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      setShowSignupSuccess(true);
      setVerificationEmail(accessEmail);
      toast({
        title: "Access Requested",
        description: "Please check your email to verify your account.",
      });
      // Reset form
      setName("");
      setAccessEmail("");
      setAccessPassword("");
      setRole("");
    }
    
    setIsRequestingAccess(false);
  };

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    
    const { error } = await resendVerificationEmail(verificationEmail);
    
    if (error) {
      toast({
        title: "Failed to Resend",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email Sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
    }
    
    setIsResendingEmail(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case 'admin': return <UserCheck className="h-4 w-4" />;
      case 'warehouse': return <Warehouse className="h-4 w-4" />;
      case 'hospital': return <Hospital className="h-4 w-4" />;
      case 'clinician': return <Stethoscope className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Welcome to SihaTrace</CardTitle>
          <CardDescription>
            Secure pharmaceutical supply chain management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="request">Request Access</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {needsVerification && (
                <Alert className="mb-4 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-900">Email Verification Required</AlertTitle>
                  <AlertDescription className="text-orange-800">
                    Please verify your email address to continue. Check your inbox for the verification link.
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-semibold text-orange-600 hover:text-orange-700"
                      onClick={handleResendVerification}
                      disabled={isResendingEmail}
                    >
                      {isResendingEmail ? "Sending..." : "Resend verification email"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="request">
              {showSignupSuccess && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900">Verify Your Email</AlertTitle>
                  <AlertDescription className="text-blue-800">
                    We've sent a verification link to <strong>{verificationEmail}</strong>. 
                    Please check your inbox and click the link to verify your account.
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 block mt-2"
                      onClick={handleResendVerification}
                      disabled={isResendingEmail}
                    >
                      {isResendingEmail ? "Sending..." : "Resend verification email"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access-email">Email</Label>
                  <Input
                    id="access-email"
                    type="email"
                    placeholder="Enter your email"
                    value={accessEmail}
                    onChange={(e) => setAccessEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access-password">Password</Label>
                  <Input
                    id="access-password"
                    type="password"
                    placeholder="Create a password"
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">
                        <div className="flex items-center gap-2">
                          {getRoleIcon('warehouse')}
                          <span>Warehouse Manager</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hospital">
                        <div className="flex items-center gap-2">
                          {getRoleIcon('hospital')}
                          <span>Hospital Staff</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="clinician">
                        <div className="flex items-center gap-2">
                          {getRoleIcon('clinician')}
                          <span>Clinician</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isRequestingAccess}>
                  {isRequestingAccess ? "Requesting..." : "Request Access"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;