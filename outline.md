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
| sections/04-ablations.html | Yash | 5 | Our own analysis and ablations targeting paper's limitations |
| sections/05-harness.html | Iuliia | 1 | How we built harness for these slides |
| sections/06-appendix_title.html | Iuliia | 1 | Appendix title |
| sections/07-appendix_results.html | Elgun | 1 | Appendix for results |
| sections/08-appendix_ablations.html | Yash | 1 | Appendix for ablations |
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

### 05-harness (Iuliia)
- harness-1: Describe how your harness works to make these slides. Show the structure of the repo, rules and the workflow: fetch resources -> write a plan -> draft slides -> iterate on them. Keep it minimal, don't make the slide overflow. Connect parts to each other.

### 06-appendix_title (Iuliia)
- appendix_title-1: One word on a slide "Appendix"

### 09-appendix_harness (Iuliia)
- appendix_harness-1: Schema of folder structure
- appendix_harness-2: Example of a skill, e.g. ingest