# Glossary: terms and notation for the talk

Use these exact spellings on every slide. Where the paper is inconsistent, the choice made here
is marked **(talk choice)**.

## Names

| Use | Not | Meaning |
|---|---|---|
| **CollabLLM** | Collab LLM, CollabLLMs as a method name | The framework (paper typesets it in small caps). Plural "CollabLLM models" for the trained variants. |
| **Multiturn-aware Reward (MR)** | multi-turn reward, MTR | The reward a response gets for its expected effect on the rest of the conversation (Eq. 1, p. 3). Spell out on first use, then "MR". |
| **multiturn** | multi-turn | One word, as in the paper (the blog writes "multi-turn"; ignore). |
| **collaborative simulation** | rollout simulation | Step ③ of Fig. 1: forward sampling + reward computation. |
| **forward sampling** | lookahead | Simulating future turns after a response. |
| **user simulator** | simulated human, user model | LLM role-playing the user with a hidden goal (GPT-4o-mini in the paper). |
| **policy (model)** | agent | The LLM being trained, $\pi_\theta(y \mid x)$ in Fig. 1. |
| **Base** | vanilla, Llama | Baseline: Llama-3.1-8B-Instruct, no fine-tuning. |
| **Proactive Base** | prompted baseline | Base + a prompt asking for clarification / follow-up questions. |
| **non-collaborative LLM** | standard LLM | Wording of Fig. 2 / Fig. 5 for models trained on single-turn rewards. |
| **passive responder** / **active collaborator** | — | Title framing; use for the before/after contrast. |
| **single-turn reward** / **next-turn reward** | immediate reward (except in ablation) | What RLHF optimises. "Immediate reward" is used only for the ablation baselines (Fig. 4). |

## Model variants (Table 1)

**SFT**, **PPO**, **Offline DPO**, **Online DPO**: written exactly like this. "Offline" = trained on
pre-generated MR-ranked data; "online" = MR computed on the model's own responses during
training. When one number must represent CollabLLM, use **Online DPO** — it is the variant
behind *Rel. Improv.* and the headline percentages **(talk choice)**.

## Tasks and metrics

| Use | Meaning |
|---|---|
| `MediumDocEdit-Chat` (short: **Document editing** / Doc) | 100 Medium articles; metric **BLEU** |
| `BigCodeBench-Chat` (short: **Coding** / Code) | 600 BigCodeBench problems; metric **Pass Rate (PR)** |
| `MATH-Chat` (short: **Math**) | 200 level-5 MATH problems; metric **Accuracy (ACC)** |
| **Abg-CoQA** | Ambiguity QA benchmark for zero-shot generalization (paper also writes Abg-CoQa — use Abg-CoQA) |
| **#Tokens (k)** | Tokens per conversation, in thousands; lower is better ("efficiency") |
| **ITR** — Interactivity | LLM-judge (Claude-3.5-Sonnet) engagement score |
| **task performance** | BLEU / PR / ACC collectively |

Full dataset names in monospace on first mention, then the short names.

**ITR scale (talk choice):** show ITR on a **0–1 scale** (0.46 → 0.92), as the paper's text
(p. 5) and Figs. 4, 6, 9 do. Table 1 prints the same values ×100 (46.0 → 92.0); if a slide
reproduces Table 1 verbatim, keep its ×100 values and say so in the axis label. Never mix
the two on one slide.

**Direction arrows:** ↑ higher is better, ↓ lower is better — put them in axis labels /
table headers like the paper.

## Notation (Sec. 2–3, p. 2–4)

| Symbol | Meaning |
|---|---|
| $g$ | user's implicit goal |
| $u_j$, $m_j$ | user input and model response at turn $j$ |
| $t_j = \{u_j, m_j\}$ | turn $j$; $K$ = number of turns |
| $t^h_j = t_{1:j-1} \cup \{u_j\}$ | history the model sees at turn $j$ |
| $t^f_j = t_{j+1:K}$ | forward trajectory (future turns) |
| $R^*(t \mid g)$ | conversation-level reward |
| $R_{\text{ext}}(t, g) = S(\mathrm{Extract}(t), y_g)$ | extrinsic reward (task success vs reference $y_g$) |
| $R_{\text{int}}(t) = -\min[\lambda\,\mathrm{TokenCount}(t), 1] + R_{\text{LLM}}(t)$ | intrinsic reward (efficiency + LLM-judged interactivity) |
| $\lambda$ | token penalty (1e-4 Doc, 5e-4 Code/Math) |
| $\mathrm{MR}(m_j \mid t^h_j, g)$ | multiturn-aware reward |
| $w$ | forward window size — number of future turns sampled; $w=2$ in all main results; $w=0$ = immediate extrinsic + intrinsic reward |
| $U$ | user simulator |
| $\pi_\theta(y \mid x)$ | policy (Fig. 1 uses $x$ = context, $y$ = response) |

Write "$w = 2$" with the italic $w$ (KaTeX), not "window=2".

## Headline numbers (say them the same way everywhere)

- **+18.5%** task performance, **+46.3%** interactivity, **13.3%** more efficient (fewer tokens) —
  "vs the best baseline (Proactive Base), averaged over the three tasks" (p. 1, p. 5).
- User study: **201** participants; **+17.6%** user satisfaction; **10.4%** less time (vs Base).
- Abg-CoQA: asks on ambiguous inputs **52.84%** vs **16.26%** for Llama-3.1-8B-Instruct.
