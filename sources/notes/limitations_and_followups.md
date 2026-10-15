# Limitations of CollabLLM and follow-up work

For section 04 (Yash). Every claim has its source. Our own experiment numbers are in `our_experiments.md`.

## Limitations found reading the paper and code

1. **Interactivity headline.** The ICML paper reports +46.3% interactivity. The authors' IJCAI-26 extended abstract
   corrects it to 44.3%, with MATH-Chat ITR at +30.4% instead of +36.4%. The percentages come from a rescaled judge
   score, S' = 2·(S − 2.5) (App. D.4). On the judge's own 1–3 scale the gains over Proactive Base are +0.15, +0.09
   and +0.07 points. Sources: Table 1, p. 6; App. D.4, p. 20; https://www.ijcai.org/proceedings/2026/0928.pdf
   The same scores on both scales, Proactive Base → CollabLLM (Online DPO), with S = 2.5 + S'/2 (derived from Table 1):
   Document editing 0.62 → 0.92 = 2.81 → 2.96; Coding 0.337 → 0.52 = 2.67 → 2.76; Math 0.46 → 0.60 = 2.73 → 2.80.
   Every method in Table 1 scores above 2.5 on the 1–3 scale, which is why the paper rescales.
2. **"+17.6% user satisfaction".** Figure 7's mean document-quality rating rose from 8.16 (Base) to 8.50 (CollabLLM),
   +4.2%. The only 17.6 in the data is the gap in "very good" ratings, 56.9% vs 39.3%: percentage points, not a
   relative gain. The IJCAI-26 version calls it "a 17.6% relative gain over Base". Sources: Fig. 7 and Sec. 6, p. 7–8.
3. **One simulator for training and testing.** GPT-4o-mini plays the user both in the training reward and in the
   evaluation. The authors acknowledge the gap: App. F.2 says real users write shorter, fragmented messages, change
   direction and are blunter.
   Sources: Sec. 4, p. 4; App. B.1, p. 15; App. F.2, p. 24.
4. **Uneven evaluation prompts.** The released evaluation script adds the "proactive, highly interactive" system
   prompt (App. D.3) to CollabLLM runs (`--add_system_prompt`) but not to the base model run.
   Source: `scripts/engine/inference.py` docstring, github.com/Wuyxin/collabllm.
5. **Over-asking.** On Abg-CoQA, CollabLLM asks a question on 27.7% of unambiguous inputs, against 9.6% for
   Llama-3.1-8B-Instruct and 4.4% for GPT-4o: 100% minus each model's non-ambiguous accuracy (72.32%, 90.40%,
   95.60%). This CollabLLM is the Online DPO model trained on coding. The ambiguous column, where CollabLLM asks
   52.84% of the time vs 16.26% for Llama, is the paper's headline result. Source: Table 2, p. 7.
6. **Writing metric.** The released code computes the writing benchmark's BLEU on characters, not words: nltk's
   `sentence_bleu` receives raw strings. Two paraphrased sentences score 0.0 on word-level BLEU but 0.505 this way.
   Source: `examples/metrics/bleu.py`, github.com/Wuyxin/collabllm.
7. **No uncertainty.** No confidence intervals or significance tests anywhere. On MATH-Chat, accuracy rises from 12.5%
   (Proactive Base) to 16.5% on 200 problems. For scale: an unpaired 95% interval on that 4-point difference is about
   ±7 points (normal approximation); a paired test could be tighter, but none is reported. Sources: Table 1, p. 6;
   Sec. 4, p. 5.
8. **LoRA learning rates.** 1e-5 for SFT and 5e-6 for DPO, rates typical of full fine-tuning; LoRA is usually trained
   around 1e-4. Source: Table 6, p. 15.

## Follow-up work that addresses them

- **LLMs Get Lost in Multi-Turn Conversation** (Laban et al., ICLR 2026 Oral). The benchmark we used: 15 LLMs lose
  39% on average when an instruction arrives in pieces. Its simulated user is also GPT-4o-mini, but with another
  team's prompt, problems and scoring. https://arxiv.org/abs/2505.06120
- **UserLM-8b** (Naous et al., Microsoft, 2025). A user simulator trained on real WildChat conversations. GPT-4o scores
  74.6 against a GPT-4o simulator but 57.4 against UserLM-8b: prompted simulators flatter assistants. Addresses 3.
  https://arxiv.org/abs/2510.06552
- **SimulatorArena** (EMNLP 2025, shares authors with CollabLLM). Simulators conditioned on user profiles reach a
  correlation of about 0.7 with human ratings; unconditioned ones are "overly verbose and polite". Addresses 3.
  https://aclanthology.org/2025.emnlp-main.1786/
- **Lost in Simulation** (ACL 2026). Agent success on τ-Bench shifts by up to 9 points depending on which LLM plays the
  user. Addresses 3. https://aclanthology.org/2026.acl-long.2192/
- **PPP / UserVille** (Sun et al., CMU, 2025). Multi-objective RL whose reward includes the task outcome, the effort
  a question costs the user, and adherence to the user's preferences. UserVille simulates users with configurable
  preferences. PPP agents ask more targeted questions and beat GPT-5 by 16.7 points on average on SWE-Bench and
  BrowseComp-Plus. Addresses 5. https://arxiv.org/abs/2511.02208
- **Found in Conversation** (Chen, Wu and Leskovec, May 2026; Wu is CollabLLM's first author). Self-distillation
  with no stronger external model: a teacher sees the task as one prompt, and a student sees the same information as
  an underspecified multi-turn conversation. Keeps at least 92% of single-turn performance across Llama, Qwen, Phi
  and OLMo models (3B–14B), and 100% on two Llama models. It targets the multi-turn drop that our experiment shows
  CollabLLM does not reduce. https://arxiv.org/abs/2605.24432
