---
date: 2026-06-05
description: COMP9418 简介
coreIdeas:
  - PGM = probability/statistics + graph structure
  - 概率推理处理不确定性，图结构处理表示和计算复杂度
  - Bayesian network 是理解后续 PGM 的核心入口
---
## 概率图模型(Probabilistic Graphical Model)

- 概率图模型(PGM)结合了两个东西：
	1. 概率 / 统计(probability/statistics)：描述不确定性。
	2. 图结构(graph structure)：表示变量之间的关系，并让推理更高效。

- 可以把 PGM 理解成：在不确定世界中做结构化推理(structured reasoning)的方法。

> 这节课的主线：AI 需要在不确定、变量很多的世界中推理；PGM 用概率解决不确定性，用图结构解决复杂度。

## 自动推理(Automated Reasoning)

- 早期 AI 的一个目标是自动推理(automated reasoning)。
- John McCarthy 的经典框架是：
	- `Observations -> Knowledge Base + Inference Engine -> Conclusions`
	- 知识库(Knowledge Base, KB)：存储我们知道什么。
	- 推理机(Inference Engine)：根据 KB 回答问题。

- 这个框架的关键贡献是分离：
	- `what we know`：知识内容，可以随领域变化。
	- `how we think`：推理方式，可以保持通用。

- 早期 KB 主要用逻辑(logic)表示，所以自动推理最开始更像逻辑推理。
- 后来这个框架可以迁移到概率推理(probabilistic reasoning)：
	- KB 变成 graphical model，例如 Bayesian network。
	- inference engine 变成基于 probability theory 的计算规则。

## 逻辑推理 vs 概率推理

- 逻辑推理(logical reasoning)适合处理确定的真假关系。
- 概率推理(probabilistic reasoning)适合处理不确定的 belief。
- 现实世界经常不是简单的 true / false，所以 AI 不能只靠逻辑推理。

**单调逻辑(Monotonic Logic)**

- 单调逻辑的意思是：
	- 如果 $\Delta$ 能推出 $\alpha$，那么加入更多前提 $\Gamma$ 后，$\Delta \cup \Gamma$ 仍然能推出 $\alpha$。
- 问题是：它不擅长撤回旧结论。
- 例子：
	- 一开始认为正常的鸟会飞。
	- 后来知道这只鸟翅膀受伤。
	- 这时应该降低“它会飞”的相信程度，而不是继续保留旧结论。

**信念程度(Degree of Belief)**

- 非单调逻辑(non-monotonic logic)试图处理 assumption 的加入和撤回，但会变得很复杂。
- 另一条路是直接引入信念程度(degree of belief)：
	- 不只问“真假”，而是问“我有多相信它”。
	- 新证据出现后，belief 可以上升或下降。
	- 更新规则由概率演算(probability calculus)控制。

> 核心问题不是“它一定是真的吗”，而是“我现在应该有多相信它”。

## 概率(Probability)

- 信念程度可以有不同解释：
	1. 可能性(possibility)：更接近 fuzzy logic。
	2. 概率(probability)：本课重点。

- 概率有两种常见解释：
	1. 客观频率(objective frequencies)：长期重复实验中的频率。
	2. 主观信念程度(subjective degrees of belief)：基于先验知识、经验和历史数据的相信程度。

- 本课两种解释都会使用，因为它们都服从同一套 probability laws。

## 决策理论(Decision Theory)

- 概率推理告诉我们世界可能是什么样。
- 决策理论(decision theory)告诉我们在这些 belief 下应该怎么行动。

- 决策理论需要额外信息：
	1. 不同 action 的 cost。
	2. 不同 outcome 的 reward / penalty。

> Probability reasoning 负责形成 belief；decision theory 负责把 belief 转成 action。

## 概率推理的早期批评

- 早期 AI 对概率推理有三类批评：
	1. 认知批评(cognitive criticism)：人类似乎不是靠明确概率数值推理。
	2. 实用批评(pragmatic criticism)：概率从哪里来？专家给出的概率是否可靠？
	3. 计算批评(computational criticism)：联合概率分布(joint probability distribution)随变量数指数增长。

- 其中 computational criticism 最关键。
- 因为 AI 需要处理大量变量，如果直接存储和计算完整 joint distribution，成本会爆炸。

## Judea Pearl 和概率推理的复兴

- 80 年代以后，逻辑方法的局限给概率推理带来新的机会。
- Judea Pearl 是这个方向的重要人物。
- 他主张数值化形式体系(numeric formalism)，用概率数值表达和计算 belief。

- 概率推理的优势之一是可以自然处理 belief 的下降：
	- 观察到证据 $B$ 后，可能出现 $P(A) > P(A \mid B)$。
	- 这表示新证据可以让我们更不相信某个命题。

- 贝叶斯网络(Bayesian network)回应了两个核心挑战：
	1. 表示挑战(representation challenge)：用条件独立性(conditional independence)紧凑表示巨大联合分布。
	2. 计算挑战(computational challenge)：利用图结构设计 inference algorithm，降低推理成本。

