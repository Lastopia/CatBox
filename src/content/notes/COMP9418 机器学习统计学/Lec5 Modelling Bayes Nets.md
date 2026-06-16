---
date: 2026-06-16
description: COMP9418 Bayesian networks 建模与查询
coreIdeas:
  - Bayesian network 可以回答 evidence、marginal、MPE 和 MAP 等不同 query
  - 建模时要区分 query variables、evidence variables 和 intermediate variables
  - large CPT 需要用 noisy-or、decision tree、if-then rules 或 deterministic rules 压缩表示
---
# 主线

- 这节课继续 Bayesian network，重点从“图表达 independence”转向“怎样建模、怎样提问”。
- Bayesian network 不绑定单一任务；同一个模型可以回答 diagnosis、prediction、explanation、reliability 和 sensitivity analysis。
- 课件先讲四类常见 query，再用 medical diagnosis、pregnancy test、digital circuit 和 reliability block diagram 展示建模方式。
- 后半部分讨论 large CPT 的问题：parents 多时，完整 CPT 指数增长，建模比存储更先变难。
- 解决思路是利用 local structure，用 noisy-or、decision tree、if-then rules 或 deterministic CPT 表示概率表。

> Lec5 真正要带走的是：Bayesian network 的价值不只是算概率，而是把问题拆成变量、结构、CPT 和 query，让一个模型能服务多种推理任务。

# Bayesian Network Queries

## Probability of Evidence

- 证据概率(probability of evidence)问的是某个 evidence 本身出现的概率，写作 $P(\mathbf{e})$。
- 例如病人 `X-ray` 阳性但没有 `dyspnoea`：$P(X=true,D=false)$。
- 这里 $\mathbf{E}=\{X,D\}$ 是 evidence variables，$\mathbf{e}$ 是这些变量的一组 instantiation。
- 这种 query 可以用来衡量一组观测有多常见，或者作为 posterior 计算里的 normalization term。
>query 就是你想要算出来的东西，通常就是条件概率左边的那个东西

> evidence和world的区别在于，world 是所有的变量都已经被赋值了。而evidence只是部分重要的变量被赋值。一组evidence可能对应着多个word。就是条件概率右边的那个东西

**Arbitrary Evidence**

- 有些 evidence 不是简单变量赋值，而是一个逻辑条件，例如 $X=true \lor D=true$。
- 标准 BN query 通常直接支持 variable instantiation，不直接支持任意 propositional evidence。
- 可以用辅助节点(auxiliary-node method)：新建一个 node `E`，让相关变量做 parents，再用 deterministic CPT 表示这个逻辑条件。
- 例如 `E=yes` 表示 “positive x-ray 或 dyspnoea 至少一个成立”，然后计算 $P(E=yes)$。
- 这个方法在 evidence variables 很少时实用；变量多时 CPT 会变大，但 deterministic CPT 可以进一步压缩。

## Prior and Posterior Marginals

- 边缘分布(marginal distribution)是从 joint distribution 里只保留一部分变量，把其他变量加掉。
- 没有 evidence 时叫 prior marginal；给定 evidence 后叫 posterior marginal。
- 对变量集合 $\mathbf{Q}$ 和 evidence $\mathbf{e}$，posterior marginal 是 $P(\mathbf{Q}\mid\mathbf{e})$。
- 例子：没有 evidence 时，lung cancer `C` 的 prior 是 $P(C=true)=0.055$。
- 如果观察到 positive x-ray 且 no dyspnoea，posterior 变成 $P(C=true\mid e)=0.2523$。
- 这说明 evidence 不一定证明疾病，但会改变 disease 的 belief。

> Posterior marginal 回答的是“看到这些证据后，某个变量现在有多可信”。

## Most Probable Explanation

- 最可能解释(most probable explanation, MPE)是在给定 evidence 后，找出所有非 evidence 变量的一组最可能完整赋值。
- 形式上是找最大化 $P(x_1,\dots,x_n\mid\mathbf{e})$ 的完整 instantiation。
- MPE 问的是“整个 hidden world 最可能是什么样”。
- 诊断例子里，给定 positive x-ray 和 dyspnoea，MPE 会给出一整套解释：是否去过 Asia、是否 smoker、是否有 lung cancer、bronchitis、tuberculosis 等。

**MPE 不能从 marginals 拼出来**

- 不能把每个变量 posterior marginal 最大的值直接拼成 MPE。
- 原因是：每个变量单独最可能，不代表它们组合起来的 joint probability 最大。
- 课件例子里，单独看 marginals 会得到一个 smoker 的解释，但真正 MPE 可能是 non-smoker，且 joint probability 更高。
- 所以 MPE 是 joint optimization，不是逐变量贪心选择。

## Maximum a Posteriori Hypothesis

