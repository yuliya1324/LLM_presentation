# CollabLLM: From Passive Responders to Active Collaborators

Shirley Wu, Michel Galley, Baolin Peng, Hao Cheng, Gavin Li, Yao Dou, Weixin Cai,
James Zou, Jure Leskovec, Jianfeng Gao. Stanford University, Microsoft, Georgia Tech.
ICML 2025, Outstanding Paper Award (repo README; project page).
arXiv 2502.00640 (version downloaded: LaTeX source dated 31 Jul 2025). PDF: `sources/paper.pdf`,
LaTeX: `sources/latex/`.

Page numbers below are PDF pages of `sources/paper.pdf` (24 pages). Pages 1–9 are the main
paper, 10–13 references/impact statement, 14–24 the appendix.

---

## Summary (p. 1, Abstract)

LLMs are usually trained with **next-turn rewards**, so they answer ambiguous or open-ended
requests passively and do not help users reach their real intent. CollabLLM is a general
training framework for **multiturn human–LLM collaboration**. Its main idea is a
**collaborative simulation** that estimates how much a response contributes to the rest of the
conversation, called the **Multiturn-aware Reward (MR)**. Fine-tuning on MRs with RL makes the
model ask about intent and make suggestions instead of only answering. On a new multiturn benchmark
with three tasks, CollabLLM beats the best baseline by **18.5%** in task performance and
**46.3%** in interactivity (LLM judges). In a user study with **201** MTurk participants, it
**increases user satisfaction by 17.6%** and **reduces time spent by 10.4%** (p. 1).

## Problem (p. 1–2, Sec. 1–2)

- Real users rarely state their full intent up front and refine requests after the fact. This
  causes frustration, worse task completion and less efficient conversations (p. 1, Sec. 1).
- RLHF and similar fine-tuning reward **immediate, single-turn** responses. Models therefore
  have little reason to ask for clarification and tend to answer directly (p. 1, Sec. 1).
- Formally (p. 2, Sec. 2): the user has an implicit goal $g$. The conversation has turns
  $t_j = \{u_j, m_j\}$ for $j = 1..K$ ($u_j$ user input, $m_j$ model response). The history at
  turn $j$ is $t^h_j = t_{1:j-1} \cup \{u_j\}$ and the model responds with $m_j = M(t^h_j)$. The
  objective is the conversation-level reward $R^*(t_{1:K} \mid g)$, which covers both task
  success and user experience such as time cost.
- Mismatch (p. 3, Sec. 3 "Key Motivations"): a high cumulative single-turn reward
  $\sum_{j=1}^{K} R(m_j \mid t^h_j)$ does not imply a high final reward $R^*(t_{1:K}\mid g)$.
  For example, an article written section by section can be helpful turn by turn but still lack
  coherence. Asking *"Should I maintain an engaging tone in the conclusion like the
  introduction?"* fits the goal better (p. 3).

## Contributions (p. 1–2, Sec. 1)

1. **CollabLLM**, a general training framework that rewards responses for their long-term
   effect on the conversation (MR), estimated by collaborative simulation with a user
   simulator. It is trained with RL (PPO, DPO) (p. 1).
2. **Three multiturn tasks / environments**: `MediumDocEdit-Chat` (document creation),
   `BigCodeBench-Chat` (code generation), `MATH-Chat` (multiturn math QA) (p. 2).
3. **Large user study**: 201 MTurk participants writing documents with an anonymous assistant
   (p. 2).
4. A scalable way to generate synthetic multiturn data for SFT/DPO without human annotation
   (p. 4, Sec. 3.2).

## Method (p. 3–4, Sec. 3; Fig. 1)

Four steps (Fig. 1, p. 1): (1) context state, (2) the policy's response, (3) collaborative
simulation: forward-sample future conversations with a (simulated) user and compute rewards,
(4) RL fine-tuning on the resulting MRs.

### Multiturn-aware Reward (p. 3, Sec. 3.1, Eq. 1)

$$
\mathrm{MR}(m_j \mid t^h_j, g)
= \mathbb{E}_{t^f_j \sim P(t_{j+1:K} \mid t^h_j \cup \{m_j\})}\, R^*(t^h_j \cup \{m_j\} \cup t^f_j \mid g)
= \mathbb{E}_{t^f_j \sim P(t^f_j \mid t_{1:j})}\, R^*(t_{1:j} \cup t^f_j \mid g)
$$

