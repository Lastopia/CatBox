---
date: 2026-06-10
description: COMP9418 Bayesian networks
coreIdeas:
  - Bayesian network 用 DAG 和 CPT 紧凑表示 joint probability distribution
  - 图结构表达 conditional independence，参数表达 dependency 的强度
  - d-separation 是从图中读出 independence 的核心测试
---
# 主线

- 这节课介绍贝叶斯网络(Bayesian network, BN)作为建模工具，用来指定联合概率分布(joint probability distribution)。
- 直接写 joint distribution 的问题是大小随变量数指数增长，建模和计算都会很困难。
- Bayesian network 的做法是把问题拆成两部分：
	- 图结构(graph structure)：用 DAG(有向无环图) 表达变量之间的 conditional independence。
	- 参数化(parametrisation)：用 conditional probability tables 表达依赖强度。
- 图本身只限制哪些分布是允许的，不会唯一确定一个分布。
- 图加上每个变量的 CPT 后，才会唯一诱导出一个完整的 joint distribution。
- 后半节课的重点是：如何从图中判断 independence，尤其是 d-separation。

> Bayesian network 的核心不是“画一张因果图”，而是用图把 joint distribution 分解成很多小的 local distributions。

# Graphs and Independence

## DAG 的基本解释

- 有向无环图(directed acyclic graph, DAG)由 nodes 和 directed edges 组成。
- 在 Bayesian network 里，nodes 表示随机变量(random variables)。
- 课件先用因果语言帮助理解 edges：一个 node 的 parents 可以看成它的 direct causes。
- 例子里的变量包括：
	- `Earthquake(E)`：是否地震。
	- `Burglary(B)`：是否入室盗窃。
	- `Alarm(A)`：警报是否响。
	- `Radio(R)`：广播是否报告地震。
	- `Call(C)`：邻居是否打电话。
- 图里的典型关系是：`Earthquake` 和 `Burglary` 影响 `Alarm`，`Earthquake` 影响 `Radio`，`Alarm` 影响 `Call`。

## belief dynamic

- 图结构会暗示一些 belief update 的性质。
- 例如听到 `Radio` 报告地震，会提高对 `Earthquake` 的 belief。
- `Earthquake` 又会提高 `Alarm` 触发的 belief，从而提高 `Call` 的 belief。
- 但如果已经知道 `Alarm` 没响，那么 `Radio` 对 `Call` 的影响会被切断。
- 可以写成：$C \perp R \mid \neg A$。
- 这里的意思是：给定 `Alarm` 没响后，`Radio` 是否报告地震不再改变对 `Call` 的 belief。
	![[Pasted image 20260611101014.png]]

**箭头方向在 independence 里的作用（后面会讲）**
- 箭头方向用于识别以下三种结构：
	- Sequential
	- Divergent (分歧)
	- Convergent / Collider (对撞)
- 在追溯（顺序是自上而下，不是自下而上）独立性关系的过程中，Sequential 和 Divergent 都是默认open的，除非路径上存在被观测的点，观测的点被视为 blocked.
- Convergent 则相反，默认为是blocked，但是Converent本身或者其子节点 (Descendant) 被观测到，则会open
- 知道 A=true：$C \perp R \mid A$
- 知道 A=false：$C \perp R \mid \neg A$ 
# Markovian Assumptions

## Parents / Descendants / Non-descendants

- 对 DAG 中一个变量 $V$：
	- $Parents(V)$ 是所有指向 $V$ 的直接父节点。
	- $Descendants(V)$ 是从 $V$ 出发沿有向边能到达的后代节点。
	- $Non\_Descendants(V)$ 是除了 $V$、$Parents(V)$ 和 $Descendants(V)$ 以外的变量。
