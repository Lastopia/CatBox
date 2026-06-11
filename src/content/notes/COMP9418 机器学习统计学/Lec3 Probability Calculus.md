---
date: 2026-06-09
description: COMP9418 概率演算
coreIdeas:
  - probability calculus 用 degree of belief 扩展 propositional logic
  - conditioning 是根据 evidence 更新 belief 的核心规则
  - independence / conditional independence 是后续 graphical model 压缩表示的关键
---
# 主线

- 这节课把上一节 propositional logic 里的 `world` 和 `sentence` 接到概率上。
- 逻辑只问一个 sentence 是否被 KB 蕴含；概率演算(probability calculus)进一步问：我现在应该多相信这个 sentence？
- 做法是给每个 world 一个概率 $P(w)$，再把 sentence 的概率定义成所有 satisfying worlds 的概率总和。
- 新 evidence 出现时，不是重新写一套逻辑规则，而是用 conditioning 把旧 belief 更新成新的 belief。
- 后面 Bayesian network 能压缩 joint probability distribution，靠的就是这节课里的 independence 和 conditional independence。

> Logic 把 world 分成可能 / 不可能；probability 给可能的 worlds 分配 belief；conditioning 用 evidence 重新分配这些 belief。

# Degree of Belief

## 从 sentence 到 event

- 在 propositional logic 里，一个 sentence $\alpha$ 对应一组满足它的 worlds。
- 在 probability calculus 里，可以直接把 $\alpha$ 看成一个 event。
- 如果 $w \models \alpha$，说明 world $w$ 支持事件 $\alpha$ 发生：$P(\alpha) = \sum_{w \models \alpha} P(w)$。
- 一个事件的概率，就是它覆盖的所有 worlds 的概率加起来。

## Joint Probability Distribution

- 一个完整的 belief state 可以写成联合概率分布(joint probability distribution)，它给每个完整 world 都分配一个概率。
- 所有 worlds 的概率必须加起来等于 1，这是 normalization convention。有了这个约定，不同事件之间的 belief 才能直接比较。

**为什么不能直接存 joint distribution**

- 如果有 40 个 Boolean variables，就有 $2^{40}$ 个 entries。
- 这就是后续需要 graphical models 的原因：不能总是显式列出完整 joint distribution。
- 一个简单例子：只看“今天是否下雨”和“我是否带伞”两个 Boolean variables，就已经有 4 个 worlds：下雨带伞、下雨不带伞、不下雨带伞、不下雨不带伞。
- 变量越多，worlds 数量按 $2^n$ 增长；不是内容变复杂一点，而是表格行数直接爆炸。

> Joint distribution 最完整，但也最贵；graphical model 的目标就是利用结构避免枚举所有 worlds。

# Belief 的基本性质

- 对任意 sentence $\alpha$：$0 \le P(\alpha) \le 1$。
- 如果 $\alpha$ inconsistent：$P(\alpha) = 0$。
- 如果 $\alpha$ valid：$P(\alpha) = 1$。
- 一个事件和它的 negation 互补：$P(\alpha) + P(\neg \alpha) = 1$。
- 两个事件的 disjunction：$P(\alpha \lor \beta) = P(\alpha) + P(\beta) - P(\alpha \land \beta)$。

# Entropy

- 一个 belief 接近 0 或 1 时，我们很确定。
- 一个 binary variable 的概率接近 $0.5$ 时，我们最不确定。
- 熵(entropy)用来量化这种不确定性：$H(X) = -\sum_x P(x)\log_2 P(x)$，约定 $0\log 0 = 0$。
- 当 $p = 0$ 或 $p = 1$ 时，entropy 为 0。
- 当 binary variable 的 $p = 0.5$ 时，entropy 最大。
# Updating Beliefs

## Evidence

- 证据(evidence)可以看成一个 event，记作 $\beta$。
- 当我们知道 $\beta$ 为真时，旧 belief state $P(\alpha)$ 要更新成 $P(\alpha \mid \beta)$。
- 更新后的 belief 必须满足：
	- $P(\beta \mid \beta)=1$
	- $P(\neg\beta \mid \beta)=0$
- 所有不满足 evidence 的 worlds 都被置为 0。

## Conditioning 怎么更新

- 对满足 evidence 的 worlds，不应该随意改变它们之间的相对比例。
- 所以 conditioning 做两件事：
	- 删除所有和 evidence 冲突的 worlds。
	- 把剩下 worlds 的概率按比例重新归一化。
