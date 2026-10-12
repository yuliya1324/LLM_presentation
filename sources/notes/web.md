# Project website and blog

- Project page: https://wuyxin.github.io/collabllm/ (also `aka.ms/CollabLLM`). Fetched
  12 Oct 2026. Raw HTML in `sources/web/index.html` (Next.js static export, rendered with
  Playwright).
- Blog: the same page, `#blog` anchor. "Building the Future of Collaborative AI: Our Journey
  with CollabLLM", Shirley Wu & Michel Galley, June 12, 2025, 6 min read.
- There is **no interactive demo**. The page links to models on Hugging Face
  (`huggingface.co/collabllm`) instead. Screenshots at 1280×720 (@2x):
  - `assets/figures/demo-website-hero.png`: title, authors, "ICML 2025 Outstanding Paper",
    "Make Your LLMs Active Collaborators", and the install terminal.
  - `assets/figures/demo-website-problem.png`: three cards (what is missing / why LLMs fail /
    how we build collaborative LLMs) and the user quotes.
  - `assets/figures/demo-website-users.png`: "What Users Said About CollabLLM" cards.
  - `assets/figures/demo-website-blog.png`: blog header with the Casey Newton / Operator quote.

## Project page content

- Hero: title, 10 authors (Stanford¹, Microsoft², Georgia Tech³), **ICML 2025 Outstanding
  Paper**.
- Tagline: "Make Your LLMs **Active Collaborators**". "CollabLLM is a unified fine-tuning
  framework that optimizes LLMs for effective and efficient multiturn collaboration with
  users." Button "Try CollabLLM Models" (HF). Terminal card: `pip install collabllm`,
  `git clone`, `python -m scripts.engine.build_dataset`, `python -m scripts.train.{sft/*_dpo/ppo}`.
- Three cards (this is the motivation in three sentences):
  1. *What is missing from current LLMs?* LLMs act as passive responders, especially when
     faced with ambiguous inputs. They don't help users explore their needs or suggest next
     steps.
  2. *Why do LLMs fail to understand users?* Most LLMs are tuned on single-turn human
     preferences, and these rewards encourage responses that may NOT be useful in the long term.
  3. *How do we build collaborative LLMs?* Reward responses for their long-term impact on the
     conversation and fine-tune on these interaction-level rewards.
- "What Users Said About CollabLLM", three quote cards:
  - **Efficient**: "I was surprised by the first response. I was expecting a quick summary
    related to my prompt, but instead the AI asked me some questions. I think this style worked
    well. I felt like I had to do **less editing** to personalize the review."
  - **Stimulate Creativity**: "Asking questions and making you think of things you **never
    thought of**." / "The AI assistant listened extremely well and offered suggestions that
    made sense as if it were a **real conversation**."
  - **Safer**: "The AI assistant told me why it **wouldn't be helpful** for this case." / "It
    helped really well to navigate what to say and **what information is needed**."
  - Note: only two of these quotes appear in the paper (Table 3, p. 8). The others are only on
    the web page.

## Blog: useful hooks for the talk

- **Opening anecdote**: Casey Newton (Platformer) on OpenAI Operator: *"Help me buy groceries
  on Instacart,"* expecting questions (where do I live? which store? what groceries?). Instead
  it searched for milk in Des Moines, Iowa. The blog's point: one of the smartest LLMs can
  still fail at basic human communication.
- Communication failures affect **performance, safety and efficiency**: assumptions about
  preferences, reliability on health/legal/finance, and wasted time.
- We evaluate LLMs in sanitized single-turn settings, which is not how real communication
  works.
- **Core idea in one line**: "what matters most is not how good a single response is, but how
  it affects the rest of the conversation."
- **Friends example** (Rachel & Joey): "So, where'd you grow up?" is mocked at first ("That's
  your move?") but a few turns later gets "Wow!". A response's value shows up later in the
  conversation. RLHF might penalise a clarifying question because it gives no information yet.
- **"Is asking always better?" No.** It depends on the objective. Asking endlessly is
  inefficient. In 20 Questions, asking is the whole point. MR lets the model learn **when to
  ask and when to answer**. This is good material for a slide that heads off the obvious
  objection.
- MR needs two parts: (1) a **user simulator** ("Joey") to produce follow-ups, (2) an
  **evaluator** of success (task-specific; criteria can be combined).
- Closing line: "you don't need massive changes to build a collaborative model. Just a new way
  to define the objective, and a longer lens for measuring what matters in a conversation."
- "Real-World Impact" and "What's Next?" are generic and have no numbers.
