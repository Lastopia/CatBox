---
title: 多模态研究笔记
date: 2026-05-28
notebook: 研究笔记
description: 梳理多模态大模型的主流架构、视觉感知瓶颈、世界模型范式与跨模态统一路线。
---

---

> 引用方式：正文中的 `[n]` 对应文末“参考文献”。引用优先放在概念第一次出现的位置附近。

## 一、当前工业主流范式：视觉编码器 + 语言解码器

### 1.1 核心架构

当前最主流的多模态大模型范式将模型职责一分为二：**视觉编码器负责感知，语言解码器负责思考**。这一范式可以从 Flamingo、BLIP-2、LLaVA 等工作中看到：复用预训练视觉编码器和预训练语言模型，中间用轻量连接模块完成跨模态对齐。[1][2][3]

```
[图像/视频输入]
      ↓
[视觉编码器]  ← 感知层：将原始像素压缩为语义特征向量
      ↓
[桥接连接层]  ← 翻译层：将视觉特征对齐到语言空间
      ↓
[语言解码器]  ← 思维层：推理、理解、生成文本
      ↓
[文本输出]
```

**三个组件详解：**

| 组件 | 主流选择 | 职责 |
|------|---------|------|
| 视觉编码器 | CLIP、SigLIP、ViT 系列 | 将图像切分为 patch，编码为特征序列；只编码，不生成 [4][5][6] |
| 桥接连接层 | MLP Projector（LLaVA）/ Q-Former（BLIP-2）/ Cross-Attention（Flamingo）| 弥合视觉特征与语言 token 之间的模态鸿沟 [1][2][3] |
| 语言解码器 | LLaMA、Qwen、Vicuna 等开源 LLM | 接收视觉 token，统一自回归解码；只解码，不感知 |

**代表性模型：**

| 模型 | 视觉编码器 | 连接层 | 语言解码器 |
|------|-----------|--------|-----------|
| LLaVA 系列 | CLIP ViT-L | MLP Projector | LLaMA / Vicuna [3] |
| InstructBLIP | CLIP / EVA-CLIP | Q-Former | Vicuna / Flan-T5 [7] |
| Qwen-VL | ViT（自研）| 交叉注意力 | Qwen [8] |
| InternVL | InternViT（自研）| MLP | InternLM [9] |

**这种拆分为何合理：**
1. **复用预训练**：两个组件可分别预训练，无需从零联合训练
2. **模块化**：可单独升级视觉编码器或替换 LLM
3. **训练效率**：通常只需微调连接层和解码器，视觉编码器可冻结

---

### 1.2 主要局限

#### ① 分辨率固定，细节丢失

主流编码器（如 CLIP ViT-L）训练时使用固定分辨率（224×224 或 336×336），现实图片送入前需强制缩放。图片含小字、表格、密集目标时，模型看不清。这个问题与 ViT/CLIP 类模型的 patch 化输入和固定训练分辨率有关。[4][6]

#### ② 输出 token 数固定，压缩比太死

不论输入是白纸还是密密麻麻的电路图，编码器输出的视觉 token 数均固定（如 256 个）。复杂图像被强制压缩为等长向量，必然损失信息。文本则天然自适应——内容越多，token 越多。

**解决方案：**

- **Token 剪枝/合并**（治标）：LLaVA-PruMerge、ToMe——在输出后动态删除冗余 token，本质仍是先固定再删减。[10][11]

- **NaViT——原生分辨率**（Google，2023）：彻底抛弃固定分辨率，改用**分数归一化坐标**做位置编码。[12]

  ```
  patch (i, j) 的位置 = ( i / ⌊H/P⌋ , j / ⌊W/P⌋ )
  token 数量 N = ⌊H/P⌋ × ⌊W/P⌋  （随图片尺寸动态变化）
  ```

  不同尺寸图片打包为一条长序列，用掩码矩阵防止跨图 attend：

  ```
  Attention(Q, K, V) = softmax( QKᵀ/√d_k + M ) · V
  M[i,j] = 0（同图）或 -∞（跨图）
  ```

  **局限**：Attention 复杂度仍为 O(N²)，分辨率翻倍则 token 数变为 4 倍；主要停留在 Google 体系内。

