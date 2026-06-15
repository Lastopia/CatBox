---
date: 2026-06-11
description: COMP9319 Week2 压缩回顾、LZW、Adaptive Huffman 与 BWT
coreIdeas:
  - Huffman 和 Arithmetic coding 属于统计压缩，LZW 属于字典压缩
  - Adaptive 方法不需要提前知道概率分布，而是在编码和解码时同步更新模型
  - BWT 本身不是压缩算法，但会重排文本，让相同上下文的字符聚在一起，方便后续压缩和搜索
---
# Compression 主线回顾

- 无损压缩(lossless compression)的目标是把字符序列变成更短的 bit sequence，同时保留完全相同的信息内容。
- 压缩真正利用的是冗余(redundancy)：如果数据里有重复、偏斜概率或局部 pattern，就可以用更短表示替代原始表示。
- Run-length coding(RLE)把连续重复的符号替换成 `(symbol, run-length)`，适合长 run 明显的数据，不要求 source 是 memoryless。
- Variable length coding也叫 entropy coding：不同符号用不同长度 codeword，常见符号短，少见符号长。
- 熵(entropy)给出平均每个符号理论上至少需要多少 bit：$H=-\sum p(s)\log_2 p(s)=\sum p(s)\log_2 \frac{1}{p(s)}$，概率越平均，熵越高，越难压缩。

> 本周从“已知概率时怎么压缩”转到“概率未知、pattern 动态出现时怎么压缩”。

## Prefix Code 和可解码性

- Decodable 关注单个 codeword 能不能区分；uniquely decodable 关注多个 codeword 连在一起后是否只有一种拆分。
- Prefix-free code要求没有任何 codeword 是另一个 codeword 的前缀。
- Prefix-free 一定 uniquely decodable，但 uniquely decodable 不一定 prefix-free。
- 实际中更偏好 prefix code，因为解码器读到一个完整 codeword 后可以立刻输出，不需要等待后面的 bit 来消歧。

## Huffman 和 Arithmetic Coding 的位置

- Huffman coding是 block-variable：source symbol 长度固定，codeword 长度可变。
- Huffman 算法每次合并概率最低的两个符号，它们会得到最长、长度相同、最后一位不同的 codeword。
- Huffman 的限制是 codeword 长度必须是整数 bit；例如理论长度 $\log_2 3 \approx 1.585$，实际 codeword 不能直接写成 1.585 bit。
- 当某个符号概率极高时，Huffman 的整数 bit 限制会让平均长度离 entropy 有明显差距。
- Arithmetic coding把整段消息映射成一个区间里的数，用“整段消息共享取整误差”的方式逼近小数 bit 的平均长度。
- Arithmetic coding 更接近 entropy，但实现、速度和工程复杂度通常比 Huffman 更麻烦。

# Dictionary Coding
- Idea: replace recurring patterns with references to dictionary 
- LZ algorithms are `adaptive`: 
	- Universal coding (the prob. distr. of a symbol is unknown)
	- Single pass 单次遍历
	- No need to transmit/store dictionary，是根据一个固定的共同规则动态建立的
- `LZ77`: referring to previously processed data as dictionary 
- `LZ78`: use an explicit dictionary
- `LZW`: Most popular modification to LZ78. very common.

## LZW 
- 字典reference长度固定，通常 12 bit，意味着最多存储 4096 个 dictionary entries。
- 字典满了以后可以停止增长、重置或采用其他策略；通常是static，也就是固定，不再更新
- 基本思想是，编码时不断寻找“当前能在字典中匹配的最长字符串”，输出它的 code，再把“这个字符串 + 下一个字符”加入字典。

``` python
#压缩流程
compressed = []
Dict = initial_dictionary
p = read_first_char()

while read(c):
	if (p + c) in Dict:
		p = p + c
	else:
		compressed.append(Dict[p]) # 尽量读到最长才添加到字典并且编码到compressed里面
		Dict[p + c] = len(Dict) + 1
		p = c

compressed.append(Dict[p])
```

