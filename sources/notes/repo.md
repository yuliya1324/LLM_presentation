# Repo: github.com/Wuyxin/collabllm

Shallow clone in `sources/repo/` (commit `7378aab`, 25 Sep 2025). MIT licence. It is also
published on PyPI as `collabllm` (version 0.0.8 in `pyproject.toml`, Python ≥ 3.10). The
README advertises the ICML 2025 Outstanding Paper Award, models and datasets on Hugging Face
(`huggingface.co/collabllm`) and CollabLLM training in **verl**
(`verl.readthedocs.io/en/latest/algo/collabllm.html`).

## What is implemented

The full pipeline from the paper:

| Paper concept | Code |
|---|---|
| Multiturn-aware Reward (MR) | `collabllm/reward.py` → `multiturn_aware_reward(...)` |
| Forward sampling / collaborative simulation | `collabllm/simulation.py` → `ChatSessionSimulator.run_chat_simulation` |
| User simulator $U$ | `collabllm/modules/user_simulator.py` + prompt `collabllm/prompts/user_simulator.txt` |
| Policy / assistant wrapper (API or local, optional proactive prompt) | `collabllm/modules/llm_collaborator.py`, `collabllm/prompts/proact_instruction.txt` |
| Synthetic multiturn data for SFT / DPO (Fig. 8) | `collabllm/synthetic.py` → `generate_multiturn_dataset`, CLI `scripts/engine/build_dataset.py` |
| Training: SFT, Offline DPO, Online DPO, PPO | `scripts/train/{sft,offline_dpo,online_dpo,ppo}.py` (TRL + PEFT/LoRA, vLLM for online rollouts) |
| Multiturn evaluation | `scripts/engine/inference.py` |
| Metrics: BLEU, pass rate, accuracy, interactivity (LLM judge), token amount, reward model | `examples/metrics/*.py`, registered with `@SingleTurnOrChatMetric.register_metric` |
| Tasks | `examples/single_turn_ds/`: `medium`, `bigcodebench`, `math-hard`, `abg-coqa` |
| Tutorials | `notebook_tutorials/` (compute MR with API or local LLMs; build datasets) |

## How MR is computed in code (`collabllm/reward.py`, `collabllm/synthetic.py`)

1. Append the candidate response to the history.
2. `ChatSessionSimulator` rolls out `num_samples` (default 3) future conversations. Simulated
   user turns and assistant turns alternate until `max_new_turns` **messages** are used up, or
   the user simulator sends the termination signal.
3. Score each rollout with every metric in `metric_names`.
4. Per rollout, MR = **weighted sum** of metric scores (`metric_weights`). The response's MR is
   the mean over rollouts.
5. Data building: for each turn, sample `num_candidate_responses`, score each one by MR, and keep
   the best response in the history. The next user message comes from the best response's
   longest rollout. All candidates and scores are stored, so SFT and DPO pairs can be built from
   them.

## How to run (from README and script docstrings)

```bash
pip install collabllm            # or clone the repo
# 1. build MR-ranked multiturn data (API keys in .env)
python -m scripts.engine.build_dataset --dataset_name math-hard \
  --metric_names "accuracy" "interactivity" "token_amount" --metric_weights 1 0.5 -0.5 \
  --user_generation_kwargs '{"model": "gpt-4o"}' \
  --assistant_generation_kwargs '{"model": "gpt-4o", "temperature": 0.8}' \
  --reward_generation_kwargs '{"model": "claude-3-5-sonnet-latest"}' \
  --output_dir outputs/multiturn_data --num_candidate_responses 3 --hf_entity <you>
# 2. train (LoRA on Llama-3.1-8B-Instruct; examples use 2–8 A100-80GB)
torchrun ... -m scripts.train.sft --dataset_repo collabllm/collabllm-multiturn-medium \
  --model_name meta-llama/Llama-3.1-8B-Instruct --use_lora ...
torchrun ... -m scripts.train.online_dpo --dataset_name math-hard ... --num_samples 3 --max_new_turns 4
# 3. evaluate
torchrun ... -m scripts.engine.inference --dataset_name medium --model_name <ckpt> \
  --eval_metric_names "document->bleu" "interactivity" "token_amount" ...
```

To add a new task, put a single-turn dataset in `examples/single_turn_ds/` and (optionally) a
metric in `examples/metrics/`, then register both in their `__init__.py`.

## Differences from the paper (worth a footnote, not a slide)

- **Reward form.** The paper writes $R^* = R_{\text{ext}} + R_{\text{int}}$ with
  $R_{\text{int}} = -\min[\lambda\,\mathrm{TokenCount}, 1] + R_{\text{LLM}}$ (Eq. 4, p. 3). The
  code uses a plain **weighted linear sum** of metrics: `token_amount` is thousands of
  assistant tokens with a negative weight such as −0.5 or −0.1, and there is no cap at 1. The
  weights vary by example: math-hard data `1, 0.5, -0.5`; online DPO `1, 1, -0.5`; medium
  `1, -0.1` (no interactivity); bigcodebench `1, -0.5` (no interactivity); PPO example
  `accuracy 1, token_amount -0.5`.
- **Token count.** The code counts only tokens the user *reads* (assistant text, tiktoken
  `cl100k_base`). The paper says tokens users "read and write".
- **ITR scale.** The code's interactivity judge returns 0 / 0.5 / 1 (A=1, B=0.5, C=0). Table 1
  used A=3, B=2, C=1 with rescaling $2(S-2.5)$. The paper's App. D.4 (p. 20) confirms this
  change.
- **Window.** `max_new_turns` counts messages, so `--max_new_turns 4` = 2 user + 2 assistant
  messages ≈ paper's $w=2$. The `build_dataset.py` CLI default is 4. The docstring default in
  `synthetic.py` is 1.
- **Simulator / assistant models.** Data-building examples use GPT-4o as the user simulator.
  The paper's App. B.1 (p. 15) says GPT-4o-mini simulator + GPT-4o assistant. Online
  DPO / PPO examples use GPT-4o-mini. The judge default is `claude-3-5-sonnet-latest`.
- **Extras not in the paper:** `proact_prompt_ratio` / `add_system_prompt_ratio` mix a proactive
  system prompt into candidate sampling for diversity. SFT has an optional `--lower_bound_metric`
  filter (e.g. keep conversations with accuracy ≥ 0.5). There is 4-bit quantisation support, a
  `reward_model` metric, and verl integration.
- The Abg-CoQA dataset loader is in the repo (`abg_coqa.py`). There is no user-study code.
