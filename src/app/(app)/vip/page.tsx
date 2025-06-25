
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, CheckCircle, Crown, KeyRound, Loader2, AlertTriangle } from "lucide-react";
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { isUserVip } from '@/lib/usage-limiter';
import { validateAndUsePasskey } from '@/lib/passkeys';

// Conceptual SVGs for payment logos
const AirtelMoneyLogo = () => <div className="h-8 w-8 bg-red-500 text-white flex items-center justify-center rounded-full text-xs font-bold">AM</div>;
const TNMMpambaLogo = () => <div className="h-8 w-8 bg-orange-500 text-white flex items-center justify-center rounded-full text-xs font-bold">TM</div>;

const USD_TO_MWK_RATE = 1800;

const vipPlans = [
  { name: "Monthly", priceUSD: 0.50, duration: "per month", features: ["Unlimited Generations", "Priority Support", "Early Access"] },
  { name: "Quarterly", priceUSD: 1.00, duration: "for 3 months", features: ["All Monthly Benefits", "10% Discount"], popular: true },
  { name: "Yearly", priceUSD: 2.00, duration: "per year", features: ["All Yearly Benefits", "20% Discount", "Exclusive Content"] },
  { name: "Lifetime", priceUSD: 5.00, duration: "one-time", features: ["All Yearly Benefits", "Never Pay Again"], bestValue: true },
];

const ATTEMPTS_STORAGE_KEY = 'petedianoProPasskeyAttempts';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATIONS = [
  30 * 60 * 1000, // 30 minutes
  60 * 60 * 1000, // 1 hour
  3 * 60 * 60 * 1000, // 3 hours
]; 

interface AttemptData {
  count: number;
  lockoutLevel: number;
  lockedUntil: number; // Timestamp
}

export default function VipPage() {
  const [passkey, setPasskey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentIsVip, setCurrentIsVip] = useState(false);
  const [attemptData, setAttemptData] = useState<AttemptData>({ count: 0, lockoutLevel: 0, lockedUntil: 0 });
  const [_, setTimer] = useState(0); // For re-rendering to update lockout message

  useEffect(() => {
    setCurrentIsVip(isUserVip());
    
    // Load attempt data from storage
    const storedAttempts = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (storedAttempts) {
      setAttemptData(JSON.parse(storedAttempts));
    }

    // Timer to re-check lockout status and update UI
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const isLocked = useMemo(() => {
    return attemptData.lockedUntil > Date.now();
  }, [attemptData, _]);
  
  const getLockoutMessage = () => {
    const timeLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
    if (timeLeft <= 0) return '';
    
    if (attemptData.lockoutLevel > LOCKOUT_DURATIONS.length) {
      return "Too many attempts. Please try again tomorrow.";
    }
    
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

    // Simulate network delay
    setTimeout(() => {
      const result = validateAndUsePasskey(passkey);

      if (result.success) {
        toast({
          title: "🎉 Congratulations! 🎉",
          description: result.message,
          duration: 7000,
        });
        setCurrentIsVip(true);
        setPasskey('');
        // Reset attempts on success
        localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      } else {
        toast({
          title: "Invalid Passkey",
          description: result.message,
          variant: "destructive",
        });
        
        const now = Date.now();
        const newCount = attemptData.count + 1;
        let newLockoutLevel = attemptData.lockoutLevel;
        let newLockedUntil = attemptData.lockedUntil;

        if (newCount >= MAX_ATTEMPTS) {
          if (newLockoutLevel < LOCKOUT_DURATIONS.length) {
            newLockedUntil = now + LOCKOUT_DURATIONS[newLockoutLevel];
          } else {
            // Lock until next day (local time)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            newLockedUntil = tomorrow.getTime();
          }
          newLockoutLevel++;
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
    }, 500); // simulate async operation
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
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-xl' : ''} ${plan.bestValue ? 'border-accent shadow-2xl' : ''}`}>
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
              <Button className="w-full" variant={plan.bestValue ? "default" : "outline"}>Choose Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl">Payment Information (Malawi)</CardTitle>
            <CardDescription>
               After sending payment, please **call Peter Damiano** with your payment details (e.g., a screenshot of the transaction) to receive your personal VIP Passkey for activation. Payments are processed manually.
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
             <p className="text-sm text-muted-foreground">Contact Peter Damiano via WhatsApp at 0982001368 or email peterdamiano12masterpro@gmail.com with your payment details.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Have a Passkey?</CardTitle>
          <CardDescription>If you have received a VIP passkey, enter it here for activation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter your VIP passkey" 
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              disabled={isLoading || isLocked}
            />
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