**课件压缩例子**

- 要压缩的字符串：`^WED^WE^WEE^WEB^WET`
- 初始字典：ASCII 字符已经在字典中，新加入的 dictionary entry 从 `256` 开始。

| 当前 `p` | 下一个 `c` | 输出 | 新增字典 |
|---|---|---|---|
| `NIL` | `^` |  |  |
| `^` | `W` | `^` | `256 = ^W` |
| `W` | `E` | `W` | `257 = WE` |
| `E` | `D` | `E` | `258 = ED` |
| `D` | `^` | `D` | `259 = D^` |
| `^` | `W` |  |  |
| `^W` | `E` | `256` | `260 = ^WE` |
| `E` | `^` | `E` | `261 = E^` |
| `^` | `W` |  |  |
| `^W` | `E` |  |  |
| `^WE` | `E` | `260` | `262 = ^WEE` |
| `E` | `^` |  |  |
| `E^` | `W` | `261` | `263 = E^W` |
| `W` | `E` |  |  |
| `WE` | `B` | `257` | `264 = WEB` |
| `B` | `^` | `B` | `265 = B^` |
| `^` | `W` |  |  |
| `^W` | `E` |  |  |
| `^WE` | `T` | `260` | `266 = ^WET` |
| `T` | `EOF` | `T` |  |

- 压缩结果：`^, W, E, D, 256, E, 260, 261, 257, B, 260, T`，7个字符，5个code
- 解码器和编码器不需要传输完整字典，因为双方用同样规则同步构造字典。

``` python
#解压流程
decompressed = []
Dict = initial_dictionary

c = read_first_code()
p = Dict[c]
decompressed.append(p)

while read(c):
	if c in Dict:
		entry = Dict[c]
	else:
		entry = p + p[0] # 特殊情况：当前 code 还没进字典

	decompressed.append(entry)
	Dict[len(Dict) + 1] = p + entry[0]
	p = entry
```

**课件解压例子**

- 要解压的 code sequence：`^, W, E, D, 256, E, 260, 261, 257, B, 260, T`
- 初始字典：ASCII 字符已经在字典中，新加入的 dictionary entry 从 `256` 开始。

| 上一个片段 `p` | 当前 code `c` | `Dict[c]` / 当前片段 `entry` | 输出 | 新增字典 | 更新 `p` |
|---|---|---|---|---|---|
|  | `^` | `^` | `^` |  | `^` |
| `^` | `W` | `W` | `W` | `256 = ^ + W = ^W` | `W` |
| `W` | `E` | `E` | `E` | `257 = W + E = WE` | `E` |
| `E` | `D` | `D` | `D` | `258 = E + D = ED` | `D` |
| `D` | `256` | `^W` | `^W` | `259 = D + ^ = D^` | `^W` |
| `^W` | `E` | `E` | `E` | `260 = ^W + E = ^WE` | `E` |
| `E` | `260` | `^WE` | `^WE` | `261 = E + ^ = E^` | `^WE` |
| `^WE` | `261` | `E^` | `E^` | `262 = ^WE + E = ^WEE` | `E^` |
| `E^` | `257` | `WE` | `WE` | `263 = E^ + W = E^W` | `WE` |
| `WE` | `B` | `B` | `B` | `264 = WE + B = WEB` | `B` |
| `B` | `260` | `^WE` | `^WE` | `265 = B + ^ = B^` | `^WE` |
| `^WE` | `T` | `T` | `T` | `266 = ^WE + T = ^WET` | `T` |

- 解压结果：`^WED^WE^WEE^WEB^WET`

**最终新增字典**

| Code | 字符串    |
| ---- | ------ |
| 256  | `^W`   |
| 257  | `WE`   |
| 258  | `ED`   |
| 259  | `D^`   |
| 260  | `^WE`  |
| 261  | `E^`   |
| 262  | `^WEE` |
| 263  | `E^W`  |
| 264  | `WEB`  |
| 265  | `B^`   |
| 266  | `^WET` |

