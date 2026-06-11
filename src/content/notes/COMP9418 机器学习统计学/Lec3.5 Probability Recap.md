---
date: 2026-06-09
description: COMP9418 概率复习
coreIdeas:
  - 用 murder mystery 例子串起 prior、conditional、joint、marginal 和 posterior
  - Bayesian network 把变量关系写成图，把概率表写成局部分布
  - Bayes theorem 支持从 observation 反推 hidden cause
---
# 主线

- 这节 recap 用一个 murder mystery 例子复习概率推理(probabilistic reasoning)的基本规则。
- 例子里有两个随机变量(random variables)：凶手 `Culprit` 和凶器 `Weapon`。
- `Culprit` 的 prior distribution 表示看到新证据之前，我们对谁是凶手的 belief。
- `Weapon | Culprit` 的 conditional distribution 表示在已知凶手是谁时，不同凶器的可能性。
- 把 prior 和 conditional 乘起来，可以得到联合分布(joint distribution)。
- 从 joint distribution 可以再算 marginal distribution 和 posterior distribution。
- 这条链就是 Bayesian network 后面反复使用的基本套路：局部概率表 -> joint -> observation 后更新 belief。

> 这节课最该记住的是：prior 是观察前的 belief，posterior 是观察后的 belief；Bayes theorem 让我们可以沿着图的反方向推理。

# Murder Mystery 例子

## 随机变量

- 案件有两个 suspects：Butler 和 Cook。
- 可能的凶器有三个：Pistol、Knife、Poker。
- 可以把凶手写成变量 `Culprit = {Butler, Cook}`。
- 可以把凶器写成变量 `Weapon = {Pistol, Knife, Poker}`。
- 一个完整 world 是这两个变量的一组 joint instantiation，例如 `Culprit = Cook, Weapon = Pistol`。

## Prior Distribution

- 先验分布(prior distribution)是在观察具体凶器之前，对 `Culprit` 的 belief。
- 课件给出的背景信息是：Butler 服务多年，Cook 新近雇佣且有可疑传闻。
- 因此 prior 写成：
	- $P(Culprit=Butler)=0.2$
	- $P(Culprit=Cook)=0.8$
- 这两个概率必须加起来等于 1，因为 `Culprit` 只能是 Butler 或 Cook。
- 在图模型里，`P(Culprit)` 可以看成一个 node 的本地概率表。

## Conditional Distribution

- 条件分布(conditional distribution)描述在知道凶手是谁之后，凶器的概率怎么变。
- 课件里的背景信息是：Butler 有枪，Cook 更容易接触刀，Butler 年纪较大。
- 条件概率表是 $P(Weapon \mid Culprit)$：
	- 如果 `Culprit = Cook`：Pistol `0.05`，Knife `0.65`，Poker `0.30`。
	- 如果 `Culprit = Butler`：Pistol `0.80`，Knife `0.10`，Poker `0.10`。
- 每一行都要加起来等于 1，因为在固定某个凶手之后，三种凶器仍然覆盖所有可能。
- 这个表不是说 Weapon 导致 Culprit，而是说在不同 Culprit 条件下，Weapon 的分布不同。
	![[Pasted image 20260610193705.png]]

# Bayesian Network

- 贝叶斯网络(Bayesian network)用有向图表示变量之间的依赖关系。
- 这个例子里只有两个 node：`Culprit` 和 `Weapon`。
- 边的方向是 `Culprit -> Weapon`，表示凶手身份会影响凶器分布。
- 网络需要两个局部概率表：
	- root node 的 prior：$P(Culprit)$。
	- child node 的 conditional：$P(Weapon \mid Culprit)$。