- 以图中的 `Alarm(A)` 为例：
	![[Pasted image 20260611101014.png]]
	- $Parents(A)=\{E,B\}$，因为 `Earthquake(E)` 和 `Burglary(B)` 都有箭头指向 `Alarm(A)`。
	- $Descendants(A)=\{C\}$，因为从 `Alarm(A)` 沿箭头可以到达 `Call(C)`。如果C->D, 那么D也是
	- $Non\_Descendants(A)=\{R\}$，因为 `Radio(R)` 既不是 `A` 的 parent，也不是 `A` 的 descendant。
- 所以对 `Alarm(A)` 的 local Markov assumption 是：$A \perp R \mid E,B$。
- 这句话的含义是：如果已经知道 `Earthquake(E)` 和 `Burglary(B)`，那么 `Radio(R)` 不会再额外改变我们对 `Alarm(A)` 的 belief。
- 但如果只看 `A` 和 `R` 之间的路径，其实只需要 observe `E` 就能 blocked：$A \perp R \mid E$。
- 因为 `R \leftarrow E \to A` 是 divergent path，给定 common cause `E` 后，`R` 不再给 `A` 提供额外信息。

>Local Markov Assumptions：
	- $V \perp Non\_Descendants(V) \mid Parents(V)$
	- 注意，这里的大写字母不是具体的T/F值，只是被观测到，并不一定是T

## causal reading

- 如果把 DAG 看成 causal structure，那么 parents 是 direct causes，descendants 是 effects。
- 给定 direct causes 后，一个变量不应该再被其他 non-descendants 影响。
- 但 effects 仍然可能影响我们对这个变量的 belief，因为观察 effect 可以反推 cause。
- 这也是为什么定义里排除了 descendants。
>即 $V \perp Non\_Descendants(V) \mid Descendants(V)$ 不成立

## alarm graph 的 Markov assumptions

- 在 `Earthquake/Burglary/Alarm/Radio/Call` 图里，课件列出的 Markov assumptions 包括：
	- $C \perp B,E,R \mid A$。
	- $R \perp A,B,C \mid E$。
	- $A \perp R \mid B,E$。
	- $B \perp E,R$。
	- $E \perp B$。
- 这些 independence statements 合起来记作 $Markov(G)$。
- 图 $G$ 是 partial specification：它要求分布 $P$ 满足 $Markov(G)$，但还没有给出具体概率数值。

> 图结构告诉我们哪些信息在给定 parents 后不再相关；CPT 才告诉我们剩下的相关性有多强。

# Causality

- DAG 的形式解释是 conditional independences，不是 causality。
- 也就是说，数学上 DAG 只声明哪些变量在给定哪些变量后 independent。
- 可以画出不符合直觉因果方向的 DAG，但它仍然可能表达同一组 independences。
- 现实建模时，专家通常更容易给出 causal graph，因为 causal parents 的 CPT 更自然。
- 所以 causality 是建模上的好用语言，但不是 BN 定义本身的一部分。

# Parametrisation

## CPT（条件概率表）

- 参数化(parametrisation)是在图结构之外，为每个变量指定条件概率。
- 对 DAG 中每个变量 $X$ 和它的 parents $\mathbf{U}$，需要给出：
	- $P(x \mid \mathbf{u})$，对每个 $X$ 的取值 $x$ 和每个 parents instantiation $\mathbf{u}$ 都要给。
- 这个表叫条件概率表(conditional probability table, CPT)。
- 对固定的 $\mathbf{u}$，所有 $x$ 的概率必须加起来等于 1：$\sum_x P(x \mid \mathbf{u})=1$。
- 所以每一行 CPT 都是一个完整的 local distribution。

> 马尔科夫假设CPT设置的影响就是我只需要看他的parents，并且根据他的parents来建立CPT就行了。
## winter 例子
![[Pasted image 20260611112814.png]]
- 课件用一个小图说明 CPT 怎么指定：
	- `Winter(A)` 影响 `Sprinkler(B)` 和 `Rain(C)`。
	- `Rain(C)` 影响 `Slippery Road(E)`。
	- `Sprinkler(B)` 和 `Rain(C)` 一起影响 `Wet Grass(D)`。
