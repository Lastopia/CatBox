---
date: 2026-06-09
description: COMP9418 命题逻辑
coreIdeas:
  - 命题逻辑用 true / false 的 sentence 表示确定性知识
  - world 是完整变量赋值，sentence 可以看成一组 satisfying worlds
  - 命题逻辑是后续概率演算的基础，但它本身不适合处理 uncertainty
---
# 主线

- 这节课介绍命题逻辑(propositional logic)的语法(syntax)和语义(semantics)。
- 重点不是重新学一遍逻辑符号，而是把逻辑里的 `sentence`、`world`、`model` 和后面的概率概念接起来。
- 命题逻辑适合表达确定性的 true / false 关系。
- 它的限制也很明显：逻辑推理是单调的(monotonic)，而且没有自然机制表达 uncertain events。

> 本节最重要的桥：`sentence = event`，`world = sample point`，`models = satisfying worlds`。

# Syntax

## 命题变量和句子

- 命题变量(propositional variable)也叫 Boolean variable / binary variable。
- 每个变量只有两个值：`true` 或 `false`。
- 最简单的句子(sentence)是一个原子句子(atomic sentence)，例如 $P_i$，意思是变量 $P_i$ 为真。
- 如果 $\alpha$ 和 $\beta$ 是句子，那么下面这些也是句子：
  - $\neg \alpha$：negation，不是 $\alpha$。
  - $\alpha \land \beta$：conjunction，$\alpha$ 和 $\beta$ 都真。
  - $\alpha \lor \beta$：disjunction，$\alpha$ 或 $\beta$ 至少一个真。
- 其他常用 connective：
  - $\alpha \Rightarrow \beta$：implication，如果 $\alpha$ 真，则 $\beta$ 真。
  - $\alpha \Leftrightarrow \beta$：equivalence，二者真假总是相同。

**Implication 不等于因果**

- $\alpha \Rightarrow \beta$ 表达的是真值约束：不能出现 $\alpha$ 真但 $\beta$ 假的 world。
- 它不自动说明 $\alpha$ 在现实中导致 $\beta$。
- 这个区别后面看 Bayesian network 的 edge 时也会再次出现：形式关系和因果解释不是同一件事。

## Connective 的定义关系

- $\Rightarrow$ 和 $\Leftrightarrow$ 可以用基础 connective 定义：
  - $\alpha \Rightarrow \beta \equiv \neg \alpha \lor \beta$
  - $\alpha \Leftrightarrow \beta \equiv (\alpha \Rightarrow \beta) \land (\beta \Rightarrow \alpha)$
- 直觉上，$\alpha \Rightarrow \beta$ 只排除一种情况：$\alpha$ 真而 $\beta$ 假。
- $\alpha \Leftrightarrow \beta$ 则要求两个方向都成立。

## Knowledge Base

- 命题知识库(propositional knowledge base, KB)是一组命题句子。
- 如果 KB 里有 $\alpha_1, \alpha_2, \dots, \alpha_n$，整体上可以看成：
  - $\alpha_1 \land \alpha_2 \land \cdots \land \alpha_n$
- 所以往 KB 里加入一句话，本质是在加入一个新的约束。
- 约束越多，剩下可能成立的 world 通常越少。

## 电路例子

- 逻辑电路可以用命题逻辑表示。
- 常见做法是给每一根 wire 一个命题变量。
- 变量为真表示这根 wire 是 high，变量为假表示 low。
- 然后用一组句子描述 gate 的行为。

![[Pasted image 20260608223726.png]]

# Semantics

## 为什么需要语义

- Syntax 只告诉我们句子怎么写。
- Semantics 说明句子在什么情况下为真。
- 有了 semantics，才能严格定义：
  - consistency：一句话是否可能为真。
  - validity：一句话是否永远为真。
  - implication：一句话是否推出另一句话。
  - equivalence：两句话是否等价。
  - mutual exclusiveness：两句话是否互斥。
- 简单句子可以靠直觉判断；复杂句子需要 formal definition。

## World

- 一个 world 是完整状态：每个变量的值都已经确定。
- 如果有 $n$ 个 Boolean variables，就有 $2^n$ 个 possible worlds。
- 例如 `Earthquake`、`Burglary`、`Alarm` 三个变量会产生 $2^3 = 8$ 个 worlds。
- 一个 world 也叫：
  - truth assignment
  - variable assignment
  - variable instantiation
- 可以把 world 理解成概率论里的 sample point。

## Models

- $w \models \alpha$ 表示 sentence $\alpha$ 在 world $w$ 中为真。
- 也可以说 world $w$ satisfies $\alpha$。
- $\mathrm{Mods}(\alpha) = \{w : w \models \alpha\}$。
- $\mathrm{Mods}(\alpha)$ 是所有让 $\alpha$ 为真的 worlds 的集合。
- 这个集合也叫 $\alpha$ denoted event。