- 后续课程会把这种结构推广到很多变量；核心思想仍然是用局部 conditional distributions 避免直接手写巨大 joint distribution(。
>联合分布就是所有具体的可能性的概率

> Bayesian network 的图结构告诉我们“哪些变量直接影响哪些变量”；概率表告诉我们“影响的强度是多少”。

# Joint Distribution

## Product Rule

- 联合分布(joint distribution)给每个完整组合分配概率。
- 在这个网络里，一个完整组合就是一个凶手加一个凶器。
- Product rule 把 joint 拆成 conditional 和 prior：$P(Weapon, Culprit)=P(Weapon \mid Culprit)P(Culprit)$。
- 例如 Cook 用 Pistol 的概率是：$P(Weapon=Pistol,Culprit=Cook)=0.05\times0.8=0.04$。
- 这个 `0.04` 表示所有可能案件里，“Cook 是凶手且凶器是 Pistol”这一格占 4%。

## 六个 joint entries

- 用同样方法可以得到六个组合：
	- `Cook, Pistol`：$0.8\times0.05=0.04$。
	- `Cook, Knife`：$0.8\times0.65=0.52$。
	- `Cook, Poker`：$0.8\times0.30=0.24$。
	- `Butler, Pistol`：$0.2\times0.80=0.16$。
	- `Butler, Knife`：$0.2\times0.10=0.02$。
	- `Butler, Poker`：$0.2\times0.10=0.02$。
- 六个 joint entries 加起来等于 1，说明它们覆盖了所有可能的完整 world。
- Joint distribution 最完整，因为之后要问任何关于 `Culprit` 或 `Weapon` 的概率，都可以从它加总出来。

# Marginal Distribution

## Sum Rule

- 边缘分布(marginal distribution)是不关心某些变量时，把它们加掉以后得到的分布。
- Sum rule 的核心动作是：沿着不关心的维度求和。
- 如果只关心 `Culprit`，就把每个凶手对应的三种凶器加起来：
	- $P(Culprit=Cook)=0.04+0.52+0.24=0.8$。
	- $P(Culprit=Butler)=0.16+0.02+0.02=0.2$。
- 这会回到原来的 prior，因为把 `Weapon` 加掉以后，只剩 `Culprit` 本身。

## Weapon 的 marginal

- 如果只关心 `Weapon`，就把每种凶器下的两个凶手加起来：
	- $P(Weapon=Pistol)=0.04+0.16=0.20$。
	- $P(Weapon=Knife)=0.52+0.02=0.54$。
	- $P(Weapon=Poker)=0.24+0.02=0.26$。
- 这个分布告诉我们，在没有观察凶手是谁的情况下，每种凶器整体上有多可能。
- 其中 $P(Weapon=Pistol)=0.20$ 后面会作为 Bayes theorem 的 denominator。

> Marginalization 就是“我不关心这个变量了，把它所有可能值的贡献加起来”。

# Posterior Distribution

## Observation 更新 belief

- 后验分布(posterior distribution)是在看到 observation / evidence 之后的 belief。
- 课件的 observation 是：crime scene 发现了 Pistol。
- 现在我们想问：看到 Pistol 之后，Butler 和 Cook 分别有多可疑？
- 只看 joint table 里 `Weapon = Pistol` 的那一列：
	- `Cook, Pistol` 是 `0.04`。
	- `Butler, Pistol` 是 `0.16`。
- Pistol 这一列总和是 `0.20`，所以要把这一列重新 normalization。

## Reasoning Backwards

- 从 `Culprit -> Weapon` 的方向看，Culprit 是 cause，Weapon 是 effect。
- 看到 Pistol 后反推 Culprit，就是 reasoning backwards。
- 后验概率是：
	- $P(Culprit=Cook \mid Weapon=Pistol)=\frac{0.04}{0.20}=0.2$。
	- $P(Culprit=Butler \mid Weapon=Pistol)=\frac{0.16}{0.20}=0.8$。
- 观察 Pistol 之后，Butler 的 belief 从 prior 的 `0.2` 上升到 posterior 的 `0.8`。
- 这就是课件里说的 “This looks bad for the Butler!”。

# Bayes Theorem

## Prior / Posterior / Likelihood

- Bayes theorem 把 observation 前后的 belief 连接起来：$P(Culprit \mid Weapon)=\frac{P(Weapon \mid Culprit)P(Culprit)}{P(Weapon)}$。
- 公式里的 $P(Culprit)$ 是 prior，表示观察凶器之前谁更可能是凶手。
- $P(Weapon \mid Culprit)$ 是 likelihood，表示如果某人是凶手，看到某种凶器有多合理。
- $P(Weapon)$ 是 denominator / evidence probability，负责 normalization。
- $P(Culprit \mid Weapon)$ 是 posterior，表示看到凶器之后重新更新的凶手分布。

## Denominator

- Denominator 不是随便补上的常数，而是 observation 本身发生的总概率。
- 对 Pistol 来说：$P(Weapon=Pistol)=P(Pistol \mid Cook)P(Cook)+P(Pistol \mid Butler)P(Butler)$。
- 代入数字：$0.05\times0.8+0.80\times0.2=0.04+0.16=0.20$。
- 它把所有可能 cause 对 observation 的贡献加起来。
- 因此 Bayes theorem 也可以理解成：某个 cause 对 observation 的贡献，占 observation 总概率的比例。

## Incremental Belief Update

- Prior 是某次 observation 之前的 belief。
- Posterior 是同一次 observation 之后的 belief。
- 如果之后又来一个新 observation，这次 posterior 就会成为下一次更新的 prior。
- 所以 Bayesian updating 是 incremental 的：证据可以一条一条来，belief 也跟着逐步更新。

> Bayes theorem 的实用意义是：我们通常容易建模 $P(effect \mid cause)$，但真正想知道的是看到 effect 后 $P(cause \mid effect)$。

# Rules of Probability

## Sum Rule

- Sum rule 用来从 joint distribution 得到 marginal distribution。
- 对离散变量来说：$P(Y)=\sum_x P(X=x,Y)$，意思是把所有可能的 $X$ 都加掉。
- 在例子里，算 Pistol 的 marginal 就是把 Cook 和 Butler 两行相加。

## Product Rule

- Product rule 用来把 joint probability 拆成 conditional probability 和 marginal probability。
- 基本形式：$P(X,Y)=P(Y \mid X)P(X)$。
- 在例子里，算 `Cook, Pistol` 的 joint 就是 $P(Pistol \mid Cook)P(Cook)$。

## Bayes Theorem

- Bayes theorem 用来交换 conditioning 的方向：$P(X \mid Y)=\frac{P(Y \mid X)P(X)}{P(Y)}$。
- 在例子里，它把 $P(Weapon \mid Culprit)$ 变成 $P(Culprit \mid Weapon)$。
- 这就是从凶器反推凶手的数学形式。

## Denominator / Evidence

- Denominator 常用 sum rule 展开：$P(Y)=\sum_x P(Y \mid X=x)P(X=x)$。
- 它保证所有 posterior probabilities 加起来等于 1。
- 复习时可以把 denominator 看成“所有可能解释一起产生这个 observation 的总概率”。

# 总结

- `Culprit` 的 prior 表示观察前 belief。
- `Weapon | Culprit` 的 conditional distribution 表示在给定凶手后，凶器如何分布。
- Product rule 把两者合成 joint distribution。
- Sum rule 从 joint distribution 里加掉不关心的变量，得到 marginal distribution。
- 观察到 Pistol 后，把 Pistol 那一列重新 normalization，就得到 posterior distribution。
- Bayes theorem 概括了这个过程：用 prior、likelihood 和 evidence probability 从 observation 反推 hidden cause。

> 这节 recap 是后续 Bayesian network 的最小工作例子：图给出 factorization，概率规则负责从 evidence 更新 belief。
