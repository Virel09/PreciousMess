// functions/api/messages.js
export async function onRequest(context) {
  const { request, env } = context;

  // 处理跨域 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
      // 按时间倒序排（最新的在前）
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
      
      // 【核心修改】：格式化当前时间为 年-月-日 时:分
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const entry = {
        id,
        name: name || '匿名',
        content: content,
        time: timeStr // 保存格式化后的时间字符串
      };

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

  // 删除留言 (DELETE)
  if (request.method === 'DELETE') {
    try {
      const body = await request.json();
      const { id } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: '缺少ID' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      await env.GUESTBOOK_KV.delete(id);

      return new Response(JSON.stringify({ success: true, message: '删除成功' }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: '删除失败: ' + err.message }), {
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
