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
  const { user, login, requestAccess, resendVerificationEmail } = useAuth();
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