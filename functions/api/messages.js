// functions/api/messages.js
export async function onRequest(context) {
  const { request, env } = context;

  // 处理跨域 CORS 预检请求（让留言板子域名能正常访问）
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // 获取留言 (GET)
  if (request.method === 'GET') {
    try {
      const list = await env.GUESTBOOK_KV.list();
      const messages = [];
      for (const key of list.keys) {
        const val = await env.GUESTBOOK_KV.get(key.name);
        if (val) messages.push(JSON.parse(val));
      }
      // 按时间最新排序
      messages.sort((a, b) => new Date(b.time) - new Date(a.time));

      return new Response(JSON.stringify({ success: true, data: messages }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: '读取失败: ' + err.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // 提交留言 (POST)
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { name, content } = body;

      if (!content) {
        return new Response(JSON.stringify({ error: '内容不能为空' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const id = Date.now().toString();
      const entry = {
        id,
        name: name || '匿名',
        content: content,
        time: new Date().toISOString()
      };

      // 写入 KV 数据库
      await env.GUESTBOOK_KV.put(id, JSON.stringify(entry));

      return new Response(JSON.stringify({ success: true, data: entry }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: '服务器内部错误: ' + err.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