- 最大后验假设(maximum a posteriori hypothesis, MAP)只对一部分变量求最可能赋值。
- 给定 MAP variables $\mathbf{M}$ 和 evidence $\mathbf{e}$，目标是找最大化 $P(\mathbf{m}\mid\mathbf{e})$ 的 $\mathbf{m}$。
- MPE 是 MAP 的特殊情况：当 $\mathbf{M}$ 包含所有非 evidence 变量时，MAP 就是 MPE。
- MAP 比 MPE 更一般，也通常更难算。

**MPE projection 只是近似**

- 有时会先算 MPE，再把 MPE 投影到 MAP variables 上，作为 MAP 的近似。
- 但这不保证得到真正 MAP。
- 课件例子里，真正 MAP 对 $\{A,S\}$ 的答案是 `A=no, S=yes`，概率约 `0.5074`。
- MPE 投影可能给出 `A=no, S=no`，概率约 `0.4809`，不是最优 MAP。

> MPE 关心最可能的完整故事；MAP 关心指定变量子集的最可能答案。两者不能随便互换。

# Diagnosis Models

## Medical Diagnosis from Expert I

- 第一个诊断模型来自医学专家描述。
- 变量分成 diseases 和 symptoms：
	- Diseases：flu、cold、tonsillitis。
	- Symptoms：chilling、body ache and pain、sore throat、fever。
- 每个变量可以先设成 Boolean：true / false。
- 结构由专业知识决定：disease causes symptoms。
- 症状作为 evidence，疾病作为 query variables；诊断通常问的是 posterior marginal、MAP 或 MPE。

## Naive Bayes Alternative

- 另一种建模是把疾病组合成一个 `Condition` 变量，取值如 normal、cold、flu、tonsillitis。
- 这种结构叫朴素贝叶斯(naive Bayes)：一个 class node 指向所有 attributes。
- 形式是 $C\to A_1,\dots,C\to A_n$，其中 $C$ 是 class，$A_i$ 是 attributes。
- Naive Bayes 的核心假设是：给定 condition 后，所有 symptoms 条件独立。
- 这个模型隐含 single-fault assumption，更适合一次只有一个主要 condition 的场景。

**CPT 怎么来**

- Disease / condition 的 CPT 表示没有症状信息时的 prior belief。
- Symptom 的 CPT 表示在不同 disease combinations 或 condition 下，症状出现的概率。
- 参数可以来自 medical statistics、expert belief，或 previous patient records。
- 如果 disease 是多个 Boolean variables，symptom CPT 可能需要覆盖所有 disease combinations。
- 如果用 naive Bayes，symptom CPT 会更小，但表达能力也更受 single-condition 假设限制。

## Pregnancy Test Model

- 第二个诊断模型是 cow pregnancy test。
- 变量包括：
	- Query variable：pregnancy `P`。
	- Evidence variables：scanning test `S`、blood test `B`、urine test `U`。
	- Intermediate variable：progesterone level `L`。
- 结构来自 causal story：pregnancy 影响 progesterone level 和 scanning test；progesterone level 影响 blood 和 urine tests。

**Independence**

- Blood test 和 urine test 在给定 progesterone level 后 independent。
- Scanning test 在给定 pregnancy status 后，与 blood / urine tests independent。
- Urine 和 blood 在只给定 pregnancy status 时不一定 independent，因为它们共享中间原因 `L`。
- 如果三个测试都 negative，posterior 仍然可能是 $P(Pregnant\mid e)\approx0.1021$。
- 这说明多个 negative tests 不一定足够强，因为测试误差和 intermediate uncertainty 会限制证据力度。

## Sensitivity Analysis

- 敏感性分析(sensitivity analysis)问的是：要改变哪些 network parameters，才能让某个 query 达到目标。
- 课件目标是：三项测试都 negative 后，怀孕概率要降到 5% 以下。
- 结果是主要需要改善 scanning test 的 false negative rate，让它降到约 `0.0463`。
- 改 blood / urine tests 帮助有限，因为它们都通过 progesterone level `L` 间接反映 pregnancy。
- 即使 blood / urine 变得很准，`L` 本身的不确定性仍会限制诊断信心。

> Sensitivity analysis 不只是问“现在概率是多少”，而是问“哪个参数最值得改，改多少才够”。

# Network Granularity

## 为什么保留 intermediate variables

- Intermediate variables 既不是 query，也不是 evidence，但能让模型结构更自然。
- 在 pregnancy model 里，progesterone level `L` 不是最终要问的变量，也不是直接观测的变量。
- 但 `L` 解释了 blood 和 urine tests 为什么相关，也让 CPT 更符合实际机制。
- 如果删掉 `L`，直接把 `P` 连到 `B` 和 `U`，模型看似更简单，却可能改变 evidence 的影响力度。