$t^f_j = t_{j+1:K}$ is the *forward trajectory*: the turns after turn $j$. Computing Eq. 1 needs
(a) a conversation-level reward $R^*$ and (b) a way to sample forward conversations (p. 3).
The paper frames this as **causal effect estimation**: the response is an intervention and MR
is its effect on the outcome (p. 3; App. A.1, p. 14, front-door adjustment).

### Conversation-level reward (p. 3, Sec. 3.1.1, Eq. 2–4)

$$R^*(t \mid g) \simeq R_{\text{ext}}(t, g) + R_{\text{int}}(t)$$

- **Extrinsic** (task success): $R_{\text{ext}}(t, g) = S(\mathrm{Extract}(t), y_g)$, where
  $\mathrm{Extract}$ pulls the final solution out of the conversation, $y_g$ is the reference
  solution and $S$ is a task metric such as accuracy, BLEU or pass rate (p. 3).
- **Intrinsic** (user experience):
  $$R_{\text{int}}(t) = -\min[\lambda \cdot \mathrm{TokenCount}(t),\, 1] + R_{\text{LLM}}(t)$$
  It penalises the tokens users must read and write ($\lambda$ sets how hard; the penalty is
  capped at 1) and adds an LLM-judge score $R_{\text{LLM}} \in [0,1]$ for interactivity /
  engagement (p. 3, Eq. 4).

### Forward sampling and user simulator (p. 4, Sec. 3.1.2)

- Full Monte Carlo rollout to the end of the conversation is expensive. A **window size $w$**
  caps how many forward turns are sampled (p. 4).
- **User simulator** $U: \mathcal{T} \to \mathcal{U}$ maps a conversation history to a user
  response, i.e. a distribution $P(u \mid t)$. It is an LLM prompted to role-play the user, with
  the hidden goal $g$, copying the user's language style and typical behaviours (p. 4). The
  prompt asks it to minimise effort, occasionally make mistakes, stay goal-oriented and mention
  preferences (App. D.1, p. 17; Fig. 3, p. 5).

### Optimization and synthetic data (p. 4, Sec. 3.2; App. B.1, Fig. 8, p. 14)

- MR is computed directly from simulation and metrics. **No separate reward model is trained**
  (p. 4).
- RL: PPO and DPO optimise for higher MR (p. 4).
- Synthetic data (Fig. 8, p. 14): at each turn several candidate responses are sampled and
  ranked by MR. **SFT** keeps the top-ranked response to build the history. **DPO** pairs a
  higher-MR "chosen" response with a lower-MR "rejected" one. The first user turn from the
  chosen response's forward window is appended to continue the conversation (p. 14–15).
- Data generation used GPT-4o-mini as the user simulator and GPT-4o as the assistant (App. B.1,
  p. 15).

## Setup (p. 4–5, Sec. 4; App. B, p. 14–16)

- **Tasks** (p. 4–5): the user simulator receives a target problem and must reach it over
  several turns.
  - `MediumDocEdit-Chat`: 100 Medium articles as goal documents, summarised into target
    problems. Metric **BLEU** of the extracted document against the original article.
  - `BigCodeBench-Chat`: 600 BigCodeBench problems. Metric **Pass Rate (PR)** of the final code.
  - `MATH-Chat`: 200 level-5 MATH problems. Metric **accuracy (ACC)** of the final solution,
    judged by an LLM.
  - Task-agnostic metrics on all tasks: **#Tokens**, the average number of tokens the LLM
    generates per conversation (k), and **Interactivity (ITR)**, an LLM judge
    (Claude-3.5-Sonnet) score rescaled to an upper bound of 1 (p. 5).
- **User simulator in evaluation**: GPT-4o-mini (p. 4).
- **Models**: Llama-3.1-8B-Instruct + LoRA (p. 5). Four CollabLLM variants (p. 5):
  - offline: **SFT**, **Offline DPO** (trained on pre-generated MR-guided conversations);
  - online: **PPO** (initialised from SFT) and **Online DPO** (initialised from Offline DPO). Both
    take part in the collaborative simulation during training, so MRs are computed on their own
    responses.