- 对任意 world $w$：
	- 如果 $w \models \neg\beta$，则 $P(w \mid \beta)=0$。
	- 如果 $w \models \beta$，则 $P(w \mid \beta)=\frac{P(w)}{P(\beta)}$。
	- $\frac{P(w)}{P(w')}=\frac{P(w|\beta)}{P(w'|\beta)}$, 如果 $w,w'$ 都 entails $\beta$ 
- 这里 $P(\beta)$ 是 normalization constant。
- 一个简单例子：原来三种可能的 world 概率分别是 `0.2`、`0.1`、`0.7`，现在 evidence 排除了 `0.7` 那个 world。
- 剩下 `0.2` 和 `0.1` 的比例原来是 `2:1`，总和是 `0.3`。
- conditioning 后变成 `0.2/0.3=0.667` 和 `0.1/0.3=0.333`，比例仍然是 `2:1`，只是总和重新变成 1。

> Conditioning 不是重新发明 belief，而是在接受 evidence 后，尽量少改动原来的 belief。

## Closed Form

- 对事件 $\alpha$：$P(\alpha \mid \beta)=\frac{P(\alpha \land \beta)}{P(\beta)}$。
- 这个公式叫 Bayes conditioning。
- 它只在 $P(\beta) \ne 0$ 时有定义。

## 简单例子：下雨和地面湿

- 设 $R$ 表示今天下雨，$W$ 表示地面湿。
- 假设 $P(R)=0.3$，$P(W)=0.5$，$P(R \land W)=0.25$。
- 现在看到地面湿了，想更新“今天下雨”的 belief：
	- $P(R \mid W)=\frac{P(R \land W)}{P(W)}=\frac{0.25}{0.5}=0.5$
- 原来只觉得下雨概率是 `0.3`，看到地面湿以后变成 `0.5`。
- evidence 不会直接证明下雨，但会改变我们对下雨的 belief。

**Competing Explanations**

- 一个现象可能有多个解释，知道其中一个解释成立，会降低另一个解释的必要性。
- 简单例子：地面湿可能是因为下雨，也可能是因为洒水器开了。
- 看到地面湿时，你会更相信“下雨”。
- 但如果又知道“洒水器刚开过”，那“下雨”的必要性就下降了。

> 同一个 evidence 可以让两个原本 independent 的原因互相竞争；这会成为后面理解 Bayesian network 中 explaining away 的基础。

# Conditional Entropy

- 条件熵(conditional entropy)衡量观察到 $Y$ 后，$X$ 平均还剩多少不确定性：
	- $H(X \mid Y)=\sum_y P(y)H(X \mid y)$
	- $H(X \mid y)=-\sum_x P(x \mid y)\log_2 P(x \mid y)$
- 平均意义上，conditioning 不会增加 uncertainty：$H(X \mid Y) \le H(X)$。但对某个具体值 $y$，可能出现：$H(X \mid y) > H(X)$。
- 简单例子：$X$ 是“朋友是否带伞”，$Y$ 是“天气预报是否下雨”。
	- 假设 $P(Y=\text{预报下雨})=0.5$，$P(Y=\text{预报不下雨})=0.5$。如果预报下雨，朋友带伞概率是 `0.8`，不带伞概率是 `0.2`：
		- $H(X \mid Y=\text{预报下雨})=-(0.8\log_2 0.8+0.2\log_2 0.2)\approx 0.72$
	- 如果预报不下雨，朋友带伞概率是 `0.1`，不带伞概率是 `0.9`：
		- $H(X \mid Y=\text{预报不下雨})=-(0.1\log_2 0.1+0.9\log_2 0.9)\approx 0.47$
	- 所以平均剩余不确定性是：
		- $H(X \mid Y)=0.5\times 0.72+0.5\times 0.47=0.595$

- 这个公式就是在做加权平均：先分别算每种 evidence 下还剩多少不确定，再按 evidence 出现的概率平均。

# Independence

## Event Independence

- 如果观察 $\beta$ 不改变我们对 $\alpha$ 的 belief，就说 $\alpha$ independent of $\beta$。
- 定义：$P(\alpha \mid \beta)=P(\alpha)$，或 $P(\beta)=0$。
- 等价形式：$P(\alpha \land \beta)=P(\alpha)P(\beta)$。
- 这个等价形式常被直接当作 independence 的定义。
## Independence vs Mutual Exclusiveness

- 互斥(mutual exclusiveness)是逻辑概念：$\mathrm{Mods}(\alpha)\cap \mathrm{Mods}(\beta)=\emptyset$，两个事件不能在同一个 world 同时发生。
- 独立(independence)是概率概念：$P(\alpha \land \beta)=P(\alpha)P(\beta)$，一个事件的发生不改变另一个事件的概率。
- 两者不是一回事。
- 如果两个正概率事件互斥，它们通常不独立：
	- 因为知道一个发生，会直接把另一个的概率降到 0。
