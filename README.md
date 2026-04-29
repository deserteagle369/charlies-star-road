# Charlie's Star Road (周深的星光之路)

## 项目概述

跟周深一起环游世界学英语的互动学习游戏。通过 AI 出题和 DALL-E 合照生成，让英语学习变得有趣。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o (出题) + DALL-E 3 (合照生成)
- **部署**: Vercel / 本地开发

## 项目结构

```
charlies-star-road/
├── app/
│   ├── api/
│   │   ├── questions/          # AI 出题 API
│   │   └── generate-reward/    # DALL-E 合照生成
│   ├── game/
│   │   ├── layout.tsx          # 游戏布局（星空背景）
│   │   ├── page.tsx            # 首页/关卡地图
│   │   └── shanghai/           # 上海站
│   └── globals.css
├── components/
│   ├── game/
│   │   ├── WorldMap.tsx        # 关卡地图
│   │   ├── QuestionCard.tsx    # 答题卡片
│   │   ├── ProgressBar.tsx     # 进度条
│   │   ├── CameraCapture.tsx   # 摄像头拍照
│   │   └── RewardCard.tsx      # 奖励卡片
│   └── layout/
│       └── StarBackground.tsx  # 星空背景
├── lib/
│   ├── supabase.ts             # Supabase 客户端
│   ├── openai.ts               # OpenAI 客户端
│   └── utils.ts                # 工具函数
├── supabase/
│   └── schema.sql              # 数据库表结构
└── types/
    └── index.ts                # TypeScript 类型定义
```

## 快速开始

1. **克隆项目**
   ```bash
   git clone <repo-url>
   cd charlies-star-road
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local，填入你的 Supabase 和 OpenAI 凭证
   ```

4. **设置 Supabase 数据库**
   - 在 Supabase 创建新项目
   - 在 SQL Editor 中运行 `supabase/schema.sql`

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问**
   - 本地: http://localhost:3000
   - 地图页面: http://localhost:3000/game
   - 上海站: http://localhost:3000/game/shanghai

## 环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 |
| `OPENAI_API_KEY` | OpenAI API 密钥 |

## 功能模块

### 1. 世界地图关卡系统
- 5 个城市关卡: 上海 → 伦敦 → 巴黎 → 纽约 → 东京
- 解锁机制: 完成当前关卡解锁下一站
- 星空动画背景

### 2. 上海站 - 英语填空题
- AI GPT-4o 生成与城市相关的英语填空题
- 难度可选: easy / medium / hard
- 即时反馈: 答对/答错动画
- 提示功能

### 3. AI 合照生成
- 使用摄像头拍摄照片
- DALL-E 3 生成与城市背景的合照
- 下载和分享功能

## 开发指南

### 添加新关卡
1. 在 `lib/utils.ts` 的 `CITY_MAP` 中添加城市
2. 在 `app/game/[city]/page.tsx` 创建页面（可复制 shanghai）
3. 更新 `app/game/page.tsx` 中的路由

### 自定义题目类型
修改 `app/api/questions/route.ts` 中的 prompt

## License

MIT