- **Baselines** (p. 5): **Base** (Llama-3.1-8B-Instruct) and **Proactive Base** (Base with a
  prompt that encourages follow-up and clarification questions; prompt in App. D.2, p. 18).
- **Hyperparameters** (Table 6, p. 15): $w = 2$, MR sample size 3, $\lambda$ = 1e-4 (Doc) /
  5e-4 (Code, Math). LoRA r = 32, α = 16, dropout 0.1.
- **ITR judge scoring** (App. D.4, p. 20–21): Table 1 used rubric weights A=3, B=2, C=1 and
  rescaled the score as $S' = 2(S - 2.5)$, because every method averaged above 2.5. The current
  codebase uses A=1, B=0.5, C=0 instead.

## Main results

### Table 1: Evaluation on the three multiturn datasets (p. 6)

Green rows are baselines, orange rows are CollabLLM variants. *Rel. Improv.* = Online DPO
relative to Proactive Base. ITR is printed ×100 in this table (the text writes the same values
as 0.46 → 0.92, p. 5). ↑ higher is better, ↓ lower is better.

| Method | Doc BLEU ↑ | Doc #Tokens(k) ↓ | Doc ITR ↑ | Code PR ↑ | Code #Tokens(k) ↓ | Code ITR ↑ | Math ACC ↑ | Math #Tokens(k) ↓ | Math ITR ↑ |
|---|---|---|---|---|---|---|---|---|---|
| Base | 32.2 | 2.49 | 46.0 | 9.3 | 1.59 | 22.0 | 11.0 | 3.40 | 44.0 |
| Proactive Base | 35.0 | 2.18 | 62.0 | 11.0 | 1.51 | 33.7 | 12.5 | 2.90 | 46.0 |
| SFT | 35.2 | 2.21 | 68.0 | 11.7 | 1.35 | 42.0 | 13.5 | 2.88 | 58.0 |
| PPO | 38.5 | 2.00 | 78.0 | 14.0 | 1.35 | 40.7 | 13.0 | 2.59 | 52.0 |
| Offline DPO | 36.4 | 2.15 | 82.0 | 12.3 | 1.35 | 46.7 | 15.5 | 2.40 | 50.0 |
| Online DPO | 36.8 | 2.00 | 92.0 | 13.0 | 1.31 | 52.0 | 16.5 | 2.37 | 60.0 |
| Rel. Improv. | 5.14% | 8.25% | 48.3% | 18.2% | 13.2% | 54.3% | 32.0% | 18.3% | 36.4% |

Doc = `MediumDocEdit-Chat`, Code = `BigCodeBench-Chat`, Math = `MATH-Chat`.

Takeaways (p. 5, Sec. 5):
- **Prompting helps a little but has limits**: Proactive Base raises Doc BLEU from 32.2 to 35.0
  and cuts read tokens by 0.31k compared with Base. But it is rigid and sometimes asks
  clarification questions that aren't needed (p. 5).
- **CollabLLM improves all three dimensions**: **18.5%** task performance, **13.3%** efficiency
  and **46.3%** interactivity over the best baseline (p. 5). These are the averages of the
  *Rel. Improv.* row: (5.14+18.2+32.0)/3, (8.25+13.2+18.3)/3, (48.3+54.3+36.4)/3.
- Doc: Online DPO raises ITR from 0.46 to 0.92. Math: Online DPO uses 1.03k fewer tokens than
  Base (p. 5).
- The best task score is not always Online DPO: PPO is best on Doc BLEU (38.5) and Code PR (14.0).
  Online DPO is best on Math ACC, on every ITR column and on tokens (tied with PPO on Doc).

> ⚠ Check before charting: in Table 1, Math ITR Rel. Improv. is printed as 36.4%, but
> 60.0 / 46.0 − 1 = 30.4%. The paper's 46.3% headline average uses 36.4%. Doc tokens recompute
> to 8.26% (printed 8.25%) and Doc ITR to 48.4% (printed 48.3%). On slides, use the printed
> values.

### Figure 4: Selected ablation of reward mechanisms on `MediumDocEdit-Chat` (p. 6)