- 需要指定的 CPT 是：
	- $P(A)$。
	- $P(B \mid A)$。
	- $P(C \mid A)$。
	- $P(E \mid C)$。
	- $P(D \mid B,C)$。
- 这比直接列出 $P(A,B,C,D,E)$ 小很多，因为每个表只看一个变量和它的 parents。

# Bayesian Network 定义

## BN = graph + parameters

- 一个 Bayesian network over variables $\mathbf{Z}$ 是一对 $(G,\Theta)$。
- $G$ 是 over $\mathbf{Z}$ 的 DAG，叫 network structure。
- $\Theta$ 是一组 CPT，每个变量一个，叫 network parametrization。
- 对变量 $X$ 和 parents $\mathbf{U}$，CPT 可以写成 $\Theta_{X \mid \mathbf{U}}$。
- $X\mathbf{U}$ 这一组变量叫 `network family`。
- 单个参数 $\theta_{x \mid \mathbf{u}}$ 表示 $P(x \mid \mathbf{u})$。

## network instantiation 和 compatible parameter

- 网络实例化(network instantiation)是给所有 network variables 都赋值。
- 一个实例化就是一个world，意思是这个parameter 是符合现实逻辑的
- 一个参数 $\theta_{x \mid \mathbf{u}}$ 和一个完整实例化 $\mathbf{z}$ compatible，当且仅当 $x,\mathbf{u}$ 和 $\mathbf{z}$ 在共同变量上赋值一致。
- 记作：$\theta_{x \mid \mathbf{u}} \sim \mathbf{z}$。
- 对一个完整 world，只会从每个变量的 CPT 里选出一个 compatible parameter。

## BN chain rule

- Bayesian network 唯一诱导的 joint distribution 是：
	- $P(\mathbf{z})=\prod_{\theta_{x \mid \mathbf{u}}\sim \mathbf{z}}\theta_{x \mid \mathbf{u}}$。
- 更常见的写法是：$P(z_1,\dots,z_n)=\prod_i P(z_i \mid parents(z_i))$。
- 这叫 Bayesian networks 的 chain rule。
- winter 例子里，课件给了一个完整实例化的计算：
	- $P(a,b,\bar c,d,\bar e)=0.6\times0.2\times0.2\times0.9\times1=0.0216$。
- 这个乘法就是从每个 family 的 CPT 里取一项，然后全部乘起来。

# Complexity

- 一个变量的 CPT 大小随 parents 数量指数增长。
- 如果每个变量最多有 $k$ 个 parents，每个变量最多有 $d$ 个取值，一个 CPT 的规模约为 $O(d^{k+1})$。1是指的他自己本身也是一个变量
- 有 $n$ 个变量时，总参数表规模约为 $O(nd^{k+1})$。
- 只要每个变量的 parents 很少，这个规模就比完整 joint distribution 小得多。
- 如果某些变量有很多 parents，CPT 仍然会变大，后续需要更紧凑的 CPT 表示方法。

> Bayesian network 的省空间不是魔法，而是来自一个假设：每个变量只直接依赖少量 parents。

# Independence Properties

## 为什么需要 graphoid axioms (图论公理)

- BN 诱导出的分布一定满足 $Markov(G)$ 中的 independence。
- 但这些不是它满足的全部 independences。
- 还有一些 independence 可以从 $Markov(G)$ 推出来。
- 课件引入 graphoid axioms，就是为了形式化这些推理规则。

## Symmetry

- 对称性(symmetry)：如果知道 $\mathbf{Y}$ 不影响对 $\mathbf{X}$ 的 belief，那么知道 $\mathbf{X}$ 也不影响对 $\mathbf{Y}$ 的 belief。
- 例子：从 $A\perp R\mid B,E$ 可以推出：
	- $R\perp A\mid B,E$。

## Decomposition