> 命题逻辑里，一个 sentence 对应一组 worlds；概率论里，一个 event 也对应一组 sample points。所以本课可以把 `sentence` 和 `event` 暂时互换使用。

## Connective 对应集合运算

- $\mathrm{Mods}(\alpha \land \beta) = \mathrm{Mods}(\alpha) \cap \mathrm{Mods}(\beta)$。
  - 两个条件都要满足，所以取交集。
- $\mathrm{Mods}(\alpha \lor \beta) = \mathrm{Mods}(\alpha) \cup \mathrm{Mods}(\beta)$。
  - 至少满足一个，所以取并集。
- $\mathrm{Mods}(\neg \alpha) = \Omega - \mathrm{Mods}(\alpha)$。
  - $\Omega$ 是所有 possible worlds 的全集。
- 这就是 logic 和 probability 的连接点：以后给 event 赋概率，本质就是给一组 worlds 赋概率质量。

# Logical Properties

## Consistency / Satisfiability

- 句子 $\alpha$ 是 consistent，当且仅当至少存在一个 world 让它为真：
  - $\mathrm{Mods}(\alpha) \neq \emptyset$
- 如果没有任何 world 让它为真，它就是 inconsistent / unsatisfiable：
  - $\mathrm{Mods}(\alpha) = \emptyset$
- 例子：
  - $A \land \neg A$ 是 inconsistent，因为不可能同时真和假。
- 符号 `false` 常用来表示永远不可能满足的句子。

## Validity

- 句子 $\alpha$ 是 valid，当且仅当它在每个 world 中都为真：
  - $\mathrm{Mods}(\alpha) = \Omega$
- 如果一个句子不是 valid，就一定能找到至少一个 counterexample world 让它为假。
- 例子：
  - $A \lor \neg A$ 是 valid，因为不管 $A$ 真还是假，这句话都成立。
- 符号 `true` 常用来表示永远成立的句子。
- 也可以直接写 $\models \alpha$ 表示 $\alpha$ 是 valid。

# Logical Relationships

## 四种关系

- Logical properties 关注单个句子。
- Logical relationships 关注两个或多个句子之间的关系。

**Equivalence**

- $\alpha$ 和 $\beta$ equivalent，当且仅当它们在完全相同的 worlds 中为真：
  - $\mathrm{Mods}(\alpha) = \mathrm{Mods}(\beta)$
- 例子：
  - $A \lor B$ 等价于 $B \lor A$。
  - $A \Rightarrow B$ 等价于 $\neg B \Rightarrow \neg A$，这叫 contraposition。

**Mutual Exclusiveness**

- $\alpha$ 和 $\beta$ mutually exclusive，当且仅当它们不能在同一个 world 中同时为真：
  - $\mathrm{Mods}(\alpha) \cap \mathrm{Mods}(\beta) = \emptyset$

**Exhaustiveness**

- $\alpha$ 和 $\beta$ exhaustive，当且仅当每个 world 至少满足其中一个：
  - $\mathrm{Mods}(\alpha) \cup \mathrm{Mods}(\beta) = \Omega$

**Implication / Entailment**

- $\alpha$ implies $\beta$，当且仅当只要 $\alpha$ 为真，$\beta$ 就一定为真：
  - $\mathrm{Mods}(\alpha) \subseteq \mathrm{Mods}(\beta)$
- 也写作：
  - $\alpha \models \beta$
- 例子：
  - $A$ 和 $(A \Rightarrow B)$ together imply $B$。

## 常用等价式

- Double negation：
  - $\neg\neg\alpha \equiv \alpha$
- de Morgan：
  - $\neg(\alpha \land \beta) \equiv \neg\alpha \lor \neg\beta$
  - $\neg(\alpha \lor \beta) \equiv \neg\alpha \land \neg\beta$
- Distribution：
  - $\alpha \lor (\beta \land \gamma) \equiv (\alpha \lor \beta) \land (\alpha \lor \gamma)$
  - $\alpha \land (\beta \lor \gamma) \equiv (\alpha \land \beta) \lor (\alpha \land \gamma)$
- Contraposition：
  - $\alpha \Rightarrow \beta \equiv \neg\beta \Rightarrow \neg\alpha$
- Definition of implication：
  - $\alpha \Rightarrow \beta \equiv \neg\alpha \lor \beta$
- Definition of equivalence:
- $\alpha \Leftrightarrow \beta \equiv (\alpha \Rightarrow \beta) \land (\alpha \Rightarrow \beta)$

## 把关系转成 satisfiability / validity

