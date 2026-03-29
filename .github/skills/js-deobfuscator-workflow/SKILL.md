---
name: js-deobfuscator-workflow
description: 'Use when doing JS reverse engineering, AST deobfuscation, string decoder recovery, control-flow cleanup, or anti-debug removal with js-deobfuscator. Covers CLI, tmp workflow, decoderLocationMethod selection, setupCode injection, and output validation.'
argument-hint: 'Describe the obfuscated sample, current blockers, and whether you want CLI usage, option selection, or a full deobfuscation workflow.'
user-invocable: true
---

# JS Deobfuscator Workflow

## What This Skill Does

This skill guides a repeatable workflow for using the repository's js-deobfuscator to recover readable JavaScript from obfuscated input.

It is designed for cases such as:

- locating and configuring a string decoder
- handling rotated string arrays
- expanding wrapper functions
- flattening control flow and removing dead code
- stripping self-defending or anti-debug logic
- choosing between CLI, tmp quick-run, and TypeScript API usage

## When to Use

Use this skill when the task includes keywords such as:

- js reverse
- js逆向
- deobfuscate
- deobfuscator
- AST 反混淆
- 字符串解密
- 控制流还原
- anti-debug
- self-defending
- js-deobfuscator

Do not use this skill for browser traffic collection or runtime interaction first. In that case, combine it with a browser automation workflow after extracting the target script.

## Inputs To Gather First

Before running the workflow, collect these facts:

1. The input file path or code snippet.
2. Whether the sample runs in Node or browser context.
3. Whether there is a visible string array, decoder wrapper, or frequent repeated decode call.
4. Whether the sample contains anti-debug, infinite loops, or self-defending logic.
5. Whether the user wants a quick readable result or a reusable scripted pipeline.

## Procedure

### 1. Choose The Fastest Entry Path

Pick one of these modes:

1. Quick local run:
   Use `tmp/input.js` with `pnpm tmp` when the goal is a fast first-pass output.
2. CLI on a specific file:
   Use `pnpm exec deob path/to/input.js -o ./out` when the user already has a concrete sample file.
3. TypeScript API:
   Use `deob(code, options)` when the workflow needs custom orchestration or repeated runs.

## 2. Identify The Decoder Strategy

Set `decoderLocationMethod` based on the sample shape:

1. `stringArray`:
   Use when the obfuscation clearly relies on a string array and array rotation. This is the default starting point.
2. `callCount`:
   Use when there is a decode function repeatedly called many times and string-array matching is unreliable. Tune `decoderCallCount` from the default `150` upward or downward based on the sample.
3. `evalCode`:
   Use when the decoder can only be located by evaluating setup code or by explicitly injecting runtime helpers.

If the decoder function is already known, set `decoderNames` to constrain the search.

## 3. Inject Runtime Setup Only When Needed

Use `setupCode` when the obfuscated sample requires browser globals, helper functions, or patched environment state before decoding can run.

Typical cases:

- stubbing `window`, `document`, `navigator`, or timers
- defining globals that the decoder expects
- neutralizing environment checks before the transform runs

Keep setup minimal. Only inject what is required to let the decoder execute deterministically.

## 4. Run A First Pass

Start with conservative options:

```ts
import { deob } from 'deob'

const result = await deob(code, {
  decoderLocationMethod: 'stringArray',
  decoderCallCount: 150,
  mangleMode: 'off',
  isMarkEnable: true,
})
```

Expected first-pass goals:

- strings become readable
- wrapper calls are inlined or reduced
- the main execution path becomes inspectable
- obviously dead branches disappear

## 5. Escalate Based On What Fails

Branch according to the failure mode:

1. Strings are still encoded:
   switch from `stringArray` to `callCount`, or provide `decoderNames`.
2. Decoder crashes due to missing globals:
   add targeted `setupCode`.
3. Output is readable but naming is still poor:
   enable `mangleMode` with `hex`, `short`, or `custom` depending on the desired result.
4. Self-defending logic survives:
   rerun after adding environment stubs or after simplifying the guarded bootstrap path.
5. Control flow is still flattened:
   inspect the first-pass output, then rerun after isolating the real entry block or decoder.

## 6. Validate The Output

Do not stop at successful execution. Check that the output is actually useful:

1. The main business logic is visible without executing the original obfuscated bootstrap.
2. String literals are mostly readable.
3. Suspicious anti-debug loops and debugger traps are removed or isolated.
4. The transformed code can be searched and reasoned about structurally.
5. If needed, diff the input and output to confirm the relevant section became understandable.

## 7. Preserve The Winning Configuration

Once the correct strategy is found, convert it into a reproducible script:

- add a dedicated script under `example/` or project tooling if the sample is reusable
- record the chosen `decoderLocationMethod`
- record `decoderCallCount`, `decoderNames`, and `setupCode`
- note whether Node or browser sandbox assumptions were required

## Repository-Specific Commands

Quick run:

```bash
pnpm tmp
```

CLI on a file:

```bash
pnpm exec deob path/to/input.js -o ./out
```

The repository also includes:

- `tmp/input.js` and `tmp/output.js` for fast local iteration
- `example/` for real-world samples and configuration patterns
- `packages/deob/src/options.ts` for supported options and defaults

## Completion Criteria

The workflow is complete when:

1. The output exposes the business logic that was previously hidden.
2. The chosen options are explained, not guessed.
3. Any required setup code is minimal and documented.
4. The process can be rerun on the same sample without manual trial-and-error.

## Example Prompts

- Use js-deobfuscator to process this obfuscated file and decide whether `stringArray` or `callCount` is the right decoder strategy.
- 根据这个样本判断 js-deobfuscator 应该怎么配，尤其是 `decoderLocationMethod`、`decoderCallCount` 和 `setupCode`。
- Turn this ad-hoc reverse step into a reusable js-deobfuscator script for the sample under `example/`.