- 分解性(decomposition)：如果一整组信息 $\mathbf{Y}\cup\mathbf{W}$ (Y,W)都无关，那么其中任意一部分也无关。
- 例子：从 $R\perp A,C,B\mid E$ 可以推出：
	- $R\perp A\mid E$。
	- $R\perp C\mid E$。
	- $R\perp B\mid E$。
- Decomposition 也能帮助证明 BN chain rule，因为它可以把大的 independence statement 拆成需要的局部形式。

## Weak Union

- 弱并(weak union)：如果 $\mathbf{Y}$ 和 $\mathbf{W}$ 合起来都无关，那么在已知 $\mathbf{Y}$ 后，$\mathbf{W}$ 仍然无关。
- 公式：$\mathbf{X}\perp\mathbf{Y}\cup\mathbf{W}\mid\mathbf{Z}$ 推出 $\mathbf{X}\perp\mathbf{W}\mid\mathbf{Z}\cup\mathbf{Y}$。
- 可以理解成：无关信息的一部分被加入条件里，不会让剩下的无关信息突然变得相关。
- 例子：从 $C\perp B,E,R\mid A$ 可以推出：
	- $C\perp R\mid A,B,E$。

## Contraction

- 收缩性(contraction)：如果 $\mathbf{Y}$ 本来无关，并且在知道 $\mathbf{Y}$ 后 $\mathbf{W}$ 也无关，那么 $\mathbf{Y}\cup\mathbf{W}$ 一开始就是无关的。
- 公式：$\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$ 且 $\mathbf{X}\perp\mathbf{W}\mid\mathbf{Z}\cup\mathbf{Y}$ 推出 $\mathbf{X}\perp\mathbf{Y}\cup\mathbf{W}\mid\mathbf{Z}$。
- 它是 weak union 的反向拼合思路。

## Intersection

- 交性(intersection)只对 strictly positive distributions 一定成立。
- 公式：$\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}\cup\mathbf{W}$ 且 $\mathbf{X}\perp\mathbf{W}\mid\mathbf{Z}\cup\mathbf{Y}$ 推出 $\mathbf{X}\perp\mathbf{Y}\cup\mathbf{W}\mid\mathbf{Z}$。
- Symmetry、decomposition、weak union、contraction 加上 triviality $\mathbf{X}\perp\emptyset\mid\mathbf{Z}$，构成 graphoid axioms。
- 再加上 intersection，叫 positive graphoid axioms。

# D-Separation

> 所谓的D-sparation就是之前我跟你讲的顺着图看看有没有哪个点阻断，来判断两个变量之间的独立性关系，如果 $dsep_G(\mathbf{X},\mathbf{Z},\mathbf{Y})$ 成立，那么所有由 $G$ 诱导的分布都满足 $\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$。

## path 和 valve

- d-separation 判断 path 时忽略边的方向，只看两个节点之间是否存在连接路径。
- 可以把一条 path 想成管道，把 path 上的中间节点 $W$ 想成 valve（阀门）。
- 如果 path 上至少有一个 valve closed，那么这条 path 就 blocked。
- 如果 path 上没有 closed valve，那么这条 path 是 active。

>若 $\mathbf{X}$ 和 $\mathbf{Y}$ 之间所有 paths 都 blocked，才算 d-separated。
>
- 注意：没有中间 valve 的 path，例如 $X\to Y$，不会被这个规则 blocked。

## 三种 valve

- 顺序结构(sequential)：$N_1\to W\to N_2$ 或 $N_1\leftarrow W\leftarrow N_2$。
- 发散结构(divergent)：$N_1\leftarrow W\to N_2$，$W$ 是 common cause。
- 汇聚结构(convergent / collider)：$N_1\to W\leftarrow N_2$，$W$ 是 common effect。

## blocked conditions

