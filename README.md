# Controlled Demolition Lab

浏览器本地运行的 3D STEM 实验 MVP。使用 Vite、strict TypeScript、Three.js 和 @dimforge/rapier3d-compat；无 UI 框架、后端或外部素材请求。

## 启动

推荐 Node.js 22.12+。

```sh
npm install
npm run dev
```

打开终端显示的本地地址（默认 http://127.0.0.1:5173）。

```sh
npm test       # 真实 Rapier WASM 回归实验和交互状态规则测试
npm run build # strict TypeScript 检查 + 生产构建，输出 dist/
npm exec vite preview -- --host 127.0.0.1
```

## 操作

- 首次打开显示英文任务背景：扮演爆破工程师，配置虚拟模块并保护周边建筑。点击 Start Experiment 后进入三维实验。

- 左键拖动旋转，滚轮缩放，右键拖动平移相机。
- Select Mode 启用时，悬停青色节点查看信息，点击配置，再次点击取消。最多 4 个模块。橙色表示待失效；配置阶段不运行物理，也不移除关节。
- 左侧三个实验按钮可载入可重复配置，随后点击 Detonate。所有实验均使用相同的初始刚体姿态和重力。
- Detonate 触发失效；Pause / Resume 控制固定步物理推进。运行、暂停和结束阶段均锁定配置。
- Reset 释放并重建整个 Rapier 世界和建筑，清除上次结果。Clear Configuration 只清配置。Show Structure 切换节点与支撑连线。
- 实验以 18 秒模拟时间结束（不保证所有任意配置已完全静止），显示实际指标与对应学习反馈。可关闭结果面板继续观察最终姿态或重置。
- About the Course 显示主题、STEM 分支、游戏说明及学习目标。
- 窄屏页面纵向排列；桌面两侧面板在高度不足时可独立滚动。

## 物理模型与抽象连接规则

五层楼板是五个独立动态刚体，楼高 3 m。每层四个理想球形关节连接下层刚体或固定地基，初始共 20 个关节。关节 anchor 对齐，启用 16 次 solver iterations；固定 1/60 秒时间步；屏幕帧率不决定物理步长。没有横向冲量、手动刚体旋转、预设倒塌轨迹或最终位置设置。Three.js 姿态始终读取 Rapier 刚体状态。

支撑图采用 `BuildingNode`、`BuildingComponent`、`SupportConnection`。节点 ID 为 F1-A … F5-D；A/B/C/D 依次是 (-X,-Z)、(+X,-Z)、(+X,+Z)、(-X,+Z)。模块对应单条关节：

1. 配置时连接由 active 标为 pending，物理关节保留。
2. Detonate 后 pending 连接转为 failed，并移除 Rapier 关节。
3. 从地基沿剩余连接遍历连通图。若一个楼层完全失去地基路径，**其上由该楼层承载的抽象支撑模块也转为 failed**，内部关节释放。这是明确的教学依赖规则，不是材料应力或真实断裂计算。
4. 保持至少一条地基路径的部分保留原有关节，由约束数和几何分布限制其运动。两角支撑可形成转轴，三角支撑可约束姿态。因此不会让所有配置无条件自由下落。
5. 所有后续运动由重力、关节和碰撞求解。失效柱隐藏，节点保留红色诊断标记。梁柱是随所属楼板运动的可视构件，不提供额外碰撞体或质量。

模拟地面有实体碰撞体。红色保护区域是竖直传感器（高度 30 m），记录进入该区域的不同楼板数量，避免同一楼板多帧接触重复计分；属于侵入检测而非实体围墙。绿色目标区为地面矩形。

## 可重复测试场景

`npm test` 实际初始化 Rapier WASM、创建并移除关节、执行 1080 个固定步，检查三个响应不同；并检查模块上限、清空、重建及暂停/继续。

| 配置 | 失效关节数 | 最大水平位移 | 结束剩余高度 | 保护区楼板数 | 实际分类 |
| --- | ---: | ---: | ---: | ---: | --- |
| F1-A | 1 | 约 0.0006 m | 15.16 m | 0 | Partially stable |
| F1-B, F1-C | 2 | 约 10.07 m | 10.80 m | 3 | Significant tilt |
| F1-A/B/C/D | 20（含依赖失效） | 约 0.003 m | 1.58 m | 0 | Extensive collapse |

数值来自当前锁定依赖环境的实测，允许浮点差异，测试使用区间断言而非精确小数。第四个重要对照是任意上层支撑失效：下部楼层保持地基连接，释放行为局限在失去支撑的上部。

## 指标与评分

- Maximum Horizontal Displacement：每个楼板质心相对初始位置的 XZ 距离，记录全过程最大值。
- Remaining Building Height：结束时楼板/可视构件世界包围盒的最高点，单位 m。
- Protected Zone Collisions：全过程进入保护传感器的独立楼板数。
- Target Zone Reached：至少一个楼板质心下降至 y < 1 m 且 XZ 位于绿色区域，记录全过程；不代表整栋建筑都进入区域。
- Simulation Result：结束高度 < 7 m 为 Extensive collapse，否则最大水平位移 > 1 m 为 Significant tilt，其余 Partially stable。属于教学分类。
- 100 分：保护区清空 40 + 到达目标 30 + 完成实验 20 + 不超过模块限制 10。稳定实验仍能得完成分；不等价于真实拆除工程评价。
- 反馈按实际运动分类、失效连接数和保护区侵入生成。

## 架构

```text
src/
  main.ts                       初始化入口与失败提示
  core/
    Game.ts                     主循环、鼠标射线、UI 与各模块整合
    PhysicsWorld.ts             Rapier 初始化、固定步、事件与资源释放
    SceneManager.ts             Three.js 场景、阴影、网格、OrbitControls
  building/
    BuildingGenerator.ts        楼板刚体、关节、梁柱与节点
    BuildingComponent.ts        单个楼板与物理姿态同步
    StructuralGraph.ts          pending/failed 状态及地基连通性
  gameplay/
    ChargeManager.ts            配置、上限及预设
    CollapseController.ts       模拟状态和时间控制
    GameState.ts                状态类型
    ScoreManager.ts             测量、评分与动态学习反馈
  ui/
    ControlPanel.ts             配置、检查器与按钮
    ResultsPanel.ts             结果与反馈
    AboutPanel.ts               课程说明
  utils/
    constants.ts                几何、步长、区域、场景
    types.ts                    数据模型
  style.css                     响应式工程模拟器界面
tests/scenarios.ts              无浏览器 Rapier 实测回归
```

## 已知局限

- 仅提供理想刚体和抽象连接，不计算真实材料强度、应力、楼板破碎或梁柱屈曲。不得用于真实拆除决策。
- 柱和梁仅可视化；只有楼板参与物理碰撞。失效后的诊断节点及支撑线可能位于地面以下。
- 配置保存在当前实验内，刷新页面后清空。无永久存档。
- 需要支持 WebGL 与 WebAssembly 的现代浏览器。首包约 2.8 MB（gzip 约 964 KB），主要为 Three.js 与内嵌 Rapier WASM；Vite 会给出大 chunk 提示。
- 当前 Rapier compat 包的内部 WASM 初始化会输出一条 deprecated parameters 警告；实际初始化、关节创建/删除及模拟均已测试通过。它不是未处理异常。