Values read from the bar labels. "Extrinsic+Intrinsic" is the special case MR with $w=0$ (p. 6).

| Reward | BLEU ↑ | #Tokens(k) ↓ | ITR ↑ |
|---|---|---|---|
| Helpfulness (immediate) | 0.367 | 2.19 | 0.60 |
| Extrinsic (immediate) | 0.369 | 2.11 | (bar at 0.5 axis, unlabeled) |
| Extrinsic + Intrinsic (immediate, = MR w=0) | (bar at 0.365, unlabeled) | 2.0 | 0.54 |
| MR (w=1) | 0.370 | 2.0 | 0.64 |
| MR (w=2) | 0.373 | 1.85 | 0.70 |
| MR (w=3) | 0.373 | 1.84 | 0.68 |

- Larger $w$ generally improves performance and efficiency. $w=2$ balances gains against the
  cost of forward sampling. Immediate rewards, even with extrinsic and intrinsic terms, fall
  short (p. 6).

> ⚠ Fig. 4 and Fig. 9 do not fully agree on the immediate-reward rows: Helpfulness BLEU is 0.367
> (Fig. 4) vs 0.347 (Fig. 9, w=0), and Extrinsic BLEU/tokens are 0.369 / 2.11 vs 0.351 / 2.21.
> The MR rows match Fig. 9's CollabLLM column. Cite the figure you chart.

### Figure 9: Full ablation, reward type × window size, `MediumDocEdit-Chat` (p. 16, App. B.3)

BLEU ↑

| w | Helpfulness | Extrinsic Only | Intrinsic Only | CollabLLM |
|---|---|---|---|---|
| 0 | 0.347 | 0.351 | 0.350 | 0.365 |
| 1 | 0.353 | 0.377 | 0.361 | 0.370 |
| 2 | 0.362 | 0.364 | 0.353 | 0.373 |
| 3 | 0.370 | 0.372 | 0.348 | 0.373 |

#Tokens (k) ↓

| w | Helpfulness | Extrinsic Only | Intrinsic Only | CollabLLM |
|---|---|---|---|---|
| 0 | 2.19 | 2.21 | 1.89 | 2.01 |
| 1 | 2.42 | 2.35 | 1.81 | 2.01 |
| 2 | 2.55 | 2.16 | 1.99 | 1.85 |
| 3 | 2.35 | 2.25 | 2.01 | 1.84 |

ITR ↑

| w | Helpfulness | Extrinsic Only | Intrinsic Only | CollabLLM |
|---|---|---|---|---|
| 0 | 0.60 | 0.50 | 0.68 | 0.54 |
| 1 | 0.64 | 0.64 | 0.74 | 0.64 |
| 2 | 0.62 | 0.62 | 0.60 | 0.70 |
| 3 | 0.46 | 0.46 | 0.54 | 0.68 |

Observations (p. 16): Helpfulness alone gives small BLEU/ITR gains but more tokens (verbosity).
Extrinsic-only gets strong BLEU (0.377 at $w=1$) but lower ITR and longer answers.
Intrinsic-only gets better ITR at $w=1$ (0.74) but lower BLEU. CollabLLM (extrinsic + intrinsic
inside MR) is the most balanced. The reward type can be chosen independently of the MR design.

### Case study: Figures 5 & 6 (p. 6–7, Sec. 5.2)

- Fig. 5 (`BigCodeBench-Chat`): the user asks for a function that tokenizes a text file with
  NLTK. The non-collaborative model (response **A**) assumes lowercasing, punctuation removal
  and stopword removal. The final solution is still wrong after the user corrects it. CollabLLM
  (response **B**) asks about the NLTK version, which tokenizer to use and error handling, and
  confirms keeping punctuation. Its final solution has a **100% Pass Rate** with fewer tokens
  (p. 6).
- Fig. 6: rewards for responses A and B under each mechanism (values from the figure axes,
  as R(A), R(B)):