- **Qwen2-VL M-RoPE——工业最优雅实现**（2024）：引入多维旋转位置编码，将 d 维向量三等分分别编码时间/行/列。[13]

  ```
  前 d/3 维 → 时间位置 t（视频帧编号，图片固定为 0）
  中 d/3 维 → 行位置 y
  后 d/3 维 → 列位置 x

  两 patch 的注意力得分：Score ∝ qᵀ · R_{Δt, Δy, Δx} · k
  ```

  图片经 2×2 patch merge 压缩后，token 数 `N = ⌊H/P/2⌋ × ⌊W/P/2⌋`，任意分辨率与帧数均可处理。

  **局限**：merge 仍损失细节；训练时仍设最大 token 上限（约 1280）；d/3 三等分是经验选择。

- **Matryoshka ViT**：训练时让模型在不同粒度下均有效，推理时按任务复杂度选用 token 数量，灵活但训练难度大。这里的思想来自 Matryoshka Representation Learning：让同一个表示在不同维度/粒度截断下仍然可用。[14]

| 方案 | 是否真正可变 | 代表 |
|------|------------|------|
| Token 剪枝/合并 | 否（先固定再删）| LLaVA-PruMerge、ToMe |
| NaViT | 是 | NaViT（Google）|
| Qwen2-VL M-RoPE | 是 | Qwen2-VL |
| Matryoshka ViT | 部分 | MRL-ViT |

> **核心矛盾**：token 数越多，感知越准，但计算代价越高——这是架构层面的根本张力，换位置编码无法消除。

#### ③ 预训练目标与下游任务不对齐

CLIP 以图文对比学习为目标，擅长高层语义匹配，但对细粒度感知（数数、判断空间关系、识别细微差异）能力弱。[4]

#### ④ 编码器通常被冻结

为节省算力，许多架构训练时冻结视觉编码器权重，能力上限被锁死在预训练阶段。

#### ⑤ 模态割裂，无法生成图像

视觉与语言是两套独立系统，理解深度有限；该范式只能"图→文"，无法双向生成。

---

### 1.3 仿生"中央凹视觉"：感知瓶颈的解决方向

人眼的工作方式给了研究者启发：先用低分辨率扫描全局，锁定感兴趣区域（ROI）后，再精细处理。多模态模型中的主动视觉搜索可以参考 V*，GUI/高分辨率双路视觉可以参考 CogAgent。[15][16]

| 路线 | 代表 | 思路 | 推理速度 | 工业成熟度 |
|------|------|------|---------|-----------|
| 动态分辨率（均匀切片）| LLaVA-NeXT、InternVL2 | 低分辨率缩略图 + 均匀高清切片 | 快 | 高 |
| 主动视觉搜索 | V*（2024）| 模型自主判断 ROI → 迭代 Zoom In | 慢 | 低 [15] |
| 双路并行 | CogAgent（2024）| 低分辨率全图 + 高分辨率交叉注意力并行 | 中 | 中 [16] |

V* 的流程最接近仿生：低分辨率全图 → 判断哪里值得看 → Zoom In → 精细理解 → 必要时继续迭代。

> 该方向目前仍是研究前沿，尚未成为工业主流。

---

## 二、世界模型：下一代范式

### 2.1 根本转变：改变训练目标

传统范式的训练目标：`给定图像 → 输出正确文字描述`（静态单步映射）

世界模型的训练目标：`给定当前世界状态 → 预测未来世界状态`。这一思想在 model-based RL、MuZero、Dreamer 系列、JEPA、视频生成式世界模型中都有体现。[17][18][19][20]

这一改变直接击中传统范式的根本缺陷——模型没有真正理解世界，只是在做模式匹配。

**传统范式 vs. 世界模型：**

```
传统多模态："给你一张图和一个问题，告诉我正确答案是什么"
                → 学的是知识的表面映射

世界模型：  "给你世界的一部分，预测另一部分"
                → 学的是世界运作的内在规律
```

---

### 2.2 对传统范式各痛点的解法

