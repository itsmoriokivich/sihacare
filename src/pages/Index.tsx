import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Shield, Lock, Activity, Users, ArrowRight, CheckCircle } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Shield,
      title: "Supply Chain Security",
      description: "End-to-end tracking prevents diversion and ensures authenticity"
    },
    {
      icon: Lock,
      title: "Anti-Corruption Controls",
      description: "Transparent workflows with role-based access and audit trails"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Live tracking from warehouse to patient administration"
    },
    {
      icon: Users,
      title: "Multi-role Platform",
      description: "Seamless collaboration between warehouses, hospitals, and clinicians"
    }
  ];

  const workflow = [
    { step: 1, title: "Batch Creation", description: "Warehouse creates medication batches with QR codes" },
    { step: 2, title: "Secure Dispatch", description: "Tracked delivery to authorized hospitals" },
    { step: 3, title: "Receipt Confirmation", description: "Hospital staff confirms and logs receipt" },
    { step: 4, title: "Patient Administration", description: "Clinicians record medication usage to patients" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
        
        <div className="container mx-auto px-4 text-center relative z-20">
          <Logo className="justify-center mb-8" />
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            SihaTrace
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Combating Medical Supply Chain Corruption
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            A comprehensive demo system showcasing how technology can eliminate diversion 
            and corruption in public medical supply chains through transparency and traceability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gradient-primary hover:opacity-90 px-8"
              onClick={() => navigate('/login')}
            >
              Sign In
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10 px-8"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Securing Medical Supply Chains
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our system addresses critical challenges in public healthcare by providing 
              complete visibility and accountability throughout the supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="card-medical hover-lift">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 gradient-hero rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow the complete journey of medical supplies from creation to patient care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item, index) => (
              <Card key={index} className="card-medical hover-lift relative">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
                
                {/* Connector Arrow */}
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Access Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <Card className="card-medical max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Ready to Experience SihaTrace?</CardTitle>
              <CardDescription className="text-lg">
                This is a fully interactive demo system with predefined accounts for each role.
                Experience the complete workflow from warehouse management to patient care.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Demo Roles Available:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• System Administrator</div>
                    <div>• Warehouse Staff</div>
                    <div>• Hospital Staff</div>
                    <div>• Clinician</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Interactive Features:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• Create and track batches</div>
                    <div>• Manage dispatches</div>
                    <div>• Confirm receipts</div>
                    <div>• Record patient care</div>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="gradient-primary hover:opacity-90 px-12"
                onClick={() => navigate('/login')}
              >
                Access Demo System
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground">
            © 2024 SihaTrace Demo System. Built to showcase medical supply chain traceability solutions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
