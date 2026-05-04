/**
 * API 配置管理 /admin/config
 * GET  - 读取当前 .env.local 中的配置
 * POST - 保存配置到 .env.local
 * PUT  - 测试连接
 */
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

interface EnvConfig {
  supabase_url: string;
  supabase_publishable_key: string;
  supabase_secret_key: string;
  groq_api_key: string;
}

function readEnvFile(): EnvConfig {
  const defaults: EnvConfig = {
    supabase_url: '',
    supabase_publishable_key: '',
    supabase_secret_key: '',
    groq_api_key: '',
  };

  if (!existsSync(ENV_PATH)) return defaults;

  try {
    const content = readFileSync(ENV_PATH, 'utf-8');
    const lines = content.split('\n');

    const envMap: Record<string, string> = {
      'NEXT_PUBLIC_SUPABASE_URL': 'supabase_url',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': 'supabase_publishable_key',
      'SUPABASE_SERVICE_ROLE_KEY': 'supabase_secret_key',
      'GROQ_API_KEY': 'groq_api_key',
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (envMap[key] && val) {
        (defaults as unknown as Record<string, string>)[envMap[key]] = val;
      }
    }
  } catch { /* ignore */ }

  return defaults;
}

function writeEnvFile(config: EnvConfig): void {
  const envMap: Record<string, string> = {
    'NEXT_PUBLIC_SUPABASE_URL': config.supabase_url,
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': config.supabase_publishable_key,
    'SUPABASE_SERVICE_ROLE_KEY': config.supabase_secret_key,
    'GROQ_API_KEY': config.groq_api_key,
  };

  // 读取现有文件，保留未修改的行
  let existingLines: string[] = [];
  if (existsSync(ENV_PATH)) {
    existingLines = readFileSync(ENV_PATH, 'utf-8').split('\n');
  }

  const updatedKeys = new Set(Object.keys(envMap));
  const result: string[] = [];

  for (const line of existingLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      result.push(line);
      continue;
    }
    const key = trimmed.split('=')[0].trim();
    if (updatedKeys.has(key)) {
      // 替换为新值
      result.push(`${key}=${envMap[key]}`);
      updatedKeys.delete(key);
    } else {
      result.push(line);
    }
  }

  // 添加新增的 key
  for (const key of updatedKeys) {
    result.push(`${key}=${envMap[key]}`);
  }

  writeFileSync(ENV_PATH, result.join('\n'), 'utf-8');
}

/** 读取配置 */
export async function GET() {
  try {
    const config = readEnvFile();
    return NextResponse.json(config);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read config' },
      { status: 500 }
    );
  }
}

/** 保存配置 */
export async function POST(req: NextRequest) {
  try {
    const config: EnvConfig = await req.json();

    if (!config.supabase_url || !config.supabase_publishable_key) {
      return NextResponse.json({ error: 'Supabase URL 和 Publishable Key 不能为空' }, { status: 400 });
    }

    writeEnvFile(config);
    return NextResponse.json({ success: true, message: '配置已保存到 .env.local' });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save config' },
      { status: 500 }
    );
  }
}

/** 测试连接 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, target } = body;

    if (action !== 'test') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // 测试 Supabase
    if (target === 'supabase') {
      const url = body.supabase_url as string;
      const key = body.supabase_publishable_key as string;

      if (!url || !key) {
        return NextResponse.json({ success: false, message: '请先填写 Supabase URL 和 Publishable Key' });
      }

      try {
        const res = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
        });

        if (res.ok) {
          // 额外检查 question_banks 表是否存在
          const qbRes = await fetch(`${url}/rest/v1/question_banks?select=id&limit=1`, {
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
            },
          });

          if (qbRes.ok) {
            return NextResponse.json({ success: true, message: '✅ 数据库连接成功，question_banks 表已就绪' });
          } else {
            return NextResponse.json({
              success: true,
              message: '⚠️ 数据库连接成功，但 question_banks 表不存在，请先执行 schema SQL',
            });
          }
        } else {
          const errText = await res.text();
          return NextResponse.json({ success: false, message: `连接失败 (${res.status}): ${errText.slice(0, 100)}` });
        }
      } catch (err) {
        return NextResponse.json({
          success: false,
          message: `网络错误: ${err instanceof Error ? err.message : '无法连接'}`,
        });
      }
    }

    // 测试 Groq AI
    if (target === 'groq') {
      const apiKey = body.groq_api_key as string;

      if (!apiKey) {
        return NextResponse.json({ success: false, message: '请先填写 Groq API Key' });
      }

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'user', content: 'Say "test ok" in 2 words.' },
            ],
            max_tokens: 10,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '';
          return NextResponse.json({
            success: true,
            message: `✅ Groq API 正常，模型回复: "${content.trim()}"`,
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            message: `API 错误 (${res.status}): ${errData.error?.message || '未知错误'}`,
          });
        }
      } catch (err) {
        return NextResponse.json({
          success: false,
          message: `网络错误: ${err instanceof Error ? err.message : '无法连接 Groq'}`,
        });
      }
    }

    return NextResponse.json({ success: false, message: '未知的测试目标' });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '测试失败' },
      { status: 500 }
    );
  }
}