| 传统痛点 | 世界模型解法 |
|---------|------------|
| 预训练目标不对齐 | 预测被遮挡区域的表示，逼出空间结构/物体关系/因果逻辑 |
| 模态割裂 | 所有模态统一映射到世界状态潜空间，模态边界消失 |
| 静态理解 | 时间成为第一公民，必须理解"之前→现在→之后"才能预测 |
| Token 瓶颈 | JEPA：在潜空间预测抽象结构，而非重建每一个像素 |

> LeCun 的比喻：预测球的轨迹，不需要预测球上每一根绒毛。预测像素 = 预测绒毛；预测潜空间 = 预测轨迹。

**三条世界模型路线：**

| 路线 | 代表 | 主要解决的痛点 |
|------|------|--------------|
| 潜空间预测（JEPA）| I-JEPA、V-JEPA | 预训练目标不对齐、token 瓶颈 [19][20] |
| 视频生成式世界模型 | Sora、Genie、Cosmos | 时间建模缺失、静态理解局限 [21][22][23] |
| VLA 世界模型 | RT-2、π0、OpenVLA | 模态割裂、感知与决策脱节 [24][25][26] |

---

### 2.3 学习机制：自监督闭环

#### 数据本身就是标签

```
JEPA：遮住图片中几块 patch → 预测被遮挡部分的表示 → 真实编码结果作为答案 [19][20]
视频世界模型：给前 N 帧 → 预测第 N+1 帧 → 真实的第 N+1 帧作为答案
```

#### 防止表示坍缩：EMA 机制

若模型将所有输入映射为同一向量（全零），损失为零但什么也没学——这是**表示坍缩**。JEPA 用 EMA/目标编码器这类 stop-gradient 机制防止表示坍缩，该思路与 BYOL、DINO、I-JEPA/V-JEPA 等自监督方法相关。[19][20][27][28]

```
上下文编码器（θ）← 正常梯度更新
目标编码器（ξ）← EMA 跟随：ξ ← m·ξ + (1-m)·θ    （m ≈ 0.996）
```

目标编码器是上下文编码器的"滞后版本"，模型始终在追一个缓慢移动的目标，既不坍缩，又有真实学习信号。

#### 任务难度是最终保障

垃圾表示根本无法完成预测任务。预测被遮挡区域必须理解物体结构，预测下一帧必须理解物理规律——**把任务设计得足够难，让作弊比真正学习更难。**

---

### 2.4 跨模态统一：三种哲学

#### 基本结构

```
图像 → 视觉编码器 ┐
文本 → 文本编码器 ├→ 共享潜空间 → 模态专用解码器 → 输出
音频 → 音频编码器 ┘
```

#### 三种对齐哲学

**哲学一：强制对齐（CLIP）** [4]
用对比学习把"狗的图像"和"狗"的文字表示在潜空间里拉近。
问题：事后对齐，模态间仍存在结构性鸿沟。

**哲学二：共同预测世界（JEPA）** [19][20]
不强制拉近，而是让所有模态都学同一件事——预测世界的抽象结构。因为预测对象相同，表示自然收敛：这是**涌现出来的统一**，不是外力强制的。
注意：JEPA 目前主要是单模态框架，是为多模态统一**铺路**，而非直接实现。

**哲学三：统一 token 序列（Chameleon、Unified-IO）** [29][30]
用 VQ-VAE 将图像量化为离散 token，与文本 token 共享同一词表：

```
图像 → VQ-VAE 量化 → 图像 token ┐
文本 → BPE 分词   → 文本 token ├→ 同一序列 → 同一 Transformer
动作 → 离散化     → 动作 token ┘
```

**图像 token ≠ 文本 token，但在同一词表里：**
- 文字"狗" → token #4521（语义概念）
- 图像里的狗 → token #892, #1103, #456...（局部视觉基元：毛发纹理、轮廓、色块）

两者语义关联不是内置的，而是模型通过大规模训练、观察两类 token 频繁共现后**自动学出来的**。

VQ-VAE 量化过程：`图像 → 连续特征图 → 找码本最近邻 → 整数索引 → 解码重建`（有损压缩）。这个离散视觉 token 思想来自 VQ-VAE 一类神经离散表示学习方法。[31]

