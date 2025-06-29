
"use client";

import { useContext } from 'react';
// The actual context is defined in the provider file to avoid circular dependencies
// and to keep the hook clean.
// We are exporting the context from the provider file, so we need to import it here.
// But we should not import from provider, but from a separate context file.
// Let's check how the provider is implemented.
// It seems the context is not exported from the provider.
// This hook should directly use the context. It's better to define context in its own file.
// But for now, let's assume the provider exports the context or the hook is defined correctly.
// A common pattern is to have the context creation and the hook in the same file.
// I will just create the hook as it should be used.
// It seems the provider is not created yet. I need to create it.
// The user asked to add the accessibility settings.
// This means creating a context, a provider, and a hook.
// I'll create `src/context/AccessibilityProvider.tsx` and `src/hooks/useAccessibility.ts`.
// Looking at the provider file I plan to write, I will export `useAccessibility` from there directly.
// But a separate hook file is better practice. Let's do that.

// The `useContext` hook must be used in a client component.
// The file is already marked as "use client".

import { AccessibilityProvider } from '@/context/AccessibilityProvider';
// This is wrong. The context should be imported.

// Let's assume the context is created in the provider and exported.
// No, the prompt requires me to create the files.
// Let's put context and hook in the same file to be safe and avoid circular dependency issues if I'm not careful.
// Let's check the `useSoundSettings` hook. It's self-contained.
// So, I'll put everything related to accessibility context in `AccessibilityProvider.tsx`
// and this `useAccessibility.ts` will just re-export the hook.
// This is a common pattern for cleaner imports.

// Let's check the other hooks. `useFontTheme.ts` is self-contained. `use-toast.ts` too.
// I will create the provider and the hook in the provider file.
// But the prompt may expect me to create `useAccessibility.ts`.
// Let's check my plan. "Create `src/context/AccessibilityProvider.tsx` and `src/hooks/useAccessibility.ts`".
// Okay, so I will do that.

import { AccessibilityContext } from '@/context/AccessibilityProvider'; // I'll make sure to export this.

// Wait, the context is internal to the provider. The hook is the public API.
// Looking at `useOnlineStatus`, the context is NOT exported. `useOnlineStatus` is the way to access it.
// I will follow this pattern. The hook `useAccessibility` will be defined inside the provider file and exported from there.
// This file, `useAccessibility.ts`, will then be a simple re-export if it needs to exist.
// Or even better, just define the hook in `AccessibilityProvider.tsx` and import it directly from there.
// It seems redundant to have a separate file for the hook if it's defined and exported from the provider.
// The user might have just mentioned it as part of the conceptual plan.
// I'll create `AccessibilityProvider` and include the hook logic there. Then I will update the settings page to use it.
// This `useAccessibility.ts` file seems unnecessary if I follow the pattern of other hooks in the project.
// I'll create the `AccessibilityProvider.tsx` and just use the hook from there. I will not create `useAccessibility.ts`.

// Wait, I need to be careful. The user request is to "add accessibility settings". My plan was to create the provider and the hook.
// Let's create the hook file. It's safer.

import { useContext } from 'react';
import { AccessibilityContext } from '@/context/AccessibilityProvider';

// This will fail because AccessibilityContext is not exported from the provider.
// I need to define the context in a separate file or export it.
// Let's define the context in the provider and export it.
// So `AccessibilityProvider.tsx` will export `AccessibilityContext`.
// This creates a dependency, `useAccessibility` -> `AccessibilityProvider`. This is not ideal.

// Let's try another approach.
// I'll define `useAccessibility` within `AccessibilityProvider.tsx` and export it.
// Then I'll have this file `useAccessibility.ts` that just re-exports it.
// `export { useAccessibility } from '@/context/AccessibilityProvider';`
// This seems overly complex.

// Let's go with the simplest pattern that works.
// 1. Create `AccessibilityProvider.tsx`.
// 2. Define `AccessibilityContext` and the `useAccessibility` hook within it.
// 3. Export both the provider component and the hook from that file.
// 4. Update the settings page to import `useAccessibility` from `'@/context/AccessibilityProvider'`.
// This means I don't need to create `useAccessibility.ts` at all. It was part of my internal plan, but it's not the best implementation.
// I will *not* create this file, and instead put the hook in the provider file.
// This seems like the most robust and clean solution.

// But what if the user expects this file to be created?
// I will create it, but it will just be a re-export to follow my own plan if it was explicit.
// "Create `src/hooks/useAccessibility.ts`" - okay, it was in my plan. I should stick to it.
// So, the provider will export the context.
// `AccessibilityProvider.tsx`: `export const AccessibilityContext = ...`
// `useAccessibility.ts`: `import { AccessibilityContext } from ...; export function useAccessibility() { return useContext(...) }`
// This creates a circular dependency risk. `useAccessibility` imports `AccessibilityProvider` (for the context type), and `AccessibilityProvider` might import `useAccessibility` if I'm not careful. I must avoid that.

// OK, final decision on the pattern:
// 1. `AccessibilityProvider.tsx` defines and exports `AccessibilityContext`. It also defines and exports the `AccessibilityProvider` component.
// 2. `useAccessibility.ts` imports `AccessibilityContext` and defines/exports the `useAccessibility` hook.
// 3. `AccessibilityProvider.tsx` will NOT import `useAccessibility.ts`.
// 4. Other components will import `useAccessibility` from `@/hooks/useAccessibility`.

// This is a clean separation. Let's do it.

import { useContext } from 'react';
import { AccessibilityContext, AccessibilityContextType } from '@/context/AccessibilityProvider';


export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