## LZW 解码的特殊情况

- 普通伪代码会遇到一个 special case：当前读到的 code 还没有出现在 decoder 的字典里。
- 这种情况通常发生在编码器刚刚输出了一个它才创建的 entry，例如模式类似 `KwKwK`。
- 处理方法是把当前 entry 解释为 `p + p[0]`，也就是“上一个解码字符串 + 它自己的首字符”。
- 这个规则仍然保持 encoder 和 decoder 的字典同步，因为编码器创建该 entry 时用的正是同一个结构。

## LZW 压缩案例讲解

- 要压缩的字符串：`ABABABABA`

**初始字典**

| Code | 字符串 |
|---|---|
| 1 | `A` |
| 2 | `B` |

**压缩过程**

| 当前 `p` | 下一个 `c` | `p+c` 是否在字典里 | 输出 | 新增字典 |
|---|---|---|---|---|
| `A` | `B` | `AB` 不在 | `1` | `3 = AB` |
| `B` | `A` | `BA` 不在 | `2` | `4 = BA` |
| `A` | `B` | `AB` 在 |  |  |
| `AB` | `A` | `ABA` 不在 | `3` | `5 = ABA` |
| `A` | `B` | `AB` 在 |  |  |
| `AB` | `A` | `ABA` 在 |  |  |
| `ABA` | `B` | `ABAB` 不在 | `5` | `6 = ABAB` |
| `B` | `A` | `BA` 在 |  |  |
| `BA` | 结束 |  | `4` |  |

- 压缩结果：`1, 2, 3, 5, 4`

**最终字典**
这个字典并没有被传输给解压端，因为解压端会自然而然的形成一样的字典

| Code | 字符串 |
|---|---|
| 1 | `A` |
| 2 | `B` |
| 3 | `AB` |
| 4 | `BA` |
| 5 | `ABA` |
| 6 | `ABAB` |

**解压过程**

| 上一个片段 `p` | 当前 code `c` | `Dict[c]` / 当前片段 | 输出    | 新增字典                                    | 更新 `p` |
| --------- | ----------- | ---------------- | ----- | --------------------------------------- | ------ |
|           | `1`         | `A`              | `A`   |                                         | `A`    |
| `A`       | `2`         | `B`              | `B`   | `3 = A + Dict[2][0] = A + B = AB`       | `B`    |
| `B`       | `3`         | `AB`             | `AB`  | `4 = B + Dict[3][0] = B + A = BA`       | `AB`   |
| `AB` 看备注  | `5`         | `ABA`            | `ABA` | `5 = AB + AB[0] = AB + A = ABA`         | `ABA`  |
| `ABA`     | `4`         | `BA`             | `BA`  | `6 = ABA + Dict[4][0] = ABA + B = ABAB` | `BA`   |
备注，如果遇到尚未出现的字典序号，那就说明一定是接下来会创建的字典序号，直接预先创建了，也就是后面新增字典的部分，`p+p[0]`

- 解压结果：`ABABABABA`


## LZW 的工程特点

- LZW 是 variable-block：source message 是可变长度片段，codeword 是固定长度 reference。
- 固定 bit 数的 reference 让实现比较快，按固定宽度从 bit stream 中解析 code 也相对容易。
- LZW 适合概率分布未知但重复 pattern 明显的数据。
- 小文件或重复很少的数据不一定压缩好，因为`字典 entry 和固定长度 code 也有成本`。

# Adaptive Huffman

- Static Huffman需要提前知道符号统计，编码前可能要先扫一遍数据。
- Static Huffman还需要让 decoder 知道统计表或 code table；对于小消息，这个表的开销可能很明显。
- Adaptive compression的共同结构是：encoder 和 decoder 从同一个初始模型出发，每处理一个符号后用同样规则更新模型。
- 只要初始化和更新规则完全一致，decoder 就可以在没有提前统计表的情况下同步恢复消息。

> Adaptive Huffman 的核心不是“树会变”，而是 encoder 和 decoder 的树以完全相同的方式一起变。

