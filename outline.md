# Talk outline

Paper: CollabLLM: From Passive Responders to Active Collaborators (Wu et al., ICML 2025 Outstanding Paper) (https://arxiv.org/abs/2502.00640)
Repo: https://github.com/Wuyxin/collabllm  |  Website / demo: https://wuyxin.github.io/collabllm/ (blog: https://wuyxin.github.io/collabllm/#blog; no live demo)
Talk: 20 min, about 22 slides

| File | Owner | Slides | Covers |
|---|---|---|---|
| sections/00-title.html | Iuliia | 1 | Title |
| sections/01-motivation.html | Iuliia | 2 | Problem, why it matters, what authors propose |
| sections/02-method.html | Iuliia | 3 | Method, key idea, architecture |
| sections/03-results.html | Elgun | 6 | Setup, main results, ablations, user study, takeaways |
| sections/04-ablations.html | Yash | 9 | Limitations, follow-up work and our own tests |
| sections/05-harness.html | Iuliia | 1 | How we built harness for these slides |
| sections/06-appendix_title.html | Iuliia | 1 | Appendix title |
| sections/07-appendix_results.html | Elgun | 1 | Appendix for results |
| sections/08-appendix_ablations.html | Yash | 5 | Backup for our tests |
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
- results-1: 

### 04-ablations (Yash)
About 6 minutes: 9 slides of about 40 s. Part 1 (ablations-1 to -3): what the paper leaves open and who is fixing it. Part 2 (ablations-4 to -9): our own test.
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
- ablations-2: +46.3% interactivity is +0.07 to +0.15 points on the judge's own 1–3 scale [TWO COLUMNS, two bar charts of the same scores, Proactive Base vs CollabLLM per task: as reported (0–1) and on the judge's 1–3 scale (min 1, max 3); one line: "+17.6% satisfaction" matches the gap in "very good" ratings, 56.9% vs 39.3%, while the mean rating rose 4.2%]
- ablations-3: Three gaps in the evaluation shaped our test [CARDS, one per click, each a gap and our answer: the released eval script gives CollabLLM a proactive system prompt → we test adapter and prompt separately; no error bars (math 12.5 → 16.5 on 200 problems) → we report 95% CIs; its own simulator and tasks → we use another team's benchmark]
- ablations-4: Given a problem in pieces, Llama-3.1-8B drops from 77% to 43% correct [VERSUS: "Whole" chat with the full example problem from our_experiments.md; "Split" chat with its 4 pieces as user turns and a dim "…" for each reply; verdicts: Base 76.7% vs 42.9% correct over 103 problems. Notes: the lazy simulated user, and that this reproduces the benchmark's published drop]
- ablations-5: CollabLLM loses just as much: every assistant drops 27 to 34 points [BAR CHART: Whole vs Split; Base first, then the other three on clicks; one line naming the 2 × 2 design; one line with the CIs]
- ablations-6: The prompt, not the adapter, makes the model ask first and answer right more often [TABLE: turns that ask, answers per conversation, correct once all pieces are in; mark the best value in each column]
- ablations-7: The adapter learned CollabLLM's preferences, but it is a 0.06% weight change that barely changes behaviour here [STATS: 0.06%, 72%, under 2 points. Notes: the learning-rate caveat, and that we can't confirm these were its exact training pairs]
- ablations-8: 60% of training pairs are decided by style alone, and their labels are the noisiest [STATS: 60%, 18% flip chance, 45.5% within one standard error, each with its value for pairs that differ in correctness; write 18%, not 17.6%, so it isn't confused with the +17.6% on ablations-2]
- ablations-9: In our test, collaboration came from the prompt, and the training signal was noisy [STATEMENT, band; one line: next, Found in Conversation (2026, CollabLLM's first author) keeps ≥92% of single-turn performance with self-distillation. Notes: a three-sentence summary, then hand over to Iuliia's harness slide]

### 05-harness (Iuliia)
- harness-1: Describe how your harness works to make these slides. Show the structure of the repo, rules and the workflow: fetch resources -> write a plan -> draft slides -> iterate on them. Keep it minimal, don't make the slide overflow. Connect parts to each other.

### 06-appendix_title (Iuliia)
- appendix_title-1: One word on a slide "Appendix"

### 08-appendix_ablations (Yash)
Backup slides for questions, not presented. Same rules as 04.
- appendix_ablations-1: Our setup reproduces the benchmark's published baseline [TABLE: the paper's 63.9 / 37.4 vs our top_p 1.0 pilot with CIs; one line on why we used top_p 0.9]
- appendix_ablations-2: We fixed two scoring bugs in the benchmark, which turned 115 conversations correct [CARDS: thousands separators; rstrip(".00"); conclusions unchanged]
- appendix_ablations-3: All accuracy numbers with 95% CIs [TABLE: per assistant, whole, split, drop, split vs Base, drop vs Base; logged values in parentheses]
- appendix_ablations-4: How we measured the adapter and the label noise [EQUATION or CARDS: the three formulas in our_experiments.md]
- appendix_ablations-5: More issues in the released code and paper [CARDS: character-level BLEU; LoRA learning rates; the IJCAI-26 correction from 46.3% to 44.3%]

### 09-appendix_harness (Iuliia)
- appendix_harness-1: Schema of folder structure
- appendix_harness-2: Example of a skill, e.g. ingest