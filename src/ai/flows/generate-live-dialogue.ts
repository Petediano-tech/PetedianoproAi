
'use server';
/**
 * @fileOverview An AI agent for generating multi-speaker dialogues with audio and optional images.
 *
 * - generateLiveDialogue - Generates a dialogue with audio and optional images.
 * - GenerateLiveDialogueInput - Input type.
 * - GenerateLiveDialogueOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import wav from 'wav';

// Define available voices for assignment
const AVAILABLE_VOICES = ['achernar', 'algenib', 'gacrux', 'rasalgethi', 'schedar', 'sulafat', 'zubenelgenubi', 'charon', 'aoede', 'leda'] as const;

// Define input schema
const GenerateLiveDialogueInputSchema = z.object({
  title: z.string().describe('The title or main topic for the dialogue.'),
  genre: z.enum(['African Story', 'Funny/Hilarious', 'Financial', 'Real Life Hustle', 'Malawian Story', 'Sci-Fi', 'Fantasy', 'Mystery']).describe('The genre of the story.'),
  characterCount: z.enum(['Normal (2-3 characters)', 'Large (4+ characters)']).describe('The approximate number of characters in the dialogue.'),
  withPictures: z.boolean().default(false).describe('Whether to generate accompanying images for key scenes.'),
});
type GenerateLiveDialogueInput = z.infer<typeof GenerateLiveDialogueInputSchema>;

// Define output schema
const DialogueSceneSchema = z.object({
  sceneNumber: z.number().describe('The sequence number of the scene.'),
  sceneDescription: z.string().describe('A brief description of the setting and action in this scene.'),
  imageUrl: z.string().optional().describe('Data URI of the generated image for this scene.'),
  dialogue: z.array(z.object({
    speaker: z.string().describe('The name of the speaker (e.g., "NARRATOR", "JOHN").'),
    line: z.string().describe('The dialogue line spoken by the character.'),
  })).describe('The sequence of dialogue lines in this scene.'),
});
const GenerateLiveDialogueOutputSchema = z.object({
  title: z.string().describe('The generated title of the dialogue or story.'),
  fullAudioUrl: z.string().describe('A data URI for the complete audio narration of the dialogue.'),
  scenes: z.array(DialogueSceneSchema).describe('An array of scenes, each containing dialogue and an optional image.'),
});
type GenerateLiveDialogueOutput = z.infer<typeof GenerateLiveDialogueOutputSchema>;


// Helper function to convert PCM audio to WAV format
async function toWav(pcmData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels: 1, sampleRate: 24000, bitDepth: 16 });
    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// 1. Prompt to generate the structured story script
const scriptGenerationPrompt = ai.definePrompt({
    name: 'dialogueScriptGenerator',
    input: { schema: GenerateLiveDialogueInputSchema },
    output: {
        schema: z.object({
            title: z.string().describe('A creative and fitting title for the story.'),
            scenes: z.array(z.object({
                sceneNumber: z.number(),
                sceneDescription: z.string().describe("A brief description of this scene's setting and mood."),
                dialogue: z.array(z.object({
                    speaker: z.string().describe("The speaker's name or 'NARRATOR'. Use unique names for characters."),
                    line: z.string().describe("The line of dialogue. For non-speech sounds, use brackets, e.g., [A car horn blares].")
                }))
            }))
        })
    },
    prompt: `You are an expert storyteller and scriptwriter. Based on the user's request, create a compelling story structured into scenes with dialogue.

    Topic: {{{title}}}
    Genre: {{{genre}}}
    Character Count: {{{characterCount}}}

    Instructions:
    - Create a story with a clear beginning, middle, and end.
    - Divide the story into 2 to 4 distinct scenes.
    - For each scene, provide a 'sceneDescription' of the setting.
    - Write dialogue for each speaker. Use 'NARRATOR' for narration.
    - Assign unique names to other speakers (e.g., JOHN, AUNTIE, etc.).
    - For non-speech sounds (like laughter, a door slamming), describe them in brackets, e.g., [The crowd laughs]. The TTS cannot generate these sounds.
    - Ensure the number of unique speakers matches the requested character count.
    `,
    config: { temperature: 0.8 },
});

// Main exported function
export async function generateLiveDialogue(input: GenerateLiveDialogueInput): Promise<GenerateLiveDialogueOutput> {
  try {
    // 1. Generate the script
    const scriptResult = await scriptGenerationPrompt(input);
    if (!scriptResult.output) {
      throw new Error('Failed to generate the story script. The AI may have returned an invalid structure.');
    }
    const { title, scenes } = scriptResult.output;

    let fullAudioUrl = '';
    const speakers = [...new Set(scenes.flatMap(s => s.dialogue.map(d => d.speaker)))];

    // 2. Generate audio, but wrap in a try/catch to prevent the whole flow from failing
    try {
      if (speakers.length > 0) {
        let audioGenerationResult;

        if (speakers.length === 1) {
          // Handle single-speaker audio
          const voice = AVAILABLE_VOICES[0];
          const singleSpeakerTtsPrompt = scenes.flatMap(s => s.dialogue).map(d => d.line).join('\n\n');
          audioGenerationResult = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            prompt: singleSpeakerTtsPrompt,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice as any } } },
            },
          });
        } else {
          // Handle multi-speaker audio (2 or more speakers)
          const voice1 = AVAILABLE_VOICES[0]; // A male voice
          const voice2 = AVAILABLE_VOICES[AVAILABLE_VOICES.length - 1]; // A female voice

          const speakerMap: Record<string, string> = {};
          let nextSpeakerIndex = 1;
          for (const speaker of speakers) {
            speakerMap[speaker] = `Speaker${nextSpeakerIndex}`;
            nextSpeakerIndex = nextSpeakerIndex === 1 ? 2 : 1;
          }
          
          const multiSpeakerConfig = {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: 'Speaker1', voiceConfig: { prebuiltVoiceConfig: { voiceName: voice1 as any } } },
                { speaker: 'Speaker2', voiceConfig: { prebuiltVoiceConfig: { voiceName: voice2 as any } } }
              ],
            },
          };

          const ttsPrompt = scenes.flatMap(s => s.dialogue).map(d => `${speakerMap[d.speaker]}: ${d.line}`).join('\n');
          
          audioGenerationResult = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            prompt: ttsPrompt,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: multiSpeakerConfig,
            },
          });
        }

        if (audioGenerationResult.media?.url) {
          const pcmAudioData = audioGenerationResult.media.url;
          const audioBuffer = Buffer.from(pcmAudioData.substring(pcmAudioData.indexOf(',') + 1), 'base64');
          const wavBase64 = await toWav(audioBuffer);
          fullAudioUrl = `data:audio/wav;base64,${wavBase64}`;
        } else {
           console.warn("Audio generation succeeded but returned no media URL.");
        }
      } else {
        console.warn("No speakers found in the generated script. Skipping audio generation.");
      }
    } catch (error) {
      console.error("Failed to generate audio for the dialogue. Continuing without audio.", error);
      // This catch block ensures that even if audio generation fails, the rest of the function proceeds.
      // fullAudioUrl will remain an empty string.
    }


    // 3. Generate images if requested
    const processedScenes: z.infer<typeof DialogueSceneSchema>[] = [];
    if (input.withPictures) {
        let previousImage: {url: string} | null = null;
        for (const scene of scenes) {
            try {
                let imagePrompt = `Generate a high-quality, expressive illustration for a story. The scene is: "${scene.sceneDescription}". `;
                const charactersInScene = [...new Set(scene.dialogue.map(d => d.speaker).filter(s => s !== 'NARRATOR'))];
                if (charactersInScene.length > 0) {
                  imagePrompt += `The characters present are: ${charactersInScene.join(', ')}. `;
                }
                imagePrompt += `The style should match the genre: ${input.genre}.`;

                const promptParts: any[] = [{ text: imagePrompt }];
                if (previousImage) {
                    // Add previous image as context to maintain consistency
                    promptParts.unshift({ media: previousImage });
                }

                const imageResult = await ai.generate({
                    model: 'googleai/gemini-2.0-flash-preview-image-generation',
                    prompt: promptParts,
                    config: { responseModalities: ['TEXT', 'IMAGE'] },
                });
                
                const sceneCopy = {...scene};
                if (imageResult.media?.url) {
                    sceneCopy.imageUrl = imageResult.media.url;
                    previousImage = { url: imageResult.media.url }; // Update context for next iteration
                }
                processedScenes.push(sceneCopy);
            } catch(error) {
                console.error(`Failed to generate image for scene ${scene.sceneNumber}. Skipping.`, error);
                processedScenes.push(scene); // Add the scene even without an image
            }
        }
    } else {
        processedScenes.push(...scenes);
    }

    return {
      title,
      fullAudioUrl,
      scenes: processedScenes,
    };
  } catch (error: any) {
    console.error("An unhandled error occurred in the generateLiveDialogue flow:", error);
    // Re-throw a user-friendly error that the client can display
    throw new Error(`The dialogue generation failed unexpectedly. Please try again. Details: ${error.message}`);
  }
}
