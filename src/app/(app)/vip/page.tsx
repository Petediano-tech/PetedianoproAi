
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Crown, Star, CheckCircle, Loader2 } from "lucide-react";
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const pricingPlans = [
  {
    level: "Monthly",
    price: "0.50",
    features: ["Unlimited Generations", "Priority Support", "Early Access to Features"],
    color: "bg-blue-500"
  },
  {
    level: "Quarterly",
    price: "1.00",
    features: ["All Monthly Benefits", "Exclusive Content", "No Ads"],
     color: "bg-green-500"
  },
  {
    level: "Yearly",
    price: "2.00",
    features: ["All Quarterly Benefits", "Special Badge", "Direct Line to Creator"],
     color: "bg-purple-500"
  },
  {
    level: "Lifetime",
    price: "5.00",
    features: ["All Yearly Benefits", "Never Pay Again", "Ultimate Bragging Rights"],
     color: "bg-yellow-500"
  }
];

export default function VipPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [passkey, setPasskey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivatePasskey = async () => {
    if (!passkey) {
        toast({title: "Missing Passkey", description: "Please enter a passkey to activate.", variant: "destructive"});
        return;
    }
    if (!firestore || !user) {
        toast({title: "Error", description: "You must be logged in to activate a passkey.", variant: "destructive"});
        return;
    }
    
    setIsLoading(true);
    try {
        const passkeyRef = doc(firestore, 'passkeys', passkey.trim());
        const passkeySnap = await getDoc(passkeyRef);

        if (passkeySnap.exists()) {
            const passkeyData = passkeySnap.data();
            if (passkeyData.isUsed) {
                toast({title: "Passkey Already Used", description: "This passkey has already been activated.", variant: "destructive"});
            } else {
                // Update passkey to be used
                await setDoc(passkeyRef, { isUsed: true, usedBy: user.uid, activatedAt: new Date() }, { merge: true });
                
                // Update user's VIP status
                const userRef = doc(firestore, 'users', user.uid);
                await setDoc(userRef, { vipStatus: passkeyData.tier || 'lifetime' }, { merge: true });

                toast({title: "VIP Activated!", description: `You are now a ${passkeyData.tier || 'lifetime'} VIP member.`});
            }
        } else {
            toast({title: "Invalid Passkey", description: "The passkey you entered is not valid.", variant: "destructive"});
        }
    } catch (error) {
        console.error("Error activating passkey: ", error);
        toast({title: "Activation Error", description: "An error occurred while activating the passkey.", variant: "destructive"});
    } finally {
        setIsLoading(false);
        setPasskey('');
    }
  };

  // Special case for admin login
  if (sessionStorage.getItem('isAdmin') === 'true') {
     return (
        <div className="container mx-auto py-8 space-y-12">
        <Card className="text-center">
            <CardHeader>
            <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
                <Crown className="mr-3 h-10 w-10 text-yellow-500" /> Petediano Pro Admin Access
            </CardTitle>
            <CardDescription className="text-lg mt-2">
                All features are fully unlocked.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
                <p className="text-lg mt-4">As the administrator, you have unlimited access to all AI generation tools and features.</p>
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
            <Crown className="mr-3 h-10 w-10 text-yellow-500" /> Become a VIP Member
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Unlock unlimited access and exclusive features by upgrading your account.
          </CardDescription>
        </CardHeader>
         <CardContent>
            <p className="text-muted-foreground">Payments in Malawi are made manually via Airtel Money (0982001368) or TNM Mpamba (0880951342). After payment, contact Peter Damiano to receive your activation passkey.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingPlans.map((plan) => (
          <Card key={plan.level} className="flex flex-col">
            <CardHeader className={`text-white text-center rounded-t-lg ${plan.color}`}>
              <CardTitle className="font-headline text-2xl">{plan.level}</CardTitle>
              <p className="text-4xl font-bold">${plan.price}</p>
            </CardHeader>
            <CardContent className="flex-grow pt-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

       <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Activate Your VIP Passkey</CardTitle>
                <CardDescription>Enter the passkey you received after payment to upgrade your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input type="text" placeholder="Enter your passkey" value={passkey} onChange={(e) => setPasskey(e.target.value)}/>
                    <Button onClick={handleActivatePasskey} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Activate
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

