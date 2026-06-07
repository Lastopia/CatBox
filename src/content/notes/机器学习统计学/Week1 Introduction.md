---
title: Week1 Introduction
date: 2026-06-05
notebook: 机器学习统计学
description: COMP9418 简介
coreIdeas:
---
# Part 1

- PGM 结合了两个事情：
	1. 用 Probability/Statistics 来描述不确定性
	2. 用 图结构 来表示变量之间的关系，并让推理计算变得更加高效

- PGM 是一种让机器在不确定的世界中进行结构化推理的办法

- AI 面对一个问题： 逻辑推理 VS. 概率推理，现实世界具有不确定性

- `Automated Reseaning` John McCarthy 早期提出， `Observations -> Knowledge Base + Inference Engine -> Conclusions`。

- 虽然自动化推理早期其实是逻辑推理的一个典型。但是后来可以泛化到概率推理。进而延伸出来了PGM 

- `Monotonic Logic` 单调推理 lacks the ability to dynamically assert and retract assumptions。单调逻辑推理就是说如果一组前提能推出一个结论，那么加入更多前提后，这个结论依然成立。但是在常识中往往不是这样。比如我们可能先会假设鸟会飞。但是后来发现这个鸟它的翅膀受伤了。这时候这个鸟就不会飞了。我们应该撤回这个结论。而单调，逻辑推理就不擅长根据新信息撤回旧结论。

- 然后就有了非单调逻辑。在非单调逻辑中，有一个很关键的概念叫做`degree of belief`。相信的程度是可以更新的。更新规则由概率演算控制。我们要按照概率论比如条件概率贝叶斯公式这些规则来更改我们信念的程度。这就是PGM的基础思想:
>我有多相信他。看到新证据后我应该怎么更新这个相信的程度？

- `Possibility`和`Probability`的区别。前者是用于模糊逻辑的。后者是我们这节课需要学的。

- `Decision theory`: 我们要根据前面的信念程度去做出决定。决策理论是概率推理的重要补充。角色理论需要我们拥有额外的信息。
	1. 每个行动的成本。
	2. 不同结果的收益和惩罚。

- 关于probabilities有两种解释：
	1. `Objective frequencies`，客观频率，指长期重复实验中得到的频率
	2. `Subjective degrees of belief`主观信念程度，强调先验知识，经验，历史数据，是贝叶斯学派接受的理念

>这节课的一个重点就是如何让概率推理在复杂AI问题中，可以表示，可以计算，可以学习

- 概率推理在AI应用中。被从三个方面进行批评。
	1. Cognitive criticism。认知批评。认为，人类不是靠明确的概率数值来推理的。
	2. Pragmatic criticism。实用批评。概率首先从哪里来？然后概率推理是否鲁棒。
	3. Computational criticism。计算批评。也是最重要的批评。联合概率分布虽然看上去优雅，但计算上很难实行。存储和计算指数增长，成本爆炸。

- `Judea Pearl` 它是概率推理在AI中复兴的关键人物。他主张一种numerical formalism， 即数值化形式体系，用于概率数值的表达和计算。$P(A|B)$ 

-  贝叶斯网络为什么对于概率推理非常重要
	1. `Representation Challenge`贝叶斯网络可以利用变量之间的条件独立性，用图结构来紧凑表示指数极大的分布
	2. `Computational challenge` 然后对图结构配置相应的算法来大大的节省计算所需的成本
		- Poly tree algorithm
		- Junction tree algorithm

- 贝叶斯图结构。其中节点代表基本命题。边代表变量之间的依赖关系，也可以理解为causal influence，也就是因果影响。但需要注意的是。通常是因果，但不代表一定是因果。

- 贝叶斯图结构的压缩能力来源跟霍夫曼树很像，他只和邻边的节点有关，至于这个邻边的节点的父节点都是什么他并不关心。没有父节点的节点一般都是先验概率

- 贝叶斯图结构的表示的优越性
	1. Unique，表示唯一性。
	2. Modular。表示模块性。他只和直接相关的因果连接。
	3. Compact。表示紧凑性。 可以通过多项式数量的概率来表示指数级大的联合分布。前提是一个节点的父节点不能太多。

- 构建贝叶斯网络结构图的方式
	1. 根据自己的知识建模
	2. Learning from problem specification从专家那里获取知识
	3. 从数据中学习learning from data有3种方式
		- 只学probability，只估计CPT参数
		- 这些structure从数据中学习哪些变量之间应该有边
		- 两个都学。最完整也是最难的

>最大似然估计：哪些参数最能解释现有数据就选用哪些参数
>贝叶斯理论：加入了先验，参数不仅要能够解释数据也要符合我们事先的信念

- 关于图模型graphical model：
	- Directed & Undirected 有向图 / 无向图
		有向图代表着有方向性依赖，很多时候可以按照因果来理解。无向图没有箭头，一般表示对称关系，强调变量之间有关联，但是不强调谁导致谁
	- Static & Dynamic 静态/动态
		静态不对时间建模，但是动态会描述多个时间步的变量
	- Probabilistic & Decisional 概率/决策
		角色模型还加入了utility variables，就类似于损失函数奖励函数什么的用于做决策