## 什么时候可以 bypass

- 如果新网络 $P'$ 对所有 query instantiations $\mathbf{q}$ 和 evidence instantiations $\mathbf{e}$ 都满足 $P(\mathbf{q},\mathbf{e})=P'(\mathbf{q},\mathbf{e})$，那么 bypass intermediate variable 不影响目标任务。
- 课件给出一个可消去的特殊情况：$X$ 不是 query / evidence variable，且只有一个 child $Y$。
- 设 $\mathbf{U}$ 是 $X$ 的 parents，$\mathbf{V}$ 是 $Y$ 除了 $X$ 以外的 parents。
- 消去 $X$ 后，新的 $Y$ CPT 是：$\theta'_{y\mid\mathbf{u},\mathbf{v}}=\sum_x \theta_{y\mid x,\mathbf{v}}\theta_{x\mid\mathbf{u}}$。
- 这本质是在 CPT 局部做 marginalization，把 $X$ 的影响吸收到 $Y$ 里。
- 但多数情况下不建议随便 bypass，因为会让 child 的 CPT 变大，模型也更难解释。

> Intermediate variable 是建模粒度的选择：删掉它可能省节点，但会损失结构、解释性，甚至改变 query 结果。

# Models from Design

## Digital Circuit Diagnosis

- 这个例子不是从专家疾病知识建模，而是从系统设计自动生成模型。
- 目标是：给定电路 primary inputs 和 outputs，判断系统是否正常；如果异常，找最可能 faulty components。
- 变量分成三类：
	- Evidence variables：primary inputs / outputs，例如 `A`、`B`、`E`。
	- Query variables：component health states，例如 `X`、`Y`、`Z`。
	- Intermediate variables：internal wires，例如 `C`、`D`。
- 对大电路来说，如果不显式表示 internal states，模型会很难扩展。

**CPT**

- Health variables 的 CPT 给出 component faulty 的 prior，例如 `ok` 或 `faulty`。
- Component output variables 通常是 deterministic：output 由 inputs 和 health state 函数决定。
- 更具体的 fault model 可以用 `stuck-at-0`、`stuck-at-1`，而不是简单 `faulty`。
- 给定 test vector 后，对 health variables 做 MAP，可以找最可能的故障解释。
- 单个 test vector 可能产生 ambiguity；多个 components 的故障解释概率接近。

## 多个 Test Vectors 和 DBN

- 如果一个 test vector 无法区分故障原因，可以加入第二个 test vector。
- 每个 test vector 会复制一组 wire variables，因为不同测试下 wire values 不同。
- 如果考虑 intermittent faults，还要复制 health variables，并建 persistency model。
- Persistency model 描述故障状态跨测试是否持续，例如 `faulty` 下一次仍 `faulty` 的概率很高。
- 这种把同一系统在多个时间/测试下复制的结构叫动态贝叶斯网络(dynamic Bayesian network, DBN)。
- 课件例子里，两个 test vectors 后 MAP 更明确地指向某个 component faulty，概率约 `0.9753`。

## Reliability Model from Design

- Reliability model 用 BN 表示 reliability block diagram (RBD)。
- 每个 root variable 表示一个 component 是否 available，例如 power supply、fan、processor、hard drive。
- Intermediate variables 表示 AND / OR gates：
	- AND gate：所有输入可用时，输出 subsystem 才可用。
	- OR gate：至少一个输入可用时，输出 subsystem 可用。
- 最终 variable `S` 表示 whole system 是否 available。
- $P(S=available)$ 就是系统在某个时间点的 reliability。
- 课件例子里，系统 reliability 约为 `0.959`。

**Reliability queries**

- Marginal query 可以算整体 system reliability。
- Sensitivity analysis 可以问：如果目标 reliability 是 `0.965`，应该替换哪个 component、提高到多少。
- MAP query 可以问：当系统 unavailable 时，最可能的 failure explanation 是什么。
- 课件例子中，最可能解释可能是 hard drive unavailable，也可能是两个 fans 同时 unavailable，或 power supply unavailable。

# Large CPTs

## CPT 为什么会爆炸

- 如果一个 binary variable 有 $n$ 个 binary parents，完整 CPT 需要 $2^n$ 行。
- 每一行只需要一个 independent parameter，因为另一取值由 normalization 得到。
- parents 数量稍微大一点，参数数量就很快变得不可维护。
- 例如 10 个 parents 需要 1024 个参数；30 个 parents 已经超过十亿级。
- 存储和 inference 可能还能撑一会儿，但让专家填写这些概率通常先变得不可行。

> Large CPT 的真正问题常常不是机器存不下，而是人无法可靠地 eliciting 那么多概率。

