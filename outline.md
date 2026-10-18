# Talk outline

Paper: CollabLLM: From Passive Responders to Active Collaborators (Wu et al., ICML 2025 Outstanding Paper) (https://arxiv.org/abs/2502.00640)
Repo: https://github.com/Wuyxin/collabllm  |  Website / demo: https://wuyxin.github.io/collabllm/ (blog: https://wuyxin.github.io/collabllm/#blog; no live demo)
Talk: 20 min, about 22 slides

| File | Owner | Slides | Covers |
|---|---|---|---|
| sections/00-title.html | Iuliia | 1 | Title |
| sections/01-motivation.html | Iuliia | 2 | Problem, why it matters, what authors propose |
| sections/02-method.html | Iuliia | 3 | Method, key idea, architecture |
| sections/03-results.html | Elgun | 6 | Setup, task scores, efficiency and interactivity, user study, generalization, safety |
| sections/04-ablations.html | Yash | 5 | Limitations, follow-up work and our own tests |
| sections/05-harness.html | Iuliia | 1 | How we built harness for these slides |
| sections/06-appendix_title.html | Iuliia | 1 | Appendix title |
| sections/07-appendix_results.html | Elgun | 1 | Paper reward ablation and forward-window trade-off (Q&A) |
| sections/08-appendix_ablations.html | Yash | 11 | Backup for our tests |
| sections/09-appendix_harness.html | Iuliia | 2 | Appendix for harness |

## Slide plan

One line per slide: id, then the single message the slide makes.
Layout and source in brackets are only suggestions. Facts are in `sources/notes/paper.md`.

### 00-title (Iuliia)
- title-1: Title from the paper + Presented by Iuliia Korotkova, Yash Bhardwaj, Elgun Hasanov

### 01-motivation (Iuliia)
- motivation-1: Split the slide in two parts. In one part show an example of a chat where the user needs to iteratively change the output of the LLM and is unsatisfied with the tone, examples, and the LLM goes back and forth. In another part an example that shows over-enginnered prompt where the user had to describe every detail to get the right answer, and the user still needs to twick a bit the result. Then remove the right part and substitute it with CollabLLM interaction where LLM interactively asks for refinement before giving the final answer. You can use an example from Figure 2, p. 2. Make the dialogues with animations: one message appears after another. The title: Do you also chat with LLMs like this? (or formulate a question in a better way to make it teasing)
- motivation-2: why this happens and how CollabLLM fixes this. This happens because of a single turn RLHF. CollabLLM propose a multi-turn reward. Use the graph from figure 2 to illustrate the difference in training techniques.

### 02-method (Iuliia)
- method-1: Multi-turn aware reward, idea, formulation, notations.
- method-2: Conversation level reward, extrinsic and intrinsic rewards, forward sampling, all with visualisations.
- method-3: Optimization & Synthetic Datasets. How the dataset is constructed  -- you can use Appendix graphs for animated visualisations. What methods they use: SFT, PPO, offline DPO, online DPO.

### 03-results (Elgun)
About 6 minutes: 55 / 70 / 60 / 65 / 60 / 50 seconds. Speaker notes are in English.
Summary: report the paper's evidence, from simulated tasks to real users, transfer and safety. Keep the method in Iuliia's section and our own experiments and detailed critique in Yash's section.
- results-1: Three tasks test collaboration over several turns [STATS, band; 100 MediumDocEdit-Chat articles / BLEU, 600 BigCodeBench-Chat problems / pass rate, 200 level-5 MATH-Chat problems / accuracy; same Llama-3.1-8B-Instruct family, GPT-4o-mini user simulator; Sec. 4, p. 4–5]
- results-2: Every trained variant improves task scores over both baselines [FIGURE; original Table 1 cropped to all six model rows, leaving out Rel. Improv.; PPO leads writing and coding, Online DPO leads math; retain ITR ×100 as in the source; p. 6]
- results-3: Online DPO uses fewer tokens and is more interactive [TWO COLUMNS, charts; Proactive Base vs Online DPO across Doc / Code / Math; tokens in thousands, ITR on 0–1 scale; use exact task-level values instead of the disputed headline percentage; Table 1, p. 6]
- results-4: Real users give higher ratings and spend less time [FIGURE; original Fig. 7 panels a–c, with model order stated; 201 participants, document ratings 8.16 / 8.38 / 8.50, interaction ratings 8.11 / 8.46 / 8.60, times 1237 / 1319 / 1108 seconds; −10.4% vs Base; p. 7–8]
- results-5: Clarification transfers to QA, with more unnecessary questions [BAR CHART; GPT-4o / Base / CollabLLM correct actions on ambiguous and clear questions; coding-trained Online DPO, zero-shot Abg-CoQA; Table 2, p. 7; action choice is not answer correctness]
- results-6: Both models pass 99.7% of safety checks [FIGURE, band; original Table 8; 80 adversarial queries × 4 evaluators = 320 checks per model, 319 pass for each; no detected degradation in this limited test, no claim of general safety superiority; App. C, p. 16–17; hand over to Yash]

Use only existing template layouts. Original paper crops retain the data and labels; detailed explanations and caveats belong in speaker notes. No edits to other presenters' sections or the shared template.

### 04-ablations (Yash)
About 4 minutes: 5 slides. Part 1 (ablations-1): what the paper leaves open and who is fixing it. Part 2 (ablations-4, -5, -6 and -9): our own test.
Rules for this section:
- Facts come from `limitations_and_followups.md` (part 1) and `our_experiments.md` (part 2).
- Names: Base, Base + prompt, CollabLLM, CollabLLM + prompt. "Prompt" means CollabLLM's system prompt (App. D.3). Never call Base + prompt "Proactive Base", which is the paper's baseline with a different prompt.
- Colours: CollabLLM + prompt = ours, CollabLLM = ours2, Base + prompt = base, Base = base2. In part 1, Proactive Base = base, CollabLLM = ours.
- Statistics: give 95% CIs in brackets. Call an effect "suggestive" when its CI includes 0; never write "significant" unless it excludes 0.
- Don't re-explain MR, forward sampling or chosen vs rejected replies: point back to method-3 (simulated futures, sampled 3 times per reply), method-5 (chosen vs rejected) and method-7 (LoRA on Llama-3.1-8B, in its notes).
- Fair tone: limitations are open questions about the evidence, not accusations. Say so when the authors acknowledge one.
- Explain each new term in a few words when it first appears: piece (shard), LoRA adapter, DPO margin, standard error.
- Source lines: the paper's page, the later paper's name and year, "Our runs: Lost in Conversation, 103 GSM8K problems", or "Our analysis of CollabLLM's released training data".
- Speaker notes: about 80 words per slide.
- ablations-1: Later papers already target three of CollabLLM's open problems [band; TABLE with columns open problem, later paper, how: simulated users are easier than real ones → UserLM-8b, trained on real chats (GPT-4o 74.6 → 57.4); asks on 27.7% of clear questions → PPP, whose reward counts the user's effort per question; its multiturn benchmarks use its own simulator → Lost in Conversation, another team's benchmark where 15 LLMs lose 39%. SimulatorArena and Lost in Simulation go in the notes]
- ablations-4: Given a problem in pieces, Llama-3.1-8B drops from 77% to 43% correct [VERSUS: "Whole" chat with the full example problem from our_experiments.md; "Split" chat with its 4 pieces as user turns and a dim "…" for each reply; verdicts: Base 76.7% vs 42.9% correct over 103 problems. Notes: the lazy simulated user, and that this reproduces the benchmark's published drop]
- ablations-5: The adapter alone doesn't reduce the drop: every assistant loses 27 to 34 points [BAR CHART: Whole vs Split; Base first, then the other three on clicks; one line naming the 2 × 2 design; one line with the CIs. Notes: only CollabLLM gets its prompt in the paper's evaluation, hence testing them separately; the adapter is active (72% of pairs, backup)]
- ablations-6: Asking first comes from the prompt, not the adapter [TABLE: turns that ask, answers per conversation, correct once all pieces are in; ↑ and best mark only on the last column]
- ablations-9: In our test, CollabLLM's collaboration came from its prompt, not its training [STATEMENT, band; one line: next, Found in Conversation (2026, CollabLLM's first author) keeps ≥92% of single-turn performance with self-distillation. Notes: every assistant still drops 27 to 34 points; training alone makes no clear difference; the asking came from the prompt; caveat: one task, one model, 103 problems; then hand over to Iuliia's harness slide]