- 简单例子：一枚硬币一次投掷，不可能同时是正面和反面，所以“正面”和“反面”互斥。
- 但它们不独立，因为一旦知道是正面，反面的概率立刻变成 0。

> Mutual exclusiveness 说的是“不能一起真”；independence 说的是“知道一个，不影响另一个的 belief”。

# Conditional Independence

## Independence 会随 evidence 改变

- Independence 不是固定标签，而是相对于当前 evidence 的关系。
- 两个原本 independent 的 events，给定某个 evidence 后可能 dependent。
- 两个原本 dependent 的 events，给定某个 evidence 后也可能 independent。

**简单例子：两个同学的迟到**

- 设 $A$ 是 Alice 迟到，$B$ 是 Bob 迟到，$C$ 是今天地铁故障。
- 如果不知道地铁情况，Alice 迟到会让你更怀疑 Bob 也迟到，因为可能是地铁故障。
- 如果已经知道今天地铁故障，Alice 是否迟到就不再额外解释 Bob 是否迟到。
- 所以 $A$ 和 $B$ 原本可能 dependent，但给定 $C$ 后可以 conditionally independent。
- 用小数字看：
	- 不知道地铁情况时，$P(B)=0.2$，但看到 Alice 迟到后 $P(B \mid A)=0.6$。
	- 这说明 $A$ 会改变我们对 $B$ 的 belief，所以 $A$ 和 $B$ dependent。
	- 已经知道地铁故障时，$P(B \mid C)=0.7$。
	- 如果再知道 Alice 也迟到，$P(B \mid A \land C)=0.7$。
	- 在给定 $C$ 后，$A$ 没有再改变 $B$ 的 belief，所以 $A \perp B \mid C$。

## Conditional Independence 的定义

- 事件 $\alpha$ 在给定 $\gamma$ 时 conditionally independent of $\beta$，当且仅当：$P(\alpha \mid \beta \land \gamma)=P(\alpha \mid \gamma)$，或 $P(\gamma)=0$。
- 常用等价形式：$P(\alpha \land \beta \mid \gamma)=P(\alpha \mid \gamma)P(\beta \mid \gamma)$，或 $P(\gamma)=0$。
- Conditional independence 也是对称的。

- 简单例子：设 $\alpha$ 是“Bob 迟到”，$\beta$ 是“Alice 迟到”，$\gamma$ 是“地铁故障”。
- 如果已经知道地铁故障：
	- $P(\text{Bob 迟到}\mid \text{地铁故障})=0.7$
	- $P(\text{Bob 迟到}\mid \text{Alice 迟到} \land \text{地铁故障})=0.7$
- 两个概率一样，说明在给定“地铁故障”后，Alice 迟到没有再改变 Bob 迟到的概率。
- 所以可以写成：$\text{Bob 迟到} \perp \text{Alice 迟到}\mid \text{地铁故障}$。

# Variable Independence

- 很多时候我们不只讨论单个 event，而是讨论变量集合之间的 independence。
- 设 $\mathbf{X}$、$\mathbf{Y}$、$\mathbf{Z}$ 是互不相交的变量集合。
- 写作：$\mathbf{X} \perp \mathbf{Y} \mid \mathbf{Z}$。
- 意思是：对所有 $\mathbf{x}$、$\mathbf{y}$、$\mathbf{z}$ 的 instantiations，$\mathbf{x}$ 和 $\mathbf{y}$ 在给定 $\mathbf{z}$ 后都 independent。
- 这是一种 compact notation （简洁符号表示法）。
- 后续 Bayesian network 的核心，就是用图结构表达大量这样的 conditional independence statements。

# Mutual Information

## Mutual Information

- 互信息(mutual information)衡量观察一个变量能减少另一个变量多少 uncertainty。
- 定义：$MI(X;Y)=\sum_{x,y}P(x,y)\log_2\frac{P(x,y)}{P(x)P(y)}$。

- 简单例子：$X$ 是“朋友是否带伞”，$Y$ 是“天气是否下雨”。
- 如果看天气能明显帮助你猜朋友是否带伞，$MI(X;Y)$ 就大。
- 如果朋友带伞完全看心情，和天气没关系，$MI(X;Y)=0$。
	- $MI(X;Y)\ge 0$
	- 当且仅当 $X$ 和 $Y$ independent 时，$MI(X;Y)=0$
	- $MI(X;Y)=H(X)-H(X \mid Y)=H(Y)-H(Y \mid X)$

## Conditional Mutual Information