| Reward | R(A) | R(B) |
|---|---|---|
| Helpfulness | 0.67 | 0.20 |
| Extrinsic | 0 | 0 (both at origin) |
| Extrinsic + Intrinsic | 0.79 | slightly higher than A, unlabeled |
| MR (w=1) | unlabeled | 0.80 |
| MR (w=2) | 0.16 | 0.90 |
| MR (w=3) | 0.35 | 0.96 |

  Helpfulness prefers A. Extrinsic gives both 0 (A is wrong, B defers). Extrinsic + Intrinsic
  slightly prefers B. MR prefers B by a wide margin, especially at $w=2,3$ (p. 6).

### Table 2: Zero-shot generalization to Abg-CoQA (p. 7, Sec. 5.3)

CollabLLM here is trained with Online DPO on `BigCodeBench-Chat`. Action-level accuracy means
asking a clarifying question on ambiguous inputs and answering directly on non-ambiguous ones.

| Model | Ambiguous | Non-Ambiguous | Macro Accuracy | Macro F1 |
|---|---|---|---|---|
| GPT-4o | 15.44% | 95.60% | 55.52% | 56.62% |
| Llama-3.1-8B-Instruct | 16.26% | 90.40% | 53.33% | 53.31% |
| CollabLLM | 52.84% | 72.32% | 62.58% | 55.08% |

GPT-4o and Llama rarely ask questions. CollabLLM asks about 50% of the time, has the highest
Macro Accuracy and beats Base on Macro F1, but is still below GPT-4o on F1 (p. 7).

### Real-world user study: Figure 7 (p. 7–8, Sec. 6)

Setup (p. 7): **201** MTurk participants. Each is assigned a blog post, creative writing or
personal statement, picks a topic and answers short questions about it, so they only have a
rough idea of the task. They then chat for **at least 8 turns** with an anonymised Base,
Proactive Base or CollabLLM. Interaction is rated every 3 turns, then document quality and the
overall interaction (1–10 scale). Total time is recorded.

Averages from Fig. 7 (p. 8):

| Metric | Base | Proactive Base | CollabLLM |
|---|---|---|---|
| (a) Document quality rating ↑ | 8.16 | 8.38 | 8.50 |
| (b) Interaction rating ↑ | 8.11 | 8.46 | 8.60 |
| (c) Time spent (s) ↓ | 1237 | 1319 | 1108 |

(d) Multiturn interaction rating at turns 3 / 6 / 9 is a line chart without value labels. Base
falls between turns 6 and 9. Proactive Base and CollabLLM rise, with CollabLLM higher than
Proactive Base at every point (p. 8).

Text numbers (p. 7–8):
- Document quality: **91.4%** rate CollabLLM "good" (8–9) and **56.9%** "very good" (9–10),
  vs **88.5%** and **39.3%** for Base.
- **63.8%** find CollabLLM highly engaging vs **42.6%** for Base.
- Time spent is **10.4%** lower than Base and **15.6%** lower than Proactive Base.
- Abstract/intro headline: **+17.6% user satisfaction** (p. 1–2). The paper does not show how
  this number is derived from the Fig. 7 values.

> ⚠ (1319−1108)/1319 = 16.0%, while the text says 15.6%. (1237−1108)/1237 = 10.4% matches.

Qualitative (Table 3, p. 8; 180 strengths + 180 weaknesses collected):

| Model | Strengths | Weaknesses |
|---|---|---|
| Base | "Follows great instruction and does exactly what I'm asking it to do.", "It can create a nice form of an outline to work with." | "The AI just agreed with me on pretty much everything. There was no discussion", "I didn't really like that it kept coming up with different options" |
| Proactive Base | "It is very organized and it actually asks you for feedback after writing the revision." | "The AI seemed to be very redundant and asked me the same questions over and over." |
| CollabLLM | "Asking questions and making you think of things you never thought of", "The AI really helped me with focusing on one part of the story at a time.", "It helped really well to navigate what to say and what information is needed" | "The AI assistant was not up to date enough to help with this recent sporting event. The AI assistant also asked me to repeat information I had already given it." |

Summary (p. 8): Base is coherent but can lose context and be verbose. Proactive Base is
responsive but repetitive and overly structured. CollabLLM is engaging and guides the user, but
it can feel bland, lacks up-to-date information and needs extra effort to personalise.

### Other tables (appendix)

**Table 4: Comparison with related work (p. 9)** (✓ yes, ✗ no, – not applicable)

