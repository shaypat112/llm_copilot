import { pipeline } from '@xenova/transformers';

// Load a small LLM in-browser
export async function runLLM(input: string) {
  const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
  const output = await generator(input, {
    max_new_tokens: 50,
    do_sample: true,
  });

  return (output[0] as any).generated_text;
}