- 条件互信息(conditional mutual information)衡量在已知 $Z$ 后，$X$ 和 $Y$ 之间还剩多少信息关联。
- 定义：$MI(X;Y \mid Z)=\sum_{x,y,z}P(x,y,z)\log_2\frac{P(x,y \mid z)}{P(x \mid z)P(y \mid z)}$。
	- $MI(X;Y \mid Z)=H(X \mid Z)-H(X \mid Y,Z)=H(Y \mid Z)-H(Y \mid X,Z)$
- 这和 conditional independence 对应：
	- 如果给定 $Z$ 后 $X$ 和 $Y$ 没有额外信息关系，conditional mutual information 就是 0。

# Probability Calculus 常用规则

## Product Rule

- 从 Bayes conditioning 直接得到：$P(A,B)=P(A \mid B)P(B)$。
- 对三个变量：$P(A,B,C)=P(A \mid B,C)P(B,C)$。

- 简单例子：$B$ 是“今天下雨”，$A$ 是“我带伞”。
- 如果 $P(B)=0.4$，下雨时我带伞的概率 $P(A \mid B)=0.8$，那么“下雨且我带伞”的概率是 $0.8\times 0.4=0.32$。

## Case Analysis

- Case analysis 也叫全概率公式(law of total probability)。
- 如果 $\beta_1,\dots,\beta_n$ 互斥且穷尽(mutually exclusive and exhaustive)，则：$P(\alpha)=\sum_i P(\alpha \land \beta_i)$。
- 也可以写成：$P(\alpha)=\sum_i P(\alpha \mid \beta_i)P(\beta_i)$。
- 把整个 sample space 切成互不重叠的 cases，然后把每个 case 对 $\alpha$ 的贡献加起来。

	![[Pasted image 20260609181823.png]]

## Chain Rule

- Chain rule 是反复使用 product rule：
	- $P(\alpha_1 \land \alpha_2 \land \cdots \land \alpha_n)$
	- $=P(\alpha_1 \mid \alpha_2,\dots,\alpha_n)P(\alpha_2 \mid \alpha_3,\dots,\alpha_n)\cdots P(\alpha_n)$
- 它说明 joint probability 可以拆成一串 conditional probabilities。

- 简单例子：想算“下雨、我带伞、我鞋子湿”的概率，可以拆成：
	- $P(\text{鞋湿}\mid \text{下雨, 带伞})P(\text{带伞}\mid \text{下雨})P(\text{下雨})$
- 如果这三个数分别是 `0.3`、`0.8`、`0.4`，总概率就是 `0.3\times 0.8\times 0.4=0.096`。
- 后续 Bayesian network 的 factorization 会把这个思想图结构化。

## Bayes Rule

- Bayes rule / Bayes theorem：$P(\alpha \mid \beta)=\frac{P(\beta \mid \alpha)P(\alpha)}{P(\beta)}$。
- 常见用法：
	- $\alpha$ 是 cause。
	- $\beta$ 是 effect / observation。
	- 我们观察到 effect 后，反推 cause 的概率。
- 在下面的例子里，cause 是“感冒”，effect 是“咳嗽”，目标是从咳嗽反推感冒概率。

**简单例子：感冒和咳嗽**

- 设 $C$ 是“感冒”，$K$ 是“咳嗽”。
- 假设 $P(C)=0.1$，感冒时咳嗽的概率 $P(K \mid C)=0.8$，总体咳嗽概率 $P(K)=0.2$。
- 看到一个人在咳嗽，反推他感冒的概率：
	- $P(C \mid K)=\frac{P(K \mid C)P(C)}{P(K)}=\frac{0.8\times 0.1}{0.2}=0.4$
- 咳嗽让感冒的 belief 从 `0.1` 升到 `0.4`，但没有变成 1，因为咳嗽也可能由别的原因造成。

> Bayes rule 的核心不是公式本身，而是把 prior、likelihood 和 evidence 合在一起，从 observation 回推 hidden cause。

# 总结

- Probability calculus 给 propositional logic 加上 degree of belief。
- 一个 sentence 的 probability 是它对应的 satisfying worlds 的概率总和。
- Conditioning 是根据 evidence 更新 belief 的规则：
	- 排除冲突 worlds。
	- 保留相容 worlds 的相对比例。
	- 重新 normalization。
- Entropy 和 mutual information 用来量化 uncertainty 以及 information gain。
- Independence 表示一个 event 不改变另一个 event 的 belief。
- Conditional independence 表示这种“不影响”只在给定某些 evidence 后成立。
- Product rule、case analysis、chain rule、Bayes rule 是后续推导 graphical models 的基本工具。

> 这节课真正要带走的是：概率演算把“不确定的世界”变成可计算的 belief system，而 conditional independence 是让这个系统可扩展的关键。
