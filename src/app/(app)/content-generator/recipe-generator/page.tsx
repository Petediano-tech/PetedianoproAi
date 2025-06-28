
"use client";
import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UtensilsCrossed, Sparkles, Loader2, Download, Copy, List, ChefHat, Clock, Users } from "lucide-react";
import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { canUseFeature, recordFeatureUsage, FEATURE_NAMES } from '@/lib/usage-limiter';
import Link from 'next/link';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { playNotificationSound } from '@/utils/audioPlayer';
import { Badge } from '@/components/ui/badge';

const mealTypes = ['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export default function RecipeGeneratorPage() {
  const [ingredients, setIngredients] = useState<string>("");
  const [mealType, setMealType] = useState<string>(mealTypes[0]);
  const [dietaryNeeds, setDietaryNeeds] = useState<string>("");
  
  const [generatedRecipe, setGeneratedRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { soundSettings } = useSoundSettings();

  const showUpgradeToast = () => {
    toast({
      title: "Daily Limit Reached",
      description: "You've used all your free recipe generations for today.",
      variant: "destructive",
      action: ( <Link href="/vip"> <Button variant="secondary" size="sm">Upgrade to VIP</Button> </Link> ),
    });
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients) {
      toast({ title: "Missing Ingredients", description: "Please list at least one ingredient.", variant: "destructive" });
      return;
    }
    if (!canUseFeature(FEATURE_NAMES.RECIPE_GENERATOR)) {
      showUpgradeToast();
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setGeneratedRecipe(null);
    
    const progressInterval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + 5, 90));
    }, 600);

    try {
      const input: GenerateRecipeInput = { ingredients, mealType: mealType as GenerateRecipeInput['mealType'], dietaryNeeds };
      const result = await generateRecipe(input);
      setGeneratedRecipe(result);
      recordFeatureUsage(FEATURE_NAMES.RECIPE_GENERATOR);
      toast({ title: "Success", description: "Recipe generated!" });
      playNotificationSound(soundSettings);
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast({ title: "Error", description: "Failed to generate recipe. " + (error as Error).message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setProgressValue(100);
      setIsLoading(false);
      setTimeout(() => setProgressValue(0), 1500);
    }
  };

  const formatRecipeToText = (recipe: GenerateRecipeOutput | null): string => {
    if (!recipe) return "";
    let text = `Title: ${recipe.title}\n\n`;
    text += `Description: ${recipe.description}\n\n`;
    text += `Prep Time: ${recipe.prepTime}\nCook Time: ${recipe.cookTime}\nServings: ${recipe.servings}\n\n`;
    text += `Ingredients:\n${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}\n\n`;
    text += `Instructions:\n${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n`;
    return text.trim();
  };

  const handleCopyRecipe = () => {
    const recipeText = formatRecipeToText(generatedRecipe);
    if (!recipeText) return;
    navigator.clipboard.writeText(recipeText)
      .then(() => toast({ title: "Copied!", description: "Recipe copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy.", variant: "destructive" }));
  };

  const handleDownloadRecipe = (format: 'txt' | 'json') => {
    if (!generatedRecipe) return;
    let data = "";
    let fileExtension = format;
    let mimeType = "text/plain";

    if (format === 'json') {
      data = JSON.stringify(generatedRecipe, null, 2);
      mimeType = "application/json";
    } else { // txt
      data = formatRecipeToText(generatedRecipe);
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = generatedRecipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle || 'recipe'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Recipe ${format.toUpperCase()} downloaded.` });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <UtensilsCrossed className="mr-3 h-8 w-8" /> AI Recipe Generator
          </CardTitle>
          <CardDescription>Enter the ingredients you have, and let AI create a delicious recipe for you.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="font-headline text-xl">Ingredients & Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="ingredients">Ingredients You Have</Label><Textarea id="ingredients" placeholder="e.g., chicken breast, rice, broccoli, soy sauce" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={4}/></div>
            <div>
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger id="mealType"><SelectValue /></SelectTrigger>
                <SelectContent>{mealTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="dietaryNeeds">Dietary Needs (Optional)</Label><Input id="dietaryNeeds" placeholder="e.g., Vegan, Gluten-Free" value={dietaryNeeds} onChange={(e) => setDietaryNeeds(e.target.value)} /></div>
            <Button onClick={handleGenerateRecipe} disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" /> {isLoading ? "Cooking up a recipe..." : "Generate Recipe"}
            </Button>
            {isLoading && <Progress value={progressValue} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Recipe</CardTitle></CardHeader>
          <CardContent className="min-h-[500px]">
            {isLoading && !generatedRecipe && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">AI is preheating the oven...</p>
              </div>
            )}
            {!isLoading && !generatedRecipe && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ChefHat className="h-16 w-16 mb-4" /><p>Your delicious recipe will appear here.</p>
              </div>
            )}
            {generatedRecipe && (
              <ScrollArea className="h-[calc(100vh-22rem)] p-1">
                <div className="space-y-6">
                  <h2 className="font-headline text-3xl text-center text-accent !mb-2">{generatedRecipe.title}</h2>
                  <p className="text-center text-muted-foreground italic">{generatedRecipe.description}</p>
                  
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline" className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> Prep: {generatedRecipe.prepTime}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> Cook: {generatedRecipe.cookTime}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5"><Users className="h-4 w-4"/> Serves: {generatedRecipe.servings}</Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-headline text-xl text-primary mb-2 flex items-center"><List className="mr-2 h-5 w-5"/>Ingredients</h3>
                    <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                      {generatedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-headline text-xl text-primary mb-2 flex items-center"><ChefHat className="mr-2 h-5 w-5"/>Instructions</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-foreground/80">
                      {generatedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>

                  <CardFooter className="justify-center pt-6 border-t gap-2 !mt-8 !px-0">
                      <Button variant="outline" onClick={handleCopyRecipe}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                      <Button variant="outline" onClick={() => handleDownloadRecipe('txt')}><Download className="mr-2 h-4 w-4" /> TXT</Button>
                      <Button variant="outline" onClick={() => handleDownloadRecipe('json')}><Download className="mr-2 h-4 w-4" /> JSON</Button>
                  </CardFooter>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
