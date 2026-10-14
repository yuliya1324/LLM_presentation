# Slide notes: does CollabLLM get less lost in conversation?

For section 04 (Yash) and its backup slides only; other sections should not use these numbers. Files are in `ours/results/`; a field is a JSON path, `<a>` = assistant, `<s>` = setting. Numbers are exact; round only on the slides.
Percentages = field x 100. `[lo, hi]` = the field's sibling `ci95`, a 95% bootstrap CI over the 103 problems. A negative "drop - base" means less lost than vllm-base.

## Question and setup
- Question: does CollabLLM (ICML 2025; a LoRA on Llama-3.1-8B-Instruct trained with multi-turn-aware rewards to collaborate, e.g. ask clarifying questions) get less lost than its base model when a math problem arrives piece by piece?
- Benchmark: Lost in Conversation, its 103 GSM8K problems. `full` = the whole problem in one turn; `sharded` = one piece per turn, revealed by a GPT-4o-mini user simulator. GPT-4o-mini also labels every turn and extracts answers.
- Assistants, all on one vLLM server: vllm-base = Llama-3.1-8B-Instruct; vllm-collab = + CollabLLM's math LoRA; vllm-base+sys and vllm-collab+sys = the same with CollabLLM's system prompt prepended.
- Runs: 309 full and 515 sharded conversations per assistant (514 sharded for vllm-collab), `logs_topp0.9_rescored.json`: `assistants.<a>.<s>.n_conversations`. Sampling: temperature 1.0, top_p 0.9, 1,000-token cap per reply.
- Design, 2 x 2: adapter (none / CollabLLM's math LoRA) x prompt (none / CollabLLM's system prompt, App. D.3). Names on slides: Base, Base + prompt, CollabLLM, CollabLLM + prompt. Never call Base + prompt "Proactive Base": the paper's Proactive Base uses a different prompt (App. D.2).
- Simulated user (Lost in Conversation's `prompts/user_agent.txt`): told to be lazy and brief, reveals at most one piece per turn in its own words, never asks questions, and answers questions the pieces don't cover with "I don't know". The conversation ends at the first correct answer or after the reply to the last piece.
- Serving (our own deployment): all four assistants from one vLLM server on one RTX 3090 (24 GB), Llama-3.1-8B-Instruct in bf16 with CollabLLM's LoRA on top. The full run took 2 h 54 min for 3,296 conversations; GPT-4o-mini (user, turn labels and answer extraction) cost about $3.35.

## CollabLLM's system prompt (App. D.3; `collabllm/prompts/system_prompt.txt` at commit 7378aab; 245 words)
- Our "+ prompt" assistants put it, unchanged, in front of the benchmark's own system message.
- Key sentences, verbatim:
  - "The assistant is designed to be helpful, proactive, and highly interactive."
  - "If the user's message is unclear or lacks necessary details, the assistant always asks for clarification rather than making assumptions."
  - "The assistant asks specific follow-up questions and offers suggestions based on the user's needs, avoiding vague or generic prompts."
  - "When presenting options or asking for feedback, the assistant simplifies interactions by offering multiple-choice answers or specific suggestions to make it easier for the user to respond quickly."

## Example problem (Lost in Conversation data, `sharded-GSM8K/117`)
- Whole, one turn: "John buys 2 pairs of shoes for each of his 3 children. They cost $60 each. How much did he pay?" Correct answer: 360.
- Split, one piece per turn (the simulated user rephrases each piece):
  1. how much did John spend on shoes?
  2. John purchased 2 pairs of shoes.
  3. he bought those shoes for each of his 3 kids.
  4. each pair of shoes cost $60.
- Any answer before piece 4 has to guess the missing numbers.

## What we tested and why
- Lost in Conversation shows that models lose much accuracy when a task arrives over several turns, mostly by answering before they have all the information. CollabLLM is trained to collaborate instead, for example by asking clarifying questions, so it should lose less. We measure that, then ask why the answer came out as it did: the adapter check and the training labels.

## Accuracy, whole vs split, in % (re-scored; logged in parentheses)
Source: `logs_topp0.9_rescored.json`; parentheses: the same field in `logs_topp0.9.json`. Fields: `assistants.<a>.full.accuracy`, `assistants.<a>.sharded.accuracy`, `assistants.<a>.drop`, `assistants.<a>.sharded_minus_base.diff`, `assistants.<a>.drop_minus_base.diff`.

| assistant | full | sharded | drop | sharded - base | drop - base |
|---|---|---|---|---|---|
| vllm-base | 76.7 [70.2, 82.8] (74.1) | 42.9 [36.3, 49.5] (40.4) | 33.8 (33.7) | - | - |
| vllm-base+sys | 76.4 [70.2, 82.2] (71.2) | 46.2 [40.0, 52.4] (41.7) | 30.2 (29.4) | +3.3 [-1.9, +8.5] (+1.4) | -3.6 [-11.0, +3.8] (-4.3) |
| vllm-collab | 75.4 [68.3, 81.9] (72.8) | 43.1 [36.5, 49.7] (41.4) | 32.3 (31.5) | +0.2 [-5.0, +5.4] (+1.0) | -1.5 [-8.3, +5.4] (-2.3) |
| vllm-collab+sys | 74.8 [68.0, 81.2] (69.6) | 48.0 [41.0, 55.0] (43.7) | 26.8 (25.9) | +5.0 [-0.6, +10.9] (+3.3) | -7.0 [-13.9, -0.1] (-7.8) |

- Every assistant loses 26.8 to 33.8 points when the problem is split. No "sharded - base" CI excludes 0. The adapter alone: +0.2.
- Only vllm-collab+sys's "drop - base" CI excludes 0, by 0.1 point, and it is one of three comparisons with base: call it suggestive, not shown.

## Behaviour in sharded conversations (re-scored)
Source: `logs_topp0.9_rescored.json`. Turn shares (% of judged turns): `assistants.<a>.sharded.response_types.<type>`. Answer attempts: `assistants.<a>.sharded.answer_attempts.<field>`.

| assistant | clarification | interrogation | answer_attempt | discussion | per_conversation | share_before_last_shard | accuracy_before_last_shard | accuracy_after_last_shard |
|---|---|---|---|---|---|---|---|---|
| vllm-base | 2.8 | 4.5 | 46.0 | 40.7 | 2.47 | 77.8 | 11.8 | 36.9 |
| vllm-base+sys | 10.1 | 26.4 | 29.3 | 31.6 | 1.57 | 68.0 | 19.9 | 50.0 |
| vllm-collab | 3.7 | 4.3 | 47.4 | 39.0 | 2.56 | 76.4 | 9.3 | 41.2 |
| vllm-collab+sys | 11.7 | 26.2 | 30.7 | 29.6 | 1.63 | 71.3 | 20.2 | 52.3 |

- clarification = one short question; interrogation = several questions at once; per_conversation = answer attempts per conversation; before/after the last shard = before/after the last piece was revealed (before = premature). All columns except per_conversation are %.
- Turns that ask a question = clarification + interrogation (sum of the rounded columns, %): vllm-base 7.3, vllm-base+sys 36.5, vllm-collab 8.0, vllm-collab+sys 37.9.
- CollabLLM's system prompt makes the model ask (interrogation 26.2-26.4% vs 4.3-4.5%), answer less often (1.57-1.63 vs 2.47-2.56 attempts) and less prematurely, and its answers once everything is known are right more often (50.0-52.3% vs 36.9-41.2%). The adapter alone moves each turn share and the premature share by under 2 points (accuracy after the last piece: 41.2% vs 36.9%).

## The adapter check (`adapter_check.json`)
Weights: ||dW|| / ||W|| (Frobenius), dW = (lora_alpha / r) * B * A, over each adapter's adapted matrices. Fields: `weight_space.<adapter>.median_ratio`, `.max_ratio`, `.max_matrix`, `.n_matrices`.

| adapter | median | max | largest change | matrices |
|---|---|---|---|---|
| math | 0.0584% | 0.0948% | model.layers.2.self_attn.v_proj.weight | 224 |
| code | 0.0526% | 0.0959% | model.layers.0.self_attn.v_proj.weight | 224 |
| writing | 0.0635% | 0.1003% | model.layers.0.self_attn.v_proj.weight | 224 |

- Learned preferences, math adapter on 300 pairs (`preferences.n_pairs`), scored in CollabLLM's training format (its system prompt + the conversation): DPO implicit-reward margin +3.71 nats [+3.05, +4.38] (`preferences.mean_margin`, `preferences.ci95`); above 0 in 71.7% of pairs (`preferences.share_above_0`). Split: log pi_collab - log pi_base is +0.19 for chosen replies (`preferences.mean_logratio_chosen`) and -3.52 for rejected ones (`preferences.mean_logratio_rejected`): the adapter mostly learned what to avoid.
- Caveat: the pairs come from collabllm-multiturn-math-hard-large, CollabLLM's released math data. Whether this adapter was trained on these exact pairs is not documented, so this measures fit, not generalization.
- Message: a tiny weight change that does encode CollabLLM's preferences, yet barely changes behaviour in Lost in Conversation.

## Label noise in CollabLLM's math preference pairs (`label_noise.json`)
- 5054 rows (`rows`) form 2527 pairs (`pairs`), with 14 score ties (`score_ties`). Each score averages 3 simulated sessions (label_noise.py: `SESSIONS`). Table 5 reproduced: chosen 0.8637, rejected 0.5473 (`table5.chosen_mean`, `table5.rejected_mean`); the paper's 0.863 and 0.547 when truncated to 3 decimals, with the ties kept.
- Chance that 3-session noise flips a pair, Phi(-gap / SE): mean 15.3% (`noise.mean_flip_chance`); gap under one SE (z < 1) in 40.1% of pairs (`noise.share_z_below_1`); mean gap 0.316 (`noise.mean_gap`). Pairs CollabLLM's offline DPO keeps (gap >= 0.02): 2356 pairs, 13.3% flip chance, 36.2% with z < 1 (`noise_offline_dpo_pairs.pairs`, `.mean_flip_chance`, `.share_z_below_1`).
- Correctness (`correctness.<k>`): equally correct 1516 (60.0%), chosen more correct 1004 (39.7%), chosen less correct 7 (0.3%).

| pairs (`noise_by_correctness.<k>`) | pairs | mean_gap | mean_flip_chance | share_z_below_1 |
|---|---|---|---|---|
| equally correct | 1516 | 0.132 | 17.6% | 45.5% |
| different correctness | 1011 | 0.592 | 11.8% | 31.9% |

- Message: when correctness differs, the label follows it. The 60% of pairs that are equally correct, decided by interaction style and length alone, have small gaps and are the noisiest: the signal meant to teach collaboration is the least reliable.

## How we measured (formulas)
- Adapter size: ||dW|| / ||W|| (Frobenius norms) per adapted matrix, dW = (lora_alpha / r) * B * A; median over the 224 matrices.
- DPO margin per pair: [log pi_collab(chosen) - log pi_base(chosen)] - [log pi_collab(rejected) - log pi_base(rejected)], in nats, scored in CollabLLM's training format. Above 0 = the adapter prefers the chosen reply more than the base model does.
- Flip chance per pair: Phi(-gap / SE), where gap = chosen score - rejected score and SE = sqrt((sd_chosen^2 + sd_rejected^2) / 2), with population standard deviations over the 3 sessions (the standard error of the difference of two 3-session means). z < 1 means gap < SE.

## Validity checks
- Paper match at top_p 1.0 (pilot: vllm-base, 1 run per problem, `logs_topp1.0.json`): full 68.0 [59.2, 76.7], sharded 39.8 [31.1, 49.5] (`assistants.vllm-base.full.accuracy`, `assistants.vllm-base.sharded.accuracy`) vs the paper's 63.9 and 37.4 (from CLAUDE.md, not a JSON).
- Why top_p 0.9: at 1.0, 5.8% of full and 9.3% of sharded replies ran to the token cap, mostly as gibberish (`logs_topp1.0.json`: `assistants.vllm-base.<s>.capped_share`); at 0.9, 0.3-1.7% in every cell (`logs_topp0.9_rescored.json`: `assistants.<a>.<s>.capped_share`).
- Scoring fix 1, extraction: answers must be copied verbatim, and GPT-4o-mini likely drops thousands separators. Failed extractions: 360 of 1092 (33.0%) when the correct answer is >= 1000, vs 58 of 4403 (1.3%) below (`logs_topp0.9.json`: `extraction_failures."gold >= 1000"`, `extraction_failures."gold < 1000"`). After ours/rescore.py: 2 of 1068 (0.2%) and 21 of 4401 (0.5%) (`logs_topp0.9_rescored.json`, same fields).
- Scoring fix 2, evaluator: upstream task_math.py trims cents with rstrip(".00"), turning "$720.00" into 72; fixed with removesuffix.
- Effect of both fixes: 115 conversations re-scored correct; now_incorrect 0, unresolved 0 (sums of `logs_topp0.9_rescored.json`: `assistants.<a>.<s>.rescore.now_correct`, `.now_incorrect`, `.unresolved`). The served adapter works: it ranks CollabLLM's chosen replies higher (adapter check).

## Limitations
- 103 problems: accuracy CIs are about +/-6-7 points and differences +/-5-7, so 3-5-point effects cannot be confirmed; three comparisons with base.
- Remaining scoring bias: an answer followed by a question can still be labelled a non-answer, which hurts the +sys assistants most, so their numbers are conservative.
- Scope: one task (GSM8K math), one 8B model, one adapter (CollabLLM's only math adapter; its model card is empty). 1 of 3,296 conversations is missing (context overflow).
- top_p 0.9 departs from the paper's sampling; the top_p 1.0 pilot is the paper-comparable run. GPT-4o-mini may now be a newer snapshot than the paper's.
- Flip chances use a normal approximation on 3 sessions: read them as sizes, not exact rates.