### 05-harness (Iuliia)
- harness-1: Describe how your harness works to make these slides. Show the structure of the repo, rules and the workflow: fetch resources -> write a plan -> draft slides -> iterate on them. Keep it minimal, don't make the slide overflow. Connect parts to each other.

### 06-appendix_title (Iuliia)
- appendix_title-1: One word on a slide "Appendix"

### 07-appendix_results (Elgun)
One backup slide for Q&A, outside the six-minute section.
- appendix_results-1: Two forward turns balance gains and sampling cost [FIGURE; original Fig. 4, p. 6; MR w=2 gives BLEU 0.373 / 1.85k tokens / ITR 0.70; w=3 gives 0.373 / 1.84k / 0.68; Table 7, p. 15 for sampling cost; distinguish these paper ablations from Yash's own tests, and note the Fig. 4 vs Fig. 9 discrepancy in speaker notes]

### 08-appendix_ablations (Yash)
Backup slides for questions, not presented. Same rules as 04.
- appendix_ablations-1: How we ran it: one GPU, four assistants, 3,296 conversations [FLOW: GPT-4o-mini plays the user → one vLLM server on an RTX 3090 serves Llama-3.1-8B, with or without CollabLLM's LoRA and its prompt → GPT-4o-mini labels each turn and extracts answers → our re-scoring and 95% bootstrap CIs over the 103 problems; one line: 2 h 54 min, about $3.35 of API calls]
- appendix_ablations-2: Our setup reproduces the benchmark's published baseline [TABLE: the paper's 63.9 / 37.4 vs our top_p 1.0 pilot with CIs; one line on why we used top_p 0.9]
- appendix_ablations-3: We fixed two scoring bugs in the benchmark, which turned 115 conversations correct [CARDS: thousands separators; rstrip(".00"); conclusions unchanged]
- appendix_ablations-4: All accuracy numbers with 95% CIs [TABLE: per assistant, whole, split, drop, split vs Base, drop vs Base; logged values in parentheses]
- appendix_ablations-5: What the prompt changes, turn by turn [TABLE: per assistant, clarification, interrogation, answer attempt and discussion (% of turns), answers per conversation, share of answers given before the last piece, their accuracy, accuracy after the last piece; one line defining clarification vs interrogation]
- appendix_ablations-6: CollabLLM's prompt tells the model to ask instead of assume [QUOTES: the key sentences quoted in our_experiments.md; one line: 245 words, put unchanged in front of the benchmark's system message]
- appendix_ablations-8: Label noise in detail [TABLE: equally correct vs different correctness: pairs, mean gap, flip chance, share within one SE; one line each for the pairs offline DPO keeps (gap ≥ 0.02) and our reproduction of the paper's Table 5]
- appendix_ablations-9: How we measured the adapter and the label noise [EQUATION or CARDS: the three formulas in our_experiments.md]
- appendix_ablations-10: More issues in the released code and paper [CARDS: character-level BLEU; LoRA learning rates; the IJCAI-26 correction from 46.3% to 44.3%]
- appendix_ablations-11: The adapter learned CollabLLM's preferences but barely changes behaviour [STATS, moved from ablations-7: 0.06% median weight change, 72% of 300 pairs favour the chosen reply more than Base, +0.7 points more asking turns (7.3% → 8.0%). Notes: the learning-rate caveat, and that we can't confirm these were its exact training pairs]
- appendix_ablations-12: +46.3% interactivity is +0.07 to +0.15 points on the judge's real 1–3 scale [TWO COLUMNS, static (both charts and the bullet visible at once), moved from ablations-2; two bar charts of the same scores, Proactive Base vs Online DPO per task, matching Elgun's results-3: as reported (0–1) and on the judge's 1–3 scale (min 1, max 3); one line: "+17.6% satisfaction" matches the gap in "very good" ratings, 56.9% vs 39.3%, while the mean rating rose 4.2%. Notes: a short Q&A answer that says "the judge's real scale"]

### 09-appendix_harness (Iuliia)
- appendix_harness-1: Schema of folder structure
- appendix_harness-2: Example of a skill, e.g. ingest