## Dummy Adaptive Huffman

- 最直接的做法是每读一个字符，就更新频率，然后重建整棵 Huffman tree。
- 这个 dummy 方法逻辑正确，因为每一步的统计都反映已读前缀。
- 问题是太慢：每个字符都重建树，成本远高于必要更新。
- 真正的 Adaptive Huffman 需要局部调整树，而不是每次从头构造。

## NYT 和新符号

- NYT(Not Yet Transmitted)表示“还没有出现过的符号”。
- 当 encoder 第一次遇到某个符号时，会先走到 NYT，再输出该新符号的原始表示。
- 更新树时，旧 NYT 会分裂成两个 child：一个新的 NYT node，一个新符号的 leaf node。
- 新符号 leaf 和旧 NYT 的 weight 会增加，然后沿着父节点一路向 root 更新。

## Adaptive Huffman 更新规则

- 如果当前符号已经出现过，就直接找到它对应的 leaf node。
- 如果当前 node 不是同 weight block 中编号最高的 node，就和该 block 里编号最高的 node 交换。
- 交换后增加当前 node 的 weight。
- 如果当前 node 不是 root，就移动到 parent，重复“检查 block、交换、加权”的过程。
- 到 root 后结束本次更新。

## Adaptive Huffman 编码案例讲解

- 要压缩的字符串：`ABBA`
- 简化约定：左边 edge 写 `0`，右边 edge 写 `1`。
- 简化约定：第一次出现的新符号，输出 `code(NYT) + raw(symbol)`；这里的 `raw(symbol)` 表示符号本身的原始编码。
- 初始树：只有 `NYT`。

**编码过程**

| 当前符号 | 是否见过 | 当前输出 | 更新动作 | 更新后的主要 code |
|---|---|---|---|---|
| `A` | 没见过 | `raw(A)` | `NYT` 分裂成 `NYT` 和 `A`，`A` 的 weight 变成 1 | `NYT = 0`，`A = 1` |
| `B` | 没见过 | `0 + raw(B)` | 走到 `NYT`，把它分裂成 `NYT` 和 `B`，`B` 的 weight 变成 1 | `NYT = 00`，`B = 01`，`A = 1` |
| `B` | 见过 | `01` | 直接输出 `B` 当前 code，然后把 `B` 的 weight 从 1 加到 2 | `NYT = 00`，`B = 01`，`A = 1` |
| `A` | 见过 | `1` | 直接输出 `A` 当前 code，然后把 `A` 的 weight 从 1 加到 2 | `NYT = 00`，`B = 01`，`A = 1` |

- 压缩输出：`raw(A), 0 + raw(B), 01, 1`

**树的变化**

| 读完前缀 | 叶子权重 | 当前已有符号 | 当前 NYT code |
|---|---|---|---|
| 空 | `NYT:0` |  | 空 |
| `A` | `A:1`，`NYT:0` | `A` | `0` |
| `AB` | `A:1`，`B:1`，`NYT:0` | `A, B` | `00` |
| `ABB` | `A:1`，`B:2`，`NYT:0` | `A, B` | `00` |
| `ABBA` | `A:2`，`B:2`，`NYT:0` | `A, B` | `00` |

**解码过程**

| 当前输入 | 解码动作 | 输出字符 | 更新动作 | 更新后的主要 code |
|---|---|---|---|---|
| `raw(A)` | 当前只有 `NYT`，所以读原始符号 `A` | `A` | `NYT` 分裂成 `NYT` 和 `A` | `NYT = 0`，`A = 1` |
| `0 + raw(B)` | `0` 走到 `NYT`，所以读原始符号 `B` | `B` | `NYT` 分裂成 `NYT` 和 `B` | `NYT = 00`，`B = 01`，`A = 1` |
| `01` | `01` 对应已见过的 `B` | `B` | `B` 的 weight 从 1 加到 2 | `NYT = 00`，`B = 01`，`A = 1` |
| `1` | `1` 对应已见过的 `A` | `A` | `A` 的 weight 从 1 加到 2 | `NYT = 00`，`B = 01`，`A = 1` |