| 对齐方式 | 统一程度 | 主要代价 | 代表 |
|---------|---------|---------|------|
| 对比学习强制对齐 | 低 | 模态间结构性鸿沟仍存在 | CLIP |
| 共同预测（JEPA）| 中 | 编码侧仍有模态专用组件 | I-JEPA、V-JEPA |
| 统一 token 序列 | 高 | 量化损失信息，训练难度大 | Chameleon、Unified-IO |

#### 跨模态自监督：如何不用人工图文对完成对齐？

世界本身提供**自然配对**——不需要人工收集，时间戳和空间位置自动配对：

- **时序对齐**：视频中同一时刻的画面与声音天然是一对（AV-HuBERT）[32]
- **跨模态遮挡预测**：同时遮住图的一部分和文的一部分，让模型互相补全
- **传递性对齐（ImageBind，Meta 2023）**：[33]
  ```
  视频把 画面 和 声音 绑定（A ≈ B）
  图文把 画面 和 文字 绑定（A ≈ C）
  ∴ 声音和文字被间接对齐（B ≈ C）——无需任何音频-文字配对
  ```
  通过视频这个中间桥梁，六种模态（图、文、音频、深度、热成像、IMU）全部传递性对齐。

| | 人工配对（CLIP）| 自然配对（世界模型）|
|--|----------------|-------------------|
| 谁来配对 | 人工收集 | 时间戳/空间位置自动配 |
| 数据规模 | 有限，昂贵 | 互联网无限供应 |
| 配对噪声 | 低 | 高 |

---

### 2.5 时序处理与效率

#### 训练时完全并行

时间顺序通过**位置编码**（如 M-RoPE）携带，不依赖串行处理。所有帧同时送入 Transformer，因果掩码保证信息流向遵守时序约束。[13]

```
帧4 可以 attend 帧1、2、3  ✓
帧1 不能 attend 帧2、3、4  ✗
```

#### 推理时取决于生成方式

- **自回归式**：逐帧生成，每帧依赖前序帧 → 串行，慢
- **扩散式**（Sora、Cosmos）：对整段视频加噪后迭代去噪，每步所有帧同时处理 → 并行，快 [21][23]

#### 真正的效率瓶颈：二次方注意力复杂度

```
N 帧 × T token/帧，计算量 = O(N² × T²)
10 帧 → 100 帧：帧数增加 10 倍，计算量增加 100 倍
```

| 解决方案 | 代表 |
|---------|------|
| 稀疏注意力（只关注邻近帧）| VideoSparse |
| 分层处理（先片段后全局）| Hierarchical Video Transformer |
| 跨帧 token 合并压缩 | Token Merging for Video |
| 扩散式生成替代自回归 | Sora、Cosmos |
| SSM 替代 Transformer | Mamba 系列 |

#### 因果关系：影响 vs. 严格决定

世界模型通过因果掩码承认**后帧受前帧影响**，但拒绝严格决定论。这个表述更接近概率建模和 model-based RL 中的状态转移分布，而不是经典控制里的单一确定函数。[17][18]

```
传统控制系统：下一状态 = f(当前状态)         ← 确定函数
世界模型：    下一状态 ~ P(未来 | 过去)       ← 概率分布
```

真实世界存在不确定性，世界模型输出的是**分布**，而非单一结果。这使其能表达"我不确定接下来会发生什么"，对规划和安全决策至关重要。

---

### 2.6 从预测到决策：概率 × 奖励

#### 概率 ≠ 好坏

如果世界模型只是多推几步、取最高概率结果，与普通模型没有本质区别。真正产生质变的是引入**独立的评价标准——奖励函数**：

```
最可能发生的未来  ≠  对我最有利的未来

例：悬崖边机器人向前迈步
→ 90% 概率：掉落    按概率选 → 掉落
→ 10% 概率：安全    按奖励选 → 不迈步（掉落奖励 = -∞）
```

**真正的决策公式：**

```
最优行动 = argmax_a  Σ  P(未来状态 | 行动 a) × R(未来状态)
                    所有可能未来
```

概率与奖励的**加权求和**，而不是取最大概率。DreamerV3、MuZero 均包含两个组件：**世界模型**（预测未来分布）+ **价值网络**（评估未来好坏）。[17][18]

