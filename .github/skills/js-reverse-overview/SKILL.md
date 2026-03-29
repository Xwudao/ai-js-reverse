---
name: js-reverse-overview
description: 'Use when doing JavaScript reverse engineering end-to-end. Combines Playwright MCP for runtime/browser capture with js-deobfuscator for AST deobfuscation, decoder recovery, anti-debug cleanup, and readable output recovery.'
argument-hint: 'Describe the target site or script, what you already captured, and whether the next step is browser observation, script extraction, or deobfuscation.'
user-invocable: true
---

# JS Reverse Overview

## What This Skill Does

This skill provides a high-level workflow for JavaScript reverse engineering in this workspace.

It combines two primary capabilities:

1. Playwright MCP for observing runtime behavior in the browser.
2. js-deobfuscator for converting obfuscated JavaScript into a readable form.

Use this skill to decide which tool to apply first, what artifacts to collect, and how to move from runtime observation to static recovery.

## When To Use

Use this skill for requests involving:

- js逆向
- JavaScript reverse engineering
- captcha/signature analysis
- browser-side algorithm recovery
- packed or obfuscated frontend code
- anti-debug or environment checks
- runtime script capture followed by AST cleanup

## Tool Selection

### Use Playwright MCP First When

1. The target algorithm is only reachable after browser interaction.
2. You need to inspect requests, responses, DOM state, storage, or runtime globals.
3. The page dynamically loads scripts or computes values after user actions.
4. You need to reproduce a captcha, signing flow, or token generation path.

Primary outputs from this stage:

- target URLs and request payloads
- loaded script URLs or inline script bodies
- relevant cookies, storage, or runtime values
- reproduction steps that consistently trigger the algorithm

### Use js-deobfuscator First When

1. The target script is already available locally.
2. The main blocker is unreadable obfuscated code rather than runtime discovery.
3. The algorithm is embedded in a bundled file with clear decoder patterns.
4. You need to remove string encoding, control-flow flattening, or anti-debug logic.

Primary outputs from this stage:

- readable JavaScript
- located decoder functions and setup assumptions
- extracted business logic suitable for reimplementation

## End-To-End Procedure

### 1. Define The Objective

State exactly what must be recovered:

- a request signature
- a captcha token
- a parameter transformation
- an encryption or hashing pipeline
- the minimal pure implementation in Node, Python, or Go

### 2. Collect Runtime Evidence

If the target depends on browser execution, use Playwright MCP to:

1. open the relevant page or flow
2. reproduce the action that triggers the target request
3. capture network requests and identify the exact endpoint and payload
4. inspect loaded scripts and runtime objects related to the algorithm

Do not start reimplementation before the trigger path is stable.

### 3. Extract The Relevant Script

After runtime observation, isolate the smallest code unit that appears to generate the value of interest:

- a bundled script file
- an inline script block
- a webpack module body
- a function copied from DevTools/runtime evaluation

Reduce scope early. Do not deobfuscate the entire application if one module is enough.

### 4. Deobfuscate Structurally

Run js-deobfuscator on the extracted code:

1. try a fast first pass
2. tune decoder options if strings remain encoded
3. inject minimal `setupCode` only if execution context is required
4. rerun until the core logic is readable

If needed, use the dedicated js-deobfuscator skill for the detailed option-selection workflow.

### 5. Trace The Real Algorithm

Once the code is readable, identify:

1. inputs: payload fields, timestamps, device identifiers, browser state
2. transformations: concatenation, sort/join, encode, hash, encrypt, serialize
3. hidden dependencies: environment checks, random seeds, cookies, local storage
4. output assembly: final header, query parameter, or request body field

### 6. Reimplement Minimally

Prefer a pure implementation with no browser dependency if possible.

Preferred language order for this workspace:

1. Node.js
2. Go
3. Python

The reimplementation should contain only the necessary logic, not the entire original bootstrap.

### 7. Verify Against Real Traffic

Validation must include at least one real comparison:

1. same inputs produce the same signature or token
2. known request payload matches the browser-generated value
3. environmental assumptions are explicitly documented

## Decision Rules

Use this branching logic:

1. No script yet, only a webpage or request flow:
   start with Playwright MCP.
2. Script available but unreadable:
   start with js-deobfuscator.
3. Script is readable but behavior depends on runtime values:
   use both, with Playwright MCP first for evidence, then js-deobfuscator for cleanup.
4. Reimplementation diverges from browser output:
   go back to runtime capture and check hidden inputs before editing the algorithm further.

## Completion Criteria

The reverse task is complete when:

1. the exact source of the target value is identified
2. the relevant logic is readable and reduced to the essential path
3. a standalone implementation exists in the preferred language
4. the standalone implementation has been checked against observed browser output

## Example Prompts

- 先用 Playwright MCP 帮我定位这个站点里 `captcha_sign` 是在哪个脚本里生成的，再切到 js-deobfuscator 清理代码。
- I have an obfuscated bundle and one target request. Decide whether to start with browser observation or AST deobfuscation.
- 用总览流程带我做一次 js逆向：抓运行时证据、提取目标脚本、反混淆、最后落成纯 Node 实现。