- Sequential valve 在 $W\in\mathbf{Z}$ 时 closed。
- Divergent valve 在 $W\in\mathbf{Z}$ 时 closed。
- Convergent valve 在 $W$ 和它的 descendants 都不在 $\mathbf{Z}$ 时 closed。
- 换句话说，collider 默认 blocked；一旦观察到 collider 或它的 descendant，这条 path 反而会打开。
- 这就是 explaining away 的图结构来源：两个原因本来因为共同 effect 被挡住，但观察 effect 后会变得相关。

> 非 collider 被观察会挡路；collider 被观察会开路。这是 d-separation 最容易考、也最容易混的地方。

# D-Separation 的计算与性质

## 线性时间测试

- d-separation 的定义好像要求枚举所有 paths，而 paths 数量可能是指数级。
- 课件给出一个不用枚举所有 paths 的测试方法：
	- 反复删除不属于 $\mathbf{X}\cup\mathbf{Y}\cup\mathbf{Z}$ 的 leaf node。
	- 删除所有从 $\mathbf{Z}$ 中节点出发的 outgoing edges。
	- 在新图 $G'$ 中忽略 edge direction，测试 $\mathbf{X}$ 和 $\mathbf{Y}$ 是否 disconnected。
- 这个过程的时间和空间复杂度都是 DAG 大小的线性级别。

## Soundness

- d-separation 是 sound 的。
- 如果 $P$ 是由 BN $(G,\Theta)$ 诱导的分布，并且 $dsep_G(\mathbf{X},\mathbf{Z},\mathbf{Y})$ 成立，那么 $\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$ 成立。
- 所以 d-separation 推出来的 independence 可以安全使用。
- 证明思路是 constructive：d-separation 能推出的 independence 都可以由 graphoid axioms 推出。

## 不完全性

> d-separation 的一定符合独立，但是不d-separation的，也有可能互相独立，因为可能会藏在CPT里面

- d-separation 对某个具体参数化 $\Theta$ 不一定 complete。
- 原因是：某些 independence 可能藏在参数里，而 d-separation 只看图，不看 CPT 数值。
- 因此：
	- 如果 $\mathbf{X}$ 和 $\mathbf{Y}$ 被 $\mathbf{Z}$ d-separated，那么它们对任意 $\Theta$ 都 conditionally independent。
	- 如果没有被 d-separated，它们是否 dependent 要看具体参数 $\Theta$。
- 课件也给出一个弱 completeness：对任意 DAG $G$，总能选某种参数化 $\Theta$，使 d-separation 和 independence 完全一致。
- 这说明单靠图结构，不能设计出比 d-separation 更强的通用 graphical test。

# Independence Maps

G代表DAG中的independence，P代表联合概率分布：
 $\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$ 和 $P(\mathbf{X},\mathbf{Y}|\mathbf{Z})=P(\mathbf{X}|\mathbf{Z})P(\mathbf{Y}|\mathbf{Z})$ 是对应的。
## I-MAP (独立图)
- $G$ 是 $P$ 的 I-MAP，要求图G可以少说，不能瞎说
- 公式方向是：$dsep_G(\mathbf{X},\mathbf{Z},\mathbf{Y})$ 推出 $\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$。
- 如果 $P$ 是由 BN $(G,\Theta)$ 诱导的，那么 $G$ 一定是 $P$ 的 I-MAP。
- Minimal I-MAP 指的是：如果从 $G$ 删除任意一条边，它就不再是 I-MAP。
- Minimal I-MAP ，边越少，能表达的independence 越多，而边越少，产生的条件概率参数也就越少
> 非最小的I-MAP多出来的东西是边，边越多，d-separation就越难发生，图能表达的独立关系就越少。
## D-MAP
- $G$ 是 $P$ 的 D-MAP，要求图G不能少说，但可能会多说
- 公式方向是：$\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$ 推出 $dsep_G(\mathbf{X},\mathbf{Z},\mathbf{Y})$。
- 如果 $P$ 是由 BN $(G,\Theta)$ 诱导的，$G$ 不一定是 D-MAP。
- 因为参数可能产生额外 independence，但图结构看不出来。

## Perfect MAP