#### 奖励函数从哪来？

| 来源 | 人工介入 | 代表 | 主要问题 |
|------|---------|------|---------|
| 手工设计规则 | 高 | 经典游戏 RL | 奖励黑客（Reward Hacking）[34] |
| 逆强化学习 / 模仿学习 | 中 | 机器人示范 | 需要人类示范数据 [35] |
| RLHF（人类偏好比较）| 低 | ChatGPT、Claude | 偏好难以完全捕捉 [36] |
| 内在奖励（好奇心）| 无 | 纯探索型智能体 | 无法捕捉人的真实意图 [37] |

**关键洞察：世界模型与奖励函数解耦**

```
世界模型：自监督训练，学"世界怎么运作" ← 一次训练，通用底座
奖励函数：定义"什么是好的"             ← 按任务定制，轻量说明书
```

不需要为每个新任务重训整个模型，只需接上对应的奖励函数。奖励函数仍是当前最大工程挑战之一——前者靠自监督搞定，后者仍需人来定义。

---

## 参考文献

[1] Alayrac, J.-B., Donahue, J., Luc, P., et al. Flamingo: a Visual Language Model for Few-Shot Learning. *NeurIPS*, 2022. https://arxiv.org/abs/2204.14198

[2] Li, J., Li, D., Savarese, S., and Hoi, S. BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models. *ICML*, 2023. https://arxiv.org/abs/2301.12597

[3] Liu, H., Li, C., Wu, Q., and Lee, Y. J. Visual Instruction Tuning. *NeurIPS*, 2023. https://arxiv.org/abs/2304.08485

[4] Radford, A., Kim, J. W., Hallacy, C., et al. Learning Transferable Visual Models From Natural Language Supervision. *ICML*, 2021. https://arxiv.org/abs/2103.00020

[5] Zhai, X., Mustafa, B., Kolesnikov, A., and Beyer, L. Sigmoid Loss for Language Image Pre-Training. *ICCV*, 2023. https://arxiv.org/abs/2303.15343

[6] Dosovitskiy, A., Beyer, L., Kolesnikov, A., et al. An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale. *ICLR*, 2021. https://arxiv.org/abs/2010.11929

[7] Dai, W., Li, J., Li, D., et al. InstructBLIP: Towards General-purpose Vision-Language Models with Instruction Tuning. *NeurIPS*, 2023. https://arxiv.org/abs/2305.06500

[8] Bai, J., Bai, S., Yang, S., et al. Qwen-VL: A Versatile Vision-Language Model for Understanding, Localization, Text Reading, and Beyond. arXiv, 2023. https://arxiv.org/abs/2308.12966

[9] Chen, Z., Wu, J., Wang, W., et al. InternVL: Scaling up Vision Foundation Models and Aligning for Generic Visual-Linguistic Tasks. *CVPR*, 2024. https://arxiv.org/abs/2312.14238

[10] Shang, Y., Cai, M., Xu, B., et al. LLaVA-PruMerge: Adaptive Token Reduction for Efficient Large Multimodal Models. arXiv, 2024. https://arxiv.org/abs/2403.15388

[11] Bolya, D., Fu, C.-Y., Dai, X., Zhang, P., Feichtenhofer, C., and Hoffman, J. Token Merging: Your ViT But Faster. *ICLR*, 2023. https://arxiv.org/abs/2210.09461

[12] Dehghani, M., Mustafa, B., Djolonga, J., et al. Patch n' Pack: NaViT, a Vision Transformer for any Aspect Ratio and Resolution. *NeurIPS*, 2023. https://arxiv.org/abs/2307.06304

[13] Wang, P., Bai, S., Tan, S., et al. Qwen2-VL: Enhancing Vision-Language Model's Perception of the World at Any Resolution. arXiv, 2024. https://arxiv.org/abs/2409.12191

[14] Kusupati, A., Bhatt, G., Rege, A., et al. Matryoshka Representation Learning. *NeurIPS*, 2022. https://arxiv.org/abs/2205.13147

[15] Wu, P., Xie, S., Li, Y., et al. V*: Guided Visual Search as a Core Mechanism in Multimodal LLMs. *CVPR*, 2024. https://arxiv.org/abs/2312.14135

