"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, CheckCircle, Crown, KeyRound } from "lucide-react";
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

// Conceptual SVGs for payment logos
const AirtelMoneyLogo = () => <div className="h-8 w-8 bg-red-500 text-white flex items-center justify-center rounded-full text-xs font-bold">AM</div>;
const TNMMpambaLogo = () => <div className="h-8 w-8 bg-orange-500 text-white flex items-center justify-center rounded-full text-xs font-bold">TM</div>;

const vipPlans = [
  { name: "Monthly", price: "$0.50", duration: "per month", features: ["Unlimited Generations", "Priority Support", "Early Access"] },
  { name: "Quarterly", price: "$1.00", duration: "for 3 months", features: ["All Monthly Benefits", "10% Discount"], popular: true },
  { name: "Yearly", price: "$2.00", duration: "per year", features: ["All Monthly Benefits", "20% Discount", "Exclusive Content"] },
  { name: "Lifetime", price: "$5.00", duration: "one-time", features: ["All Yearly Benefits", "Never Pay Again"], bestValue: true },
];

const OWNER_PASSKEY = "Pete012@Ai";

export default function VipPage() {
  const [passkey, setPasskey] = useState('');
  const [isVip, setIsVip] = useState(false); // This would come from user state

  const handlePasskeySubmit = () => {
    if (passkey === OWNER_PASSKEY) {
      setIsVip(true); // Simulate VIP activation
      toast({
        title: "🎉 Congratulations! 🎉",
        description: "Pro VIP Lifetime Activated! Enjoy unlimited access.",
        duration: 7000,
      });
      // Add celebration animation/music trigger here conceptually
      setPasskey('');
    } else {
      toast({
        title: "Invalid Passkey",
        description: "The passkey you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isVip) {
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
              <p className="text-3xl font-bold text-primary">{plan.price}</p>
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
            <CardDescription>After sending payment, please send a screenshot to Peter Damiano for VIP activation.</CardDescription>
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
             <p className="text-sm text-muted-foreground">Contact Peter Damiano via WhatsApp at 0982001368 or email peterdamiano12masterpro@gmail.com with your payment screenshot.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Have a Passkey?</CardTitle>
          <CardDescription>If you have a special passkey, enter it here for VIP access.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input 
            type="text" 
            placeholder="Enter your VIP passkey" 
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
          />
          <Button onClick={handlePasskeySubmit}>Activate</Button>
        </CardContent>
      </Card>
    </div>
  );
}
