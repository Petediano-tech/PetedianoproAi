
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, CheckCircle, Crown, KeyRound, Loader2, AlertTriangle, CreditCard, Copy } from "lucide-react";
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { isUserVip } from '@/lib/usage-limiter';
import { validateAndUsePasskey } from '@/lib/passkeys';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Conceptual SVGs for payment logos
const AirtelMoneyLogo = () => <div className="h-8 w-8 bg-red-500 text-white flex items-center justify-center rounded-full text-xs font-bold">AM</div>;
const TNMMpambaLogo = () => <div className="h-8 w-8 bg-orange-500 text-white flex items-center justify-center rounded-full text-xs font-bold">TM</div>;
const PayPalLogo = () => <svg className="h-6 w-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>PayPal</title><path d="M7.335 2.334H16.33c1.78 0 2.993 1.13 2.66 2.805l-1.127 9.472c-.143.99-.97 1.7-1.957 1.7H5.253c-.63 0-1.18-.44-1.28-1.054L2.09 3.565c-.158-1.045.586-2.033 1.636-2.146l3.61-.385zM6.35 9.172h3.23c1.33 0 2.228-.546 2.493-1.899l.31-1.63c.1-.532.615-.845 1.14-.736l.208.04c.525.11.822.65.712 1.18l-1.39 7.373c-.22 1.163-1.25 1.95-2.42 1.95h-2.12c-.63 0-1.18-.44-1.28-1.054l-1.93-12.82c-.158-1.045.586-2.033 1.636-2.146l3.61-.385" fill="#003087"></path><path d="M8.28 2.016h7.42c1.71 0 2.872 1.134 2.56 2.76l-.68 5.76c-.25 1.83-1.83 3.193-3.69 3.193H6.82c-.63 0-1.18-.44-1.28-1.054L3.65 2.844c-.158-1.045.586-2.033 1.636-2.146l3-0.317z" fill="#009cde"></path><path d="M8.825 2.334h6.5c1.55 0 2.645 1.054 2.378 2.51l-.546 4.61c-.385 3.25-3.033 5.67-6.28 5.67H4.37c-.63 0-1.18-.44-1.28-1.054L1.207 4.23c-.158-1.045.586-2.033 1.636-2.146l5.982-.634z" fill="#012169"></path></svg>

const USD_TO_MWK_RATE = 1800;

const vipPlans = [
  { id: 'monthly', name: "Monthly", priceUSD: 0.50, duration: "per month", features: ["Unlimited Generations", "Priority Support", "Early Access"], demoPasskey: "DEMO-MONTHLY-KEY" },
  { id: 'quarterly', name: "Quarterly", priceUSD: 1.00, duration: "for 3 months", features: ["All Monthly Benefits", "10% Discount"], popular: true, demoPasskey: "DEMO-QUARTERLY-KEY" },
  { id: 'yearly', name: "Yearly", priceUSD: 2.00, duration: "per year", features: ["All Yearly Benefits", "20% Discount", "Exclusive Content"], demoPasskey: "DEMO-YEARLY-KEY" },
  { id: 'lifetime', name: "Lifetime", priceUSD: 5.00, duration: "one-time", features: ["All Yearly Benefits", "Never Pay Again"], bestValue: true, demoPasskey: "DEMO-LIFETIME-KEY" },
];
type Plan = typeof vipPlans[0];

const ATTEMPTS_STORAGE_KEY = 'petedianoProPasskeyAttempts';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATIONS = [ 30 * 60 * 1000, 60 * 60 * 1000, 3 * 60 * 60 * 1000 ]; 
interface AttemptData { count: number; lockoutLevel: number; lockedUntil: number; }

