---
title: 张雨童
eyebrow: About
description: 新南威尔士大学人工智能方向硕士在读，关注大模型、NLP、多模态、计算机视觉与 AI 算法工程。喜欢把研究问题拆成可以运行、可以复现、可以解释的实验系统。
links:
  - label: z5526932@ad.unsw.edu.au
    href: mailto:z5526932@ad.unsw.edu.au
  - label: GitHub / Lastopia
    href: https://github.com/Lastopia/
  - label: 现居悉尼
  - label: 预计毕业：2026.09
---
## 个人概况

### 研究与求职方向
大模型 / NLP / 多模态 / 计算机视觉 / AI 算法工程师

### 当前关注
LLM 位置编码、表征解耦、Sparse Autoencoder 可解释性、可信 LLM、幻觉诊断与空间推理。

## 技术栈

### 编程语言
- Python 
- C/C++
- Rust
- Java
- JavaScript
- PHP
- SQL
- Vue
### 机器学习
- Supervised Learning: Linear / Logistic Regression, SVM, KNN, Decision Tree / Random Forest, Gradient Boosting
- Unsupervised Learning: K-means, PCA, clustering / dimensionality reduction
- Deep Learning: MLP, CNN / RNN / Transformer, optimization, regularization
- Model Evaluation: cross-validation, precision / recall / F1, ROC-AUC, confusion matrix

### 语言模型
- Transformer-based NLP: encoder-only / decoder-only architectures, attention, positional encoding
- LLM Fine-tuning: LoRA / PEFT, instruction tuning, decoder fine-tuning
- Text Understanding: text classification, stance detection, sentiment / topic modeling
- Interpretability & Trustworthy LLM: Sparse Autoencoder, representation analysis, hallucination diagnosis

### 视觉模型
- Classic CV: SIFT / LBP, feature extraction, image preprocessing
- Classic CNN: LeNet / AlexNet / VGG / ResNet / Inception / EfficientNet
- Object Detection: Faster R-CNN, YOLO, RT-DETR
- CAM-based XAI: CAM / Grad-CAM, model visualization

## 教育背景

### 新南威尔士大学（UNSW）
时间: 2024.09 - 2026.09 预计毕业
信息技术硕士，人工智能方向；WAM 85.75

### 杜伦大学（Durham University）
时间: 2022.10 - 2023.10
会计硕士；Merit

### 澳门大学（University of Macau）
时间: 2018.09 - 2022.07
会计与信息系统本科；GPA 3.41/4.00

## 研究、项目与实习

### LLM 位置编码、What-Where 表征解耦与 SAE 可解释性研究
时间: UNSW 研究项目 / 拟硕士论文 | 2026.02 - 2026.05
- 围绕位置编码、内容-位置解耦与 Sparse Autoencoder 可解释性开展文献调研、问题定义和实验设计。
- 设计 RoPE 与 PoPE 的系统性对比实验，用于分析位置编码对语言模型训练、attention logit 频谱结构与 SAE 特征学习的影响。
- 搭建端到端实验 pipeline，支持位置编码模块切换、模型配置、数据集准备、checkpoint 选择、attention 分析、SAE 训练与指标评估。

### 立场检测系统：Baseline、Encoder、Decoder-LoRA、CLI 与 Gradio Demo
时间: COMP6713 NLP / LLM 课程小组项目 | 2026.02 - 2026.05
- 构建立场检测 pipeline，将输入分类为 Against、None、Favor，并支持预处理、训练、评估、模型保存与推理输出。
- 实现 TF-IDF + NRC + LinearSVC baseline、DeBERTa encoder frozen / unfrozen 设置，以及 decoder-based LoRA 微调方案。
- 开发 CLI 与 Gradio 推理界面，支持 preflight checks、模型加载、CSV 批量预测、指标汇报、混淆矩阵生成与 demo 展示。

### AgroPest-12 农业害虫检测与分类项目
时间: COMP9517 Computer Vision 课程小组项目 | 2025.10 - 2025.11
- 基于 AgroPest-12 数据集开展害虫检测与分类实验，数据集包含 12 类害虫及 bounding box 标注。
- 实现传统机器学习方案，包括 SIFT / LBP 特征提取与 SVM / KNN 分类模型。
- 参与 benchmark 分析，涵盖 YOLOv8 / YOLOv11、RT-DETR、InceptionV3、EfficientNetB0 与 CAM-based XAI。

### 北京大唐高鸿数据网络技术有限公司
时间: 算法工程师实习生 | 2023.12 - 2024.03
- 参与火电厂 AI 智慧预警系统与 AIGO 算法平台开发，面向设备测点数据清洗、故障预警与模型封装。
- 使用 Python 与 pandas 对设备测点数据进行业务清洗与预处理，为后续模型训练和实时分析提供结构化输入。
- 将 MSET 预警算法封装为 Python 接口，通过 Flask 构建服务路由，并配合 ZooKeeper、Docker 与 Java 后端完成数据联调。