- 如果一个 DAG 同时是 I-MAP 和 D-MAP，它就是 perfect map (P-MAP)。
- P-MAP 的意思是：图上的 d-separation 和分布里的 conditional independence 完全对应。
- 这当然是最理想的情况，因为所有 independence 都可以从图中读出来。
- 但不是每个 probability distribution 都存在 DAG 形式的 P-MAP。
- 所以 Bayesian network 很强，但不是所有 independence pattern 都能被 DAG 完美表达。

# 构造 Minimal I-MAP

- 给定一个分布 $P$，可以按变量顺序构造一个 guaranteed minimal I-MAP。
- 先给变量排序：$X_1,\dots,X_n$。
- 从空 DAG 开始，按顺序处理每个 $X_i$。
- 对每个 $X_i$，在它之前的变量 $X_1,\dots,X_{i-1}$ 中找一个 minimal subset $\mathbf{P}$，使得：
	- $X_i \perp \{X_1,\dots,X_{i-1}\}\setminus\mathbf{P}\mid\mathbf{P}$。
- 然后把 $\mathbf{P}$ 作为 $X_i$ 的 parents。
- 这样得到的 DAG 是 minimal I-MAP。
- 但它不唯一，因为结果依赖 variable ordering，也可能存在多个 minimal parent sets。
- 这个过程得到的 DAG 从 independence 角度是 sound 的，但可能不符合 causal interpretation。

> Minimal I-MAP 追求的是 independence 表达和参数紧凑，不保证边的方向符合因果直觉。

# Markov Blanket

## Blanket 和 Boundary

- Markov blanket 是“知道它之后，其他变量对 $X$ 都不再相关”的变量集合。
- 对分布 $P$ 中的变量 $X$，集合 $\mathbf{B}$ 是 $X$ 的 Markov blanket，当且仅当：
	- $X\notin\mathbf{B}$。
	- $X\perp \mathbf{X}\setminus(\mathbf{B}\cup\{X\})\mid\mathbf{B}$。
- 最小的 Markov blanket 叫 Markov boundary。
- Minimal 的意思是：没有 $\mathbf{B}$ 的真子集仍然是 Markov blanket。

## DAG 里的 Markov blanket

- 如果 $P$ 是由 DAG $G$ 诱导的，那么 $X$ 的一个 Markov blanket 可以由三类节点组成：
	- parents of $X$。
	- children of $X$。
	- spouses of $X$。
- spouse 指的是和 $X$ 有共同 child 的变量。
- 有时候boundary 不一定是parents + children + spouses，因为有时候CPT藏着额外的independecies，这个时候就不需要全部了
- 为什么需要 spouses：因为 child 是 collider，观察 child 会让共同 parents 之间产生依赖。
- 所以要屏蔽所有其他变量，不能只看 parents 和 children，还要包括共同 child 的其他 parents。

# 总结

- Bayesian network 是 $(G,\Theta)$：DAG 给结构，CPT 给参数。
- Local Markov assumption 说：给定 parents 后，一个变量和 non-descendants 条件独立。
- BN chain rule 把 joint distribution 分解成 $\prod_i P(X_i\mid Parents(X_i))$。
- CPT 的规模由 parents 数量控制；parents 少时，BN 比完整 joint distribution 紧凑得多。
- Graphoid axioms 说明 independence statements 可以怎样被推导。
- d-separation 是从 DAG 中读 conditional independence 的图形化测试。
- d-separation 是 sound 的，但对具体参数化不一定 complete，因为额外 independence 可能藏在 CPT 数值里。
- I-MAP、D-MAP、P-MAP 描述图和分布之间 independence 表达能力的关系。
- Markov blanket 给出一个变量的局部相关范围：parents、children 和 spouses。

> 这节课真正要带走的是：BN 用 DAG 表达“哪些变量可以不看”，用 CPT 表达“看了 parents 后概率是多少”；d-separation 则是检查这些“不用看”的主要工具。