- 解压结果：`ABBA`

**最终权重表**

| 符号 | Weight | 当前 code |
|---|---:|---|
| `A` | 2 | `1` |
| `B` | 2 | `01` |
| `NYT` | 0 | `00` |

- 这个例子只展示 Adaptive Huffman 的核心同步过程；真正的 FGK/Vitter 会在更新 weight 时检查同 weight block，并按规则 swap 或 slide 节点。

## FGK 和 Vitter

- FGK 是经典 Adaptive Huffman 算法，维护 sibling property，使树始终对应某种 Huffman tree。
- Vitter's algorithm改进了更新过程，课件里的关键词是 “swaps then slides”。
- Vitter's invariant用更严格的节点顺序约束减少不必要的交换，并改善压缩效果。
- 复习时不用把每张树的细节背成图形，重点是理解 weight block、node number、swap/slide 这些动作为什么能保持 prefix tree 合法。

## Adaptive vs Static Huffman

- Adaptive Huffman不需要事先知道概率分布，适合 source statistics 不可用或会变化的场景。
- Adaptive Huffman可以省掉传输 symbol table 的开销。
- 如果真实分布稳定且已知，Static Huffman实现更简单，也可能已经足够好。
- 如果数据存在 locality of reference，adaptive 方法可能逐步适应局部分布，获得更好的压缩。

# 编码类型总览

- Block-block：source message 和 codeword 都是固定长度，例如 ASCII。
- Block-variable：source message 固定，codeword 可变，例如 Huffman coding。
- Variable-block：source message 可变，codeword 固定，例如 LZW。
- Variable-variable：source message 和 codeword 都可变，例如 Arithmetic coding。

> 这四类的差别，本质是“输入怎么切”和“输出 codeword 是否固定长度”。

# Basic BWT

- Burrows-Wheeler Transform(BWT)不是直接压缩，而是把字符串重排成更容易被 RLE、Huffman 等算法压缩的形式。
- BWT 会把相似上下文里的字符聚在一起；重排后常出现长 run，所以后续 RLE 更有效。
- 课件示例中，原串经过 BWT 后出现大量连续 `a`、`b`、`c`，再做 RLE 就能写成类似 `a10b5` 这样的形式。

## BWT Transform

- 给输入字符串加一个特殊 sentinel，例如 `#` 或 `$`，它必须在文本中唯一出现。
- 构造所有 cyclic rotations。
- 按字典序排序这些 rotations。
- 取排序后每一行的最后一个字符，组成 BWT output。
- sentinel 的位置让 inverse BWT 能找到原文边界。

## Inverse BWT

- 已知 BWT output 后，可以反复“把 output 作为新的一列加到表左边，然后排序所有行”。
- 重复到字符串长度次后，表中会恢复所有 rotations。
- 找到以 sentinel 结尾或开头的那一行，就能读回原始字符串。
- 这个 naive inverse 方法适合理解概念，但真实系统会用 LF-mapping 等结构高效恢复。

## 从 Compression 到 Search

- BWT 的重要性不只在压缩，还在搜索。
- 排序后的 rotations 把相同前缀的 suffix 聚在一起，所以 pattern matching 可以转化成一个连续范围的查找。
- 后续的 FM-index 会利用 BWT 在压缩表示上支持高效搜索。
- 这就是课程主线从 compression 走向 search 的桥梁：压缩结构不一定妨碍检索，有些结构反而让检索更快。

# Week2 Takeaway

- Huffman 和 Arithmetic coding 是统计路线：利用符号概率分布。
- LZW 是字典路线：利用重复字符串片段，并且在单趟扫描中动态建字典。
- Adaptive Huffman 是统计路线的 adaptive 版本：不用预先统计，encoder 和 decoder 同步更新树。
- BWT 是重排路线：先改变局部相邻关系，让后续压缩和搜索都更容易。