## Noisy-or

- Noisy-or 是一种 micro model，用少量参数表示多个 causes 对同一个 effect 的影响。
- 适合 causal interpretation：每个 cause 单独就可能触发 effect，但可能被 suppressor 阻止。
- 每个 cause $C_i$ 有一个 suppressor variable $Q_i$，表示这个 cause 的作用是否被抑制。
- Leak variable $L$ 表示所有未显式建模的其他 causes。
- Noisy-or 只需要 $n+1$ 个参数：每个 cause 一个 suppressor probability，加一个 leak probability。

**公式**

- 设 $\theta_{q_i}=P(Q_i=active)$ 表示 cause $C_i$ 被抑制的概率。
- 设 $\theta_l=P(L=active)$ 表示 leak 被抑制或背景失败的参数，课件公式把它放在乘积里使用。
- 若 $I_\alpha$ 是当前 active causes 的 index set，则 effect 不发生的概率可由 leak 和所有 active causes 的 suppressors 相乘得到。
- 课件给 sore throat 例子：cold、flu、tonsillitis 都可能导致 sore throat，leak 表示其他原因。
- Noisy-or 的好处是把完整 CPT 从指数级参数压到线性级参数。

## Decision Trees

- 有些 CPT 有 local structure，但不符合 noisy-or 的独立抑制假设。
- Decision tree 用 parent variables 做分支，叶子节点给出 $P(E=1)$。
- 如果某些 parent 的取值已经足够决定概率，就不需要继续测试其他 parents。
- 当 CPT 有足够结构时，decision tree 大小可以接近线性。
- 如果 CPT 没结构，decision tree 仍然可能指数增长。

## If-then Rules

- CPT 也可以用 if-then rules 表示：如果 parent assignment 满足条件 $\alpha_i$，则 $P(e)=p_i$。
- $\alpha_i$ 是由 parents variables 构成的 propositional sentence。
- 规则前提必须 mutually exclusive and exhaustive：
	- Mutually exclusive：避免同一个 parent case 命中多条冲突规则。
	- Exhaustive：保证每个 parent case 都有概率可用。
- 这种表示对不规则但可描述的 CPT 很方便。
- 如果没有可压缩结构，规则数量也可能指数增长。

## Deterministic CPTs

- 确定性 CPT(deterministic CPT)只有 0 和 1。
- 当一个 node 被 parents 函数决定时，这个 node 就有 deterministic CPT。
- 可以用 propositional sentences 紧凑表示：$\Gamma_i \Leftrightarrow E=e_i$。
- 每个 $E$ 的取值对应一条 rule，所有 premises $\Gamma_i$ 必须 mutually exclusive and exhaustive。
- Digital circuit 里的 gate output 是典型 deterministic CPT：给定 input 和 component state，wire output 被确定。
- Deterministic CPT 常见且重要，因为它能把逻辑关系直接嵌入 probabilistic model。

# Query 类型对比

## Evidence / Marginal / MPE / MAP

- Probability of evidence：问某组 observation 本身有多可能，例如 $P(\mathbf{e})$。
- Prior marginal：没有 evidence 时，某个变量或变量集合的分布。
- Posterior marginal：给定 evidence 后，某个变量或变量集合的分布，例如 $P(C\mid\mathbf{e})$。
- MPE：给定 evidence 后，所有 hidden variables 的最可能完整解释。
- MAP：给定 evidence 后，指定变量集合的最可能 instantiation。

## 什么时候用哪个

- 想知道“证据常不常见”，用 probability of evidence。
- 想知道“病人得某病概率是多少”，用 posterior marginal。
- 想得到“最可能的完整世界状态”，用 MPE。
- 想诊断“最可能是哪几个 disease / faulty components”，但不关心其他变量，用 MAP。
- 想知道“改哪个参数最影响结果”，用 sensitivity analysis。

# 总结

- Bayesian network 可以回答多种 query，不只是分类或预测。
- Probability of evidence 和 posterior marginal 处理 evidence 下的 belief update。
- MPE 找完整解释，MAP 找指定变量子集的最可能解释。
- 建模时要区分 query variables、evidence variables 和 intermediate variables。
- Intermediate variables 能提高解释性、保持合理 independencies，并避免错误压缩。
- Models from design 可以从电路、RBD 等系统结构自动生成 Bayesian network。
- Large CPT 是 BN 建模的核心难点之一，常用 noisy-or、decision tree、if-then rules 和 deterministic CPT 压缩。
- 这些 compact representation 主要解决建模和 elicitation 问题；实际 inference 时有时仍需要展开或转换。

> Lec5 把 Bayesian network 从“一个概率图”变成“一个建模语言”：先决定变量和结构，再决定 CPT 表示，最后根据任务选择 query。