export default function VipPage() {
  const [passkey, setPasskey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentIsVip, setCurrentIsVip] = useState(false);
  const [attemptData, setAttemptData] = useState<AttemptData>({ count: 0, lockoutLevel: 0, lockedUntil: 0 });
  const [_, setTimer] = useState(0); 

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIsVip(isUserVip());
    const storedAttempts = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (storedAttempts) setAttemptData(JSON.parse(storedAttempts));
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const isLocked = useMemo(() => {
    return attemptData.lockedUntil > Date.now();
  }, [attemptData, _]);
  
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLockoutMessage = () => {
    const timeLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
    if (timeLeft <= 0) return '';
    if (attemptData.lockoutLevel > LOCKOUT_DURATIONS.length) return "Too many attempts. Please try again tomorrow.";
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    let message = 'Too many attempts. Please try again in ';
    if (hours > 0) message += `${hours}h `;
    if (minutes > 0) message += `${minutes}m `;
    if (seconds > 0) message += `${seconds}s.`;
    return message.trim();
  };

  const handlePasskeySubmit = () => {
    if (isLocked) {
      toast({ title: "Rate Limited", description: getLockoutMessage(), variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    setTimeout(() => {
      const result = validateAndUsePasskey(passkey);

      if (result.success) {
        toast({ title: "🎉 Congratulations! 🎉", description: result.message, duration: 7000 });
        setCurrentIsVip(true);
        setPasskey('');
        localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      } else {
        toast({ title: "Invalid Passkey", description: result.message, variant: "destructive" });
        const now = Date.now();
        const newCount = attemptData.count + 1;
        let newLockoutLevel = attemptData.lockoutLevel;
        let newLockedUntil = attemptData.lockedUntil;
        if (newCount >= MAX_ATTEMPTS) {
          newLockoutLevel = Math.min(newLockoutLevel + 1, LOCKOUT_DURATIONS.length);
          newLockedUntil = now + (LOCKOUT_DURATIONS[newLockoutLevel-1] || 24 * 60 * 60 * 1000);
        }
        const newAttemptData: AttemptData = {
          count: newCount >= MAX_ATTEMPTS ? 0 : newCount,
          lockoutLevel: newLockoutLevel,
          lockedUntil: newLockedUntil,
        };
        setAttemptData(newAttemptData);
        localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(newAttemptData));
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSimulatedPayment = () => {
    if (!selectedPlan) return;
    toast({
      title: 'Payment "Successful"!',
      description: `Your demo passkey is: ${selectedPlan.demoPasskey}. Please copy and paste it below to activate.`,
      duration: 10000,
    });
    navigator.clipboard.writeText(selectedPlan.demoPasskey);
  };
  
  const formatPriceMWK = (priceUSD: number) => {
    return `(approx. K${(priceUSD * USD_TO_MWK_RATE).toLocaleString()})`;
  };

  if (currentIsVip) {
    return (
        <div className="container mx-auto py-8 text-center">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-primary flex items-center justify-center">
                        <Crown className="mr-3 h-8 w-8 text-yellow-500" /> You are a VIP!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">Thank you for being a valued Petediano Pro VIP member.</p>
                    <p className="text-muted-foreground">You have unlimited access to all features.</p>
                    <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-pulse" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-12">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
            <Crown className="mr-3 h-10 w-10 text-yellow-500" /> Become a Petediano Pro VIP
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Unlock unlimited generations, priority support, and exclusive features.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {vipPlans.map((plan) => (
          <Card key={plan.id} className={cn("flex flex-col", (selectedPlan?.id === plan.id || plan.popular) && 'border-primary shadow-xl', plan.bestValue && 'border-accent shadow-2xl')}>
            <CardHeader className="text-center pb-2">
              {plan.popular && <div className="text-xs font-semibold uppercase text-primary mb-1">Popular</div>}
              {plan.bestValue && <div className="text-xs font-semibold uppercase text-accent mb-1">Best Value</div>}
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <p className="text-3xl font-bold text-primary">${plan.priceUSD.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{formatPriceMWK(plan.priceUSD)}</p>
              <p className="text-sm text-muted-foreground">{plan.duration}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSelectPlan(plan)} className="w-full" variant={plan.bestValue ? "default" : "outline"}>Choose Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div ref={paymentSectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
              <CardTitle className="font-headline text-xl">Online Payment (Simulated)</CardTitle>
              <CardDescription>
                Select a plan above, then use a simulated payment method. You will receive a demo passkey to activate.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={!selectedPlan}><CreditCard className="mr-2"/>Pay with Card</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment for {selectedPlan?.name} Plan</AlertDialogTitle>
                    <AlertDialogDescription>
                        This is a simulation. No real payment will be processed. Click below to simulate a successful transaction and receive your demo passkey.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSimulatedPayment}>Simulate Payment</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={!selectedPlan}><PayPalLogo />Pay with PayPal</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm PayPal Payment for {selectedPlan?.name} Plan</AlertDialogTitle>
                      <AlertDialogDescription>
                          This is a simulation. No real payment will be processed. Clicking below will simulate a successful PayPal transaction and give you a demo passkey.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSimulatedPayment}>Simulate Payment</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
              <CardTitle className="font-headline text-xl">Manual Payment (Malawi)</CardTitle>
              <CardDescription>
                After sending payment, please **call Peter Damiano** with your transaction details to receive your personal VIP Passkey.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <AirtelMoneyLogo />
                  <div>
                      <p className="font-semibold">Airtel Money</p>
                      <p className="text-muted-foreground">Number: 0982001368</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <TNMMpambaLogo />
                  <div>
                      <p className="font-semibold">TNM Mpamba</p>
                      <p className="text-muted-foreground">Number: 0880951342</p>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Activate Your VIP Access</CardTitle>
          <CardDescription>If you have received a VIP passkey, enter it here for activation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder="Enter your VIP passkey" 
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                disabled={isLoading || isLocked}
                className="pr-10"
              />
              <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => navigator.clipboard.writeText(passkey)} disabled={!passkey}>
                  <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handlePasskeySubmit} disabled={isLoading || isLocked || !passkey}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Activate"}
            </Button>
          </div>
          {isLocked && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {getLockoutMessage()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