- $\alpha$ implies $\beta$：
  - 等价于 $\alpha \land \neg\beta$ unsatisfiable。
  - 也等价于 $\alpha \Rightarrow \beta$ valid。
- $\alpha$ 和 $\beta$ equivalent：
  - 等价于 $\alpha \Leftrightarrow \beta$ valid。
- $\alpha$ 和 $\beta$ mutually exclusive：
  - 等价于 $\alpha \land \beta$ unsatisfiable。
- $\alpha$ 和 $\beta$ exhaustive：
  - 等价于 $\alpha \lor \beta$ valid。

> 复习时可以把 implication 想成集合包含：$\alpha$ 的 satisfying worlds 必须全部落在 $\beta$ 的 satisfying worlds 里面。

# Monotonicity

## 单调性是什么

- 命题逻辑是 monotonic logic。
- 意思是：如果一组知识 $\Delta$ 已经推出 $\alpha$，那么加入更多知识 $\Gamma$ 后，$\Delta \cup \Gamma$ 仍然推出 $\alpha$。
- 加知识只会缩小 possible worlds 的集合，不会撤回已经由逻辑保证的结论。

**直觉**

- KB 是一组约束。
- 每加入一个 sentence，就是把不满足它的 worlds 删掉。
- 如果 $\alpha$ 在原来所有剩下的 worlds 中都成立，那么删掉一部分 worlds 后，$\alpha$ 仍然成立。

## 为什么这会成为限制

- 现实推理经常需要降低或撤回 belief。
- 例如新证据出现后，我们可能不再相信某个默认结论。
- 但经典命题逻辑只处理 true / false 的 entailment，不处理“相信程度”的升降。
- 这就是为什么课程后面要转向 probabilistic reasoning。

> 命题逻辑里，更多信息只会排除 worlds；概率推理里，更多 evidence 可以重新分配 belief，让某个命题的概率上升或下降。

# Multivalued Variables

## 从 Boolean 到多值变量

- 标准 propositional variables 是 binary：只有 true / false。
- 课件把这个形式推广到 multivalued variables。
- 例如 `Alarm` 不只是 true / false，而可以取：
  - `high`
  - `low`
  - `off`
- 这时句子要显式写成变量取值：
  - $Alarm = high$
  - $Burglary = true \Rightarrow Alarm = high$
- 语义仍然类似：句子排除所有不满足它的 worlds。

## 为什么这一步重要

- 后续概率图模型里的随机变量通常不是纯 Boolean。
- 一个变量可能有多个取值，例如天气、成绩、疾病状态、观测类别。
- 所以这里先把命题逻辑扩展成变量赋值的语言，为后续 probability calculus 做记号准备。

# Variable Instantiation

## 实例化的记号

- 一个变量实例化(variable instantiation)可以写成：
  - $A=a \land B=b \land C=c$
- 为了简洁，后面会写成：
  - $a, b, c$
- 空变量集合的实例化叫 trivial instantiation，记作 $\top$。
- 记号约定：
  - 大写字母 $A$ 表示变量。
  - 小写字母 $a$ 表示变量的某个值。
  - $|A|$ 表示变量 $A$ 的取值个数。
  - 粗体大写 $\mathbf{A}$ 表示一组变量。
  - $\mathbf{A}^{\#}$ 表示这一组变量能实例化多少种情况
  - 粗体小写 $\mathbf{a}$ 表示这组变量的一种 joint instantiation，$\mathbf{\alpha} = \{A = a1, B = b2, C = c1\}$
	![[Pasted image 20260609111733.png]]
## Boolean shorthand

- 对 Boolean variable $A$：
  - $a$ 表示 $A=true$。
  - $\bar a$ 表示 $A=false$。
- $\mathbf{x} \sim \mathbf{y}$ 表示两个 instantiations compatible。
- compatible 的意思是：它们在共同变量上的赋值不冲突。
	![[Pasted image 20260609111750.png]]

# 总结

- 命题逻辑提供了一个清晰的 deterministic reasoning framework。
- Syntax 负责规定 sentence 怎么写。
- Semantics 通过 world / model 解释 sentence 什么时候为真。
- Logical properties 和 logical relationships 都可以转成 satisfying worlds 的集合关系。
- 它和概率论的连接非常直接：
  - world 对应 sample point。
  - sentence 对应 event。
  - models 对应 event 包含的 sample points。
- 它的主要限制是 monotonicity 和无法自然表达 uncertainty。
- 下一步就是用概率推理(probabilistic reasoning)扩展这套框架，让我们可以处理 uncertain events 和 degree of belief。

> Logic 给我们“哪些 world 还可能”；probability 接着问“这些 possible worlds 各有多可信”。