| Method | Task-Agnostic | Versatile Interaction | User-Centric | Causal & Objective-Aligned Reward |
|---|---|---|---|---|
| ClarifyGPT | ✗ | ✗ | ✗ | – |
| STaR-GATE | ✓ | ✗ | ✗ | – |
| MTPO | ✓ | ✓ | ✗ | ✗ |
| CollabLLM | ✓ | ✓ | ✓ | ✓ |

**Table 5: Synthetic training datasets built with MR (p. 15)**

| Dataset | # Train | # Turns | Avg # Turns | Chosen MR | Rejected MR |
|---|---|---|---|---|---|
| MediumDocEdit-Chat | 500 | 2,303 | 4.61 | 0.312 ±0.104 | 0.246 ±0.113 |
| BigCodeBench-Chat | 500 | 2,627 | 5.25 | 0.494 ±0.621 | 0.207 ±0.763 |
| MATH-Chat | 500 | 2,527 | 5.05 | 0.863 ±0.524 | 0.547 ±0.502 |

**Table 6: Hyperparameters (p. 15)**

| | SFT | Offline DPO | Online DPO | PPO |
|---|---|---|---|---|
| Learning rate | 1e-5 | 5e-6 | 5e-6 | 2e-6 |
| Total batch size | 64 | 64 | 32 | 64 |
| Epochs | 3 | 8 | 1 | 5 |

LoRA: rank 32, α 16, dropout 0.1, bias False. CollabLLM-specific: window $w$ = 2 / 2 / 2,
MR sample size 3 / 3 / 3, penalty $\lambda$ = 1e-4 / 5e-4 / 5e-4 (Doc / Code / Math). $\lambda$
is lower for Doc because document lengths vary a lot (p. 15).

**Table 7: Compute per forward sample, `MediumDocEdit-Chat`, averaged over 100 samples (p. 15)**

| w | Policy in tokens (k) | Policy out tokens (k) | Policy time (s) | Simulator in tokens (k) | Simulator out tokens (k) | Simulator cost ($) |
|---|---|---|---|---|---|---|
| 1 | 0.89 | 0.42 | 7.41 | 1.85 | 0.26 | 0.00174 |
| 2 | 2.55 | 0.91 | 15.84 | 4.55 | 0.69 | 0.00439 |
| 3 | 4.13 | 1.22 | 21.72 | 7.18 | 1.06 | 0.00685 |

User simulator: GPT-4o-mini. The authors call this cost practical. Open-source models were poor
user simulators: they get "confused" and start solving the task like an assistant (p. 15).

**Table 8: Safety, harm scores under adversarial prompts (0–7, ↓) (p. 17, App. C)**

| Model | Violence | Sexual | Self-harm | Hate |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct | 0.88 | 0.96 | 0.89 | 1.01 |
| CollabLLM | 0.95 | 0.94 | 1.00 | 0.99 |

80 adversarial queries (20 per harm type) × 4 evaluators = 320 evaluations. CollabLLM had one
unsafe response (99.7% pass rate), the same as Llama. Collaborative training does not degrade
safety, and no extra safety alignment was done (p. 17).

**Table 9: Simulated vs. real users (p. 24, App. F.2)**
- Differences: real users write shorter, fragmented and ungrammatical messages, change direction
  mid-conversation and add specific personal details. They also express emotion bluntly and
  informally. Simulators are more polished, predictable, generic and neutral.
- Similarities: both reveal information gradually, ask for simplifications and examples, and
  state style/structure preferences with feedback.

## Limitations (as stated or implied by the paper)

- **Simulated users differ from real ones** (Table 9, p. 24). Training relies on simulators
  only. The paper calls simulator realism and diversity an open opportunity.
- **Open-source user simulators fail** (p. 15). Training relies on a proprietary LLM
  (GPT-4o-mini), and evaluation uses proprietary judges (Claude-3.5-Sonnet, GPT-4o-mini
  simulator).
- **Cost grows with $w$** (Table 7, p. 15). $w=2$ is a compromise (p. 6).
- **User feedback** (p. 8): CollabLLM can feel bland, lacks up-to-date knowledge, sometimes asks
  for information already given, and needs effort to personalise. Future work: personalisation,
  creativity and real-time knowledge.