- 课件提到的典型算法：
	- Polytree algorithm。
	- Junction tree algorithm。

## 贝叶斯网络(Bayesian Network)

- Bayesian network 有两个组成部分：
	1. 结构(structure)：变量和边。
	2. 概率(probabilities)：每个变量相对 parents 的局部概率。

**图结构**

- 节点(node)表示基本命题 / 随机变量(random variables)。
- 边(edge)表示变量之间的依赖关系(dependencies)。
- 很多时候 edge 可以按因果影响(causal influence)理解。
- 但要注意：Bayesian network 不一定必须有因果解释。

**局部概率(Local Probabilities)**

- 每个变量只需要指定它和 parents 的关系。
- 没有 parents 的节点给先验概率(prior probability)，例如 $P(C)$。
- 有 parents 的节点给条件概率表(Conditional Probability Table, CPT)，例如：
	- $P(E \mid Q3, Q4)$
	- $P(J \mid Q4)$
- 没有边的变量之间不直接指定概率。
- 其他概率由 inference algorithm 计算。

## Drew 成绩例子

- 课件用 Drew 的成绩例子说明 Bayesian network 如何建模不确定推理。
- 变量包括：
	- `Q3`：Question 3 是否被批改。
	- `Q4`：Question 4 是否正确。
	- `E`：是否 earned A。
	- `J`：Jack 是否 confirms answer。
	- `C`：是否 clerical error。
	- `R`：是否 reported A。
	- `P`：是否 perception error。
	- `O`：是否 observe A。

- 这个例子的重点不是故事本身，而是：
	- 用变量拆解不确定情境。
	- 用边表达依赖关系。
	- 用 CPT 表示局部概率。
	- 用 inference 推出没有直接写在图里的概率。

## Bayesian Network 的表示优势

- Bayesian network 作为表示工具有三个优点：
	1. 唯一性(unique)：保证定义一个唯一的联合概率分布。
	2. 模块性(modular)：只需要检查变量和 direct causes 的局部关系。
	3. 紧凑性(compact)：在每个节点 parents 不太多时，用多项式数量的概率表示指数级联合分布。

- 它的压缩能力来自 conditional independence：
	- 一个节点只需要关心自己的 parents。
	- 不需要直接列出所有变量组合的 joint probability。

> Bayesian network 只显式存储局部概率，但隐含了完整联合分布。

## Bayesian Network 的推理

- 网络没有直接存储所有概率。
- 但它保证每个 proposition 都有唯一概率值。

- 例如这些概率不一定直接写在网络里，但可以由网络推出：
	- $P(E=true)$
	- $P(Q3=false \mid E=false)$
	- $P(J=true \mid E=true)$

- 这就是 Bayesian network 的核心价值：
	- 表示时只存局部信息。
	- 推理时可以恢复需要的全局概率。

## Bayesian Network 的建模方式

- 构建 Bayesian network 有三种方式：
	1. 根据自己的 domain knowledge 建模。
	2. 从问题描述 / 专家知识中建模(problem specification / expert elicitation)。
	3. 从数据中学习(learning from data)。

- 从数据中学习又可以分成：
	- 只学 probabilities：估计 CPT 参数。
	- 只学 structure：学习哪些变量之间应该有边。
	- structure 和 probabilities 都学：最完整，也最难。

> Maximum likelihood：选择最能解释现有数据的参数。  
> Bayesian approach：在 likelihood 之外加入 prior，参数既要解释数据，也要符合事先信念。

## 图模型(Graphical Models)的分类

- Bayesian network 只是 graphical model 的一种。
- 图模型可以按三组性质分类：

**有向 / 无向(Directed / Undirected)**

- Directed：边有方向，表示有方向的依赖，常常可以按因果理解。
- Undirected：边没有方向，表示对称关联，不强调谁导致谁。

**静态 / 动态(Static / Dynamic)**

- Static：不显式建模时间。
- Dynamic：描述多个时间步之间的变量关系。

**概率 / 决策(Probabilistic / Decisional)**

- Probabilistic：只处理随机变量和概率推理。
- Decisional：加入 decision variables 和 utility variables，用于做决策。

## 本课会涉及的典型模型

- Bayesian classifiers：Directed, Static, Probabilistic。
- Markov chains：Directed, Dynamic, Probabilistic。
- Hidden Markov models：Directed, Dynamic, Probabilistic。
- Markov random fields：Undirected, Static, Probabilistic。
- Bayesian networks：Directed, Static, Probabilistic。
- Dynamic Bayesian networks：Directed, Dynamic, Probabilistic。
- Influence diagrams：Directed, Static, Decisional。
- MDPs / POMDPs：Directed, Dynamic, Decisional。

## 总结

- PGM 是统计学(statistics)和计算机科学(computer science)的结合：
	- statistics 提供 probabilistic reasoning。
	- computer science 提供 graph representation 和 efficient algorithms。

- 它适合处理三类问题：
	1. 世界有不确定性。
	2. 变量数量很多。
	3. 需要高效表示和推理。

> PGM 的直觉：不要枚举整个复杂世界，只刻画局部依赖，再用概率规则把全局推出来。