[16] Hong, W., Wang, W., Lv, Q., et al. CogAgent: A Visual Language Model for GUI Agents. *CVPR*, 2024. https://arxiv.org/abs/2312.08914

[17] Hafner, D., Pasukonis, J., Ba, J., and Lillicrap, T. Mastering Diverse Domains through World Models. arXiv, 2023. https://arxiv.org/abs/2301.04104

[18] Schrittwieser, J., Antonoglou, I., Hubert, T., et al. Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model. *Nature*, 2020. https://arxiv.org/abs/1911.08265

[19] Assran, M., Duval, Q., Misra, I., et al. Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture. *CVPR*, 2023. https://arxiv.org/abs/2301.08243

[20] Bardes, A., Garrido, Q., Ponce, J., et al. Revisiting Feature Prediction for Learning Visual Representations from Video. arXiv, 2024. https://arxiv.org/abs/2404.08471

[21] Brooks, T., Peebles, B., Homes, C., et al. Video generation models as world simulators. OpenAI Technical Report, 2024. https://openai.com/research/video-generation-models-as-world-simulators

[22] Bruce, J., Dennis, M., Edwards, A., et al. Genie: Generative Interactive Environments. arXiv, 2024. https://arxiv.org/abs/2402.15391

[23] NVIDIA. Cosmos World Foundation Model Platform for Physical AI. arXiv, 2025. https://arxiv.org/abs/2501.03575

[24] Brohan, A., Brown, N., Carbajal, J., et al. RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control. arXiv, 2023. https://arxiv.org/abs/2307.15818

[25] Black, K., Brown, N., Driess, D., et al. pi0: A Vision-Language-Action Flow Model for General Robot Control. arXiv, 2024. https://arxiv.org/abs/2410.24164

[26] Kim, M. J., Pertsch, K., Karamcheti, S., et al. OpenVLA: An Open-Source Vision-Language-Action Model. arXiv, 2024. https://arxiv.org/abs/2406.09246

[27] Grill, J.-B., Strub, F., Altche, F., et al. Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning. *NeurIPS*, 2020. https://arxiv.org/abs/2006.07733

[28] Caron, M., Touvron, H., Misra, I., et al. Emerging Properties in Self-Supervised Vision Transformers. *ICCV*, 2021. https://arxiv.org/abs/2104.14294

[29] Team Chameleon. Chameleon: Mixed-Modal Early-Fusion Foundation Models. arXiv, 2024. https://arxiv.org/abs/2405.09818

[30] Lu, J., Clark, C., Lee, S., et al. Unified-IO 2: Scaling Autoregressive Multimodal Models with Vision, Language, Audio, and Action. arXiv, 2023. https://arxiv.org/abs/2312.17172

[31] van den Oord, A., Vinyals, O., and Kavukcuoglu, K. Neural Discrete Representation Learning. *NeurIPS*, 2017. https://arxiv.org/abs/1711.00937

[32] Shi, B., Hsu, W.-N., Lakhotia, K., and Mohamed, A. Learning Audio-Visual Speech Representation by Masked Multimodal Cluster Prediction. *ICLR*, 2022. https://arxiv.org/abs/2201.02184

[33] Girdhar, R., El-Nouby, A., Liu, Z., et al. ImageBind: One Embedding Space To Bind Them All. *CVPR*, 2023. https://arxiv.org/abs/2305.05665

[34] Amodei, D., Olah, C., Steinhardt, J., et al. Concrete Problems in AI Safety. arXiv, 2016. https://arxiv.org/abs/1606.06565

[35] Ng, A. Y., and Russell, S. Algorithms for Inverse Reinforcement Learning. *ICML*, 2000. https://ai.stanford.edu/~ang/papers/icml00-irl.pdf

[36] Ouyang, L., Wu, J., Jiang, X., et al. Training language models to follow instructions with human feedback. *NeurIPS*, 2022. https://arxiv.org/abs/2203.02155

[37] Pathak, D., Agrawal, P., Efros, A. A., and Darrell, T. Curiosity-driven Exploration by Self-supervised Prediction. *ICML Workshop*, 2017. https://arxiv.org/abs/1705.05363