- **Generalization is partial** (p. 7): non-ambiguous accuracy falls from 90.40% (Llama) to
  72.32%, and Macro F1 is still below GPT-4o.
- **Scale and metrics** (p. 5): one 8B base model with LoRA. BLEU is a coarse proxy for document
  quality, and ITR is an LLM-judge score.
- **Questions are not always good** (blog, see `web.md`): asking only helps when it serves the
  objective. MR is meant to learn *when* to ask.

## Figures and tables: one line each

Files are in `assets/figures/`.

- **Fig. 1** (`fig1.png`, p. 1): framework overview. Context → response → collaborative
  simulation (forward sampling + extrinsic/intrinsic reward) → MR → RL fine-tuning, with an
  online generation loop.
- **Fig. 2** (`fig2.png`, p. 2): same "optimism" writing request, (a) non-collaborative LLM
  trained on single-turn rewards gives many tokens, many turns, BLEU=0.32, judge 0.2; (b)
  CollabLLM asks about tone, proposes an opening and gives BLEU=0.46, judge 0.8. Both panels
  print "1.39k tokens read".
- **Fig. 3** (`fig3.png`, p. 5): simulated evaluation environment. The user-simulator prompt and
  example dialogues for document editing, coding and math.
- **Fig. 4** (`fig4.png`, p. 6): ablation bar chart (BLEU / #Tokens / ITR), three immediate
  rewards vs MR with $w=1,2,3$ on Doc. MR wins on all three.
- **Fig. 5** (`fig5.png`, p. 7): coding case study. The non-collaborative model makes wrong
  assumptions (lowercase, stopwords, punctuation) while CollabLLM asks first and is correct.
- **Fig. 6** (`fig6.png`, p. 7): scatter of R(A) vs R(B) for each reward. Only MR strongly
  prefers the clarifying response B.
- **Fig. 7** (`fig7.png`, p. 8): user study. Violins for document quality, interaction rating
  and time spent, plus a line chart of ratings every 3 turns.
- **Fig. 8** (`fig8.png`, p. 14): synthetic data generation. Candidate responses are ranked by
  MR; chosen goes to SFT, chosen/rejected pairs go to DPO.
- **Fig. 9** (`fig9.png`, p. 16): full ablation heatmaps (reward type × $w$ = 0–3) for BLEU,
  tokens and ITR.
- **Figs. 10–12** (`fig10a/b.png`, `fig11a/b.png`, `fig12a/b.png`, p. 23–24): user-study
  interface screenshots (overall, steps 1–3, multiturn and final evaluation).
- **Table 1** (`table1.png`, p. 6): main results, see above.
- **Table 2** (`table2.png`, p. 7): Abg-CoQA generalization.
- **Table 3** (`table3.png`, p. 8): representative user feedback.
- **Table 4** (`table4.png`, p. 9): comparison with ClarifyGPT, STaR-GATE, MTPO.
- **Tables 5–9** (p. 15–24): dataset stats, hyperparameters, compute cost, safety and
  simulated-vs-real users. Numbers above, no image files.

## Related work in one line each (p. 8–9, Sec. 7; App. A.2, p. 14)

- **Single-turn RLHF / PPO / DPO** optimise next-turn quality.
- **Prompting for clarification** (e.g. ClarifyGPT) follows fixed interaction patterns.
- **Learned clarification** (STaR-GATE, DPO-for-clarification) covers only clarifying
  questions.
- **Multiturn RLHF** (e.g. MTPO, ArCHer, REFUEL) learns from *observed*, trajectory-level
  rewards. That is observational and gives coarse credit. MR *intervenes* on single responses
  and simulates counterfactual futures, so it assigns credit per turn (p. 14).
- **User simulators** have been used before to train dialogue systems. CollabLLM uses them for
  forward sampling inside both offline and online training (p. 9).

## Ethics / impact (p. 10, Impact Statement)

MTurk workers were paid $10 per conversation. Conversations averaged 28.4 minutes including
breaks, so pay was above $20/hour. The authors argue that clarifying intent creates more chances
to detect misuse. Code, models, data, benchmarks and user simulators are released.
